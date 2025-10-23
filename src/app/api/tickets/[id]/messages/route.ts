import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ticketMessages, emails } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    // Verify ticket exists
    const ticket = await db
      .select()
      .from(emails)
      .where(eq(emails.id, parseInt(ticketId)))
      .limit(1);
      
    if (!ticket.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Fetch messages for this ticket
    const messages = await db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(asc(ticketMessages.timestamp));
    
    // Build message tree (threading)
    const messageMap = new Map();
    const rootMessages: any[] = [];
    
    // First pass: create map
    messages.forEach(msg => {
      messageMap.set(msg.id, { ...msg, children: [] });
    });
    
    // Second pass: build tree
    messages.forEach(msg => {
      const node = messageMap.get(msg.id);
      if (msg.parentId && messageMap.has(msg.parentId)) {
        const parent = messageMap.get(msg.parentId);
        parent.children.push(node);
      } else {
        rootMessages.push(node);
      }
    });
    
    return NextResponse.json({
      messages: rootMessages,
      total: messages.length,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
