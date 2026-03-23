import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import type { UserRole } from '@prisma/client';
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
type AccessTokenPayload = { sub: number; email: string; role: UserRole };
type RefreshTokenPayload = { sub: number };

export type VerifiedAccessTokenPayload = AccessTokenPayload;

const jwtAccessSecret = getRequiredEnv('JWT_ACCESS_SECRET');
const jwtRefreshSecret = getRequiredEnv('JWT_REFRESH_SECRET');
const jwtAccessExpiresIn = getJwtAccessExpiresIn();
const jwtRefreshExpiresIn = getJwtRefreshExpiresIn();

function isTokenExpiredError(error: unknown): error is { name: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'TokenExpiredError'
  );
}

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
      data: { email, password: hashed, name, role: 'USER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
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

  private async deleteExpiredRefreshTokens(userId: number) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private extractRefreshTokenUserId(
    token: string,
    { allowExpired }: { allowExpired: boolean },
  ): number | null {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: jwtRefreshSecret,
      });

      return Number(payload.sub);
    } catch (error) {
      if (!allowExpired || !isTokenExpiredError(error)) {
        return null;
      }

      const decoded = this.jwtService.decode<unknown>(token);

      if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
        return null;
      }

      const sub = (decoded as { sub?: unknown }).sub;
      const parsed =
        typeof sub === 'number'
          ? sub
          : typeof sub === 'string'
            ? Number(sub)
            : NaN;

      return Number.isFinite(parsed) ? parsed : null;
    }
  }

  async login(userId: number, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

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

    await this.deleteExpiredRefreshTokens(userId);

    await this.prisma.refreshToken.create({
      data: { tokenHash, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  // auth.service.ts
  async refresh(refreshToken: string) {
    try {
      const userId = this.extractRefreshTokenUserId(refreshToken, {
        allowExpired: false,
      });
      if (userId === null) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      await this.deleteExpiredRefreshTokens(userId);
      const tokens = await this.prisma.refreshToken.findMany({
        where: { userId },
      });

      for (const t of tokens) {
        const match = await bcrypt.compare(refreshToken, t.tokenHash);
        if (match) {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, role: true },
          });

          if (!user) {
            throw new UnauthorizedException('User not found');
          }

          const { accessToken, refreshToken: newRefreshToken } =
            await this.login(userId, user.email, user.role);

          await this.prisma.refreshToken
            .deleteMany({
              where: { id: t.id },
            })
            .catch(() => undefined);

          return { accessToken, refreshToken: newRefreshToken };
        }
      }

      throw new UnauthorizedException('Invalid refresh token');
    } catch {
      await this.revokeRefreshToken(refreshToken).catch(() => false);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string) {
    const userId = this.extractRefreshTokenUserId(token, {
      allowExpired: true,
    });
    if (userId === null) {
      return false;
    }

    await this.deleteExpiredRefreshTokens(userId);
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    for (const t of storedTokens) {
      if (await bcrypt.compare(token, t.tokenHash)) {
        await this.prisma.refreshToken.deleteMany({ where: { id: t.id } });
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
