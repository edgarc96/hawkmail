import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    
    // For now, we're using email as customer identifier
    // In a real system, you'd have a separate customers table
    
    // Get customer's tickets
    const customerTickets = await db
      .select()
      .from(emails)
      .where(eq(emails.senderEmail, customerId));
    
    if (!customerTickets.length) {
      return NextResponse.json({
        id: customerId,
        name: customerId.split('@')[0],
        email: customerId,
        phone: null,
        company: null,
        avatar: null,
        tags: [],
        customFields: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        lastInteractionAt: null,
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        satisfactionScore: null,
      });
    }
    
    // Calculate stats
    const totalTickets = customerTickets.length;
    const openTickets = customerTickets.filter(t => !t.isResolved).length;
    const resolvedTickets = customerTickets.filter(t => t.isResolved).length;
    const lastInteractionAt = customerTickets.reduce((latest, ticket) => {
      const ticketDate = new Date(ticket.receivedAt);
      return ticketDate > latest ? ticketDate : latest;
    }, new Date(0));
    
    // Extract customer info from first ticket
    const firstTicket = customerTickets[0];
    const name = firstTicket.senderEmail.split('@')[0];
    
    return NextResponse.json({
      id: customerId,
      name: name,
      email: customerId,
      phone: null,
      company: null,
      avatar: null,
      tags: [],
      customFields: {},
      createdAt: new Date(customerTickets[customerTickets.length - 1].createdAt),
      updatedAt: new Date(firstTicket.createdAt),
      lastInteractionAt: lastInteractionAt,
      totalTickets,
      openTickets,
      resolvedTickets,
      satisfactionScore: null,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}
