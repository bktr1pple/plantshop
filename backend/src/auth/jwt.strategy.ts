// backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { StrategyOptionsWithoutRequest } from 'passport-jwt';
import type { VerifiedAccessTokenPayload } from './auth.service';
import { getRequiredEnv } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

type RequestCookies = Partial<Record<'access_token', string>>;
type PassportStrategyCtor = new (...args: [StrategyOptionsWithoutRequest]) => {
  validate(payload: VerifiedAccessTokenPayload): unknown;
};
const jwtAccessSecret = getRequiredEnv('JWT_ACCESS_SECRET');

function extractAccessToken(req?: Request): string | null {
  const cookies = (req?.cookies ?? {}) as RequestCookies;
  return cookies.access_token ?? null;
}

// PassportStrategy loses the concrete constructor type exposed by passport-jwt.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const JwtPassportStrategy = PassportStrategy(Strategy) as PassportStrategyCtor;

@Injectable()
export class JwtStrategy extends JwtPassportStrategy {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: extractAccessToken,
      ignoreExpiration: false,
      secretOrKey: jwtAccessSecret,
    });
  }

  async validate(payload: VerifiedAccessTokenPayload) {
    if (!payload || !payload.sub || payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
      },
    });

    if (!user?.emailVerifiedAt) {
      throw new UnauthorizedException('User is unavailable');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
