import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  Get,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';

type CaptchaToken = string;
type RequestCookies = Partial<Record<'access_token' | 'refresh_token', string>>;
type VerifiedAuthPayload = {
  sub?: number;
  userId?: number;
  email?: string;
};

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RecaptchaVerifyResponse {
  success?: boolean;
}

function isLocalhostHost(value?: string): boolean {
  return value === 'localhost' || value === '127.0.0.1';
}

function isTokenExpiredError(error: unknown): error is { name: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'TokenExpiredError'
  );
}

async function verifyCaptcha(token: CaptchaToken): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error('RECAPTCHA_SECRET_KEY is not set');
    throw new InternalServerErrorException('Captcha is not configured');
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      console.error(
        'reCAPTCHA verification failed with status:',
        response.status,
      );
      return false;
    }

    const data = (await response.json()) as RecaptchaVerifyResponse;
    return data.success === true;
  } catch (err) {
    console.error('Error while verifying reCAPTCHA:', err);
    return false;
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  private getCookieDomainValue(): string | undefined {
    const domain = process.env.DOMAIN_COOKIE?.trim();
    return domain || undefined;
  }

  private getCookieDomain(): string | undefined {
    const domain = this.getCookieDomainValue();
    if (!domain) {
      console.warn(
        '⚠️ DOMAIN_COOKIE is not set. Cookies will be set without domain.',
      );
      return undefined;
    }

    if (isLocalhostHost(domain)) {
      return undefined;
    }

    return domain.startsWith('.') ? domain : '.' + domain;
  }

  private getCommonCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    domain?: string;
    path: string;
  } {
    const cookieDomainValue = this.getCookieDomainValue();
    const secure =
      process.env.NODE_ENV === 'production' &&
      !isLocalhostHost(cookieDomainValue);
    const domain = this.getCookieDomain();

    return {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      domain,
      path: '/',
    };
  }

  private setAuthCookies(res: Response, tokens: AuthTokens) {
    const opts = this.getCommonCookieOptions();

    res.cookie('access_token', tokens.accessToken, {
      ...opts,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...opts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    const domain = this.getCookieDomain();
    const opts = { path: '/', domain };

    res.clearCookie('access_token', opts);
    res.clearCookie('refresh_token', opts);
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const captchaValid = await verifyCaptcha(dto.captchaToken);
    if (!captchaValid) {
      return {
        status: 'error',
        message: 'Ви не пройшли перевірку reCAPTCHA!',
      };
    }

    const user = await this.authService.register(
      dto.email,
      dto.password,
      dto.name,
    );

    const tokens = await this.authService.login(user.id, user.email);
    this.setAuthCookies(res, tokens);

    return { status: 'ok', user };
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() body: LoginDto & { captchaToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { captchaToken, ...dto } = body;

    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) {
      return {
        status: 'error',
        message: 'Ви не пройшли перевірку reCAPTCHA!',
      };
    }

    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      return { status: 'error', message: 'Невірний email або пароль' };
    }

    const tokens = await this.authService.login(user.id, user.email);

    console.log('🔐 Tokens generated:', {
      accessToken: tokens.accessToken ? 'PRESENT' : 'MISSING',
      refreshToken: tokens.refreshToken ? 'PRESENT' : 'MISSING',
    });

    this.setAuthCookies(res, tokens);

    console.log('🔐 Cookies set successfully');
    return { status: 'ok' };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = (req.cookies ?? {}) as RequestCookies;
    const rt = cookies.refresh_token;
    if (rt) {
      await this.authService.revokeRefreshToken(rt);
    }

    this.clearAuthCookies(res);

    return { status: 'ok' };
  }

  @Get('me')
  async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = (req.cookies ?? {}) as RequestCookies;
    const accessToken = cookies.access_token;
    const refreshToken = cookies.refresh_token;

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('Not authenticated');
    }

    let payload: VerifiedAuthPayload | null = null;

    if (accessToken) {
      try {
        payload = this.authService.verifyAccessToken(accessToken);
      } catch (err: unknown) {
        if (isTokenExpiredError(err) && refreshToken) {
          try {
            const newTokens = await this.authService.refresh(refreshToken);

            this.setAuthCookies(res, newTokens);

            payload = this.authService.verifyAccessToken(newTokens.accessToken);
          } catch {
            this.clearAuthCookies(res);
            throw new UnauthorizedException('Invalid refresh token');
          }
        } else {
          this.clearAuthCookies(res);
          throw new UnauthorizedException('Invalid access token');
        }
      }
    } else if (refreshToken) {
      try {
        const newTokens = await this.authService.refresh(refreshToken);
        this.setAuthCookies(res, newTokens);
        payload = this.authService.verifyAccessToken(newTokens.accessToken);
      } catch {
        this.clearAuthCookies(res);
        throw new UnauthorizedException('Invalid refresh token');
      }
    }

    if (!payload?.sub && !payload?.userId) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('User not found in token');
    }

    const userId = Number(payload.sub ?? payload.userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('User not found');
    }

    return { user };
  }
}
