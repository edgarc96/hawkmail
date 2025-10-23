import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Fetch all emails/tickets ordered by creation date
    const allEmails = await db
      .select()
      .from(emails)
      .orderBy(desc(emails.createdAt))
      .limit(100);
    
    return NextResponse.json(allEmails);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
