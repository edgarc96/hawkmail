"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { EmailMessageRenderer } from "@/components/emails/EmailMessageRenderer";
import {
  ArrowLeft,
  Mail,
  Clock,
  Paperclip,
  Send,
  NotebookPen,
  User,
  Building2,
  Globe,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTicketStore } from "@/lib/stores/ticketStore";
import { TicketList } from "@/components/tickets/TicketList";
import { formatDate, formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import {
  CustomerSummary,
  TicketStatistics,
  TicketTimelineEntry,
  TicketWorkspaceData,
} from "@/types/ticket-detail";

interface TicketWorkspaceProps extends TicketWorkspaceData {}

interface AttachmentPreview {
  id: string;
  src: string;
  alt: string;
}

export function TicketWorkspace({ ticket, customer, stats, timeline }: TicketWorkspaceProps) {
  const router = useRouter();
  const refreshTickets = useTicketStore((state) => state.refreshTickets);
  const initializeDefaults = useTicketStore((state) => state.initializeDefaults);
  const setSelectedTicket = useTicketStore((state) => state.setSelectedTicket);
  const selectedTicketId = useTicketStore((state) => state.selectedTicketId);
  const [activeReplyTab, setActiveReplyTab] = useState<"public" | "internal">("public");

  useEffect(() => {
    initializeDefaults();
    refreshTickets();
  }, [initializeDefaults, refreshTickets]);

  useEffect(() => {
    setSelectedTicket(ticket.ticket.id);
  }, [setSelectedTicket, ticket.ticket.id]);

  const sanitizedBody = useMemo(() => {
    const html = ticket.bodyHtml || "";
    console.log('[TicketWorkspace] bodyHtml length:', html.length);
    console.log('[TicketWorkspace] bodyHtml preview:', html.substring(0, 200));
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ["style", "target", "rel"],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|data:image\/)/i,
    });
  }, [ticket.bodyHtml]);

  const attachments = useMemo<AttachmentPreview[]>(() => {
    if (typeof window === "undefined" || !sanitizedBody) {
      return [];
    }
    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(sanitizedBody, "text/html");
      const images = Array.from(doc.querySelectorAll("img"));
      return images
        .map((img, index) => {
          const src = img.getAttribute("src");
          if (!src) {
            return null;
          }
          const alt = img.getAttribute("alt") ?? `Attachment ${index + 1}`;
          return {
            id: `${ticket.ticket.id}-attachment-${index}`,
            src,
            alt,
          };
        })
        .filter(Boolean) as AttachmentPreview[];
    } catch (error) {
      console.error("Error parsing attachments", error);
      return [];
    }
  }, [sanitizedBody, ticket.ticket.id]);

  const receivedRelative = formatRelativeTime(ticket.receivedAt);
  const slaDeadlineRelative = formatRelativeTime(ticket.ticket.slaDeadline);
  const createdAtFormatted = formatDate(ticket.ticket.createdAt, {
    includeTime: true,
  });

  const handleTicketSelect = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="px-0 text-sm zd-text-neutral-600 hover:zd-text-neutral-900"
          onClick={() => router.push("/tickets")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to tickets
        </Button>
        <Badge variant="secondary" className="text-xs uppercase tracking-wide">
          #{ticket.ticket.id}
        </Badge>
        <Badge
          variant="outline"
          style={{
            borderColor: ticket.ticket.status.color,
            color: ticket.ticket.status.color,
          }}
        >
          {ticket.ticket.status.name}
        </Badge>
        <Badge
          variant="outline"
          style={{
            borderColor: ticket.ticket.priority.color,
            color: ticket.ticket.priority.color,
          }}
        >
          {ticket.ticket.priority.name}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
        <aside className="space-y-4 lg:max-xl:order-first xl:sticky xl:top-20 h-fit">
          <Card className="zd-bg-neutral-50 border-zd-border-neutral-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold zd-text-neutral-700">
                Ticket Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[70vh] overflow-y-auto">
                <TicketList onTicketSelect={handleTicketSelect} />
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-3">
          <Card className="border-zd-border-neutral-200 shadow-sm">
            <CardHeader className="pb-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                      <Mail className="h-3 w-3" />
                      VIA EMAIL
                    </span>
                    <span className="text-xs text-gray-500">{createdAtFormatted}</span>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                    {ticket.ticket.subject}
                  </h1>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Received {receivedRelative}
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-sm pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium">From:</span>
                  <span className="text-gray-600">{customer.name} &lt;{customer.email}&gt;</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium">To:</span>
                  <span className="text-gray-600">{ticket.recipientEmail}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border-t border-gray-100 pt-6 max-h-[60vh] overflow-y-auto">
                {sanitizedBody ? (
                  <div className="prose prose-sm max-w-none pr-4">
                    <EmailMessageRenderer htmlContent={ticket.bodyHtml || ""} />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No email content available</p>
                  </div>
                )}
              </div>

              {attachments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold zd-text-neutral-800">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({attachments.length})
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="overflow-hidden rounded-md border border-zd-border-neutral-200 bg-zd-neutral-50"
                      >
                        <img
                          src={attachment.src}
                          alt={attachment.alt}
                          className="h-32 w-full object-cover"
                        />
                        <div className="px-3 py-2 text-xs zd-text-neutral-600 truncate">
                          {attachment.alt}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide zd-text-neutral-500 border-t border-dashed border-zd-border-neutral-200 pt-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  SLA {slaDeadlineRelative}
                </div>
                <div className="rounded-full bg-zd-border-neutral-200 px-2 py-0.5">
                  Thread ID: {ticket.ticket.threadId}
                </div>
              </div>
            </CardContent>
          </Card>

          <ReplyComposer
            activeTab={activeReplyTab}
            onTabChange={setActiveReplyTab}
            customer={customer}
          />
        </section>

        <aside className="space-y-4 xl:sticky xl:top-20 h-fit">
          <CustomerProfileCard customer={customer} />
          <TicketStatisticsCard stats={stats} />
          <TimelineCard events={timeline} />
        </aside>
      </div>
    </div>
  );
}

interface ReplyComposerProps {
  activeTab: "public" | "internal";
  onTabChange: (value: "public" | "internal") => void;
  customer: CustomerSummary;
}

function ReplyComposer({ activeTab, onTabChange, customer }: ReplyComposerProps) {
  return (
    <Card className="border-zd-border-neutral-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold zd-text-neutral-800">
          Reply to {customer.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as "public" | "internal")}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Public Reply
            </TabsTrigger>
            <TabsTrigger value="internal" className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Internal Note
            </TabsTrigger>
          </TabsList>
          <TabsContent value="public">
            <ComposerTextarea placeholder="Write a reply to the customer..." />
          </TabsContent>
          <TabsContent value="internal">
            <ComposerTextarea placeholder="Add an internal note for your team..." />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ComposerTextarea({ placeholder }: { placeholder: string }) {
  return (
    <div className="space-y-3">
      <Textarea
        rows={6}
        placeholder={placeholder}
        className="resize-none zd-bg-neutral-50 border-zd-border-neutral-200 focus-visible:ring-zd-primary/30"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm zd-text-neutral-500">
          <Paperclip className="h-4 w-4" />
          Attach files
        </div>
        <Button className="zd-bg-primary hover:zd-bg-primary-hover text-white">
          Send Reply
        </Button>
      </div>
    </div>
  );
}

function CustomerProfileCard({ customer }: { customer: CustomerSummary }) {
  return (
    <Card className="border-zd-border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold zd-text-neutral-800">
          Customer Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-zd-primary/10 text-sm font-semibold text-zd-primary">
              {customer.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="text-sm font-semibold zd-text-neutral-900">
              {customer.name}
            </div>
            <div className="text-sm zd-text-neutral-600 break-all">
              {customer.email}
            </div>
          </div>
        </div>
        <div className="space-y-3 text-sm zd-text-neutral-600">
          {customer.organization && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 zd-text-neutral-400" />
              {customer.organization}
            </div>
          )}
          {customer.localTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 zd-text-neutral-400" />
              Local time: {customer.localTime}
            </div>
          )}
          {customer.language && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 zd-text-neutral-400" />
              Language: {customer.language}
            </div>
          )}
        </div>
        {customer.notes && (
          <div className="rounded-md bg-zd-border-neutral-100 p-3 text-sm zd-text-neutral-600">
            {customer.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TicketStatisticsCard({ stats }: { stats: TicketStatistics }) {
  return (
    <Card className="border-zd-border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold zd-text-neutral-800">
          Ticket Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm zd-text-neutral-700">
        <StatisticRow label="Total Tickets" value={stats.totalTickets} />
        <StatisticRow label="Open Tickets" value={stats.openTickets} />
        <StatisticRow label="Resolved Tickets" value={stats.resolvedTickets} />
        <StatisticRow
          label="Satisfaction Score"
          value={
            typeof stats.satisfactionScore === "number"
              ? `${stats.satisfactionScore}%`
              : "Not available"
          }
          icon={<Star className="h-4 w-4 text-amber-500" />}
        />
      </CardContent>
    </Card>
  );
}

function StatisticRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-dashed border-zd-border-neutral-200 px-3 py-2">
      <span className="flex items-center gap-2 text-xs uppercase tracking-wide zd-text-neutral-500">
        {icon}
        {label}
      </span>
      <span className="font-semibold zd-text-neutral-800">{value}</span>
    </div>
  );
}

function TimelineCard({ events }: { events: TicketTimelineEntry[] }) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <Card className="border-zd-border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold zd-text-neutral-800">
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative space-y-6">
          {sortedEvents.map((event, index) => (
            <TimelineRow
              key={event.id}
              event={event}
              isLast={index === sortedEvents.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineRow({
  event,
  isLast,
}: {
  event: TicketTimelineEntry;
  isLast: boolean;
}) {

  return (
    <div className="relative pl-6">
      <span
        className={cn(
          "absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white",
          event.statusId
            ? "bg-zd-primary shadow-[0_0_0_4px_rgba(34,197,94,0.15)]"
            : "bg-zd-border-neutral-300"
        )}
      />
      {!isLast && (
        <span className="absolute left-[5px] top-4 bottom-[-24px] w-px bg-zd-border-neutral-200" />
      )}
      <div className="space-y-1">
        <div className="text-sm font-semibold zd-text-neutral-800">
          {event.title}
        </div>
        {event.description && (
          <div className="text-sm zd-text-neutral-600">{event.description}</div>
        )}
        <div className="text-xs uppercase tracking-wide zd-text-neutral-500">
          {formatDate(event.timestamp, { includeTime: true })}
        </div>
      </div>
    </div>
  );
}
