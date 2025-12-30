import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or with a secret key
  const debugInfo = {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ? 'SET' : 'NOT SET',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'SET (length: ' + process.env.BETTER_AUTH_SECRET.length + ')' : 'NOT SET',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
      TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL ? 'SET' : 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (length: ' + process.env.TURSO_AUTH_TOKEN.length + ')' : 'NOT SET',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(debugInfo);
}
