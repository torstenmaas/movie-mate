import { PrismaClient } from './client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create dummy user with preferredLocale='de'
  const dummyUser = await prisma.user.upsert({
    where: { email: 'test@moviemate.app' },
    update: {}, // hier könnte man später Update-Logik einfügen
    create: {
      email: 'test@moviemate.app',
      displayName: 'Test Benutzer',
      hashedPassword: '$argon2id$v=19$m=65536,t=3,p=4$' + randomBytes(32).toString('base64'),
      emailVerified: true,
      preferredLocale: 'de',
    },
  });

  console.log(`✅ Created dummy user: ${dummyUser.email} (locale: ${dummyUser.preferredLocale})`);

  // Create a session for the user
  const session = await prisma.session.create({
    data: {
      userId: dummyUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      data: {
        userAgent: 'seed-script',
        ip: '127.0.0.1',
      },
    },
  });

  console.log(`✅ Created session for user: ${session.id}`);

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
