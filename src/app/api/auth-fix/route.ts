import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account, session } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing authentication system...');
    
    // Clean up all existing data for test@example.com
    const existingUsers = await db.select()
      .from(user)
      .where(eq(user.email, 'test@example.com'));
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log('🗑️  Cleaning up existing user data...');
      
      // Delete sessions first
      await db.delete(session)
        .where(eq(session.userId, existingUser.id));
      
      // Delete accounts
      await db.delete(account)
        .where(eq(account.userId, existingUser.id));
      
      // Delete user
      await db.delete(user)
        .where(eq(user.id, existingUser.id));
      
      console.log('✅ Cleaned up existing user data');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Authentication system cleaned up successfully!',
      instructions: {
        step1: 'Go to http://localhost:3000/register',
        step2: 'Create a new account with email: test@example.com',
        step3: 'Use password: testpassword123',
        step4: 'Try to login at http://localhost:3000/login'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing authentication:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fixing authentication system',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send POST request to fix the authentication system',
    problem: 'The existing test user was created with incompatible password hashing',
    solution: 'This endpoint will clean up the existing user so you can create a fresh one'
  });
}