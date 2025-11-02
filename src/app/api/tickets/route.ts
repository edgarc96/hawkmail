import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

const VALID_STATUSES = new Set(['new', 'open', 'pending', 'replied', 'solved', 'closed']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);

const SLA_HOURS_BY_PRIORITY: Record<string, number> = {
  urgent: 4,
  high: 8,
  medium: 24,
  low: 48,
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
    const messageBody = typeof body.body === 'string' ? body.body : '';
    const requestedStatus = typeof body.status === 'string' ? body.status.toLowerCase() : undefined;
    const requestedPriority = typeof body.priority === 'string' ? body.priority.toLowerCase() : undefined;

    if (!subject || !customerEmail) {
      return NextResponse.json(
        { error: 'Subject and customer email are required' },
        { status: 400 }
      );
    }

    const status = VALID_STATUSES.has(requestedStatus ?? '') ? requestedStatus! : 'open';
    const priority = VALID_PRIORITIES.has(requestedPriority ?? '') ? requestedPriority! : 'medium';

    const now = new Date();
    const slaHours = SLA_HOURS_BY_PRIORITY[priority] ?? 24;
    const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
    const threadId = `manual-${crypto.randomUUID()}`;

    const [ticket] = await db
      .insert(emails)
      .values({
        userId: user.id,
        subject,
        senderEmail: customerEmail,
        recipientEmail: user.email ?? 'support@hawkmail.app',
        bodyContent: messageBody,
        receivedAt: now,
        firstReplyAt: null,
        status,
        priority,
        slaDeadline,
        isResolved: status === 'solved' || status === 'closed',
        createdAt: now,
        providerId: null,
        assignedTo: null,
        externalId: null,
        threadId,
        rawHeaders: null,
      })
      .returning();

    return NextResponse.json(
      {
        ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
