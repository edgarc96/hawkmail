import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { slaSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

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

    // Validate ID
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Extract allowed update fields
    const { name, targetReplyTimeMinutes, priorityLevel, isActive } = body;

    // Validate at least one field is provided
    if (
      name === undefined &&
      targetReplyTimeMinutes === undefined &&
      priorityLevel === undefined &&
      isActive === undefined
    ) {
      return NextResponse.json(
        {
          error: 'At least one field must be provided for update',
          code: 'NO_UPDATE_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate targetReplyTimeMinutes if provided
    if (targetReplyTimeMinutes !== undefined) {
      if (
        typeof targetReplyTimeMinutes !== 'number' ||
        targetReplyTimeMinutes <= 0 ||
        !Number.isInteger(targetReplyTimeMinutes)
      ) {
        return NextResponse.json(
          {
            error: 'Target reply time must be a positive integer',
            code: 'INVALID_TARGET_REPLY_TIME',
          },
          { status: 400 }
        );
      }
    }

    // Validate priorityLevel if provided
    if (priorityLevel !== undefined) {
      const validPriorityLevels = ['high', 'medium', 'low'];
      if (!validPriorityLevels.includes(priorityLevel)) {
        return NextResponse.json(
          {
            error: 'Priority level must be one of: high, medium, low',
            code: 'INVALID_PRIORITY_LEVEL',
          },
          { status: 400 }
        );
      }
    }

    // Check if SLA setting exists and belongs to user
    const existingRecord = await db
      .select()
      .from(slaSettings)
      .where(and(eq(slaSettings.id, parseInt(id)), eq(slaSettings.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'SLA setting not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: {
      name?: string;
      targetReplyTimeMinutes?: number;
      priorityLevel?: string;
      isActive?: boolean;
    } = {};

    if (name !== undefined) {
      updates.name = typeof name === 'string' ? name.trim() : name;
    }
    if (targetReplyTimeMinutes !== undefined) {
      updates.targetReplyTimeMinutes = targetReplyTimeMinutes;
    }
    if (priorityLevel !== undefined) {
      updates.priorityLevel = priorityLevel;
    }
    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    // Update SLA setting
    const updated = await db
      .update(slaSettings)
      .set(updates)
      .where(and(eq(slaSettings.id, parseInt(id)), eq(slaSettings.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update SLA setting', code: 'UPDATE_FAILED' },
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