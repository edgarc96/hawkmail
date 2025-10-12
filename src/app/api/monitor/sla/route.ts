import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, alerts } from "@/db/schema";
import { and, eq, lt } from "drizzle-orm";

async function runSlaMonitoring() {
  const atRiskEmails = await db
    .select()
    .from(emails)
    .where(
      and(
        eq(emails.status, "pending"),
        lt(emails.slaDeadline, new Date(Date.now() + 15 * 60 * 1000))
      )
    );

  const alertsCreated: any[] = [];

  for (const email of atRiskEmails) {
    const existingAlert = await db
      .select()
      .from(alerts)
      .where(eq(alerts.emailId, email.id))
      .limit(1);

    if (existingAlert.length === 0) {
      const minutesRemaining = Math.floor((email.slaDeadline.getTime() - Date.now()) / 60000);

      const alertResult = await db
        .insert(alerts)
        .values({
          emailId: email.id,
          userId: email.userId || "",
          alertType: minutesRemaining < 0 ? "overdue" : "deadline_approaching",
          message:
            minutesRemaining < 0
              ? `SLA breached for email: ${email.subject}`
              : `SLA deadline in ${minutesRemaining} minutes for: ${email.subject}`,
          isRead: false,
          createdAt: new Date(),
        })
        .returning();

      alertsCreated.push(alertResult[0]);
    }
  }

  return {
    emailsChecked: atRiskEmails.length,
    alertsCreated: alertsCreated.length,
    alerts: alertsCreated,
  };
}

// Delegates to shared library

export async function POST(req: NextRequest) {
  try {
    const result = await runSlaMonitoring();
    return NextResponse.json({ message: "SLA monitoring completed", ...result });
  } catch (error) {
    console.error("SLA monitoring error:", error);
    return NextResponse.json({ error: "Failed to monitor SLA" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const result = await runSlaMonitoring();
    return NextResponse.json({ message: "SLA monitoring completed", ...result });
  } catch (error) {
    console.error("SLA monitoring error:", error);
    return NextResponse.json({ error: "Failed to monitor SLA" }, { status: 500 });
  }
}
