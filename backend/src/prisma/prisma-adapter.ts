import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { getRequiredEnv } from '../config/env';

const parsePositiveInteger = (
  value: string | null,
  fallback: number,
): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const createPrismaAdapter = (): PrismaMariaDb => {
  const databaseUrl = new URL(getRequiredEnv('DATABASE_URL'));

  if (!['mysql:', 'mariadb:'].includes(databaseUrl.protocol)) {
    throw new Error(
      'DATABASE_URL must use the mysql:// or mariadb:// protocol.',
    );
  }

  const database = decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, ''));

  if (!databaseUrl.hostname || !database) {
    throw new Error('DATABASE_URL must include a host and database name.');
  }

  return new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: parsePositiveInteger(databaseUrl.port, 3306),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database,
    connectionLimit: parsePositiveInteger(
      databaseUrl.searchParams.get('connection_limit'),
      10,
    ),
    connectTimeout: 5_000,
    acquireTimeout: 10_000,
    idleTimeout: 300,
  });
};
