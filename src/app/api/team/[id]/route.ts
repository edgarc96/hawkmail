import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
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

    // Validate ID parameter
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

    // Extract allowed fields
    const { name, email, role, isActive } = body;

    // Validate at least one field is provided
    if (name === undefined && email === undefined && role === undefined && isActive === undefined) {
      return NextResponse.json(
        {
          error: 'At least one field must be provided for update',
          code: 'NO_UPDATE_FIELDS',
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: {
      name?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
    } = {};

    // Validate and add name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    // Validate and add email if provided
    if (email !== undefined) {
      if (typeof email !== 'string' || email.trim().length === 0) {
        return NextResponse.json(
          { error: 'Email must be a non-empty string', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = email.trim().toLowerCase();
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { error: 'Email must be a valid email address', code: 'INVALID_EMAIL_FORMAT' },
          { status: 400 }
        );
      }
      updates.email = trimmedEmail;
    }

    // Validate and add role if provided
    if (role !== undefined) {
      if (role !== 'agent' && role !== 'manager') {
        return NextResponse.json(
          {
            error: 'Role must be either "agent" or "manager"',
            code: 'INVALID_ROLE',
          },
          { status: 400 }
        );
      }
      updates.role = role;
    }

    // Validate and add isActive if provided
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE' },
          { status: 400 }
        );
      }
      updates.isActive = isActive;
    }

    // Check if team member exists and belongs to authenticated user
    const existingMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.id, parseInt(id)),
          eq(teamMembers.userId, user.id)
        )
      )
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Team member not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update team member
    const updated = await db
      .update(teamMembers)
      .set(updates)
      .where(
        and(
          eq(teamMembers.id, parseInt(id)),
          eq(teamMembers.userId, user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Team member not found', code: 'NOT_FOUND' },
        { status: 404 }
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