const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { betterAuth } = require('better-auth');

// Import schema directly
const { user, account } = require('../src/db/schema.ts');

// Create database client
const client = createClient({
  url: process.env.TURSO_CONNECTION_URL || 'file:sqlite.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema: { user, account } });

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Generate a random ID for the test user
    const userId = `test-user-${Date.now()}`;
    
    // Create user in the user table
    await db.insert(user).values({
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: 1, // true
      role: 'admin',
      onboardingCompleted: 1, // true
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });
    
    // Create account in the account table (for password auth)
    const auth = betterAuth({
      baseURL: 'http://localhost:3000',
      database: { provider: 'sqlite' },
    });
    
    // Hash the password
    const hashedPassword = await auth.api.hashPassword({
      password: 'testpassword123',
    });
    
    await db.insert(account).values({
      id: `account-${Date.now()}`,
      userId: userId,
      providerId: 'credential',
      accountId: userId,
      password: hashedPassword.hash,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });
    
    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: testpassword123');
    console.log('User ID:', userId);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();