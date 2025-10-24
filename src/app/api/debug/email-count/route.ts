import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { sql } from 'drizzle-orm';
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
    
    // Get total count
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(emails);
    
    const totalCount = result[0]?.count || 0;
    
    return NextResponse.json({ 
      totalCount,
      message: `Total emails in database: ${totalCount}`
    });
  } catch (error) {
    console.error('Error counting emails:', error);
    return NextResponse.json(
      { error: 'Failed to count emails' },
      { status: 500 }
    );
  }
}
