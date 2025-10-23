import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails, ticketMessages, ticketEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const { content, isInternal, recipientEmail, userId, userName, userEmail } = await req.json();
    
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    // Get ticket
    const ticket = await db
      .select()
      .from(emails)
      .where(eq(emails.id, parseInt(ticketId)))
      .limit(1);
      
    if (!ticket.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    const ticketData = ticket[0];
    const timestamp = new Date();
    
    // Save message to database
    const savedMessage = await db.insert(ticketMessages).values({
      ticketId: ticketId,
      threadId: ticketData.threadId || ticketId,
      parentId: null, // TODO: Link to parent message if replying to specific message
      isInternal: isInternal || false,
      senderId: userId,
      senderName: userName || 'Agent',
      senderEmail: userEmail || 'agent@example.com',
      recipientEmail: recipientEmail || ticketData.senderEmail,
      subject: ticketData.subject,
      htmlContent: content,
      textContent: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      rawHeaders: JSON.stringify({}),
      messageId: `<${Date.now()}.${Math.random().toString(36).substring(7)}@hawkmail>`,
      inReplyTo: null,
      references: null,
      timestamp: timestamp,
      isRead: true,
    }).returning();
    
    // If not internal, send email via Gmail/SMTP
    if (!isInternal) {
      try {
        // TODO: Get user's email provider settings
        // TODO: Send email via Gmail API or SMTP
        // For now, log that we would send
        console.log(`📧 Would send email to ${recipientEmail} with content:`, content.substring(0, 100));
        
        // Update ticket status and reply time
        await db
          .update(emails)
          .set({
            firstReplyAt: ticketData.firstReplyAt || timestamp,
            status: 'replied',
          })
          .where(eq(emails.id, parseInt(ticketId)));
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue - we've saved the message even if sending failed
      }
    }
    
    // Create timeline event
    await db.insert(ticketEvents).values({
      ticketId: ticketId,
      eventType: isInternal ? 'note_added' : 'replied',
      title: isInternal ? 'Internal note added' : 'Reply sent',
      description: isInternal 
        ? `${userName} added an internal note`
        : `${userName} replied to customer`,
      metadata: JSON.stringify({
        messageId: savedMessage[0].id,
        contentLength: content.length,
      }),
      createdBy: userId,
    });
    
    return NextResponse.json({
      success: true,
      message: savedMessage[0],
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
