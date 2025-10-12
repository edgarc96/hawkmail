/**
 * Auto-Assignment Service
 * Intelligent email assignment based on workload, availability, and performance
 */

import { db } from '@/db';
import { emails, teamMembers } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface AssignmentStrategy {
  type: 'round-robin' | 'least-loaded' | 'best-performer' | 'skill-based';
  considerPriority?: boolean;
  considerWorkload?: boolean;
  considerPerformance?: boolean;
}

export interface TeamMemberWorkload {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  currentLoad: number;
  avgReplyTimeMinutes: number;
  resolutionRate: number;
  capacity: number; // Max emails they can handle
}

export class AutoAssignmentService {
  /**
   * Get team members with their current workload
   */
  static async getTeamWorkload(userId: string): Promise<TeamMemberWorkload[]> {
    const workloadData = await db
      .select({
        id: teamMembers.id,
        name: teamMembers.name,
        email: teamMembers.email,
        role: teamMembers.role,
        isActive: teamMembers.isActive,
        currentLoad: sql<number>`COUNT(CASE WHEN ${emails.status} = 'pending' THEN 1 END)`,
        totalAssigned: sql<number>`COUNT(${emails.id})`,
        replied: sql<number>`COUNT(CASE WHEN ${emails.status} = 'replied' THEN 1 END)`,
        avgReplyTime: sql<number>`AVG(CASE WHEN ${emails.firstReplyAt} IS NOT NULL THEN (julianday(${emails.firstReplyAt}) - julianday(${emails.receivedAt})) * 24 * 60 END)`,
      })
      .from(teamMembers)
      .leftJoin(
        emails,
        and(
          eq(emails.assignedTo, teamMembers.id),
          eq(emails.userId, userId)
        )
      )
      .where(
        and(
          eq(teamMembers.userId, userId),
          eq(teamMembers.isActive, true),
          eq(teamMembers.role, 'agent') // Only assign to agents
        )
      )
      .groupBy(teamMembers.id);

    return workloadData.map((member) => {
      const totalAssigned = member.totalAssigned || 0;
      const replied = member.replied || 0;
      const resolutionRate = totalAssigned > 0 ? (replied / totalAssigned) * 100 : 0;

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        isActive: member.isActive,
        currentLoad: member.currentLoad || 0,
        avgReplyTimeMinutes: member.avgReplyTime || 0,
        resolutionRate: Math.round(resolutionRate),
        capacity: 20, // Default capacity, can be configured per agent
      };
    });
  }

  /**
   * Find best agent using round-robin strategy
   */
  static async roundRobinAssignment(
    userId: string,
    lastAssignedId?: number
  ): Promise<number | null> {
    const agents = await this.getTeamWorkload(userId);
    
    if (agents.length === 0) {
      return null;
    }

    // Filter agents that haven't reached capacity
    const availableAgents = agents.filter(a => a.currentLoad < a.capacity);
    
    if (availableAgents.length === 0) {
      // All at capacity, assign to least loaded
      return this.leastLoadedAssignment(userId);
    }

    if (!lastAssignedId) {
      return availableAgents[0].id;
    }

    // Find next agent after lastAssignedId
    const currentIndex = availableAgents.findIndex(a => a.id === lastAssignedId);
    const nextIndex = (currentIndex + 1) % availableAgents.length;
    
    return availableAgents[nextIndex].id;
  }

  /**
   * Find agent with least workload
   */
  static async leastLoadedAssignment(userId: string): Promise<number | null> {
    const agents = await this.getTeamWorkload(userId);
    
    if (agents.length === 0) {
      return null;
    }

    // Sort by current load (ascending) and then by avg reply time
    const sorted = agents.sort((a, b) => {
      if (a.currentLoad !== b.currentLoad) {
        return a.currentLoad - b.currentLoad;
      }
      return a.avgReplyTimeMinutes - b.avgReplyTimeMinutes;
    });

    return sorted[0].id;
  }

  /**
   * Find best performing agent
   */
  static async bestPerformerAssignment(userId: string): Promise<number | null> {
    const agents = await this.getTeamWorkload(userId);
    
    if (agents.length === 0) {
      return null;
    }

    // Filter agents below capacity
    const availableAgents = agents.filter(a => a.currentLoad < a.capacity);
    
    if (availableAgents.length === 0) {
      return this.leastLoadedAssignment(userId);
    }

    // Sort by performance score (resolution rate + fast reply time)
    const sorted = availableAgents.sort((a, b) => {
      const scoreA = a.resolutionRate - (a.avgReplyTimeMinutes / 60); // Higher resolution, lower time = better
      const scoreB = b.resolutionRate - (b.avgReplyTimeMinutes / 60);
      return scoreB - scoreA;
    });

    return sorted[0].id;
  }

  /**
   * Skill-based assignment (based on email keywords)
   */
  static async skillBasedAssignment(
    userId: string,
    emailSubject: string,
    emailBody: string
  ): Promise<number | null> {
    // For now, use simple keyword matching
    // In future, can be enhanced with ML/AI
    
    const keywords = {
      technical: ['bug', 'error', 'technical', 'api', 'code', 'system'],
      billing: ['payment', 'invoice', 'billing', 'charge', 'subscription'],
      support: ['help', 'support', 'question', 'how to', 'issue'],
      sales: ['pricing', 'upgrade', 'demo', 'trial', 'purchase'],
    };

    const content = `${emailSubject} ${emailBody}`.toLowerCase();
    let category = 'support'; // default

    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(word => content.includes(word))) {
        category = cat;
        break;
      }
    }

    // For now, fallback to least loaded
    // In future: match category with agent expertise
    return this.leastLoadedAssignment(userId);
  }

  /**
   * Auto-assign email based on strategy
   */
  static async autoAssignEmail(
    emailId: number,
    userId: string,
    strategy: AssignmentStrategy = { type: 'least-loaded', considerWorkload: true }
  ): Promise<{ success: boolean; assignedTo?: number; reason?: string }> {
    try {
      let assignedAgentId: number | null = null;

      switch (strategy.type) {
        case 'round-robin':
          // Get last assigned email
          const lastEmail = await db
            .select({ assignedTo: emails.assignedTo })
            .from(emails)
            .where(
              and(
                eq(emails.userId, userId),
                sql`${emails.assignedTo} IS NOT NULL`
              )
            )
            .orderBy(sql`${emails.id} DESC`)
            .limit(1);
          
          assignedAgentId = await this.roundRobinAssignment(
            userId,
            lastEmail[0]?.assignedTo || undefined
          );
          break;

        case 'least-loaded':
          assignedAgentId = await this.leastLoadedAssignment(userId);
          break;

        case 'best-performer':
          assignedAgentId = await this.bestPerformerAssignment(userId);
          break;

        case 'skill-based':
          // Get email details
          const emailData = await db
            .select({
              subject: emails.subject,
            })
            .from(emails)
            .where(eq(emails.id, emailId))
            .limit(1);

          if (emailData[0]) {
            assignedAgentId = await this.skillBasedAssignment(
              userId,
              emailData[0].subject,
              '' // Body text not available in schema
            );
          }
          break;

        default:
          assignedAgentId = await this.leastLoadedAssignment(userId);
      }

      if (!assignedAgentId) {
        return {
          success: false,
          reason: 'No available agents found',
        };
      }

      // Assign the email
      await db
        .update(emails)
        .set({
          assignedTo: assignedAgentId,
        })
        .where(eq(emails.id, emailId));

      return {
        success: true,
        assignedTo: assignedAgentId,
      };
    } catch (error) {
      console.error('Auto-assignment error:', error);
      return {
        success: false,
        reason: 'Auto-assignment failed',
      };
    }
  }

  /**
   * Auto-assign multiple emails in bulk
   */
  static async bulkAutoAssign(
    emailIds: number[],
    userId: string,
    strategy: AssignmentStrategy = { type: 'least-loaded' }
  ): Promise<{ assigned: number; failed: number }> {
    let assigned = 0;
    let failed = 0;

    for (const emailId of emailIds) {
      const result = await this.autoAssignEmail(emailId, userId, strategy);
      if (result.success) {
        assigned++;
      } else {
        failed++;
      }
    }

    return { assigned, failed };
  }

  /**
   * Balance workload across team
   */
  static async rebalanceWorkload(userId: string): Promise<{
    reassigned: number;
    message: string;
  }> {
    const agents = await this.getTeamWorkload(userId);
    
    if (agents.length < 2) {
      return {
        reassigned: 0,
        message: 'Need at least 2 agents to rebalance',
      };
    }

    // Find overloaded agents (load > 80% of capacity)
    const overloaded = agents.filter(a => a.currentLoad > a.capacity * 0.8);
    const underloaded = agents.filter(a => a.currentLoad < a.capacity * 0.5);

    if (overloaded.length === 0 || underloaded.length === 0) {
      return {
        reassigned: 0,
        message: 'Workload is already balanced',
      };
    }

    let reassigned = 0;

    for (const agent of overloaded) {
      if (underloaded.length === 0) break;

      // Reassign up to 5 emails from overloaded to underloaded
      await db
        .update(emails)
        .set({
          assignedTo: underloaded[0].id,
        })
        .where(
          and(
            eq(emails.assignedTo, agent.id),
            eq(emails.status, 'pending'),
            eq(emails.userId, userId)
          )
        )
        .limit(5); // Reassign up to 5 emails

      // Update reassigned count
      reassigned += 5;
    }

    return {
      reassigned,
      message: `Successfully reassigned ${reassigned} emails to balance workload`,
    };
  }
}
