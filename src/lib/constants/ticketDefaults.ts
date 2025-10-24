import { TicketPriority, TicketStatus } from "@/types/ticket";

const toHex = (value: string) => value.toLowerCase();

export const DEFAULT_TICKET_STATUSES: TicketStatus[] = [
  {
    id: "new",
    name: "New",
    color: toHex("#03363d"),
    order: 1,
    isDefault: true,
    isResolved: false,
  },
  {
    id: "open",
    name: "Open",
    color: toHex("#0e7c90"),
    order: 2,
    isDefault: false,
    isResolved: false,
  },
  {
    id: "pending",
    name: "Pending",
    color: toHex("#f7931e"),
    order: 3,
    isDefault: false,
    isResolved: false,
  },
  {
    id: "replied",
    name: "Replied",
    color: toHex("#2196f3"),
    order: 4,
    isDefault: false,
    isResolved: false,
  },
  {
    id: "solved",
    name: "Solved",
    color: toHex("#2e7d32"),
    order: 5,
    isDefault: false,
    isResolved: true,
  },
  {
    id: "closed",
    name: "Closed",
    color: toHex("#6c757d"),
    order: 6,
    isDefault: false,
    isResolved: true,
  },
];

export const DEFAULT_TICKET_PRIORITIES: TicketPriority[] = [
  {
    id: "low",
    name: "Low",
    color: toHex("#6c757d"),
    order: 1,
    isDefault: false,
    urgency: 1,
  },
  {
    id: "medium",
    name: "Medium",
    color: toHex("#f7931e"),
    order: 2,
    isDefault: true,
    urgency: 2,
  },
  {
    id: "high",
    name: "High",
    color: toHex("#f57c00"),
    order: 3,
    isDefault: false,
    urgency: 3,
  },
  {
    id: "urgent",
    name: "Urgent",
    color: toHex("#d32f2f"),
    order: 4,
    isDefault: false,
    urgency: 4,
  },
];

const capitalize = (value: string) =>
  value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export const createFallbackStatus = (statusId: string): TicketStatus => ({
  id: statusId,
  name: capitalize(statusId),
  color: toHex("#6c757d"),
  order: DEFAULT_TICKET_STATUSES.length + 1,
  isDefault: false,
  isResolved: ["solved", "closed"].includes(statusId),
});

export const createFallbackPriority = (priorityId: string): TicketPriority => ({
  id: priorityId,
  name: capitalize(priorityId),
  color: toHex("#6c757d"),
  order: DEFAULT_TICKET_PRIORITIES.length + 1,
  isDefault: false,
  urgency: 2,
});

