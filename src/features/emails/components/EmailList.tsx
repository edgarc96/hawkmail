"use client";

import { Email, TeamMember } from "../types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Reply, CheckCheck, Clock, Zap } from "lucide-react";
import { getPriorityColor, getStatusColor, getTimeRemaining } from "@/lib/utils/email-helpers";

interface EmailListProps {
  emails: Email[];
  teamMembers: TeamMember[];
  onViewEmail: (id: number) => void;
  onReplyEmail: (email: Email) => void;
  onMarkResolved: (id: number) => void;
  onAssignEmail: (emailId: number, memberId: number) => void;
  onAutoAssign?: (emailId: number) => void;
  isAutoAssigning?: boolean;
}

export function EmailList({
  emails,
  teamMembers,
  onViewEmail,
  onReplyEmail,
  onMarkResolved,
  onAssignEmail,
  onAutoAssign,
  isAutoAssigning = false,
}: EmailListProps) {

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <div
          key={email.id}
          className="rounded-lg border border-primary/20 bg-background p-4 transition-all duration-200 hover:border-primary/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">{email.subject}</h3>
              <p className="mt-1 text-sm text-muted-foreground">From: {email.senderEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPriorityColor(email.priority)}`}
              >
                {email.priority}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(email.status)}`}
              >
                {email.status}
              </span>
              {email.isResolved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                  <CheckCheck size={14} />
                  Resolved
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              {getTimeRemaining(email.slaDeadline)}
            </span>
            <span>
              Received: {new Date(email.receivedAt).toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Select 
              value={email.assignedTo?.toString() || "0"}
              onValueChange={(value) => onAssignEmail(email.id, parseInt(value))}
            >
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    👤 {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {onAutoAssign && !email.assignedTo && teamMembers.length > 0 && (
              <Button
                size="sm"
                onClick={() => onAutoAssign(email.id)}
                disabled={isAutoAssigning}
                variant="outline"
                className="gap-1"
              >
                <Zap size={14} />
                Auto
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={() => onViewEmail(email.id)}
              variant="outline"
              className="gap-2"
            >
              <Eye size={14} />
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => onReplyEmail(email)}
              className="gap-2"
            >
              <Reply size={14} />
              Reply
            </Button>
            {!email.isResolved && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkResolved(email.id)}
                className="gap-2"
              >
                <CheckCheck size={14} />
                Mark Resolved
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
