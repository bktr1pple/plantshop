import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { addSeconds } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import {
  getJwtAccessExpiresIn,
  getJwtRefreshExpiresIn,
  getRequiredEnv,
} from '../config/env';

type StringValue = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'y'}`;
type AccessTokenPayload = { sub: number; email: string };
type RefreshTokenPayload = { sub: number };

export type VerifiedAccessTokenPayload = AccessTokenPayload;

const jwtAccessSecret = getRequiredEnv('JWT_ACCESS_SECRET');
const jwtRefreshSecret = getRequiredEnv('JWT_REFRESH_SECRET');
const jwtAccessExpiresIn = getJwtAccessExpiresIn();
const jwtRefreshExpiresIn = getJwtRefreshExpiresIn();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists)
      throw new BadRequestException('Обліковий запис з таким email вже існує');

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashed = await bcrypt.hash(password, saltRounds);

    return this.prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  private _parseDurationSeconds(duration: string) {
    if (!duration) return 0;
    const num = Number(duration.slice(0, -1));
    if (duration.endsWith('s')) return num;
    if (duration.endsWith('m')) return num * 60;
    if (duration.endsWith('h')) return num * 3600;
    if (duration.endsWith('d')) return num * 86400;
    return Number(duration);
  }

  async login(userId: number, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign<AccessTokenPayload>(payload, {
      secret: jwtAccessSecret,
      expiresIn: jwtAccessExpiresIn as StringValue | number,
    });

    const refreshPayload = { sub: userId };
    const refreshToken = this.jwtService.sign<RefreshTokenPayload>(
      refreshPayload,
      {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn as StringValue | number,
      },
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const seconds = this._parseDurationSeconds(jwtRefreshExpiresIn);
    const expiresAt = addSeconds(new Date(), seconds);

    await this.prisma.refreshToken.create({
      data: { tokenHash, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  // auth.service.ts
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        {
          secret: jwtRefreshSecret,
        },
      );

      const userId = payload.sub;
      const tokens = await this.prisma.refreshToken.findMany({
        where: { userId },
      });

      for (const t of tokens) {
        const match = await bcrypt.compare(refreshToken, t.tokenHash);
        if (match) {
          if (new Date(t.expiresAt) < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
          }

          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
          });

          if (!user) {
            throw new UnauthorizedException('User not found');
          }

          const { accessToken, refreshToken: newRefreshToken } =
            await this.login(userId, user.email);

          return { accessToken, refreshToken: newRefreshToken };
        }
      }

      throw new UnauthorizedException('Invalid refresh token');
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string) {
    const all = await this.prisma.refreshToken.findMany();
    for (const t of all) {
      if (await bcrypt.compare(token, t.tokenHash)) {
        await this.prisma.refreshToken.delete({ where: { id: t.id } });
        return true;
      }
    }
    return false;
  }

  verifyAccessToken(token: string): VerifiedAccessTokenPayload {
    return this.jwtService.verify<VerifiedAccessTokenPayload>(token, {
      secret: jwtAccessSecret,
    });
  }

  async logoutAll(userId: number) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
