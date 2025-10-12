import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { timeBands } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// POST: Create time band
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { channel, bandType, minMinutes, maxMinutes, label, color } = body;

    if (!bandType || minMinutes === undefined || maxMinutes === undefined || !label) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newBand = await db
      .insert(timeBands)
      .values({
        userId: session.user.id,
        channel: channel || 'email',
        bandType,
        minMinutes,
        maxMinutes,
        label,
        color: color || '#6b7280',
      })
      .returning();

    return NextResponse.json(newBand[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/time-bands error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete time band
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Band ID is required' },
        { status: 400 }
      );
    }

    await db
      .delete(timeBands)
      .where(
        and(
          eq(timeBands.id, parseInt(id)),
          eq(timeBands.userId, session.user.id)
        )
      );

    return NextResponse.json({ message: 'Band deleted' });
  } catch (error) {
    console.error('DELETE /api/time-bands error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
