import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParserModule from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { static as expressStatic } from 'express';
import type { RequestHandler } from 'express';
import {
  assertRequiredMailEnv,
  assertRequiredSecurityEnv,
  getAllowedOriginsFromEnv,
  getPort,
  getRequiredEnv,
  getTrustProxyHops,
} from './config/env';
import {
  ensureUploadDirectories,
  getUploadsRootDir,
} from './media/media-storage';
import { createOriginValidationMiddleware } from './security/origin-validation';

const cookieParser = cookieParserModule as unknown as () => RequestHandler;
const logger = new Logger('Bootstrap');
type CorsOriginCallback = (error: Error | null, success?: boolean) => void;

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '');
}

async function bootstrap() {
  getRequiredEnv('DATABASE_URL');
  getRequiredEnv('RECAPTCHA_SECRET_KEY');
  assertRequiredSecurityEnv();
  assertRequiredMailEnv();
  ensureUploadDirectories();

  const app = await NestFactory.create(AppModule);
  const trustProxyHops = getTrustProxyHops();
  if (trustProxyHops > 0) {
    const expressApp = app.getHttpAdapter().getInstance() as {
      set(setting: string, value: number): void;
    };
    expressApp.set('trust proxy', trustProxyHops);
  }

  // Middleware для работы с куки
  app.use(cookieParser());
  app.use('/uploads', expressStatic(getUploadsRootDir()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS with credentials
  const allowedOrigins = getAllowedOriginsFromEnv();
  app.use(createOriginValidationMiddleware(allowedOrigins));
  const corsOrigin = (
    origin: string | undefined,
    callback: CorsOriginCallback,
  ): void => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    logger.warn(`Blocked CORS origin: ${origin}`);
    callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
  };

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = getPort();
  await app.listen(port);
  console.log(`🚀 Backend is running on port ${port}`);
}

void bootstrap();
