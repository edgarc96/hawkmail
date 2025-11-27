"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { Email, TeamMember } from "@/features/emails/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Eye, Reply, CheckCheck, Clock, Zap, ChevronDown } from "lucide-react";
import { getPriorityColor, getStatusColor, getTimeRemaining, getCategoryColor, getSentimentColor } from "@/lib/utils/email-helpers";

interface OptimizedEmailListProps {
  emails: Email[];
  teamMembers: TeamMember[];
  onViewEmail: (id: number) => void;
  onReplyEmail: (email: Email) => void;
  onMarkResolved: (id: number) => void;
  onAssignEmail: (emailId: number, memberId: number) => void;
  onAutoAssign?: (emailId: number) => void;
  isAutoAssigning?: boolean;
  className?: string;
}

// Memoized email item component
const EmailItem = memo(({ 
  email, 
  teamMembers, 
  onViewEmail, 
  onReplyEmail, 
  onMarkResolved, 
  onAssignEmail, 
  onAutoAssign, 
  isAutoAssigning 
}: {
  email: Email;
  teamMembers: TeamMember[];
  onViewEmail: (id: number) => void;
  onReplyEmail: (email: Email) => void;
  onMarkResolved: (id: number) => void;
  onAssignEmail: (emailId: number, memberId: number) => void;
  onAutoAssign?: (emailId: number) => void;
  isAutoAssigning?: boolean;
}) => {
  const handleAssign = useCallback((value: string) => {
    onAssignEmail(email.id, parseInt(value));
  }, [email.id, onAssignEmail]);

  const handleAutoAssign = useCallback(() => {
    if (onAutoAssign) onAutoAssign(email.id);
  }, [email.id, onAutoAssign]);

  const handleView = useCallback(() => {
    onViewEmail(email.id);
  }, [email.id, onViewEmail]);

  const handleReply = useCallback(() => {
    onReplyEmail(email);
  }, [email, onReplyEmail]);

  const handleMarkResolved = useCallback(() => {
    onMarkResolved(email.id);
  }, [email.id, onMarkResolved]);

  return (
    <div className="rounded-lg border border-primary/20 bg-background p-4 transition-all duration-200 hover:border-primary/40">
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
          {email.category && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getCategoryColor(email.category)}`}
            >
              {email.category}
            </span>
          )}
          {email.sentiment && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getSentimentColor(email.sentiment)}`}
            >
              {email.sentiment}
            </span>
          )}
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
          onValueChange={handleAssign}
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
            onClick={handleAutoAssign}
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
          onClick={handleView}
          variant="outline"
          className="gap-2"
        >
          <Eye size={14} />
          View Details
        </Button>
        <Button
          size="sm"
          onClick={handleReply}
          className="gap-2"
        >
          <Reply size={14} />
          Reply
        </Button>
        {!email.isResolved && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkResolved}
            className="gap-2"
          >
            <CheckCheck size={14} />
            Mark Resolved
          </Button>
        )}
      </div>
    </div>
  );
});

EmailItem.displayName = "EmailItem";

export const OptimizedEmailList = memo(({ 
  emails, 
  teamMembers, 
  onViewEmail, 
  onReplyEmail, 
  onMarkResolved, 
  onAssignEmail, 
  onAutoAssign, 
  isAutoAssigning = false,
  className 
}: OptimizedEmailListProps) => {
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Memoized filtered and sorted emails
  const processedEmails = useMemo(() => {
    return emails.slice(0, visibleCount);
  }, [emails, visibleCount]);

  const hasMore = emails.length > visibleCount;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 10, emails.length));
  }, [emails.length]);

  if (emails.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Mail className="mx-auto text-muted-foreground mb-4" size={48} />
        <p className="text-foreground text-lg">No emails found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Emails will appear here once you connect your email provider
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {processedEmails.map((email) => (
          <EmailItem
            key={email.id}
            email={email}
            teamMembers={teamMembers}
            onViewEmail={onViewEmail}
            onReplyEmail={onReplyEmail}
            onMarkResolved={onMarkResolved}
            onAssignEmail={onAssignEmail}
            onAutoAssign={onAutoAssign}
            isAutoAssigning={isAutoAssigning}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            className="gap-2"
          >
            <ChevronDown size={16} />
            Load More ({emails.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
});

OptimizedEmailList.displayName = "OptimizedEmailList";