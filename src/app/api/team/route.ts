import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = session.user;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userIdParam = searchParams.get('userId');
    const role = searchParams.get('role');
    const isActiveParam = searchParams.get('isActive');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(teamMembers)
        .where(and(
          eq(teamMembers.id, parseInt(id)),
          eq(teamMembers.userId, user.id)
        ))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Team member not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Build filters for list query
    const filters = [eq(teamMembers.userId, user.id)];

    if (userIdParam) {
      filters.push(eq(teamMembers.userId, userIdParam));
    }

    if (role) {
      if (!['agent', 'manager'].includes(role)) {
        return NextResponse.json({ 
          error: "Role must be 'agent' or 'manager'",
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }
      filters.push(eq(teamMembers.role, role));
    }

    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      filters.push(eq(teamMembers.isActive, isActive));
    }

    if (search) {
      const searchCondition = or(
        like(teamMembers.name, `%${search}%`),
        like(teamMembers.email, `%${search}%`)
      );
      filters.push(searchCondition!);
    }

    const results = await db.select()
      .from(teamMembers)
      .where(and(...filters))
      .orderBy(desc(teamMembers.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = session.user;

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { name, email, role, isActive } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ 
        error: "Role is required",
        code: "MISSING_ROLE" 
      }, { status: 400 });
    }

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Validate role
    if (!['agent', 'manager'].includes(role)) {
      return NextResponse.json({ 
        error: "Role must be 'agent' or 'manager'",
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      userId: user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdAt: new Date()
    };

    const newRecord = await db.insert(teamMembers)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = session.user;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "ID is required",
        code: "MISSING_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists and belongs to user
    const existing = await db.select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.id, parseInt(id)),
        eq(teamMembers.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Team member not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(teamMembers)
      .where(and(
        eq(teamMembers.id, parseInt(id)),
        eq(teamMembers.userId, user.id)
      ))
      .returning();

    return NextResponse.json({ 
      message: 'Team member deleted successfully',
      deletedRecord: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}