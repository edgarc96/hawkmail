"use client";

import React from 'react';
import { Ticket } from '@/types/ticket';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Clock, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TicketHeaderProps {
  ticket: Ticket;
  onStatusChange: (statusId: string) => void;
  onPriorityChange: (priorityId: string) => void;
  onAssigneeChange: (assigneeId: string) => void;
  onToggleCustomerPanel: () => void;
  onToggleTimelinePanel: () => void;
}

export function TicketHeader({
  ticket,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onToggleCustomerPanel,
  onToggleTimelinePanel,
}: TicketHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tickets')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          
          <div className="h-8 w-px bg-gray-300" />
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">#{ticket.id.slice(-8)}</span>
              <Badge
                variant="outline"
                style={{
                  borderColor: ticket.status.color,
                  color: ticket.status.color,
                }}
              >
                {ticket.status.name}
              </Badge>
              <Badge
                variant="outline"
                style={{
                  borderColor: ticket.priority.color,
                  color: ticket.priority.color,
                }}
              >
                {ticket.priority.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Status Selector */}
          <Select value={ticket.status.id} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Selector */}
          <Select value={ticket.priority.id} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-8 w-px bg-gray-300" />

          {/* Panel Toggles */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCustomerPanel}
            title="Toggle customer panel"
          >
            <PanelLeftClose size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTimelinePanel}
            title="Toggle timeline panel"
          >
            <PanelRightClose size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
