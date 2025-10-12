import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers, emails } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = session.user;

    // Get all team members with their performance metrics
    const members = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id));

    const performance = await Promise.all(
      members.map(async (member) => {
        // Get email stats for this team member
        const stats = await db
          .select({
            totalAssigned: sql<number>`count(*)`,
            replied: sql<number>`sum(case when ${emails.status} = 'replied' then 1 else 0 end)`,
            pending: sql<number>`sum(case when ${emails.status} = 'pending' then 1 else 0 end)`,
            overdue: sql<number>`sum(case when ${emails.status} = 'overdue' then 1 else 0 end)`,
            avgReplyTime: sql<number>`avg(
              case 
                when ${emails.firstReplyAt} is not null 
                then cast((julianday(${emails.firstReplyAt}) - julianday(${emails.receivedAt})) * 24 * 60 as real)
                else null 
              end
            )`,
          })
          .from(emails)
          .where(
            and(
              eq(emails.userId, user.id),
              eq(emails.assignedTo, member.id)
            )
          );

        const stat = stats[0] || {
          totalAssigned: 0,
          replied: 0,
          pending: 0,
          overdue: 0,
          avgReplyTime: 0,
        };

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          isActive: member.isActive,
          metrics: {
            totalAssigned: stat.totalAssigned || 0,
            replied: stat.replied || 0,
            pending: stat.pending || 0,
            overdue: stat.overdue || 0,
            avgReplyTimeMinutes: Math.round(stat.avgReplyTime || 0),
            resolutionRate:
              stat.totalAssigned > 0
                ? Math.round(((stat.replied || 0) / stat.totalAssigned) * 100)
                : 0,
          },
        };
      })
    );

    // Sort by performance (replied emails desc)
    performance.sort((a, b) => b.metrics.replied - a.metrics.replied);

    return NextResponse.json({
      teamPerformance: performance,
      summary: {
        totalMembers: members.length,
        activeMembers: members.filter((m) => m.isActive).length,
        totalEmailsAssigned: performance.reduce((sum, p) => sum + p.metrics.totalAssigned, 0),
        totalReplied: performance.reduce((sum, p) => sum + p.metrics.replied, 0),
        totalPending: performance.reduce((sum, p) => sum + p.metrics.pending, 0),
        totalOverdue: performance.reduce((sum, p) => sum + p.metrics.overdue, 0),
      },
    });
  } catch (error) {
    console.error('GET /api/team/performance error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}
