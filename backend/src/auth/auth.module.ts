import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { getJwtAccessExpiresIn, getRequiredEnv } from '../config/env';
import { MailModule } from '../mail/mail.module';
import { EmailSecurityService } from './email-security.service';
import { LoginChallengeService } from './login-challenge.service';

type JwtStringValue = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'y'}`;

const jwtAccessSecret = getRequiredEnv('JWT_ACCESS_SECRET');
const jwtAccessExpiresIn = getJwtAccessExpiresIn() as JwtStringValue | number;

// backend/src/auth/auth.module.ts
@Module({
  imports: [
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: jwtAccessSecret,
      signOptions: {
        expiresIn: jwtAccessExpiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    RolesGuard,
    EmailSecurityService,
    LoginChallengeService,
  ],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
