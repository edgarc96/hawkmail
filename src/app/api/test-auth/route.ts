import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Testing authentication for:', email);
    
    // Check if user exists in database
    const users = await db.select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    
    if (users.length === 0) {
      console.log('User not found in database');
      return NextResponse.json({
        success: false,
        message: 'User not found',
      });
    }
    
    const foundUser = users[0];
    console.log('Found user:', foundUser);
    
    // Check account table for password
    const accounts = await db.select()
      .from(account)
      .where(eq(account.userId, foundUser.id))
      .limit(1);
    
    if (accounts.length === 0) {
      console.log('No account found for user');
      return NextResponse.json({
        success: false,
        message: 'No account found for user',
      });
    }
    
    const foundAccount = accounts[0];
    console.log('Found account:', { ...foundAccount, password: '[REDACTED]' });
    
    // Try to authenticate with Better Auth
    try {
      const authResult = await auth.api.signInEmail({
        body: {
          email,
          password,
        }
      });
      
      console.log('Auth result:', authResult);
      
      return NextResponse.json({
        success: true,
        message: 'Authentication test completed',
        userExists: true,
        accountExists: true,
        authResult: authResult,
      });
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({
        success: false,
        message: 'Authentication failed',
        error: authError instanceof Error ? authError.message : 'Unknown error',
        userExists: true,
        accountExists: true,
      });
    }
    
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send POST request with email and password to test authentication',
    example: {
      email: 'test@example.com',
      password: 'testpassword123'
    }
  });
}