import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Resolve app URL consistently across environments
const appUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/oauth/gmail/callback`
    );

    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: userId, // Pass userId in state to retrieve after callback
      prompt: "consent", // Force consent screen to get refresh token
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Gmail OAuth error:", error);
    return NextResponse.json({ error: "Failed to initiate Gmail OAuth" }, { status: 500 });
  }
}