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
    <div className="h-full flex flex-col bg-white">
      {/* Header superior con título y botones - ESTILO ZENDESK/GMAIL */}
      <div className="shrink-0 bg-white border-b">
        {/* Título y botones de acción */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:zd-bg-neutral-100">
              <Menu className="w-5 h-5 zd-text-neutral-600" />
            </Button>
            <h1 className="text-xl font-normal zd-text-neutral-900 truncate">
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
            <Button variant="ghost" size="icon" className="h-9 w-9 ml-2 hover:zd-bg-neutral-100">
              <Filter className="w-5 h-5 zd-text-neutral-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:zd-bg-neutral-100">
              <Clock className="w-5 h-5 zd-text-neutral-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:zd-bg-neutral-100">
              <MoreVertical className="w-5 h-5 zd-text-neutral-600" />
            </Button>
          </div>
        </div>

        {/* Snippet/Preview line - ESTILO GMAIL */}
        <div className="px-4 pb-3 border-b">
          <p className="text-sm zd-text-neutral-600 leading-relaxed">
            {getTicketSnippet()}
          </p>
        </div>
      </div>

      {/* Contenido scrolleable - SCROLL INDEPENDIENTE */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6">
          {/* Card del mensaje principal - ESTILO ZENDESK */}
          <div className="bg-white rounded-lg border zd-border-neutral-200 overflow-hidden mb-4">
            {/* Header del mensaje con remitente */}
            <div className="px-6 py-4 zd-bg-neutral-100 border-b zd-border-neutral-200 flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="zd-bg-primary-light text-white text-sm font-semibold">
                    {ticket.customerId.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base zd-text-neutral-900">
                      Customer {ticket.customerId.slice(-6)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs zd-text-neutral-500">
                      <span>•</span>
                      <span>{formatRelativeTime(typeof ticket.createdAt === 'string' ? ticket.createdAt : ticket.createdAt.toISOString())}</span>
                    </span>
                  </div>
                  
                  <div className="text-sm zd-text-neutral-600">
                    <span className="font-medium">Ticket ID:</span> #{ticket.id.slice(-8)}
                  </div>

                  {/* Tags */}
                  {ticket.tags && ticket.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="w-3 h-3 zd-text-neutral-500" />
                      {ticket.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
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
                  className="h-8 w-8 hover:zd-bg-neutral-200"
                  title="Responder"
                >
                  <Reply className="w-4 h-4 zd-text-neutral-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 hover:zd-bg-neutral-200"
                  title="Reenviar"
                >
                  <Forward className="w-4 h-4 zd-text-neutral-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="h-8 w-8 hover:zd-bg-neutral-200"
                  title="Archivar"
                >
                  {isArchiving ? (
                    <Loader2 className="w-4 h-4 animate-spin zd-text-neutral-600" />
                  ) : (
                    <Archive className="w-4 h-4 zd-text-neutral-600" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:zd-bg-neutral-200">
                      <MoreVertical className="w-4 h-4 zd-text-neutral-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="zd-text-danger">
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
                <div className="text-sm zd-text-neutral-800 leading-relaxed email-content">
                  <pre className="whitespace-pre-wrap font-sans">
                    {ticket.description}
                  </pre>
                </div>
              ) : (
                <div className="text-sm zd-text-neutral-500 italic">
                  Sin descripción
                </div>
              )}
            </div>
          </div>

          {/* Mensajes adicionales (respuestas) */}
          {messages && messages.length > 0 && messages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg border zd-border-neutral-200 overflow-hidden mb-4">
              <div className="px-6 py-4 zd-bg-neutral-100 border-b zd-border-neutral-200 flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback 
                      className={message.sender.isAgent ? "zd-bg-primary text-white" : "zd-bg-secondary text-white"}
                    >
                      {message.sender.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-base zd-text-neutral-900">
                        {message.sender.name}
                      </span>
                      {message.sender.isAgent && (
                        <Badge variant="secondary" className="text-xs">
                          Agente
                        </Badge>
                      )}
                      {message.isInternal && (
                        <Badge variant="secondary" className="text-xs zd-bg-warning/10 zd-text-warning">
                          Nota interna
                        </Badge>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs zd-text-neutral-500">
                        <span>•</span>
                        <span>{formatRelativeTime(typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toISOString())}</span>
                      </span>
                    </div>
                    
                    <div className="text-sm zd-text-neutral-600">
                      <span className="font-medium">Para:</span> {message.recipient}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                {message.bodyContent ? (
                  <TicketHTMLRenderer html={message.bodyContent} />
                ) : (
                  <div className="text-sm zd-text-neutral-800 leading-relaxed email-content">
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
      <div className="shrink-0 border-t bg-white shadow-lg">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium hover:zd-bg-neutral-100 px-3 py-1.5 rounded">
                  {replyType === "public" ? "Respuesta pública" : "Nota interna"}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setReplyType("public")}>
                  <Reply className="w-4 h-4 mr-2" />
                  Respuesta pública
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReplyType("internal")}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Nota interna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-xs zd-text-neutral-600">
              Para: Customer {ticket.customerId.slice(-6)}
            </span>
          </div>

          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribir respuesta..."
            className="min-h-[100px] mb-3 resize-none"
            disabled={isSending}
          />

          <div className="flex justify-between items-center">
            <div className="text-xs zd-text-neutral-500">
              Ctrl+Enter para enviar
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setReplyText("")}
                className="hover:zd-bg-neutral-100"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendReply}
                disabled={isSending || !replyText.trim()}
                size="sm"
                className="zd-bg-primary-light hover:zd-bg-primary-hover text-white"
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
