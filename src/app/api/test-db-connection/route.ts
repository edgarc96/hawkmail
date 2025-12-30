import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  const connectionUrl = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!connectionUrl || !authToken) {
    return NextResponse.json({
      success: false,
      error: 'Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN',
    }, { status: 500 });
  }

  try {
    const client = createClient({
      url: connectionUrl,
      authToken: authToken,
    });

    // Test simple query
    const result = await client.execute('SELECT COUNT(*) as count FROM user');
    
    return NextResponse.json({
      success: true,
      connectionUrl: connectionUrl.substring(0, 50) + '...',
      userCount: result.rows[0]?.count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionUrl: connectionUrl.substring(0, 50) + '...',
    }, { status: 500 });
  }
}
