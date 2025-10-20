"use client";

import { memo, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, TrendingUp, Clock, Target } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  metrics: {
    totalAssigned: number;
    replied: number;
    pending: number;
    overdue: number;
    avgReplyTimeMinutes: number;
    resolutionRate: number;
  };
}

interface TeamPerformanceHeatmapProps {
  teamData: TeamMember[];
  metric?: 'resolutionRate' | 'avgReplyTime' | 'workload' | 'overdue';
  height?: number;
}

export const TeamPerformanceHeatmap = memo(({ 
  teamData, 
  metric = 'resolutionRate',
  height = 400 
}: TeamPerformanceHeatmapProps) => {
  // Process data for visualization
  const chartData = useMemo(() => {
    return teamData.map(member => {
      const workload = member.metrics.totalAssigned > 0 
        ? (member.metrics.pending / member.metrics.totalAssigned) * 100 
        : 0;

      return {
        name: member.name.split(' ')[0], // First name only
        fullName: member.name,
        email: member.email,
        role: member.role,
        isActive: member.isActive,
        resolutionRate: member.metrics.resolutionRate,
        avgReplyTime: Math.round(member.metrics.avgReplyTimeMinutes),
        workload: Math.round(workload),
        overdue: member.metrics.overdue,
        totalAssigned: member.metrics.totalAssigned,
        replied: member.metrics.replied,
        pending: member.metrics.pending,
      };
    }).sort((a, b) => {
      // Sort by selected metric (best performers first)
      switch (metric) {
        case 'resolutionRate':
          return b.resolutionRate - a.resolutionRate;
        case 'avgReplyTime':
          return a.avgReplyTime - b.avgReplyTime;
        case 'workload':
          return b.workload - a.workload;
        case 'overdue':
          return a.overdue - b.overdue;
        default:
          return 0;
      }
    });
  }, [teamData, metric]);

  // Get color based on performance
  const getPerformanceColor = (value: number, type: string) => {
    switch (type) {
      case 'resolutionRate':
        if (value >= 90) return '#10b981'; // green
        if (value >= 75) return '#f59e0b'; // amber
        return '#ef4444'; // red
      case 'avgReplyTime':
        if (value <= 60) return '#10b981'; // green (1 hour or less)
        if (value <= 180) return '#f59e0b'; // amber (3 hours or less)
        return '#ef4444'; // red
      case 'workload':
        if (value <= 30) return '#10b981'; // green (low workload)
        if (value <= 60) return '#f59e0b'; // amber (moderate workload)
        return '#ef4444'; // red (high workload)
      case 'overdue':
        if (value === 0) return '#10b981'; // green (no overdue)
        if (value <= 2) return '#f59e0b'; // amber (few overdue)
        return '#ef4444'; // red (many overdue)
      default:
        return '#8b5cf6'; // purple
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg min-w-[200px]">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${data.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div>
              <p className="font-semibold text-foreground">{data.fullName}</p>
              <p className="text-xs text-muted-foreground">{data.role}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resolution Rate:</span>
              <span className={`font-medium ${data.resolutionRate >= 90 ? 'text-green-500' : data.resolutionRate >= 75 ? 'text-amber-500' : 'text-red-500'}`}>
                {data.resolutionRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Reply Time:</span>
              <span className={`font-medium ${data.avgReplyTime <= 60 ? 'text-green-500' : data.avgReplyTime <= 180 ? 'text-amber-500' : 'text-red-500'}`}>
                {data.avgReplyTime}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Workload:</span>
              <span className={`font-medium ${data.workload <= 30 ? 'text-green-500' : data.workload <= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                {data.workload}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overdue:</span>
              <span className={`font-medium ${data.overdue === 0 ? 'text-green-500' : data.overdue <= 2 ? 'text-amber-500' : 'text-red-500'}`}>
                {data.overdue}
              </span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Assigned:</span>
                <span className="font-medium">{data.totalAssigned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Replied:</span>
                <span className="font-medium text-green-500">{data.replied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending:</span>
                <span className="font-medium text-amber-500">{data.pending}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get metric configuration
  const getMetricConfig = (type: string) => {
    switch (type) {
      case 'resolutionRate':
        return {
          label: 'Resolution Rate (%)',
          dataKey: 'resolutionRate',
          icon: Target,
          unit: '%',
          thresholds: { good: 90, warning: 75 }
        };
      case 'avgReplyTime':
        return {
          label: 'Average Reply Time (minutes)',
          dataKey: 'avgReplyTime',
          icon: Clock,
          unit: 'm',
          thresholds: { good: 60, warning: 180 }
        };
      case 'workload':
        return {
          label: 'Workload (%)',
          dataKey: 'workload',
          icon: Users,
          unit: '%',
          thresholds: { good: 30, warning: 60 }
        };
      case 'overdue':
        return {
          label: 'Overdue Emails',
          dataKey: 'overdue',
          icon: TrendingUp,
          unit: '',
          thresholds: { good: 0, warning: 2 }
        };
      default:
        return { label: '', dataKey: '', icon: Target, unit: '', thresholds: { good: 0, warning: 0 } };
    }
  };

  const metricConfig = getMetricConfig(metric);
  const Icon = metricConfig.icon;

  return (
    <div className="rounded-lg border border-primary/20 bg-background p-5">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon size={24} className="text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Team Performance</h2>
            <p className="text-sm text-muted-foreground">Performance heatmap by {metricConfig.label.toLowerCase()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Team Members</p>
          <p className="font-mono text-sm text-foreground">{chartData.length}</p>
        </div>
      </div>

      {/* Performance Legend */}
      <div className="mb-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-muted-foreground">Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-muted-foreground">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-muted-foreground">Critical</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={chartData} 
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#9333ea33" />
          <XAxis 
            type="number"
            stroke="#a78bfa"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            stroke="#a78bfa"
            tick={{ fontSize: 12 }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey={metricConfig.dataKey} 
            radius={[0, 8, 8, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getPerformanceColor(Number(entry[metricConfig.dataKey as keyof typeof entry]), metric)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Team Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Avg Resolution Rate</p>
          <p className="text-lg font-semibold text-primary">
            {(chartData.reduce((sum, m) => sum + m.resolutionRate, 0) / chartData.length).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Avg Reply Time</p>
          <p className="text-lg font-semibold text-primary">
            {Math.round(chartData.reduce((sum, m) => sum + m.avgReplyTime, 0) / chartData.length)}m
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Overdue</p>
          <p className="text-lg font-semibold text-primary">
            {chartData.reduce((sum, m) => sum + m.overdue, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Active Members</p>
          <p className="text-lg font-semibold text-primary">
            {chartData.filter(m => m.isActive).length}
          </p>
        </div>
      </div>
    </div>
  );
});

TeamPerformanceHeatmap.displayName = "TeamPerformanceHeatmap";