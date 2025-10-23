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
