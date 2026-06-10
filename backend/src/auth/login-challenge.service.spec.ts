/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { LoginChallengeService } from './login-challenge.service';
import type { MailService } from '../mail/mail.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('LoginChallengeService', () => {
  const userAgent =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
  const ip = '127.0.0.1';
  let service: LoginChallengeService;
  let prismaMock: {
    loginChallenge: {
      findFirst: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    trustedLoginContext: {
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let mailServiceMock: {
    sendMail: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      loginChallenge: {
        findFirst: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      trustedLoginContext: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: jest.fn(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      ),
    };
    mailServiceMock = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };
    service = new LoginChallengeService(
      prismaMock as never,
      mailServiceMock as unknown as MailService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('розпізнає trusted_login лише для сумісного browser/os контексту', async () => {
    const trustedLoginToken = 'trusted-token';
    const trustedContextHash = service.hashTrustedLoginToken(trustedLoginToken);
    prismaMock.trustedLoginContext.findFirst.mockResolvedValue({
      id: 3,
      tokenHash: trustedContextHash,
      userAgentSummary: 'chrome:windows:desktop',
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(
      service.isRecognizedContext({
        userId: 5,
        trustedLoginToken,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      }),
    ).resolves.toEqual({
      recognized: true,
      userAgentSummary: 'chrome:windows:desktop',
      trustedContextHash,
    });

    expect(prismaMock.trustedLoginContext.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: {
        lastUsedAt: expect.any(Date),
        expiresAt: expect.any(Date),
      },
    });
  });

  it('не визнає trusted_login при несумісному user agent', async () => {
    prismaMock.trustedLoginContext.findFirst.mockResolvedValue({
      id: 3,
      tokenHash: service.hashTrustedLoginToken('trusted-token'),
      userAgentSummary: 'chrome:windows:desktop',
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(
      service.isRecognizedContext({
        userId: 5,
        trustedLoginToken: 'trusted-token',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15',
      }),
    ).resolves.toEqual({
      recognized: false,
      userAgentSummary: 'safari:macos:desktop',
      trustedContextHash: null,
    });

    expect(prismaMock.trustedLoginContext.update).not.toHaveBeenCalled();
  });

  it('verifyChallenge споживає challenge після правильного коду', async () => {
    const userAgentSummary = service.summarizeUserAgent(userAgent);
    const ipHash = createHash('sha256').update(ip).digest('hex');
    prismaMock.loginChallenge.findUnique.mockResolvedValue({
      id: 10,
      userId: 2,
      codeHash: 'code-hash',
      contextHash: createHash('sha256')
        .update(`2:${userAgentSummary}:${ipHash}`)
        .digest('hex'),
      attemptCount: 0,
      maxAttempts: 5,
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      userAgentSummary,
      user: {
        id: 2,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    prismaMock.loginChallenge.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      service.verifyChallenge(10, '123456', { userAgent, ip }),
    ).resolves.toEqual({
      status: 'verified',
      user: {
        id: 2,
        email: 'user@example.com',
        role: 'USER',
      },
      userAgentSummary,
    });

    expect(prismaMock.loginChallenge.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 10,
        consumedAt: null,
        contextHash: expect.any(String),
      }),
      data: {
        consumedAt: expect.any(Date),
      },
    });
  });

  it('verifyChallenge блокує challenge після вичерпання спроб', async () => {
    const userAgentSummary = service.summarizeUserAgent(userAgent);
    const ipHash = createHash('sha256').update(ip).digest('hex');
    prismaMock.loginChallenge.findUnique.mockResolvedValue({
      id: 10,
      userId: 2,
      codeHash: 'code-hash',
      contextHash: createHash('sha256')
        .update(`2:${userAgentSummary}:${ipHash}`)
        .digest('hex'),
      attemptCount: 4,
      maxAttempts: 5,
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      userAgentSummary,
      user: {
        id: 2,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);
    prismaMock.loginChallenge.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      service.verifyChallenge(10, '000000', { userAgent, ip }),
    ).resolves.toEqual({
      status: 'error',
      error: 'TOO_MANY_ATTEMPTS',
    });

    expect(prismaMock.loginChallenge.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 10,
        attemptCount: 4,
      }),
      data: {
        attemptCount: { increment: 1 },
        consumedAt: expect.any(Date),
      },
    });
  });

  it('відхиляє challenge з іншого browser/IP контексту', async () => {
    prismaMock.loginChallenge.findUnique.mockResolvedValue({
      id: 10,
      userId: 2,
      codeHash: 'code-hash',
      contextHash: 'different-context',
      attemptCount: 0,
      maxAttempts: 5,
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      userAgentSummary: 'chrome:linux:desktop',
      user: {
        id: 2,
        email: 'user@example.com',
        role: 'USER',
      },
    });

    await expect(
      service.verifyChallenge(10, '123456', { userAgent, ip }),
    ).resolves.toEqual({
      status: 'error',
      error: 'TOKEN_INVALID',
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('не дозволяє атомарно спожити challenge двічі', async () => {
    const userAgentSummary = service.summarizeUserAgent(userAgent);
    const ipHash = createHash('sha256').update(ip).digest('hex');
    prismaMock.loginChallenge.findUnique.mockResolvedValue({
      id: 10,
      userId: 2,
      codeHash: 'code-hash',
      contextHash: createHash('sha256')
        .update(`2:${userAgentSummary}:${ipHash}`)
        .digest('hex'),
      attemptCount: 0,
      maxAttempts: 5,
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      userAgentSummary,
      user: {
        id: 2,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    prismaMock.loginChallenge.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await expect(
      service.verifyChallenge(10, '123456', { userAgent, ip }),
    ).resolves.toMatchObject({ status: 'verified' });
    await expect(
      service.verifyChallenge(10, '123456', { userAgent, ip }),
    ).resolves.toEqual({
      status: 'error',
      error: 'TOKEN_CONSUMED',
    });
  });
});
