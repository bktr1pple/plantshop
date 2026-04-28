import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { addHours, addSeconds } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import {
  getJwtAccessExpiresIn,
  getJwtRefreshExpiresIn,
  getRequiredEnv,
} from '../config/env';

type StringValue = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'y'}`;
type AccessTokenPayload = { sub: number; email: string; role: UserRole };
type RefreshTokenPayload = { sub: number };
type PrismaExecutor = Prisma.TransactionClient | PrismaService;

export type VerifiedAccessTokenPayload = AccessTokenPayload;

export interface AuthSessionTokens {
  accessToken: string;
  refreshToken: string;
}

export type PendingRegistrationError =
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_CONSUMED';

export type RegisterResult =
  | {
      kind: 'pending_registration';
      email: string;
      name: string | null;
      rawToken?: string;
      waitSeconds?: number;
      reusedExisting: boolean;
    }
  | {
      kind: 'legacy_unverified_user';
      user: {
        id: number;
        email: string;
        name: string | null;
        role: UserRole;
        emailVerifiedAt: Date | null;
      };
    };

export type PendingRegistrationVerificationResult =
  | {
      status: 'verified';
      email: string;
      userId: number;
    }
  | {
      status: 'error';
      error: PendingRegistrationError;
    };

interface LoginSessionOptions {
  trustedContextHash?: string | null;
  userAgentSummary?: string | null;
}

const jwtAccessSecret = getRequiredEnv('JWT_ACCESS_SECRET');
const jwtRefreshSecret = getRequiredEnv('JWT_REFRESH_SECRET');
const jwtAccessExpiresIn = getJwtAccessExpiresIn();
const jwtRefreshExpiresIn = getJwtRefreshExpiresIn();
const PENDING_REGISTRATION_TTL_HOURS = 24;
const PENDING_REGISTRATION_COOLDOWN_MS = 60_000;

function hashOpaqueValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function buildOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}

function buildWaitSeconds(updatedAt: Date): number {
  const waitMs =
    PENDING_REGISTRATION_COOLDOWN_MS - (Date.now() - updatedAt.getTime());
  return Math.max(1, Math.ceil(waitMs / 1000));
}

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

  private getSaltRounds(): number {
    return Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.getSaltRounds());
  }

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<RegisterResult> {
    const normalizedName = name?.trim() || null;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
      },
    });

    if (existingUser?.emailVerifiedAt) {
      throw new ConflictException('Обліковий запис з таким email вже існує');
    }

    if (existingUser) {
      return {
        kind: 'legacy_unverified_user',
        user: existingUser,
      };
    }

    const hashedPassword = await this.hashPassword(password);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const existingPending = await tx.pendingRegistration.findUnique({
        where: { email },
      });
      const expiresAt = addHours(now, PENDING_REGISTRATION_TTL_HOURS);

      if (
        existingPending &&
        existingPending.consumedAt === null &&
        existingPending.expiresAt > now &&
        now.getTime() - existingPending.updatedAt.getTime() <
          PENDING_REGISTRATION_COOLDOWN_MS
      ) {
        return {
          kind: 'pending_registration' as const,
          email,
          name: existingPending.name,
          waitSeconds: buildWaitSeconds(existingPending.updatedAt),
          reusedExisting: true,
        };
      }

      const rawToken = buildOpaqueToken();
      const tokenHash = hashOpaqueValue(rawToken);

      if (existingPending) {
        await tx.pendingRegistration.update({
          where: { id: existingPending.id },
          data: {
            passwordHash: hashedPassword,
            name: normalizedName,
            tokenHash,
            expiresAt,
            consumedAt: null,
          },
        });

        return {
          kind: 'pending_registration' as const,
          email,
          name: normalizedName,
          rawToken,
          reusedExisting: true,
        };
      }

      await tx.pendingRegistration.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name: normalizedName,
          tokenHash,
          expiresAt,
        },
      });

      return {
        kind: 'pending_registration' as const,
        email,
        name: normalizedName,
        rawToken,
        reusedExisting: false,
      };
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  async validatePendingRegistration(email: string, password: string) {
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        expiresAt: true,
        consumedAt: true,
      },
    });

    if (!pending || pending.consumedAt || pending.expiresAt <= new Date()) {
      return null;
    }

    const valid = await bcrypt.compare(password, pending.passwordHash);
    if (!valid) {
      return null;
    }

    return {
      id: pending.id,
      email: pending.email,
      name: pending.name,
    };
  }

  async resendPendingRegistration(email: string): Promise<{
    status: 'queued' | 'cooldown' | 'noop';
    rawToken?: string;
    waitSeconds?: number;
  }> {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const pending = await tx.pendingRegistration.findUnique({
        where: { email },
      });

      if (!pending || pending.consumedAt) {
        return { status: 'noop' as const };
      }

      if (
        pending.expiresAt > now &&
        now.getTime() - pending.updatedAt.getTime() <
          PENDING_REGISTRATION_COOLDOWN_MS
      ) {
        return {
          status: 'cooldown' as const,
          waitSeconds: buildWaitSeconds(pending.updatedAt),
        };
      }

      const rawToken = buildOpaqueToken();
      const tokenHash = hashOpaqueValue(rawToken);

      await tx.pendingRegistration.update({
        where: { id: pending.id },
        data: {
          tokenHash,
          expiresAt: addHours(now, PENDING_REGISTRATION_TTL_HOURS),
          consumedAt: null,
        },
      });

      return {
        status: 'queued' as const,
        rawToken,
      };
    });
  }

  async consumePendingRegistrationToken(
    rawToken: string,
  ): Promise<PendingRegistrationVerificationResult> {
    const tokenHash = hashOpaqueValue(rawToken);
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { tokenHash },
    });

    if (!pending) {
      return { status: 'error', error: 'TOKEN_INVALID' };
    }

    if (pending.consumedAt) {
      return { status: 'error', error: 'TOKEN_CONSUMED' };
    }

    if (pending.expiresAt <= new Date()) {
      return { status: 'error', error: 'TOKEN_EXPIRED' };
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: pending.email },
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
        },
      });

      let userId: number;

      if (existingUser) {
        userId = existingUser.id;

        if (!existingUser.emailVerifiedAt) {
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerifiedAt: now,
              password: pending.passwordHash,
              name: pending.name,
            },
          });
        }
      } else {
        const createdUser = await tx.user.create({
          data: {
            email: pending.email,
            password: pending.passwordHash,
            name: pending.name,
            role: 'USER',
            emailVerifiedAt: now,
          },
          select: {
            id: true,
          },
        });

        userId = createdUser.id;
      }

      await tx.pendingRegistration.update({
        where: { id: pending.id },
        data: {
          consumedAt: now,
        },
      });

      return {
        status: 'verified' as const,
        email: pending.email,
        userId,
      };
    });
  }

  async verifyCurrentPassword(userId: number, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return bcrypt.compare(password, user.password);
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

  async login(
    userId: number,
    email: string,
    role: UserRole,
    options: LoginSessionOptions = {},
  ): Promise<AuthSessionTokens> {
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
      data: {
        tokenHash,
        userId,
        expiresAt,
        trustedContextHash: options.trustedContextHash ?? null,
        userAgentSummary: options.userAgentSummary ?? null,
      },
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
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

    for (const storedToken of tokens) {
      const match = await bcrypt.compare(refreshToken, storedToken.tokenHash);
      if (!match) {
        continue;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const nextTokens = await this.login(userId, user.email, user.role, {
        trustedContextHash: storedToken.trustedContextHash ?? null,
        userAgentSummary: storedToken.userAgentSummary ?? null,
      });

      await this.prisma.refreshToken.deleteMany({
        where: { id: storedToken.id },
      });

      return nextTokens;
    }

    throw new UnauthorizedException('Invalid refresh token');
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

    for (const storedToken of storedTokens) {
      if (await bcrypt.compare(token, storedToken.tokenHash)) {
        await this.prisma.refreshToken.deleteMany({
          where: { id: storedToken.id },
        });
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

  async logoutAll(userId: number, prisma: PrismaExecutor = this.prisma) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async updatePassword(
    userId: number,
    newPassword: string,
    prisma: PrismaExecutor = this.prisma,
  ) {
    const passwordHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }
}
