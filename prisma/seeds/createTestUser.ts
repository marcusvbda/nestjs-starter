import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createUserSeed = async () => {
  console.log('🌱 Seeding roles and admin user...');

  await (prisma as any).role.createMany({
    data: [
      { name: 'ADMIN', description: 'Administrator with full access' },
      { name: 'USER', description: 'Regular user with limited access' },
    ],
    skipDuplicates: true,
  });

  const adminRole = await (prisma as any).role.findUnique({
    where: { name: 'ADMIN' },
  });
  if (!adminRole) throw new Error('ADMIN role not found');

  const adminEmail = 'root@root.com';
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash('roottoor', 10),
        name: 'Admin User',
        userRoles: { create: [{ roleId: adminRole.id }] },
      },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    console.log(`✅ Admin user created: ${user.email}`);
  } else {
    console.log('ℹ️ Admin user already exists, skipping creation.');
  }

  console.log('✅ Seed complete!');
};
