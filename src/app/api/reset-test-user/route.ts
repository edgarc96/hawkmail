import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authClient } from '@/lib/auth-client';

export async function POST(request: NextRequest) {
  try {
    console.log('Resetting test user...');
    
    // First, delete existing test user if exists
    const existingUsers = await db.select()
      .from(user)
      .where(eq(user.email, 'test@example.com'));
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      
      // Delete from account table first (foreign key constraint)
      await db.delete(account)
        .where(eq(account.userId, existingUser.id));
      
      // Then delete from user table
      await db.delete(user)
        .where(eq(user.id, existingUser.id));
      
      console.log('Deleted existing test user');
    }
    
    // Create new test user using Better Auth client
    const { data, error } = await authClient.signUp.email({
      email: 'test@example.com',
      name: 'Test User',
      password: 'testpassword123',
    });
    
    if (error) {
      console.error('Error creating test user:', error);
      return NextResponse.json({
        success: false,
        message: 'Error creating test user',
        error: error.message || 'Unknown error',
      }, { status: 400 });
    }
    
    console.log('Test user created successfully:', data?.user?.id);
    
    return NextResponse.json({
      success: true,
      message: 'Test user reset successfully!',
      user: {
        email: 'test@example.com',
        password: 'testpassword123',
        id: data?.user?.id,
      }
    });
    
  } catch (error) {
    console.error('❌ Error resetting test user:', error);
    return NextResponse.json({
      success: false,
      message: 'Error resetting test user',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send POST request to reset the test user',
    credentials: {
      email: 'test@example.com',
      password: 'testpassword123'
    }
  });
}