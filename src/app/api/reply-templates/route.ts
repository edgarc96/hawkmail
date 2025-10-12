import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { replyTemplates } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET: List all templates for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const templates = await db
      .select()
      .from(replyTemplates)
      .where(
        and(
          eq(replyTemplates.userId, session.user.id),
          eq(replyTemplates.isActive, true)
        )
      )
      .orderBy(desc(replyTemplates.usageCount));

    return NextResponse.json(templates);
  } catch (error) {
    console.error('GET /api/reply-templates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new template
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
    const { name, subject, content, category } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    const newTemplate = await db
      .insert(replyTemplates)
      .values({
        userId: session.user.id,
        name,
        subject: subject || null,
        content,
        category: category || 'general',
        isActive: true,
        usageCount: 0,
      })
      .returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/reply-templates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete template
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
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await db
      .delete(replyTemplates)
      .where(
        and(
          eq(replyTemplates.id, parseInt(id)),
          eq(replyTemplates.userId, session.user.id)
        )
      );

    return NextResponse.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('DELETE /api/reply-templates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
