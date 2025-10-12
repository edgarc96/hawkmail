import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("admin"), // admin, agent, manager
  organizationId: text("organization_id"), // Para multi-tenant
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Email analytics tables
export const emails = sqliteTable('emails', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  senderEmail: text('sender_email').notNull(),
  recipientEmail: text('recipient_email').notNull(),
  receivedAt: integer('received_at', { mode: 'timestamp' }).notNull(),
  firstReplyAt: integer('first_reply_at', { mode: 'timestamp' }),
  status: text('status').notNull().default('pending'), // pending/replied/overdue
  priority: text('priority').notNull().default('medium'), // high/medium/low
  slaDeadline: integer('sla_deadline', { mode: 'timestamp' }).notNull(),
  isResolved: integer('is_resolved', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  providerId: integer('provider_id').references(() => emailProviders.id, { onDelete: 'set null' }),
  assignedTo: integer('assigned_to').references(() => teamMembers.id, { onDelete: 'set null' }),
  externalId: text('external_id'),
  threadId: text('thread_id'),
  rawHeaders: text('raw_headers'),
});

export const responseMetrics = sqliteTable('response_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD format
  avgFirstReplyTimeMinutes: integer('avg_first_reply_time_minutes'),
  totalEmails: integer('total_emails').notNull().default(0),
  repliedCount: integer('replied_count').notNull().default(0),
  overdueCount: integer('overdue_count').notNull().default(0),
  resolutionRate: real('resolution_rate').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const slaSettings = sqliteTable('sla_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  targetReplyTimeMinutes: integer('target_reply_time_minutes').notNull(),
  priorityLevel: text('priority_level').notNull(), // high/medium/low
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const alerts = sqliteTable('alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  emailId: integer('email_id').references(() => emails.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  alertType: text('alert_type').notNull(), // deadline_approaching/overdue/high_priority
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const teamMembers = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(), // agent/manager
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const emailReplies = sqliteTable('email_replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  emailId: integer('email_id').notNull().references(() => emails.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  replyContent: text('reply_content').notNull(),
  sentAt: integer('sent_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Email provider integration tables
export const emailProviders = sqliteTable('email_providers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'gmail' or 'outlook'
  email: text('email').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiresAt: integer('token_expires_at', { mode: 'timestamp' }).notNull(),
  scope: text('scope').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastSyncAt: integer('last_sync_at', { mode: 'timestamp' }),
  webhookChannelId: text('webhook_channel_id'),
  webhookResourceId: text('webhook_resource_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const emailSyncLogs = sqliteTable('email_sync_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  providerId: integer('provider_id').notNull().references(() => emailProviders.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  syncStatus: text('sync_status').notNull(), // 'success', 'failed', 'in_progress'
  emailsProcessed: integer('emails_processed').notNull().default(0),
  errorMessage: text('error_message'),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Reply Templates
export const replyTemplates = sqliteTable('reply_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  subject: text('subject'),
  content: text('content').notNull(),
  category: text('category').notNull().default('general'), // general, support, sales, etc
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Performance Goals
export const performanceGoals = sqliteTable('performance_goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull().default('email'), // email, whatsapp, telegram, etc
  goalType: text('goal_type').notNull(), // first_reply, overall_reply, time_to_close
  targetMinutes: integer('target_minutes').notNull(), // Target time in minutes
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Time Bands for categorizing response times
export const timeBands = sqliteTable('time_bands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull().default('email'),
  bandType: text('band_type').notNull(), // first_reply, overall_reply, time_to_close
  minMinutes: integer('min_minutes').notNull(), // Minimum minutes for this band
  maxMinutes: integer('max_minutes').notNull(), // Maximum minutes for this band
  label: text('label').notNull(), // e.g., "Excellent", "Good", "Poor"
  color: text('color').notNull(), // Hex color for UI display
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Webhooks tables for outgoing webhook subscriptions
export const webhooks = sqliteTable('webhooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: text('events').notNull(), // JSON array of event types
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  secret: text('secret'), // For webhook signature verification
  headers: text('headers'), // JSON object for custom headers
  retryCount: integer('retry_count').default(3),
  lastTriggeredAt: integer('last_triggered_at', { mode: 'timestamp' }),
  lastStatus: text('last_status'), // success, failed
  lastError: text('last_error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Webhook logs for tracking webhook deliveries
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
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});