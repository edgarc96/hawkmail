"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { TicketList } from "@/components/tickets/TicketList";
import { useTicketStore, useTickets } from "@/lib/stores/ticketStore";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type TicketsSectionProps = {
  showHeader?: boolean;
  onTicketSelect?: (ticketId: string) => void;
};

export function TicketsSection({ showHeader = true, onTicketSelect }: TicketsSectionProps) {
  const router = useRouter();
  const refreshTickets = useTicketStore((state) => state.refreshTickets);
  const initializeDefaults = useTicketStore((state) => state.initializeDefaults);
  const setSelectedTicket = useTicketStore((state) => state.setSelectedTicket);
  const selectedTicketId = useTicketStore((state) => state.selectedTicketId);
  const tickets = useTickets();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    customerEmail: "",
    body: "",
    status: "open",
    priority: "medium",
  });

  useEffect(() => {
    initializeDefaults();
    setSelectedTicket(null);
    refreshTickets();
  }, [initializeDefaults, refreshTickets, setSelectedTicket]);

  const totalTickets = tickets?.length || 0;
  const openTickets = tickets?.filter((ticket) => !ticket.status?.isResolved).length || 0;
  const pendingTickets = tickets?.filter((ticket) => ticket.status?.id === "pending").length || 0;
  const resolvedTickets = tickets?.filter((ticket) => ticket.isResolved || ticket.status?.isResolved).length || 0;

  const resetForm = () => {
    setForm({
      subject: "",
      customerEmail: "",
      body: "",
      status: "open",
      priority: "medium",
    });
  };

  const handleTicketSelectInternal = (ticketId: string) => {
    setSelectedTicket(ticketId);
    if (onTicketSelect) {
      onTicketSelect(ticketId);
      return;
    }
    router.push(`/tickets/${ticketId}`);
  };

  const handleCreateTicket = () => {
    setIsCreateOpen(true);
  };

  const handleDialogToggle = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.subject.trim() || !form.customerEmail.trim()) {
      toast.error("Subject and customer email are required");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create ticket");
        return;
      }

      toast.success("Ticket created successfully");
      await refreshTickets();

      if (data.ticket?.id) {
        const ticketId = data.ticket.id.toString();
        setSelectedTicket(ticketId);
        router.push(`/tickets/${ticketId}`);
      }

      handleDialogToggle(false);
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Unexpected error creating ticket");
    } finally {
      setIsCreating(false);
    }
  };

  const headerSpacing = showHeader ? 'mb-6' : 'mb-4';

  return (
    <>
      <div className={`flex items-center justify-between ${headerSpacing}`}>
        <div>
          {showHeader && (
            <>
              <h1 className="text-3xl font-bold text-white">Tickets</h1>
              <p className="text-gray-400 mt-1">Manage and track customer support tickets</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-transparent text-white border-white/20 hover:bg-white/10">
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
          <Button onClick={handleCreateTicket} className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus size={16} className="mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-[#12111a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Tickets</span>
                <span className="font-semibold text-white">{totalTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Open</span>
                <span className="font-semibold text-violet-400">{openTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pending</span>
                <span className="font-semibold text-yellow-500">{pendingTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Resolved</span>
                <span className="font-semibold text-green-500">{resolvedTickets}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <TicketList onTicketSelect={handleTicketSelectInternal} selectedTicketId={selectedTicketId ?? undefined} />
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={handleDialogToggle}>
        <DialogContent className="bg-[#12111a] border-white/10 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-white">Create new ticket</DialogTitle>
            <DialogDescription className="text-gray-400">
              Capture the customer request and we will add it to your queue immediately.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleTicketSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="subject">
                Subject
              </label>
              <Input
                id="subject"
                placeholder="Customer issue subject"
                value={form.subject}
                onChange={(event) => handleInputChange("subject", event.target.value)}
                disabled={isCreating}
                className="bg-[#18181b] border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="customerEmail">
                Customer email
              </label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={form.customerEmail}
                onChange={(event) => handleInputChange("customerEmail", event.target.value)}
                disabled={isCreating}
                className="bg-[#18181b] border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  disabled={isCreating}
                >
                  <SelectTrigger className="bg-[#18181b] border-white/10 text-white focus:ring-violet-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-white/10 text-white">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Priority</label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => handleInputChange("priority", value)}
                  disabled={isCreating}
                >
                  <SelectTrigger className="bg-[#18181b] border-white/10 text-white focus:ring-violet-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-white/10 text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="body">
                Message body
              </label>
              <Textarea
                id="body"
                placeholder="Describe the customer request"
                value={form.body}
                onChange={(event) => handleInputChange("body", event.target.value)}
                className="min-h-[160px] bg-[#18181b] border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                disabled={isCreating}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogToggle(false)}
                disabled={isCreating}
                className="border-white/10 bg-transparent text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-violet-600 hover:bg-violet-700 text-white">
                {isCreating ? "Creating..." : "Create ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
