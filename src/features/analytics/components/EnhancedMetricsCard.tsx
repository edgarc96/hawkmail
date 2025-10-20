"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type MetricIcon = LucideIcon;

interface EnhancedMetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: MetricIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  delay?: number;
}

export function EnhancedMetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient,
  delay = 0
}: EnhancedMetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ translateY: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <div className="relative rounded-lg border border-primary/20 bg-background p-5 transition-all duration-200 group-hover:border-primary/40">
        <div className="mb-3">
          {trend && (
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                trend.isPositive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.1 }}
            className="text-3xl font-bold text-primary"
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}
