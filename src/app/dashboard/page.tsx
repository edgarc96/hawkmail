"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { OptimizedDashboard } from "@/features/dashboard/components/OptimizedDashboard";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DashboardSummary {
  totalEmails: number;
  pendingEmails: number;
  repliedEmails: number;
  overdueEmails: number;
  highPriorityEmails: number;
  unresolvedEmails: number;
  avgReplyTimeMinutes: number;
  avgResolutionRate: number;
}

interface Email {
  id: number;
  subject: string;
  senderEmail: string;
  recipientEmail: string;
  bodyContent?: string | null;
  receivedAt: string;
  slaDeadline: string;
  firstReplyAt: string | null;
  status: string;
  priority: string;
  isResolved: boolean;
  assignedTo: number | null;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

function DashboardContent() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, emailsRes, teamRes] = await Promise.all([
        fetch("/api/dashboard/summary"),
        fetch("/api/emails"),
        fetch("/api/team")
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboardData(data);
      }

      if (emailsRes.ok) {
        const data = await emailsRes.json();
        setEmails(data.emails || []);
      }

      if (teamRes.ok) {
        const data = await teamRes.json();
        setTeamMembers(data.team || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEmail = (id: number) => {
    // Open email details modal
    console.log("View email:", id);
  };

  const handleReplyEmail = (email: Email) => {
    // Open reply modal
    console.log("Reply to email:", email);
  };

  const handleMarkResolved = async (id: number) => {
    try {
      const response = await fetch(`/api/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: true }),
      });

      if (response.ok) {
        toast.success("Email marked as resolved");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to mark email as resolved");
    }
  };

  const handleAssignEmail = async (emailId: number, memberId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: memberId }),
      });

      if (response.ok) {
        toast.success("Email assigned successfully");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to assign email");
    }
  };

  const handleAutoAssign = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/auto-assign`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Email auto-assigned");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to auto-assign email");
    }
  };

  const handleBulkAutoAssign = async () => {
    setIsAutoAssigning(true);
    try {
      const response = await fetch("/api/emails/bulk-auto-assign", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("All emails auto-assigned successfully");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to auto-assign emails");
    } finally {
      setIsAutoAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OptimizedDashboard
        emails={emails}
        teamMembers={teamMembers}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onClearFilters={() => {
          setSearchTerm("");
          setStatusFilter("all");
          setPriorityFilter("all");
        }}
        onApplyFilters={() => {
          // Filters are applied automatically
        }}
        onViewEmail={handleViewEmail}
        onReplyEmail={handleReplyEmail}
        onMarkResolved={handleMarkResolved}
        onAssignEmail={handleAssignEmail}
        onAutoAssign={handleAutoAssign}
        onBulkAutoAssign={handleBulkAutoAssign}
        isAutoAssigning={isAutoAssigning}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
