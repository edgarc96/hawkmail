import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Webhooks table for outgoing webhook subscriptions
 */
export const webhooks = sqliteTable('webhooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  url: text('url').notNull(),
  events: text('events').notNull(), // JSON array of event types
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  secret: text('secret'), // For webhook signature verification
  headers: text('headers'), // JSON object for custom headers
  retryCount: integer('retry_count').default(3),
  lastTriggeredAt: integer('last_triggered_at', { mode: 'timestamp' }),
  lastStatus: text('last_status'), // success, failed
  lastError: text('last_error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

/**
 * Webhook logs for tracking webhook deliveries
 */
export const webhookLogs = sqliteTable('webhook_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  webhookId: integer('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  payload: text('payload').notNull(), // JSON payload sent
  status: text('status').notNull(), // pending, success, failed
  statusCode: integer('status_code'),
  responseBody: text('response_body'),
  errorMessage: text('error_message'),
  attempts: integer('attempts').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});
