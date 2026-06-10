import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
    };
  };
  let strategy: JwtStrategy;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
    };
    strategy = new JwtStrategy(prismaMock as never);
  });

  it('повертає актуальну роль із бази даних замість застарілої ролі з JWT', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      role: 'USER',
      emailVerifiedAt: new Date(),
    });

    await expect(
      strategy.validate({
        sub: 7,
        email: 'user@example.com',
        role: 'ADMIN',
        sid: 'family-1',
        jti: 'access-jti',
        typ: 'access',
      }),
    ).resolves.toEqual({
      userId: 7,
      email: 'user@example.com',
      role: 'USER',
    });
  });

  it('відхиляє токен видаленого або неверифікованого користувача', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({
        sub: 7,
        email: 'user@example.com',
        role: 'USER',
        sid: 'family-1',
        jti: 'access-jti',
        typ: 'access',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('відхиляє payload іншого типу', async () => {
    await expect(
      strategy.validate({
        sub: 7,
        email: 'user@example.com',
        role: 'USER',
        sid: 'family-1',
        jti: 'access-jti',
        typ: 'refresh' as 'access',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
