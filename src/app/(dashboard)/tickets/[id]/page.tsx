"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TicketWorkspace } from '@/components/tickets/TicketWorkspace';
import { Ticket, Message, Customer } from '@/types/ticket';
import { Loader2 } from 'lucide-react';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTicketData();
  }, [ticketId]);

  async function loadTicketData() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch ticket
      const ticketRes = await fetch(`/api/tickets/${ticketId}`);
      if (!ticketRes.ok) throw new Error('Failed to fetch ticket');
      const ticketData = await ticketRes.json();
      
      // Transform email data to Ticket format
      const transformedTicket: Ticket = {
        id: ticketData.id.toString(),
        subject: ticketData.subject,
        description: ticketData.bodyContent,
        status: {
          id: ticketData.status,
          name: ticketData.status.charAt(0).toUpperCase() + ticketData.status.slice(1),
          color: getStatusColor(ticketData.status),
          order: 1,
          isDefault: false,
          isResolved: ticketData.isResolved,
        },
        priority: {
          id: ticketData.priority,
          name: ticketData.priority.charAt(0).toUpperCase() + ticketData.priority.slice(1),
          color: getPriorityColor(ticketData.priority),
          order: 1,
          isDefault: false,
          urgency: 2,
        },
        assigneeId: ticketData.assignedTo?.toString(),
        customerId: ticketData.senderEmail,
        createdBy: ticketData.senderEmail,
        createdAt: new Date(ticketData.createdAt),
        updatedAt: new Date(ticketData.createdAt),
        dueDate: ticketData.slaDeadline ? new Date(ticketData.slaDeadline) : undefined,
        resolvedAt: undefined,
        tags: [],
        customFields: {},
        isResolved: ticketData.isResolved,
        slaDeadline: new Date(ticketData.slaDeadline),
        firstReplyAt: ticketData.firstReplyAt ? new Date(ticketData.firstReplyAt) : undefined,
        lastReplyAt: undefined,
        threadId: ticketData.threadId || ticketData.id.toString(),
      };
      
      setTicket(transformedTicket);

      // Fetch thread messages
      const msgsRes = await fetch(`/api/tickets/${ticketId}/messages`);
      let mappedMessages: Message[] = [];
      if (msgsRes.ok) {
        const data = await msgsRes.json();
        const roots = data.messages || [];
        const flat: any[] = [];
        const walk = (node: any) => {
          flat.push(node);
          if (Array.isArray(node.children)) node.children.forEach(walk);
        };
        roots.forEach(walk);

        mappedMessages = flat.map((m) => {
          let headers: any = {};
          try { headers = m.rawHeaders ? JSON.parse(m.rawHeaders) : {}; } catch {}
          return {
            id: String(m.id),
            ticketId: String(m.ticketId),
            threadId: m.threadId || String(ticketData.id),
            parentId: m.parentId ? String(m.parentId) : undefined,
            isInternal: !!m.isInternal,
            sender: {
              id: m.senderId || m.senderEmail,
              name: m.senderName || (m.senderEmail?.split('@')[0] ?? 'Sender'),
              email: m.senderEmail,
              avatar: undefined,
              isAgent: !!m.senderId,
            },
            recipient: m.recipientEmail || ticketData.recipientEmail,
            subject: m.subject || ticketData.subject,
            content: m.htmlContent || m.textContent || '',
            bodyContent: m.htmlContent || m.textContent || '',
            attachments: [],
            timestamp: new Date(m.timestamp),
            metadata: {
              to: headers.to || (headers.To ? [headers.To] : undefined),
              cc: headers.cc || headers.Cc,
              inReplyTo: m.inReplyTo,
              references: m.references,
            },
            isRead: !!m.isRead,
          } as Message;
        }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      } else {
        // Fallback to initial message when API is not available
        mappedMessages = [
          {
            id: `msg-${ticketData.id}`,
            ticketId: ticketData.id.toString(),
            threadId: ticketData.threadId || ticketData.id.toString(),
            parentId: undefined,
            isInternal: false,
            sender: {
              id: ticketData.senderEmail,
              name: ticketData.senderEmail.split('@')[0],
              email: ticketData.senderEmail,
              avatar: undefined,
              isAgent: false,
            },
            recipient: ticketData.recipientEmail,
            subject: ticketData.subject,
            content: ticketData.bodyContent || '',
            bodyContent: ticketData.bodyContent || '',
            attachments: [],
            timestamp: new Date(ticketData.receivedAt),
            metadata: {},
            isRead: true,
          },
        ];
      }

      setMessages(mappedMessages);
      
      // Fetch customer data
      const customerRes = await fetch(`/api/customers/${ticketData.senderEmail}`);
      if (!customerRes.ok) throw new Error('Failed to fetch customer');
      const customerData = await customerRes.json();
      
      setCustomer(customerData);
      
    } catch (err) {
      console.error('Error loading ticket data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReply(content: string, attachments?: File[]) {
    try {
      // TODO: Get user data from session
      const response = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          isInternal: false,
          recipientEmail: customer?.email,
          userId: 'temp-user-id',
          userName: 'Agent',
          userEmail: 'agent@example.com',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to send reply');
      
      const result = await response.json();
      
      // Reload ticket data to get updated messages
      await loadTicketData();
      
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply');
    }
  }

  async function handleStatusChange(statusId: string) {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusId }),
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      await loadTicketData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  }

  async function handlePriorityChange(priorityId: string) {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: priorityId }),
      });
      
      if (!response.ok) throw new Error('Failed to update priority');
      
      await loadTicketData();
    } catch (err) {
      console.error('Error updating priority:', err);
      alert('Failed to update priority');
    }
  }

  async function handleAssigneeChange(assigneeId: string) {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: parseInt(assigneeId) }),
      });
      
      if (!response.ok) throw new Error('Failed to update assignee');
      
      await loadTicketData();
    } catch (err) {
      console.error('Error updating assignee:', err);
      alert('Failed to update assignee');
    }
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#03363d',
      replied: '#0e7c90',
      overdue: '#f57c00',
      resolved: '#2e7d32',
    };
    return colors[status] || '#6c757d';
  }

  function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: '#6c757d',
      medium: '#f7931e',
      high: '#f57c00',
      urgent: '#d32f2f',
    };
    return colors[priority] || '#6c757d';
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket || !customer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Ticket</h2>
          <p className="mt-2 text-gray-600">{error || 'Ticket not found'}</p>
          <button
            onClick={() => router.push('/tickets')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <TicketWorkspace
      ticket={ticket}
      messages={messages}
      customer={customer}
      onReply={handleReply}
      onStatusChange={handleStatusChange}
      onPriorityChange={handlePriorityChange}
      onAssigneeChange={handleAssigneeChange}
    />
  );
}
