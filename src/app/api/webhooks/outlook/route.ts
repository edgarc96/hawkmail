import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailProviders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle Microsoft Graph webhook notifications
    const value = body.value;
    
    if (!value || !Array.isArray(value)) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    for (const notification of value) {
      const { resource, resourceData, changeType } = notification;
      
      // Only process new messages
      if (changeType !== "created") continue;

      // Extract message ID from resource URL
      const messageId = resource.split("/messages/")[1];
      const userId = resource.split("/users/")[1]?.split("/")[0];

      if (!messageId || !userId) continue;

      // Find the email provider for this Outlook account
      const provider = await db
        .select()
        .from(emailProviders)
        .where(eq(emailProviders.email, userId))
        .limit(1);

      if (!provider.length) {
        console.log(`No provider found for user: ${userId}`);
        continue;
      }

      const emailProvider = provider[0];

      // Fetch message details from Microsoft Graph API
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${emailProvider.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch message from Microsoft Graph");
        continue;
      }

      const message = await response.json();

      // Create email in database
      await db.insert(emails).values({
        senderEmail: message.from?.emailAddress?.address || "",
        recipientEmail: message.toRecipients?.[0]?.emailAddress?.address || userId,
        subject: message.subject || "",
        receivedAt: new Date(message.receivedDateTime),
        status: "pending",
        priority: message.importance === "high" ? "high" : "medium",
        slaDeadline: new Date(Date.now() + 3600000), // 1 hour default
        isResolved: false,
        externalId: messageId,
        userId: userId,
      });
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Outlook webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Verification endpoint for Outlook webhook setup
export async function GET(req: NextRequest) {
  const validationToken = req.nextUrl.searchParams.get("validationToken");
  
  if (validationToken) {
    return new NextResponse(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  
  return NextResponse.json({ message: "Outlook webhook endpoint" });
}