import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailProviders } from "@/db/schema";
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

    // Create email message
    const message: any = {
      subject,
      body: {
        contentType: "HTML",
        content: body,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
    };

    // Send email via Microsoft Graph API
    const endpoint = inReplyTo
      ? `https://graph.microsoft.com/v1.0/me/messages/${inReplyTo}/reply`
      : "https://graph.microsoft.com/v1.0/me/sendMail";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${emailProvider.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inReplyTo ? { comment: body } : { message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to send email");
    }

    return NextResponse.json({
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Outlook send error:", error);
    return NextResponse.json(
      { error: "Failed to send email via Outlook" },
      { status: 500 }
    );
  }
}