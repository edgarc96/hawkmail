"use client";

import { memo } from "react";
import { Mail, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { EnhancedMetricsCard } from "@/features/analytics/components/EnhancedMetricsCard";
import { useDashboardData } from "@/hooks/useDashboardData";

interface DashboardMetricsProps {
  className?: string;
}

export const DashboardMetrics = memo(({ className }: DashboardMetricsProps) => {
  const { data, metrics, performance } = useDashboardData();

  if (!data) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      <EnhancedMetricsCard
        title="Total Emails"
        value={data.totalEmails}
        icon={Mail}
        gradient="from-purple-500 to-pink-500"
        delay={0}
        trend={metrics?.avgReplyTimeTrend ? {
          value: Math.abs(metrics.avgReplyTimeTrend),
          isPositive: metrics.avgReplyTimeTrend < 0
        } : undefined}
      />
      
      <EnhancedMetricsCard
        title="Pending"
        value={data.pendingEmails}
        icon={Clock}
        gradient="from-yellow-500 to-amber-500"
        delay={0.1}
        subtitle={metrics?.workloadLevel ? `Workload: ${metrics.workloadLevel}` : undefined}
      />
      
      <EnhancedMetricsCard
        title="Replied"
        value={data.repliedEmails}
        icon={CheckCircle}
        gradient="from-green-500 to-emerald-500"
        delay={0.2}
        trend={metrics?.resolutionRateTrend ? {
          value: Math.abs(metrics.resolutionRateTrend),
          isPositive: metrics.resolutionRateTrend > 0
        } : undefined}
      />
      
      <EnhancedMetricsCard
        title="Overdue"
        value={data.overdueEmails}
        icon={AlertCircle}
        gradient="from-red-500 to-orange-500"
        delay={0.3}
        subtitle={metrics?.hasUrgentItems ? "⚠️ Action needed" : undefined}
      />
    </div>
  );
});

DashboardMetrics.displayName = "DashboardMetrics";