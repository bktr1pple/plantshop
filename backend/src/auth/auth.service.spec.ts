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
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let jwtServiceMock: {
    sign: jest.Mock;
    verify: jest.Mock;
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
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwtServiceMock = {
      sign: jest.fn(),
      verify: jest.fn(),
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
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user@example.com',
      name: 'User',
      createdAt: expect.any(Date),
    });
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

    const result = await service.login(7, 'user@example.com');

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(prismaMock.refreshToken.create).toHaveBeenCalledWith({
      data: {
        tokenHash: 'hashed-refresh',
        userId: 7,
        expiresAt: expect.any(Date),
      },
    });
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
    prismaMock.user.findUnique.mockResolvedValue({ email: 'user@example.com' });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jest.spyOn(service, 'login').mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    await expect(service.refresh('valid-refresh-token')).resolves.toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(service.login).toHaveBeenCalledWith(5, 'user@example.com');
  });

  it('refresh кидає UnauthorizedException для невалідного refresh token', async () => {
    jwtServiceMock.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.refresh('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('revokeRefreshToken видаляє знайдений token hash', async () => {
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
    expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
      where: { id: 2 },
    });
  });
});
