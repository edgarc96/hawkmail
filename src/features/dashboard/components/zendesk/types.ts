import { ReactNode } from "react";

export type DashboardView =
  | "dashboard"
  | "tickets"
  | "sla"
  | "performance"
  | "agents"
  | "settings"
  | "alerts"
  | "configuration";

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: ReactNode;
}

export interface ResponseTrendDatum {
  label: string;
  firstReplyMinutes: number;
  resolutionMinutes?: number;
  resolutionRate?: number;
  targetMinutes?: number;
}

export interface AgentPerformanceDatum {
  agent: string;
  tickets: number;
  avgFirstReplyMinutes: number;
  avgResolutionMinutes: number;
  satisfactionPercentage?: number | null;
}

export interface SlaComplianceDatum {
  category: string;
  met: number;
  breached: number;
}

export interface TicketRow {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  status: string;
  statusLabel: string;
  priority: string;
  priorityLabel: string;
  assigneeName?: string | null;
  assigneeInitials?: string | null;
  firstResponse?: string | null;
  resolutionTime?: string | null;
  createdAtLabel: string;
  updatedAtLabel?: string | null;
  // AI Fields
  category?: string | null;
  sentiment?: string | null;
  tags?: string[];
}
