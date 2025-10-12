import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails, responseMetrics, teamMembers } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'emails'; // emails, metrics, team
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let csvContent = '';

    if (reportType === 'emails') {
      // Export emails report
      const conditions = [eq(emails.userId, session.user.id)];
      
      if (startDate && endDate) {
        conditions.push(
          gte(emails.receivedAt, new Date(startDate)),
          lte(emails.receivedAt, new Date(endDate))
        );
      }

      const emailData = await db
        .select({
          id: emails.id,
          subject: emails.subject,
          senderEmail: emails.senderEmail,
          recipientEmail: emails.recipientEmail,
          receivedAt: emails.receivedAt,
          firstReplyAt: emails.firstReplyAt,
          status: emails.status,
          priority: emails.priority,
          isResolved: emails.isResolved,
        })
        .from(emails)
        .where(and(...conditions));

      // Generate CSV
      csvContent = 'ID,Subject,Sender,Recipient,Received At,First Reply At,Status,Priority,Resolved\n';
      emailData.forEach((row) => {
        csvContent += `${row.id},"${row.subject}",${row.senderEmail},${row.recipientEmail},${row.receivedAt},${row.firstReplyAt || 'N/A'},${row.status},${row.priority},${row.isResolved}\n`;
      });
    } else if (reportType === 'metrics') {
      // Export metrics report
      const conditions = [eq(responseMetrics.userId, session.user.id)];
      
      if (startDate && endDate) {
        conditions.push(
          gte(sql`date(${responseMetrics.date})`, startDate),
          lte(sql`date(${responseMetrics.date})`, endDate)
        );
      }

      const metricsData = await db
        .select()
        .from(responseMetrics)
        .where(and(...conditions));

      // Generate CSV
      csvContent = 'Date,Avg Reply Time (min),Total Emails,Replied Count,Overdue Count,Resolution Rate\n';
      metricsData.forEach((row) => {
        csvContent += `${row.date},${row.avgFirstReplyTimeMinutes || 0},${row.totalEmails},${row.repliedCount},${row.overdueCount},${row.resolutionRate}\n`;
      });
    } else if (reportType === 'team') {
      // Export team performance report
      const teamData = await db
        .select({
          id: teamMembers.id,
          name: teamMembers.name,
          email: teamMembers.email,
          role: teamMembers.role,
          totalAssigned: sql<number>`COUNT(CASE WHEN ${emails.assignedTo} = ${teamMembers.id} THEN 1 END)`,
          replied: sql<number>`COUNT(CASE WHEN ${emails.assignedTo} = ${teamMembers.id} AND ${emails.status} = 'replied' THEN 1 END)`,
          pending: sql<number>`COUNT(CASE WHEN ${emails.assignedTo} = ${teamMembers.id} AND ${emails.status} = 'pending' THEN 1 END)`,
        })
        .from(teamMembers)
        .leftJoin(emails, eq(emails.assignedTo, teamMembers.id))
        .where(eq(teamMembers.userId, session.user.id))
        .groupBy(teamMembers.id);

      // Generate CSV
      csvContent = 'ID,Name,Email,Role,Total Assigned,Replied,Pending\n';
      teamData.forEach((row) => {
        csvContent += `${row.id},${row.name},${row.email},${row.role},${row.totalAssigned},${row.replied},${row.pending}\n`;
      });
    }

    // Return CSV file with UTF-8 BOM for proper encoding
    const utf8BOM = '\uFEFF'; // UTF-8 BOM
    const csvWithBOM = utf8BOM + csvContent;
    
    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('GET /api/reports/export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
