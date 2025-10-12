import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails, teamMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const { id } = await params;
    const emailId = id;
    if (!emailId || isNaN(parseInt(emailId))) {
      return NextResponse.json(
        { error: 'Valid email ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { teamMemberId } = body;

    if (!teamMemberId) {
      return NextResponse.json(
        { error: 'Team member ID is required', code: 'MISSING_TEAM_MEMBER_ID' },
        { status: 400 }
      );
    }

    // Check if email exists
    const email = await db
      .select()
      .from(emails)
      .where(and(eq(emails.id, parseInt(emailId)), eq(emails.userId, user.id)))
      .limit(1);

    if (email.length === 0) {
      return NextResponse.json(
        { error: 'Email not found', code: 'EMAIL_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if team member exists
    const member = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.id, teamMemberId), eq(teamMembers.userId, user.id)))
      .limit(1);

    if (member.length === 0) {
      return NextResponse.json(
        { error: 'Team member not found', code: 'TEAM_MEMBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Assign email to team member
    const updated = await db
      .update(emails)
      .set({ assignedTo: teamMemberId })
      .where(and(eq(emails.id, parseInt(emailId)), eq(emails.userId, user.id)))
      .returning();

    return NextResponse.json(
      {
        email: updated[0],
        assignedTo: member[0],
        message: `Email assigned to ${member[0].name}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/emails/[id]/assign error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// Unassign email
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const { id } = await params;
    const emailId = id;
    if (!emailId || isNaN(parseInt(emailId))) {
      return NextResponse.json(
        { error: 'Valid email ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Unassign email
    const updated = await db
      .update(emails)
      .set({ assignedTo: null })
      .where(and(eq(emails.id, parseInt(emailId)), eq(emails.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Email not found', code: 'EMAIL_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        email: updated[0],
        message: 'Email unassigned successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/emails/[id]/assign error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
