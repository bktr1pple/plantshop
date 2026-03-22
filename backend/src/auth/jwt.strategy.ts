// backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          console.log('🔐 JWT Strategy - All cookies:', req?.cookies);
          console.log(
            '🔐 JWT Strategy - Access token:',
            req?.cookies?.access_token,
          );
          return req?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('🔐 JWT Strategy - Payload received:', payload);

    if (!payload || !payload.sub) {
      console.log('🔐 JWT Strategy - Invalid payload');
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
