"use client";

import { Mail, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { formatTime } from "@/lib/utils/email-helpers";

interface MetricsCardsProps {
  totalEmails: number;
  pendingEmails: number;
  repliedEmails: number;
  overdueEmails: number;
  avgReplyTimeMinutes?: number;
  avgResolutionRate?: number;
  highPriorityEmails?: number;
  variant?: 'dashboard' | 'analytics';
}

export function MetricsCards({
  totalEmails,
  pendingEmails,
  repliedEmails,
  overdueEmails,
  avgReplyTimeMinutes,
  avgResolutionRate,
  highPriorityEmails,
  variant = 'dashboard',
}: MetricsCardsProps) {

  if (variant === 'analytics') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-primary/20 bg-background p-5">
          <div className="mb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Reply Time</p>
          </div>
          <p className="text-3xl font-bold text-primary">
            {avgReplyTimeMinutes !== undefined ? formatTime(avgReplyTimeMinutes) : 'N/A'}
          </p>
        </div>

        <div className="rounded-lg border border-primary/20 bg-background p-5">
          <div className="mb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Resolution Rate</p>
          </div>
          <p className="text-3xl font-bold text-primary">
            {avgResolutionRate !== undefined ? `${avgResolutionRate.toFixed(1)}%` : 'N/A'}
          </p>
        </div>

        <div className="rounded-lg border border-primary/20 bg-background p-5">
          <div className="mb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">High Priority</p>
          </div>
          <p className="text-3xl font-bold text-primary">
            {highPriorityEmails !== undefined ? highPriorityEmails : 'N/A'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-primary/20 bg-background p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Total Emails</p>
        <p className="text-3xl font-bold text-primary">{totalEmails}</p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-background p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Pending</p>
        <p className="text-3xl font-bold text-primary">{pendingEmails}</p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-background p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Replied</p>
        <p className="text-3xl font-bold text-primary">{repliedEmails}</p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-background p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Overdue</p>
        <p className="text-3xl font-bold text-primary">{overdueEmails}</p>
      </div>
    </div>
  );
}
