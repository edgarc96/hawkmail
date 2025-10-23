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

export type NotificationType = 'ticket_assigned' | 'ticket_mentioned' | 'ticket_status_changed' | 'new_message' | 'customer_replied' | 'sla_warning' | 'system';
