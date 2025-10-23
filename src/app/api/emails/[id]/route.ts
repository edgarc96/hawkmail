import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    // Validate ID parameter
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const emailId = parseInt(id);

    // Get email with full content
    const email = await db
      .select({
        id: emails.id,
        subject: emails.subject,
        senderEmail: emails.senderEmail,
        recipientEmail: emails.recipientEmail,
        // bodyContent: emails.bodyContent, // Column doesn't exist - migration failed
        receivedAt: emails.receivedAt,
        firstReplyAt: emails.firstReplyAt,
        status: emails.status,
        priority: emails.priority,
        slaDeadline: emails.slaDeadline,
        isResolved: emails.isResolved,
        assignedTo: emails.assignedTo,
        externalId: emails.externalId,
        threadId: emails.threadId,
        providerId: emails.providerId,
        createdAt: emails.createdAt,
      })
      .from(emails)
      .where(and(eq(emails.id, emailId), eq(emails.userId, user.id)))
      .limit(1);

    if (email.length === 0) {
      return NextResponse.json(
        { error: 'Email not found', code: 'EMAIL_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Format dates as ISO strings
    const formattedEmail = {
      ...email[0],
      receivedAt: email[0].receivedAt.toISOString(),
      slaDeadline: email[0].slaDeadline.toISOString(),
      firstReplyAt: email[0].firstReplyAt?.toISOString() || null,
      createdAt: email[0].createdAt.toISOString(),
    };

    return NextResponse.json(formattedEmail, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    // Validate ID parameter
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const emailId = parseInt(id);

    // Parse request body
    const body = await request.json();

    // Security check: prevent userId modification
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Validate allowed fields
    const {
      subject,
      senderEmail,
      recipientEmail,
      receivedAt,
      firstReplyAt,
      status,
      priority,
      slaDeadline,
      isResolved,
    } = body;

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['pending', 'replied', 'overdue'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Status must be one of: pending, replied, overdue',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    if (priority !== undefined) {
      const validPriorities = ['high', 'medium', 'low'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          {
            error: 'Priority must be one of: high, medium, low',
            code: 'INVALID_PRIORITY',
          },
          { status: 400 }
        );
      }
    }

    // Validate timestamps if provided
    if (receivedAt !== undefined) {
      const receivedAtDate = new Date(receivedAt);
      if (isNaN(receivedAtDate.getTime())) {
        return NextResponse.json(
          {
            error: 'receivedAt must be a valid date',
            code: 'INVALID_RECEIVED_AT',
          },
          { status: 400 }
        );
      }
    }

    if (firstReplyAt !== undefined && firstReplyAt !== null) {
      const firstReplyAtDate = new Date(firstReplyAt);
      if (isNaN(firstReplyAtDate.getTime())) {
        return NextResponse.json(
          {
            error: 'firstReplyAt must be a valid date',
            code: 'INVALID_FIRST_REPLY_AT',
          },
          { status: 400 }
        );
      }
    }

    if (slaDeadline !== undefined) {
      const slaDeadlineDate = new Date(slaDeadline);
      if (isNaN(slaDeadlineDate.getTime())) {
        return NextResponse.json(
          {
            error: 'slaDeadline must be a valid date',
            code: 'INVALID_SLA_DEADLINE',
          },
          { status: 400 }
        );
      }
    }

    // Check if email exists and belongs to user
    const existingEmail = await db
      .select()
      .from(emails)
      .where(and(eq(emails.id, emailId), eq(emails.userId, user.id)))
      .limit(1);

    if (existingEmail.length === 0) {
      return NextResponse.json(
        { error: 'Email not found', code: 'EMAIL_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (subject !== undefined) updateData.subject = subject.trim();
    if (senderEmail !== undefined) updateData.senderEmail = senderEmail.trim();
    if (recipientEmail !== undefined)
      updateData.recipientEmail = recipientEmail.trim();
    if (receivedAt !== undefined)
      updateData.receivedAt = new Date(receivedAt);
    if (firstReplyAt !== undefined)
      updateData.firstReplyAt = firstReplyAt ? new Date(firstReplyAt) : null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (slaDeadline !== undefined)
      updateData.slaDeadline = new Date(slaDeadline);
    if (isResolved !== undefined) updateData.isResolved = isResolved;

    // Update email record
    const updated = await db
      .update(emails)
      .set(updateData)
      .where(and(eq(emails.id, emailId), eq(emails.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update email', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}