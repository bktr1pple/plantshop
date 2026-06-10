import { config as loadDotenv } from 'dotenv';

loadDotenv({ quiet: true });

type RequiredEnvKey =
  | 'JWT_ACCESS_SECRET'
  | 'JWT_REFRESH_SECRET'
  | 'REFRESH_TOKEN_DIGEST_SECRET'
  | 'FRONTEND_URL'
  | 'DATABASE_URL'
  | 'RECAPTCHA_SECRET_KEY'
  | 'MAIL_HOST'
  | 'MAIL_USER'
  | 'MAIL_PASSWORD'
  | 'MAIL_FROM_EMAIL';

export function getRequiredEnv(name: RequiredEnvKey): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getJwtAccessExpiresIn(): string {
  return process.env.JWT_ACCESS_EXPIRES_IN?.trim() || '15m';
}

export function getJwtRefreshExpiresIn(): string {
  return process.env.JWT_REFRESH_EXPIRES_IN?.trim() || '7d';
}

const DURATION_PATTERN = /^(\d+)(ms|s|m|h|d|y)$/;

export function parseDurationMilliseconds(
  duration: string,
  variableName: string,
): number {
  const match = DURATION_PATTERN.exec(duration.trim());
  if (!match) {
    throw new Error(
      `Invalid ${variableName} value: expected formats such as 15m, 7d or 1y`,
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    y: 31_536_000_000,
  };
  const milliseconds = amount * multipliers[unit];

  if (!Number.isSafeInteger(milliseconds) || milliseconds <= 0) {
    throw new Error(`Invalid ${variableName} value: ${duration}`);
  }

  return milliseconds;
}

export function getJwtAccessTtlMilliseconds(): number {
  return parseDurationMilliseconds(
    getJwtAccessExpiresIn(),
    'JWT_ACCESS_EXPIRES_IN',
  );
}

export function getJwtRefreshTtlMilliseconds(): number {
  return parseDurationMilliseconds(
    getJwtRefreshExpiresIn(),
    'JWT_REFRESH_EXPIRES_IN',
  );
}

function assertSecret(name: RequiredEnvKey): void {
  const secret = getRequiredEnv(name);
  if (secret.length < 32 || /replace_me/i.test(secret)) {
    throw new Error(
      `${name} must be a non-placeholder secret of at least 32 characters`,
    );
  }
}

export function assertRequiredSecurityEnv(): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  assertSecret('JWT_ACCESS_SECRET');
  assertSecret('JWT_REFRESH_SECRET');
  assertSecret('REFRESH_TOKEN_DIGEST_SECRET');
  getJwtAccessTtlMilliseconds();
  getJwtRefreshTtlMilliseconds();
}

export function getAllowedOriginsFromEnv(): string[] {
  return getRequiredEnv('FRONTEND_URL')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ''));
}

export function assertRequiredMailEnv(): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  getRequiredEnv('MAIL_HOST');
  getRequiredEnv('MAIL_USER');
  getRequiredEnv('MAIL_PASSWORD');
  getRequiredEnv('MAIL_FROM_EMAIL');
}

export function getPort(): number {
  const rawPort = process.env.PORT?.trim();
  if (!rawPort) {
    return 3001;
  }

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${rawPort}`);
  }

  return port;
}

export function getTrustProxyHops(): number {
  const rawValue = process.env.TRUST_PROXY_HOPS?.trim();
  if (!rawValue) {
    return 0;
  }

  const hops = Number(rawValue);
  if (!Number.isInteger(hops) || hops < 0 || hops > 10) {
    throw new Error(`Invalid TRUST_PROXY_HOPS value: ${rawValue}`);
  }

  return hops;
}

export function getPublicApiBaseUrl(): string {
  const explicit =
    process.env.PUBLIC_API_URL?.trim() ||
    process.env.BACKEND_PUBLIC_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }

  return `http://localhost:${getPort()}`;
}
