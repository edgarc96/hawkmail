import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailProviders } from '@/db/schema';
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
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
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
    const { accessToken, refreshToken, tokenExpiresAt } = body;

    // Validate at least one field is provided
    if (
      accessToken === undefined &&
      refreshToken === undefined &&
      tokenExpiresAt === undefined
    ) {
      return NextResponse.json(
        {
          error: 'At least one field must be provided for update',
          code: 'NO_FIELDS_PROVIDED',
        },
        { status: 400 }
      );
    }

    // Build update object with validation
    const updates: {
      accessToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: Date;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    // Validate accessToken if provided
    if (accessToken !== undefined) {
      if (typeof accessToken !== 'string' || accessToken.trim() === '') {
        return NextResponse.json(
          {
            error: 'Access token must be a non-empty string',
            code: 'INVALID_ACCESS_TOKEN',
          },
          { status: 400 }
        );
      }
      updates.accessToken = accessToken.trim();
    }

    // Validate refreshToken if provided
    if (refreshToken !== undefined) {
      if (typeof refreshToken !== 'string' || refreshToken.trim() === '') {
        return NextResponse.json(
          {
            error: 'Refresh token must be a non-empty string',
            code: 'INVALID_REFRESH_TOKEN',
          },
          { status: 400 }
        );
      }
      updates.refreshToken = refreshToken.trim();
    }

    // Validate tokenExpiresAt if provided
    if (tokenExpiresAt !== undefined) {
      const expiresDate = new Date(tokenExpiresAt);
      if (isNaN(expiresDate.getTime())) {
        return NextResponse.json(
          {
            error: 'Token expires at must be a valid timestamp',
            code: 'INVALID_TOKEN_EXPIRES_AT',
          },
          { status: 400 }
        );
      }
      updates.tokenExpiresAt = expiresDate;
    }

    // Check if provider exists and belongs to authenticated user
    const existingProvider = await db
      .select()
      .from(emailProviders)
      .where(
        and(
          eq(emailProviders.id, parseInt(id)),
          eq(emailProviders.userId, user.id)
        )
      )
      .limit(1);

    if (existingProvider.length === 0) {
      return NextResponse.json(
        {
          error: 'Email provider not found',
          code: 'PROVIDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Update the provider
    const updated = await db
      .update(emailProviders)
      .set(updates)
      .where(
        and(
          eq(emailProviders.id, parseInt(id)),
          eq(emailProviders.userId, user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update email provider',
          code: 'UPDATE_FAILED',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
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

    // Check if provider exists and belongs to authenticated user
    const existingProvider = await db
      .select()
      .from(emailProviders)
      .where(
        and(
          eq(emailProviders.id, parseInt(id)),
          eq(emailProviders.userId, user.id)
        )
      )
      .limit(1);

    if (existingProvider.length === 0) {
      return NextResponse.json(
        {
          error: 'Email provider not found',
          code: 'PROVIDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete the provider
    await db
      .delete(emailProviders)
      .where(
        and(
          eq(emailProviders.id, parseInt(id)),
          eq(emailProviders.userId, user.id)
        )
      );

    return NextResponse.json(
      { success: true, message: 'Email provider deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}