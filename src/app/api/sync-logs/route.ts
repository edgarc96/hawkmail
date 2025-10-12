import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailSyncLogs, emailProviders } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const providerId = searchParams.get('providerId');
    const syncStatus = searchParams.get('syncStatus');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate syncStatus if provided
    const validStatuses = ['success', 'failed', 'in_progress'];
    if (syncStatus && !validStatuses.includes(syncStatus)) {
      return NextResponse.json(
        {
          error: `Invalid syncStatus. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_SYNC_STATUS',
        },
        { status: 400 }
      );
    }

    // Handle single record fetch by ID
    if (id) {
      const logId = parseInt(id);
      if (isNaN(logId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const log = await db
        .select()
        .from(emailSyncLogs)
        .where(and(eq(emailSyncLogs.id, logId), eq(emailSyncLogs.userId, user.id)))
        .limit(1);

      if (log.length === 0) {
        return NextResponse.json(
          { error: 'Sync log not found', code: 'LOG_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(log[0], { status: 200 });
    }

    // Build query for list with filters
    let query = db
      .select()
      .from(emailSyncLogs)
      .where(eq(emailSyncLogs.userId, user.id))
      .$dynamic();

    // Apply providerId filter if provided (with authorization check)
    if (providerId) {
      const providerIdInt = parseInt(providerId);
      if (isNaN(providerIdInt)) {
        return NextResponse.json(
          { error: 'Valid provider ID is required', code: 'INVALID_PROVIDER_ID' },
          { status: 400 }
        );
      }

      // Verify that the provider belongs to the authenticated user
      const provider = await db
        .select()
        .from(emailProviders)
        .where(
          and(
            eq(emailProviders.id, providerIdInt),
            eq(emailProviders.userId, user.id)
          )
        )
        .limit(1);

      if (provider.length === 0) {
        return NextResponse.json(
          { error: 'Provider not found or access denied', code: 'PROVIDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      query = query.where(
        and(
          eq(emailSyncLogs.userId, user.id),
          eq(emailSyncLogs.providerId, providerIdInt)
        )
      );
    }

    // Apply syncStatus filter if provided
    if (syncStatus) {
      const existingCondition = providerId
        ? and(
            eq(emailSyncLogs.userId, user.id),
            eq(emailSyncLogs.providerId, parseInt(providerId)),
            eq(emailSyncLogs.syncStatus, syncStatus)
          )
        : and(
            eq(emailSyncLogs.userId, user.id),
            eq(emailSyncLogs.syncStatus, syncStatus)
          );

      query = db
        .select()
        .from(emailSyncLogs)
        .where(existingCondition)
        .$dynamic();
    }

    // Apply ordering, pagination and execute query
    const logs = await query
      .orderBy(desc(emailSyncLogs.startedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('GET email sync logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}