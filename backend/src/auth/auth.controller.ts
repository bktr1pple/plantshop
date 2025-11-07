import { Body, Controller, HttpCode, Post, Req, Res, Get, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto.email, dto.password, dto.name);
    return { status: 'ok', user };
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) return { status: 'error', message: 'Invalid credentials' };

    const tokens = await this.authService.login(user.id, user.email);

    const secure = process.env.NODE_ENV === 'production';
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15,
      path: '/',
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

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
    // passport strategy додає req.user з payload
    // @ts-ignore
    const userId = req['user']?.sub;
    const user = await this.prisma.user.findUnique({ where: { id: Number(userId) }, select: { id: true, email: true, name: true } });
    return { user };
  }
}
