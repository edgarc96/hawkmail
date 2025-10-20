-- Dashboard Performance Optimization Indexes (Fixed)
-- These indexes significantly improve dashboard query performance

-- Primary indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_emails_user_status ON emails(user_id, status);
CREATE INDEX IF NOT EXISTS idx_emails_user_priority ON emails(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_emails_user_resolved ON emails(user_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_emails_user_received_date ON emails(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_user_sla_deadline ON emails(user_id, sla_deadline);

-- Composite indexes for common dashboard query patterns
CREATE INDEX IF NOT EXISTS idx_emails_dashboard_stats ON emails(user_id, status, priority, is_resolved);
CREATE INDEX IF NOT EXISTS idx_emails_pending_assignment ON emails(user_id, status, assigned_to) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_emails_overdue ON emails(user_id, status, sla_deadline) WHERE status = 'overdue';

-- Indexes for response metrics (check if table exists)
CREATE INDEX IF NOT EXISTS idx_response_metrics_user_date ON response_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_response_metrics_user_period ON response_metrics(user_id, date) WHERE date >= strftime('%s', 'now', '-30 days');

-- Indexes for team performance queries
CREATE INDEX IF NOT EXISTS idx_emails_assigned_user ON emails(assigned_to, status, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_team_performance ON emails(assigned_to, status, is_resolved, first_reply_at);

-- Indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_emails_priority_date ON emails(priority, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_status_date ON emails(status, received_at DESC);

-- Partial indexes for common filtered queries
CREATE INDEX IF NOT EXISTS idx_emails_unresolved ON emails(user_id, is_resolved) WHERE is_resolved = 0;
CREATE INDEX IF NOT EXISTS idx_emails_high_priority ON emails(user_id, priority) WHERE priority = 'high';
CREATE INDEX IF NOT EXISTS idx_emails_pending ON emails(user_id, status) WHERE status = 'pending';

-- Alert-related indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON alerts(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user_type ON alerts(user_id, alert_type, created_at DESC);

-- Team member indexes
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active, role);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- Email provider sync indexes
CREATE INDEX IF NOT EXISTS idx_email_providers_user_active ON email_providers(user_id, is_active);

-- Performance optimization for auto-assignment queries
CREATE INDEX IF NOT EXISTS idx_emails_auto_assignment ON emails(status, assigned_to, priority, received_at) WHERE status = 'pending' AND assigned_to IS NULL;

-- Covering indexes for dashboard API to avoid table lookups
CREATE INDEX IF NOT EXISTS idx_emails_dashboard_covering ON emails(user_id, status, priority, is_resolved, received_at, sla_deadline, first_reply_at, subject, sender_email);

-- Response time calculation optimization
CREATE INDEX IF NOT EXISTS idx_emails_reply_time_calc ON emails(user_id, first_reply_at, received_at) WHERE first_reply_at IS NOT NULL;