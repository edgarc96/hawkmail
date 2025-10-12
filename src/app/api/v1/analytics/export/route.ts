import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails, responseMetrics, teamMembers, alerts } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * GET /api/v1/analytics/export
 * PowerBI/Tableau/Looker compatible analytics API
 * 
 * Query Parameters:
 * - format: json|csv|powerbi (default: json)
 * - dateRange: last_7_days|last_30_days|last_90_days|custom
 * - startDate: YYYY-MM-DD (for custom range)
 * - endDate: YYYY-MM-DD (for custom range)
 * - metrics: all|emails|team|sla|alerts
 * - apiKey: API key for authentication (alternative to session)
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication - support both session and API key
    const session = await auth.api.getSession({ headers: request.headers });
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    // For now, require session (API key can be added later)
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please provide valid session or API key'
        },
        { status: 401 }
      );
    }

    const format = searchParams.get('format') || 'json';
    const dateRange = searchParams.get('dateRange') || 'last_30_days';
    const metricsType = searchParams.get('metrics') || 'all';
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'last_7_days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'last_30_days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last_90_days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'custom':
        const customStart = searchParams.get('startDate');
        const customEnd = searchParams.get('endDate');
        if (customStart) startDate = new Date(customStart);
        if (customEnd) endDate.setTime(new Date(customEnd).getTime());
        break;
    }

    const userId = session.user.id;
    const analyticsData: any = {
      metadata: {
        generated_at: new Date().toISOString(),
        date_range: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
        user_id: userId,
      },
      data: {},
    };

    // Fetch email metrics
    if (metricsType === 'all' || metricsType === 'emails') {
      const emailMetrics = await db
        .select({
          date: sql<string>`date(${emails.receivedAt})`,
          total_emails: sql<number>`COUNT(*)`,
          pending: sql<number>`COUNT(CASE WHEN ${emails.status} = 'pending' THEN 1 END)`,
          replied: sql<number>`COUNT(CASE WHEN ${emails.status} = 'replied' THEN 1 END)`,
          overdue: sql<number>`COUNT(CASE WHEN ${emails.status} = 'overdue' THEN 1 END)`,
          high_priority: sql<number>`COUNT(CASE WHEN ${emails.priority} = 'high' THEN 1 END)`,
          medium_priority: sql<number>`COUNT(CASE WHEN ${emails.priority} = 'medium' THEN 1 END)`,
          low_priority: sql<number>`COUNT(CASE WHEN ${emails.priority} = 'low' THEN 1 END)`,
          avg_reply_time_minutes: sql<number>`AVG(
            CASE 
              WHEN ${emails.firstReplyAt} IS NOT NULL 
              THEN (julianday(${emails.firstReplyAt}) - julianday(${emails.receivedAt})) * 24 * 60 
            END
          )`,
          resolution_rate: sql<number>`
            ROUND(
              COUNT(CASE WHEN ${emails.isResolved} = 1 THEN 1 END) * 100.0 / COUNT(*),
              2
            )
          `,
        })
        .from(emails)
        .where(
          and(
            eq(emails.userId, userId),
            gte(emails.receivedAt, startDate),
            lte(emails.receivedAt, endDate)
          )
        )
        .groupBy(sql`date(${emails.receivedAt})`)
        .orderBy(sql`date(${emails.receivedAt}) DESC`);

      analyticsData.data.email_metrics = emailMetrics;
    }

    // Fetch team performance
    if (metricsType === 'all' || metricsType === 'team') {
      const teamPerformance = await db
        .select({
          team_member_id: teamMembers.id,
          team_member_name: teamMembers.name,
          team_member_email: teamMembers.email,
          role: teamMembers.role,
          total_assigned: sql<number>`COUNT(${emails.id})`,
          pending: sql<number>`COUNT(CASE WHEN ${emails.status} = 'pending' THEN 1 END)`,
          replied: sql<number>`COUNT(CASE WHEN ${emails.status} = 'replied' THEN 1 END)`,
          overdue: sql<number>`COUNT(CASE WHEN ${emails.status} = 'overdue' THEN 1 END)`,
          avg_reply_time_minutes: sql<number>`AVG(
            CASE 
              WHEN ${emails.firstReplyAt} IS NOT NULL 
              THEN (julianday(${emails.firstReplyAt}) - julianday(${emails.receivedAt})) * 24 * 60 
            END
          )`,
          resolution_rate: sql<number>`
            ROUND(
              COUNT(CASE WHEN ${emails.isResolved} = 1 THEN 1 END) * 100.0 / 
              NULLIF(COUNT(${emails.id}), 0),
              2
            )
          `,
          sla_compliance_rate: sql<number>`
            ROUND(
              COUNT(CASE WHEN ${emails.status} != 'overdue' THEN 1 END) * 100.0 / 
              NULLIF(COUNT(${emails.id}), 0),
              2
            )
          `,
        })
        .from(teamMembers)
        .leftJoin(
          emails,
          and(
            eq(emails.assignedTo, teamMembers.id),
            gte(emails.receivedAt, startDate),
            lte(emails.receivedAt, endDate)
          )
        )
        .where(eq(teamMembers.userId, userId))
        .groupBy(teamMembers.id);

      analyticsData.data.team_performance = teamPerformance;
    }

    // Fetch SLA metrics
    if (metricsType === 'all' || metricsType === 'sla') {
      const slaMetrics = await db
        .select({
          date: sql<string>`date(${emails.receivedAt})`,
          total_emails: sql<number>`COUNT(*)`,
          within_sla: sql<number>`COUNT(CASE WHEN ${emails.status} != 'overdue' THEN 1 END)`,
          breached_sla: sql<number>`COUNT(CASE WHEN ${emails.status} = 'overdue' THEN 1 END)`,
          sla_compliance_rate: sql<number>`
            ROUND(
              COUNT(CASE WHEN ${emails.status} != 'overdue' THEN 1 END) * 100.0 / COUNT(*),
              2
            )
          `,
          avg_time_to_breach_hours: sql<number>`
            AVG(
              CASE 
                WHEN ${emails.status} = 'overdue' 
                THEN (julianday(${emails.slaDeadline}) - julianday(${emails.receivedAt})) * 24 
              END
            )
          `,
        })
        .from(emails)
        .where(
          and(
            eq(emails.userId, userId),
            gte(emails.receivedAt, startDate),
            lte(emails.receivedAt, endDate)
          )
        )
        .groupBy(sql`date(${emails.receivedAt})`)
        .orderBy(sql`date(${emails.receivedAt}) DESC`);

      analyticsData.data.sla_metrics = slaMetrics;
    }

    // Fetch alerts summary
    if (metricsType === 'all' || metricsType === 'alerts') {
      const alertsMetrics = await db
        .select({
          date: sql<string>`date(${alerts.createdAt})`,
          total_alerts: sql<number>`COUNT(*)`,
          sla_warning: sql<number>`COUNT(CASE WHEN ${alerts.alertType} = 'sla_warning' THEN 1 END)`,
          sla_breach: sql<number>`COUNT(CASE WHEN ${alerts.alertType} = 'sla_breach' THEN 1 END)`,
          high_priority: sql<number>`COUNT(CASE WHEN ${alerts.alertType} = 'high_priority' THEN 1 END)`,
          unread_alerts: sql<number>`COUNT(CASE WHEN ${alerts.isRead} = 0 THEN 1 END)`,
        })
        .from(alerts)
        .where(
          and(
            eq(alerts.userId, userId),
            gte(alerts.createdAt, startDate),
            lte(alerts.createdAt, endDate)
          )
        )
        .groupBy(sql`date(${alerts.createdAt})`)
        .orderBy(sql`date(${alerts.createdAt}) DESC`);

      analyticsData.data.alerts_summary = alertsMetrics;
    }

    // Summary statistics
    analyticsData.summary = {
      total_emails: await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(emails)
        .where(
          and(
            eq(emails.userId, userId),
            gte(emails.receivedAt, startDate),
            lte(emails.receivedAt, endDate)
          )
        )
        .then(r => r[0]?.count || 0),
      
      avg_reply_time_minutes: await db
        .select({
          avg: sql<number>`AVG(
            CASE 
              WHEN ${emails.firstReplyAt} IS NOT NULL 
              THEN (julianday(${emails.firstReplyAt}) - julianday(${emails.receivedAt})) * 24 * 60 
            END
          )`
        })
        .from(emails)
        .where(
          and(
            eq(emails.userId, userId),
            gte(emails.receivedAt, startDate),
            lte(emails.receivedAt, endDate)
          )
        )
        .then(r => Math.round(r[0]?.avg || 0)),
      
      overall_resolution_rate: await db
        .select({
          rate: sql<number>`
            ROUND(
              COUNT(CASE WHEN ${emails.isResolved} = 1 THEN 1 END) * 100.0 / COUNT(*),
              2
            )
          `
        })
        .from(emails)
        .where(
          and(
            eq(emails.userId, userId),
            gte(emails.receivedAt, startDate),
            lte(emails.receivedAt, endDate)
          )
        )
        .then(r => r[0]?.rate || 0),
      
      sla_compliance_rate: await db
        .select({
          rate: sql<number>`
            ROUND(
              COUNT(CASE WHEN ${emails.status} != 'overdue' THEN 1 END) * 100.0 / COUNT(*),
              2
            )
          `
        })
        .from(emails)
        .where(
          and(
            eq(emails.userId, userId),
            gte(emails.receivedAt, startDate),
            lte(emails.receivedAt, endDate)
          )
        )
        .then(r => r[0]?.rate || 0),
    };

    // Return in requested format
    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(analyticsData);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'powerbi') {
      // PowerBI expects a specific format
      const powerbiData = {
        tables: [
          {
            name: 'EmailMetrics',
            rows: analyticsData.data.email_metrics || [],
          },
          {
            name: 'TeamPerformance',
            rows: analyticsData.data.team_performance || [],
          },
          {
            name: 'SLAMetrics',
            rows: analyticsData.data.sla_metrics || [],
          },
          {
            name: 'Summary',
            rows: [analyticsData.summary],
          },
        ],
        refreshDate: new Date().toISOString(),
      };
      
      return new NextResponse(JSON.stringify(powerbiData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="powerbi_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // Default JSON response (with download)
    return new NextResponse(JSON.stringify(analyticsData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
    
  } catch (error) {
    console.error('GET /api/v1/analytics/export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Convert analytics data to CSV format
 */
function convertToCSV(data: any): string {
  const lines: string[] = [];
  
  // Email metrics
  if (data.data.email_metrics) {
    lines.push('\n=== EMAIL METRICS ===');
    lines.push('Date,Total Emails,Pending,Replied,Overdue,High Priority,Medium Priority,Low Priority,Avg Reply Time (min),Resolution Rate (%)');
    data.data.email_metrics.forEach((row: any) => {
      lines.push(
        `${row.date},${row.total_emails},${row.pending},${row.replied},${row.overdue},${row.high_priority},${row.medium_priority},${row.low_priority},${Math.round(row.avg_reply_time_minutes || 0)},${row.resolution_rate}`
      );
    });
  }
  
  // Team performance
  if (data.data.team_performance) {
    lines.push('\n\n=== TEAM PERFORMANCE ===');
    lines.push('Team Member,Email,Role,Total Assigned,Pending,Replied,Overdue,Avg Reply Time (min),Resolution Rate (%),SLA Compliance (%)');
    data.data.team_performance.forEach((row: any) => {
      lines.push(
        `${row.team_member_name},${row.team_member_email},${row.role},${row.total_assigned},${row.pending},${row.replied},${row.overdue},${Math.round(row.avg_reply_time_minutes || 0)},${row.resolution_rate},${row.sla_compliance_rate}`
      );
    });
  }
  
  // Summary
  lines.push('\n\n=== SUMMARY ===');
  lines.push('Metric,Value');
  lines.push(`Total Emails,${data.summary.total_emails}`);
  lines.push(`Avg Reply Time (min),${data.summary.avg_reply_time_minutes}`);
  lines.push(`Resolution Rate (%),${data.summary.overall_resolution_rate}`);
  lines.push(`SLA Compliance (%),${data.summary.sla_compliance_rate}`);
  
  return lines.join('\n');
}
