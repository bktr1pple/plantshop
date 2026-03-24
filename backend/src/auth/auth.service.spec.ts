import { ConflictException, UnauthorizedException } from '@nestjs/common';
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
      update: jest.Mock;
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
        update: jest.fn(),
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

  it('register створює нового користувача з emailVerifiedAt = null', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      name: 'User',
      role: 'USER',
      createdAt: new Date(),
      emailVerifiedAt: null,
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
        emailVerifiedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
    });
    expect(result.created).toBe(true);
  });

  it('register не створює дубль для вже існуючого неверифікованого email', async () => {
    const createdAt = new Date();
    prismaMock.user.findUnique.mockResolvedValue({
      id: 4,
      email: 'user@example.com',
      name: 'Existing',
      role: 'USER',
      createdAt,
      emailVerifiedAt: null,
    });

    await expect(
      service.register('user@example.com', 'password123', 'User'),
    ).resolves.toEqual({
      id: 4,
      email: 'user@example.com',
      name: 'Existing',
      role: 'USER',
      createdAt,
      emailVerifiedAt: null,
      created: false,
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('register кидає ConflictException для вже верифікованого email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      emailVerifiedAt: new Date(),
    });

    await expect(
      service.register('user@example.com', 'password123', 'User'),
    ).rejects.toThrow(ConflictException);
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

  it('login видає токени і зберігає trusted context metadata', async () => {
    jwtServiceMock.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-refresh' as never);
    prismaMock.refreshToken.create.mockResolvedValue({ id: 1 });

    const result = await service.login(7, 'user@example.com', 'ADMIN', {
      trustedContextHash: 'trusted-hash',
      userAgentSummary: 'chrome:macos:desktop',
    });

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    const createCalls = prismaMock.refreshToken.create.mock.calls as Array<
      [
        {
          data: {
            tokenHash: string;
            userId: number;
            trustedContextHash: string | null;
            userAgentSummary: string | null;
          };
        },
      ]
    >;
    const createPayload = createCalls[0]?.[0];

    expect(createPayload).toBeDefined();
    expect(createPayload?.data.tokenHash).toBe('hashed-refresh');
    expect(createPayload?.data.userId).toBe(7);
    expect(createPayload?.data.trustedContextHash).toBe('trusted-hash');
    expect(createPayload?.data.userAgentSummary).toBe('chrome:macos:desktop');
  });

  it('refresh переносить trusted context metadata у нову сесію', async () => {
    jwtServiceMock.verify.mockReturnValue({ sub: 5 });
    prismaMock.refreshToken.findMany.mockResolvedValue([
      {
        id: 10,
        tokenHash: 'stored-hash',
        userId: 5,
        trustedContextHash: 'trusted-hash',
        userAgentSummary: 'chrome:linux:desktop',
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
    expect(loginSpy).toHaveBeenCalledWith(5, 'user@example.com', 'ADMIN', {
      trustedContextHash: 'trusted-hash',
      userAgentSummary: 'chrome:linux:desktop',
    });
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

  it('verifyCurrentPassword перевіряє поточний пароль', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      password: 'stored-password-hash',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(service.verifyCurrentPassword(1, 'secret')).resolves.toBe(
      true,
    );
  });

  it('updatePassword хешує новий пароль і оновлює користувача', async () => {
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

    await service.updatePassword(3, 'new-password');

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { password: 'hashed-password' },
    });
  });
});
