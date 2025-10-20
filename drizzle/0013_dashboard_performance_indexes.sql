-- Dashboard Performance Optimization Indexes
-- These indexes significantly improve dashboard query performance

-- Primary indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_emails_user_status ON emails(userId, status);
CREATE INDEX IF NOT EXISTS idx_emails_user_priority ON emails(userId, priority);
CREATE INDEX IF NOT EXISTS idx_emails_user_resolved ON emails(userId, isResolved);
CREATE INDEX IF NOT EXISTS idx_emails_user_received_date ON emails(userId, receivedAt DESC);
CREATE INDEX IF NOT EXISTS idx_emails_user_sla_deadline ON emails(userId, slaDeadline);

-- Composite indexes for common dashboard query patterns
CREATE INDEX IF NOT EXISTS idx_emails_dashboard_stats ON emails(userId, status, priority, isResolved);
CREATE INDEX IF NOT EXISTS idx_emails_pending_assignment ON emails(userId, status, assignedTo) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_emails_overdue ON emails(userId, status, slaDeadline) WHERE status = 'overdue';

-- Indexes for response metrics
CREATE INDEX IF NOT EXISTS idx_response_metrics_user_date ON responseMetrics(userId, date DESC);
CREATE INDEX IF NOT EXISTS idx_response_metrics_user_period ON responseMetrics(userId, date) WHERE date >= date('now', '-30 days');

-- Indexes for team performance queries
CREATE INDEX IF NOT EXISTS idx_emails_assigned_user ON emails(assignedTo, status, receivedAt DESC);
CREATE INDEX IF NOT EXISTS idx_emails_team_performance ON emails(assignedTo, status, isResolved, firstReplyAt);

-- Indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_emails_priority_date ON emails(priority, receivedAt DESC);
CREATE INDEX IF NOT EXISTS idx_emails_status_date ON emails(status, receivedAt DESC);

-- Partial indexes for common filtered queries
CREATE INDEX IF NOT EXISTS idx_emails_unresolved ON emails(userId, isResolved) WHERE isResolved = 0;
CREATE INDEX IF NOT EXISTS idx_emails_high_priority ON emails(userId, priority) WHERE priority = 'high';
CREATE INDEX IF NOT EXISTS idx_emails_pending ON emails(userId, status) WHERE status = 'pending';

-- Alert-related indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON alerts(userId, isRead, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user_type ON alerts(userId, alertType, createdAt DESC);

-- Team member indexes
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(isActive, role);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(userId);

-- Email provider sync indexes
CREATE INDEX IF NOT EXISTS idx_email_providers_user_active ON email_providers(userId, isActive);
CREATE INDEX IF NOT EXISTS idx_sync_logs_provider_date ON sync_logs(emailProviderId, startedAt DESC);

-- Performance optimization for auto-assignment queries
CREATE INDEX IF NOT EXISTS idx_emails_auto_assignment ON emails(status, assignedTo, priority, receivedAt) WHERE status = 'pending' AND assignedTo IS NULL;

-- Covering indexes for dashboard API to avoid table lookups
CREATE INDEX IF NOT EXISTS idx_emails_dashboard_covering ON emails(userId, status, priority, isResolved, receivedAt, slaDeadline, firstReplyAt, subject, senderEmail);

-- Response time calculation optimization
CREATE INDEX IF NOT EXISTS idx_emails_reply_time_calc ON emails(userId, firstReplyAt, receivedAt) WHERE firstReplyAt IS NOT NULL;