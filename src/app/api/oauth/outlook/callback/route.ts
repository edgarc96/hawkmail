import { NextRequest, NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { db } from "@/db";
import { emailProviders } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    const userId = state;

    const msalConfig = {
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/common`,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      },
    };

    const pca = new ConfidentialClientApplication(msalConfig);

    const tokenRequest = {
      code,
      scopes: [
        "https://graph.microsoft.com/Mail.Read",
        "https://graph.microsoft.com/Mail.Send",
        "https://graph.microsoft.com/Mail.ReadWrite",
        "https://graph.microsoft.com/User.Read",
      ],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/oauth/outlook/callback`,
    };

    const response = await pca.acquireTokenByCode(tokenRequest);

    if (!response || !response.accessToken) {
      throw new Error("Failed to get access token");
    }

    const { accessToken, account, expiresOn } = response;
    const email = account?.username;

    if (!email) {
      return NextResponse.json({ error: "Failed to get user email" }, { status: 500 });
    }

    // Calculate token expiry time
    const expiresAt = expiresOn || new Date(Date.now() + 3600 * 1000); // Default 1 hour

    // Note: MSAL handles refresh tokens internally through its cache
    // We'll store a placeholder for refreshToken as we'll use MSAL for token refresh

    // Check if provider already exists
    const existingProvider = await db
      .select()
      .from(emailProviders)
      .where(and(
        eq(emailProviders.userId, userId),
        eq(emailProviders.provider, "outlook")
      ))
      .limit(1);

    if (existingProvider.length > 0) {
      // Update existing provider
      await db
        .update(emailProviders)
        .set({
          email,
          accessToken,
          refreshToken: "managed_by_msal", // MSAL manages refresh tokens
          tokenExpiresAt: expiresAt,
          isActive: true,
          lastSyncAt: null,
        })
        .where(eq(emailProviders.id, existingProvider[0].id));
    } else {
      // Insert new provider
      await db.insert(emailProviders).values({
        userId,
        provider: "outlook",
        email,
        accessToken,
        refreshToken: "managed_by_msal",
        tokenExpiresAt: expiresAt,
        scope: "Mail.Read Mail.Send offline_access",
        isActive: true,
      });
    }

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?section=settings&success=outlook_connected`
    );
  } catch (error) {
    console.error("Outlook OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?error=oauth_failed`
    );
  }
}