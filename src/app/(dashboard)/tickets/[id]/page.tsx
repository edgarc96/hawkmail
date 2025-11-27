"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TicketWorkspaceZendesk } from '@/components/tickets/TicketWorkspaceZendesk';
import { Loader2 } from 'lucide-react';
import { mapEmailRecordToSerializable } from '@/lib/utils/ticket-mapper';
import { TicketWorkspaceData, CustomerSummary, TicketStatistics, TicketTimelineEntry } from '@/types/ticket-detail';
import { useTicketStore } from '@/lib/stores/ticketStore';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [workspaceData, setWorkspaceData] = useState<TicketWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ticketStatuses = useTicketStore((state) => state.ticketStatuses);
  const ticketPriorities = useTicketStore((state) => state.ticketPriorities);

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
      const emailData = await ticketRes.json();
      
      // Map email to SerializedTicket
      const serializedTicket = mapEmailRecordToSerializable(emailData, ticketStatuses, ticketPriorities);

      // Create customer summary
      const customerSummary: CustomerSummary = {
        name: emailData.senderEmail.split('@')[0],
        email: emailData.senderEmail,
        avatarInitials: emailData.senderEmail.substring(0, 2).toUpperCase(),
        organization: null,
        language: null,
        localTime: null,
        notes: null,
      };
      
      // Fetch customer data and stats
      let stats: TicketStatistics = {
        totalTickets: 1,
        openTickets: emailData.isResolved ? 0 : 1,
        resolvedTickets: emailData.isResolved ? 1 : 0,
        satisfactionScore: null,
      };

      try {
        const customerRes = await fetch(`/api/customers/${emailData.senderEmail}`);
        if (customerRes.ok) {
          const customerData = await customerRes.json();
          customerSummary.name = customerData.name || customerSummary.name;
          stats = {
            totalTickets: customerData.totalTickets || 1,
            openTickets: customerData.openTickets || 0,
            resolvedTickets: customerData.resolvedTickets || 0,
            satisfactionScore: customerData.satisfactionScore,
          };
        }
      } catch (err) {
        console.warn('Failed to fetch customer data', err);
      }

      // Create timeline
      const timeline: TicketTimelineEntry[] = [
        {
          id: `${emailData.id}-received`,
          type: 'milestone',
          title: 'Email received',
          description: `Ticket created from email`,
          statusId: emailData.status,
          timestamp: new Date(emailData.receivedAt || emailData.createdAt).toISOString(),
        },
      ];

      if (emailData.firstReplyAt) {
        timeline.push({
          id: `${emailData.id}-replied`,
          type: 'milestone',
          title: 'First reply sent',
          description: null,
          statusId: null,
          timestamp: new Date(emailData.firstReplyAt).toISOString(),
        });
      }

      setWorkspaceData({
        ticket: serializedTicket,
        customer: customerSummary,
        stats,
        timeline,
      });
      
    } catch (err) {
      console.error('Error loading ticket data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !workspaceData) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Ticket</h2>
          <p className="mt-2 text-gray-600">{error || 'Ticket not found'}</p>
          <button
            onClick={() => router.push('/tickets')}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <TicketWorkspaceZendesk
      ticket={workspaceData.ticket}
      customer={workspaceData.customer}
      stats={workspaceData.stats}
      timeline={workspaceData.timeline}
    />
  );
}
