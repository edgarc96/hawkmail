import { DashboardMetric } from "./types";
import { Card } from "@/components/ui/card";
import clsx from "clsx";
import { TrendingUp } from "lucide-react";

interface DashboardMetricsProps {
  metrics: DashboardMetric[];
}

export function ZendeskDashboardMetrics({ metrics }: DashboardMetricsProps) {
  if (!metrics.length) {
    return (
      <Card className="p-8 bg-[#18181b] border-white/10 text-center text-gray-400">
        No hay métricas disponibles todavía.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {metrics.map(({ id, title, value, subtitle, trend, icon }) => (
        <Card
          key={id}
          className="p-6 bg-[#18181b] border-white/10"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">{title}</p>
              <p className="text-3xl font-bold text-white mb-1">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
              {trend && (
                <div
                  className={clsx(
                    "flex items-center gap-1 mt-2 text-sm",
                    trend.isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  <TrendingUp
                    className={clsx(
                      "w-4 h-4",
                      trend.isPositive ? "" : "rotate-180"
                    )}
                  />
                  <span>{trend.value}</span>
                </div>
              )}
            </div>
            <div className="text-violet-500">{icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
