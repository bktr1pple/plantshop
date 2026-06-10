/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ServiceUnavailableException } from '@nestjs/common';
import { VerificationTokenType } from '../generated/prisma/client';
import { createHash } from 'crypto';
import { EmailSecurityService } from './email-security.service';
import type { MailService } from '../mail/mail.service';

function hashOpaqueValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('EmailSecurityService', () => {
  let service: EmailSecurityService;
  let prismaMock: {
    verificationToken: {
      findFirst: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let mailServiceMock: {
    sendMail: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      verificationToken: {
        findFirst: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      ),
    };
    mailServiceMock = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };
    service = new EmailSecurityService(
      prismaMock as never,
      mailServiceMock as unknown as MailService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('створює email verification token і надсилає лист', async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue(null);
    prismaMock.verificationToken.create.mockResolvedValue({ id: 12 });

    await expect(
      service.sendEmailVerification({
        id: 7,
        email: 'user@example.com',
        role: 'USER',
        emailVerifiedAt: null,
      }),
    ).resolves.toEqual({
      status: 'sent',
      resent: false,
    });

    expect(prismaMock.verificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 7,
        type: VerificationTokenType.EMAIL_VERIFY,
        targetEmail: 'user@example.com',
      }),
    });
    expect(mailServiceMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        html: expect.stringContaining('/verify-email?token='),
      }),
    );
  });

  it('відкликає створений token, якщо лист підтвердження не відправився', async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue(null);
    prismaMock.verificationToken.create.mockResolvedValue({ id: 12 });
    mailServiceMock.sendMail.mockRejectedValue(new Error('smtp down'));

    await expect(
      service.sendEmailVerification({
        id: 7,
        email: 'user@example.com',
        role: 'USER',
        emailVerifiedAt: null,
      }),
    ).rejects.toThrow('smtp down');

    expect(prismaMock.verificationToken.updateMany).toHaveBeenCalledWith({
      where: { id: 12, consumedAt: null },
      data: { consumedAt: expect.any(Date) },
    });
  });

  it('verifyEmailToken споживає активні токени і верифікує користувача', async () => {
    const rawToken = 'verify-token';
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      id: 20,
      userId: 5,
      type: VerificationTokenType.EMAIL_VERIFY,
      tokenHash: hashOpaqueValue(rawToken),
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 5,
        email: 'user@example.com',
        emailVerifiedAt: null,
      },
    });
    prismaMock.verificationToken.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.verifyEmailToken(rawToken)).resolves.toEqual({
      status: 'verified',
      email: 'user@example.com',
    });

    expect(prismaMock.verificationToken.findFirst).toHaveBeenCalledWith({
      where: {
        tokenHash: hashOpaqueValue(rawToken),
        type: VerificationTokenType.EMAIL_VERIFY,
      },
      include: expect.any(Object),
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        emailVerifiedAt: expect.any(Date),
      },
    });
  });

  it('password reset token споживається атомарно лише один раз', async () => {
    const rawToken = 'reset-token';
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      id: 30,
      userId: 5,
      type: VerificationTokenType.PASSWORD_RESET,
      tokenHash: hashOpaqueValue(rawToken),
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 5,
        email: 'user@example.com',
        emailVerifiedAt: new Date(),
      },
    });
    prismaMock.verificationToken.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const callback = jest.fn().mockResolvedValue(undefined);

    await expect(
      service.consumePasswordResetToken(rawToken, callback),
    ).resolves.toEqual({
      status: 'consumed',
      userId: 5,
    });
    await expect(
      service.consumePasswordResetToken(rawToken, callback),
    ).resolves.toEqual({
      status: 'error',
      error: 'TOKEN_CONSUMED',
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('відхиляє прострочений password reset token', async () => {
    const rawToken = 'expired-reset-token';
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      id: 31,
      userId: 5,
      type: VerificationTokenType.PASSWORD_RESET,
      tokenHash: hashOpaqueValue(rawToken),
      consumedAt: null,
      expiresAt: new Date(Date.now() - 1),
      user: {
        id: 5,
        email: 'user@example.com',
        emailVerifiedAt: new Date(),
      },
    });
    const callback = jest.fn();

    await expect(
      service.consumePasswordResetToken(rawToken, callback),
    ).resolves.toEqual({
      status: 'error',
      error: 'TOKEN_EXPIRED',
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('sendPendingRegistrationEmail повертає ServiceUnavailableException при SMTP помилці', async () => {
    mailServiceMock.sendMail.mockRejectedValue(new Error('smtp down'));

    await expect(
      service.sendPendingRegistrationEmail({
        email: 'pending@example.com',
        rawToken: 'pending-token',
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
