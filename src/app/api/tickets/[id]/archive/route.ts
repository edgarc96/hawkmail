import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails, ticketEvents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketIdParam } = await params;
    const ticketId = parseInt(ticketIdParam, 10);

    if (Number.isNaN(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket id' }, { status: 400 });
    }

    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingTickets = await db
      .select()
      .from(emails)
      .where(
        and(
          eq(emails.id, ticketId),
          eq(emails.userId, user.id)
        )
      )
      .limit(1);

    if (!existingTickets.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const previousTicket = existingTickets[0];

    const updated = await db
      .update(emails)
      .set({
        status: 'closed',
        isResolved: true,
      })
      .where(
        and(
          eq(emails.id, ticketId),
          eq(emails.userId, user.id)
        )
      )
      .returning();

    await db.insert(ticketEvents).values({
      ticketId: ticketIdParam,
      eventType: 'archived',
      title: 'Ticket archived',
      description: `Ticket archived by ${user.email ?? 'agent'}`,
      metadata: JSON.stringify({
        previousStatus: previousTicket.status,
      }),
      createdBy: user.id,
    });

    return NextResponse.json({
      success: true,
      ticket: updated[0],
    });
  } catch (error) {
    console.error('Error archiving ticket:', error);
    return NextResponse.json(
      { error: 'Failed to archive ticket' },
      { status: 500 }
    );
  }
}
