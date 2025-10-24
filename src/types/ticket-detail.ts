import { SerializedTicket } from "@/lib/utils/ticket-mapper";

export interface CustomerSummary {
  name: string;
  email: string;
  avatarInitials: string;
  organization?: string | null;
  language?: string | null;
  localTime?: string | null;
  notes?: string | null;
}

export interface TicketStatistics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  satisfactionScore?: number | null;
}

export type TimelineEventType = "milestone" | "ticket" | "status";

export interface TicketTimelineEntry {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string | null;
  statusId?: string | null;
  timestamp: string;
}

export interface TicketWorkspaceData {
  ticket: SerializedTicket;
  customer: CustomerSummary;
  stats: TicketStatistics;
  timeline: TicketTimelineEntry[];
}

