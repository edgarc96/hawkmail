"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Loader2, Mail, Clock, AlertCircle, CheckCircle, Users, TrendingUp, BarChart3, Settings, XCircle, Send, X, Eye, Reply, CheckCheck, RefreshCw, Plus, Trash2, Database, Download, FileSpreadsheet, Sparkles, Webhook, Target, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedDashboard } from "@/features/dashboard/components/OptimizedDashboard";
import { AlertsList } from "@/features/alerts/components/AlertsList";
import { Leaderboard } from "@/features/team/components/Leaderboard";
import { ProgressiveTeamOverview } from "@/features/team/components/ProgressiveTeamOverview";
import { PerformanceTrendChart } from "@/features/analytics/components/PerformanceTrendChart";
import { EmailDistributionChart } from "@/features/analytics/components/EmailDistributionChart";
import { TeamPerformanceHeatmap } from "@/features/analytics/components/TeamPerformanceHeatmap";
import { TicketsSection } from "@/features/tickets/components/TicketsSection";
import { NotificationDropdown } from "@/features/notifications/components/NotificationDropdown";
import { SettingsContent } from "@/features/settings/components/SettingsContent";
import {
  ZendeskDashboardMetrics,
  ZendeskHeader,
  ZendeskResponseTimeAnalytics,
  ZendeskSidebar,
  ZendeskTicketsTable,
  ZendeskSLASection,
} from "@/features/dashboard/components/zendesk";
import type {
  DashboardView,
  DashboardMetric,
  ResponseTrendDatum,
  AgentPerformanceDatum,
  SlaComplianceDatum,
  TicketRow,
} from "@/features/dashboard/components/zendesk";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TicketWorkspaceZendesk } from "@/components/tickets/TicketWorkspaceZendesk";
import { mapEmailRecordToSerializable } from "@/lib/utils/ticket-mapper";
import { useTicketStore } from "@/lib/stores/ticketStore";
import { CustomerSummary, TicketStatistics, TicketTimelineEntry, TicketWorkspaceData } from "@/types/ticket-detail";
import { DEFAULT_TICKET_PRIORITIES, DEFAULT_TICKET_STATUSES } from "@/lib/constants/ticketDefaults";

// Helper function to convert HTML to plain text
function htmlToPlainText(html: string): string {
  if (!html) return '';

  // Replace common HTML tags with appropriate line breaks
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<h[1-6][^>]*>/gi, '')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<td[^>]*>/gi, '\t')
    .replace(/<\/td>/gi, '')
    .replace(/<[^>]+>/g, ''); // Remove all other HTML tags

  // Decode HTML entities
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;
  }

  // Clean up excessive whitespace
  text = text
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
    .trim();

  return text;
}

interface DashboardSummary {
  totalEmails: number;
  pendingEmails: number;
  repliedEmails: number;
  overdueEmails: number;
  highPriorityEmails: number;
  unresolvedEmails: number;
  avgReplyTimeMinutes: number;
  avgResolutionRate: number;
  recentMetrics: Array<{
    id: number;
    date: string;
    avgFirstReplyTimeMinutes: number;
    resolutionRate: number;
  }>;
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
  category?: string | null;
  sentiment?: string | null;
  isResolved: boolean;
  assignedTo: number | null;
}

interface Alert {
  id: number;
  emailId: number;
  message: string;
  alertType: string;
  isRead: boolean;
  createdAt: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface TeamPerformance {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  metrics: {
    totalAssigned: number;
    replied: number;
    pending: number;
    overdue: number;
    avgReplyTimeMinutes: number;
    resolutionRate: number;
  };
}

interface EmailProvider {
  id: number;
  provider: string;
  email: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

interface SyncLog {
  id: number;
  syncStatus: string;
  emailsProcessed: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLive, setAlertsLive] = useState<boolean>(false);
  const [alertsLastEventAt, setAlertsLastEventAt] = useState<Date | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<DashboardView>("dashboard");
  const [activeConfigSection, setActiveConfigSection] = useState<'templates' | 'sla' | 'webhooks' | 'business-hours' | 'customer-tiers' | 'email-providers' | 'performance-goals'>('templates');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'profile' | 'billing' | 'notifications' | 'preferences'>('profile');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const ticketStatuses = useTicketStore((state) => state.ticketStatuses);
  const ticketPriorities = useTicketStore((state) => state.ticketPriorities);
  const refreshTickets = useTicketStore((state) => state.refreshTickets);
  const [isTicketSheetOpen, setIsTicketSheetOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketWorkspaceData, setTicketWorkspaceData] = useState<TicketWorkspaceData | null>(null);
  const [ticketWorkspaceLoading, setTicketWorkspaceLoading] = useState(false);
  const [ticketWorkspaceError, setTicketWorkspaceError] = useState<string | null>(null);

  const handleOpenTicketDetail = (ticketId: string) => {
    setActiveTicketId(ticketId);
    setIsTicketSheetOpen(true);
  };

  const handleCloseTicketDetail = () => {
    setIsTicketSheetOpen(false);
    setActiveTicketId(null);
    setTicketWorkspaceData(null);
    setTicketWorkspaceError(null);
    void refreshTickets();
  };

  useEffect(() => {
    if (!isTicketSheetOpen || !activeTicketId) {
      return;
    }

    const controller = new AbortController();

    const loadTicketWorkspace = async () => {
      setTicketWorkspaceLoading(true);
      setTicketWorkspaceError(null);
      setTicketWorkspaceData(null);

      try {
        const response = await fetch(`/api/tickets/${activeTicketId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ticket');
        }

        const emailData = await response.json();
        const statuses = ticketStatuses.length ? ticketStatuses : DEFAULT_TICKET_STATUSES;
        const priorities = ticketPriorities.length ? ticketPriorities : DEFAULT_TICKET_PRIORITIES;
        const serializedTicket = mapEmailRecordToSerializable(emailData, statuses, priorities);

        const customerSummary: CustomerSummary = {
          name: emailData.senderEmail?.split('@')[0] || 'Customer',
          email: emailData.senderEmail,
          avatarInitials: emailData.senderEmail?.substring(0, 2).toUpperCase() || 'CU',
          organization: null,
          language: null,
          localTime: null,
          notes: null,
        };

        let stats: TicketStatistics = {
          totalTickets: 1,
          openTickets: emailData.isResolved ? 0 : 1,
          resolvedTickets: emailData.isResolved ? 1 : 0,
          satisfactionScore: null,
        };

        try {
          const customerRes = await fetch(`/api/customers/${emailData.senderEmail}`, {
            signal: controller.signal,
          });

          if (customerRes.ok) {
            const customerData = await customerRes.json();
            customerSummary.name = customerData.name || customerSummary.name;
            stats = {
              totalTickets: customerData.totalTickets || stats.totalTickets,
              openTickets: customerData.openTickets ?? stats.openTickets,
              resolvedTickets: customerData.resolvedTickets ?? stats.resolvedTickets,
              satisfactionScore: customerData.satisfactionScore ?? stats.satisfactionScore,
            };
          }
        } catch (customerError) {
          console.warn('Failed to fetch customer data', customerError);
        }

        const timeline: TicketTimelineEntry[] = [
          {
            id: `${emailData.id}-received`,
            type: 'milestone',
            title: 'Email received',
            description: `Ticket created from email`,
            statusId: emailData.status,
            timestamp: new Date(emailData.receivedAt || emailData.createdAt).toISOString(),
          },
        ];

        if (emailData.firstReplyAt) {
          timeline.push({
            id: `${emailData.id}-replied`,
            type: 'milestone',
            title: 'First reply sent',
            description: null,
            statusId: null,
            timestamp: new Date(emailData.firstReplyAt).toISOString(),
          });
        }

        setTicketWorkspaceData({
          ticket: serializedTicket,
          customer: customerSummary,
          stats,
          timeline,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setTicketWorkspaceError(error instanceof Error ? error.message : 'Failed to load ticket');
        }
      } finally {
        if (!controller.signal.aborted) {
          setTicketWorkspaceLoading(false);
        }
      }
    };

    loadTicketWorkspace();

    return () => {
      controller.abort();
    };
  }, [isTicketSheetOpen, activeTicketId, ticketStatuses, ticketPriorities]);

  // New states for email details and filters
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  // Team member details modal
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamPerformance | null>(null);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [slaSettings, setSlaSettings] = useState<any[]>([]);
  const [newSlaName, setNewSlaName] = useState("");
  const [newSlaTime, setNewSlaTime] = useState("");
  const [newSlaPriority, setNewSlaPriority] = useState<string>("medium");
  const [emailProviders, setEmailProviders] = useState<EmailProvider[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  // Team member form states
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<string>('agent');

  // Reply templates states
  const [replyTemplates, setReplyTemplates] = useState<any[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSubject, setNewTemplateSubject] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('general');

  // Performance goals states
  const [performanceGoals, setPerformanceGoals] = useState<any>({ goals: [], bands: [] });
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [firstReplyGoalHours, setFirstReplyGoalHours] = useState('1');
  const [firstReplyGoalMinutes, setFirstReplyGoalMinutes] = useState('0');
  const [overallReplyGoalHours, setOverallReplyGoalHours] = useState('8');
  const [overallReplyGoalMinutes, setOverallReplyGoalMinutes] = useState('0');
  const [timeToCloseGoalHours, setTimeToCloseGoalHours] = useState('48');
  const [timeToCloseGoalMinutes, setTimeToCloseGoalMinutes] = useState('0');
  const [newBandMinHours, setNewBandMinHours] = useState('0');
  const [newBandMinMinutes, setNewBandMinMinutes] = useState('0');
  const [newBandMaxHours, setNewBandMaxHours] = useState('0');
  const [newBandMaxMinutes, setNewBandMaxMinutes] = useState('0');
  const [newBandType, setNewBandType] = useState('first_reply');
  const [isFixingEncoding, setIsFixingEncoding] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [teamWorkload, setTeamWorkload] = useState<any[]>([]);

  // Webhooks states
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedWebhookEvents, setSelectedWebhookEvents] = useState<string[]>(['email.received']);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  // Business Hours states
  const [businessHours, setBusinessHours] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  });
  const [holidays, setHolidays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState('');

  // Customer Tiers states
  const [customerTiers, setCustomerTiers] = useState<any[]>([]);
  const [newTierEmail, setNewTierEmail] = useState('');
  const [newTierLevel, setNewTierLevel] = useState<'vip' | 'enterprise' | 'standard'>('standard');
  const [newTierSlaMinutes, setNewTierSlaMinutes] = useState('60');

  // UX Enhancement states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'webhook' | 'team' | 'template' | 'sla' | 'tier' | null;
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    name: '',
  });
  const [showLegacyDashboard, setShowLegacyDashboard] = useState(false);
  const [showLegacyTickets, setShowLegacyTickets] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [session, isPending, router]);

  // Handle OAuth success/error messages
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const success = params.get('success');
        const error = params.get('error');

        if (success === 'gmail_connected') {
          toast.success('Gmail connected successfully!');
          setActiveView('settings');
          // Fetch providers immediately after connection
          try {
            const response = await fetch("/api/email-providers", {
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              setEmailProviders(data);
            }
          } catch (error) {
            console.error("Error fetching providers:", error);
          }
          // Clean URL
          window.history.replaceState({}, '', '/dashboard');
        } else if (success === 'outlook_connected') {
          toast.success('Outlook connected successfully!');
          setActiveView('settings');
          // Fetch providers immediately after connection
          try {
            const response = await fetch("/api/email-providers", {
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              setEmailProviders(data);
            }
          } catch (error) {
            console.error("Error fetching providers:", error);
          }
          window.history.replaceState({}, '', '/dashboard');
        } else if (error === 'oauth_denied') {
          toast.error('OAuth authorization was denied');
          window.history.replaceState({}, '', '/dashboard');
        } else if (error === 'oauth_failed') {
          toast.error('Failed to connect email provider. Please try again.');
          window.history.replaceState({}, '', '/dashboard');
        }
      }
    };

    handleOAuthCallback();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData(true); // Initial load with loading state

      // Polling: refetch data every 30 seconds without loading state
      const pollInterval = setInterval(() => {
        fetchDashboardData(false); // Silent refresh
      }, 30000); // 30 seconds

      return () => clearInterval(pollInterval);
    }
  }, [session]);

  // Show onboarding for first-time users
  useEffect(() => {
    if (
      !isLoading &&
      session?.user &&
      !localStorage.getItem('onboarding_completed')
    ) {
      // Show onboarding after 1 second delay to let dashboard load first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, session]);

  // Refetch when filters change (NOT search term - that's client-side only)
  useEffect(() => {
    if (session?.user) {
      fetchDashboardData(true); // Show loading when filters change
    }
  }, [statusFilter, priorityFilter]);

  // Load team workload when team section is active
  useEffect(() => {
    if (session?.user && activeView === 'agents') {
      fetchTeamWorkload();
    }
  }, [session, activeView]);

  // Live Alerts via SSE when Alerts section is active
  useEffect(() => {
    let es: EventSource | null = null;
    if (session?.user && activeView === 'alerts') {
      try {
        setAlertsLive(true);
        es = new EventSource('/api/alerts/live');
        es.onmessage = (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (payload?.alerts) {
              setAlerts(payload.alerts);
            }
            setAlertsLastEventAt(new Date());
          } catch (e) {
            // ignore malformed messages
          }
        };
        es.onerror = () => {
          setAlertsLive(false);
        };
      } catch (e) {
        setAlertsLive(false);
      }
    }
    return () => {
      if (es) es.close();
    };
  }, [session, activeView]);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
      setIsPolling(false);
    } else {
      setIsPolling(true);
    }
    try {
      const queryParams = new URLSearchParams();
      // Note: searchTerm is NOT sent to server - it's client-side filtering only
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (priorityFilter !== "all") queryParams.append("priority", priorityFilter);

      const [dashboardRes, emailsRes, alertsRes, teamRes, slaRes] = await Promise.all([
        fetch("/api/dashboard", {
          credentials: 'include',
        }),
        fetch(`/api/emails?${queryParams}`, {
          credentials: 'include',
        }),
        fetch("/api/alerts", {
          credentials: 'include',
        }),
        fetch("/api/team", {
          credentials: 'include',
        }),
        fetch("/api/sla-settings", {
          credentials: 'include',
        }),
      ]);

      if (!dashboardRes.ok) throw new Error("Failed to fetch dashboard data");
      if (!emailsRes.ok) throw new Error("Failed to fetch emails");
      if (!alertsRes.ok) throw new Error("Failed to fetch alerts");
      if (!teamRes.ok) throw new Error("Failed to fetch team members");

      const dashboardJson = await dashboardRes.json();
      const emailsJson = await emailsRes.json();
      const alertsJson = await alertsRes.json();
      const teamJson = await teamRes.json();
      const slaJson = slaRes.ok ? await slaRes.json() : [];

      setDashboardData(dashboardJson);
      setEmails(emailsJson);
      setAlerts(alertsJson);
      setTeamMembers(teamJson);
      setSlaSettings(slaJson);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (showLoading) {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  const fetchEmailProviders = async () => {
    try {
      const response = await fetch("/api/email-providers", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEmailProviders(data);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const fetchSyncLogs = async (providerId?: number) => {
    try {
      const url = providerId
        ? `/api/sync-logs?providerId=${providerId}&limit=10`
        : "/api/sync-logs?limit=10";
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSyncLogs(data);
      }
    } catch (error) {
      console.error("Error fetching sync logs:", error);
    }
  };

  const fetchTeamPerformance = async () => {
    try {
      const response = await fetch("/api/team/performance", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTeamPerformance(data.teamPerformance || []);
      }
    } catch (error) {
      console.error("Error fetching team performance:", error);
    }
  };

  useEffect(() => {
    if (session?.user && activeView === 'settings') {
      fetchEmailProviders();
      fetchSyncLogs();
    }
  }, [session, activeView]);

  useEffect(() => {
    if (session?.user && activeView === 'agents') {
      fetchTeamPerformance();
    }
  }, [session, activeView]);

  // Auto-refresh for Analytics - LIVE updates every 30 seconds
  useEffect(() => {
    if (activeView === 'performance' && session?.user) {
      const interval = setInterval(() => {
        fetchDashboardData(false); // Refresh without showing loading spinner
        setLastUpdate(new Date());
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeView, session]);

  useEffect(() => {
    if (session?.user && activeView === 'settings') {
      fetchReplyTemplates();
      fetchPerformanceGoals();
    }
  }, [session, activeView, selectedChannel]);

  const fetchPerformanceGoals = async () => {
    try {
      const response = await fetch(`/api/performance-goals?channel=${selectedChannel}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPerformanceGoals(data);

        // Load existing goals into form
        const firstReply = data.goals.find((g: any) => g.goalType === 'first_reply');
        const overallReply = data.goals.find((g: any) => g.goalType === 'overall_reply');
        const timeToClose = data.goals.find((g: any) => g.goalType === 'time_to_close');

        if (firstReply) {
          setFirstReplyGoalHours(Math.floor(firstReply.targetMinutes / 60).toString());
          setFirstReplyGoalMinutes((firstReply.targetMinutes % 60).toString());
        }
        if (overallReply) {
          setOverallReplyGoalHours(Math.floor(overallReply.targetMinutes / 60).toString());
          setOverallReplyGoalMinutes((overallReply.targetMinutes % 60).toString());
        }
        if (timeToClose) {
          setTimeToCloseGoalHours(Math.floor(timeToClose.targetMinutes / 60).toString());
          setTimeToCloseGoalMinutes((timeToClose.targetMinutes % 60).toString());
        }
      }
    } catch (error) {
      console.error("Error fetching performance goals:", error);
    }
  };

  const handleSavePerformanceGoals = async () => {
    try {
      const goals = [
        {
          goalType: 'first_reply',
          targetMinutes: parseInt(firstReplyGoalHours) * 60 + parseInt(firstReplyGoalMinutes),
          channel: selectedChannel,
        },
        {
          goalType: 'overall_reply',
          targetMinutes: parseInt(overallReplyGoalHours) * 60 + parseInt(overallReplyGoalMinutes),
          channel: selectedChannel,
        },
        {
          goalType: 'time_to_close',
          targetMinutes: parseInt(timeToCloseGoalHours) * 60 + parseInt(timeToCloseGoalMinutes),
          channel: selectedChannel,
        },
      ];

      for (const goal of goals) {
        const response = await fetch('/api/performance-goals', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goal),
        });

        if (!response.ok) throw new Error('Failed to save goal');
      }

      toast.success('Performance goals saved successfully!');
      fetchPerformanceGoals();
    } catch (error) {
      toast.error('Failed to save performance goals');
    }
  };

  const handleAddTimeBand = async () => {
    const minMinutes = parseInt(newBandMinHours) * 60 + parseInt(newBandMinMinutes);
    const maxMinutes = parseInt(newBandMaxHours) * 60 + parseInt(newBandMaxMinutes);

    try {
      const response = await fetch('/api/time-bands', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: selectedChannel,
          bandType: newBandType,
          minMinutes,
          maxMinutes,
          label: `${newBandMinHours}h${newBandMinMinutes}m - ${newBandMaxHours}h${newBandMaxMinutes}m`,
          color: '#6b7280',
        }),
      });

      if (!response.ok) throw new Error('Failed to add time band');

      toast.success('Time band added successfully!');
      fetchPerformanceGoals();
      setNewBandMinHours('0');
      setNewBandMinMinutes('0');
      setNewBandMaxHours('0');
      setNewBandMaxMinutes('30');
    } catch (error) {
      toast.error('Failed to add time band');
    }
  };

  const handleDeleteTimeBand = async (id: number) => {
    if (!confirm('Are you sure you want to delete this time band?')) {
      return;
    }

    try {
      const response = await fetch(`/api/time-bands?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete time band');

      toast.success('Time band deleted successfully!');
      fetchPerformanceGoals();
    } catch (error) {
      toast.error('Failed to delete time band');
    }
  };

  const fetchReplyTemplates = async () => {
    try {
      const response = await fetch("/api/reply-templates", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setReplyTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      toast.error("Template name and content are required");
      return;
    }

    try {
      const response = await fetch("/api/reply-templates", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTemplateName.trim(),
          subject: newTemplateSubject.trim() || null,
          content: newTemplateContent.trim(),
          category: newTemplateCategory,
        }),
      });

      if (!response.ok) throw new Error("Failed to create template");

      toast.success("Template created successfully!");
      setNewTemplateName("");
      setNewTemplateSubject("");
      setNewTemplateContent("");
      setNewTemplateCategory("general");
      fetchReplyTemplates();
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reply-templates?id=${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to delete template");

      toast.success("Template deleted successfully!");
      fetchReplyTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleConnectProvider = (provider: 'gmail' | 'outlook') => {
    if (!session?.user?.id) {
      toast.error("Please login first");
      return;
    }

    const userId = session.user.id;

    if (provider === 'gmail') {
      window.location.href = `/api/oauth/gmail/authorize?userId=${userId}`;
    } else if (provider === 'outlook') {
      window.location.href = `/api/oauth/outlook/authorize?userId=${userId}`;
    }
  };

  const handleDisconnectProvider = async (id: number) => {
    try {
      const response = await fetch(`/api/email-providers?id=${id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (response.ok) {
        toast.success("Provider disconnected successfully");
        fetchEmailProviders();
      } else {
        throw new Error("Failed to disconnect provider");
      }
    } catch (error) {
      toast.error("Failed to disconnect provider");
    }
  };

  const handleSyncProvider = async (providerId: number) => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/email-providers/${providerId}/sync`, {
        method: "POST",
        credentials: 'include',
      });
      const data = await response.json();

      // Log detailed sync results to console for debugging
      console.log('📊 Sync Results:', {
        processed: data.emailsProcessed || 0,
        totalFound: data.totalFound || 0,
        skipped: data.skipped || 0,
        errors: data.errors || 0,
        errorDetails: data.errorDetails || []
      });

      if (response.ok) {
        const message = `✅ Sync completed! Found: ${data.totalFound || 0}, New: ${data.emailsProcessed || 0}, Skipped: ${data.skipped || 0}${data.errors > 0 ? `, Errors: ${data.errors}` : ''}`;

        if (data.errors > 0 && data.errorDetails && data.errorDetails.length > 0) {
          console.error('❌ Sync Errors:', data.errorDetails);
          toast.error(`${message}\nCheck console for error details`, { duration: 8000 });
        } else if (data.emailsProcessed === 0 && data.totalFound > 0) {
          toast.warning(`⚠️ ${message}\nAll emails already exist or had errors`, { duration: 6000 });
        } else {
          toast.success(message, { duration: 4000 });
        }

        fetchSyncLogs(providerId);
        fetchEmailProviders();
        // Refresh dashboard data to show new metrics
        fetchDashboardData(false);
      } else {
        throw new Error(data.error || "Failed to sync provider");
      }
    } catch (error) {
      toast.error("❌ Failed to sync: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewProviderStatus = async (provider: EmailProvider) => {
    setSelectedProvider(provider);
    fetchSyncLogs(provider.id);
  };

  const handleViewEmail = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails?id=${emailId}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to fetch email details");

      const email = await response.json();
      setSelectedEmail(email);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error("Failed to load email details");
    }
  };

  const handleMarkResolved = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isResolved: true, status: "replied" }),
      });

      if (!response.ok) throw new Error("Failed to mark as resolved");

      toast.success("Email marked as resolved");
      fetchDashboardData(false); // Silent refresh
      setIsDetailModalOpen(false);
    } catch (error) {
      toast.error("Failed to mark email as resolved");
    }
  };

  const handleOpenReply = (email: Email) => {
    setSelectedEmail(email);
    setReplyContent("");
    setIsReplyModalOpen(true);
    // Load templates if not already loaded
    if (replyTemplates.length === 0) {
      fetchReplyTemplates();
    }
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyContent.trim()) {
      toast.error("Reply content cannot be empty");
      return;
    }

    setIsReplying(true);
    try {
      const response = await fetch(`/api/emails/${selectedEmail.id}/reply`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ replyContent: replyContent.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reply");
      }

      toast.success("Reply sent successfully!");
      setIsReplyModalOpen(false);
      setReplyContent("");
      fetchDashboardData(false); // Silent refresh
    } catch (error: any) {
      toast.error(error.message || "Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const handleCreateSLA = async () => {
    if (!newSlaName.trim() || !newSlaTime) {
      toast.error("Please fill in all SLA fields");
      return;
    }

    try {
      const response = await fetch("/api/sla-settings", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSlaName.trim(),
          targetReplyTimeMinutes: parseInt(newSlaTime),
          priorityLevel: newSlaPriority,
          isActive: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to create SLA setting");

      toast.success("SLA setting created successfully");
      setNewSlaName("");
      setNewSlaTime("");
      setNewSlaPriority("medium");
      fetchDashboardData(false); // Silent refresh
    } catch (error) {
      toast.error("Failed to create SLA setting");
    }
  };

  // Helper function to open delete confirmation
  const openDeleteConfirmation = (type: 'webhook' | 'team' | 'template' | 'sla' | 'tier', id: number, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      name,
    });
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    const { type, id } = deleteConfirmation;

    if (!type || id === null) return;

    try {
      switch (type) {
        case 'webhook':
          await handleDeleteWebhook(id);
          break;
        case 'team':
          await handleDeleteTeamMember(id);
          break;
        case 'template':
          await handleDeleteTemplate(id);
          break;
        case 'sla':
          await handleDeleteSLAConfirmed(id);
          break;
        case 'tier':
          handleRemoveCustomerTier(id);
          break;
      }
    } finally {
      setDeleteConfirmation({ isOpen: false, type: null, id: null, name: '' });
    }
  };

  const handleDeleteSLAConfirmed = async (id: number) => {
    try {
      const response = await fetch(`/api/sla-settings?id=${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to delete SLA setting");

      toast.success("SLA setting deleted");
      fetchDashboardData(false); // Silent refresh
    } catch (error) {
      toast.error("Failed to delete SLA setting");
    }
  };

  const handleDeleteSLA = (id: number, name: string) => {
    openDeleteConfirmation('sla', id, name);
  };

  const handleAddTeamMember = async () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newMemberName.trim(),
          email: newMemberEmail.trim(),
          role: newMemberRole,
          isActive: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to add team member");

      toast.success("Team member added successfully!");
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberRole("agent");

      // Refresh team members list and performance
      const teamRes = await fetch("/api/team", {
        credentials: 'include',
      });
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData);
      }

      // Refresh performance data
      fetchTeamPerformance();
    } catch (error) {
      toast.error("Failed to add team member");
    }
  };

  const handleDeleteTeamMember = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/team?id=${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to delete team member");

      toast.success("Team member deleted successfully!");

      // Refresh team members list and performance
      const teamRes = await fetch("/api/team", {
        credentials: 'include',
      });
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData);
      }

      // Refresh performance data
      fetchTeamPerformance();
    } catch (error) {
      toast.error("Failed to delete team member");
    }
  };

  const handleAssignEmail = async (emailId: number, memberId: number) => {
    try {
      if (memberId === 0) {
        // Unassign
        const response = await fetch(`/api/emails/${emailId}/assign`, {
          method: "DELETE",
          credentials: 'include',
        });

        if (!response.ok) throw new Error("Failed to unassign email");

        toast.success("Email unassigned successfully!");
      } else {
        // Assign
        const response = await fetch(`/api/emails/${emailId}/assign`, {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamMemberId: memberId }),
        });

        if (!response.ok) throw new Error("Failed to assign email");

        const data = await response.json();
        toast.success(`Email assigned to ${data.assignedTo.name}!`);
      }

      // Refresh emails and team performance
      fetchDashboardData(false); // Silent refresh
      fetchTeamPerformance();
    } catch (error) {
      toast.error("Failed to assign email");
    }
  };

  const handleAutoAssignEmail = async (emailId: number) => {
    try {
      setIsAutoAssigning(true);
      const response = await fetch('/api/emails/auto-assign', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId,
          strategy: { type: 'least-loaded' }
        }),
      });

      if (!response.ok) throw new Error('Failed to auto-assign email');

      const data = await response.json();
      toast.success('Email auto-assigned successfully!');

      // Refresh data
      fetchDashboardData(false);
      fetchTeamPerformance();
    } catch (error) {
      toast.error('Failed to auto-assign email');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleBulkAutoAssign = async () => {
    try {
      const unassignedEmails = emails.filter(e => !e.assignedTo && e.status === 'pending');

      if (unassignedEmails.length === 0) {
        toast.info('No unassigned emails to auto-assign');
        return;
      }

      setIsAutoAssigning(true);
      const emailIds = unassignedEmails.map(e => e.id);

      const response = await fetch('/api/emails/auto-assign', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailIds,
          strategy: { type: 'round-robin' }
        }),
      });

      if (!response.ok) throw new Error('Failed to auto-assign emails');

      const data = await response.json();
      toast.success(`Auto-assigned ${data.assigned} emails successfully!`);

      // Refresh data
      fetchDashboardData(false);
      fetchTeamPerformance();
    } catch (error) {
      toast.error('Failed to auto-assign emails');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleRebalanceWorkload = async () => {
    try {
      setIsRebalancing(true);
      const response = await fetch('/api/team/rebalance', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to rebalance workload');

      const data = await response.json();

      if (data.reassigned > 0) {
        toast.success(`Rebalanced successfully! Reassigned ${data.reassigned} emails`);
      } else {
        toast.info(data.message || 'Workload is already balanced');
      }

      // Refresh data
      fetchDashboardData(false);
      fetchTeamPerformance();
      fetchTeamWorkload();
    } catch (error) {
      toast.error('Failed to rebalance workload');
    } finally {
      setIsRebalancing(false);
    }
  };

  const fetchTeamWorkload = async () => {
    try {
      const response = await fetch('/api/emails/auto-assign', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTeamWorkload(data.workload || []);
      }
    } catch (error) {
      console.error('Failed to fetch team workload:', error);
    }
  };

  // Webhooks functions
  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks/subscribe', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl || selectedWebhookEvents.length === 0) {
      toast.error('Please enter webhook URL and select at least one event');
      return;
    }

    try {
      setIsCreatingWebhook(true);
      const response = await fetch('/api/webhooks/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newWebhookUrl,
          events: selectedWebhookEvents,
        }),
      });

      if (!response.ok) throw new Error('Failed to create webhook');

      toast.success('Webhook created successfully!');
      setNewWebhookUrl('');
      setSelectedWebhookEvents(['email.received']);
      fetchWebhooks();
    } catch (error) {
      toast.error('Failed to create webhook');
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: number) => {
    try {
      const response = await fetch(`/api/webhooks/subscribe?id=${webhookId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete webhook');

      toast.success('Webhook deleted successfully!');
      fetchWebhooks();
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  // Business Hours & Holidays functions
  const handleAddHoliday = () => {
    if (!newHoliday) {
      toast.error('Please enter a holiday date');
      return;
    }

    setHolidays([...holidays, newHoliday]);
    setNewHoliday('');
    toast.success('Holiday added!');
  };

  const handleRemoveHoliday = (date: string) => {
    setHolidays(holidays.filter(h => h !== date));
    toast.success('Holiday removed!');
  };

  // Customer Tiers functions
  const handleAddCustomerTier = () => {
    if (!newTierEmail) {
      toast.error('Please enter customer email');
      return;
    }

    const newTier = {
      id: Date.now(),
      email: newTierEmail,
      tier: newTierLevel,
      slaMinutes: parseInt(newTierSlaMinutes),
    };

    setCustomerTiers([...customerTiers, newTier]);
    setNewTierEmail('');
    setNewTierLevel('standard');
    setNewTierSlaMinutes('60');
    toast.success('Customer tier added!');
  };

  const handleRemoveCustomerTier = (tierId: number) => {
    setCustomerTiers(customerTiers.filter(t => t.id !== tierId));
    toast.success('Customer tier removed!');
  };

  const handleSectionClick = (section: DashboardView) => {
    setActiveView(section);

    // Fetch webhooks when opening settings
    if (section === 'settings' || section === 'configuration') {
      fetchWebhooks();
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTimeRemaining = (deadline: string): string => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff < 0) return "Overdue";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "replied":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "overdue":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatRelativeTime = (timestamp?: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    if (diffMinutes < 1) return "justo ahora";
    if (diffMinutes < 60) return `hace ${diffMinutes}m`;

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;

    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 30) return `hace ${diffDays}d`;

    return date.toLocaleDateString();
  };

  const diffInMinutes = (start?: string | null, end?: string | null) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return null;
    }
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs < 0) return null;
    return Math.round(diffMs / 60000);
  };

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        email.subject?.toLowerCase().includes(search) ||
        email.senderEmail?.toLowerCase().includes(search) ||
        email.recipientEmail?.toLowerCase().includes(search)
      );
    });
  }, [emails, searchTerm]);

  const firstReplyGoalMinutesTotal = useMemo(() => {
    const hours = Number.parseInt(firstReplyGoalHours, 10) || 0;
    const minutes = Number.parseInt(firstReplyGoalMinutes, 10) || 0;
    return hours * 60 + minutes;
  }, [firstReplyGoalHours, firstReplyGoalMinutes]);

  const dashboardMetrics = useMemo<DashboardMetric[]>(() => {
    if (!dashboardData) return [];

    const recent = dashboardData.recentMetrics ?? [];
    const latest = recent[recent.length - 1];
    const previous = recent[recent.length - 2];

    const firstReplyDelta =
      latest && previous
        ? previous.avgFirstReplyTimeMinutes - latest.avgFirstReplyTimeMinutes
        : null;
    const slaDelta =
      latest && previous
        ? latest.resolutionRate - previous.resolutionRate
        : null;
    const unreadAlerts = alerts.filter((alert) => !alert.isRead).length;

    const metrics: DashboardMetric[] = [
      {
        id: "first-reply",
        title: "Avg First Response Time",
        value: formatTime(Math.round(dashboardData.avgReplyTimeMinutes ?? 0)),
        subtitle: "Last 24 hours",
        trend:
          firstReplyDelta != null
            ? {
              value: `${Math.abs(firstReplyDelta).toFixed(1)}m ${firstReplyDelta > 0 ? "faster" : "slower"
                }`,
              isPositive: firstReplyDelta > 0,
            }
            : undefined,
        icon: <Clock className="w-8 h-8" />,
      },
      {
        id: "pending-emails",
        title: "Open Tickets",
        value: (dashboardData.pendingEmails ?? 0).toString(),
        subtitle: `${dashboardData.unresolvedEmails ?? 0} unresolved`,
        icon: <Mail className="w-8 h-8" />,
      },
      {
        id: "overdue-emails",
        title: "Overdue Tickets",
        value: (dashboardData.overdueEmails ?? 0).toString(),
        subtitle: "Requires immediate attention",
        icon: <AlertCircle className="w-8 h-8" />,
      },
      {
        id: "sla-compliance",
        title: "SLA Compliance",
        value: `${Math.round(dashboardData.avgResolutionRate ?? 0)}%`,
        subtitle: "Target > 90%",
        trend:
          slaDelta != null
            ? {
              value: `${slaDelta > 0 ? "+" : ""}${slaDelta.toFixed(1)}%`,
              isPositive: slaDelta >= 0,
            }
            : undefined,
        icon: <TrendingUp className="w-8 h-8" />,
      },
      {
        id: "resolved-emails",
        title: "Tickets Resolved Today",
        value: (dashboardData.repliedEmails ?? 0).toString(),
        subtitle: "Last 24 hours",
        icon: <CheckCircle className="w-8 h-8" />,
      },
      {
        id: "active-team",
        title: "Active Team",
        value: teamMembers.length.toString(),
        subtitle: `${unreadAlerts} unread alerts`,
        icon: <Users className="w-8 h-8" />,
      },
    ];

    return metrics;
  }, [alerts, dashboardData, teamMembers]);

  const responseTrendData = useMemo<ResponseTrendDatum[]>(() => {
    // Si hay datos reales, usarlos
    if (dashboardData?.recentMetrics?.length) {
      return dashboardData.recentMetrics.slice(-7).map((metric) => {
        const date = new Date(metric.date);
        const label = Number.isNaN(date.getTime())
          ? metric.date
          : date.toLocaleDateString("es-MX", { weekday: "short" });

        return {
          label,
          firstReplyMinutes: Math.round(metric.avgFirstReplyTimeMinutes ?? 0),
          resolutionRate: Math.round(metric.resolutionRate ?? 0),
          targetMinutes: firstReplyGoalMinutesTotal || undefined,
        };
      });
    }

    // Datos de ejemplo si no hay datos reales
    return [
      { label: "Lun", firstReplyMinutes: 145, resolutionMinutes: 480, resolutionRate: 87, targetMinutes: 120 },
      { label: "Mar", firstReplyMinutes: 132, resolutionMinutes: 425, resolutionRate: 89, targetMinutes: 120 },
      { label: "Mié", firstReplyMinutes: 158, resolutionMinutes: 510, resolutionRate: 85, targetMinutes: 120 },
      { label: "Jue", firstReplyMinutes: 125, resolutionMinutes: 390, resolutionRate: 91, targetMinutes: 120 },
      { label: "Vie", firstReplyMinutes: 135, resolutionMinutes: 465, resolutionRate: 88, targetMinutes: 120 },
      { label: "Sáb", firstReplyMinutes: 98, resolutionMinutes: 320, resolutionRate: 94, targetMinutes: 120 },
      { label: "Dom", firstReplyMinutes: 105, resolutionMinutes: 340, resolutionRate: 93, targetMinutes: 120 },
    ];
  }, [dashboardData?.recentMetrics, firstReplyGoalMinutesTotal]);

  const agentPerformanceData = useMemo<AgentPerformanceDatum[]>(() => {
    // Si hay datos reales de equipo, usarlos
    if (teamPerformance?.length) {
      return teamPerformance.map((member) => {
        const avgFirstReply = Math.round(
          member.metrics.avgReplyTimeMinutes ?? dashboardData?.avgReplyTimeMinutes ?? 0
        );
        const resolutionMinutes = Math.max(
          avgFirstReply,
          Math.round(
            (member.metrics.avgReplyTimeMinutes ?? 0) *
            (100 / Math.max(member.metrics.resolutionRate || 50, 1))
          )
        );

        return {
          agent: member.name,
          tickets: member.metrics.totalAssigned ?? 0,
          avgFirstReplyMinutes: avgFirstReply,
          avgResolutionMinutes: resolutionMinutes,
          satisfactionPercentage: Math.round(member.metrics.resolutionRate ?? 0),
        };
      });
    }

    // Datos de ejemplo si no hay equipo configurado
    return [
      { agent: "Carlos R.", tickets: 45, avgFirstReplyMinutes: 125, avgResolutionMinutes: 380, satisfactionPercentage: 96 },
      { agent: "Laura S.", tickets: 38, avgFirstReplyMinutes: 142, avgResolutionMinutes: 420, satisfactionPercentage: 94 },
      { agent: "Ana M.", tickets: 32, avgFirstReplyMinutes: 158, avgResolutionMinutes: 495, satisfactionPercentage: 92 },
      { agent: "Juan P.", tickets: 28, avgFirstReplyMinutes: 135, avgResolutionMinutes: 445, satisfactionPercentage: 95 },
    ];
  }, [teamPerformance, dashboardData?.avgReplyTimeMinutes]);

  const slaComplianceData = useMemo<SlaComplianceDatum[]>(() => {
    if (!dashboardData) return [];

    const totalEmails = Math.max(dashboardData.totalEmails ?? 0, 1);
    const withinSla = Math.max(
      totalEmails - (dashboardData.overdueEmails ?? 0),
      0
    );
    const compliance = Math.min(
      100,
      Math.round((withinSla / totalEmails) * 100)
    );

    const slaEntries = slaSettings.slice(0, 3);

    if (!slaEntries.length) {
      return [
        {
          category: "Primera respuesta",
          met: compliance,
          breached: 100 - compliance,
        },
        {
          category: "Resolución",
          met: Math.max(compliance - 8, 0),
          breached: Math.min(100 - compliance + 8, 100),
        },
        {
          category: "Actualización",
          met: Math.max(compliance - 4, 0),
          breached: Math.min(100 - compliance + 4, 100),
        },
      ];
    }

    return slaEntries.map((sla, index) => ({
      category: sla.name || `SLA ${index + 1}`,
      met: compliance,
      breached: 100 - compliance,
    }));
  }, [dashboardData, slaSettings]);

  const conversationsPerDay = useMemo(() => {
    if (!dashboardData?.recentMetrics?.length) {
      return emails.length / 7 || null;
    }
    const total = dashboardData.recentMetrics.reduce(
      (acc, metric) => acc + (metric.avgFirstReplyTimeMinutes ? 1 : 0),
      0
    );
    const avg = total / dashboardData.recentMetrics.length;
    return Number.isFinite(avg) ? avg : null;
  }, [dashboardData?.recentMetrics, emails.length]);

  const statusLabels: Record<string, string> = {
    new: "Nuevo",
    pending: "Pendiente",
    replied: "Respondido",
    resolved: "Resuelto",
    overdue: "Vencido",
    closed: "Cerrado",
  };

  const priorityLabels: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  };

  const ticketRows = useMemo<TicketRow[]>(() => {
    return filteredEmails.map((email) => {
      const assignee =
        teamMembers.find((member) => member.id === email.assignedTo)?.name ??
        null;
      const initials = assignee
        ? assignee
          .split(" ")
          .filter(Boolean)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
        : null;

      const firstReplyMinutes = diffInMinutes(
        email.receivedAt,
        email.firstReplyAt
      );

      return {
        id: `TKT-${String(email.id).padStart(4, "0")}`,
        subject: email.subject ?? "Sin asunto",
        customerName: email.senderEmail?.split("@")[0] ?? "Cliente",
        customerEmail: email.senderEmail ?? "—",
        status: email.status ?? "pending",
        statusLabel:
          statusLabels[email.status as keyof typeof statusLabels] ??
          email.status ??
          "Pendiente",
        priority: email.priority ?? "medium",
        priorityLabel:
          priorityLabels[email.priority as keyof typeof priorityLabels] ??
          email.priority ??
          "Media",
        assigneeName: assignee,
        assigneeInitials: initials,
        firstResponse:
          firstReplyMinutes != null ? formatTime(firstReplyMinutes) : null,
        resolutionTime: null,
        createdAtLabel: formatRelativeTime(email.receivedAt),
        updatedAtLabel: formatRelativeTime(email.firstReplyAt),
        category: email.category,
        sentiment: email.sentiment,
      };
    });
  }, [filteredEmails, teamMembers]);

  const handleEmailUpdate = () => {
    fetchDashboardData(false); // Silent refresh
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error("Error signing out");
    } else {
      router.push("/");
    }
  };

  if (isPending || (isLoading && !isPolling)) {
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
      <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#141414]/95 backdrop-blur">
          <ZendeskHeader
            userName={session.user.name}
            userEmail={session.user.email}
            onAddMailbox={() => {
              setActiveConfigSection('email-providers');
              handleSectionClick('configuration');
            }}
            onSignOut={handleSignOut}
            onOpenBilling={() => handleSectionClick('settings')}
            trialEndsAtLabel={null}
            themeToggleSlot={<ThemeToggle />}
            extraActions={<NotificationDropdown />}
            onOpenMenu={() => {
              const mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
              }
            }}
          />
        </header>
        <div className="flex flex-1 w-full overflow-hidden min-h-0">
          <aside className="hidden lg:block w-72 border-r border-white/10 bg-[#080812]">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
              <ZendeskSidebar
                activeView={activeView}
                onViewChange={handleSectionClick}
                userName={session.user.name}
                userEmail={session.user.email}
                showAlerts={alerts.length > 0}
              />
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-h-0">
            <div
              id="mobile-menu"
              className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 hidden bg-[#05040b]/95 backdrop-blur-sm"
            >
              <div className="h-full overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Menú</h2>
                  <button
                    onClick={() => {
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="px-4 py-4 space-y-2">
                  <button
                    onClick={() => {
                      handleSectionClick('dashboard');
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${activeView === 'dashboard'
                      ? 'bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <BarChart3 size={20} />
                    <span className="font-medium">Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSectionClick('tickets');
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${activeView === 'tickets'
                      ? 'bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <Mail size={20} />
                    <span className="font-medium">Tickets</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSectionClick('performance');
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${activeView === 'performance'
                      ? 'bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <BarChart3 size={20} />
                    <span className="font-medium">Performance</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSectionClick('sla');
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${activeView === 'sla'
                      ? 'bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <Clock size={20} />
                    <span className="font-medium">SLA</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSectionClick('alerts');
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${activeView === 'alerts'
                      ? 'bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <Bell size={20} />
                    <span className="font-medium">Alerts</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSectionClick('agents');
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${activeView === 'agents'
                      ? 'bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <Users size={20} />
                    <span className="font-medium">Equipo</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSectionClick('configuration');
                      setActiveConfigSection('templates');
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${activeView === 'configuration'
                      ? 'bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <Settings size={20} />
                    <span className="font-medium">Configuración</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSectionClick('settings');
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${activeView === 'settings'
                      ? 'bg-violet-600/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <Settings size={20} />
                    <span className="font-medium">Cuenta</span>
                  </button>
                </div>
              </div>
            </div>

            <main className="flex-1 w-full mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 overflow-y-auto min-h-0">
              <div className="lg:hidden mb-6">
                <p className="text-xs uppercase tracking-wide text-violet-300">Sección actual</p>
                <h1 className="text-2xl font-semibold">
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h1>
              </div>
              {activeView === 'dashboard' && (
                <div className="space-y-8">
                  <ZendeskDashboardMetrics metrics={dashboardMetrics} />
                  <ZendeskResponseTimeAnalytics
                    trendData={responseTrendData}
                    agentPerformance={agentPerformanceData}
                    slaCompliance={slaComplianceData}
                  />
                  <div className="rounded-lg border border-white/10 bg-[#18181b] p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Herramientas avanzadas
                        </h3>
                        <p className="text-sm text-gray-400">
                          Accede temporalmente a la vista anterior mientras completamos la migración.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowLegacyDashboard((prev) => !prev)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        {showLegacyDashboard ? "Ocultar vista anterior" : "Mostrar vista anterior"}
                      </Button>
                    </div>
                    {showLegacyDashboard && (
                      <div className="mt-6 space-y-6">
                        <OptimizedDashboard
                          emails={emails}
                          teamMembers={teamMembers}
                          searchTerm={searchTerm}
                          statusFilter={statusFilter}
                          priorityFilter={priorityFilter}
                          onSearchChange={setSearchTerm}
                          onStatusChange={setStatusFilter}
                          onPriorityChange={setPriorityFilter}
                          onClearFilters={handleClearFilters}
                          onApplyFilters={() => fetchDashboardData(true)}
                          onViewEmail={handleViewEmail}
                          onReplyEmail={handleOpenReply}
                          onMarkResolved={handleMarkResolved}
                          onAssignEmail={handleAssignEmail}
                          onAutoAssign={handleAutoAssignEmail}
                          onBulkAutoAssign={handleBulkAutoAssign}
                          isAutoAssigning={isAutoAssigning}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeView === 'sla' && (
                <div className="space-y-6">
                  <ZendeskSLASection
                    complianceData={slaComplianceData}
                    conversationsPerDay={conversationsPerDay ?? undefined}
                  />
                  <div className="rounded-lg border border-white/10 bg-[#18181b] p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Configuración de SLA</h3>
                      <p className="text-sm text-gray-400">
                        Ajusta tus objetivos y reglas de SLA para sincronizar esta vista con tu operación real.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setActiveConfigSection('sla');
                        handleSectionClick('configuration');
                      }}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      Gestionar SLA
                    </Button>
                  </div>
                </div>
              )}

              {activeView === 'tickets' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">Tickets</h2>
                      <p className="text-sm text-gray-400">
                        Mostrando {ticketRows.length} tickets activos
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Buscar por asunto o correo"
                          className="bg-[#18181b] border-white/10 text-white sm:w-60"
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="bg-[#18181b] border-white/10 text-white sm:w-44">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#18181b] border-white/10 text-white">
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="pending">Pendientes</SelectItem>
                            <SelectItem value="replied">Respondidos</SelectItem>
                            <SelectItem value="overdue">Vencidos</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger className="bg-[#18181b] border-white/10 text-white sm:w-44">
                            <SelectValue placeholder="Prioridad" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#18181b] border-white/10 text-white">
                            <SelectItem value="all">Todas las prioridades</SelectItem>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={handleClearFilters}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Limpiar
                        </Button>
                        <Button onClick={() => fetchDashboardData(true)} className="bg-violet-600 hover:bg-violet-700">
                          Actualizar datos
                        </Button>
                      </div>
                    </div>
                  </div>

                  <ZendeskTicketsTable
                    tickets={ticketRows}
                    onSelect={handleOpenTicketDetail}
                    emptyMessage="No se encontraron tickets con los filtros seleccionados."
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleBulkAutoAssign}
                      disabled={isAutoAssigning}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      {isAutoAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Autoasignar pendientes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRebalanceWorkload}
                      disabled={isRebalancing}
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      {isRebalancing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Rebalancear carga
                    </Button>
                  </div>

                  <div className="rounded-lg border border-dashed border-white/10 bg-[#12111a] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-200">
                          Vista avanzada (temporal)
                        </h4>
                        <p className="text-xs text-gray-500">
                          Incluye todas las herramientas existentes mientras migramos al nuevo diseño.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLegacyTickets((prev) => !prev)}
                        className="text-white hover:bg-white/10"
                      >
                        {showLegacyTickets ? "Ocultar herramientas" : "Mostrar herramientas"}
                      </Button>
                    </div>
                    {showLegacyTickets && (
                      <div className="mt-4">
                        <TicketsSection showHeader={false} onTicketSelect={handleOpenTicketDetail} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeView === 'performance' && dashboardData && (
                <div className="space-y-6 dark">
                  <ZendeskResponseTimeAnalytics
                    trendData={responseTrendData}
                    agentPerformance={agentPerformanceData}
                    slaCompliance={slaComplianceData}
                  />
                  {/* BI Tools Integration Section */}
                  <div className="rounded-lg border border-white/10 bg-[#18181b] p-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* PowerBI */}
                      <button
                        onClick={() => window.open('/api/v1/analytics/export?format=powerbi&dateRange=last_30_days&metrics=all', '_blank')}
                        className="rounded-lg border border-white/10 bg-[#18181b] p-4 text-left transition-colors hover:border-primary/40"
                      >
                        <div className="mb-1 flex items-center gap-2 text-foreground">
                          <BarChart3 size={20} className="text-primary" />
                          <span className="font-semibold">PowerBI</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Export for PowerBI</span>
                      </button>

                      {/* Tableau */}
                      <button
                        onClick={() => window.open('/api/v1/analytics/export?format=json&dateRange=last_30_days&metrics=all', '_blank')}
                        className="rounded-lg border border-white/10 bg-[#18181b] p-4 text-left transition-colors hover:border-primary/40"
                      >
                        <div className="mb-1 flex items-center gap-2 text-foreground">
                          <Database size={20} className="text-primary" />
                          <span className="font-semibold">Tableau</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Export for Tableau</span>
                      </button>

                      {/* Looker */}
                      <button
                        onClick={() => window.open('/api/v1/analytics/export?format=json&dateRange=last_30_days&metrics=all', '_blank')}
                        className="rounded-lg border border-white/10 bg-[#18181b] p-4 text-left transition-colors hover:border-primary/40"
                      >
                        <div className="mb-1 flex items-center gap-2 text-foreground">
                          <TrendingUp size={20} className="text-primary" />
                          <span className="font-semibold">Looker</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Export for Looker</span>
                      </button>

                      {/* CSV/Excel */}
                      <button
                        onClick={() => window.open('/api/v1/analytics/export?format=csv&dateRange=last_30_days&metrics=all', '_blank')}
                        className="rounded-lg border border-white/10 bg-[#18181b] p-4 text-left transition-colors hover:border-primary/40"
                      >
                        <div className="mb-1 flex items-center gap-2 text-foreground">
                          <FileSpreadsheet size={20} className="text-primary" />
                          <span className="font-semibold">CSV / Excel</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Download CSV</span>
                      </button>
                    </div>

                    {/* Additional Export Options */}
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => window.open('/api/reports/export?type=emails', '_blank')}
                          size="sm"
                          variant="outline"
                        >
                          <Mail size={14} className="mr-1" />
                          Emails
                        </Button>
                        <Button
                          onClick={() => window.open('/api/reports/export?type=metrics', '_blank')}
                          size="sm"
                          variant="outline"
                        >
                          <BarChart3 size={14} className="mr-1" />
                          Metrics
                        </Button>
                        <Button
                          onClick={() => window.open('/api/reports/export?type=team', '_blank')}
                          size="sm"
                          variant="outline"
                        >
                          <Users size={14} className="mr-1" />
                          Team
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-white/10 bg-[#18181b] p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Avg Reply Time</p>
                      <p className="text-2xl font-bold text-primary">{formatTime(dashboardData.avgReplyTimeMinutes)}</p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#18181b] p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Resolution Rate</p>
                      <p className="text-2xl font-bold text-primary">{dashboardData.avgResolutionRate.toFixed(1)}%</p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#18181b] p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">High Priority</p>
                      <p className="text-2xl font-bold text-primary">{dashboardData.highPriorityEmails}</p>
                    </div>
                  </div>

                  {/* Performance Goals Tracking - LIVE - MOVED UP */}
                  <div className="rounded-lg border border-white/10 bg-[#18181b] p-4">
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        <span className="text-sm font-semibold text-foreground">Performance Goals</span>
                        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-primary/10 px-2 py-0.5 text-primary">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span>
                          <span className="text-xs font-semibold">LIVE</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-foreground">{lastUpdate.toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {/* Big Number Metrics */}
                    <div className="mb-4 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">First Reply Time</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatTime(dashboardData.recentMetrics.length > 0
                            ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length
                            : 0)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Overall Reply Time</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatTime(dashboardData.avgReplyTimeMinutes || 0)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Time to Close</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatTime((dashboardData.avgReplyTimeMinutes * 1.5) || 0)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.timeToCloseMinutes || 2880)}
                        </p>
                      </div>
                    </div>
                    {/* Progress Bars */}
                    <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">Progress Tracking</h3>
                      <div className="space-y-4">
                        {/* First Reply Bar */}
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">First Reply</span>
                            <span className="font-mono text-sm font-semibold text-foreground">
                              {formatTime(dashboardData.recentMetrics.length > 0
                                ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length
                                : 0)}
                            </span>
                          </div>
                          <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                            <div
                              className="absolute h-full rounded-full bg-primary transition-all duration-500"
                              style={{
                                width: `${Math.min(100, ((dashboardData.recentMetrics.length > 0
                                  ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length
                                  : 0) / (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60)) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                            <span>0h</span>
                            <span className="text-foreground font-medium">Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60)}</span>
                          </div>
                        </div>

                        {/* Overall Reply Bar */}
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Overall Reply</span>
                            <span className="font-mono text-sm font-semibold text-foreground">
                              {formatTime(dashboardData.avgReplyTimeMinutes || 0)}
                            </span>
                          </div>
                          <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                            <div
                              className="absolute h-full rounded-full bg-primary transition-all duration-500"
                              style={{
                                width: `${Math.min(100, ((dashboardData.avgReplyTimeMinutes || 0) / (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480)) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                            <span>0h</span>
                            <span className="text-foreground font-medium">Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">First Reply Status</p>
                        <p className="text-lg font-bold text-primary">
                          {(dashboardData.recentMetrics.length > 0 ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length : 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60) ? '✓ On Track' : '✗ Behind'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Overall Reply Status</p>
                        <p className="text-lg font-bold text-primary">
                          {(dashboardData.avgReplyTimeMinutes || 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480) ? '✓ On Track' : '✗ Behind'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Time to Close Status</p>
                        <p className="text-lg font-bold text-primary">
                          {(dashboardData.avgReplyTimeMinutes * 1.5 || 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.timeToCloseMinutes || 2880) ? '✓ On Track' : '✗ Behind'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Metrics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Reply Time Trend */}
                    <div className="rounded-lg border border-white/10 bg-[#18181b] p-4">
                      <h2 className="mb-4 text-lg font-semibold text-foreground">Reply Time Trend</h2>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dashboardData.recentMetrics}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#9333ea33" />
                          <XAxis
                            dataKey="date"
                            stroke="#a78bfa"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis stroke="#a78bfa" />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: 'var(--card)',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              boxShadow: '0 20px 40px -30px rgba(15, 23, 42, 0.35)',
                              color: 'var(--foreground)',
                            }}
                            labelStyle={{ color: 'var(--muted-foreground)' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                            formatter={(value: number) => [formatTime(value), 'Reply Time']}
                          />
                          <Legend wrapperStyle={{ color: 'var(--muted-foreground)' }} />
                          <Line
                            type="monotone"
                            dataKey="avgFirstReplyTimeMinutes"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            name="Avg Reply Time (min)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Resolution Rate Trend */}
                    <div className="rounded-lg border border-white/10 bg-[#18181b] p-4">
                      <h2 className="mb-4 text-lg font-semibold text-foreground">Resolution Rate Trend</h2>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dashboardData.recentMetrics}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#9333ea33" />
                          <XAxis
                            dataKey="date"
                            stroke="#a78bfa"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis stroke="#a78bfa" />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: 'var(--card)',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              boxShadow: '0 20px 40px -30px rgba(15, 23, 42, 0.35)',
                              color: 'var(--foreground)',
                            }}
                            labelStyle={{ color: 'var(--muted-foreground)' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Resolution Rate']}
                          />
                          <Legend wrapperStyle={{ color: 'var(--muted-foreground)' }} />
                          <Bar
                            dataKey="resolutionRate"
                            fill="#10b981"
                            name="Resolution Rate (%)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'alerts' && (
                <div className="space-y-4">
                  <AlertsList
                    alerts={alerts}
                    isLive={alertsLive}
                    lastEventAt={alertsLastEventAt}
                  />
                </div>
              )}

              {activeView === 'agents' && (
                <div className="space-y-6">
                  {/* Progressive Team Overview - Clean Initial State */}
                  <ProgressiveTeamOverview
                    teamMembers={teamMembers}
                    teamPerformance={teamPerformance}
                    onAddTeamMember={handleAddTeamMember}
                    onDeleteTeamMember={(id) => openDeleteConfirmation('team', id, '')}
                    onViewMemberDetails={(member) => {
                      setSelectedTeamMember(member);
                      setIsTeamMemberModalOpen(true);
                    }}
                    onRebalanceWorkload={handleRebalanceWorkload}
                    isRebalancing={isRebalancing}
                    teamWorkload={teamWorkload}
                  />

                  {/* Compact Leaderboard for Quick Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Leaderboard teamPerformance={teamPerformance} type="resolution" />
                    <Leaderboard teamPerformance={teamPerformance} type="workload" />
                  </div>
                </div>
              )}

              {/* Configuration Section */}
              {activeView === 'configuration' && (
                <div className="space-y-4 dark">

                  {/* Email Providers Section */}
                  {activeConfigSection === 'email-providers' && (
                    <div>
                      {/* Email Provider Integration */}
                      <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Mail size={24} className="text-primary" />
                            Email Provider Integration
                          </h2>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleConnectProvider('gmail')}
                              className="bg-neutral-800 hover:bg-neutral-700 text-white"
                            >
                              <Plus size={16} className="mr-2" />
                              Connect Gmail
                            </Button>
                            <Button
                              onClick={() => handleConnectProvider('outlook')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus size={16} className="mr-2" />
                              Connect Outlook
                            </Button>
                          </div>
                        </div>

                        {emailProviders.length > 0 ? (
                          <div className="space-y-3">
                            {emailProviders.map((provider) => (
                              <div key={provider.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${provider.provider === 'gmail' ? 'bg-red-600/20' : 'bg-blue-600/20'
                                      }`}>
                                      <Mail className={provider.provider === 'gmail' ? 'text-red-400' : 'text-blue-400'} size={24} />
                                    </div>
                                    <div>
                                      <h3 className="text-foreground font-semibold capitalize">{provider.provider}</h3>
                                      <p className="text-muted-foreground text-sm">{provider.email}</p>
                                      {provider.lastSyncAt && (
                                        <p className="text-muted-foreground text-xs mt-1">
                                          Last synced: {new Date(provider.lastSyncAt).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                                      {provider.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleViewProviderStatus(provider)}
                                      variant="outline"
                                      className="bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                      <Eye size={14} className="mr-2" />
                                      Status
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSyncProvider(provider.id)}
                                      disabled={isSyncing || !provider.isActive}
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                      <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                      {isSyncing ? 'Scanning emails...' : 'Sync Now'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDisconnectProvider(provider.id)}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Mail className="text-primary mx-auto mb-4" size={48} />
                            <p className="text-foreground mb-4">No email providers connected yet</p>
                            <p className="text-muted-foreground text-sm">Connect Gmail or Outlook to sync your emails automatically</p>
                          </div>
                        )}
                      </div>

                      {/* Sync Logs */}
                      {syncLogs.length > 0 && (
                        <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                          <h2 className="text-xl font-bold text-foreground mb-4">
                            {selectedProvider ? `Sync History - ${selectedProvider.email}` : 'Recent Sync History'}
                          </h2>
                          <div className="space-y-3">
                            {syncLogs.map((log) => (
                              <div key={log.id} className={`rounded-lg border border-white/10 bg-white/5 p-4 ${log.syncStatus === 'success' ? 'border-green-500/30' :
                                log.syncStatus === 'failed' ? 'border-red-500/30' :
                                  'border-yellow-500/30'
                                }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${log.syncStatus === 'success' ? 'bg-green-600/20' :
                                      log.syncStatus === 'failed' ? 'bg-red-600/20' :
                                        'bg-yellow-600/20'
                                      }`}>
                                      {log.syncStatus === 'success' ? (
                                        <CheckCircle className="text-green-400" size={20} />
                                      ) : log.syncStatus === 'failed' ? (
                                        <XCircle className="text-red-400" size={20} />
                                      ) : (
                                        <RefreshCw className="text-yellow-400 animate-spin" size={20} />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-foreground font-semibold capitalize">{log.syncStatus}</p>
                                      <p className="text-muted-foreground text-sm">
                                        {log.emailsProcessed} emails processed
                                      </p>
                                      {log.errorMessage && (
                                        <p className="text-red-400 text-xs mt-1">{log.errorMessage}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-muted-foreground text-sm">
                                      {new Date(log.startedAt).toLocaleString()}
                                    </p>
                                    {log.completedAt && (
                                      <p className="text-muted-foreground text-xs">
                                        Duration: {Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)}s
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clear Emails Section */}
                      <div className="rounded-lg border border-red-500/20 bg-[#18181b] p-5">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                          <AlertCircle size={24} className="text-red-500" />
                          Email Management
                        </h2>
                        <div className="space-y-4">
                          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-sm text-muted-foreground mb-3">
                              <strong className="text-red-600 dark:text-red-400">Warning:</strong> This will permanently delete all synced emails from the database.
                              You'll need to sync again to re-download them with full content.
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                              Use this if your emails don't have content (showing "body_content" text).
                              After clearing, sync again to get emails with full message content.
                            </p>
                            <Button
                              onClick={async () => {
                                if (!confirm('Are you sure you want to delete ALL emails? This cannot be undone.')) {
                                  return;
                                }
                                try {
                                  const token = localStorage.getItem("bearer_token");
                                  const response = await fetch('/api/emails/clear', {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  if (response.ok) {
                                    toast.success('All emails cleared. Sync now to get emails with content!');
                                    fetchDashboardData(false);
                                  } else {
                                    throw new Error('Failed to clear emails');
                                  }
                                } catch (error) {
                                  toast.error('Failed to clear emails');
                                }
                              }}
                              variant="destructive"
                              className="w-full md:w-auto"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Clear All Emails
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Account Information */}
                      <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                        <h2 className="text-xl font-bold text-foreground mb-6">Account Information</h2>
                        <div className="space-y-3">
                          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-muted-foreground text-sm">Name</p>
                            <p className="text-foreground font-medium">{session.user.name || 'Not set'}</p>
                          </div>
                          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-muted-foreground text-sm">Email</p>
                            <p className="text-foreground font-medium">{session.user.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLA & Compliance Section */}
                  {activeConfigSection === 'sla' && (
                    <div>
                      {/* SLA Settings */}
                      <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                          <Clock size={24} className="text-primary" />
                          SLA Configuration
                        </h2>

                        {/* Create New SLA */}
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6">
                          <h3 className="text-foreground font-semibold mb-4">Create New SLA Setting</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                              placeholder="SLA Name (e.g., VIP Support)"
                              value={newSlaName}
                              onChange={(e) => setNewSlaName(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                            <Input
                              type="number"
                              placeholder="Target Time (minutes)"
                              value={newSlaTime}
                              onChange={(e) => setNewSlaTime(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                            <Select value={newSlaPriority} onValueChange={setNewSlaPriority}>
                              <SelectTrigger className="bg-black/40 border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High Priority</SelectItem>
                                <SelectItem value="medium">Medium Priority</SelectItem>
                                <SelectItem value="low">Low Priority</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button onClick={handleCreateSLA} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              <CheckCircle size={16} className="mr-2" />
                              Create SLA
                            </Button>
                          </div>
                        </div>

                        {/* Existing SLA Settings */}
                        <div className="space-y-3">
                          <h3 className="text-foreground font-semibold mb-3">Existing SLA Settings</h3>
                          {slaSettings.length > 0 ? (
                            slaSettings.map((sla) => (
                              <div key={sla.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-foreground font-semibold">{sla.name}</h4>
                                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                      <span>Target: {formatTime(sla.targetReplyTimeMinutes)}</span>
                                      <span className={`px-2 py-1 rounded ${getPriorityColor(sla.priorityLevel)}`}>
                                        {sla.priorityLevel}
                                      </span>
                                      <span className="text-primary">
                                        {sla.isActive ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteSLA(sla.id, sla.name)}
                                  >
                                    <XCircle size={16} />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-center py-8">No SLA settings configured yet. Create your first one above!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Templates Section */}
                  {activeConfigSection === 'templates' && (
                    <div>
                      {/* Reply Templates */}
                      <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                          <Send size={24} className="text-primary" />
                          Reply Templates
                        </h2>

                        {/* Create Template Form */}
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6">
                          <h3 className="text-foreground font-semibold mb-4">Create New Template</h3>
                          <div className="space-y-3">
                            <Input
                              placeholder="Template Name (e.g., Welcome Email)"
                              value={newTemplateName}
                              onChange={(e) => setNewTemplateName(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                            <Input
                              placeholder="Subject (optional)"
                              value={newTemplateSubject}
                              onChange={(e) => setNewTemplateSubject(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                            <Textarea
                              placeholder="Template Content..."
                              value={newTemplateContent}
                              onChange={(e) => setNewTemplateContent(e.target.value)}
                              className="bg-black/40 border-white/10 min-h-[100px]"
                            />
                            <div className="flex gap-3">
                              <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                                <SelectTrigger className="w-40 bg-[#18181b] border-white/10">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="support">Support</SelectItem>
                                  <SelectItem value="sales">Sales</SelectItem>
                                  <SelectItem value="followup">Follow-up</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={handleCreateTemplate}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                <Plus size={16} className="mr-2" />
                                Create Template
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Templates List */}
                        {replyTemplates.length > 0 ? (
                          <div className="space-y-3">
                            {replyTemplates.map((template) => (
                              <div key={template.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-foreground font-semibold">{template.name}</h3>
                                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                                        {template.category}
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        Used {template.usageCount} times
                                      </span>
                                    </div>
                                    {template.subject && (
                                      <p className="text-foreground text-sm mb-2">Subject: {template.subject}</p>
                                    )}
                                    <p className="text-muted-foreground text-sm line-clamp-2">{template.content}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openDeleteConfirmation('template', template.id, template.name)}
                                    className="ml-4"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Send className="text-primary mx-auto mb-4" size={48} />
                            <p className="text-foreground mb-2">No templates created yet</p>
                            <p className="text-muted-foreground text-sm">Create templates to respond to emails faster</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Performance Goals Section */}
                  {activeConfigSection === 'performance-goals' && (
                    <div>
                      {/* Performance Goals */}
                      <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                          <TrendingUp size={24} className="text-primary" />
                          Performance Goals
                        </h2>

                        {/* Channel Selector */}
                        <div className="mb-6">
                          <label className="text-foreground text-sm mb-2 block font-medium">Channel</label>
                          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                            <SelectTrigger className="w-48 bg-[#18181b] border-white/10">
                              <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">📧 Email</SelectItem>
                              <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                              <SelectItem value="telegram">✈️ Telegram</SelectItem>
                              <SelectItem value="messenger">💬 Messenger</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Goals Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          {/* First Reply Time Goal */}
                          <div className="rounded-lg border-2 border-white/10 bg-white/5 p-5">
                            <h3 className="text-foreground font-semibold mb-3">First Reply Time Goal</h3>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={firstReplyGoalHours}
                                onChange={(e) => setFirstReplyGoalHours(e.target.value)}
                                className="w-20 bg-black/40 border-white/10 text-center font-semibold text-lg"
                                placeholder="00"
                              />
                              <span className="text-muted-foreground">:</span>
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                value={firstReplyGoalMinutes}
                                onChange={(e) => setFirstReplyGoalMinutes(e.target.value)}
                                className="w-20 bg-black/40 border-white/10 text-center font-semibold text-lg"
                                placeholder="00"
                              />
                            </div>
                            <p className="text-muted-foreground text-xs mt-2">Hours : Minutes</p>
                          </div>

                          {/* Overall Reply Time Goal */}
                          <div className="rounded-lg border-2 border-white/10 bg-white/5 p-5">
                            <h3 className="text-foreground font-semibold mb-3">Overall Reply Time Goal</h3>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={overallReplyGoalHours}
                                onChange={(e) => setOverallReplyGoalHours(e.target.value)}
                                className="w-20 bg-black/40 border-white/10 text-center font-semibold text-lg"
                                placeholder="00"
                              />
                              <span className="text-muted-foreground">:</span>
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                value={overallReplyGoalMinutes}
                                onChange={(e) => setOverallReplyGoalMinutes(e.target.value)}
                                className="w-20 bg-black/40 border-white/10 text-center font-semibold text-lg"
                                placeholder="00"
                              />
                            </div>
                            <p className="text-muted-foreground text-xs mt-2">Hours : Minutes</p>
                          </div>

                          {/* Time To Close Goal */}
                          <div className="rounded-lg border-2 border-white/10 bg-white/5 p-5">
                            <h3 className="text-foreground font-semibold mb-3">Time To Close Goal</h3>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={timeToCloseGoalHours}
                                onChange={(e) => setTimeToCloseGoalHours(e.target.value)}
                                className="w-20 bg-black/40 border-white/10 text-center font-semibold text-lg"
                                placeholder="00"
                              />
                              <span className="text-muted-foreground">:</span>
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                value={timeToCloseGoalMinutes}
                                onChange={(e) => setTimeToCloseGoalMinutes(e.target.value)}
                                className="w-20 bg-black/40 border-white/10 text-center font-semibold text-lg"
                                placeholder="00"
                              />
                            </div>
                            <p className="text-muted-foreground text-xs mt-2">Hours : Minutes</p>
                          </div>
                        </div>

                        <Button
                          onClick={handleSavePerformanceGoals}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground mb-6"
                        >
                          💾 Save Goals
                        </Button>

                        {/* Time Bands Section */}
                        <div className="border-t border-white/10 pt-6 mt-6">
                          <h3 className="text-foreground font-semibold mb-4">Time Bands</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            In addition to reply time goals, you can optionally also set reply time "bands". If they aren't set, we will use sensible defaults for your reporting.
                          </p>

                          {/* Existing Time Bands */}
                          {performanceGoals.bands.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {performanceGoals.bands.map((band: any) => (
                                <div key={band.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                                  <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                                      {band.bandType === 'first_reply' ? 'First Reply' : band.bandType === 'overall_reply' ? 'Overall Reply' : 'Time to Close'}
                                    </span>
                                    <span className="text-foreground">{band.label}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteTimeBand(band.id)}
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add New Time Band */}
                          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                              <div>
                                <label className="text-foreground text-xs mb-1 block font-medium">Band Type</label>
                                <Select value={newBandType} onValueChange={setNewBandType}>
                                  <SelectTrigger className="bg-black/40 border-white/10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="first_reply">First Reply</SelectItem>
                                    <SelectItem value="overall_reply">Overall Reply</SelectItem>
                                    <SelectItem value="time_to_close">Time to Close</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-foreground text-xs mb-1 block font-medium">Min Time (HH:MM)</label>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={newBandMinHours}
                                    onChange={(e) => setNewBandMinHours(e.target.value)}
                                    className="w-16 bg-black/40 border-white/10 text-center font-semibold text-base"
                                    placeholder="00"
                                  />
                                  <span className="text-muted-foreground text-sm">:</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={newBandMinMinutes}
                                    onChange={(e) => setNewBandMinMinutes(e.target.value)}
                                    className="w-16 bg-black/40 border-white/10 text-center font-semibold text-base"
                                    placeholder="00"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-foreground text-xs mb-1 block font-medium">Max Time (HH:MM)</label>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={newBandMaxHours}
                                    onChange={(e) => setNewBandMaxHours(e.target.value)}
                                    className="w-16 bg-black/40 border-white/10 text-center font-semibold text-base"
                                    placeholder="00"
                                  />
                                  <span className="text-muted-foreground text-sm">:</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={newBandMaxMinutes}
                                    onChange={(e) => setNewBandMaxMinutes(e.target.value)}
                                    className="w-16 bg-black/40 border-white/10 text-center font-semibold text-base"
                                    placeholder="00"
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={handleAddTimeBand}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webhooks Section */}
                  {activeConfigSection === 'webhooks' && (
                    <div>
                      {/* Webhooks */}
                      <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                          <Database size={24} className="text-primary" />
                          Outgoing Webhooks
                        </h2>

                        {/* Create Webhook */}
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6">
                          <h3 className="text-foreground font-semibold mb-4">Create New Webhook</h3>
                          <div className="space-y-3">
                            <Input
                              placeholder="Webhook URL (e.g., https://your-app.com/webhook)"
                              value={newWebhookUrl}
                              onChange={(e) => setNewWebhookUrl(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                            <div>
                              <p className="text-foreground text-sm mb-2 font-medium">Select Events:</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {['email.received', 'email.replied', 'email.assigned', 'email.resolved', 'sla.warning', 'sla.breached'].map((event) => (
                                  <label key={event} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-muted/40 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={selectedWebhookEvents.includes(event)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedWebhookEvents([...selectedWebhookEvents, event]);
                                        } else {
                                          setSelectedWebhookEvents(selectedWebhookEvents.filter(ev => ev !== event));
                                        }
                                      }}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-foreground text-sm">{event}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={handleCreateWebhook}
                              disabled={isCreatingWebhook}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              {isCreatingWebhook ? (
                                <>
                                  <RefreshCw size={16} className="mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus size={16} className="mr-2" />
                                  Create Webhook
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Webhooks List */}
                        {webhooks.length > 0 ? (
                          <div className="space-y-3">
                            <h3 className="text-foreground font-semibold mb-3">Active Webhooks</h3>
                            {webhooks.map((webhook) => (
                              <div key={webhook.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-foreground font-semibold mb-1">{webhook.url}</p>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {(() => {
                                        try {
                                          const events = typeof webhook.events === 'string'
                                            ? JSON.parse(webhook.events)
                                            : webhook.events;
                                          return events.map((event: string) => (
                                            <span key={event} className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                                              {event}
                                            </span>
                                          ));
                                        } catch (e) {
                                          return <span className="text-red-400 text-xs">Invalid events data</span>;
                                        }
                                      })()}
                                    </div>
                                    <div className="flex gap-4 text-xs text-muted-foreground">
                                      <span>Status: <span className="text-primary">{webhook.isActive ? 'Active' : 'Inactive'}</span></span>
                                      {webhook.lastTriggeredAt && (
                                        <span>Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}</span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openDeleteConfirmation('webhook', webhook.id, webhook.url)}
                                    className="ml-4"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Database className="text-primary mx-auto mb-4" size={48} />
                            <p className="text-foreground mb-2">No webhooks configured</p>
                            <p className="text-muted-foreground text-sm">Create a webhook to receive real-time notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Business Hours Section */}
                  {activeConfigSection === 'business-hours' && (
                    <div>
                      <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                          <Clock size={24} className="text-primary" />
                          Business Hours Configuration
                        </h2>

                        <div className="space-y-3 mb-6">
                          {Object.entries(businessHours).map(([day, hours]) => (
                            <div key={day} className="rounded-lg border border-white/10 bg-white/5 p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={hours.enabled}
                                    onChange={(e) => setBusinessHours({
                                      ...businessHours,
                                      [day]: { ...hours, enabled: e.target.checked }
                                    })}
                                    className="w-5 h-5"
                                  />
                                  <span className="text-foreground font-semibold capitalize w-24">{day}</span>
                                  {hours.enabled && (
                                    <div className="flex gap-3 items-center">
                                      <Input
                                        type="time"
                                        value={hours.start}
                                        onChange={(e) => setBusinessHours({
                                          ...businessHours,
                                          [day]: { ...hours, start: e.target.value }
                                        })}
                                        className="w-32 bg-black/40 border-white/10"
                                      />
                                      <span className="text-muted-foreground">to</span>
                                      <Input
                                        type="time"
                                        value={hours.end}
                                        onChange={(e) => setBusinessHours({
                                          ...businessHours,
                                          [day]: { ...hours, end: e.target.value }
                                        })}
                                        className="w-32 bg-black/40 border-white/10"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-white/10 pt-6">
                          <h3 className="text-foreground font-semibold mb-4">Holidays</h3>
                          <div className="flex gap-3 mb-4">
                            <Input
                              type="date"
                              value={newHoliday}
                              onChange={(e) => setNewHoliday(e.target.value)}
                              className="flex-1 bg-[#18181b] border-white/10"
                            />
                            <Button
                              onClick={handleAddHoliday}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <Plus size={16} className="mr-2" />
                              Add Holiday
                            </Button>
                          </div>
                          {holidays.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {holidays.map((date) => (
                                <div key={date} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
                                  <span className="text-foreground text-sm">{new Date(date).toLocaleDateString()}</span>
                                  <button
                                    onClick={() => handleRemoveHoliday(date)}
                                    className="text-primary hover:text-primary/80"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Tiers Section */}
                  {activeConfigSection === 'customer-tiers' && (
                    <div>
                      <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                          <Users size={24} className="text-primary" />
                          Customer Tier Management
                        </h2>

                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6">
                          <h3 className="text-foreground font-semibold mb-4">Add Customer to Tier</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Input
                              placeholder="Customer Email"
                              value={newTierEmail}
                              onChange={(e) => setNewTierEmail(e.target.value)}
                              className="bg-[#18181b] border-white/10"
                            />
                            <Select value={newTierLevel} onValueChange={(value: any) => setNewTierLevel(value)}>
                              <SelectTrigger className="bg-[#18181b] border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="SLA (minutes)"
                              value={newTierSlaMinutes}
                              onChange={(e) => setNewTierSlaMinutes(e.target.value)}
                              className="bg-[#18181b] border-white/10"
                            />
                            <Button
                              onClick={handleAddCustomerTier}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <Plus size={16} className="mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>

                        {customerTiers.length > 0 ? (
                          <div className="space-y-3">
                            <h3 className="text-foreground font-semibold mb-3">Customer Tiers</h3>
                            {customerTiers.map((tier) => (
                              <div key={tier.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-foreground font-semibold">{tier.email}</p>
                                    <div className="flex gap-3 mt-2 text-sm">
                                      <span className="px-3 py-1 rounded-full font-semibold bg-primary/20 text-primary">
                                        {tier.tier.toUpperCase()}
                                      </span>
                                      <span className="text-muted-foreground">SLA: {formatTime(tier.slaMinutes)}</span>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openDeleteConfirmation('tier', tier.id, tier.email)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users className="text-primary mx-auto mb-4" size={48} />
                            <p className="text-foreground mb-2">No customer tiers configured</p>
                            <p className="text-muted-foreground text-sm">Add customers to tiers for priority SLA handling</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Section - Using SettingsContent component */}
              {activeView === 'settings' && (
                <div className="dark">
                  <SettingsContent session={session} />
                </div>
              )}
            </main>

            {/* Email Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent className="max-w-4xl bg-slate-900/95 border-slate-700/50 text-white max-h-[85vh] overflow-y-auto shadow-2xl backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Mail className="text-blue-400" size={24} />
                    Email Details
                  </DialogTitle>
                </DialogHeader>
                {selectedEmail && (
                  <div className="space-y-6">
                    {/* Email Content - Primero y más grande */}
                    {selectedEmail.bodyContent && (
                      <div>
                        <label className="text-blue-400 text-sm font-semibold flex items-center gap-2 mb-3">
                          <Mail size={16} />
                          Email Content
                        </label>
                        <div className="p-6 bg-slate-800/80 rounded-xl border border-slate-700/50 max-h-[400px] overflow-y-auto shadow-inner">
                          <div className="text-white whitespace-pre-wrap text-base leading-relaxed font-sans">
                            {htmlToPlainText(selectedEmail.bodyContent)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">Subject</p>
                        <p className="text-white font-semibold mt-1">{selectedEmail.subject}</p>
                      </div>
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">Status</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedEmail.status)}`}>
                            {selectedEmail.status}
                          </span>
                          {selectedEmail.isResolved && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold text-green-600 bg-green-50">
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">From</p>
                        <p className="text-white mt-1">{selectedEmail.senderEmail}</p>
                      </div>
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">To</p>
                        <p className="text-white mt-1">{selectedEmail.recipientEmail}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">Priority</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedEmail.priority)}`}>
                          {selectedEmail.priority}
                        </span>
                      </div>
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">Time Remaining</p>
                        <p className="text-white font-semibold mt-1">{getTimeRemaining(selectedEmail.slaDeadline)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">Received At</p>
                        <p className="text-white mt-1">{new Date(selectedEmail.receivedAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">SLA Deadline</p>
                        <p className="text-white mt-1">{new Date(selectedEmail.slaDeadline).toLocaleString()}</p>
                      </div>
                    </div>

                    {selectedEmail.firstReplyAt && (
                      <div>
                        <p className="text-blue-400 text-sm font-semibold">First Reply At</p>
                        <p className="text-white mt-1">{new Date(selectedEmail.firstReplyAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                    Close
                  </Button>
                  {selectedEmail && !selectedEmail.isResolved && (
                    <Button onClick={() => handleMarkResolved(selectedEmail.id)} className="bg-green-600 hover:bg-green-700">
                      <CheckCheck size={16} className="mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                  {selectedEmail && (
                    <Button onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenReply(selectedEmail);
                    }} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Reply size={16} className="mr-2" />
                      Reply to Email
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reply Modal */}
            <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
              <DialogContent className="max-w-3xl bg-slate-900/95 border-slate-700/50 text-white shadow-2xl backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Reply className="text-blue-400" size={20} />
                    Reply to Email
                  </DialogTitle>
                  <DialogDescription className="text-blue-400/80">
                    {selectedEmail && `Subject: ${selectedEmail.subject}`}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Email Content Preview */}
                  {selectedEmail?.bodyContent && (
                    <div>
                      <label className="text-blue-400 text-sm font-semibold flex items-center gap-2 mb-2">
                        <Mail size={16} />
                        Original Message
                      </label>
                      <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/50 max-h-[200px] overflow-y-auto">
                        <div className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">
                          {htmlToPlainText(selectedEmail.bodyContent)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Template Selector */}
                  {replyTemplates.length > 0 && (
                    <div className="flex gap-3 items-center">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const template = replyTemplates.find(t => t.id === parseInt(value));
                          if (template) {
                            setReplyContent(template.content);
                            toast.success(`Template "${template.name}" loaded`);
                          }
                        }}
                      >
                        <SelectTrigger className="w-64 bg-slate-800/40 border-slate-700/50 text-white">
                          <SelectValue placeholder="Use a template..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700/50">
                          {replyTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name} ({template.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-blue-400/80 text-sm">or type manually below</span>
                    </div>
                  )}

                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[200px] bg-slate-800/80 border-slate-700/50 text-white placeholder:text-slate-400/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReplyModalOpen(false)} disabled={isReplying}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendReply} disabled={isReplying || !replyContent.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isReplying ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={16} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Team Member KPIs Modal */}
            <Dialog open={isTeamMemberModalOpen} onOpenChange={setIsTeamMemberModalOpen}>
              <DialogContent className="max-w-4xl bg-slate-900/95 border-slate-700/50 text-white max-h-[85vh] overflow-y-auto backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    {selectedTeamMember && (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg">
                          {selectedTeamMember.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p>{selectedTeamMember.name}</p>
                          <p className="text-sm text-blue-300 font-normal">{selectedTeamMember.email}</p>
                        </div>
                      </>
                    )}
                  </DialogTitle>
                </DialogHeader>

                {selectedTeamMember && (
                  <div className="space-y-6 mt-4">
                    {/* Key Performance Indicators */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-400" />
                        Key Performance Indicators
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 p-4 rounded-lg border border-blue-500/30">
                          <p className="text-xs text-blue-400 mb-1">Total Assigned</p>
                          <p className="text-3xl font-bold text-white">{selectedTeamMember.metrics.totalAssigned}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 p-4 rounded-lg border border-green-500/30">
                          <p className="text-xs text-green-400 mb-1">Replied</p>
                          <p className="text-3xl font-bold text-white">{selectedTeamMember.metrics.replied}</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 p-4 rounded-lg border border-slate-600/30">
                          <p className="text-xs text-slate-400 mb-1">Avg Reply Time</p>
                          <p className="text-2xl font-bold text-white">{formatTime(selectedTeamMember.metrics.avgReplyTimeMinutes)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/10 p-4 rounded-lg border border-indigo-500/30">
                          <p className="text-xs text-indigo-400 mb-1">Resolution Rate</p>
                          <p className="text-3xl font-bold text-white">{selectedTeamMember.metrics.resolutionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/20">
                      <h3 className="text-lg font-bold text-white mb-4">Performance Trend</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-400">Response Speed</span>
                            <span className="text-sm text-white font-mono">{formatTime(selectedTeamMember.metrics.avgReplyTimeMinutes)}</span>
                          </div>
                          <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (1 - selectedTeamMember.metrics.avgReplyTimeMinutes / 480) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-400">Resolution Rate</span>
                            <span className="text-sm text-white font-mono">{selectedTeamMember.metrics.resolutionRate.toFixed(1)}%</span>
                          </div>
                          <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                              style={{ width: `${selectedTeamMember.metrics.resolutionRate}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-400">Workload (Pending)</span>
                            <span className="text-sm text-white font-mono">{selectedTeamMember.metrics.pending}</span>
                          </div>
                          <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (selectedTeamMember.metrics.pending / selectedTeamMember.metrics.totalAssigned) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Status */}
                    <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/20">
                      <h3 className="text-lg font-bold text-white mb-4">Current Status</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedTeamMember.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <span className="text-white">{selectedTeamMember.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users size={16} className="text-blue-400" />
                          <span className="text-white capitalize">{selectedTeamMember.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => {
              if (!open) setDeleteConfirmation({ isOpen: false, type: null, id: null, name: '' });
            }}>
              <AlertDialogContent className="bg-slate-900/95 border-red-500/30 text-white backdrop-blur-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                    <AlertCircle size={24} />
                    Confirm Deletion
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmation.name}</span>?
                    <br />
                    <span className="text-red-400">This action cannot be undone.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmedDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Onboarding Wizard */}
            {showOnboarding && (
              <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
                <DialogContent className="max-w-2xl bg-slate-900/95 border-slate-700/50 text-white backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-white flex items-center gap-3">
                      <Sparkles className="text-yellow-400" size={32} />
                      Welcome to TimeToReply!
                    </DialogTitle>
                    <DialogDescription className="text-slate-200 text-base mt-2">
                      Let's get you started in 3 simple steps
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 mt-6">
                    {/* Step 1 */}
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xl">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Connect Your Email</h3>
                        <p className="text-slate-200 mb-3">
                          Connect Gmail or Outlook to start tracking your emails and response times.
                        </p>
                        <Button
                          onClick={() => {
                            setShowOnboarding(false);
                            localStorage.setItem('onboarding_completed', 'true');
                            setActiveView('settings');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Mail size={16} className="mr-2" />
                          Connect Email Provider
                        </Button>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xl">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Add Your Team</h3>
                        <p className="text-slate-200 mb-3">
                          Add team members to enable auto-assignment and workload distribution.
                        </p>
                        <Button
                          onClick={() => {
                            setShowOnboarding(false);
                            localStorage.setItem('onboarding_completed', 'true');
                            setActiveView('agents');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Users size={16} className="mr-2" />
                          Add Team Members
                        </Button>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xl">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Configure SLA Goals</h3>
                        <p className="text-slate-200 mb-3">
                          Set your response time targets and track performance against your goals.
                        </p>
                        <Button
                          onClick={() => {
                            setShowOnboarding(false);
                            localStorage.setItem('onboarding_completed', 'true');
                            setActiveView('settings');
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Clock size={16} className="mr-2" />
                          Configure SLA
                        </Button>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowOnboarding(false);
                        localStorage.setItem('onboarding_completed', 'true');
                      }}
                      className="bg-transparent border-slate-500 text-slate-200 hover:bg-slate-800/50"
                    >
                      Skip for Now
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Sheet
              open={isTicketSheetOpen}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseTicketDetail();
                }
              }}
            >
              <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
                {ticketWorkspaceLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : ticketWorkspaceError ? (
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Unable to load ticket</h3>
                      <p className="text-sm text-muted-foreground">{ticketWorkspaceError}</p>
                    </div>
                    <Button onClick={handleCloseTicketDetail} variant="outline">
                      Close
                    </Button>
                  </div>
                ) : ticketWorkspaceData ? (
                  <TicketWorkspaceZendesk
                    ticket={ticketWorkspaceData.ticket}
                    customer={ticketWorkspaceData.customer}
                    stats={ticketWorkspaceData.stats}
                    timeline={ticketWorkspaceData.timeline}
                  />
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
