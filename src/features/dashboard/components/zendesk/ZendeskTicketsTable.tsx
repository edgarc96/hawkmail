import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical } from "lucide-react";
import { TicketRow } from "./types";

interface TicketsTableProps {
  tickets: TicketRow[];
  onSelect?: (ticketId: string) => void;
  emptyMessage?: string;
}

import {
  getPriorityColor,
  getStatusColor,
  getCategoryColor,
  getSentimentColor,
} from "@/lib/utils/email-helpers";

export function ZendeskTicketsTable({
  tickets,
  onSelect,
  emptyMessage = "No hay tickets que mostrar.",
}: TicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="border border-white/10 rounded-lg bg-[#18181b] p-8 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-lg bg-[#18181b] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-gray-400">ID</TableHead>
            <TableHead className="text-gray-400">Asunto</TableHead>
            <TableHead className="text-gray-400">Cliente</TableHead>
            <TableHead className="text-gray-400">Estado</TableHead>
            <TableHead className="text-gray-400">Prioridad</TableHead>
            <TableHead className="text-gray-400">Asignado a</TableHead>
            <TableHead className="text-gray-400">Primera resp.</TableHead>
            <TableHead className="text-gray-400">Actualizado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              onClick={() => onSelect?.(ticket.id)}
              className="cursor-pointer hover:bg-white/5 border-white/10"
            >
              <TableCell>
                <span className="text-violet-400">{ticket.id}</span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-white font-medium">{ticket.subject}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {ticket.category && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] px-1.5 py-0 h-5 border-0 font-medium ${getCategoryColor(ticket.category)}`}
                      >
                        {ticket.category}
                      </Badge>
                    )}
                    {ticket.sentiment && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] px-1.5 py-0 h-5 border-0 font-medium ${getSentimentColor(ticket.sentiment)}`}
                      >
                        {ticket.sentiment}
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-white">{ticket.customerName}</p>
                  <p className="text-sm text-gray-500">{ticket.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={getStatusColor(ticket.status)}
                >
                  {ticket.statusLabel}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={getPriorityColor(ticket.priority)}
                >
                  {ticket.priorityLabel}
                </Badge>
              </TableCell>
              <TableCell>
                {ticket.assigneeName ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 bg-violet-600 text-white flex items-center justify-center text-xs">
                      {ticket.assigneeInitials}
                    </Avatar>
                    <span className="text-sm text-white">{ticket.assigneeName}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Sin asignar</span>
                )}
              </TableCell>
              <TableCell>
                {ticket.firstResponse ? (
                  <span className="text-sm text-green-400">{ticket.firstResponse}</span>
                ) : (
                  <span className="text-gray-500 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {ticket.updatedAtLabel || ticket.createdAtLabel}
                </span>
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
