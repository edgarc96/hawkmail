import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailProviders, emailSyncLogs } from "@/db/schema";
import { google } from "googleapis";
import { eq } from "drizzle-orm";

// Gmail encodes bodies with base64url. This safely decodes to UTF-8.
function decodeBase64Url(data: string): string {
  try {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch {
    return "";
  }
}

// Recursively walk the Gmail payload to extract html/text bodies
function extractBodies(payload: any): { html?: string; text?: string } {
  if (!payload) return {};

  // Direct body
  if (payload.body?.data && typeof payload.mimeType === "string") {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === "text/html") return { html: decoded };
    if (payload.mimeType === "text/plain") return { text: decoded };
  }

  // Parts (multipart/*)
  if (Array.isArray(payload.parts)) {
    let html: string | undefined;
    let text: string | undefined;
    for (const part of payload.parts) {
      const child = extractBodies(part);
      // Prefer html but keep text as fallback
      if (!html && child.html) html = child.html;
      if (!text && child.text) text = child.text;
      if (html && text) break;
    }
    return { html, text };
  }

  return {};
}

// Extract attachments from Gmail payload
interface GmailAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  isInline: boolean;
  contentId?: string;
}

function extractAttachments(payload: any): GmailAttachment[] {
  const attachments: GmailAttachment[] = [];
  
  function walk(part: any) {
    if (!part) return;
    
    // Check if this part has an attachment
    if (part.filename && part.body?.attachmentId) {
      const contentDisposition = part.headers?.find(
        (h: any) => h.name?.toLowerCase() === 'content-disposition'
      )?.value || '';
      
      const contentId = part.headers?.find(
        (h: any) => h.name?.toLowerCase() === 'content-id'
      )?.value || '';
      
      attachments.push({
        attachmentId: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType || 'application/octet-stream',
        sizeBytes: part.body.size || 0,
        isInline: contentDisposition.toLowerCase().includes('inline'),
        contentId: contentId.replace(/[<>]/g, ''), // Remove < > brackets
      });
    }
    
    // Recursively walk parts
    if (Array.isArray(part.parts)) {
      part.parts.forEach(walk);
    }
  }
  
  walk(payload);
  return attachments;
}

// Simple plaintext -> HTML conversion with quoting and linkification
function textToHtml(text: string): string {
  if (!text) return "";

  // Escape HTML
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert URLs to links
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/gi;
  const withLinks = escaped.replace(urlRegex, (m) => {
    const href = m.startsWith("http") ? m : `http://${m}`;
    return `<a href="${href}" target="_blank" rel="noreferrer noopener">${m}</a>`;
  });

  // Handle quote blocks (lines starting with '>')
  const lines = withLinks.split(/\r?\n/);
  const out: string[] = [];
  let inQuote = false;
  for (const line of lines) {
    const isQuote = /^(&gt;|>)+/.test(line);
    if (isQuote && !inQuote) {
      inQuote = true;
      out.push('<blockquote style="border-left:3px solid #e2e8f0;margin:0.5em 0;padding-left:0.8em;color:#64748b;">');
    }
    if (!isQuote && inQuote) {
      inQuote = false;
      out.push("</blockquote>");
    }
    out.push(line.replace(/^(&gt;|>)+\s?/, ""));
  }
  if (inQuote) out.push("</blockquote>");

  // Paragraph/line breaks
  return out.join("<br>");
}

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
        
        // ✨ NEW: Extract threading headers for proper email threading
        const messageId = headers.find(h => h.name === "Message-ID")?.value || "";
        const inReplyTo = headers.find(h => h.name === "In-Reply-To")?.value || "";
        const references = headers.find(h => h.name === "References")?.value || "";
        const threadId = message.data.threadId || msg.id;
        
        console.log(`📧 Email details - From: ${from}, To: ${to}, Subject: "${subject}", Date: ${date}`);
        console.log(`🔗 Threading - Thread: ${threadId}, MessageID: ${messageId}, InReplyTo: ${inReplyTo}`);

        // Get message body preferring HTML, with safe fallbacks
        const { html, text } = extractBodies(message.data.payload);
        let body = html || textToHtml(text || "");
        
        // ✨ NEW: Extract attachments
        const attachments = extractAttachments(message.data.payload);
        console.log(`📎 Found ${attachments.length} attachment(s)`);

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
          
          // Store threading headers in rawHeaders as JSON
          const rawHeaders = JSON.stringify({
            messageId,
            inReplyTo,
            references,
            from,
            to,
            subject,
            date,
          });
          
          await db.insert(emails).values({
            senderEmail: from,
            recipientEmail: to || emailProvider.email,
            subject,
            bodyContent: body,
            receivedAt: new Date(date),
            status: "pending",
            priority: "medium",
            slaDeadline: new Date(Date.now() + 3600000), // 1 hour default
            isResolved: false,
            externalId: msg.id,
            providerId: emailProvider.id,
            userId: emailProvider.userId,
            threadId: threadId,
            rawHeaders: rawHeaders,
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
