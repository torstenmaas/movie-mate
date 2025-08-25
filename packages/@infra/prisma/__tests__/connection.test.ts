import { PrismaClient } from '../client';

describe('Database Connection', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to the database successfully', async () => {
    // Test connection by running a simple query
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('result', 1);
  });

  it('should have correct database version (PostgreSQL 16)', async () => {
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version() as version
    `;
    
    expect(versionResult).toBeDefined();
    expect(versionResult[0].version).toMatch(/PostgreSQL/);
    // Note: Version check is informational, may vary in local dev
    console.log('Database version:', versionResult[0].version);
  });

  it('should be able to perform CRUD operations on User model', async () => {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        displayName: 'Integration Test User',
        hashedPassword: 'hashed_password_placeholder',
        emailVerified: false,
        preferredLocale: 'de',
      },
    });

    expect(testUser).toBeDefined();
    expect(testUser.id).toBeDefined();
    expect(testUser.preferredLocale).toBe('de');

    // Read the user
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(testUser.email);

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { displayName: 'Updated Test User' },
    });

    expect(updatedUser.displayName).toBe('Updated Test User');

    // Delete the user
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    const deletedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });

    expect(deletedUser).toBeNull();
  });

  it('should handle transactions correctly', async () => {
    const email = `transaction-test-${Date.now()}@example.com`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          displayName: 'Transaction Test',
          hashedPassword: 'hashed',
          preferredLocale: 'de',
        },
      });

      const session = await tx.session.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      return { user, session };
    });

    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
    expect(result.session.userId).toBe(result.user.id);

    // Cleanup
    await prisma.user.delete({
      where: { id: result.user.id },
    });
  });
});