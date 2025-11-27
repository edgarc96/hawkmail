export interface Ticket {
  id: string;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  customerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  resolvedAt?: Date;
  tags: string[];
  customFields: Record<string, any>;
  isResolved: boolean;
  slaDeadline: Date;
  firstReplyAt?: Date;
  lastReplyAt?: Date;
  threadId: string;
  category?: string | null;
  sentiment?: string | null;
}

export interface Message {
  id: string;
  ticketId: string;
  threadId: string;
  parentId?: string;
  isInternal: boolean;
  sender: MessageSender;
  recipient: string;
  subject: string;
  content: string;
  bodyContent?: string;
  attachments: Attachment[];
  timestamp: Date;
  metadata: Record<string, any>;
  isRead: boolean;
}

export interface MessageSender {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAgent: boolean;
  role?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  isInline: boolean;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastInteractionAt?: Date;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  satisfactionScore?: number;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  content: string;
  isInternal: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
  shortcut?: string;
  isGlobal: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags: string[];
  variables?: CannedResponseVariable[];
}

export interface CannedResponseVariable {
  name: string;
  label: string;
  defaultValue?: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface TicketStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  isResolved: boolean;
}

export interface TicketPriority {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  urgency: number;
}

export interface FilterState {
  status: string[];
  priority: string[];
  assignee: string[];
  dateRange: [Date, Date] | null;
  tags: string[];
  customFields: Record<string, any>;
  search?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  parentId?: string;
  order: number;
  isDefault: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  ticketAssigned: boolean;
  ticketMentioned: boolean;
  ticketStatusChanged: boolean;
  newMessage: boolean;
  customerReplied: boolean;
  slaWarning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Presence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentTicketId?: string;
  isTyping?: {
    ticketId: string;
    timestamp: Date;
  };
}

export interface Interaction {
  id: string;
  customerId: string;
  type: 'email' | 'phone' | 'chat' | 'note' | 'ticket';
  title: string;
  description?: string;
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  ticketId?: string;
  duration?: number; // in minutes for phone/chat
}

export type TicketStatusValue = 'new' | 'open' | 'pending' | 'solved' | 'closed';
export type TicketPriorityValue = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'ticket_assigned' | 'ticket_mentioned' | 'ticket_status_changed' | 'new_message' | 'customer_replied' | 'sla_warning' | 'system';
