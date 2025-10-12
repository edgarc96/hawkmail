import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { alerts } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');
    const alertType = searchParams.get('alertType');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const alert = await db.select()
        .from(alerts)
        .where(and(
          eq(alerts.id, parseInt(id)),
          eq(alerts.userId, session.user.id)
        ))
        .limit(1);

      if (alert.length === 0) {
        return NextResponse.json({ 
          error: 'Alert not found',
          code: 'ALERT_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(alert[0], { status: 200 });
    }

    // List with filtering
    const conditions = [eq(alerts.userId, session.user.id)];

    // Filter by userId (additional user filter if provided)
    if (userId) {
      conditions.push(eq(alerts.userId, userId));
    }

    // Filter by isRead
    if (isRead !== null && isRead !== undefined) {
      const isReadBool = isRead === 'true';
      conditions.push(eq(alerts.isRead, isReadBool));
    }

    // Filter by alertType
    if (alertType) {
      const validAlertTypes = ['deadline_approaching', 'overdue', 'high_priority'];
      if (!validAlertTypes.includes(alertType)) {
        return NextResponse.json({ 
          error: 'Invalid alert type. Must be one of: deadline_approaching, overdue, high_priority',
          code: 'INVALID_ALERT_TYPE' 
        }, { status: 400 });
      }
      conditions.push(eq(alerts.alertType, alertType));
    }

    const results = await db.select()
      .from(alerts)
      .where(and(...conditions))
      .orderBy(desc(alerts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if alert exists and belongs to user
    const existingAlert = await db.select()
      .from(alerts)
      .where(and(
        eq(alerts.id, parseInt(id)),
        eq(alerts.userId, session.user.id)
      ))
      .limit(1);

    if (existingAlert.length === 0) {
      return NextResponse.json({ 
        error: 'Alert not found',
        code: 'ALERT_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(alerts)
      .where(and(
        eq(alerts.id, parseInt(id)),
        eq(alerts.userId, session.user.id)
      ))
      .returning();

    return NextResponse.json({
      message: 'Alert deleted successfully',
      alert: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}