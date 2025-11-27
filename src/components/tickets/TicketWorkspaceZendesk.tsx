"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MoreVertical,
  Reply,
  Forward,
  Archive,
  Trash2,
  Loader2,
  ChevronDown,
  Menu,
  Filter,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryColor, getSentimentColor } from "@/lib/utils/email-helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TicketHTMLRenderer } from "./TicketHTMLRenderer";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CustomerSummary,
  TicketStatistics,
  TicketTimelineEntry,
  TicketWorkspaceData,
} from "@/types/ticket-detail";
import { formatRelativeTime } from "@/lib/utils/date";

interface TicketWorkspaceZendeskProps extends TicketWorkspaceData {}

export function TicketWorkspaceZendesk({ ticket, customer, stats, timeline }: TicketWorkspaceZendeskProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyType, setReplyType] = useState<"reply" | "forward">("reply");

  // Extraer snippet del ticket (primeros 150 caracteres)
  const getTicketSnippet = () => {
    const text = ticket.ticket.description || "";
    return text.substring(0, 150) + (text.length > 150 ? "..." : "");
  };

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      const response = await fetch(`/api/tickets/${ticket.ticket.id}/archive`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Ticket archivado correctamente");
        router.push("/tickets");
      } else {
        toast.error(data.error || "Error al archivar el ticket");
      }
    } catch (error) {
      console.error("Error archiving ticket:", error);
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

      if (response.ok) {
        toast.success("Ticket eliminado");
        router.push("/tickets");
      } else {
        toast.error(data.error || "Error al eliminar el ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Error al eliminar el ticket");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("Por favor escribe un mensaje antes de enviar");
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch(`/api/tickets/${ticket.ticket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText,
          type: replyType,
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
      toast.error("Error al enviar la respuesta");
    } finally {
      setIsSending(false);
    }
  };

  const navigateBack = () => {
    router.push("/tickets");
  };

  return (
    <div className="h-full flex flex-col bg-[#12111a]">
      {/* Header superior con título y botones - ESTILO ZENDESK/GMAIL */}
      <div className="shrink-0 bg-[#12111a] border-b border-white/10">
        {/* Título y botones de acción */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:bg-white/10 text-gray-400 hover:text-white" onClick={navigateBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 overflow-hidden">
              <h1 className="text-xl font-normal text-white truncate">
                {ticket.ticket.subject}
              </h1>
              {ticket.ticket.category && (
                <Badge 
                  variant="outline" 
                  className={`shrink-0 text-[10px] px-2 h-5 border-0 ${getCategoryColor(ticket.ticket.category)}`}
                >
                  {ticket.ticket.category}
                </Badge>
              )}
              {ticket.ticket.sentiment && (
                <Badge 
                  variant="outline" 
                  className={`shrink-0 text-[10px] px-2 h-5 border-0 ${getSentimentColor(ticket.ticket.sentiment)}`}
                >
                  {ticket.ticket.sentiment}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/10 text-gray-400 hover:text-white">
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

        {/* Snippet/Preview line - ESTILO GMAIL */}
        <div className="px-4 pb-3 border-b border-white/10">
          <p className="text-sm text-gray-400 leading-relaxed">
            {getTicketSnippet()}
          </p>
        </div>
      </div>

      {/* Contenido scrolleable - SCROLL INDEPENDIENTE */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6">
          {/* Card del mensaje - ESTILO ZENDESK */}
          <div className="bg-[#12111a] rounded-lg border border-white/10 overflow-hidden">
            {/* Header del mensaje con remitente */}
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

                  {/* Botón "Mostrar más" */}
                  <Button variant="ghost" className="h-auto p-0 text-violet-400 text-sm mt-1 hover:underline hover:bg-transparent hover:text-violet-300">
                    Mostrar más
                  </Button>
                </div>
              </div>

              {/* Botones de acción del mensaje */}
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
                <div className="prose prose-invert max-w-none">
                  <TicketHTMLRenderer html={ticket.bodyHtml} />
                </div>
              ) : (
                <div className="text-sm text-gray-300 leading-relaxed">
                  <pre className="whitespace-pre-wrap font-sans">
                    {ticket.ticket.description}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Área de respuesta FIJA - SIEMPRE VISIBLE */}
      <div className="shrink-0 border-t border-white/10 bg-[#12111a]">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-white hover:bg-white/10 px-3 py-1.5 rounded transition-colors">
                  Respuesta pública
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181b] border-white/10 text-white">
                <DropdownMenuItem onClick={() => setReplyType("reply")} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">Respuesta pública</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">Nota interna</DropdownMenuItem>
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
    </div>
  );
}
