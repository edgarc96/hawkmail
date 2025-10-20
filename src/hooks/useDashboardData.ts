"use client";

import useSWR from "swr";
import { useMemo } from "react";

interface DashboardSummary {
  totalEmails: number;
  pendingEmails: number;
  repliedEmails: number;
  overdueEmails: number;
  highPriorityEmails: number;
  unresolvedEmails: number;
  avgReplyTimeMinutes: number;
  avgResolutionRate: number;
  recentMetrics: Array<{
    id: number;
    date: string;
    avgFirstReplyTimeMinutes: number;
    resolutionRate: number;
  }>;
}

const fetcher = async (url: string): Promise<DashboardSummary> => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  return response.json();
};

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardSummary>(
    '/api/dashboard',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // 30 seconds
      dedupingInterval: 10000, // 10 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      keepPreviousData: true,
    }
  );

  // Memoized computed values to avoid re-calculations
  const metrics = useMemo(() => {
    if (!data) return null;

    return {
      // Health metrics
      healthScore: Math.min(100, (
        (data.avgResolutionRate * 0.4) + // 40% weight to resolution rate
        (Math.max(0, 100 - (data.avgReplyTimeMinutes / 60) * 100) * 0.3) + // 30% weight to reply time
        (Math.max(0, 100 - (data.overdueEmails / Math.max(1, data.totalEmails)) * 100) * 0.3) // 30% weight to overdue ratio
      )),
      
      // Performance trends
      avgReplyTimeTrend: data.recentMetrics.length > 1 
        ? ((data.recentMetrics[0].avgFirstReplyTimeMinutes - data.recentMetrics[1].avgFirstReplyTimeMinutes) / 
           Math.max(1, data.recentMetrics[1].avgFirstReplyTimeMinutes)) * 100
        : 0,
      
      resolutionRateTrend: data.recentMetrics.length > 1
        ? data.recentMetrics[0].resolutionRate - data.recentMetrics[1].resolutionRate
        : 0,
      
      // Workload indicators
      workloadLevel: data.pendingEmails > 20 ? 'high' : 
                    data.pendingEmails > 10 ? 'medium' : 'low',
      
      // Urgency indicators
      hasUrgentItems: data.overdueEmails > 0 || data.highPriorityEmails > 5,
    };
  }, [data]);

  // Performance indicators
  const performance = useMemo(() => {
    if (!data) return null;

    const targetReplyTime = 60; // 60 minutes target
    const targetResolutionRate = 85; // 85% target

    return {
      replyTimeStatus: data.avgReplyTimeMinutes <= targetReplyTime ? 'good' : 
                      data.avgReplyTimeMinutes <= targetReplyTime * 2 ? 'warning' : 'critical',
      
      resolutionRateStatus: data.avgResolutionRate >= targetResolutionRate ? 'good' :
                           data.avgResolutionRate >= targetResolutionRate * 0.8 ? 'warning' : 'critical',
      
      overallStatus: (
        (data.avgReplyTimeMinutes <= targetReplyTime && data.avgResolutionRate >= targetResolutionRate) ? 'excellent' :
        (data.avgReplyTimeMinutes <= targetReplyTime * 1.5 && data.avgResolutionRate >= targetResolutionRate * 0.9) ? 'good' :
        (data.avgReplyTimeMinutes <= targetReplyTime * 2 && data.avgResolutionRate >= targetResolutionRate * 0.8) ? 'warning' : 'critical'
      ),
    };
  }, [data]);

  return {
    data,
    metrics,
    performance,
    isLoading,
    error,
    mutate,
    // Convenience methods
    refresh: () => mutate(),
    isHealthy: metrics?.healthScore && metrics.healthScore > 70,
    hasWarnings: performance?.overallStatus === 'warning' || performance?.overallStatus === 'critical',
  };
}

// Hook for real-time updates with polling only for specific sections
export function useDashboardSection(section: 'metrics' | 'emails' | 'alerts' | 'team') {
  const { data, error, isLoading, mutate } = useSWR<DashboardSummary>(
    section === 'metrics' ? '/api/dashboard' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: section === 'metrics' ? 30000 : 60000, // Different intervals per section
      dedupingInterval: 15000,
      keepPreviousData: true,
    }
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}