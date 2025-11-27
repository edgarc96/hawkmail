"use client";

import { useState } from "react";
import { Ticket, Message } from "@/types/ticket";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
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
  Tag,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TicketHTMLRenderer } from "./TicketHTMLRenderer";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";

interface TicketDetailProps {
  ticket: Ticket;
  messages?: Message[];
  onTicketUpdated?: () => void;
  onRefresh?: () => void;
}

export function TicketDetail({ ticket, messages = [], onTicketUpdated, onRefresh }: TicketDetailProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyType, setReplyType] = useState<"public" | "internal">("public");

  // Extraer snippet del ticket (primeros 150 caracteres)
  const getTicketSnippet = () => {
    const text = ticket.description || "";
    return text.substring(0, 150) + (text.length > 150 ? "..." : "");
  };

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      const response = await fetch(`/api/tickets/${ticket.id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Ticket archivado correctamente");
        onTicketUpdated?.();
        onRefresh?.();
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
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Ticket eliminado");
        onTicketUpdated?.();
        onRefresh?.();
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

    setIsSending(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyText,
          isInternal: replyType === "internal",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Respuesta enviada exitosamente");
        setReplyText("");
        onRefresh?.();
      } else {
        toast.error(`Error: ${data.error || "No se pudo enviar la respuesta"}`);
        console.error("Error details:", data);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Error al enviar la respuesta. Verifica tu conexión.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#12111a]">
      {/* Header superior con título y botones - ESTILO ZENDESK/GMAIL */}
      <div className="shrink-0 bg-[#12111a] border-b border-white/10">
        {/* Título y botones de acción */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:bg-white/10">
              <Menu className="w-5 h-5 text-gray-400" />
            </Button>
            <h1 className="text-xl font-normal text-white truncate">
              {ticket.subject}
            </h1>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant="outline"
              className="text-xs"
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
              className="text-xs ml-2"
              style={{
                borderColor: ticket.priority.color,
                color: ticket.priority.color,
                backgroundColor: `${ticket.priority.color}10`,
              }}
            >
              {ticket.priority.name}
            </Badge>
            <Button variant="ghost" size="icon" className="h-9 w-9 ml-2 hover:bg-white/10">
              <Filter className="w-5 h-5 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/10">
              <Clock className="w-5 h-5 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/10">
              <MoreVertical className="w-5 h-5 text-gray-400" />
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
          {/* Card del mensaje principal - ESTILO ZENDESK */}
          <div className="bg-[#12111a] rounded-lg border border-white/10 overflow-hidden mb-4">
            {/* Header del mensaje con remitente */}
            <div className="px-6 py-4 bg-[#18181b] border-b border-white/10 flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-violet-600 text-white text-sm font-semibold">
                    {ticket.customerId.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base text-white">
                      Customer {ticket.customerId.slice(-6)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <span>•</span>
                      <span>{formatRelativeTime(typeof ticket.createdAt === 'string' ? ticket.createdAt : ticket.createdAt.toISOString())}</span>
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <span className="font-medium">Ticket ID:</span> #{ticket.id.slice(-8)}
                  </div>

                  {/* Tags */}
                  {ticket.tags && ticket.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="w-3 h-3 text-gray-500" />
                      {ticket.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-gray-300 hover:bg-white/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción del mensaje */}
              <div className="flex items-center gap-1 ml-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10"
                  title="Responder"
                >
                  <Reply className="w-4 h-4 text-gray-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10"
                  title="Reenviar"
                >
                  <Forward className="w-4 h-4 text-gray-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="h-8 w-8 hover:bg-white/10"
                  title="Archivar"
                >
                  {isArchiving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <Archive className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
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
              {ticket.description ? (
                <div className="text-sm text-gray-300 leading-relaxed email-content">
                  <pre className="whitespace-pre-wrap font-sans">
                    {ticket.description}
                  </pre>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  Sin descripción
                </div>
              )}
            </div>
          </div>

          {/* Mensajes adicionales (respuestas) */}
          {messages && messages.length > 0 && messages.map((message) => (
            <div key={message.id} className="bg-[#12111a] rounded-lg border border-white/10 overflow-hidden mb-4">
              <div className="px-6 py-4 bg-[#18181b] border-b border-white/10 flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback 
                      className={message.sender.isAgent ? "bg-violet-600 text-white" : "bg-gray-600 text-white"}
                    >
                      {message.sender.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-base text-white">
                        {message.sender.name}
                      </span>
                      {message.sender.isAgent && (
                        <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300">
                          Agente
                        </Badge>
                      )}
                      {message.isInternal && (
                        <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-500">
                          Nota interna
                        </Badge>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <span>•</span>
                        <span>{formatRelativeTime(typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toISOString())}</span>
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      <span className="font-medium">Para:</span> {message.recipient}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                {message.bodyContent ? (
                  <div className="prose prose-invert max-w-none">
                    <TicketHTMLRenderer html={message.bodyContent} />
                  </div>
                ) : (
                  <div className="text-sm text-gray-300 leading-relaxed email-content">
                    <pre className="whitespace-pre-wrap font-sans">
                      {message.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de respuesta FIJA - SIEMPRE VISIBLE */}
      <div className="shrink-0 border-t border-white/10 bg-[#12111a]">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-white hover:bg-white/10 px-3 py-1.5 rounded transition-colors">
                  {replyType === "public" ? "Respuesta pública" : "Nota interna"}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181b] border-white/10 text-white">
                <DropdownMenuItem onClick={() => setReplyType("public")} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  <Reply className="w-4 h-4 mr-2" />
                  Respuesta pública
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReplyType("internal")} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Nota interna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-xs text-gray-400">
              Para: Customer {ticket.customerId.slice(-6)}
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
