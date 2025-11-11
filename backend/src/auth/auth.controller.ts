import { Body, Controller, HttpCode, Post, Req, Res, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';

export async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY; // secret ключ для бекенду
  if (!secret) throw new Error("Не заданий RECAPTCHA_SECRET_KEY");

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  const data = await response.json();
  return data.success;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const captchaValid = await verifyCaptcha(dto.captchaToken);
    if (!captchaValid) {
      return { status: 'error', message: 'Ви не пройшли перевірку reCAPTCHA!' };
    }

    const user = await this.authService.register(dto.email, dto.password, dto.name);
    return { status: 'ok', user };
  }

@HttpCode(200)
@Post('login')
async login(
  @Body() body: LoginDto & { captchaToken: string },
  @Res({ passthrough: true }) res: Response
) {
  const { captchaToken, ...dto } = body;

  // Перевірка reCAPTCHA
  const captchaValid = await verifyCaptcha(captchaToken);
  if (!captchaValid)
    return { status: 'error', message: 'Ви не пройшли перевірку reCAPTCHA!' };

  // Перевірка користувача
  const user = await this.authService.validateUser(dto.email, dto.password);
  if (!user) return { status: 'error', message: 'Невірний email або пароль' };

  const tokens = await this.authService.login(user.id, user.email);

  // Debug: Verify tokens before setting cookies
  console.log('🔐 Tokens generated:', {
    accessToken: tokens.accessToken ? 'PRESENT' : 'MISSING',
    refreshToken: tokens.refreshToken ? 'PRESENT' : 'MISSING',
  });

  const secure = process.env.NODE_ENV === 'production';
  
  // Set access token cookie
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    path: '/',
  });
  
  // Set refresh token cookie
  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  });

  console.log('🔐 Cookies set successfully');
  return { status: 'ok' };
}

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = req.cookies['refresh_token'];
    if (!rt) return { status: 'error' };
    const newTokens = await this.authService.refresh(rt);
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('access_token', newTokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15,
      path: '/',
    });
    return { status: 'ok' };
  }

  @Post('verify-token')
  async verifyToken(@Req() req: Request) {
    const token = req.cookies['access_token'];
    console.log('🔐 Token to verify:', token);
    
    if (!token) {
      return { valid: false, reason: 'No token provided' };
    }

    try {
      const decoded = this.authService.verifyAccessToken(token);
      console.log('🔐 Token decoded successfully:', decoded);
      return { valid: true, payload: decoded };
    } catch (error) {
      console.error('🔐 Token verification failed:', error);
      return { valid: false, reason: error.message };
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = req.cookies['refresh_token'];
    if (rt) await this.authService.revokeRefreshToken(rt);
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    console.log('🔐 /auth/me - Request received');
    console.log('🔐 /auth/me - User from request:', req['user']);
    
    // passport strategy додає req.user з payload
    const userId = req['user']?.userId; // Changed from sub to userId
    console.log('🔐 /auth/me - User ID:', userId);
    
    if (!userId) {
      console.log('🔐 /auth/me - No user ID found');
      throw new UnauthorizedException('User not found in token');
    }

    const user = await this.prisma.user.findUnique({ 
      where: { id: Number(userId) }, 
      select: { id: true, email: true, name: true } 
    });
    
    console.log('🔐 /auth/me - User from database:', user);
    
    if (!user) {
      console.log('🔐 /auth/me - User not found in database');
      throw new UnauthorizedException('User not found');
    }

    return { user };
  }
}
