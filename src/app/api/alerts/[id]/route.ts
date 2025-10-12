import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { alerts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { isRead, alertType, message } = body;

    if (alertType !== undefined) {
      const validAlertTypes = ['deadline_approaching', 'overdue', 'high_priority'];
      if (!validAlertTypes.includes(alertType)) {
        return NextResponse.json(
          {
            error: 'Invalid alert type. Must be one of: deadline_approaching, overdue, high_priority',
            code: 'INVALID_ALERT_TYPE',
          },
          { status: 400 }
        );
      }
    }

    const existingAlert = await db
      .select()
      .from(alerts)
      .where(and(eq(alerts.id, parseInt(id)), eq(alerts.userId, user.id)))
      .limit(1);

    if (existingAlert.length === 0) {
      return NextResponse.json(
        { error: 'Alert not found', code: 'ALERT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updateData: {
      isRead?: boolean;
      alertType?: string;
      message?: string;
    } = {};

    if (isRead !== undefined) {
      updateData.isRead = isRead;
    }
    if (alertType !== undefined) {
      updateData.alertType = alertType;
    }
    if (message !== undefined) {
      updateData.message = message.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'No valid fields provided for update',
          code: 'NO_UPDATE_FIELDS',
        },
        { status: 400 }
      );
    }

    const updated = await db
      .update(alerts)
      .set(updateData)
      .where(and(eq(alerts.id, parseInt(id)), eq(alerts.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update alert', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}