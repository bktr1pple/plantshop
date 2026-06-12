import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailSecurityService } from './email-security.service';
import { LoginChallengeService } from './login-challenge.service';

function createResponseMock(): Pick<Response, 'cookie' | 'clearCookie'> {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };
}

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: {
    register: jest.Mock;
    login: jest.Mock;
    validateUser: jest.Mock;
    validatePendingRegistration: jest.Mock;
    resendPendingRegistration: jest.Mock;
    consumePendingRegistrationToken: jest.Mock;
    revokeRefreshToken: jest.Mock;
    refresh: jest.Mock;
    verifyAccessToken: jest.Mock;
    verifyCurrentPassword: jest.Mock;
    updatePassword: jest.Mock;
    logoutAll: jest.Mock;
  };
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let emailSecurityMock: {
    sendEmailVerification: jest.Mock;
    sendPendingRegistrationEmail: jest.Mock;
    verifyEmailToken: jest.Mock;
    resendVerificationForEmail: jest.Mock;
    createPasswordReset: jest.Mock;
    consumePasswordResetToken: jest.Mock;
  };
  let loginChallengeMock: {
    isRecognizedContext: jest.Mock;
    createChallenge: jest.Mock;
    generateTrustedLoginToken: jest.Mock;
    hashTrustedLoginToken: jest.Mock;
    summarizeUserAgent: jest.Mock;
    rememberTrustedContext: jest.Mock;
    revokeTrustedContexts: jest.Mock;
    verifyChallenge: jest.Mock;
  };

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      validatePendingRegistration: jest.fn(),
      resendPendingRegistration: jest.fn(),
      consumePendingRegistrationToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      refresh: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyCurrentPassword: jest.fn(),
      updatePassword: jest.fn(),
      logoutAll: jest.fn(),
    };

    prismaMock = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(
        async (callback: (tx: PrismaService) => Promise<unknown>) =>
          callback(prismaMock as unknown as PrismaService),
      ),
    };

    emailSecurityMock = {
      sendEmailVerification: jest.fn(),
      sendPendingRegistrationEmail: jest.fn(),
      verifyEmailToken: jest.fn(),
      resendVerificationForEmail: jest.fn(),
      createPasswordReset: jest.fn(),
      consumePasswordResetToken: jest.fn(),
    };

    loginChallengeMock = {
      isRecognizedContext: jest.fn(),
      createChallenge: jest.fn(),
      generateTrustedLoginToken: jest.fn(),
      hashTrustedLoginToken: jest.fn(),
      summarizeUserAgent: jest.fn(),
      rememberTrustedContext: jest.fn(),
      revokeTrustedContexts: jest.fn(),
      verifyChallenge: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: EmailSecurityService,
          useValue: emailSecurityMock,
        },
        {
          provide: LoginChallengeService,
          useValue: loginChallengeMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('register повертає error при невалідній reCAPTCHA', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    }) as typeof fetch;

    await expect(
      controller.register({
        email: 'user@example.com',
        password: 'password123',
        name: 'User',
        captchaToken: 'bad-captcha',
      }),
    ).resolves.toEqual({
      status: 'error',
      message: 'Ви не пройшли перевірку reCAPTCHA!',
    });
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('register створює pending registration і повертає verification_required без cookies', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as typeof fetch;
    authServiceMock.register.mockResolvedValue({
      kind: 'pending_registration',
      email: 'user@example.com',
      name: 'User',
      rawToken: 'raw-token',
      reusedExisting: false,
    });
    emailSecurityMock.sendPendingRegistrationEmail.mockResolvedValue(undefined);

    await expect(
      controller.register({
        email: 'user@example.com',
        password: 'password123',
        name: 'User',
        captchaToken: 'captcha-token',
      }),
    ).resolves.toEqual({
      status: 'verification_required',
      email: 'user@example.com',
      resent: false,
      waitSeconds: undefined,
      message:
        'Ми надіслали лист для підтвердження email. Після підтвердження акаунт буде створено остаточно.',
    });
    expect(emailSecurityMock.sendPendingRegistrationEmail).toHaveBeenCalledWith(
      {
        email: 'user@example.com',
        rawToken: 'raw-token',
        resent: false,
      },
    );
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('login повертає verification_required для неверифікованого акаунта', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as typeof fetch;
    authServiceMock.validateUser.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      role: 'USER',
      emailVerifiedAt: null,
    });
    emailSecurityMock.sendEmailVerification.mockResolvedValue({
      status: 'sent',
      resent: true,
    });
    const res = createResponseMock();

    await expect(
      controller.login(
        {
          email: 'user@example.com',
          password: 'password123',
          captchaToken: 'captcha-token',
        },
        { cookies: {}, get: jest.fn() } as unknown as Request,
        res as Response,
      ),
    ).resolves.toEqual({
      status: 'verification_required',
      email: 'user@example.com',
      waitSeconds: undefined,
      message:
        'Перш ніж увійти, підтвердіть email. Ми надіслали або щойно повторили лист підтвердження.',
    });
    expect(res.cookie).not.toHaveBeenCalled();
    // access + refresh + session-hint
    expect(res.clearCookie).toHaveBeenCalledTimes(3);
  });

  it('login повертає verification_required для pending registration без створеного User', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as typeof fetch;
    authServiceMock.validateUser.mockResolvedValue(null);
    authServiceMock.validatePendingRegistration.mockResolvedValue({
      id: 7,
      email: 'pending@example.com',
      name: 'Pending',
    });
    authServiceMock.resendPendingRegistration.mockResolvedValue({
      status: 'queued',
      rawToken: 'pending-token',
    });
    emailSecurityMock.sendPendingRegistrationEmail.mockResolvedValue(undefined);
    const res = createResponseMock();

    await expect(
      controller.login(
        {
          email: 'pending@example.com',
          password: 'password123',
          captchaToken: 'captcha-token',
        },
        { cookies: {}, get: jest.fn() } as unknown as Request,
        res as Response,
      ),
    ).resolves.toEqual({
      status: 'verification_required',
      email: 'pending@example.com',
      waitSeconds: undefined,
      message:
        'Перш ніж увійти, підтвердіть email і завершіть створення акаунта.',
    });
    expect(emailSecurityMock.sendPendingRegistrationEmail).toHaveBeenCalledWith(
      {
        email: 'pending@example.com',
        rawToken: 'pending-token',
        resent: true,
      },
    );
    expect(res.clearCookie).toHaveBeenCalledTimes(3);
  });

  it('login повертає challenge_required без auth cookies для невпізнаного контексту', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as typeof fetch;
    authServiceMock.validateUser.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      role: 'USER',
      emailVerifiedAt: new Date(),
    });
    loginChallengeMock.isRecognizedContext.mockResolvedValue({
      recognized: false,
      userAgentSummary: 'chrome:macos:desktop',
      trustedContextHash: null,
    });
    loginChallengeMock.createChallenge.mockResolvedValue({
      status: 'challenge_required',
      challengeId: 44,
      reusedActiveChallenge: false,
    });
    const res = createResponseMock();

    await expect(
      controller.login(
        {
          email: 'user@example.com',
          password: 'password123',
          captchaToken: 'captcha-token',
        },
        {
          cookies: {},
          get: jest.fn().mockReturnValue('Mozilla/5.0'),
          headers: {},
          ip: '127.0.0.1',
        } as unknown as Request,
        res as Response,
      ),
    ).resolves.toEqual({
      status: 'challenge_required',
      email: 'user@example.com',
      challengeId: 44,
      waitSeconds: undefined,
      message:
        'Ми надіслали код підтвердження на ваш email, бо це новий або невпізнаний контекст входу.',
    });
    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('login у recognized context ставить auth і trusted_login cookies', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as typeof fetch;
    authServiceMock.validateUser.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      role: 'USER',
      emailVerifiedAt: new Date(),
    });
    loginChallengeMock.isRecognizedContext.mockResolvedValue({
      recognized: true,
      userAgentSummary: 'chrome:macos:desktop',
      trustedContextHash: 'existing-hash',
    });
    loginChallengeMock.generateTrustedLoginToken.mockReturnValue(
      'trusted-token',
    );
    loginChallengeMock.hashTrustedLoginToken.mockReturnValue('trusted-hash');
    loginChallengeMock.rememberTrustedContext.mockResolvedValue(undefined);
    authServiceMock.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    const res = createResponseMock();

    await expect(
      controller.login(
        {
          email: 'user@example.com',
          password: 'password123',
          captchaToken: 'captcha-token',
        },
        {
          cookies: { trusted_login: 'trusted-token' },
          get: jest.fn().mockReturnValue('Mozilla/5.0'),
          headers: {},
          ip: '127.0.0.1',
        } as unknown as Request,
        res as Response,
      ),
    ).resolves.toEqual({ status: 'ok' });
    expect(authServiceMock.login).toHaveBeenCalledWith(
      1,
      'user@example.com',
      'USER',
      {
        trustedContextHash: 'trusted-hash',
        userAgentSummary: 'chrome:macos:desktop',
      },
    );
    expect(loginChallengeMock.rememberTrustedContext).toHaveBeenCalledWith({
      userId: 1,
      trustedLoginToken: 'trusted-token',
      userAgentSummary: 'chrome:macos:desktop',
    });
    // access + refresh + trusted_login + session-hint
    expect(res.cookie).toHaveBeenCalledTimes(4);
  });

  it('verify-email завершує pending registration і створює акаунт лише після токена', async () => {
    authServiceMock.consumePendingRegistrationToken.mockResolvedValue({
      status: 'verified',
      email: 'user@example.com',
      userId: 11,
    });

    await expect(
      controller.verifyEmail({ token: 'a'.repeat(32) }),
    ).resolves.toEqual({
      status: 'ok',
      email: 'user@example.com',
      message:
        'Email успішно підтверджено. Акаунт створено, тепер ви можете увійти.',
    });
  });

  it('verify-email мапить TOKEN_CONSUMED у ConflictException body', async () => {
    authServiceMock.consumePendingRegistrationToken.mockResolvedValue({
      status: 'error',
      error: 'TOKEN_INVALID',
    });
    emailSecurityMock.verifyEmailToken.mockResolvedValue({
      status: 'error',
      error: 'TOKEN_CONSUMED',
    });

    await expect(
      controller.verifyEmail({ token: 'a'.repeat(32) }),
    ).rejects.toThrow(ConflictException);
  });

  it('reset-password очищає cookies після успіху', async () => {
    emailSecurityMock.consumePasswordResetToken.mockResolvedValue({
      status: 'consumed',
      userId: 5,
    });
    loginChallengeMock.revokeTrustedContexts.mockResolvedValue(undefined);
    const res = createResponseMock();

    await expect(
      controller.resetPassword(
        {
          token: 'a'.repeat(32),
          newPassword: 'new-password',
          confirmPassword: 'new-password',
        },
        res as Response,
      ),
    ).resolves.toEqual({
      status: 'ok',
      message:
        'Пароль оновлено. Для безпеки всі попередні сесії завершено. Увійдіть знову.',
    });
    // access + refresh + trusted_login + session-hint
    expect(res.clearCookie).toHaveBeenCalledTimes(4);
  });

  it('change-password відхиляє невірний current password', async () => {
    authServiceMock.verifyAccessToken.mockReturnValue({ sub: 8 });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 8,
      email: 'user@example.com',
      name: 'User',
      phone: null,
      address: null,
      bio: null,
      emailNotifications: true,
      orderUpdates: true,
      careReminders: true,
      promotional: false,
      profileVisibility: 'friends',
      dataSharing: false,
      personalizedAds: false,
      role: 'USER',
    });
    authServiceMock.verifyCurrentPassword.mockResolvedValue(false);

    await expect(
      controller.changePassword(
        {
          currentPassword: 'wrong-password',
          newPassword: 'new-password',
          confirmPassword: 'new-password',
        },
        {
          cookies: {
            access_token: 'access-token',
          },
        } as Request,
        createResponseMock() as Response,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('verify-login-challenge ставить cookies після успіху', async () => {
    loginChallengeMock.verifyChallenge.mockResolvedValue({
      status: 'verified',
      user: {
        id: 9,
        email: 'user@example.com',
        role: 'USER',
      },
      userAgentSummary: 'chrome:macos:desktop',
    });
    loginChallengeMock.generateTrustedLoginToken.mockReturnValue(
      'trusted-token',
    );
    loginChallengeMock.hashTrustedLoginToken.mockReturnValue('trusted-hash');
    loginChallengeMock.rememberTrustedContext.mockResolvedValue(undefined);
    authServiceMock.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    const res = createResponseMock();

    await expect(
      controller.verifyLoginChallenge(
        { challengeId: 12, code: '123456' },
        {
          get: jest.fn().mockReturnValue('Mozilla/5.0'),
          ip: '127.0.0.1',
        } as unknown as Request,
        res as Response,
      ),
    ).resolves.toEqual({ status: 'ok' });
    expect(loginChallengeMock.verifyChallenge).toHaveBeenCalledWith(
      12,
      '123456',
      {
        userAgent: 'Mozilla/5.0',
        ip: '127.0.0.1',
      },
    );
    expect(loginChallengeMock.rememberTrustedContext).toHaveBeenCalled();
    // access + refresh + trusted_login + session-hint
    expect(res.cookie).toHaveBeenCalledTimes(4);
  });

  it('logout відкликає refresh token і чистить лише session cookies', async () => {
    authServiceMock.revokeRefreshToken.mockResolvedValue(true);
    const res = createResponseMock();

    await expect(
      controller.logout(
        {
          cookies: { refresh_token: 'refresh-token' },
        } as Request,
        res as Response,
      ),
    ).resolves.toEqual({ status: 'ok' });

    expect(authServiceMock.revokeRefreshToken).toHaveBeenCalledWith(
      'refresh-token',
    );
    // access + refresh + session-hint (trusted_login лишається)
    expect(res.clearCookie).toHaveBeenCalledTimes(3);
  });

  it('me робить refresh по refresh_token і повертає користувача', async () => {
    authServiceMock.refresh.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    authServiceMock.verifyAccessToken.mockReturnValue({ sub: 7 });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      name: 'User',
      phone: null,
      address: null,
      bio: null,
      emailNotifications: true,
      orderUpdates: true,
      careReminders: true,
      promotional: false,
      profileVisibility: 'friends',
      dataSharing: false,
      personalizedAds: false,
      role: 'ADMIN',
    });
    const res = createResponseMock();

    await expect(
      controller.me(
        {
          cookies: { refresh_token: 'refresh-token' },
        } as Request,
        res as Response,
      ),
    ).resolves.toEqual({
      user: {
        id: 7,
        email: 'user@example.com',
        name: 'User',
        phone: null,
        address: null,
        bio: null,
        emailNotifications: true,
        orderUpdates: true,
        careReminders: true,
        promotional: false,
        profileVisibility: 'friends',
        dataSharing: false,
        personalizedAds: false,
        role: 'ADMIN',
      },
    });

    // access + refresh + session-hint (refresh-ротація в /auth/me)
    expect(res.cookie).toHaveBeenCalledTimes(3);
  });

  it('me кидає UnauthorizedException без access і refresh token', async () => {
    await expect(
      controller.me(
        { cookies: {} } as Request,
        createResponseMock() as Response,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });
});
