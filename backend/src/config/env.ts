type RequiredEnvKey =
  | 'JWT_ACCESS_SECRET'
  | 'JWT_REFRESH_SECRET'
  | 'FRONTEND_URL'
  | 'DATABASE_URL'
  | 'RECAPTCHA_SECRET_KEY';

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

export function getAllowedOriginsFromEnv(): string[] {
  return getRequiredEnv('FRONTEND_URL')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ''));
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
