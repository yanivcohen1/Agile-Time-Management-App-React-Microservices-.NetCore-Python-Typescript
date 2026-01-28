// Set environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.AUTH_ADMIN_USERNAME = process.env.AUTH_ADMIN_USERNAME ?? 'admin';
process.env.AUTH_ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD ?? 'admin-secret';
process.env.AUTH_USER_USERNAME = process.env.AUTH_USER_USERNAME ?? 'user';
process.env.AUTH_USER_PASSWORD = process.env.AUTH_USER_PASSWORD ?? 'user-secret';
process.env.JWT_ACCESS_TTL_SECONDS = process.env.JWT_ACCESS_TTL_SECONDS ?? '3600';
process.env.PORT = process.env.PORT ?? '0';

beforeAll(async () => {
  // Connect to the in-memory database
  const db = await import('../src/config/database.ts');
  await db.connectDatabase();
  const em = db.orm.em.fork();

  // Create test users
  const { User } = await import('../src/models/User.ts');
  const { hashPassword } = await import('../src/lib/password.ts');

  // Clear existing users to ensure a clean state
  await em.nativeDelete(User, {});

  const users = [
    { username: process.env.AUTH_ADMIN_USERNAME!, password: await hashPassword(process.env.AUTH_ADMIN_PASSWORD!), role: 'admin' as const },
    { username: process.env.AUTH_USER_USERNAME!, password: await hashPassword(process.env.AUTH_USER_PASSWORD!), role: 'user' as const }
  ];

  for (const userData of users) {
    try {
      const existingUser = await em.findOne(User, { username: userData.username });
      if (existingUser) {
        continue;
      }
      const user = em.create(User, userData);
      await em.persistAndFlush(user);
    } catch (error) {
      console.error(`Error creating test user ${userData.username}:`, error);
    }
  }
});

afterAll(async () => {
  // Disconnect from database
  const { disconnectDatabase } = await import('../src/config/database.ts');
  await disconnectDatabase();

  // Mongo server cleanup is handled in mongo-setup.ts
});
