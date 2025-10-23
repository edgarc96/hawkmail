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

  useEffect(() => {
    // Initialize ticket statuses and priorities
    setTicketStatuses([
      { id: "new", name: "New", color: "#03363d", order: 1, isDefault: true, isResolved: false },
      { id: "open", name: "Open", color: "#0e7c90", order: 2, isDefault: false, isResolved: false },
      { id: "pending", name: "Pending", color: "#f7931e", order: 3, isDefault: false, isResolved: false },
      { id: "solved", name: "Solved", color: "#2e7d32", order: 4, isDefault: false, isResolved: true },
      { id: "closed", name: "Closed", color: "#6c757d", order: 5, isDefault: false, isResolved: true },
    ]);

    setTicketPriorities([
      { id: "low", name: "Low", color: "#6c757d", order: 1, isDefault: false, urgency: 1 },
      { id: "medium", name: "Medium", color: "#f7931e", order: 2, isDefault: true, urgency: 2 },
      { id: "high", name: "High", color: "#f57c00", order: 3, isDefault: false, urgency: 3 },
      { id: "urgent", name: "Urgent", color: "#d32f2f", order: 4, isDefault: false, urgency: 4 },
    ]);

    // In a real app, we would fetch tickets from the API
    // For now, we will create some mock data
    const mockTickets = [
      {
        id: "ticket-1",
        subject: "Issue with login functionality",
        description: "Customer reports being unable to log in to their account despite using correct credentials.",
        status: { id: "new", name: "New", color: "#03363d", order: 1, isDefault: true, isResolved: false },
        priority: { id: "high", name: "High", color: "#f57c00", order: 3, isDefault: false, urgency: 3 },
        assigneeId: "agent-1",
        customerId: "customer-1",
        createdBy: "system",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        resolvedAt: undefined,
        tags: ["login", "authentication"],
        customFields: {},
        isResolved: false,
        slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
        firstReplyAt: undefined,
        lastReplyAt: undefined,
        threadId: "thread-1",
      },
      {
        id: "ticket-2",
        subject: "Request for feature enhancement",
        description: "Customer would like to see a dark mode option added to the application.",
        status: { id: "open", name: "Open", color: "#0e7c90", order: 2, isDefault: false, isResolved: false },
        priority: { id: "medium", name: "Medium", color: "#f7931e", order: 2, isDefault: true, urgency: 2 },
        assigneeId: "agent-2",
        customerId: "customer-2",
        createdBy: "customer-2",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        resolvedAt: undefined,
        tags: ["feature-request", "ui"],
        customFields: {},
        isResolved: false,
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        firstReplyAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        lastReplyAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        threadId: "thread-2",
      },
      {
        id: "ticket-3",
        subject: "Billing inquiry",
        description: "Customer has questions about their recent invoice and payment method.",
        status: { id: "pending", name: "Pending", color: "#f7931e", order: 3, isDefault: false, isResolved: false },
        priority: { id: "low", name: "Low", color: "#6c757d", order: 1, isDefault: false, urgency: 1 },
        assigneeId: "agent-3",
        customerId: "customer-3",
        createdBy: "customer-3",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        resolvedAt: undefined,
        tags: ["billing", "payment"],
        customFields: {},
        isResolved: false,
        slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
        firstReplyAt: new Date(Date.now() - 70 * 60 * 60 * 1000),
        lastReplyAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        threadId: "thread-3",
      },
    ];

    useTicketStore.getState().setTickets(mockTickets);
  }, [setTicketStatuses, setTicketPriorities]);

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
