import { NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function POST() {
  const testId = `test_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  
  const results: string[] = [];
  
  try {
    // Step 1: Test raw SQL insert to user table
    results.push('Step 1: Testing raw SQL insert to user table...');
    
    await db.run(sql`
      INSERT INTO user (id, name, email, email_verified, created_at, updated_at)
      VALUES (${testId}, 'Test User', ${testEmail}, 0, ${Math.floor(Date.now() / 1000)}, ${Math.floor(Date.now() / 1000)})
    `);
    results.push('Step 1: SUCCESS - User inserted via raw SQL');
    
    // Step 2: Test raw SQL insert to account table
    results.push('Step 2: Testing raw SQL insert to account table...');
    const accountId = `acc_${Date.now()}`;
    
    await db.run(sql`
      INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
      VALUES (${accountId}, ${testEmail}, 'credential', ${testId}, 'hashed_password', ${Math.floor(Date.now() / 1000)}, ${Math.floor(Date.now() / 1000)})
    `);
    results.push('Step 2: SUCCESS - Account inserted via raw SQL');
    
    // Cleanup
    await db.run(sql`DELETE FROM account WHERE id = ${accountId}`);
    await db.run(sql`DELETE FROM user WHERE id = ${testId}`);
    results.push('Cleanup: SUCCESS');
    
    // Step 3: Test Drizzle ORM insert
    results.push('Step 3: Testing Drizzle ORM insert...');
    const testId2 = `drizzle_${Date.now()}`;
    const testEmail2 = `drizzle_${Date.now()}@example.com`;
    
    await db.insert(user).values({
      id: testId2,
      name: 'Drizzle Test',
      email: testEmail2,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    results.push('Step 3: SUCCESS - User inserted via Drizzle ORM');
    
    // Step 4: Test Drizzle account insert
    results.push('Step 4: Testing Drizzle account insert...');
    const accountId2 = `drizzle_acc_${Date.now()}`;
    
    await db.insert(account).values({
      id: accountId2,
      accountId: testEmail2,
      providerId: 'credential',
      userId: testId2,
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    results.push('Step 4: SUCCESS - Account inserted via Drizzle ORM');
    
    // Cleanup
    await db.run(sql`DELETE FROM account WHERE id = ${accountId2}`);
    await db.run(sql`DELETE FROM user WHERE id = ${testId2}`);
    results.push('Final cleanup: SUCCESS');
    
    return NextResponse.json({
      success: true,
      message: 'All database tests passed!',
      results,
    });
    
  } catch (error: unknown) {
    console.error('Database test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: errorStack,
      results,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error as object)),
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test database operations',
    endpoint: '/api/test-signup',
  });
}
