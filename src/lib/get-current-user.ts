import { NextRequest } from 'next/server';
import { auth } from './auth';
import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  role: 'admin' | 'manager' | 'agent';
  organizationId: string | null;
}

export async function getCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return null;
    }

    // Get full user details including role
    const userDetails = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (userDetails.length === 0) {
      return null;
    }

    const user = userDetails[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role as 'admin' | 'manager' | 'agent') || 'admin',
      organizationId: user.organizationId,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
