import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailProviders, alerts } from "@/db/schema";
import { google } from "googleapis";
import { eq } from "drizzle-orm";
import { EmailClassifier } from "@/lib/services/email-classifier";

// Robust MIME header decoder
function decodeMimeHeader(text: string): string {
  if (!text) return "";
  
  try {
    // Pattern for encoded words: =?charset?encoding?encoded-text?=
    const pattern = /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g;
    
    let decoded = text;
    let match;
    
    // Keep decoding until no more encoded words are found
    while ((match = pattern.exec(decoded)) !== null) {
      const fullMatch = match[0];
      const charset = match[1];
      const encoding = match[2].toUpperCase();
      const encodedText = match[3];
      
      let decodedPart = '';
      
      if (encoding === 'B') {
        // Base64 decoding
        try {
          const buffer = Buffer.from(encodedText, 'base64');
          decodedPart = buffer.toString('utf-8');
        } catch (e) {
          console.error('Base64 decode error:', e);
          decodedPart = encodedText;
        }
      } else if (encoding === 'Q') {
        // Quoted-Printable decoding
        try {
          let qpDecoded = encodedText
            .replace(/_/g, ' ')
            .replace(/=([0-9A-F]{2})/gi, (_: string, hex: string) => {
              return String.fromCharCode(parseInt(hex, 16));
            });
          decodedPart = qpDecoded;
        } catch (e) {
          console.error('Quoted-printable decode error:', e);
          decodedPart = encodedText;
        }
      }
      
      // Replace the encoded part with decoded text
      decoded = decoded.replace(fullMatch, decodedPart);
      // Reset regex for next iteration
      pattern.lastIndex = 0;
    }
    
    return decoded;
  } catch (error) {
    console.error('MIME header decode error:', error);
    return text; // Return original on error
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Gmail sends notifications via Cloud Pub/Sub
    // The message contains the user's email address and historyId
    const message = body.message;
    if (!message || !message.data) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // Decode the Pub/Sub message
    const decodedData = Buffer.from(message.data, "base64").toString("utf-8");
    const notification = JSON.parse(decodedData);
    
    const { emailAddress, historyId } = notification;

    // Find the email provider for this Gmail account
    const provider = await db
      .select()
      .from(emailProviders)
      .where(eq(emailProviders.email, emailAddress))
      .limit(1);

    if (!provider.length) {
      console.log(`No provider found for email: ${emailAddress}`);
      return NextResponse.json({ message: "Provider not found" }, { status: 404 });
    }

    const emailProvider = provider[0];

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

    // Fetch the new messages using history API
    const history = await gmail.users.history.list({
      userId: "me",
      startHistoryId: historyId,
    });

    if (history.data.history) {
      // Process each message in the history
      for (const historyItem of history.data.history) {
        if (historyItem.messagesAdded) {
          for (const messageAdded of historyItem.messagesAdded) {
            const messageId = messageAdded.message?.id;
            if (!messageId) continue;

            // Fetch full message details
            const message = await gmail.users.messages.get({
              userId: "me",
              id: messageId,
              format: "full",
            });

            // Extract message data
            const headers = message.data.payload?.headers || [];
            const fromRaw = headers.find(h => h.name === "From")?.value || "";
            const subjectRaw = headers.find(h => h.name === "Subject")?.value || "";
            const date = headers.find(h => h.name === "Date")?.value || "";
            
            // Decode MIME encoded headers
            const from = decodeMimeHeader(fromRaw);
            const subject = decodeMimeHeader(subjectRaw);
            
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

            // Create email in database
            const inserted = await db.insert(emails).values({
              senderEmail: from,
              recipientEmail: emailAddress,
              subject,
              receivedAt: new Date(date),
              status: "pending",
              priority: "medium",
              slaDeadline: new Date(Date.now() + 3600000), // 1 hour default
              isResolved: false,
              externalId: messageId,
              userId: provider[0].userId,
              providerId: provider[0].id,
            }).returning();

            const newEmail = inserted[0];

            // Auto-classify email using AI/keywords
            const classification = EmailClassifier.classify(subject, body);

            // Create intelligent alerts based on classification
            try {
              // High priority alert
              if (classification.priority === 'high') {
                await db.insert(alerts).values({
                  emailId: newEmail.id,
                  userId: emailProvider.userId,
                  alertType: "high_priority",
                  message: `🔥 High priority ${classification.category} email: ${subject} (${Math.round(classification.confidence)}% confident)`,
                  isRead: false,
                  createdAt: new Date(),
                });
              }

              // Urgent sentiment alert
              if (classification.sentiment === 'urgent' || classification.sentiment === 'negative') {
                await db.insert(alerts).values({
                  emailId: newEmail.id,
                  userId: emailProvider.userId,
                  alertType: classification.sentiment === 'urgent' ? 'deadline_approaching' : 'high_priority',
                  message: `${classification.sentiment === 'urgent' ? '⚡' : '⚠️'} ${classification.sentiment.toUpperCase()} email detected: ${subject}`,
                  isRead: false,
                  createdAt: new Date(),
                });
              }
            } catch (e) {
              console.error("Failed to create classification alerts:", e);
            }
          }
        }
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Gmail webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Verification endpoint for Gmail webhook setup
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  
  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  
  return NextResponse.json({ message: "Gmail webhook endpoint" });
}
