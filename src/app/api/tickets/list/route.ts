import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch only emails/tickets for the current user
    const allEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.userId, user.id))
      .orderBy(desc(emails.createdAt))
      .limit(100);
    
    console.log(`[Tickets List] Found ${allEmails.length} tickets for user ${user.email}`);
    
    return NextResponse.json(allEmails);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
