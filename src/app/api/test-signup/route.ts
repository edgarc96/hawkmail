import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST() {
  const testEmail = `test_${Date.now()}@example.com`;
  
  try {
    console.log('Attempting to create test user:', testEmail);
    
    const result = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        name: 'Test User',
        password: 'testpassword123',
      },
    });
    
    console.log('Sign up result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: result.user,
    });
  } catch (error: unknown) {
    console.error('Sign up error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorCause = error instanceof Error && 'cause' in error ? String(error.cause) : undefined;
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: errorStack,
      cause: errorCause,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error as object)),
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test signup',
    endpoint: '/api/test-signup',
  });
}
