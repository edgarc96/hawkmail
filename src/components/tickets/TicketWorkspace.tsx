"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { EmailMessageRenderer } from "@/components/emails/EmailMessageRenderer";
import { TicketHTMLRenderer } from "@/components/tickets/TicketHTMLRenderer";
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
  Reply,
  Forward,
  Archive,
  Trash2,
  Loader2,
  ChevronDown,
  Menu,
  Filter,
  Tag,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTicketStore } from "@/lib/stores/ticketStore";
import { TicketList } from "@/components/tickets/TicketList";
import { formatDate, formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
  const [activeReplyTab, setActiveReplyTab] = useState<"public" | "internal">("public");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sanitizedBody = useMemo(() => {
    const html = ticket.bodyHtml || "";
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ["style", "target", "rel"],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|data:image\/)/i,
    });
  }, [ticket.bodyHtml]);

  const attachments: AttachmentPreview[] = [];

  const getTicketSnippet = () => {
    const text = ticket.ticket.description || "";
    return text.substring(0, 150) + (text.length > 150 ? "..." : "");
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("Por favor escribe un mensaje antes de enviar");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.ticket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyText,
          isInternal: activeReplyTab === "internal",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("✅ Respuesta enviada exitosamente");
        setReplyText("");
      } else {
        toast.error(`Error: ${data.error || "No se pudo enviar la respuesta"}`);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Error al enviar la respuesta. Verifica tu conexión.");
    } finally {
      setIsSending(false);
    }
  };

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      const response = await fetch(`/api/tickets/${ticket.ticket.id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Ticket archivado correctamente");
        router.push("/tickets");
      } else {
        toast.error(data.error || "Error al archivar el ticket");
      }
    } catch (error) {
      toast.error("Error al archivar el ticket");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/tickets/${ticket.ticket.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Ticket eliminado");
        router.push("/tickets");
      } else {
        toast.error(data.error || "Error al eliminar el ticket");
      }
    } catch (error) {
      toast.error("Error al eliminar el ticket");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#12111a] overflow-hidden">
      {/* Header superior - ESTILO ZENDESK/GMAIL */}
      <div className="shrink-0 bg-[#12111a] border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 hover:bg-white/10 text-gray-400 hover:text-white"
              onClick={() => router.push("/tickets")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-normal text-white truncate">
              {ticket.ticket.subject}
            </h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: ticket.ticket.status.color,
                color: ticket.ticket.status.color,
                backgroundColor: `${ticket.ticket.status.color}10`,
              }}
            >
              {ticket.ticket.status.name}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs ml-2"
              style={{
                borderColor: ticket.ticket.priority.color,
                color: ticket.ticket.priority.color,
                backgroundColor: `${ticket.ticket.priority.color}10`,
              }}
            >
              {ticket.ticket.priority.name}
            </Badge>
            <Button variant="ghost" size="icon" className="h-9 w-9 ml-2 hover:bg-white/10 text-gray-400 hover:text-white">
              <Filter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/10 text-gray-400 hover:text-white">
              <Clock className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/10 text-gray-400 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Snippet/Preview line */}
        <div className="px-4 pb-3 border-b border-white/10">
          <p className="text-sm text-gray-400 leading-relaxed">
            {getTicketSnippet()}
          </p>
        </div>
      </div>

      {/* Layout de 3 columnas con scroll independiente */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar izquierda - LISTA DE TICKETS */}
        <aside className="hidden lg:block w-80 xl:w-96 shrink-0 border-r border-white/10 bg-[#12111a] overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-2">
              <h2 className="text-sm font-semibold text-gray-400 px-2 py-2">Tickets</h2>
            </div>
          </div>
        </aside>

        {/* Área central - CONTENIDO DEL TICKET */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#12111a]">
          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto bg-[#12111a]">
            <div className="max-w-5xl mx-auto">
              {/* Card del mensaje principal */}
              <div className="bg-[#12111a] border-b border-white/10 overflow-hidden">
                <div className="px-6 py-4 bg-[#18181b] border-b border-white/10 flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-violet-600 text-white text-sm font-semibold">
                        {customer.avatarInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base text-white">
                          {customer.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <span>•</span>
                          <span>{formatRelativeTime(ticket.receivedAt)}</span>
                        </span>
                      </div>

                      <div className="text-sm text-gray-400">
                        <span className="font-medium text-gray-300">Para:</span> {ticket.recipientEmail}
                      </div>

                      <Button variant="ghost" className="h-auto p-0 text-violet-400 text-sm mt-1 hover:underline hover:bg-transparent hover:text-violet-300">
                        Mostrar más
                      </Button>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white"
                      title="Responder"
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white"
                      title="Reenviar"
                    >
                      <Forward className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleArchive}
                      disabled={isArchiving}
                      className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white"
                      title="Archivar"
                    >
                      {isArchiving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#18181b] border-white/10 text-white">
                        <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400">
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Contenido del mensaje */}
                <div className="px-6 py-6">
                  {ticket.bodyHtml ? (
                    <TicketHTMLRenderer html={ticket.bodyHtml} />
                  ) : (
                    <div className="text-sm text-gray-300 leading-relaxed email-content">
                      <pre className="whitespace-pre-wrap font-sans">
                        {ticket.ticket.description}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <Paperclip className="h-4 w-4" />
                      Adjuntos ({attachments.length})
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="overflow-hidden rounded-md border border-white/10 bg-[#18181b]"
                        >
                          <img
                            src={attachment.src}
                            alt={attachment.alt}
                            className="h-32 w-full object-cover"
                          />
                          <div className="px-3 py-2 text-xs text-gray-400 truncate">
                            {attachment.alt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Área de respuesta FIJA */}
          <div className="shrink-0 border-t border-white/10 bg-[#12111a]">
            <div className="px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-sm font-medium text-white hover:bg-white/10 px-3 py-1.5 rounded transition-colors">
                      {activeReplyTab === "public" ? "Respuesta pública" : "Nota interna"}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#18181b] border-white/10 text-white">
                    <DropdownMenuItem onClick={() => setActiveReplyTab("public")} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                      <Reply className="w-4 h-4 mr-2" />
                      Respuesta pública
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveReplyTab("internal")} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Nota interna
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-xs text-gray-400">
                  Para: {customer.email}
                </span>
              </div>

              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribir respuesta..."
                className="min-h-[100px] mb-3 resize-none bg-[#18181b] border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                disabled={isSending}
              />

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Ctrl+Enter para enviar
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReplyText("")}
                    className="bg-transparent border-white/10 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSendReply}
                    disabled={isSending || !replyText.trim()}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar derecha - INFO DEL CLIENTE */}
        <aside className="hidden xl:block w-80 shrink-0 border-l border-white/10 bg-[#12111a] overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-4">
              <CustomerProfileCard customer={customer} />
              <TicketStatisticsCard stats={stats} />
              <TimelineCard events={timeline} />
            </div>
          </div>
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
    <Card className="border-white/10 bg-[#18181b]">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-white">
          Reply to {customer.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as "public" | "internal")}
        >
          <TabsList className="mb-4 bg-[#12111a] border border-white/10">
            <TabsTrigger value="public" className="flex items-center gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Send className="h-4 w-4" />
              Public Reply
            </TabsTrigger>
            <TabsTrigger value="internal" className="flex items-center gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
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
        className="resize-none bg-[#12111a] border-white/10 focus-visible:ring-violet-500/30 text-white placeholder:text-gray-500"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Paperclip className="h-4 w-4" />
          Attach files
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white">
          Send Reply
        </Button>
      </div>
    </div>
  );
}

function CustomerProfileCard({ customer }: { customer: CustomerSummary }) {
  return (
    <Card className="border-white/10 bg-[#18181b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white">
          Customer Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-violet-600/20 text-sm font-semibold text-violet-400 border border-violet-500/20">
              {customer.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">
              {customer.name}
            </div>
            <div className="text-sm text-gray-400 break-all">
              {customer.email}
            </div>
          </div>
        </div>
        <div className="space-y-3 text-sm text-gray-400">
          {customer.organization && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              {customer.organization}
            </div>
          )}
          {customer.localTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Local time: {customer.localTime}
            </div>
          )}
          {customer.language && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              Language: {customer.language}
            </div>
          )}
        </div>
        {customer.notes && (
          <div className="rounded-md bg-white/5 border border-white/10 p-3 text-sm text-gray-300">
            {customer.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TicketStatisticsCard({ stats }: { stats: TicketStatistics }) {
  return (
    <Card className="border-white/10 bg-[#18181b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white">
          Ticket Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-gray-300">
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
          icon={<Star className="h-4 w-4 text-yellow-500" />}
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
    <div className="flex items-center justify-between rounded-md border border-dashed border-white/20 px-3 py-2 hover:bg-white/5 transition-colors">
      <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function TimelineCard({ events }: { events: TicketTimelineEntry[] }) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <Card className="border-white/10 bg-[#18181b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white">
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
          "absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-[#18181b]",
          event.statusId
            ? "bg-violet-600 shadow-[0_0_0_4px_rgba(124,58,237,0.15)]"
            : "bg-gray-600"
        )}
      />
      {!isLast && (
        <span className="absolute left-[5px] top-4 bottom-[-24px] w-px bg-white/10" />
      )}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-white">
          {event.title}
        </div>
        {event.description && (
          <div className="text-sm text-gray-400">{event.description}</div>
        )}
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {formatDate(event.timestamp, { includeTime: true })}
        </div>
      </div>
    </div>
  );
}
