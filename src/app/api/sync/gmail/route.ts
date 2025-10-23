import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailProviders, emailSyncLogs } from "@/db/schema";
import { google } from "googleapis";
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
    console.log(`🔵 Starting sync for provider ID: ${emailProvider.id}, Email: ${emailProvider.email}`);

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
      // Initialize Gmail API client
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: emailProvider.accessToken,
        refresh_token: emailProvider.refreshToken,
      });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      // Fetch messages from inbox
      console.log("📧 Fetching messages from Gmail...");
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10, // Reduced from 50 to process fewer emails at once
        q: "in:inbox", // Removed is:unread to get both read and unread emails
      });

      const messages = response.data.messages || [];
      console.log(`✅ Found ${messages.length} messages in Gmail inbox`);
      
      if (messages.length === 0) {
        console.log("⚠️ No messages found in inbox. Make sure you have emails in your Gmail inbox.");
        return NextResponse.json({
          message: "No messages found in inbox",
          emailsProcessed: 0,
        });
      }
      let processedCount = 0;

      for (const msg of messages) {
        if (!msg.id) continue;

        console.log(`📨 Processing message with ID: ${msg.id}`);

        // Fetch full message details
        const message = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });

        // Extract message data
        const headers = message.data.payload?.headers || [];
        const from = headers.find(h => h.name === "From")?.value || "";
        const to = headers.find(h => h.name === "To")?.value || "";
        const subject = headers.find(h => h.name === "Subject")?.value || "";
        const date = headers.find(h => h.name === "Date")?.value || "";
        
        console.log(`📧 Email details - From: ${from}, To: ${to}, Subject: "${subject}", Date: ${date}`);

        // Get message body
        let body = "";
        if (message.data.payload?.body?.data) {
          body = Buffer.from(message.data.payload.body.data, "base64").toString("utf-8");
        } else if (message.data.payload?.parts) {
          const textPart = message.data.payload.parts.find(part => part.mimeType === "text/plain");
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
          }
        }

        // Check if email already exists
        const existingEmail = await db
          .select()
          .from(emails)
          .where(eq(emails.externalId, msg.id))
          .limit(1);

        if (existingEmail.length > 0) {
          console.log(`⏭️  Email with external ID ${msg.id} already exists in database. Skipping...`);
        } else {
          // Create email in database
          console.log(`💾 Inserting NEW email into database - Subject: "${subject}"`);
          
          await db.insert(emails).values({
            senderEmail: from,
            recipientEmail: to || emailProvider.email,
            subject,
            // bodyContent: body,
            receivedAt: new Date(date),
            status: "pending",
            priority: "medium",
            slaDeadline: new Date(Date.now() + 3600000), // 1 hour default
            isResolved: false,
            externalId: msg.id,
            providerId: emailProvider.id,
            userId: emailProvider.userId,
          });

          processedCount++;
          console.log(`✅ Successfully inserted email #${processedCount}`);
        }
      }

      console.log(`🎉 Sync completed! Total new emails processed: ${processedCount} out of ${messages.length} found`);

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
      console.error("❌ Gmail sync error:", error);
      
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
    console.error("❌ FATAL Gmail sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Gmail messages" },
      { status: 500 }
    );
  }
}