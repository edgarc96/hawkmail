import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get subscription from database
    const userSubscriptions = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    if (userSubscriptions.length > 0) {
      const sub = userSubscriptions[0];
      return NextResponse.json({
        subscription: {
          plan: sub.planType,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          stripeCustomerId: sub.stripeCustomerId,
          stripeSubscriptionId: sub.stripeSubscriptionId,
        }
      });
    }

    // Return free plan if no subscription exists
    return NextResponse.json({
      subscription: {
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      }
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
