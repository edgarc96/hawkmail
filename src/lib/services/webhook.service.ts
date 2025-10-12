/**
 * Webhook Service
 * Handles outgoing webhooks for integrations
 */

import crypto from 'crypto';

export type WebhookEvent = 
  | 'email.received'
  | 'email.replied'
  | 'email.assigned'
  | 'email.resolved'
  | 'sla.warning'
  | 'sla.breached'
  | 'alert.created'
  | 'team.member.added'
  | 'team.performance.updated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
  user_id: string;
}

export interface WebhookSubscription {
  id: number;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  secret?: string;
  headers?: Record<string, string>;
  retryCount: number;
}

export class WebhookService {
  /**
   * Trigger webhook for an event
   */
  static async triggerWebhook(
    subscription: WebhookSubscription,
    payload: WebhookPayload,
    attempt: number = 1
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    try {
      // Generate signature if secret is provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'TimeToReply-Webhook/1.0',
        ...subscription.headers,
      };

      if (subscription.secret) {
        const signature = this.generateSignature(payload, subscription.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      headers['X-Webhook-Event'] = payload.event;
      headers['X-Webhook-Timestamp'] = payload.timestamp;
      headers['X-Webhook-Attempt'] = attempt.toString();

      // Send webhook
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(subscription.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const success = response.ok;
      
      return {
        success,
        statusCode: response.status,
      };
    } catch (error: any) {
      console.error('Webhook trigger error:', error);
      
      // Retry logic
      if (attempt < subscription.retryCount) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.triggerWebhook(subscription, payload, attempt + 1);
      }

      return {
        success: false,
        error: error.message || 'Webhook delivery failed',
      };
    }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  static generateSignature(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Trigger webhooks for all subscribers of an event
   */
  static async broadcastEvent(
    event: WebhookEvent,
    data: any,
    userId: string,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      user_id: userId,
    };

    // Filter active subscriptions that listen to this event
    const relevantSubscriptions = subscriptions.filter(
      sub => sub.isActive && sub.events.includes(event)
    );

    // Trigger webhooks in parallel
    const promises = relevantSubscriptions.map(sub =>
      this.triggerWebhook(sub, payload)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Format email event data
   */
  static formatEmailEvent(email: any): any {
    return {
      id: email.id,
      subject: email.subject,
      sender: email.senderEmail,
      recipient: email.recipientEmail,
      received_at: email.receivedAt,
      status: email.status,
      priority: email.priority,
      assigned_to: email.assignedTo,
      sla_deadline: email.slaDeadline,
      first_reply_at: email.firstReplyAt,
      is_resolved: email.isResolved,
    };
  }

  /**
   * Format SLA event data
   */
  static formatSLAEvent(email: any, timeToBreachMinutes: number): any {
    return {
      email: this.formatEmailEvent(email),
      sla_deadline: email.slaDeadline,
      time_to_breach_minutes: timeToBreachMinutes,
      is_breached: timeToBreachMinutes <= 0,
    };
  }

  /**
   * Format team event data
   */
  static formatTeamEvent(teamMember: any, metrics?: any): any {
    return {
      id: teamMember.id,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      is_active: teamMember.isActive,
      metrics: metrics || null,
    };
  }
}

/**
 * Webhook Event Triggers
 * Use these functions to trigger webhooks from your application
 */

// Example usage in email handlers:
/*
import { WebhookService } from '@/lib/services/webhook.service';
import { db } from '@/db';
import { webhooks } from '@/db/schema-webhooks';

// Get user's webhook subscriptions
const userWebhooks = await db
  .select()
  .from(webhooks)
  .where(eq(webhooks.userId, userId));

// Parse events from JSON
const subscriptions = userWebhooks.map(w => ({
  ...w,
  events: JSON.parse(w.events),
  headers: w.headers ? JSON.parse(w.headers) : undefined,
}));

// Trigger webhook
await WebhookService.broadcastEvent(
  'email.received',
  WebhookService.formatEmailEvent(newEmail),
  userId,
  subscriptions
);
*/
