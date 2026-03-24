import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
      findMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let jwtServiceMock: {
    sign: jest.Mock;
    verify: jest.Mock;
    decode: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    jwtServiceMock = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('register хешує пароль і створює користувача', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      name: 'User',
      role: 'USER',
      createdAt: new Date(),
    });
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

    const result = await service.register(
      'user@example.com',
      'password123',
      'User',
    );

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'user@example.com',
        password: 'hashed-password',
        name: 'User',
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    expect(result.id).toBe(1);
    expect(result.email).toBe('user@example.com');
    expect(result.name).toBe('User');
    expect(result.role).toBe('USER');
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('register кидає BadRequestException для дубльованого email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });

    await expect(
      service.register('user@example.com', 'password123', 'User'),
    ).rejects.toThrow(BadRequestException);
  });

  it('validateUser повертає користувача лише для валідного пароля', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashed-password',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      service.validateUser('user@example.com', 'password123'),
    ).resolves.toEqual({
      id: 1,
      email: 'user@example.com',
      password: 'hashed-password',
    });
  });

  it('login видає токени і зберігає hashed refresh token', async () => {
    jwtServiceMock.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-refresh' as never);
    prismaMock.refreshToken.create.mockResolvedValue({ id: 1 });

    const result = await service.login(7, 'user@example.com', 'ADMIN');
    const createCalls = prismaMock.refreshToken.create.mock.calls as Array<
      [
        {
          data: {
            tokenHash: string;
            userId: number;
            expiresAt: Date;
          };
        },
      ]
    >;
    const createCall = createCalls[0]?.[0] as
      | {
          data: {
            tokenHash: string;
            userId: number;
            expiresAt: Date;
          };
        }
      | undefined;

    expect(createCall).toBeDefined();
    const createPayload = createCall as {
      data: {
        tokenHash: string;
        userId: number;
        expiresAt: Date;
      };
    };

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(jwtServiceMock.sign).toHaveBeenNthCalledWith(
      1,
      { sub: 7, email: 'user@example.com', role: 'ADMIN' },
      expect.any(Object),
    );
    expect(createPayload.data.tokenHash).toBe('hashed-refresh');
    expect(createPayload.data.userId).toBe(7);
    expect(createPayload.data.expiresAt).toBeInstanceOf(Date);
    const deleteExpiredCalls = (
      prismaMock.refreshToken.deleteMany.mock as {
        calls: Array<
          [
            {
              where: {
                userId: number;
                expiresAt: { lt: Date };
              };
            },
          ]
        >;
      }
    ).calls;
    const deleteExpiredCall = deleteExpiredCalls[0]?.[0];

    expect(deleteExpiredCall?.where.userId).toBe(7);
    expect(deleteExpiredCall?.where.expiresAt.lt).toBeInstanceOf(Date);
  });

  it('refresh повертає нові токени для валідного refresh token', async () => {
    jwtServiceMock.verify.mockReturnValue({ sub: 5 });
    prismaMock.refreshToken.findMany.mockResolvedValue([
      {
        id: 10,
        tokenHash: 'stored-hash',
        userId: 5,
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
    prismaMock.user.findUnique.mockResolvedValue({
      email: 'user@example.com',
      role: 'ADMIN',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    const loginSpy = jest.spyOn(service, 'login').mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    await expect(service.refresh('valid-refresh-token')).resolves.toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    const cleanupCalls = (
      prismaMock.refreshToken.deleteMany.mock as {
        calls: Array<
          [
            {
              where: {
                userId: number;
                expiresAt: { lt: Date };
              };
            },
          ]
        >;
      }
    ).calls;
    const cleanupCall = cleanupCalls[0]?.[0];

    expect(cleanupCall?.where.userId).toBe(5);
    expect(cleanupCall?.where.expiresAt.lt).toBeInstanceOf(Date);
    expect(loginSpy).toHaveBeenCalledWith(5, 'user@example.com', 'ADMIN');
    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { id: 10 },
    });
  });

  it('refresh кидає UnauthorizedException для невалідного refresh token', async () => {
    jwtServiceMock.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.refresh('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('refresh кидає UnauthorizedException для expired або непридатного refresh payload', async () => {
    jwtServiceMock.verify.mockImplementation(() => {
      throw new Error('expired');
    });
    await expect(service.refresh('expired-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('refresh не згортає transient db failure в UnauthorizedException', async () => {
    jwtServiceMock.verify.mockReturnValue({ sub: 5 });
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.findMany.mockRejectedValue(new Error('db down'));

    await expect(service.refresh('valid-refresh-token')).rejects.toThrow(
      'db down',
    );
  });

  it('revokeRefreshToken видаляє знайдений token hash', async () => {
    jwtServiceMock.verify.mockReturnValue({ sub: 11 });
    prismaMock.refreshToken.findMany.mockResolvedValue([
      { id: 1, tokenHash: 'hash-1' },
      { id: 2, tokenHash: 'hash-2' },
    ]);
    jest
      .mocked(bcrypt.compare)
      .mockResolvedValueOnce(false as never)
      .mockResolvedValueOnce(true as never);

    await expect(service.revokeRefreshToken('refresh-token')).resolves.toBe(
      true,
    );
    const revokeCleanupCalls = (
      prismaMock.refreshToken.deleteMany.mock as {
        calls: Array<
          [
            {
              where: {
                userId: number;
                expiresAt: { lt: Date };
              };
            },
          ]
        >;
      }
    ).calls;
    const revokeCleanupCall = revokeCleanupCalls[0]?.[0];

    expect(revokeCleanupCall?.where.userId).toBe(11);
    expect(revokeCleanupCall?.where.expiresAt.lt).toBeInstanceOf(Date);
    expect(prismaMock.refreshToken.findMany).toHaveBeenCalledWith({
      where: { userId: 11 },
    });
    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { id: 2 },
    });
  });

  it('revokeRefreshToken використовує decode fallback для expired refresh token і чистить лише токени цього userId', async () => {
    const expiredError = new Error('expired');
    expiredError.name = 'TokenExpiredError';
    jwtServiceMock.verify.mockImplementation(() => {
      throw expiredError;
    });
    jwtServiceMock.decode.mockReturnValue({ sub: 22 });
    prismaMock.refreshToken.findMany.mockResolvedValue([
      { id: 7, tokenHash: 'hash-7' },
    ]);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      service.revokeRefreshToken('expired-refresh-token'),
    ).resolves.toBe(true);

    expect(prismaMock.refreshToken.findMany).toHaveBeenCalledWith({
      where: { userId: 22 },
    });
    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { id: 7 },
    });
  });

  it('revokeRefreshToken не робить global scan, якщо не може визначити userId', async () => {
    jwtServiceMock.verify.mockImplementation(() => {
      throw new Error('invalid');
    });
    jwtServiceMock.decode.mockReturnValue(null);

    await expect(service.revokeRefreshToken('bad-token')).resolves.toBe(false);
    expect(jwtServiceMock.decode).not.toHaveBeenCalled();
    expect(prismaMock.refreshToken.findMany).not.toHaveBeenCalled();
    expect(prismaMock.refreshToken.deleteMany).not.toHaveBeenCalled();
  });
});
