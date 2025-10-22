import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating test user...');
    
    // Create test user using Better Auth server-side
    const result = await auth.api.signUpEmail({
      body: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword123',
      },
    });
    
    if (!result.user) {
      console.error('Error creating test user: No user returned');
      return NextResponse.json({
        success: false,
        message: 'Error creating test user',
        error: 'No user returned from auth service',
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully!',
      user: {
        email: 'test@example.com',
        password: 'testpassword123',
        id: result.user.id,
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