import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParserModule from 'cookie-parser';
import { Logger } from '@nestjs/common';
import type { RequestHandler } from 'express';

const cookieParser = cookieParserModule as unknown as () => RequestHandler;
const logger = new Logger('Bootstrap');
type CorsOriginCallback = (error: Error | null, success?: boolean) => void;

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '');
}

function getAllowedOrigins(): string[] {
  const rawOrigins = process.env.FRONTEND_URL?.split(',') ?? [];
  return rawOrigins
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware для работы с куки
  app.use(cookieParser());

  // Enable CORS with credentials
  const allowedOrigins = getAllowedOrigins();
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`🚀 Backend is running on port ${port}`);
}

void bootstrap();
