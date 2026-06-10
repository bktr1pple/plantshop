import { PrismaClient } from '../generated/prisma/client';
import { createPrismaAdapter } from './prisma-adapter';

export const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    adapter: createPrismaAdapter(),
  });
