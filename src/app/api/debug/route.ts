import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, responseMetrics, emailProviders, emailSyncLogs } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 1. Count total emails
    const emailCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(emails)
      .where(eq(emails.userId, userId));

    // 2. Get sample emails
    const sampleEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.userId, userId))
      .limit(5);

    // 3. Get response metrics
    const metrics = await db
      .select()
      .from(responseMetrics)
      .where(eq(responseMetrics.userId, userId))
      .orderBy(desc(responseMetrics.date))
      .limit(5);

    // 4. Get email providers
    const providers = await db
      .select()
      .from(emailProviders)
      .where(eq(emailProviders.userId, userId));

    // 5. Get recent sync logs
    const syncLogs = await db
      .select()
      .from(emailSyncLogs)
      .where(eq(emailSyncLogs.userId, userId))
      .orderBy(desc(emailSyncLogs.startedAt))
      .limit(5);

    // 6. Calculate stats
    const stats = await db
      .select({
        totalEmails: sql<number>`count(*)`,
        withReplies: sql<number>`sum(case when ${emails.firstReplyAt} is not null then 1 else 0 end)`,
        pending: sql<number>`sum(case when ${emails.status} = 'pending' then 1 else 0 end)`,
        replied: sql<number>`sum(case when ${emails.status} = 'replied' then 1 else 0 end)`,
      })
      .from(emails)
      .where(eq(emails.userId, userId));

    return NextResponse.json({
      userId,
      timestamp: new Date().toISOString(),
      emailCount: emailCount[0]?.count || 0,
      stats: stats[0] || {},
      sampleEmails: sampleEmails.map(e => ({
        id: e.id,
        subject: e.subject?.substring(0, 50),
        receivedAt: e.receivedAt,
        firstReplyAt: e.firstReplyAt,
        status: e.status,
      })),
      metrics: metrics.map(m => ({
        date: m.date,
        avgFirstReplyTimeMinutes: m.avgFirstReplyTimeMinutes,
        resolutionRate: m.resolutionRate,
      })),
      providers: providers.map(p => ({
        id: p.id,
        email: p.email,
        lastSyncAt: p.lastSyncAt,
        isActive: p.isActive,
      })),
      syncLogs: syncLogs.map(s => ({
        id: s.id,
        status: s.syncStatus,
        emailsProcessed: s.emailsProcessed,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        errorMessage: s.errorMessage,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
