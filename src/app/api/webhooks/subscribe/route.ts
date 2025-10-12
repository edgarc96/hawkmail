import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { webhooks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * POST /api/webhooks/subscribe
 * Create a new webhook subscription
 */
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
    const { url, events, headers: customHeaders } = body;

    // Validate
    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'URL and events array are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = [
      'email.received',
      'email.replied',
      'email.assigned',
      'email.resolved',
      'sla.warning',
      'sla.breached',
      'alert.created',
      'team.member.added',
      'team.performance.updated',
    ];

    const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid events',
          invalid: invalidEvents,
          valid_events: validEvents,
        },
        { status: 400 }
      );
    }

    // Generate secret for signature verification
    const secret = crypto.randomBytes(32).toString('hex');

    // Create webhook
    const result = await db.insert(webhooks).values({
      userId: session.user.id,
      url,
      events: JSON.stringify(events),
      secret,
      headers: customHeaders ? JSON.stringify(customHeaders) : null,
      isActive: true,
      retryCount: 3,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      webhook: {
        id: result[0].id,
        url: result[0].url,
        events,
        secret: result[0].secret,
        isActive: result[0].isActive,
      },
      message: 'Webhook subscription created successfully',
    });
  } catch (error) {
    console.error('POST /api/webhooks/subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/subscribe
 * List all webhook subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userWebhooks = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, session.user.id));

    const formatted = userWebhooks.map(w => ({
      id: w.id,
      url: w.url,
      events: JSON.parse(w.events),
      isActive: w.isActive,
      lastTriggeredAt: w.lastTriggeredAt,
      lastStatus: w.lastStatus,
      createdAt: w.createdAt,
    }));

    return NextResponse.json({
      success: true,
      webhooks: formatted,
    });
  } catch (error) {
    console.error('GET /api/webhooks/subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks/subscribe
 * Delete a webhook subscription
 */
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
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID required' },
        { status: 400 }
      );
    }

    await db
      .delete(webhooks)
      .where(
        and(
          eq(webhooks.id, parseInt(webhookId)),
          eq(webhooks.userId, session.user.id)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/webhooks/subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
