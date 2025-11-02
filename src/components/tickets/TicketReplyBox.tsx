"use client";

import { useState } from "react";
import { Message, Ticket } from "@/types/ticket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Link,
  List,
  Image as ImageIcon,
  Code,
  Paperclip,
  ChevronDown,
  Loader2,
  Reply,
  Users,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface TicketReplyBoxProps {
  ticket: Ticket;
  onSent?: () => void;
}

export function TicketReplyBox({ ticket, onSent }: TicketReplyBoxProps) {
  const [replyText, setReplyText] = useState("");
  const [replyType, setReplyType] = useState<"public" | "internal">("public");
  const [isSending, setIsSending] = useState(false);

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
          subject: `Re: ${ticket.subject}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Respuesta enviada exitosamente");
        setReplyText("");
        onSent?.();
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
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Reply Type Selector */}
      <div className="border-b px-4 lg:px-6 py-3 lg:py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Avatar className="w-9 h-9 lg:w-10 lg:h-10 shrink-0 border-2 zd-border-neutral-200">
            <AvatarImage src="" />
            <AvatarFallback className="zd-bg-primary-light text-white">AG</AvatarFallback>
          </Avatar>
          
          <Select value={replyType} onValueChange={(value: "public" | "internal") => setReplyType(value)}>
            <SelectTrigger className="w-full lg:w-[220px] focus:ring-2 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Reply className="w-4 h-4" />
                  Respuesta pública
                </div>
              </SelectItem>
              <SelectItem value="internal">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Nota interna
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start gap-2 text-sm zd-text-neutral-600 w-full lg:w-auto">
          <span className="shrink-0 font-medium mt-0.5">Para:</span>
          <div className="flex-1 min-w-0">
            <span className="truncate font-medium zd-text-neutral-900">
              {ticket.customerId}
            </span>
          </div>
        </div>
      </div>

      {/* Text Editor Toolbar */}
      <div className="border-b px-3 lg:px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <Button variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0 hover:zd-bg-neutral-100">
          <Bold className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0 hover:zd-bg-neutral-100">
          <Italic className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0 hover:zd-bg-neutral-100">
          <Link className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0 hover:zd-bg-neutral-100">
          <List className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0 hidden sm:flex hover:zd-bg-neutral-100">
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0 hidden sm:flex hover:zd-bg-neutral-100">
          <Code className="w-4 h-4" />
        </Button>
        <div className="flex-1"></div>
        <Button variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0 hover:zd-bg-neutral-100">
          <Paperclip className="w-4 h-4" />
        </Button>
      </div>

      {/* Text Area */}
      <div className="p-4 lg:p-6">
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Escribir respuesta..."
          className="min-h-[200px] lg:min-h-[250px] border-0 focus-visible:ring-0 resize-none text-base"
          disabled={isSending}
        />
      </div>

      {/* Footer Actions */}
      <div className="border-t px-4 lg:px-6 py-3 lg:py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button 
          onClick={handleSendReply}
          disabled={isSending || !replyText.trim()}
          className="zd-bg-primary-light hover:zd-bg-primary-hover text-white h-10 flex-1 sm:flex-initial"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              {replyType === "public" ? "Enviar respuesta" : "Agregar nota interna"}
            </>
          )}
        </Button>
        <Button 
          variant="outline"
          onClick={() => setReplyText("")}
          disabled={isSending}
          className="h-10 hover:zd-bg-neutral-100"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
