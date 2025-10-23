"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { TicketList } from "@/components/tickets/TicketList";
import { useTicketStore } from "@/lib/stores/ticketStore";
import { useRouter } from "next/navigation";

export default function TicketsPage() {
  const router = useRouter();
  const { refreshTickets, setTicketStatuses, setTicketPriorities } = useTicketStore();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, [setTicketStatuses, setTicketPriorities]);

  async function loadTickets() {
    try {
      setIsLoading(true);
      
      // Initialize ticket statuses and priorities
      setTicketStatuses([
        { id: "new", name: "New", color: "#03363d", order: 1, isDefault: true, isResolved: false },
        { id: "open", name: "Open", color: "#0e7c90", order: 2, isDefault: false, isResolved: false },
        { id: "pending", name: "Pending", color: "#f7931e", order: 3, isDefault: false, isResolved: false },
        { id: "replied", name: "Replied", color: "#2196f3", order: 4, isDefault: false, isResolved: false },
        { id: "solved", name: "Solved", color: "#2e7d32", order: 5, isDefault: false, isResolved: true },
        { id: "closed", name: "Closed", color: "#6c757d", order: 6, isDefault: false, isResolved: true },
      ]);

      setTicketPriorities([
        { id: "low", name: "Low", color: "#6c757d", order: 1, isDefault: false, urgency: 1 },
        { id: "medium", name: "Medium", color: "#f7931e", order: 2, isDefault: true, urgency: 2 },
        { id: "high", name: "High", color: "#f57c00", order: 3, isDefault: false, urgency: 3 },
        { id: "urgent", name: "Urgent", color: "#d32f2f", order: 4, isDefault: false, urgency: 4 },
      ]);

      // Fetch real tickets from API
      // Note: Using direct DB query for now since /api/emails requires auth
      const response = await fetch('/api/tickets/list');
      if (!response.ok) {
        console.error('Failed to fetch from API, using empty array');
        useTicketStore.getState().setTickets([]);
        return;
      }
      
      const emailsData = await response.json();
      
      // Transform emails to tickets format
      const tickets = emailsData.map((email: any) => ({
        id: email.id.toString(),
        subject: email.subject,
        description: email.bodyContent,
        status: {
          id: email.status,
          name: email.status.charAt(0).toUpperCase() + email.status.slice(1),
          color: getStatusColor(email.status),
          order: 1,
          isDefault: false,
          isResolved: email.isResolved,
        },
        priority: {
          id: email.priority,
          name: email.priority.charAt(0).toUpperCase() + email.priority.slice(1),
          color: getPriorityColor(email.priority),
          order: 1,
          isDefault: false,
          urgency: getPriorityUrgency(email.priority),
        },
        assigneeId: email.assignedTo?.toString(),
        customerId: email.senderEmail,
        createdBy: email.senderEmail,
        createdAt: new Date(email.receivedAt),
        updatedAt: new Date(email.createdAt),
        dueDate: email.slaDeadline ? new Date(email.slaDeadline) : undefined,
        resolvedAt: undefined,
        tags: [],
        customFields: {},
        isResolved: email.isResolved,
        slaDeadline: new Date(email.slaDeadline),
        firstReplyAt: email.firstReplyAt ? new Date(email.firstReplyAt) : undefined,
        lastReplyAt: undefined,
        threadId: email.threadId || email.id.toString(),
      }));

      useTicketStore.getState().setTickets(tickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#f7931e',
      open: '#0e7c90',
      replied: '#2196f3',
      solved: '#2e7d32',
      closed: '#6c757d',
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

  function getPriorityUrgency(priority: string): number {
    const urgency: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4,
    };
    return urgency[priority] || 2;
  }

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    router.push(`/tickets/${ticketId}`);
  };

  const handleCreateTicket = () => {
    router.push("/tickets/new");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold zd-text-neutral-900">Tickets</h1>
          <p className="zd-text-neutral-600 mt-1">Manage and track customer support tickets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
          <Button onClick={handleCreateTicket} className="zd-bg-primary hover:zd-bg-primary-hover text-white">
            <Plus size={16} className="mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="zd-bg-neutral-100 border-zd-border-neutral-200">
            <CardHeader>
              <CardTitle className="zd-text-neutral-800">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="zd-text-neutral-600">Total Tickets</span>
                <span className="font-semibold zd-text-neutral-800">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="zd-text-neutral-600">Open</span>
                <span className="font-semibold zd-text-primary">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="zd-text-neutral-600">Pending</span>
                <span className="font-semibold zd-text-warning">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="zd-text-neutral-600">Resolved</span>
                <span className="font-semibold zd-text-success">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <TicketList onTicketSelect={handleTicketSelect} />
        </div>
      </div>
    </div>
  );
}
