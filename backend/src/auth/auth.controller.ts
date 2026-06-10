import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  GoneException,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { Prisma, UserRole } from '../generated/prisma/client';
import { AuthService } from './auth.service';
import type { VerifiedAccessTokenPayload } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  getJwtAccessTtlMilliseconds,
  getJwtRefreshTtlMilliseconds,
  getRequiredEnv,
} from '../config/env';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyLoginChallengeDto } from './dto/verify-login-challenge.dto';
import {
  EmailSecurityService,
  type TokenStateError,
} from './email-security.service';
import {
  LoginChallengeService,
  type ChallengeError,
} from './login-challenge.service';

type CaptchaToken = string;
type RequestCookies = Partial<
  Record<'access_token' | 'refresh_token' | 'trusted_login', string>
>;
type VerifiedAuthPayload = Partial<VerifiedAccessTokenPayload> & {
  userId?: number;
};

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RecaptchaVerifyResponse {
  success?: boolean;
}

const TRUSTED_LOGIN_MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000;
const AUTH_ENDPOINT_THROTTLE = { default: { ttl: 60_000, limit: 10 } } as const;
const AUTH_CHALLENGE_THROTTLE = {
  default: { ttl: 60_000, limit: 5 },
} as const;
const AUTH_SESSION_THROTTLE = {
  default: { ttl: 60_000, limit: 30 },
} as const;
const AUTH_PASSWORD_THROTTLE = {
  default: { ttl: 60_000, limit: 5 },
} as const;
const recaptchaSecret = getRequiredEnv('RECAPTCHA_SECRET_KEY');
const currentUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  bio: true,
  emailNotifications: true,
  orderUpdates: true,
  careReminders: true,
  promotional: true,
  profileVisibility: true,
  dataSharing: true,
  personalizedAds: true,
  role: true,
} satisfies Prisma.UserSelect;

type CurrentUserPayload = Prisma.UserGetPayload<{
  select: typeof currentUserSelect;
}>;

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

function createSecurityError(
  status: number,
  error: string,
  message: string,
): never {
  if (status === 410) {
    throw new GoneException({ error, message });
  }

  if (status === 409) {
    throw new ConflictException({ error, message });
  }

  if (status === 429) {
    throw new HttpException({ error, message }, 429);
  }

  throw new BadRequestException({ error, message });
}

function throwTokenStateError(error: TokenStateError): never {
  if (error === 'TOKEN_EXPIRED') {
    createSecurityError(410, error, 'Термін дії токена минув.');
  }

  if (error === 'TOKEN_CONSUMED') {
    createSecurityError(409, error, 'Цей токен уже використано.');
  }

  createSecurityError(400, error, 'Токен недійсний або не знайдений.');
}

function throwChallengeError(error: ChallengeError): never {
  if (error === 'TOKEN_EXPIRED') {
    createSecurityError(410, error, 'Термін дії challenge минув.');
  }

  if (error === 'TOKEN_CONSUMED') {
    createSecurityError(409, error, 'Challenge уже використано.');
  }

  if (error === 'TOO_MANY_ATTEMPTS') {
    createSecurityError(
      429,
      error,
      'Вичерпано ліміт спроб. Запросіть новий код входу.',
    );
  }

  if (error === 'CODE_INVALID') {
    createSecurityError(400, error, 'Невірний код підтвердження входу.');
  }

  createSecurityError(400, error, 'Challenge не знайдено або він недійсний.');
}

async function verifyCaptcha(token: CaptchaToken): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('secret', recaptchaSecret);
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

function normalizeOptionalString(value?: string): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildCurrentUserUpdateData(dto: UpdateMeDto): Prisma.UserUpdateInput {
  const data: Prisma.UserUpdateInput = {};

  const normalizedName = normalizeOptionalString(dto.name);
  if (normalizedName !== undefined) {
    data.name = normalizedName;
  }

  const normalizedPhone = normalizeOptionalString(dto.phone);
  if (normalizedPhone !== undefined) {
    data.phone = normalizedPhone;
  }

  const normalizedAddress = normalizeOptionalString(dto.address);
  if (normalizedAddress !== undefined) {
    data.address = normalizedAddress;
  }

  const normalizedBio = normalizeOptionalString(dto.bio);
  if (normalizedBio !== undefined) {
    data.bio = normalizedBio;
  }

  if (dto.emailNotifications !== undefined) {
    data.emailNotifications = dto.emailNotifications;
  }

  if (dto.orderUpdates !== undefined) {
    data.orderUpdates = dto.orderUpdates;
  }

  if (dto.careReminders !== undefined) {
    data.careReminders = dto.careReminders;
  }

  if (dto.promotional !== undefined) {
    data.promotional = dto.promotional;
  }

  if (dto.profileVisibility !== undefined) {
    data.profileVisibility = dto.profileVisibility;
  }

  if (dto.dataSharing !== undefined) {
    data.dataSharing = dto.dataSharing;
  }

  if (dto.personalizedAds !== undefined) {
    data.personalizedAds = dto.personalizedAds;
  }

  return data;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly emailSecurityService: EmailSecurityService,
    private readonly loginChallengeService: LoginChallengeService,
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
      maxAge: getJwtAccessTtlMilliseconds(),
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...opts,
      maxAge: getJwtRefreshTtlMilliseconds(),
    });
  }

  private setTrustedLoginCookie(res: Response, token: string) {
    const opts = this.getCommonCookieOptions();

    res.cookie('trusted_login', token, {
      ...opts,
      maxAge: TRUSTED_LOGIN_MAX_AGE_MS,
    });
  }

  private clearSessionCookies(res: Response) {
    const domain = this.getCookieDomain();
    const opts = { path: '/', domain };

    res.clearCookie('access_token', opts);
    res.clearCookie('refresh_token', opts);
  }

  private clearTrustedLoginCookie(res: Response) {
    const domain = this.getCookieDomain();
    const opts = { path: '/', domain };

    res.clearCookie('trusted_login', opts);
  }

  private clearAllAuthCookies(res: Response) {
    this.clearSessionCookies(res);
    this.clearTrustedLoginCookie(res);
  }

  private async establishTrustedSession(params: {
    res: Response;
    userId: number;
    email: string;
    role: UserRole;
    userAgentSummary: string | null;
    trustedLoginToken?: string;
  }) {
    const trustedLoginToken =
      params.trustedLoginToken ??
      this.loginChallengeService.generateTrustedLoginToken();
    const trustedContextHash =
      this.loginChallengeService.hashTrustedLoginToken(trustedLoginToken);
    const tokens = await this.authService.login(
      params.userId,
      params.email,
      params.role,
      {
        trustedContextHash,
        userAgentSummary: params.userAgentSummary,
      },
    );

    await this.loginChallengeService.rememberTrustedContext({
      userId: params.userId,
      trustedLoginToken,
      userAgentSummary: params.userAgentSummary,
    });

    this.setAuthCookies(params.res, tokens);
    this.setTrustedLoginCookie(params.res, trustedLoginToken);
  }

  private async resolveCurrentUser(
    req: Request,
    res: Response,
  ): Promise<CurrentUserPayload> {
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
          } catch (error) {
            if (error instanceof UnauthorizedException) {
              this.clearSessionCookies(res);
              throw new UnauthorizedException('Invalid refresh token');
            }

            throw new ServiceUnavailableException(
              'Auth service temporarily unavailable',
            );
          }
        } else {
          this.clearSessionCookies(res);
          throw new UnauthorizedException('Invalid access token');
        }
      }
    } else if (refreshToken) {
      try {
        const newTokens = await this.authService.refresh(refreshToken);
        this.setAuthCookies(res, newTokens);
        payload = this.authService.verifyAccessToken(newTokens.accessToken);
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          this.clearSessionCookies(res);
          throw new UnauthorizedException('Invalid refresh token');
        }

        throw new ServiceUnavailableException(
          'Auth service temporarily unavailable',
        );
      }
    }

    if (!payload?.sub && !payload?.userId) {
      this.clearSessionCookies(res);
      throw new UnauthorizedException('User not found in token');
    }

    const userId = Number(payload.sub ?? payload.userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: currentUserSelect,
    });

    if (!user) {
      this.clearSessionCookies(res);
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private ensureMatchingPasswords(password: string, confirmation: string) {
    if (password !== confirmation) {
      throw new BadRequestException({
        error: 'PASSWORD_MISMATCH',
        message: 'Пароль і підтвердження не співпадають.',
      });
    }
  }

  private getUserAgent(req: Request): string | undefined {
    const value = req.get('user-agent');
    return value || undefined;
  }

  private getClientIp(req: Request): string | string[] | undefined {
    return req.ip;
  }

  @Throttle(AUTH_ENDPOINT_THROTTLE)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const captchaValid = await verifyCaptcha(dto.captchaToken);
    if (!captchaValid) {
      return {
        status: 'error',
        message: 'Ви не пройшли перевірку reCAPTCHA!',
      };
    }

    const registration = await this.authService.register(
      dto.email,
      dto.password,
      dto.name,
    );

    if (registration.kind === 'legacy_unverified_user') {
      const sendResult = await this.emailSecurityService.sendEmailVerification(
        {
          id: registration.user.id,
          email: registration.user.email,
          role: registration.user.role,
          emailVerifiedAt: registration.user.emailVerifiedAt,
        },
        { resent: true },
      );

      return {
        status: 'verification_required',
        email: registration.user.email,
        resent: true,
        waitSeconds:
          sendResult.status === 'cooldown' ? sendResult.waitSeconds : undefined,
        message:
          'Для цього email уже є незавершена реєстрація. Ми надіслали або щойно повторили лист підтвердження.',
      };
    }

    if (registration.rawToken) {
      await this.emailSecurityService.sendPendingRegistrationEmail({
        email: registration.email,
        rawToken: registration.rawToken,
        resent: registration.reusedExisting,
      });
    }

    return {
      status: 'verification_required',
      email: registration.email,
      resent: registration.reusedExisting,
      waitSeconds: registration.waitSeconds,
      message: registration.reusedExisting
        ? 'Для цього email уже є незавершена реєстрація. Ми надіслали або щойно повторили лист підтвердження.'
        : 'Ми надіслали лист для підтвердження email. Після підтвердження акаунт буде створено остаточно.',
    };
  }

  @Throttle(AUTH_ENDPOINT_THROTTLE)
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const captchaValid = await verifyCaptcha(dto.captchaToken);
    if (!captchaValid) {
      return {
        status: 'error',
        message: 'Ви не пройшли перевірку reCAPTCHA!',
      };
    }

    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      const pendingRegistration =
        await this.authService.validatePendingRegistration(
          dto.email,
          dto.password,
        );

      if (pendingRegistration) {
        const resendResult = await this.authService.resendPendingRegistration(
          dto.email,
        );

        if (resendResult.status === 'queued' && resendResult.rawToken) {
          await this.emailSecurityService.sendPendingRegistrationEmail({
            email: dto.email,
            rawToken: resendResult.rawToken,
            resent: true,
          });
        }

        this.clearSessionCookies(res);

        return {
          status: 'verification_required',
          email: dto.email,
          waitSeconds:
            resendResult.status === 'cooldown'
              ? resendResult.waitSeconds
              : undefined,
          message:
            'Перш ніж увійти, підтвердіть email і завершіть створення акаунта.',
        };
      }

      return { status: 'error', message: 'Невірний email або пароль' };
    }

    if (!user.emailVerifiedAt) {
      const sendResult = await this.emailSecurityService.sendEmailVerification(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerifiedAt: user.emailVerifiedAt,
        },
        { resent: true },
      );

      this.clearSessionCookies(res);

      return {
        status: 'verification_required',
        email: user.email,
        waitSeconds:
          sendResult.status === 'cooldown' ? sendResult.waitSeconds : undefined,
        message:
          'Перш ніж увійти, підтвердіть email. Ми надіслали або щойно повторили лист підтвердження.',
      };
    }

    const cookies = (req.cookies ?? {}) as RequestCookies;
    const context = await this.loginChallengeService.isRecognizedContext({
      userId: user.id,
      trustedLoginToken: cookies.trusted_login,
      userAgent: this.getUserAgent(req),
    });

    if (!context.recognized) {
      const challenge = await this.loginChallengeService.createChallenge({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        userAgent: this.getUserAgent(req),
        ip: this.getClientIp(req),
      });

      this.clearSessionCookies(res);
      if (cookies.trusted_login) {
        this.clearTrustedLoginCookie(res);
      }

      return {
        status: 'challenge_required',
        email: user.email,
        challengeId: challenge.challengeId,
        waitSeconds: challenge.waitSeconds,
        message: challenge.reusedActiveChallenge
          ? 'Ми вже надіслали код підтвердження для цього входу. Використайте наявний код або зачекайте трохи перед повторною відправкою.'
          : 'Ми надіслали код підтвердження на ваш email, бо це новий або невпізнаний контекст входу.',
      };
    }

    await this.establishTrustedSession({
      res,
      userId: user.id,
      email: user.email,
      role: user.role,
      userAgentSummary: context.userAgentSummary,
      trustedLoginToken: cookies.trusted_login?.trim() || undefined,
    });

    return { status: 'ok' };
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const pendingResult =
      await this.authService.consumePendingRegistrationToken(dto.token);

    if (pendingResult.status === 'verified') {
      return {
        status: 'ok',
        email: pendingResult.email,
        message:
          'Email успішно підтверджено. Акаунт створено, тепер ви можете увійти.',
      };
    }

    if (pendingResult.error !== 'TOKEN_INVALID') {
      throwTokenStateError(pendingResult.error);
    }

    const result = await this.emailSecurityService.verifyEmailToken(dto.token);

    if (result.status === 'error') {
      throwTokenStateError(result.error as TokenStateError);
    }

    return {
      status: 'ok',
      email: result.email,
      message: 'Email успішно підтверджено. Тепер ви можете увійти.',
    };
  }

  @Throttle(AUTH_ENDPOINT_THROTTLE)
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() dto: ResendVerificationEmailDto) {
    const pendingResult = await this.authService.resendPendingRegistration(
      dto.email,
    );

    let result: { status: 'ok' | 'cooldown'; waitSeconds?: number };

    if (pendingResult.status === 'queued' && pendingResult.rawToken) {
      await this.emailSecurityService.sendPendingRegistrationEmail({
        email: dto.email,
        rawToken: pendingResult.rawToken,
        resent: true,
      });
      result = { status: 'ok' };
    } else if (pendingResult.status === 'cooldown') {
      result = {
        status: 'cooldown',
        waitSeconds: pendingResult.waitSeconds,
      };
    } else {
      result = await this.emailSecurityService.resendVerificationForEmail(
        dto.email,
      );
    }

    return {
      status: 'ok',
      waitSeconds:
        result.status === 'cooldown' ? result.waitSeconds : undefined,
      message:
        'Якщо акаунт з цим email існує і ще не підтверджений, ми надіслали лист або він уже був відправлений нещодавно.',
    };
  }

  @Throttle(AUTH_ENDPOINT_THROTTLE)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.emailSecurityService.createPasswordReset(
      dto.email,
    );

    return {
      status: 'ok',
      waitSeconds:
        result.status === 'cooldown' ? result.waitSeconds : undefined,
      message:
        'Якщо акаунт з таким email існує, інструкції для скидання пароля вже надіслані або були відправлені нещодавно.',
    };
  }

  @Throttle(AUTH_ENDPOINT_THROTTLE)
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.ensureMatchingPasswords(dto.newPassword, dto.confirmPassword);

    const result = await this.emailSecurityService.consumePasswordResetToken(
      dto.token,
      async (tx, userId) => {
        await this.authService.updatePassword(userId, dto.newPassword, tx);
        await this.authService.logoutAll(userId, tx);
        await this.loginChallengeService.revokeTrustedContexts(userId, tx);
      },
    );

    if (result.status === 'error') {
      throwTokenStateError(result.error as TokenStateError);
    }

    this.clearAllAuthCookies(res);

    return {
      status: 'ok',
      message:
        'Пароль оновлено. Для безпеки всі попередні сесії завершено. Увійдіть знову.',
    };
  }

  @Throttle(AUTH_PASSWORD_THROTTLE)
  @Post('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.ensureMatchingPasswords(dto.newPassword, dto.confirmPassword);

    const currentUser = await this.resolveCurrentUser(req, res);
    const validCurrentPassword = await this.authService.verifyCurrentPassword(
      currentUser.id,
      dto.currentPassword,
    );

    if (!validCurrentPassword) {
      throw new BadRequestException({
        error: 'CURRENT_PASSWORD_INVALID',
        message: 'Поточний пароль введено невірно.',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await this.authService.updatePassword(
        currentUser.id,
        dto.newPassword,
        tx,
      );
      await this.authService.logoutAll(currentUser.id, tx);
      await this.loginChallengeService.revokeTrustedContexts(
        currentUser.id,
        tx,
      );
    });

    this.clearAllAuthCookies(res);

    return {
      status: 'ok',
      message:
        'Пароль успішно змінено. Для безпеки ми завершили всі попередні сесії. Увійдіть знову.',
    };
  }

  @Throttle(AUTH_CHALLENGE_THROTTLE)
  @Post('login-challenge/verify')
  async verifyLoginChallenge(
    @Body() dto: VerifyLoginChallengeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginChallengeService.verifyChallenge(
      dto.challengeId,
      dto.code,
      {
        userAgent: this.getUserAgent(req),
        ip: this.getClientIp(req),
      },
    );

    if (result.status === 'error') {
      throwChallengeError(result.error as ChallengeError);
    }

    const verifiedUser = result.user;
    await this.establishTrustedSession({
      res,
      userId: verifiedUser!.id,
      email: verifiedUser!.email,
      role: verifiedUser!.role,
      userAgentSummary:
        result.userAgentSummary ??
        this.loginChallengeService.summarizeUserAgent(this.getUserAgent(req)),
    });

    return { status: 'ok' };
  }

  @Throttle(AUTH_SESSION_THROTTLE)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = (req.cookies ?? {}) as RequestCookies;
    const rt = cookies.refresh_token;
    if (rt) {
      await this.authService.revokeRefreshToken(rt);
    }

    this.clearSessionCookies(res);

    return { status: 'ok' };
  }

  @Throttle(AUTH_SESSION_THROTTLE)
  @Get('me')
  async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = await this.resolveCurrentUser(req, res);
    return { user };
  }

  @Throttle(AUTH_SESSION_THROTTLE)
  @Patch('me')
  async updateMe(
    @Body() dto: UpdateMeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const currentUser = await this.resolveCurrentUser(req, res);
    const data = buildCurrentUserUpdateData(dto);

    if (Object.keys(data).length === 0) {
      return { user: currentUser };
    }

    const user = await this.prisma.user.update({
      where: { id: currentUser.id },
      data,
      select: currentUserSelect,
    });

    return { user };
  }
}
