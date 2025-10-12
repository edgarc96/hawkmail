import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { responseMetrics } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record fetch by ID
    if (id) {
      const metricId = parseInt(id);
      if (isNaN(metricId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const metric = await db
        .select()
        .from(responseMetrics)
        .where(and(eq(responseMetrics.id, metricId), eq(responseMetrics.userId, user.id)))
        .limit(1);

      if (metric.length === 0) {
        return NextResponse.json(
          { error: 'Metric not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(metric[0], { status: 200 });
    }

    // List with filtering
    const conditions = [eq(responseMetrics.userId, user.id)];

    // Add userId filter if provided (for admin scenarios)
    if (userId) {
      conditions.push(eq(responseMetrics.userId, userId));
    }

    // Add date range filters
    if (startDate) {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        return NextResponse.json(
          { error: 'Invalid startDate format. Use YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' },
          { status: 400 }
        );
      }
      conditions.push(gte(responseMetrics.date, startDate));
    }

    if (endDate) {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return NextResponse.json(
          { error: 'Invalid endDate format. Use YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' },
          { status: 400 }
        );
      }
      conditions.push(lte(responseMetrics.date, endDate));
    }

    const metrics = await db
      .select()
      .from(responseMetrics)
      .where(and(...conditions))
      .orderBy(desc(responseMetrics.date))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}