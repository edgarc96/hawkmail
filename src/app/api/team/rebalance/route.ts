import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AutoAssignmentService } from '@/lib/services/auto-assignment.service';

/**
 * POST /api/team/rebalance
 * Rebalance workload across team members
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

    const result = await AutoAssignmentService.rebalanceWorkload(session.user.id);

    return NextResponse.json({
      success: true,
      reassigned: result.reassigned,
      message: result.message,
    });
  } catch (error) {
    console.error('POST /api/team/rebalance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
