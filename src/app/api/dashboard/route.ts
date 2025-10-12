import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, responseMetrics } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Get email statistics
    const emailStats = await db
      .select({
        totalEmails: sql<number>`count(*)`,
        pendingEmails: sql<number>`sum(case when ${emails.status} = 'pending' then 1 else 0 end)`,
        repliedEmails: sql<number>`sum(case when ${emails.status} = 'replied' then 1 else 0 end)`,
        overdueEmails: sql<number>`sum(case when ${emails.status} = 'overdue' then 1 else 0 end)`,
        highPriorityEmails: sql<number>`sum(case when ${emails.priority} = 'high' then 1 else 0 end)`,
        unresolvedEmails: sql<number>`sum(case when ${emails.isResolved} = 0 then 1 else 0 end)`,
      })
      .from(emails)
      .where(eq(emails.userId, userId));

    // Calculate average reply time
    const replyTimeData = await db
      .select({
        avgReplyTime: sql<number>`avg(cast((julianday(${emails.firstReplyAt}) - julianday(${emails.receivedAt})) * 24 * 60 as real))`,
      })
      .from(emails)
      .where(
        and(
          eq(emails.userId, userId),
          sql`${emails.firstReplyAt} is not null`
        )
      );

    // Get recent metrics
    const recentMetrics = await db
      .select()
      .from(responseMetrics)
      .where(eq(responseMetrics.userId, userId))
      .orderBy(desc(responseMetrics.date))
      .limit(7);

    // Calculate resolution rate
    const totalEmails = emailStats[0]?.totalEmails || 0;
    const repliedEmails = emailStats[0]?.repliedEmails || 0;
    const avgResolutionRate = totalEmails > 0 ? (repliedEmails / totalEmails) * 100 : 0;

    return NextResponse.json({
      totalEmails: emailStats[0]?.totalEmails || 0,
      pendingEmails: emailStats[0]?.pendingEmails || 0,
      repliedEmails: emailStats[0]?.repliedEmails || 0,
      overdueEmails: emailStats[0]?.overdueEmails || 0,
      highPriorityEmails: emailStats[0]?.highPriorityEmails || 0,
      unresolvedEmails: emailStats[0]?.unresolvedEmails || 0,
      avgReplyTimeMinutes: Math.round(replyTimeData[0]?.avgReplyTime || 0),
      avgResolutionRate: Math.round(avgResolutionRate * 10) / 10,
      recentMetrics: recentMetrics.map(metric => ({
        id: metric.id,
        date: metric.date,
        avgFirstReplyTimeMinutes: metric.avgFirstReplyTimeMinutes || 0,
        resolutionRate: metric.resolutionRate,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
