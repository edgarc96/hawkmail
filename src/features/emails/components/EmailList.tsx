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
        <div key={email.id} className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4 hover:border-purple-500/30 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{email.subject}</h3>
              <p className="text-purple-300 text-sm mt-1">From: {email.senderEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(email.priority)}`}>
                {email.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(email.status)}`}>
                {email.status}
              </span>
              {email.isResolved && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-green-600 bg-green-50">
                  <CheckCheck size={14} className="inline mr-1" />
                  Resolved
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-purple-400">
              <Clock size={14} className="inline mr-1" />
              {getTimeRemaining(email.slaDeadline)}
            </span>
            <span className="text-purple-400">
              Received: {new Date(email.receivedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Select 
              value={email.assignedTo?.toString() || "0"}
              onValueChange={(value) => onAssignEmail(email.id, parseInt(value))}
            >
              <SelectTrigger className="w-[160px] h-8 bg-purple-900/20 border-purple-500/30 text-white text-xs">
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
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0"
              >
                <Zap size={14} className="mr-1" />
                Auto
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewEmail(email.id)}
              className="bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/40"
            >
              <Eye size={14} className="mr-2" />
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => onReplyEmail(email)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Reply size={14} className="mr-2" />
              Reply
            </Button>
            {!email.isResolved && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkResolved(email.id)}
                className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/40"
              >
                <CheckCheck size={14} className="mr-2" />
                Mark Resolved
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}