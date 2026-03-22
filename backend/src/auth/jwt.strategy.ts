// backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { StrategyOptionsWithoutRequest } from 'passport-jwt';
import type { VerifiedAccessTokenPayload } from './auth.service';
import { getRequiredEnv } from '../config/env';

type RequestCookies = Partial<Record<'access_token', string>>;
type PassportStrategyCtor = new (...args: [StrategyOptionsWithoutRequest]) => {
  validate(payload: VerifiedAccessTokenPayload): unknown;
};
const jwtAccessSecret = getRequiredEnv('JWT_ACCESS_SECRET');

function extractAccessToken(req?: Request): string | null {
  const cookies = (req?.cookies ?? {}) as RequestCookies;
  return cookies.access_token ?? null;
}

const JwtPassportStrategy = PassportStrategy(Strategy) as PassportStrategyCtor;

@Injectable()
export class JwtStrategy extends JwtPassportStrategy {
  constructor() {
    super({
      jwtFromRequest: extractAccessToken,
      ignoreExpiration: false,
      secretOrKey: jwtAccessSecret,
    });
  }

  validate(payload: VerifiedAccessTokenPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
