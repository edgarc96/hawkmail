"use client";

import { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Mail, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface EmailDistributionChartProps {
  data: {
    totalEmails: number;
    pendingEmails: number;
    repliedEmails: number;
    overdueEmails: number;
    highPriorityEmails: number;
  };
  type?: 'pie' | 'bar' | 'both';
  height?: number;
}

const COLORS = {
  pending: '#f59e0b',
  replied: '#10b981',
  overdue: '#ef4444',
  highPriority: '#8b5cf6',
  other: '#6b7280'
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const EmailDistributionChart = memo(({ 
  data, 
  type = 'both',
  height = 300 
}: EmailDistributionChartProps) => {
  // Prepare data for charts
  const pieData = [
    { name: 'Pending', value: data.pendingEmails, color: COLORS.pending, icon: Clock },
    { name: 'Replied', value: data.repliedEmails, color: COLORS.replied, icon: CheckCircle },
    { name: 'Overdue', value: data.overdueEmails, color: COLORS.overdue, icon: AlertTriangle },
    { name: 'High Priority', value: data.highPriorityEmails, color: COLORS.highPriority, icon: Mail },
  ].filter(item => item.value > 0);

  const barData = [
    { status: 'Pending', count: data.pendingEmails, percentage: (data.pendingEmails / data.totalEmails) * 100 },
    { status: 'Replied', count: data.repliedEmails, percentage: (data.repliedEmails / data.totalEmails) * 100 },
    { status: 'Overdue', count: data.overdueEmails, percentage: (data.overdueEmails / data.totalEmails) * 100 },
    { status: 'High Priority', count: data.highPriorityEmails, percentage: (data.highPriorityEmails / data.totalEmails) * 100 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.name || data.payload.status}</p>
          <p className="text-sm text-muted-foreground">
            Count: <span className="font-medium text-foreground">{data.value || data.payload.count}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">
              {((data.value || data.payload.count) / data.totalEmails * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="text-amber-500" />;
      case 'Replied': return <CheckCircle size={16} className="text-green-500" />;
      case 'Overdue': return <AlertTriangle size={16} className="text-red-500" />;
      case 'High Priority': return <Mail size={16} className="text-purple-500" />;
      default: return <Mail size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-background p-5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Email Distribution</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of email status and priority distribution
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Clock size={20} className="mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold text-amber-500">{data.pendingEmails}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle size={20} className="mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold text-green-500">{data.repliedEmails}</p>
          <p className="text-xs text-muted-foreground">Replied</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={20} className="mx-auto mb-2 text-red-500" />
          <p className="text-2xl font-bold text-red-500">{data.overdueEmails}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Mail size={20} className="mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold text-purple-500">{data.highPriorityEmails}</p>
          <p className="text-xs text-muted-foreground">High Priority</p>
        </div>
      </div>

      {/* Charts */}
      <div className={`grid ${type === 'both' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Pie Chart */}
        {(type === 'pie' || type === 'both') && (
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 text-center">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="flex items-center gap-2">
                      {entry.payload.icon && <entry.payload.icon size={14} />}
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart */}
        {(type === 'bar' || type === 'both') && (
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 text-center">Volume Analysis</h3>
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9333ea33" />
                <XAxis 
                  dataKey="status" 
                  stroke="#a78bfa"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#a78bfa"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium text-foreground mb-3">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${data.overdueEmails > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="text-muted-foreground">
              {data.overdueEmails > 0 ? `${data.overdueEmails} emails need attention` : 'No overdue emails'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${data.pendingEmails > data.totalEmails * 0.3 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
            <span className="text-muted-foreground">
              {((data.pendingEmails / data.totalEmails) * 100).toFixed(1)}% pending response
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${data.repliedEmails / data.totalEmails > 0.7 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="text-muted-foreground">
              {((data.repliedEmails / data.totalEmails) * 100).toFixed(1)}% resolution rate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${data.highPriorityEmails > data.totalEmails * 0.2 ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="text-muted-foreground">
              {data.highPriorityEmails} high priority emails
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

EmailDistributionChart.displayName = "EmailDistributionChart";