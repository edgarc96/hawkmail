import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { db } from "@/db";
import { emailProviders } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Resolve app URL consistently across environments
const appUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    const userId = state;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/oauth/gmail/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's email address
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    if (!email) {
      return NextResponse.json({ error: "Failed to get user email" }, { status: 500 });
    }

    // Calculate token expiry time
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    // Get the scope from the token
    const scope = tokens.scope || "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email";

    // Check if provider already exists
    const existingProvider = await db
      .select()
      .from(emailProviders)
      .where(and(
        eq(emailProviders.userId, userId),
        eq(emailProviders.provider, "gmail")
      ))
      .limit(1);

    let providerId: number;

    if (existingProvider.length > 0) {
      // Update existing provider
      await db
        .update(emailProviders)
        .set({
          email,
          accessToken: tokens.access_token || "",
          refreshToken: tokens.refresh_token || existingProvider[0].refreshToken,
          tokenExpiresAt: expiresAt,
          scope,
          isActive: true,
          lastSyncAt: null,
        })
        .where(eq(emailProviders.id, existingProvider[0].id));
      providerId = existingProvider[0].id;
    } else {
      // Insert new provider
      const result = await db.insert(emailProviders).values({
        userId,
        provider: "gmail",
        email,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || "",
        tokenExpiresAt: expiresAt,
        scope,
        isActive: true,
      }).returning();
      providerId = result[0].id;
    }

    // Register Gmail webhook (watch)
    try {
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      const watchResponse = await gmail.users.watch({
        userId: "me",
        requestBody: {
          topicName: process.env.GMAIL_PUBSUB_TOPIC || "projects/your-project/topics/gmail-notifications",
          labelIds: ["INBOX"],
        },
      });

      // Save webhook details
      if (watchResponse.data.historyId) {
        await db
          .update(emailProviders)
          .set({
            webhookChannelId: watchResponse.data.historyId,
            webhookResourceId: watchResponse.data.expiration,
          })
          .where(eq(emailProviders.id, providerId));
      }
      console.log("Gmail webhook registered successfully");
    } catch (webhookError) {
      console.error("Failed to register Gmail webhook:", webhookError);
      // Don't fail the entire OAuth flow if webhook registration fails
    }

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      `${appUrl}/dashboard?section=settings&success=gmail_connected`
    );
  } catch (error){ 
    console.error("Gmail OAuth callback error:", error);
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=oauth_failed`
    );
  }
}
