"use client";

import { memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PerformanceTrendChartProps {
  data: Array<{
    date: string;
    avgFirstReplyTimeMinutes: number;
    resolutionRate: number;
    totalEmails: number;
  }>;
  title?: string;
  type?: 'line' | 'area';
  height?: number;
}

export const PerformanceTrendChart = memo(({ 
  data, 
  title = "Performance Trend", 
  type = 'line',
  height = 300 
}: PerformanceTrendChartProps) => {
  // Process data for chart
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    replyTimeHours: Math.round(item.avgFirstReplyTimeMinutes / 60 * 10) / 10,
    replyEfficiency: Math.max(0, 100 - (item.avgFirstReplyTimeMinutes / 60) * 20), // Efficiency score
  }));

  // Calculate trend
  const trend = data.length > 1 ? 
    ((data[0].avgFirstReplyTimeMinutes - data[data.length - 1].avgFirstReplyTimeMinutes) / 
     data[data.length - 1].avgFirstReplyTimeMinutes) * 100 : 0;

  const getTrendIcon = () => {
    if (Math.abs(trend) < 5) return <Minus size={16} className="text-muted-foreground" />;
    return trend > 0 ? 
      <TrendingDown size={16} className="text-red-500" /> : 
      <TrendingUp size={16} className="text-green-500" />;
  };

  const getTrendColor = () => {
    if (Math.abs(trend) < 5) return "text-muted-foreground";
    return trend > 0 ? "text-red-500" : "text-green-500";
  };

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className="rounded-lg border border-primary/20 bg-background p-5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          {title}
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        </h2>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Avg Reply Time</p>
          <p className="font-mono text-sm text-foreground">
            {data.length > 0 ? `${Math.round(data[0].avgFirstReplyTimeMinutes / 60)}h ${data[0].avgFirstReplyTimeMinutes % 60}m` : 'N/A'}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#9333ea33" />
          <XAxis 
            dataKey="date" 
            stroke="#a78bfa"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#a78bfa"
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip 
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px -30px rgba(15, 23, 42, 0.35)',
              color: 'var(--foreground)',
            }}
            labelStyle={{ color: 'var(--muted-foreground)' }}
            itemStyle={{ color: 'var(--foreground)' }}
            formatter={(value: number, name: string) => {
              if (name === 'avgFirstReplyTimeMinutes') {
                return [`${value} min`, 'Reply Time'];
              }
              if (name === 'resolutionRate') {
                return [`${value.toFixed(1)}%`, 'Resolution Rate'];
              }
              if (name === 'replyEfficiency') {
                return [`${value.toFixed(1)}%`, 'Efficiency'];
              }
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--muted-foreground)' }} />
          
          <DataComponent
            type="monotone"
            dataKey="avgFirstReplyTimeMinutes"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill={type === 'area' ? "#8b5cf6" : undefined}
            fillOpacity={type === 'area' ? 0.3 : undefined}
            name="Reply Time (min)"
          />
          
          <DataComponent
            type="monotone"
            dataKey="resolutionRate"
            stroke="#10b981"
            strokeWidth={2}
            fill={type === 'area' ? "#10b981" : undefined}
            fillOpacity={type === 'area' ? 0.3 : undefined}
            name="Resolution Rate (%)"
          />

          {type === 'area' && (
            <DataComponent
              type="monotone"
              dataKey="replyEfficiency"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="#f59e0b"
              fillOpacity={0.2}
              name="Efficiency (%)"
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>

      {/* Performance Indicators */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Current Performance</p>
          <p className="text-lg font-semibold text-primary">
            {data.length > 0 ? `${Math.round(data[0].resolutionRate)}%` : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Trend</p>
          <p className={`text-lg font-semibold ${getTrendColor()}`}>
            {trend > 0 ? '↓ Improving' : trend < 0 ? '↑ Declining' : '→ Stable'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Volume</p>
          <p className="text-lg font-semibold text-primary">
            {data.length > 0 ? data[0].totalEmails : 0}
          </p>
        </div>
      </div>
    </div>
  );
});

PerformanceTrendChart.displayName = "PerformanceTrendChart";