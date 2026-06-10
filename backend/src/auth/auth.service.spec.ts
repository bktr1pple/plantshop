import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { createHash, createHmac } from 'crypto';
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
    pendingRegistration: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
      findMany: jest.Mock;
      deleteMany: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
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
      pendingRegistration: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      refreshToken: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      $transaction: jest.fn(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      ),
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
    delete process.env.MAX_REFRESH_SESSIONS_PER_USER;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('register створює pending registration замість реального User', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.pendingRegistration.findUnique.mockResolvedValue(null);
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

    const result = await service.register(
      'user@example.com',
      'password123',
      'User',
    );

    const createCalls = prismaMock.pendingRegistration.create.mock
      .calls as Array<
      [
        {
          data: {
            email: string;
            passwordHash: string;
            name: string | null;
            tokenHash: string;
            expiresAt: Date;
          };
        },
      ]
    >;
    const createArgs = createCalls[0]?.[0];

    expect(createArgs?.data.email).toBe('user@example.com');
    expect(createArgs?.data.passwordHash).toBe('hashed-password');
    expect(createArgs?.data.name).toBe('User');
    expect(typeof createArgs?.data.tokenHash).toBe('string');
    expect(createArgs?.data.expiresAt).toBeInstanceOf(Date);
    expect(result.kind).toBe('pending_registration');
    if (result.kind !== 'pending_registration') {
      throw new Error('Очікувався pending_registration result');
    }
    expect(result.email).toBe('user@example.com');
    expect(result.reusedExisting).toBe(false);
    expect(typeof result.rawToken).toBe('string');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('register повертає legacy unverified user без дубля', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 4,
      email: 'user@example.com',
      name: 'Existing',
      role: 'USER',
      emailVerifiedAt: null,
    });

    await expect(
      service.register('user@example.com', 'password123', 'User'),
    ).resolves.toEqual({
      kind: 'legacy_unverified_user',
      user: {
        id: 4,
        email: 'user@example.com',
        name: 'Existing',
        role: 'USER',
        emailVerifiedAt: null,
      },
    });
    expect(prismaMock.pendingRegistration.create).not.toHaveBeenCalled();
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

  it('validatePendingRegistration повертає pending user лише для валідного пароля', async () => {
    prismaMock.pendingRegistration.findUnique.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      name: 'Pending',
      passwordHash: 'hashed-password',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      service.validatePendingRegistration('user@example.com', 'password123'),
    ).resolves.toEqual({
      id: 7,
      email: 'user@example.com',
      name: 'Pending',
    });
  });

  it('resendPendingRegistration створює новий token для активної незавершеної реєстрації', async () => {
    prismaMock.pendingRegistration.findUnique.mockResolvedValue({
      id: 9,
      email: 'user@example.com',
      name: 'Pending',
      tokenHash: 'old-token-hash',
      passwordHash: 'hashed-password',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      updatedAt: new Date(Date.now() - 120_000),
    });

    const result = await service.resendPendingRegistration('user@example.com');

    const updateCalls = prismaMock.pendingRegistration.update.mock
      .calls as Array<
      [
        {
          where: { id: number };
          data: {
            tokenHash: string;
            expiresAt: Date;
            consumedAt: null;
          };
        },
      ]
    >;
    const updateArgs = updateCalls[0]?.[0];

    expect(result.status).toBe('queued');
    expect(typeof result.rawToken).toBe('string');
    expect(updateArgs?.where.id).toBe(9);
    expect(typeof updateArgs?.data.tokenHash).toBe('string');
    expect(updateArgs?.data.expiresAt).toBeInstanceOf(Date);
    expect(updateArgs?.data.consumedAt).toBeNull();
  });

  it('consumePendingRegistrationToken створює реального User лише після verify token', async () => {
    const rawToken = 'a'.repeat(64);
    prismaMock.pendingRegistration.findUnique.mockResolvedValue({
      id: 11,
      email: 'pending@example.com',
      name: 'Pending User',
      passwordHash: 'hashed-password',
      tokenHash: createHash('sha256').update(rawToken).digest('hex'),
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: 21 });

    await expect(
      service.consumePendingRegistrationToken(rawToken),
    ).resolves.toEqual({
      status: 'verified',
      email: 'pending@example.com',
      userId: 21,
    });
    const userCreateCalls = prismaMock.user.create.mock.calls as Array<
      [
        {
          data: {
            email: string;
            password: string;
            name: string | null;
            role: string;
            emailVerifiedAt: Date;
          };
          select: { id: true };
        },
      ]
    >;
    const pendingUpdateCalls = prismaMock.pendingRegistration.updateMany.mock
      .calls as Array<
      [
        {
          where: { id: number };
          data: { consumedAt: Date };
        },
      ]
    >;
    const userCreateArgs = userCreateCalls[0]?.[0];
    const pendingUpdateArgs = pendingUpdateCalls[0]?.[0];

    expect(userCreateArgs?.data.email).toBe('pending@example.com');
    expect(userCreateArgs?.data.password).toBe('hashed-password');
    expect(userCreateArgs?.data.name).toBe('Pending User');
    expect(userCreateArgs?.data.role).toBe('USER');
    expect(userCreateArgs?.data.emailVerifiedAt).toBeInstanceOf(Date);
    expect(userCreateArgs?.select).toEqual({ id: true });
    expect(pendingUpdateArgs?.where.id).toBe(11);
    expect(pendingUpdateArgs?.data.consumedAt).toBeInstanceOf(Date);
  });

  it('login видає токени з jti/family і зберігає HMAC digest', async () => {
    jwtServiceMock.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
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
            jti: string;
            tokenDigest: string;
            familyId: string;
            userId: number;
            trustedContextHash: string | null;
            userAgentSummary: string | null;
          };
        },
      ]
    >;
    const createPayload = createCalls[0]?.[0];

    expect(createPayload).toBeDefined();
    expect(createPayload?.data.jti).toEqual(expect.any(String));
    expect(createPayload?.data.familyId).toEqual(expect.any(String));
    expect(createPayload?.data.tokenDigest).toBe(
      createHmac('sha256', 'test-refresh-digest')
        .update('refresh-token')
        .digest('hex'),
    );
    expect(createPayload?.data.userId).toBe(7);
    expect(createPayload?.data.trustedContextHash).toBe('trusted-hash');
    expect(createPayload?.data.userAgentSummary).toBe('chrome:macos:desktop');
  });

  it('login відкликає найстаріші активні refresh sessions понад ліміт', async () => {
    process.env.MAX_REFRESH_SESSIONS_PER_USER = '3';
    jwtServiceMock.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    prismaMock.refreshToken.findMany.mockResolvedValue([{ id: 7 }, { id: 6 }]);
    prismaMock.refreshToken.create.mockResolvedValue({ id: 8 });

    await service.login(7, 'user@example.com', 'USER');

    expect(prismaMock.refreshToken.findMany).toHaveBeenCalledWith({
      where: {
        userId: 7,
        revokedAt: null,
        expiresAt: { gt: expect.any(Date) as Date },
      },
      orderBy: { createdAt: 'desc' },
      skip: 2,
      select: { id: true },
    });
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [7, 6],
        },
      },
      data: {
        revokedAt: expect.any(Date) as Date,
      },
    });

    delete process.env.MAX_REFRESH_SESSIONS_PER_USER;
  });

  it('refresh атомарно ротатує token і переносить trusted metadata', async () => {
    const rawToken = 'valid-refresh-token';
    jwtServiceMock.verify.mockReturnValue({
      sub: 5,
      jti: 'old-jti',
      familyId: 'family-1',
      typ: 'refresh',
    });
    jwtServiceMock.sign
      .mockReturnValueOnce('new-refresh')
      .mockReturnValueOnce('new-access');
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: 10,
      jti: 'old-jti',
      tokenDigest: createHmac('sha256', 'test-refresh-digest')
        .update(rawToken)
        .digest('hex'),
      familyId: 'family-1',
      userId: 5,
      trustedContextHash: 'trusted-hash',
      userAgentSummary: 'chrome:linux:desktop',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      replacedByTokenId: null,
      user: {
        id: 5,
        email: 'user@example.com',
        role: 'ADMIN',
      },
    });
    prismaMock.refreshToken.create.mockResolvedValue({ id: 11 });

    await expect(service.refresh(rawToken)).resolves.toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(prismaMock.refreshToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        familyId: 'family-1',
        userId: 5,
        trustedContextHash: 'trusted-hash',
        userAgentSummary: 'chrome:linux:desktop',
      }) as unknown,
      select: { id: true },
    });
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 10,
        jti: 'old-jti',
        familyId: 'family-1',
        revokedAt: null,
      }) as unknown,
      data: expect.objectContaining({
        revokedAt: expect.any(Date) as Date,
        replacedByTokenId: 11,
      }) as unknown,
    });
  });

  it('повторне використання rotated refresh відкликає всю token family', async () => {
    const rawToken = 'reused-refresh-token';
    jwtServiceMock.verify.mockReturnValue({
      sub: 5,
      jti: 'old-jti',
      familyId: 'family-1',
      typ: 'refresh',
    });
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: 10,
      jti: 'old-jti',
      tokenDigest: createHmac('sha256', 'test-refresh-digest')
        .update(rawToken)
        .digest('hex'),
      familyId: 'family-1',
      userId: 5,
      revokedAt: new Date(),
      replacedByTokenId: 11,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 5,
        email: 'user@example.com',
        role: 'USER',
      },
    });

    await expect(service.refresh(rawToken)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 5,
        familyId: 'family-1',
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date) as Date,
      },
    });
  });

  it('конкурентна ротація одного refresh token відкликає всю token family', async () => {
    const rawToken = 'concurrent-refresh-token';
    jwtServiceMock.verify.mockReturnValue({
      sub: 5,
      jti: 'old-jti',
      familyId: 'family-1',
      typ: 'refresh',
    });
    jwtServiceMock.sign.mockReturnValue('next-token');
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: 10,
      jti: 'old-jti',
      tokenDigest: createHmac('sha256', 'test-refresh-digest')
        .update(rawToken)
        .digest('hex'),
      familyId: 'family-1',
      userId: 5,
      trustedContextHash: null,
      userAgentSummary: null,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      replacedByTokenId: null,
      user: {
        id: 5,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    prismaMock.refreshToken.create.mockResolvedValue({ id: 12 });
    prismaMock.refreshToken.updateMany
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });

    await expect(service.refresh(rawToken)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(prismaMock.refreshToken.updateMany).toHaveBeenLastCalledWith({
      where: {
        userId: 5,
        familyId: 'family-1',
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date) as Date,
      },
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

  it('verifyAccessToken відхиляє refresh payload у access cookie', () => {
    jwtServiceMock.verify.mockReturnValue({
      sub: 5,
      jti: 'refresh-jti',
      familyId: 'family-1',
      typ: 'refresh',
    });

    expect(() => service.verifyAccessToken('wrong-token-type')).toThrow(
      UnauthorizedException,
    );
  });

  it('revokeRefreshToken відкликає лише токен із валідним digest', async () => {
    const rawToken = 'refresh-token';
    jwtServiceMock.verify.mockReturnValue({
      sub: 5,
      jti: 'refresh-jti',
      familyId: 'family-1',
      typ: 'refresh',
    });
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: 20,
      userId: 5,
      familyId: 'family-1',
      tokenDigest: createHmac('sha256', 'test-refresh-digest')
        .update(rawToken)
        .digest('hex'),
      revokedAt: null,
    });

    await expect(service.revokeRefreshToken(rawToken)).resolves.toBe(true);
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        id: 20,
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date) as Date,
      },
    });
  });

  it('logoutAll відкликає всі активні refresh sessions користувача', async () => {
    await service.logoutAll(5);

    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 5,
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date) as Date,
      },
    });
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
