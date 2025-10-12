import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailProviders, emailSyncLogs } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const providerId = parseInt(id);

    const provider = await db
      .select({
        id: emailProviders.id,
        provider: emailProviders.provider,
        email: emailProviders.email,
        isActive: emailProviders.isActive,
        lastSyncAt: emailProviders.lastSyncAt,
      })
      .from(emailProviders)
      .where(and(eq(emailProviders.id, providerId), eq(emailProviders.userId, user.id)))
      .limit(1);

    if (provider.length === 0) {
      return NextResponse.json(
        { error: 'Provider not found', code: 'PROVIDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const syncHistory = await db
      .select({
        id: emailSyncLogs.id,
        syncStatus: emailSyncLogs.syncStatus,
        emailsProcessed: emailSyncLogs.emailsProcessed,
        errorMessage: emailSyncLogs.errorMessage,
        startedAt: emailSyncLogs.startedAt,
        completedAt: emailSyncLogs.completedAt,
      })
      .from(emailSyncLogs)
      .where(and(eq(emailSyncLogs.providerId, providerId), eq(emailSyncLogs.userId, user.id)))
      .orderBy(desc(emailSyncLogs.startedAt))
      .limit(5);

    const allLogs = await db
      .select({
        syncStatus: emailSyncLogs.syncStatus,
      })
      .from(emailSyncLogs)
      .where(and(eq(emailSyncLogs.providerId, providerId), eq(emailSyncLogs.userId, user.id)));

    const totalSyncs = allLogs.length;
    const successfulSyncs = allLogs.filter((log) => log.syncStatus === 'success').length;
    const failedSyncs = allLogs.filter((log) => log.syncStatus === 'failed').length;
    const lastSyncStatus = syncHistory.length > 0 ? syncHistory[0].syncStatus : null;

    return NextResponse.json(
      {
        provider: provider[0],
        syncHistory,
        stats: {
          totalSyncs,
          successfulSyncs,
          failedSyncs,
          lastSyncStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}