import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AutoAssignmentService, AssignmentStrategy } from '@/lib/services/auto-assignment.service';

/**
 * POST /api/emails/auto-assign
 * Auto-assign one or multiple emails to team members
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
    const { emailId, emailIds, strategy } = body;

    // Validate strategy
    const assignmentStrategy: AssignmentStrategy = {
      type: strategy?.type || 'least-loaded',
      considerPriority: strategy?.considerPriority,
      considerWorkload: strategy?.considerWorkload,
      considerPerformance: strategy?.considerPerformance,
    };

    // Single email assignment
    if (emailId) {
      const result = await AutoAssignmentService.autoAssignEmail(
        emailId,
        session.user.id,
        assignmentStrategy
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          emailId,
          assignedTo: result.assignedTo,
          message: 'Email assigned successfully',
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.reason || 'Assignment failed',
          },
          { status: 400 }
        );
      }
    }

    // Bulk assignment
    if (emailIds && Array.isArray(emailIds)) {
      const result = await AutoAssignmentService.bulkAutoAssign(
        emailIds,
        session.user.id,
        assignmentStrategy
      );

      return NextResponse.json({
        success: true,
        assigned: result.assigned,
        failed: result.failed,
        message: `Assigned ${result.assigned} emails, ${result.failed} failed`,
      });
    }

    return NextResponse.json(
      { error: 'Either emailId or emailIds must be provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('POST /api/emails/auto-assign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/emails/auto-assign/workload
 * Get current team workload for assignment decisions
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

    const workload = await AutoAssignmentService.getTeamWorkload(session.user.id);

    return NextResponse.json({
      success: true,
      workload,
    });
  } catch (error) {
    console.error('GET /api/emails/auto-assign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
