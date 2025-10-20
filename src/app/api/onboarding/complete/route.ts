import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-current-user';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface OnboardingData {
  companyName: string;
  teamSize: string;
  emailProvider: string;
  targetResponseTime: string;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
  notifications: {
    email: boolean;
    slack: boolean;
    desktop: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const onboardingData: OnboardingData = await req.json();

    // Validate required fields
    if (!onboardingData.companyName || !onboardingData.teamSize || !onboardingData.emailProvider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update user with onboarding data
    await db
      .update(user)
      .set({
        companyName: onboardingData.companyName,
        teamSize: onboardingData.teamSize,
        emailProvider: onboardingData.emailProvider,
        targetResponseTime: parseInt(onboardingData.targetResponseTime),
        businessHoursStart: onboardingData.businessHours.start,
        businessHoursEnd: onboardingData.businessHours.end,
        timezone: onboardingData.businessHours.timezone,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id));

    // For now, we'll store the data in a simple way
    // In a real implementation, you might want to create a separate onboarding table
    
    console.log('Onboarding completed for user:', currentUser.id);
    console.log('Onboarding data:', onboardingData);

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully' 
    });

  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}