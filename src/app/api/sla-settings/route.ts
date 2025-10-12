import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { slaSettings } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const priorityLevel = searchParams.get('priorityLevel');
    const isActiveParam = searchParams.get('isActive');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record by ID
    if (id) {
      const idNum = parseInt(id);
      if (isNaN(idNum)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(slaSettings)
        .where(and(eq(slaSettings.id, idNum), eq(slaSettings.userId, session.user.id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'SLA setting not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Build filters array
    const filters = [eq(slaSettings.userId, session.user.id)];

    if (userId) {
      filters.push(eq(slaSettings.userId, userId));
    }

    if (priorityLevel) {
      if (!['high', 'medium', 'low'].includes(priorityLevel)) {
        return NextResponse.json({ 
          error: 'Invalid priority level. Must be: high, medium, or low',
          code: 'INVALID_PRIORITY_LEVEL' 
        }, { status: 400 });
      }
      filters.push(eq(slaSettings.priorityLevel, priorityLevel));
    }

    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      filters.push(eq(slaSettings.isActive, isActive));
    }

    // Execute query with filters
    const results = await db.select()
      .from(slaSettings)
      .where(and(...filters))
      .orderBy(desc(slaSettings.createdAt))
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

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { name, targetReplyTimeMinutes, priorityLevel, isActive } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: 'Name is required',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (targetReplyTimeMinutes === undefined || targetReplyTimeMinutes === null) {
      return NextResponse.json({ 
        error: 'Target reply time in minutes is required',
        code: 'MISSING_TARGET_REPLY_TIME' 
      }, { status: 400 });
    }

    if (!priorityLevel) {
      return NextResponse.json({ 
        error: 'Priority level is required',
        code: 'MISSING_PRIORITY_LEVEL' 
      }, { status: 400 });
    }

    // Validate targetReplyTimeMinutes is positive integer
    const targetTime = parseInt(targetReplyTimeMinutes);
    if (isNaN(targetTime) || targetTime <= 0) {
      return NextResponse.json({ 
        error: 'Target reply time must be a positive integer',
        code: 'INVALID_TARGET_REPLY_TIME' 
      }, { status: 400 });
    }

    // Validate priorityLevel
    if (!['high', 'medium', 'low'].includes(priorityLevel)) {
      return NextResponse.json({ 
        error: 'Priority level must be one of: high, medium, low',
        code: 'INVALID_PRIORITY_LEVEL' 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      userId: session.user.id,
      name: name.trim(),
      targetReplyTimeMinutes: targetTime,
      priorityLevel: priorityLevel,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date()
    };

    // Insert into database
    const newRecord = await db.insert(slaSettings)
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const idNum = parseInt(id);

    // Check if record exists and belongs to user
    const existing = await db.select()
      .from(slaSettings)
      .where(and(eq(slaSettings.id, idNum), eq(slaSettings.userId, session.user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'SLA setting not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete the record
    const deleted = await db.delete(slaSettings)
      .where(and(eq(slaSettings.id, idNum), eq(slaSettings.userId, session.user.id)))
      .returning();

    return NextResponse.json({
      message: 'SLA setting deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}