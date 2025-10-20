"use client";

import { AlertCircle, CheckCircle } from "lucide-react";

interface Alert {
  id: number;
  emailId: number;
  message: string;
  alertType: string;
  isRead: boolean;
  createdAt: string;
}

interface AlertsListProps {
  alerts: Alert[];
  isLive?: boolean;
  lastEventAt?: Date | null;
}

export function AlertsList({ alerts, isLive = false, lastEventAt }: AlertsListProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-background p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">Active Alerts</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${
              isLive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}
            />
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
          {lastEventAt && <span>Updated {lastEventAt.toLocaleTimeString()}</span>}
        </div>
      </div>
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg border border-primary/30 bg-primary/5 p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      {alert.alertType}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <CheckCircle className="mx-auto mb-4 text-emerald-500" size={48} />
          <p className="text-muted-foreground">No active alerts. Everything looks good!</p>
        </div>
      )}
    </div>
  );
}
