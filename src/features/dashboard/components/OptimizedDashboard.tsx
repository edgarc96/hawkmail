"use client";

import { memo, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardMetrics } from "./DashboardMetrics";
import { OptimizedEmailList } from "./OptimizedEmailList";
import { EmailFilters } from "@/features/emails/components/EmailFilters";
import { Email, TeamMember } from "@/features/emails/types";

interface OptimizedDashboardProps {
  emails: Email[];
  teamMembers: TeamMember[];
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  onViewEmail: (id: number) => void;
  onReplyEmail: (email: Email) => void;
  onMarkResolved: (id: number) => void;
  onAssignEmail: (emailId: number, memberId: number) => void;
  onAutoAssign: (emailId: number) => void;
  onBulkAutoAssign: () => void;
  isAutoAssigning: boolean;
}

// Memoized auto-assignment component
const AutoAssignmentSection = memo(({ 
  emails, 
  teamMembers, 
  onBulkAutoAssign, 
  isAutoAssigning 
}: {
  emails: Email[];
  teamMembers: TeamMember[];
  onBulkAutoAssign: () => void;
  isAutoAssigning: boolean;
}) => {
  const unassignedCount = useMemo(() => 
    emails.filter(e => !e.assignedTo && e.status === 'pending').length,
    [emails]
  );

  if (teamMembers.length === 0) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-background p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Zap className="text-primary" size={24} />
            Smart Auto-Assignment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {unassignedCount} unassigned emails
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onBulkAutoAssign}
              disabled={isAutoAssigning || unassignedCount === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isAutoAssigning ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Auto-Assigning...
                </>
              ) : (
                <>
                  <Zap size={18} className="mr-2" />
                  Auto-Assign All Unassigned
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="border border-border bg-card text-foreground shadow-lg">
            <p>Automatically distributes all unassigned emails to team members using Round-Robin strategy</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});

AutoAssignmentSection.displayName = "AutoAssignmentSection";

export const OptimizedDashboard = memo(({
  emails,
  teamMembers,
  searchTerm,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClearFilters,
  onApplyFilters,
  onViewEmail,
  onReplyEmail,
  onMarkResolved,
  onAssignEmail,
  onAutoAssign,
  onBulkAutoAssign,
  isAutoAssigning,
}: OptimizedDashboardProps) => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: dashboardData, isLoading, mutate } = useDashboardData();

  // Redirect if not authenticated
  useMemo(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [session, isPending, router]);

  // Client-side filtering for search (optimized)
  const filteredEmails = useMemo(() => {
    if (!searchTerm) return emails;
    
    const search = searchTerm.toLowerCase();
    return emails.filter(email => (
      email.subject?.toLowerCase().includes(search) ||
      email.senderEmail?.toLowerCase().includes(search) ||
      email.recipientEmail?.toLowerCase().includes(search)
    ));
  }, [emails, searchTerm]);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleViewEmail = useCallback((id: number) => {
    onViewEmail(id);
  }, [onViewEmail]);

  const handleReplyEmail = useCallback((email: Email) => {
    onReplyEmail(email);
  }, [onReplyEmail]);

  const handleMarkResolved = useCallback((id: number) => {
    onMarkResolved(id);
    // Refresh dashboard data after marking as resolved
    mutate();
  }, [onMarkResolved, mutate]);

  const handleAssignEmail = useCallback((emailId: number, memberId: number) => {
    onAssignEmail(emailId, memberId);
    // Refresh dashboard data after assignment
    mutate();
  }, [onAssignEmail, mutate]);

  const handleAutoAssign = useCallback((emailId: number) => {
    onAutoAssign(emailId);
    // Refresh dashboard data after auto-assignment
    mutate();
  }, [onAutoAssign, mutate]);

  const handleBulkAutoAssign = useCallback(() => {
    onBulkAutoAssign();
    // Refresh dashboard data after bulk auto-assignment
    mutate();
  }, [onBulkAutoAssign, mutate]);

  // Loading state
  if (isPending || (isLoading && !dashboardData)) {
    return (
      <div className="min-h-screen bg-[#1a0f2e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-purple-400" size={48} />
          <p className="text-purple-200">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-8">
        {/* Metrics Section - Optimized with memoization */}
        <DashboardMetrics />

        {/* Filters Section - Using existing component */}
        <EmailFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onClearFilters={onClearFilters}
          onApplyFilters={onApplyFilters}
        />

        {/* Auto-Assignment Section - Memoized */}
        <AutoAssignmentSection
          emails={emails}
          teamMembers={teamMembers}
          onBulkAutoAssign={handleBulkAutoAssign}
          isAutoAssigning={isAutoAssigning}
        />

        {/* Email List Section - Optimized with virtualization */}
        <div className="rounded-lg border border-primary/20 bg-background p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Emails</h2>
            {teamMembers.length > 0 && (
              <span className="text-sm text-muted-foreground">💡 Tip: Click on email to auto-assign</span>
            )}
          </div>
          <OptimizedEmailList
            emails={filteredEmails}
            teamMembers={teamMembers}
            onViewEmail={handleViewEmail}
            onReplyEmail={handleReplyEmail}
            onMarkResolved={handleMarkResolved}
            onAssignEmail={handleAssignEmail}
            onAutoAssign={handleAutoAssign}
            isAutoAssigning={isAutoAssigning}
          />
        </div>
      </div>
    </TooltipProvider>
  );
});

OptimizedDashboard.displayName = "OptimizedDashboard";