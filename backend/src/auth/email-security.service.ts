import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Prisma, VerificationTokenType, type UserRole } from '@prisma/client';
import { addHours, addMinutes } from 'date-fns';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  buildPasswordResetTemplate,
  buildVerifyEmailTemplate,
} from '../mail/mail.templates';
import { getRequiredEnv } from '../config/env';

const SECURITY_COOLDOWN_MS = 60_000;
const EMAIL_VERIFY_TTL_HOURS = 24;
const PASSWORD_RESET_TTL_MINUTES = 30;
const FRONTEND_URL = getRequiredEnv('FRONTEND_URL');

export type TokenStateError =
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_CONSUMED';

export interface SecurityUser {
  id: number;
  email: string;
  role: UserRole;
  emailVerifiedAt: Date | null;
}

type IssueTokenResult =
  | {
      status: 'created';
      tokenId: number;
      rawToken: string;
      expiresAt: Date;
    }
  | {
      status: 'cooldown';
      waitSeconds: number;
    };

export interface SendVerificationResult {
  status: 'sent' | 'cooldown';
  waitSeconds?: number;
  resent: boolean;
}

export interface VerifyEmailResult {
  status: 'verified' | 'error';
  email?: string;
  error?: TokenStateError;
}

export interface PasswordResetTokenResult {
  status: 'consumed' | 'error';
  userId?: number;
  error?: TokenStateError;
}

function hashOpaqueValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function buildOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}

function buildWaitSeconds(createdAt: Date): number {
  const waitMs = SECURITY_COOLDOWN_MS - (Date.now() - createdAt.getTime());
  return Math.max(1, Math.ceil(waitMs / 1000));
}

function createVerificationUrl(token: string): string {
  return `${FRONTEND_URL.replace(/\/+$/, '')}/verify-email?token=${encodeURIComponent(token)}`;
}

function createResetUrl(token: string): string {
  return `${FRONTEND_URL.replace(/\/+$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
}

@Injectable()
export class EmailSecurityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private async issueToken(
    userId: number,
    type: VerificationTokenType,
    targetEmail: string | null,
    expiresAt: Date,
  ): Promise<IssueTokenResult> {
    const now = new Date();
    const rawToken = buildOpaqueToken();
    const tokenHash = hashOpaqueValue(rawToken);

    return this.prisma.$transaction(async (tx) => {
      const latestActive = await tx.verificationToken.findFirst({
        where: {
          userId,
          type,
          consumedAt: null,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (
        latestActive &&
        now.getTime() - latestActive.createdAt.getTime() < SECURITY_COOLDOWN_MS
      ) {
        return {
          status: 'cooldown' as const,
          waitSeconds: buildWaitSeconds(latestActive.createdAt),
        };
      }

      await tx.verificationToken.updateMany({
        where: {
          userId,
          type,
          consumedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          consumedAt: now,
        },
      });

      const created = await tx.verificationToken.create({
        data: {
          userId,
          type,
          tokenHash,
          targetEmail,
          expiresAt,
        },
      });

      return {
        status: 'created' as const,
        tokenId: created.id,
        rawToken,
        expiresAt,
      };
    });
  }

  private async revokeTokenById(id: number): Promise<void> {
    await this.prisma.verificationToken.updateMany({
      where: { id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }

  async sendPendingRegistrationEmail(params: {
    email: string;
    rawToken: string;
    resent?: boolean;
  }): Promise<void> {
    const template = buildVerifyEmailTemplate({
      verifyUrl: createVerificationUrl(params.rawToken),
      expiresInHours: EMAIL_VERIFY_TTL_HOURS,
    });

    try {
      await this.mailService.sendMail({
        to: params.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    } catch {
      throw new ServiceUnavailableException({
        error: 'TEMPORARILY_UNAVAILABLE',
        message:
          'Не вдалося надіслати лист підтвердження. Спробуйте ще раз трохи пізніше.',
      });
    }
  }

  async sendEmailVerification(
    user: SecurityUser,
    options?: { resent?: boolean },
  ): Promise<SendVerificationResult> {
    const issueResult = await this.issueToken(
      user.id,
      VerificationTokenType.EMAIL_VERIFY,
      user.email,
      addHours(new Date(), EMAIL_VERIFY_TTL_HOURS),
    );

    if (issueResult.status === 'cooldown') {
      return {
        status: 'cooldown',
        waitSeconds: issueResult.waitSeconds,
        resent: options?.resent === true,
      };
    }

    const template = buildVerifyEmailTemplate({
      verifyUrl: createVerificationUrl(issueResult.rawToken),
      expiresInHours: EMAIL_VERIFY_TTL_HOURS,
    });

    try {
      await this.mailService.sendMail({
        to: user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    } catch (error) {
      await this.revokeTokenById(issueResult.tokenId);
      throw error;
    }

    return {
      status: 'sent',
      resent: options?.resent === true,
    };
  }

  async resendVerificationForEmail(email: string): Promise<{
    status: 'ok' | 'cooldown';
    waitSeconds?: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
      },
    });

    if (!user || user.emailVerifiedAt) {
      return { status: 'ok' };
    }

    try {
      const sendResult = await this.sendEmailVerification(user, {
        resent: true,
      });

      if (sendResult.status === 'cooldown') {
        return {
          status: 'cooldown',
          waitSeconds: sendResult.waitSeconds,
        };
      }

      return { status: 'ok' };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException({
        error: 'TEMPORARILY_UNAVAILABLE',
        message:
          'Не вдалося повторно надіслати лист підтвердження. Спробуйте ще раз пізніше.',
      });
    }
  }

  private async resolveTokenState(
    rawToken: string,
    type: VerificationTokenType,
  ) {
    const tokenHash = hashOpaqueValue(rawToken);
    const record = await this.prisma.verificationToken.findFirst({
      where: { tokenHash, type },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerifiedAt: true,
          },
        },
      },
    });

    if (!record) {
      return { status: 'error' as const, error: 'TOKEN_INVALID' as const };
    }

    if (record.consumedAt) {
      return { status: 'error' as const, error: 'TOKEN_CONSUMED' as const };
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      return { status: 'error' as const, error: 'TOKEN_EXPIRED' as const };
    }

    return { status: 'ok' as const, record };
  }

  async verifyEmailToken(rawToken: string): Promise<VerifyEmailResult> {
    const resolved = await this.resolveTokenState(
      rawToken,
      VerificationTokenType.EMAIL_VERIFY,
    );

    if (resolved.status === 'error') {
      return resolved;
    }

    const { record } = resolved;
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationToken.updateMany({
        where: {
          userId: record.userId,
          type: VerificationTokenType.EMAIL_VERIFY,
          consumedAt: null,
        },
        data: {
          consumedAt: now,
        },
      });

      if (!record.user.emailVerifiedAt) {
        await tx.user.update({
          where: { id: record.userId },
          data: {
            emailVerifiedAt: now,
          },
        });
      }
    });

    return {
      status: 'verified',
      email: record.user.email,
    };
  }

  async createPasswordReset(email: string): Promise<{
    status: 'queued' | 'cooldown' | 'noop';
    waitSeconds?: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
      },
    });

    if (!user || !user.emailVerifiedAt) {
      return { status: 'noop' };
    }

    const issueResult = await this.issueToken(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
      user.email,
      addMinutes(new Date(), PASSWORD_RESET_TTL_MINUTES),
    );

    if (issueResult.status === 'cooldown') {
      return {
        status: 'cooldown',
        waitSeconds: issueResult.waitSeconds,
      };
    }

    const template = buildPasswordResetTemplate({
      resetUrl: createResetUrl(issueResult.rawToken),
      expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
    });

    try {
      await this.mailService.sendMail({
        to: user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    } catch (error) {
      console.error('Password reset mail failed', error);
    }

    return { status: 'queued' };
  }

  async consumePasswordResetToken(
    rawToken: string,
    callback: (tx: Prisma.TransactionClient, userId: number) => Promise<void>,
  ): Promise<PasswordResetTokenResult> {
    const resolved = await this.resolveTokenState(
      rawToken,
      VerificationTokenType.PASSWORD_RESET,
    );

    if (resolved.status === 'error') {
      return resolved;
    }

    const { record } = resolved;
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationToken.updateMany({
        where: {
          userId: record.userId,
          type: VerificationTokenType.PASSWORD_RESET,
          consumedAt: null,
        },
        data: {
          consumedAt: now,
        },
      });

      await callback(tx, record.userId);
    });

    return {
      status: 'consumed',
      userId: record.userId,
    };
  }
}
