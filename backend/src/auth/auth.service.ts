import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Prisma, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { addHours, addMilliseconds } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'crypto';
import {
  getJwtAccessExpiresIn,
  getJwtRefreshTtlMilliseconds,
  getJwtRefreshExpiresIn,
  getRequiredEnv,
} from '../config/env';

type StringValue = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'y'}`;
type AccessTokenPayload = {
  sub: number;
  email: string;
  role: UserRole;
  sid: string;
  jti: string;
  typ: 'access';
};
type RefreshTokenPayload = {
  sub: number;
  jti: string;
  familyId: string;
  typ: 'refresh';
};
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
const refreshTokenDigestSecret = getRequiredEnv('REFRESH_TOKEN_DIGEST_SECRET');
const jwtAccessExpiresIn = getJwtAccessExpiresIn();
const jwtRefreshExpiresIn = getJwtRefreshExpiresIn();
const PENDING_REGISTRATION_TTL_HOURS = 24;
const PENDING_REGISTRATION_COOLDOWN_MS = 60_000;
const DEFAULT_MAX_REFRESH_SESSIONS_PER_USER = 10;

class RefreshReuseDetectedError extends Error {}

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

function safeDigestEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');

  return (
    leftBuffer.length === rightBuffer.length &&
    leftBuffer.length > 0 &&
    timingSafeEqual(leftBuffer, rightBuffer)
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

  private getMaxRefreshSessionsPerUser(): number {
    const rawValue = process.env.MAX_REFRESH_SESSIONS_PER_USER?.trim();
    if (!rawValue) {
      return DEFAULT_MAX_REFRESH_SESSIONS_PER_USER;
    }

    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return DEFAULT_MAX_REFRESH_SESSIONS_PER_USER;
    }

    return parsed;
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
      const consumed = await tx.pendingRegistration.updateMany({
        where: {
          id: pending.id,
          tokenHash,
          consumedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          consumedAt: now,
        },
      });

      if (consumed.count !== 1) {
        return {
          status: 'error' as const,
          error: 'TOKEN_CONSUMED' as const,
        };
      }

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

  private digestRefreshToken(token: string): string {
    return createHmac('sha256', refreshTokenDigestSecret)
      .update(token)
      .digest('hex');
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

  private async pruneRefreshTokensToLimit(userId: number) {
    const maxSessions = this.getMaxRefreshSessionsPerUser();
    const now = new Date();
    const staleTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      skip: Math.max(0, maxSessions - 1),
      select: { id: true },
    });

    if (staleTokens.length === 0) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        id: {
          in: staleTokens.map((token) => token.id),
        },
      },
      data: {
        revokedAt: now,
      },
    });
  }

  private verifyRefreshToken(
    token: string,
    { allowExpired }: { allowExpired: boolean },
  ): RefreshTokenPayload | null {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: jwtRefreshSecret,
        ignoreExpiration: allowExpired,
      });

      if (
        payload.typ !== 'refresh' ||
        !Number.isInteger(Number(payload.sub)) ||
        !payload.jti ||
        !payload.familyId
      ) {
        return null;
      }

      return {
        ...payload,
        sub: Number(payload.sub),
      };
    } catch {
      return null;
    }
  }

  private buildAccessToken(
    userId: number,
    email: string,
    role: UserRole,
    familyId: string,
  ): string {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      role,
      sid: familyId,
      jti: randomUUID(),
      typ: 'access',
    };

    return this.jwtService.sign<AccessTokenPayload>(payload, {
      secret: jwtAccessSecret,
      expiresIn: jwtAccessExpiresIn as StringValue | number,
    });
  }

  private buildRefreshToken(
    userId: number,
    jti: string,
    familyId: string,
  ): string {
    const payload: RefreshTokenPayload = {
      sub: userId,
      jti,
      familyId,
      typ: 'refresh',
    };

    return this.jwtService.sign<RefreshTokenPayload>(payload, {
      secret: jwtRefreshSecret,
      expiresIn: jwtRefreshExpiresIn as StringValue | number,
    });
  }

  async login(
    userId: number,
    email: string,
    role: UserRole,
    options: LoginSessionOptions = {},
  ): Promise<AuthSessionTokens> {
    const familyId = randomUUID();
    const jti = randomUUID();
    const accessToken = this.buildAccessToken(userId, email, role, familyId);
    const refreshToken = this.buildRefreshToken(userId, jti, familyId);
    const tokenDigest = this.digestRefreshToken(refreshToken);
    const expiresAt = addMilliseconds(
      new Date(),
      getJwtRefreshTtlMilliseconds(),
    );

    await this.deleteExpiredRefreshTokens(userId);
    await this.pruneRefreshTokensToLimit(userId);

    await this.prisma.refreshToken.create({
      data: {
        jti,
        tokenDigest,
        familyId,
        userId,
        expiresAt,
        trustedContextHash: options.trustedContextHash ?? null,
        userAgentSummary: options.userAgentSummary ?? null,
      },
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken, {
      allowExpired: false,
    });
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenDigest = this.digestRefreshToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.userId !== payload.sub ||
      storedToken.familyId !== payload.familyId ||
      !safeDigestEqual(storedToken.tokenDigest, tokenDigest)
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt || storedToken.replacedByTokenId) {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId: storedToken.userId,
          familyId: storedToken.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const now = new Date();
    const nextJti = randomUUID();
    const nextRefreshToken = this.buildRefreshToken(
      storedToken.userId,
      nextJti,
      storedToken.familyId,
    );
    const nextTokenDigest = this.digestRefreshToken(nextRefreshToken);
    const nextExpiresAt = addMilliseconds(now, getJwtRefreshTtlMilliseconds());

    try {
      await this.prisma.$transaction(async (tx) => {
        const nextToken = await tx.refreshToken.create({
          data: {
            jti: nextJti,
            tokenDigest: nextTokenDigest,
            familyId: storedToken.familyId,
            userId: storedToken.userId,
            expiresAt: nextExpiresAt,
            trustedContextHash: storedToken.trustedContextHash,
            userAgentSummary: storedToken.userAgentSummary,
          },
          select: { id: true },
        });

        const rotated = await tx.refreshToken.updateMany({
          where: {
            id: storedToken.id,
            jti: payload.jti,
            familyId: payload.familyId,
            revokedAt: null,
            replacedByTokenId: null,
            expiresAt: { gt: now },
          },
          data: {
            revokedAt: now,
            replacedByTokenId: nextToken.id,
            lastUsedAt: now,
          },
        });

        if (rotated.count !== 1) {
          throw new RefreshReuseDetectedError();
        }
      });
    } catch (error) {
      if (error instanceof RefreshReuseDetectedError) {
        await this.prisma.refreshToken.updateMany({
          where: {
            userId: storedToken.userId,
            familyId: storedToken.familyId,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
        throw new UnauthorizedException('Refresh token reuse detected');
      }
      throw error;
    }

    return {
      accessToken: this.buildAccessToken(
        storedToken.user.id,
        storedToken.user.email,
        storedToken.user.role,
        storedToken.familyId,
      ),
      refreshToken: nextRefreshToken,
    };
  }

  async revokeRefreshToken(token: string) {
    const payload = this.verifyRefreshToken(token, {
      allowExpired: true,
    });
    if (!payload) {
      return false;
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
      select: {
        id: true,
        userId: true,
        familyId: true,
        tokenDigest: true,
        revokedAt: true,
      },
    });

    if (
      !storedToken ||
      storedToken.userId !== payload.sub ||
      storedToken.familyId !== payload.familyId ||
      !safeDigestEqual(storedToken.tokenDigest, this.digestRefreshToken(token))
    ) {
      return false;
    }

    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id: storedToken.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count === 1;
  }

  verifyAccessToken(token: string): VerifiedAccessTokenPayload {
    const payload = this.jwtService.verify<VerifiedAccessTokenPayload>(token, {
      secret: jwtAccessSecret,
    });

    if (payload.typ !== 'access' || !Number.isInteger(Number(payload.sub))) {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      ...payload,
      sub: Number(payload.sub),
    };
  }

  async logoutAll(userId: number, prisma: PrismaExecutor = this.prisma) {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
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
