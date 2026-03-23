import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error('Usage: npm run promote:admin -- user@example.com');
  }

  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, role: true },
    });

    console.log(`User ${user.email} promoted to ${user.role}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
