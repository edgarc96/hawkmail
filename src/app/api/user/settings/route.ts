import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Obtener configuración del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get settings from database
    const existingSettings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    if (existingSettings.length > 0) {
      const settings = existingSettings[0];
      return NextResponse.json({
        settings: {
          emailNotifications: settings.emailNotifications,
          slackNotifications: settings.slackNotifications,
          autoAssignment: settings.autoAssignment,
          slaAlerts: settings.slaAlerts,
          weeklyReports: settings.weeklyReports,
        }
      });
    }

    // Return default settings if no record exists
    const defaultSettings = {
      emailNotifications: true,
      slackNotifications: false,
      autoAssignment: true,
      slaAlerts: true,
      weeklyReports: true,
    };

    return NextResponse.json({
      settings: defaultSettings
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar configuración del usuario
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { settings } = body;

    // Check if settings exist
    const existingSettings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    if (existingSettings.length > 0) {
      // Update existing settings
      await db.update(userSettings)
        .set({
          emailNotifications: settings.emailNotifications,
          slackNotifications: settings.slackNotifications,
          autoAssignment: settings.autoAssignment,
          slaAlerts: settings.slaAlerts,
          weeklyReports: settings.weeklyReports,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, session.user.id));
    } else {
      // Create new settings
      await db.insert(userSettings).values({
        userId: session.user.id,
        emailNotifications: settings.emailNotifications,
        slackNotifications: settings.slackNotifications,
        autoAssignment: settings.autoAssignment,
        slaAlerts: settings.slaAlerts,
        weeklyReports: settings.weeklyReports,
      });
    }

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
