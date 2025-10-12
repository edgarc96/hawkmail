import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailProviders } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const provider = searchParams.get('provider');
    const isActiveParam = searchParams.get('isActive');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single provider by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const providerRecord = await db
        .select()
        .from(emailProviders)
        .where(and(eq(emailProviders.id, parseInt(id)), eq(emailProviders.userId, user.id)))
        .limit(1);

      if (providerRecord.length === 0) {
        return NextResponse.json(
          { error: 'Provider not found', code: 'PROVIDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(providerRecord[0]);
    }

    // List providers with filters
    const conditions = [eq(emailProviders.userId, user.id)];

    if (provider) {
      if (provider !== 'gmail' && provider !== 'outlook') {
        return NextResponse.json(
          { error: 'Provider must be gmail or outlook', code: 'INVALID_PROVIDER' },
          { status: 400 }
        );
      }
      conditions.push(eq(emailProviders.provider, provider));
    }

    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      conditions.push(eq(emailProviders.isActive, isActive));
    }

    const results = await db
      .select()
      .from(emailProviders)
      .where(and(...conditions))
      .orderBy(desc(emailProviders.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const { provider, email, accessToken, refreshToken, tokenExpiresAt, scope, isActive } = body;

    // Validate required fields
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required', code: 'MISSING_PROVIDER' },
        { status: 400 }
      );
    }

    if (provider !== 'gmail' && provider !== 'outlook') {
      return NextResponse.json(
        { error: 'Provider must be gmail or outlook', code: 'INVALID_PROVIDER' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
      return NextResponse.json(
        { error: 'Access token is required', code: 'MISSING_ACCESS_TOKEN' },
        { status: 400 }
      );
    }

    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
      return NextResponse.json(
        { error: 'Refresh token is required', code: 'MISSING_REFRESH_TOKEN' },
        { status: 400 }
      );
    }

    if (!tokenExpiresAt) {
      return NextResponse.json(
        { error: 'Token expires at is required', code: 'MISSING_TOKEN_EXPIRES_AT' },
        { status: 400 }
      );
    }

    // Validate tokenExpiresAt is a valid timestamp
    const expiresAtDate = new Date(tokenExpiresAt);
    if (isNaN(expiresAtDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid token expiration timestamp', code: 'INVALID_TOKEN_EXPIRES_AT' },
        { status: 400 }
      );
    }

    if (!scope || typeof scope !== 'string' || scope.trim() === '') {
      return NextResponse.json(
        { error: 'Scope is required', code: 'MISSING_SCOPE' },
        { status: 400 }
      );
    }

    const now = new Date();

    const newProvider = await db
      .insert(emailProviders)
      .values({
        userId: user.id,
        provider: provider.trim(),
        email: email.trim().toLowerCase(),
        accessToken: accessToken.trim(),
        refreshToken: refreshToken.trim(),
        tokenExpiresAt: expiresAtDate,
        scope: scope.trim(),
        isActive: isActive !== undefined ? isActive : true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newProvider[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if provider exists and belongs to user
    const existingProvider = await db
      .select()
      .from(emailProviders)
      .where(and(eq(emailProviders.id, parseInt(id)), eq(emailProviders.userId, user.id)))
      .limit(1);

    if (existingProvider.length === 0) {
      return NextResponse.json(
        { error: 'Provider not found', code: 'PROVIDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(emailProviders)
      .where(and(eq(emailProviders.id, parseInt(id)), eq(emailProviders.userId, user.id)))
      .returning();

    return NextResponse.json({
      message: 'Provider disconnected successfully',
      provider: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}