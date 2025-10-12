"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface EnhancedMetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
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
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden"
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      {/* Glassmorphism effect */}
      <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/20 border border-white/10 rounded-2xl p-6 shadow-2xl">
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="text-white" size={24} />
            </div>
            
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                trend.isPositive
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <span className="text-xs font-bold">
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{title}</p>
            <motion.p
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
              className="text-4xl font-bold bg-gradient-to-br from-white to-gray-300 dark:from-white dark:to-gray-400 bg-clip-text text-transparent"
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Bottom glow */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-50`}></div>
      </div>
    </motion.div>
  );
}

// Shimmer animation for CSS
// Add to globals.css:
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }