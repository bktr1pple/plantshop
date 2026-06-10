import { Injectable } from '@nestjs/common';
import type { Prisma, UserRole } from '../generated/prisma/client';
import { addMinutes } from 'date-fns';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { buildLoginChallengeTemplate } from '../mail/mail.templates';

const LOGIN_CHALLENGE_TTL_MINUTES = 10;
const LOGIN_CHALLENGE_COOLDOWN_MS = 60_000;
const LOGIN_CHALLENGE_MAX_ATTEMPTS = 5;
const TRUSTED_LOGIN_TTL_DAYS = 60;

export type ChallengeError =
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_CONSUMED'
  | 'CODE_INVALID'
  | 'TOO_MANY_ATTEMPTS';

export interface ChallengeUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface ChallengeResult {
  status: 'challenge_required';
  challengeId: number;
  waitSeconds?: number;
  reusedActiveChallenge: boolean;
}

export interface VerifiedChallengeResult {
  status: 'verified' | 'error';
  error?: ChallengeError;
  user?: ChallengeUser;
  userAgentSummary?: string | null;
}

type PrismaExecutor = Prisma.TransactionClient | PrismaService;

function hashOpaqueValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function summarizeUserAgent(raw: string | undefined): string {
  const normalized = (raw || '').toLowerCase();
  const browser = normalized.includes('edg/')
    ? 'edge'
    : normalized.includes('chrome/')
      ? 'chrome'
      : normalized.includes('firefox/')
        ? 'firefox'
        : normalized.includes('safari/')
          ? 'safari'
          : 'unknown';
  const os = normalized.includes('android')
    ? 'android'
    : normalized.includes('iphone') || normalized.includes('ipad')
      ? 'ios'
      : normalized.includes('windows')
        ? 'windows'
        : normalized.includes('mac os x') || normalized.includes('macintosh')
          ? 'macos'
          : normalized.includes('linux')
            ? 'linux'
            : 'unknown';
  const device = normalized.includes('mobile')
    ? 'mobile'
    : normalized.includes('tablet') || normalized.includes('ipad')
      ? 'tablet'
      : 'desktop';

  return `${browser}:${os}:${device}`;
}

function areUserAgentsCompatible(
  stored: string | null | undefined,
  current: string,
): boolean {
  if (!stored) {
    return true;
  }

  const [storedBrowser, storedOs] = stored.split(':');
  const [currentBrowser, currentOs] = current.split(':');

  return storedBrowser === currentBrowser && storedOs === currentOs;
}

function resolveIp(raw: string | string[] | undefined): string | null {
  if (!raw) {
    return null;
  }

  const value = Array.isArray(raw) ? raw[0] : raw.split(',')[0];
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function buildContextHash(params: {
  userId: number;
  userAgentSummary: string;
  ipHash: string | null;
}): string {
  return hashOpaqueValue(
    `${params.userId}:${params.userAgentSummary}:${params.ipHash ?? 'no-ip'}`,
  );
}

function buildChallengeCode(): string {
  return String(randomInt(100000, 1_000_000));
}

function buildWaitSeconds(createdAt: Date): number {
  const waitMs =
    LOGIN_CHALLENGE_COOLDOWN_MS - (Date.now() - createdAt.getTime());
  return Math.max(1, Math.ceil(waitMs / 1000));
}

@Injectable()
export class LoginChallengeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  summarizeUserAgent(raw: string | undefined): string {
    return summarizeUserAgent(raw);
  }

  generateTrustedLoginToken(): string {
    return randomBytes(32).toString('hex');
  }

  hashTrustedLoginToken(token: string): string {
    return hashOpaqueValue(token);
  }

  async rememberTrustedContext(
    params: {
      userId: number;
      trustedLoginToken: string;
      userAgentSummary: string | null;
    },
    prisma: PrismaExecutor = this.prisma,
  ): Promise<void> {
    const tokenHash = hashOpaqueValue(params.trustedLoginToken);
    const expiresAt = addMinutes(new Date(), TRUSTED_LOGIN_TTL_DAYS * 24 * 60);

    await prisma.trustedLoginContext.deleteMany({
      where: {
        OR: [
          { userId: params.userId, expiresAt: { lte: new Date() } },
          { tokenHash },
        ],
      },
    });

    await prisma.trustedLoginContext.create({
      data: {
        userId: params.userId,
        tokenHash,
        userAgentSummary: params.userAgentSummary,
        expiresAt,
      },
    });
  }

  async revokeTrustedContexts(
    userId: number,
    prisma: PrismaExecutor = this.prisma,
  ): Promise<void> {
    await prisma.trustedLoginContext.deleteMany({
      where: { userId },
    });
  }

  async isRecognizedContext(params: {
    userId: number;
    trustedLoginToken?: string;
    userAgent?: string;
  }): Promise<{
    recognized: boolean;
    userAgentSummary: string;
    trustedContextHash: string | null;
  }> {
    const userAgentSummary = summarizeUserAgent(params.userAgent);
    const trustedLoginToken = params.trustedLoginToken?.trim();

    if (!trustedLoginToken) {
      return {
        recognized: false,
        userAgentSummary,
        trustedContextHash: null,
      };
    }

    const trustedContextHash = hashOpaqueValue(trustedLoginToken);
    const activeToken = await this.prisma.trustedLoginContext.findFirst({
      where: {
        userId: params.userId,
        tokenHash: trustedContextHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeToken) {
      return {
        recognized: false,
        userAgentSummary,
        trustedContextHash: null,
      };
    }

    if (
      !areUserAgentsCompatible(activeToken.userAgentSummary, userAgentSummary)
    ) {
      return {
        recognized: false,
        userAgentSummary,
        trustedContextHash: null,
      };
    }

    await this.prisma.trustedLoginContext.update({
      where: { id: activeToken.id },
      data: {
        lastUsedAt: new Date(),
        expiresAt: addMinutes(new Date(), TRUSTED_LOGIN_TTL_DAYS * 24 * 60),
      },
    });

    return {
      recognized: true,
      userAgentSummary,
      trustedContextHash,
    };
  }

  async createChallenge(params: {
    user: ChallengeUser;
    userAgent?: string;
    ip?: string | string[];
  }): Promise<ChallengeResult> {
    const userAgentSummary = summarizeUserAgent(params.userAgent);
    const ip = resolveIp(params.ip);
    const ipHash = ip ? hashOpaqueValue(ip) : null;
    const contextHash = buildContextHash({
      userId: params.user.id,
      userAgentSummary,
      ipHash,
    });
    const now = new Date();
    const code = buildChallengeCode();
    const codeHash = await bcrypt.hash(code, 10);

    const txResult = await this.prisma.$transaction(async (tx) => {
      const activeChallenge = await tx.loginChallenge.findFirst({
        where: {
          userId: params.user.id,
          consumedAt: null,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (
        activeChallenge &&
        now.getTime() - activeChallenge.createdAt.getTime() <
          LOGIN_CHALLENGE_COOLDOWN_MS
      ) {
        return {
          status: 'existing' as const,
          challengeId: activeChallenge.id,
          waitSeconds: buildWaitSeconds(activeChallenge.createdAt),
        };
      }

      await tx.loginChallenge.updateMany({
        where: {
          userId: params.user.id,
          consumedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          consumedAt: now,
        },
      });

      const created = await tx.loginChallenge.create({
        data: {
          userId: params.user.id,
          codeHash,
          contextHash,
          ipHash,
          userAgentSummary,
          expiresAt: addMinutes(now, LOGIN_CHALLENGE_TTL_MINUTES),
          maxAttempts: LOGIN_CHALLENGE_MAX_ATTEMPTS,
        },
      });

      return {
        status: 'created' as const,
        challengeId: created.id,
      };
    });

    if (txResult.status === 'existing') {
      return {
        status: 'challenge_required',
        challengeId: txResult.challengeId,
        waitSeconds: txResult.waitSeconds,
        reusedActiveChallenge: true,
      };
    }

    const template = buildLoginChallengeTemplate({
      code,
      expiresInMinutes: LOGIN_CHALLENGE_TTL_MINUTES,
      userAgentSummary,
    });

    try {
      await this.mailService.sendMail({
        to: params.user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    } catch (error) {
      await this.prisma.loginChallenge.updateMany({
        where: {
          id: txResult.challengeId,
          consumedAt: null,
        },
        data: {
          consumedAt: new Date(),
        },
      });
      throw error;
    }

    return {
      status: 'challenge_required',
      challengeId: txResult.challengeId,
      reusedActiveChallenge: false,
    };
  }

  async verifyChallenge(
    challengeId: number,
    code: string,
    context: {
      userAgent?: string;
      ip?: string | string[];
    },
  ): Promise<VerifiedChallengeResult> {
    const challenge = await this.prisma.loginChallenge.findUnique({
      where: { id: challengeId },
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

    if (!challenge) {
      return { status: 'error', error: 'TOKEN_INVALID' };
    }

    if (challenge.consumedAt) {
      return { status: 'error', error: 'TOKEN_CONSUMED' };
    }

    if (challenge.expiresAt.getTime() <= Date.now()) {
      return { status: 'error', error: 'TOKEN_EXPIRED' };
    }

    if (challenge.attemptCount >= challenge.maxAttempts) {
      return { status: 'error', error: 'TOO_MANY_ATTEMPTS' };
    }

    const currentUserAgentSummary = summarizeUserAgent(context.userAgent);
    const currentIp = resolveIp(context.ip);
    const currentContextHash = buildContextHash({
      userId: challenge.userId,
      userAgentSummary: currentUserAgentSummary,
      ipHash: currentIp ? hashOpaqueValue(currentIp) : null,
    });

    if (currentContextHash !== challenge.contextHash) {
      return { status: 'error', error: 'TOKEN_INVALID' };
    }

    const matches = await bcrypt.compare(code, challenge.codeHash);

    if (!matches) {
      const nextAttempts = challenge.attemptCount + 1;

      const updated = await this.prisma.loginChallenge.updateMany({
        where: {
          id: challenge.id,
          consumedAt: null,
          expiresAt: { gt: new Date() },
          attemptCount: challenge.attemptCount,
          contextHash: currentContextHash,
        },
        data: {
          attemptCount: { increment: 1 },
          consumedAt:
            nextAttempts >= challenge.maxAttempts ? new Date() : undefined,
        },
      });

      if (updated.count !== 1) {
        return { status: 'error', error: 'TOKEN_CONSUMED' };
      }

      return {
        status: 'error',
        error:
          nextAttempts >= challenge.maxAttempts
            ? 'TOO_MANY_ATTEMPTS'
            : 'CODE_INVALID',
      };
    }

    const consumed = await this.prisma.loginChallenge.updateMany({
      where: {
        id: challenge.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attemptCount: challenge.attemptCount,
        contextHash: currentContextHash,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    if (consumed.count !== 1) {
      return { status: 'error', error: 'TOKEN_CONSUMED' };
    }

    return {
      status: 'verified',
      user: challenge.user,
      userAgentSummary: challenge.userAgentSummary,
    };
  }
}
