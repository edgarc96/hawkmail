import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails, ticketEvents, ticketMessages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    // Get current authenticated user
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch ticket only if it belongs to the current user
    const ticket = await db
      .select()
      .from(emails)
      .where(
        and(
          eq(emails.id, parseInt(ticketId)),
          eq(emails.userId, user.id)
        )
      )
      .limit(1);
      
    if (!ticket.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    return NextResponse.json(ticket[0]);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const updates = await req.json();
    
    // Get current authenticated user
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update ticket only if it belongs to the current user
    const updated = await db
      .update(emails)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(emails.id, parseInt(ticketId)),
          eq(emails.userId, user.id)
        )
      )
      .returning();
    
    if (!updated.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const ticket = await db
      .select({ id: emails.id })
      .from(emails)
      .where(
        and(
          eq(emails.id, ticketId),
          eq(emails.userId, user.id)
        )
      )
      .limit(1);

    if (!ticket.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await db.delete(ticketMessages).where(eq(ticketMessages.ticketId, ticketIdParam));
    await db.delete(ticketEvents).where(eq(ticketEvents.ticketId, ticketIdParam));
    await db
      .delete(emails)
      .where(
        and(
          eq(emails.id, ticketId),
          eq(emails.userId, user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
