import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { NextRequest } from "next/server";

// Derive a single canonical app URL for both local and production
const appUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000';

export const auth = betterAuth({
  baseURL: appUrl,
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    appUrl,
    'http://localhost:3000',
    'http://192.168.7.103:3000',
    'https://hiho.vercel.app',
    'https://hawkmail.app',
    'https://www.hawkmail.app',
    'https://time-to-reply-eddies-projects.vercel.app',
  ],
  advanced: {
    // Use secure cookies in production environments
    useSecureCookies: process.env.NODE_ENV === 'production' ? true : false,
    cookiePrefix: 'better-auth',
  },
});

/**
 * Get the current authenticated user from the request
 * @param request - Next.js request object
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });
    
    if (!session?.user) {
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
