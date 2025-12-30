import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { NextRequest } from "next/server";

// Derive a single canonical app URL for both local and production
const appUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000';

// For debugging
console.log('Better Auth URL:', appUrl);
console.log('Environment:', process.env.NODE_ENV);
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-key-for-development-only',
  baseURL: appUrl,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for development
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          console.log('Creating user with data:', JSON.stringify(user, null, 2));
          return { data: user };
        },
        after: async (user) => {
          console.log('User created in DB:', user.id);
        },
      },
    },
    account: {
      create: {
        before: async (account) => {
          console.log('Creating account with data:', JSON.stringify(account, null, 2));
          return { data: account };
        },
        after: async (account) => {
          console.log('Account created in DB:', account.id);
        },
      },
    },
  },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${appUrl}/api/auth/callback/google`,
      // Add additional Google OAuth configuration
      scope: ['openid', 'email', 'profile'],
    },
  } : {},
  trustedOrigins: async (request) => {
    const origin = request.headers.get('origin') || '';
    const baseOrigins = [
      appUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://192.168.7.103:3000',
      'http://192.168.7.103:3001',
      'https://hawkmail.app',
      'https://www.hawkmail.app',
      'https://time-to-reply-eddies-projects.vercel.app',
      'https://time-to-reply-dked27ub8-eddies-projects.vercel.app',
    ];
    
    // In development, allow any localhost, 127.0.0.1, or local network origin
    if (process.env.NODE_ENV === 'development') {
      if (origin.match(/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+$/)) {
        return [...baseOrigins, origin];
      }
    }
    
    // In production, allow Vercel preview deployments
    if (origin.match(/^https:\/\/time-to-reply-.*\.vercel\.app$/)) {
      return [...baseOrigins, origin];
    }
    
    // Also allow the specific deployment URL
    if (origin === 'https://time-to-reply-dked27ub8-eddies-projects.vercel.app') {
      return [...baseOrigins, origin];
    }
    
    return baseOrigins;
  },
  advanced: {
    // Use secure cookies in production environments
    useSecureCookies: process.env.NODE_ENV === 'production' ? true : false,
    cookiePrefix: 'better-auth',
    // Cross-subdomain cookies
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
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
