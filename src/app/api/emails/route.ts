import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { eq, and, like, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = session.user;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single email by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const email = await db
        .select({
          id: emails.id,
          subject: emails.subject,
          senderEmail: emails.senderEmail,
          recipientEmail: emails.recipientEmail,
          bodyContent: emails.bodyContent,
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
        .where(and(eq(emails.id, parseInt(id)), eq(emails.userId, user.id)))
        .limit(1);

      if (email.length === 0) {
        return NextResponse.json(
          { error: 'Email not found', code: 'EMAIL_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(email[0], { status: 200 });
    }

    // Build query with filters
    const conditions = [eq(emails.userId, user.id)];

    if (userId) {
      conditions.push(eq(emails.userId, userId));
    }

    if (status) {
      if (!['pending', 'replied', 'overdue'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: pending, replied, or overdue', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(emails.status, status));
    }

    if (priority) {
      if (!['high', 'medium', 'low'].includes(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority. Must be: high, medium, or low', code: 'INVALID_PRIORITY' },
          { status: 400 }
        );
      }
      conditions.push(eq(emails.priority, priority));
    }

    if (search) {
      const searchCondition = or(
        like(emails.subject, `%${search}%`),
        like(emails.senderEmail, `%${search}%`),
        like(emails.recipientEmail, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const results = await db
      .select({
        id: emails.id,
        subject: emails.subject,
        senderEmail: emails.senderEmail,
        recipientEmail: emails.recipientEmail,
        bodyContent: emails.bodyContent,
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
      .where(and(...conditions))
      .orderBy(desc(emails.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED' 
        },
        { status: 400 }
      );
    }

    const {
      subject,
      senderEmail,
      recipientEmail,
      receivedAt,
      slaDeadline,
      firstReplyAt,
      status,
      priority,
      isResolved
    } = body;

    // Validate required fields
    if (!subject || !senderEmail || !recipientEmail || !receivedAt || !slaDeadline) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: subject, senderEmail, recipientEmail, receivedAt, slaDeadline',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Validate timestamps
    const receivedAtDate = new Date(receivedAt);
    const slaDeadlineDate = new Date(slaDeadline);

    if (isNaN(receivedAtDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid receivedAt timestamp', code: 'INVALID_RECEIVED_AT' },
        { status: 400 }
      );
    }

    if (isNaN(slaDeadlineDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid slaDeadline timestamp', code: 'INVALID_SLA_DEADLINE' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['pending', 'replied', 'overdue'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, replied, or overdue', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be: high, medium, or low', code: 'INVALID_PRIORITY' },
        { status: 400 }
      );
    }

    // Validate firstReplyAt if provided
    let firstReplyAtDate = null;
    if (firstReplyAt) {
      firstReplyAtDate = new Date(firstReplyAt);
      if (isNaN(firstReplyAtDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid firstReplyAt timestamp', code: 'INVALID_FIRST_REPLY_AT' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData = {
      userId: user.id,
      subject: subject.trim(),
      senderEmail: senderEmail.trim().toLowerCase(),
      recipientEmail: recipientEmail.trim().toLowerCase(),
      receivedAt: receivedAtDate,
      slaDeadline: slaDeadlineDate,
      firstReplyAt: firstReplyAtDate,
      status: status || 'pending',
      priority: priority || 'medium',
      isResolved: isResolved !== undefined ? isResolved : false,
      createdAt: new Date()
    };

    const newEmail = await db.insert(emails).values(insertData).returning();

    return NextResponse.json(newEmail[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if email exists and belongs to user
    const existing = await db
      .select({
        id: emails.id,
        subject: emails.subject,
        senderEmail: emails.senderEmail,
        recipientEmail: emails.recipientEmail,
        bodyContent: emails.bodyContent,
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
      .where(and(eq(emails.id, parseInt(id)), eq(emails.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Email not found', code: 'EMAIL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(emails)
      .where(and(eq(emails.id, parseInt(id)), eq(emails.userId, user.id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Email deleted successfully',
        email: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}