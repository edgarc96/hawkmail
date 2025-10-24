"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { TicketList } from "@/components/tickets/TicketList";
import { useTicketStore, useTickets } from "@/lib/stores/ticketStore";
import { useRouter } from "next/navigation";

export default function TicketsPage() {
  const router = useRouter();
  const refreshTickets = useTicketStore((state) => state.refreshTickets);
  const initializeDefaults = useTicketStore((state) => state.initializeDefaults);
  const setSelectedTicket = useTicketStore((state) => state.setSelectedTicket);
  const selectedTicketId = useTicketStore((state) => state.selectedTicketId);
  const tickets = useTickets();

  useEffect(() => {
    initializeDefaults();
    setSelectedTicket(null);
    refreshTickets();
  }, [initializeDefaults, refreshTickets, setSelectedTicket]);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((ticket) => !ticket.status.isResolved).length;
  const pendingTickets = tickets.filter((ticket) => ticket.status.id === "pending").length;
  const resolvedTickets = tickets.filter((ticket) => ticket.isResolved || ticket.status.isResolved).length;

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicket(ticketId);
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
                <span className="font-semibold zd-text-neutral-800">{totalTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="zd-text-neutral-600">Open</span>
                <span className="font-semibold zd-text-primary">{openTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="zd-text-neutral-600">Pending</span>
                <span className="font-semibold zd-text-warning">{pendingTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="zd-text-neutral-600">Resolved</span>
                <span className="font-semibold zd-text-success">{resolvedTickets}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <TicketList onTicketSelect={handleTicketSelect} selectedTicketId={selectedTicketId ?? undefined} />
        </div>
      </div>
    </div>
  );
}
