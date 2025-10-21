import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

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

    // Por ahora, devolver configuración por defecto
    // TODO: Almacenar en la base de datos
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

    // TODO: Guardar en la base de datos
    console.log('Saving settings for user:', session.user.id, settings);

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
