"use client";

import { AlertCircle, TrendingUp, Smile, Frown, Zap } from "lucide-react";

interface EmailClassificationBadgeProps {
  priority: 'high' | 'medium' | 'low';
  category?: string;
  sentiment?: 'urgent' | 'positive' | 'neutral' | 'negative';
  tags?: string[];
  className?: string;
}

export function EmailClassificationBadge({
  priority,
  category,
  sentiment,
  tags,
  className = ''
}: EmailClassificationBadgeProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: AlertCircle,
          bgColor: 'bg-gradient-to-r from-red-500/20 to-orange-500/20',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-400',
          label: '🔥 High Priority'
        };
      case 'medium':
        return {
          icon: TrendingUp,
          bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-400',
          label: '⚡ Medium'
        };
      default:
        return {
          icon: TrendingUp,
          bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
          label: '✅ Low Priority'
        };
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'urgent':
        return <Zap size={12} className="text-orange-400" />;
      case 'positive':
        return <Smile size={12} className="text-green-400" />;
      case 'negative':
        return <Frown size={12} className="text-red-400" />;
      default:
        return null;
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Priority Badge */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor} backdrop-blur-sm transition-all hover:scale-105`}>
        <Icon size={14} className={config.textColor} />
        <span className={`text-xs font-semibold ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      {/* Category Badge */}
      {category && category !== 'other' && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 backdrop-blur-sm">
          <span className="text-xs font-medium text-purple-300 capitalize">
            {category}
          </span>
        </div>
      )}

      {/* Sentiment Icon */}
      {sentiment && sentiment !== 'neutral' && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-500/10 border border-gray-500/30 backdrop-blur-sm">
          {getSentimentIcon(sentiment)}
          <span className="text-xs text-gray-300 capitalize">{sentiment}</span>
        </div>
      )}

      {/* Custom Tags */}
      {tags && tags.length > 0 && tags.slice(0, 2).map((tag, idx) => (
        <div
          key={idx}
          className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm"
        >
          <span className="text-xs text-blue-300">{tag}</span>
        </div>
      ))}
    </div>
  );
}