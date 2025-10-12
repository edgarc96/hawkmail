import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails, responseMetrics } from '@/db/schema';
import { eq, and, gte, desc, count, avg, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = session.user;

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    // Validate days parameter
    if (isNaN(days) || days < 1) {
      return NextResponse.json(
        { error: 'Days parameter must be a positive number', code: 'INVALID_DAYS' },
        { status: 400 }
      );
    }

    // Calculate date threshold for metrics (YYYY-MM-DD format)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    const dateThresholdStr = dateThreshold.toISOString().split('T')[0];

    // Get total emails count for user
    const totalEmailsResult = await db
      .select({ count: count() })
      .from(emails)
      .where(eq(emails.userId, user.id));
    const totalEmails = totalEmailsResult[0]?.count || 0;

    // Get pending emails count
    const pendingEmailsResult = await db
      .select({ count: count() })
      .from(emails)
      .where(and(eq(emails.userId, user.id), eq(emails.status, 'pending')));
    const pendingEmails = pendingEmailsResult[0]?.count || 0;

    // Get replied emails count
    const repliedEmailsResult = await db
      .select({ count: count() })
      .from(emails)
      .where(and(eq(emails.userId, user.id), eq(emails.status, 'replied')));
    const repliedEmails = repliedEmailsResult[0]?.count || 0;

    // Get overdue emails count
    const overdueEmailsResult = await db
      .select({ count: count() })
      .from(emails)
      .where(and(eq(emails.userId, user.id), eq(emails.status, 'overdue')));
    const overdueEmails = overdueEmailsResult[0]?.count || 0;

    // Get high priority emails count
    const highPriorityEmailsResult = await db
      .select({ count: count() })
      .from(emails)
      .where(and(eq(emails.userId, user.id), eq(emails.priority, 'high')));
    const highPriorityEmails = highPriorityEmailsResult[0]?.count || 0;

    // Get unresolved emails count
    const unresolvedEmailsResult = await db
      .select({ count: count() })
      .from(emails)
      .where(and(eq(emails.userId, user.id), eq(emails.isResolved, false)));
    const unresolvedEmails = unresolvedEmailsResult[0]?.count || 0;

    // Get average reply time from response_metrics for last N days
    const avgReplyTimeResult = await db
      .select({ 
        avgReplyTime: sql<number>`AVG(${responseMetrics.avgFirstReplyTimeMinutes})`
      })
      .from(responseMetrics)
      .where(
        and(
          eq(responseMetrics.userId, user.id),
          gte(responseMetrics.date, dateThresholdStr)
        )
      );
    const avgReplyTimeMinutes = Math.round(avgReplyTimeResult[0]?.avgReplyTime || 0);

    // Get average resolution rate from response_metrics for last N days
    const avgResolutionRateResult = await db
      .select({ 
        avgRate: sql<number>`AVG(${responseMetrics.resolutionRate})`
      })
      .from(responseMetrics)
      .where(
        and(
          eq(responseMetrics.userId, user.id),
          gte(responseMetrics.date, dateThresholdStr)
        )
      );
    const avgResolutionRate = Number((avgResolutionRateResult[0]?.avgRate || 0).toFixed(2));

    // Get recent metrics for last N days ordered by date DESC
    const recentMetrics = await db
      .select()
      .from(responseMetrics)
      .where(
        and(
          eq(responseMetrics.userId, user.id),
          gte(responseMetrics.date, dateThresholdStr)
        )
      )
      .orderBy(desc(responseMetrics.date));

    // Build dashboard summary response
    const dashboardSummary = {
      totalEmails,
      pendingEmails,
      repliedEmails,
      overdueEmails,
      highPriorityEmails,
      unresolvedEmails,
      avgReplyTimeMinutes,
      avgResolutionRate,
      recentMetrics,
    };

    return NextResponse.json(dashboardSummary, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}