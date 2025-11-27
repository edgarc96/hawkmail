import {
  DEFAULT_TICKET_PRIORITIES,
  DEFAULT_TICKET_STATUSES,
  createFallbackPriority,
  createFallbackStatus,
} from "@/lib/constants/ticketDefaults";
import { Ticket, TicketPriority, TicketStatus } from "@/types/ticket";

export interface EmailRecord {
  id: number;
  userId: string;
  subject: string;
  senderEmail: string;
  recipientEmail: string;
  bodyContent: string | null;
  receivedAt: string | Date;
  firstReplyAt: string | Date | null;
  status: string;
  priority: string;
  slaDeadline: string | Date | null;
  isResolved: boolean | number;
  createdAt: string | Date;
  providerId: number | null;
  assignedTo: number | null;
  externalId: string | null;
  threadId: string | null;
  rawHeaders?: string | null;
  category?: string | null;
  sentiment?: string | null;
}

const normalizeDate = (value: string | Date | number | null | undefined): Date | undefined => {
  if (!value && value !== 0) {
    return undefined;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  return new Date(value as string);
};

const toIsoString = (value: Date | undefined): string | null =>
  value ? value.toISOString() : null;

const stripHtml = (html?: string | null) =>
  (html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const resolveStatusMeta = (
  statusId: string,
  statuses: TicketStatus[] = DEFAULT_TICKET_STATUSES
): TicketStatus => {
  const existing = statuses.find((status) => status.id === statusId);
  return existing ? { ...existing } : createFallbackStatus(statusId);
};

export const resolvePriorityMeta = (
  priorityId: string,
  priorities: TicketPriority[] = DEFAULT_TICKET_PRIORITIES
): TicketPriority => {
  const existing = priorities.find((priority) => priority.id === priorityId);
  return existing ? { ...existing } : createFallbackPriority(priorityId);
};

export const mapEmailRecordToTicket = (
  email: EmailRecord,
  statuses: TicketStatus[] = DEFAULT_TICKET_STATUSES,
  priorities: TicketPriority[] = DEFAULT_TICKET_PRIORITIES
): Ticket => {
  const receivedAt = normalizeDate(email.receivedAt) ?? normalizeDate(email.createdAt) ?? new Date();
  const createdAt = normalizeDate(email.createdAt) ?? receivedAt;
  const slaDeadline = normalizeDate(email.slaDeadline);
  const firstReplyAt = normalizeDate(email.firstReplyAt);

  return {
    id: email.id.toString(),
    subject: email.subject,
    description: stripHtml(email.bodyContent),
    status: resolveStatusMeta(email.status, statuses),
    priority: resolvePriorityMeta(email.priority, priorities),
    assigneeId: email.assignedTo ? email.assignedTo.toString() : undefined,
    customerId: email.senderEmail,
    createdBy: email.senderEmail,
    createdAt,
    updatedAt: receivedAt,
    dueDate: slaDeadline,
    resolvedAt: undefined,
    tags: [],
    customFields: {},
    isResolved: Boolean(email.isResolved),
    slaDeadline: slaDeadline ?? receivedAt,
    firstReplyAt,
    lastReplyAt: firstReplyAt,
    threadId: email.threadId || email.id.toString(),
    category: email.category,
    sentiment: email.sentiment,
  };
};

export interface SerializedTicket {
  ticket: Omit<Ticket, "createdAt" | "updatedAt" | "dueDate" | "resolvedAt" | "slaDeadline" | "firstReplyAt" | "lastReplyAt"> & {
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    resolvedAt?: string;
    slaDeadline: string;
    firstReplyAt?: string;
    lastReplyAt?: string;
  };
  bodyHtml: string;
  recipientEmail: string;
  receivedAt: string;
  channel: "email";
}

export const mapEmailRecordToSerializable = (
  email: EmailRecord,
  statuses: TicketStatus[] = DEFAULT_TICKET_STATUSES,
  priorities: TicketPriority[] = DEFAULT_TICKET_PRIORITIES
): SerializedTicket => {
  const ticket = mapEmailRecordToTicket(email, statuses, priorities);

  return {
    ticket: {
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      dueDate: ticket.dueDate ? ticket.dueDate.toISOString() : undefined,
      resolvedAt: ticket.resolvedAt ? ticket.resolvedAt.toISOString() : undefined,
      slaDeadline: ticket.slaDeadline.toISOString(),
      firstReplyAt: ticket.firstReplyAt ? ticket.firstReplyAt.toISOString() : undefined,
      lastReplyAt: ticket.lastReplyAt ? ticket.lastReplyAt.toISOString() : undefined,
    },
    bodyHtml: email.bodyContent ?? "",
    recipientEmail: email.recipientEmail,
    receivedAt: toIsoString(normalizeDate(email.receivedAt) ?? normalizeDate(email.createdAt)) ?? new Date().toISOString(),
    channel: "email",
  };
};
