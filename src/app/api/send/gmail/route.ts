import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailProviders } from "@/db/schema";
import { google } from "googleapis";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { providerId, to, subject, body, inReplyTo } = await req.json();

    if (!providerId || !to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    // Create email message
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      "",
      body,
    ];

    // Add In-Reply-To header if this is a reply
    if (inReplyTo) {
      messageParts.splice(2, 0, `In-Reply-To: ${inReplyTo}`);
      messageParts.splice(3, 0, `References: ${inReplyTo}`);
    }

    const message = messageParts.join("\r\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send email
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({
      message: "Email sent successfully",
      messageId: response.data.id,
    });
  } catch (error) {
    console.error("Gmail send error:", error);
    return NextResponse.json(
      { error: "Failed to send email via Gmail" },
      { status: 500 }
    );
  }
}