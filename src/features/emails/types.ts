export interface Email {
  id: number;
  subject: string;
  senderEmail: string;
  recipientEmail: string;
  bodyContent?: string | null;
  receivedAt: string;
  slaDeadline: string;
  firstReplyAt: string | null;
  status: string;
  priority: string;
  category?: string | null;
  sentiment?: string | null;
  isResolved: boolean;
  assignedTo: number | null;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  specialties?: string[]; // Optional: categories this member specializes in (e.g., ['sales', 'support'])
}