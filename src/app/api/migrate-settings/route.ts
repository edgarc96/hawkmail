import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // Create user_settings table if it doesn't exist
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
        email_notifications INTEGER NOT NULL DEFAULT 1,
        slack_notifications INTEGER NOT NULL DEFAULT 0,
        auto_assignment INTEGER NOT NULL DEFAULT 1,
        sla_alerts INTEGER NOT NULL DEFAULT 1,
        weekly_reports INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    return NextResponse.json({
      success: true,
      message: 'user_settings table created successfully'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send POST request to create user_settings table'
  });
}
