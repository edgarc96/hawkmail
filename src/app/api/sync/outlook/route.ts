import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailProviders, emailSyncLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { providerId } = await req.json();

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 });
    }

    // Get the provider
    const provider = await db
      .select()
      .from(emailProviders)
      .where(eq(emailProviders.id, parseInt(providerId)))
      .limit(1);

    if (!provider.length) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const emailProvider = provider[0];

    // Create sync log
    const syncLogResult = await db.insert(emailSyncLogs).values({
      providerId: emailProvider.id,
      userId: emailProvider.userId,
      syncStatus: "in_progress",
      emailsProcessed: 0,
      startedAt: new Date(),
    }).returning();

    const syncLog = syncLogResult[0];

    try {
      // Fetch messages from Microsoft Graph API
      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/messages?$top=10", // Reduced from 50 and removed filter for read status
        {
          headers: {
            Authorization: `Bearer ${emailProvider.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages from Microsoft Graph");
      }

      const data = await response.json();
      const messages = data.value || [];
      let processedCount = 0;

      for (const message of messages) {
        // Check if email already exists
        const existingEmail = await db
          .select()
          .from(emails)
          .where(eq(emails.externalId, message.id))
          .limit(1);

        if (existingEmail.length === 0) {
          // Extract email body content
          let bodyContent = "";
          if (message.body?.content) {
            bodyContent = message.body.content;
          } else if (message.bodyPreview) {
            bodyContent = message.bodyPreview;
          }

          // Create email in database
          await db.insert(emails).values({
            senderEmail: message.from?.emailAddress?.address || "",
            recipientEmail: message.toRecipients?.[0]?.emailAddress?.address || emailProvider.email,
            subject: message.subject || "",
            // bodyContent: bodyContent, // Column doesn't exist in Turso DB yet
            receivedAt: new Date(message.receivedDateTime),
            status: "pending",
            priority: message.importance === "high" ? "high" : "medium",
            slaDeadline: new Date(Date.now() + 3600000), // 1 hour default
            isResolved: false,
            externalId: message.id,
            providerId: emailProvider.id,
            userId: emailProvider.userId,
          });

          processedCount++;
        }
      }

      // Update sync log as completed
      await db
        .update(emailSyncLogs)
        .set({
          syncStatus: "success",
          emailsProcessed: processedCount,
          completedAt: new Date(),
        })
        .where(eq(emailSyncLogs.id, syncLog.id));

      // Update provider last sync time
      await db
        .update(emailProviders)
        .set({
          lastSyncAt: new Date(),
        })
        .where(eq(emailProviders.id, emailProvider.id));

      return NextResponse.json({
        message: "Sync completed successfully",
        emailsProcessed: processedCount,
      });
    } catch (error) {
      // Update sync log as failed
      await db
        .update(emailSyncLogs)
        .set({
          syncStatus: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        })
        .where(eq(emailSyncLogs.id, syncLog.id));

      throw error;
    }
  } catch (error) {
    console.error("Outlook sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Outlook messages" },
      { status: 500 }
    );
  }
}