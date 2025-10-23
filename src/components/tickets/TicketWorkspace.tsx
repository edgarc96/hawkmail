"use client";

import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { MessageThread } from './MessageThread';
import { UserProfilePanel } from './UserProfilePanel';
import { InteractionTimeline } from './InteractionTimeline';
import { TicketReplyEditor } from './TicketReplyEditor';
import { TicketHeader } from './TicketHeader';
import { Ticket, Message, Customer } from '@/types/ticket';

interface TicketWorkspaceProps {
  ticket: Ticket;
  messages: Message[];
  customer: Customer;
  onReply: (content: string, attachments?: File[]) => Promise<void>;
  onStatusChange: (statusId: string) => void;
  onPriorityChange: (priorityId: string) => void;
  onAssigneeChange: (assigneeId: string) => void;
}

/**
 * Zendesk-style ticket workspace with 3 panels:
 * 1. Left: Message thread and reply editor
 * 2. Middle (collapsible): Customer profile and context
 * 3. Right: Interaction history and timeline
 */
export function TicketWorkspace({
  ticket,
  messages,
  customer,
  onReply,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
}: TicketWorkspaceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const [showTimelinePanel, setShowTimelinePanel] = useState(true);

  const handleReply = async (content: string, attachments?: File[]) => {
    setIsSubmitting(true);
    try {
      await onReply(content, attachments);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Global Ticket Header */}
      <TicketHeader
        ticket={ticket}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
        onAssigneeChange={onAssigneeChange}
        onToggleCustomerPanel={() => setShowCustomerPanel(!showCustomerPanel)}
        onToggleTimelinePanel={() => setShowTimelinePanel(!showTimelinePanel)}
      />

      {/* Main Content with 3 Panels */}
      <PanelGroup direction="horizontal" className="flex-1">
        
        {/* LEFT PANEL: Message Thread + Reply Editor */}
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col bg-white border-r">
            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto">
              <MessageThread 
                messages={messages}
                ticketId={ticket.id}
              />
            </div>

            {/* Reply Editor */}
            <div className="border-t bg-white">
              <TicketReplyEditor
                ticketId={ticket.id}
                onSubmit={handleReply}
                isSubmitting={isSubmitting}
                recipientEmail={customer.email}
              />
            </div>
          </div>
        </Panel>

        {showCustomerPanel && (
          <>
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300" />
            
            {/* MIDDLE PANEL: Customer Profile */}
            <Panel defaultSize={25} minSize={20}>
              <div className="h-full overflow-y-auto bg-white border-r">
                <UserProfilePanel customer={customer} />
              </div>
            </Panel>
          </>
        )}

        {showTimelinePanel && (
          <>
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300" />
            
            {/* RIGHT PANEL: Interaction Timeline */}
            <Panel defaultSize={25} minSize={20}>
              <div className="h-full overflow-y-auto bg-white">
                <InteractionTimeline 
                  customerId={customer.id}
                  currentTicketId={ticket.id}
                />
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
