import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  // Check database connection and schema
  let dbInfo = null;
  let dbError = null;
  
  try {
    const result = await db.all(sql`PRAGMA table_info(user)`) as Array<{name: string}>;
    dbInfo = {
      columns: result.map((r) => r.name),
      columnCount: result.length,
    };
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Unknown error';
  }
  
  const debugInfo = {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ? 'SET' : 'NOT SET',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'SET (length: ' + process.env.BETTER_AUTH_SECRET.length + ')' : 'NOT SET',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
      TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL ? 'SET' : 'NOT SET',
      TURSO_CONNECTION_URL_VALUE: process.env.TURSO_CONNECTION_URL?.substring(0, 50) + '...',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (length: ' + process.env.TURSO_AUTH_TOKEN.length + ')' : 'NOT SET',
    },
    database: dbInfo,
    dbError,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(debugInfo);
}
