import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { createUserSeed } from './createTestUser';

const prisma = new PrismaClient();

async function main() {
  await createUserSeed();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
