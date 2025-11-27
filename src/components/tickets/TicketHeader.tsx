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
  function normalizeSubject(subject: string): { clean: string; prefix: 're' | 'fwd' | null } {
    if (!subject) return { clean: '', prefix: null };
    let s = subject.trim();
    let prefix: 're' | 'fwd' | null = null;
    const rePattern = /^(re\s*:)+/i;
    const fwdPattern = /^((fw|fwd)\s*:)+/i;
    if (rePattern.test(s)) {
      prefix = 're';
      s = s.replace(rePattern, '').trim();
    } else if (fwdPattern.test(s)) {
      prefix = 'fwd';
      s = s.replace(fwdPattern, '').trim();
    }
    return { clean: s, prefix };
  }

  return (
    <div className="bg-[#12111a] border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tickets')}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          
          <div className="h-8 w-px bg-white/10" />
          
          <div>
            <div className="flex items-center gap-2">
              {(() => {
                const { clean, prefix } = normalizeSubject(ticket.subject || '');
                return (
                  <>
                    {prefix === 're' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Re</span>
                    )}
                    {prefix === 'fwd' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Fwd</span>
                    )}
                    <h1 className="text-lg font-semibold text-white">{clean}</h1>
                  </>
                );
              })()}
            </div>
            <div className="text-sm text-gray-400 mt-0.5">A través de correo electrónico</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">#{ticket.id.slice(-8)}</span>
              <Badge
                variant="outline"
                style={{
                  borderColor: ticket.status.color,
                  color: ticket.status.color,
                  backgroundColor: `${ticket.status.color}10`,
                }}
              >
                {ticket.status.name}
              </Badge>
              <Badge
                variant="outline"
                style={{
                  borderColor: ticket.priority.color,
                  color: ticket.priority.color,
                  backgroundColor: `${ticket.priority.color}10`,
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
            <SelectTrigger className="w-[140px] bg-[#18181b] border-white/10 text-white focus:ring-violet-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#18181b] border-white/10 text-white">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Selector */}
          <Select value={ticket.priority.id} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[120px] bg-[#18181b] border-white/10 text-white focus:ring-violet-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#18181b] border-white/10 text-white">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-8 w-px bg-white/10" />

          {/* Panel Toggles */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCustomerPanel}
            title="Toggle customer panel"
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <PanelLeftClose size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTimelinePanel}
            title="Toggle timeline panel"
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <PanelRightClose size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
