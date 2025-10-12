import { NextRequest, NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const msalConfig = {
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/common`,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      },
    };

    const pca = new ConfidentialClientApplication(msalConfig);

    const authCodeUrlParameters = {
      scopes: [
        "https://graph.microsoft.com/Mail.Read",
        "https://graph.microsoft.com/Mail.Send",
        "https://graph.microsoft.com/Mail.ReadWrite",
        "https://graph.microsoft.com/User.Read",
      ],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/oauth/outlook/callback`,
      state: userId,
      prompt: "consent", // Force consent to get refresh token
    };

    const authUrl = await pca.getAuthCodeUrl(authCodeUrlParameters);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Outlook OAuth error:", error);
    return NextResponse.json({ error: "Failed to initiate Outlook OAuth" }, { status: 500 });
  }
}