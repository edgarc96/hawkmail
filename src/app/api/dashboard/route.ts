import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, responseMetrics } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { cache } from "react";

// Cache function to avoid redundant calls
const getCachedDashboardData = cache(async (userId: string) => {
  // Optimized single query with all statistics
  const dashboardData = await db
    .select({
      totalEmails: sql<number>`count(*)`,
      pendingEmails: sql<number>`sum(case when ${emails.status} = 'pending' then 1 else 0 end)`,
      repliedEmails: sql<number>`sum(case when ${emails.status} = 'replied' then 1 else 0 end)`,
      overdueEmails: sql<number>`sum(case when ${emails.status} = 'overdue' then 1 else 0 end)`,
      highPriorityEmails: sql<number>`sum(case when ${emails.priority} = 'high' then 1 else 0 end)`,
      unresolvedEmails: sql<number>`sum(case when ${emails.isResolved} = 0 then 1 else 0 end)`,
      avgReplyTime: sql<number>`avg(cast((julianday(${emails.firstReplyAt}) - julianday(${emails.receivedAt})) * 24 * 60 as real))`,
    })
    .from(emails)
    .where(eq(emails.userId, userId));

  const stats = dashboardData[0] || {};
  
  // Get recent metrics in parallel
  const recentMetrics = await db
    .select({
      id: responseMetrics.id,
      date: responseMetrics.date,
      avgFirstReplyTimeMinutes: responseMetrics.avgFirstReplyTimeMinutes,
      resolutionRate: responseMetrics.resolutionRate,
    })
    .from(responseMetrics)
    .where(eq(responseMetrics.userId, userId))
    .orderBy(desc(responseMetrics.date))
    .limit(7);

  // Calculate resolution rate efficiently
  const totalEmails = stats.totalEmails || 0;
  const repliedEmails = stats.repliedEmails || 0;
  const avgResolutionRate = totalEmails > 0 ? (repliedEmails / totalEmails) * 100 : 0;

  return {
    totalEmails: stats.totalEmails || 0,
    pendingEmails: stats.pendingEmails || 0,
    repliedEmails: stats.repliedEmails || 0,
    overdueEmails: stats.overdueEmails || 0,
    highPriorityEmails: stats.highPriorityEmails || 0,
    unresolvedEmails: stats.unresolvedEmails || 0,
    avgReplyTimeMinutes: Math.round(stats.avgReplyTime || 0),
    avgResolutionRate: Math.round(avgResolutionRate * 10) / 10,
    recentMetrics: recentMetrics.map(metric => ({
      id: metric.id,
      date: metric.date,
      avgFirstReplyTimeMinutes: metric.avgFirstReplyTimeMinutes || 0,
      resolutionRate: metric.resolutionRate,
    })),
  };
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    
    // Get cached data
    const data = await getCachedDashboardData(userId);

    // Add cache headers for browser caching
    const headers = new Headers({
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    });

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
