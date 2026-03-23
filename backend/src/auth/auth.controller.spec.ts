import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
    revokeRefreshToken: jest.Mock;
    refresh: jest.Mock;
    verifyAccessToken: jest.Mock;
  };
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      revokeRefreshToken: jest.fn(),
      refresh: jest.fn(),
      verifyAccessToken: jest.fn(),
    };

    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
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
      controller.register(
        {
          email: 'user@example.com',
          password: 'password123',
          name: 'User',
          captchaToken: 'bad-captcha',
        },
        createResponseMock() as Response,
      ),
    ).resolves.toEqual({
      status: 'error',
      message: 'Ви не пройшли перевірку reCAPTCHA!',
    });
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('register створює сесію через backend і ставить cookies', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as typeof fetch;
    authServiceMock.register.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      name: 'User',
      role: 'USER',
    });
    authServiceMock.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    const res = createResponseMock();

    await expect(
      controller.register(
        {
          email: 'user@example.com',
          password: 'password123',
          name: 'User',
          captchaToken: 'captcha-token',
        },
        res as Response,
      ),
    ).resolves.toEqual({
      status: 'ok',
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'User',
        role: 'USER',
      },
    });
    expect(authServiceMock.register).toHaveBeenCalledWith(
      'user@example.com',
      'password123',
      'User',
    );
    expect(authServiceMock.login).toHaveBeenCalledWith(
      1,
      'user@example.com',
      'USER',
    );
    expect(res.cookie).toHaveBeenCalledTimes(2);
  });

  it('login повертає error для невалідних облікових даних', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as typeof fetch;
    authServiceMock.validateUser.mockResolvedValue(null);

    await expect(
      controller.login(
        {
          email: 'user@example.com',
          password: 'wrong-password',
          captchaToken: 'captcha-token',
        },
        createResponseMock() as Response,
      ),
    ).resolves.toEqual({
      status: 'error',
      message: 'Невірний email або пароль',
    });
  });

  it('logout відкликає refresh token і чистить cookies', async () => {
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
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('me кидає UnauthorizedException без access і refresh token', async () => {
    await expect(
      controller.me(
        { cookies: {} } as Request,
        createResponseMock() as Response,
      ),
    ).rejects.toThrow(UnauthorizedException);
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
        role: 'ADMIN',
      },
    });

    expect(authServiceMock.refresh).toHaveBeenCalledWith('refresh-token');
    expect(authServiceMock.verifyAccessToken).toHaveBeenCalledWith(
      'new-access',
    );
    expect(res.cookie).toHaveBeenCalledTimes(2);
  });
});
