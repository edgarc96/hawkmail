import { NextRequest, NextResponse } from 'next/server';
import { authClient } from '@/lib/auth-client';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating test user...');
    
    // Create test user using Better Auth
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
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully!',
      user: {
        email: 'test@example.com',
        password: 'testpassword123',
        id: data?.user?.id,
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    return NextResponse.json({
      success: false,
      message: 'Error creating test user',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}