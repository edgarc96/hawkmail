import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { performanceGoals, timeBands } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET: List all performance goals and time bands
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'email';

    const [goals, bands] = await Promise.all([
      db
        .select()
        .from(performanceGoals)
        .where(
          and(
            eq(performanceGoals.userId, session.user.id),
            eq(performanceGoals.channel, channel)
          )
        ),
      db
        .select()
        .from(timeBands)
        .where(
          and(
            eq(timeBands.userId, session.user.id),
            eq(timeBands.channel, channel)
          )
        ),
    ]);

    return NextResponse.json({ goals, bands });
  } catch (error) {
    console.error('GET /api/performance-goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create or update performance goal
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
    const { channel, goalType, targetMinutes } = body;

    if (!goalType || !targetMinutes) {
      return NextResponse.json(
        { error: 'Goal type and target minutes are required' },
        { status: 400 }
      );
    }

    // Check if goal already exists
    const existing = await db
      .select()
      .from(performanceGoals)
      .where(
        and(
          eq(performanceGoals.userId, session.user.id),
          eq(performanceGoals.channel, channel || 'email'),
          eq(performanceGoals.goalType, goalType)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing goal
      await db
        .update(performanceGoals)
        .set({
          targetMinutes,
          updatedAt: new Date(),
        })
        .where(eq(performanceGoals.id, existing[0].id));

      return NextResponse.json({ message: 'Goal updated successfully' });
    } else {
      // Create new goal
      const newGoal = await db
        .insert(performanceGoals)
        .values({
          userId: session.user.id,
          channel: channel || 'email',
          goalType,
          targetMinutes,
          isActive: true,
        })
        .returning();

      return NextResponse.json(newGoal[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/performance-goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete performance goal
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
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    await db
      .delete(performanceGoals)
      .where(
        and(
          eq(performanceGoals.id, parseInt(id)),
          eq(performanceGoals.userId, session.user.id)
        )
      );

    return NextResponse.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('DELETE /api/performance-goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
