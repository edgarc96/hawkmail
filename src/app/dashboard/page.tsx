"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Loader2, Mail, Clock, AlertCircle, CheckCircle, Users, TrendingUp, Bell, LogOut, BarChart3, Settings, Home, XCircle, Search, Send, Filter, X, Eye, Reply, CheckCheck, RefreshCw, Plus, Trash2, Zap, Shuffle, Database, Download, FileSpreadsheet, Info, Sparkles, ChevronRight, ChevronDown, Sliders, User, CreditCard, BellRing, Palette, FileText, Timer, Webhook, Calendar, Crown, Server, Target } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EnhancedMetricsCard } from "@/features/analytics/components/EnhancedMetricsCard";
import { EmailList } from "@/features/emails/components/EmailList";
import { EmailFilters } from "@/features/emails/components/EmailFilters";
import { AlertsList } from "@/features/alerts/components/AlertsList";
import { Leaderboard } from "@/features/team/components/Leaderboard";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from "recharts";

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
  receivedAt: string;
  slaDeadline: string;
  firstReplyAt: string | null;
  status: string;
  priority: string;
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
  const [activeSection, setActiveSection] = useState<'dashboard' | 'analytics' | 'alerts' | 'team' | 'configuration' | 'settings'>('dashboard');
  const [activeConfigSection, setActiveConfigSection] = useState<'templates' | 'sla' | 'webhooks' | 'business-hours' | 'customer-tiers' | 'email-providers' | 'performance-goals'>('templates');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'profile' | 'billing' | 'notifications' | 'preferences'>('profile');
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
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
          setActiveSection('settings');
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
          setActiveSection('settings');
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
    if (session?.user && activeSection === 'team') {
      fetchTeamWorkload();
    }
  }, [session, activeSection]);

  // Live Alerts via SSE when Alerts section is active
  useEffect(() => {
    let es: EventSource | null = null;
    if (session?.user && activeSection === 'alerts') {
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
  }, [session, activeSection]);

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
    if (session?.user && activeSection === 'settings') {
      fetchEmailProviders();
      fetchSyncLogs();
    }
  }, [session, activeSection]);

  useEffect(() => {
    if (session?.user && activeSection === 'team') {
      fetchTeamPerformance();
    }
  }, [session, activeSection]);

  // Auto-refresh for Analytics - LIVE updates every 30 seconds
  useEffect(() => {
    if (activeSection === 'analytics' && session?.user) {
      const interval = setInterval(() => {
        fetchDashboardData(false); // Refresh without showing loading spinner
        setLastUpdate(new Date());
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeSection, session]);

  useEffect(() => {
    if (session?.user && activeSection === 'settings') {
      fetchReplyTemplates();
      fetchPerformanceGoals();
    }
  }, [session, activeSection, selectedChannel]);

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
      
      if (response.ok) {
        toast.success(`✅ Sync completed! ${data.emailsProcessed || 0} emails processed`);
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

  const handleSectionClick = (section: 'dashboard' | 'analytics' | 'alerts' | 'team' | 'settings') => {
    setActiveSection(section);
    
    // Fetch webhooks when opening settings
    if (section === 'settings') {
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

  // Client-side filtering for search (no server reload)
  const filteredEmails = emails.filter(email => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(search) ||
      email.senderEmail?.toLowerCase().includes(search) ||
      email.recipientEmail?.toLowerCase().includes(search)
    );
  });

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#2d1b4e] to-[#1a0f2e] flex">
        {/* Left Navbar Vertical - Main Icons Only */}
        <div className="w-20 bg-[#0f0820] border-r border-purple-500/30 flex flex-col items-center py-8 gap-4 sticky top-0 h-screen">
          <button
            onClick={() => {
              setActiveSection('dashboard');
              setIsConfigMenuOpen(false);
              setIsSettingsMenuOpen(false);
            }}
            className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
              activeSection === 'dashboard' ? 'bg-purple-600/40' : 'bg-purple-600/20 hover:bg-purple-600/40'
            }`}
            title="Dashboard"
          >
            <Home className="text-purple-300 group-hover:text-purple-100" size={24} />
            <span className="text-[10px] text-purple-300 group-hover:text-purple-100 font-medium">Home</span>
          </button>

          <button
            onClick={() => {
              handleSectionClick('analytics');
              setIsConfigMenuOpen(false);
              setIsSettingsMenuOpen(false);
            }}
            className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
              activeSection === 'analytics' ? 'bg-purple-600/40' : 'hover:bg-purple-600/20'
            }`}
            title="Analytics"
          >
            <BarChart3 className="text-purple-400 group-hover:text-purple-200" size={24} />
            <span className="text-[10px] text-purple-400 group-hover:text-purple-200 font-medium">Analytics</span>
          </button>

          <button
            onClick={() => {
              handleSectionClick('alerts');
              setIsConfigMenuOpen(false);
              setIsSettingsMenuOpen(false);
            }}
            className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all relative ${
              activeSection === 'alerts' ? 'bg-purple-600/40' : 'hover:bg-purple-600/20'
            }`}
            title="Alerts"
          >
            <Bell className="text-purple-400 group-hover:text-purple-200" size={24} />
            <span className="text-[10px] text-purple-400 group-hover:text-purple-200 font-medium">Alerts</span>
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              handleSectionClick('team');
              setIsConfigMenuOpen(false);
              setIsSettingsMenuOpen(false);
            }}
            className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
              activeSection === 'team' ? 'bg-purple-600/40' : 'hover:bg-purple-600/20'
            }`}
            title="Team"
          >
            <Users className="text-purple-400 group-hover:text-purple-200" size={24} />
            <span className="text-[10px] text-purple-400 group-hover:text-purple-200 font-medium">Team</span>
          </button>

          {/* Configuration with Submenu */}
          <button
            onClick={() => {
              setIsConfigMenuOpen(!isConfigMenuOpen);
              setIsSettingsMenuOpen(false);
              if (!isConfigMenuOpen) {
                setActiveSection('configuration');
              }
            }}
            className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all relative ${
              activeSection === 'configuration' ? 'bg-blue-600/40' : 'hover:bg-blue-600/20'
            }`}
            title="Configuration"
          >
            <Sliders className="text-blue-400 group-hover:text-blue-200" size={24} />
            <span className="text-[10px] text-blue-400 group-hover:text-blue-200 font-medium">Config</span>
            <ChevronRight 
              className={`absolute -right-1 top-1/2 -translate-y-1/2 text-blue-400 transition-transform ${
                isConfigMenuOpen ? 'rotate-90' : ''
              }`} 
              size={12} 
            />
          </button>

          {/* Settings (Personal) with Submenu */}
          <button
            onClick={() => {
              setIsSettingsMenuOpen(!isSettingsMenuOpen);
              setIsConfigMenuOpen(false);
              if (!isSettingsMenuOpen) {
                setActiveSection('settings');
              }
            }}
            className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all relative ${
              activeSection === 'settings' ? 'bg-purple-600/40' : 'hover:bg-purple-600/20'
            }`}
            title="Settings"
          >
            <Settings className="text-purple-400 group-hover:text-purple-200" size={24} />
            <span className="text-[10px] text-purple-400 group-hover:text-purple-200 font-medium">Settings</span>
            <ChevronRight 
              className={`absolute -right-1 top-1/2 -translate-y-1/2 text-purple-400 transition-transform ${
                isSettingsMenuOpen ? 'rotate-90' : ''
              }`} 
              size={12} 
            />
          </button>

          <div className="flex-1"></div>

          <button
            onClick={handleSignOut}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-red-600/20 transition-all"
            title="Sign Out"
          >
            <LogOut className="text-red-400 group-hover:text-red-200" size={24} />
            <span className="text-[10px] text-red-400 group-hover:text-red-200 font-medium">Exit</span>
          </button>
        </div>

        {/* Configuration Submenu */}
        {isConfigMenuOpen && (
          <div className="w-64 bg-[#0f0820]/95 backdrop-blur-md border-r border-blue-500/30 sticky top-0 h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2">
                <Sliders size={20} />
                Configuration
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveConfigSection('templates')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeConfigSection === 'templates' 
                      ? 'bg-blue-600/30 text-white' 
                      : 'text-blue-300 hover:bg-blue-600/10'
                  }`}
                >
                  <FileText size={18} />
                  <span className="text-sm font-medium">Templates</span>
                </button>
                
                <button
                  onClick={() => setActiveConfigSection('sla')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeConfigSection === 'sla' 
                      ? 'bg-blue-600/30 text-white' 
                      : 'text-blue-300 hover:bg-blue-600/10'
                  }`}
                >
                  <Timer size={18} />
                  <span className="text-sm font-medium">SLA Settings</span>
                </button>
                
                <button
                  onClick={() => setActiveConfigSection('webhooks')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeConfigSection === 'webhooks' 
                      ? 'bg-blue-600/30 text-white' 
                      : 'text-blue-300 hover:bg-blue-600/10'
                  }`}
                >
                  <Webhook size={18} />
                  <span className="text-sm font-medium">Webhooks</span>
                </button>
                
                <button
                  onClick={() => setActiveConfigSection('business-hours')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeConfigSection === 'business-hours' 
                      ? 'bg-blue-600/30 text-white' 
                      : 'text-blue-300 hover:bg-blue-600/10'
                  }`}
                >
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Business Hours</span>
                </button>
                
                <button
                  onClick={() => setActiveConfigSection('customer-tiers')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeConfigSection === 'customer-tiers' 
                      ? 'bg-blue-600/30 text-white' 
                      : 'text-blue-300 hover:bg-blue-600/10'
                  }`}
                >
                  <Crown size={18} />
                  <span className="text-sm font-medium">Customer Tiers</span>
                </button>
                
                <button
                  onClick={() => setActiveConfigSection('email-providers')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeConfigSection === 'email-providers' 
                      ? 'bg-blue-600/30 text-white' 
                      : 'text-blue-300 hover:bg-blue-600/10'
                  }`}
                >
                  <Server size={18} />
                  <span className="text-sm font-medium">Email Providers</span>
                </button>
                
                <button
                  onClick={() => setActiveConfigSection('performance-goals')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeConfigSection === 'performance-goals' 
                      ? 'bg-blue-600/30 text-white' 
                      : 'text-blue-300 hover:bg-blue-600/10'
                  }`}
                >
                  <Target size={18} />
                  <span className="text-sm font-medium">Performance Goals</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Submenu */}
        {isSettingsMenuOpen && (
          <div className="w-64 bg-[#0f0820]/95 backdrop-blur-md border-r border-purple-500/30 sticky top-0 h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold text-purple-400 mb-6 flex items-center gap-2">
                <Settings size={20} />
                Settings
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSettingsSection('profile')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeSettingsSection === 'profile' 
                      ? 'bg-purple-600/30 text-white' 
                      : 'text-purple-300 hover:bg-purple-600/10'
                  }`}
                >
                  <User size={18} />
                  <span className="text-sm font-medium">Profile</span>
                </button>
                
                <button
                  onClick={() => setActiveSettingsSection('billing')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeSettingsSection === 'billing' 
                      ? 'bg-purple-600/30 text-white' 
                      : 'text-purple-300 hover:bg-purple-600/10'
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="text-sm font-medium">Billing & Payments</span>
                </button>
                
                <button
                  onClick={() => setActiveSettingsSection('notifications')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeSettingsSection === 'notifications' 
                      ? 'bg-purple-600/30 text-white' 
                      : 'text-purple-300 hover:bg-purple-600/10'
                  }`}
                >
                  <BellRing size={18} />
                  <span className="text-sm font-medium">Notifications</span>
                </button>
                
                <button
                  onClick={() => setActiveSettingsSection('preferences')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeSettingsSection === 'preferences' 
                      ? 'bg-purple-600/30 text-white' 
                      : 'text-purple-300 hover:bg-purple-600/10'
                  }`}
                >
                  <Palette size={18} />
                  <span className="text-sm font-medium">Preferences</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
        {/* Header with welcome message */}
        <div className="bg-[#2a1f3d]/80 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h1>
                <p className="text-purple-300 mt-1">Welcome back, {session.user.name || session.user.email}</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Content based on active section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeSection === 'dashboard' && dashboardData && (
            <div className="space-y-8">
              {/* Stats Grid - Enhanced with animations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EnhancedMetricsCard
                  title="Total Emails"
                  value={dashboardData.totalEmails}
                  icon={Mail}
                  gradient="from-purple-500 to-pink-500"
                  delay={0}
                />
                <EnhancedMetricsCard
                  title="Pending"
                  value={dashboardData.pendingEmails}
                  icon={Clock}
                  gradient="from-yellow-500 to-amber-500"
                  delay={0.1}
                />
                <EnhancedMetricsCard
                  title="Replied"
                  value={dashboardData.repliedEmails}
                  icon={CheckCircle}
                  gradient="from-green-500 to-emerald-500"
                  delay={0.2}
                />
                <EnhancedMetricsCard
                  title="Overdue"
                  value={dashboardData.overdueEmails}
                  icon={AlertCircle}
                  gradient="from-red-500 to-orange-500"
                  delay={0.3}
                />
              </div>

              {/* Search and Filters - Using new component */}
              <EmailFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onPriorityChange={setPriorityFilter}
                onClearFilters={handleClearFilters}
                onApplyFilters={() => fetchDashboardData(true)}
              />

              {/* Auto-Assignment Actions */}
              {teamMembers.length > 0 && (
                <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-400" size={24} />
                        Smart Auto-Assignment
                      </h3>
                      <p className="text-purple-300 text-sm mt-1">
                        {emails.filter(e => !e.assignedTo && e.status === 'pending').length} unassigned emails
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleBulkAutoAssign}
                          disabled={isAutoAssigning || emails.filter(e => !e.assignedTo && e.status === 'pending').length === 0}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
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
                      <TooltipContent side="bottom" className="bg-purple-900 text-white border-purple-500">
                        <p>Automatically distributes all unassigned emails to team members using Round-Robin strategy</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}

              {/* Recent Emails - Using new component */}
              <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Recent Emails</h2>
                  {teamMembers.length > 0 && (
                    <span className="text-sm text-purple-400">💡 Tip: Click on email to auto-assign</span>
                  )}
                </div>
                <EmailList
                  emails={filteredEmails}
                  teamMembers={teamMembers}
                  onViewEmail={handleViewEmail}
                  onReplyEmail={handleOpenReply}
                  onMarkResolved={handleMarkResolved}
                  onAssignEmail={handleAssignEmail}
                  onAutoAssign={handleAutoAssignEmail}
                  isAutoAssigning={isAutoAssigning}
                />
              </div>
            </div>
          )}

          {activeSection === 'analytics' && dashboardData && (
            <div className="space-y-8">
              {/* BI Tools Integration Section */}
              <div className="bg-gradient-to-br from-orange-900/30 to-yellow-800/10 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 shadow-lg">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Database className="text-orange-400" size={24} />
                    BI Tools Integration
                  </h3>
                  <p className="text-orange-300 text-sm mt-1">Connect with PowerBI, Tableau, Looker and more</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* PowerBI */}
                  <Button
                    onClick={() => window.open('/api/v1/analytics/export?format=powerbi&dateRange=last_30_days&metrics=all', '_blank')}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold h-auto py-4 flex-col items-start shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 size={20} />
                      <span className="font-bold">PowerBI</span>
                    </div>
                    <span className="text-xs opacity-80">Export for PowerBI</span>
                  </Button>

                  {/* Tableau */}
                  <Button
                    onClick={() => window.open('/api/v1/analytics/export?format=json&dateRange=last_30_days&metrics=all', '_blank')}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold h-auto py-4 flex-col items-start shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Database size={20} />
                      <span className="font-bold">Tableau</span>
                    </div>
                    <span className="text-xs opacity-80">Export for Tableau</span>
                  </Button>

                  {/* Looker */}
                  <Button
                    onClick={() => window.open('/api/v1/analytics/export?format=json&dateRange=last_30_days&metrics=all', '_blank')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold h-auto py-4 flex-col items-start shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={20} />
                      <span className="font-bold">Looker</span>
                    </div>
                    <span className="text-xs opacity-80">Export for Looker</span>
                  </Button>

                  {/* CSV/Excel */}
                  <Button
                    onClick={() => window.open('/api/v1/analytics/export?format=csv&dateRange=last_30_days&metrics=all', '_blank')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold h-auto py-4 flex-col items-start shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileSpreadsheet size={20} />
                      <span className="font-bold">CSV / Excel</span>
                    </div>
                    <span className="text-xs opacity-80">Download CSV</span>
                  </Button>
                </div>

                {/* Additional Export Options */}
                <div className="mt-4 pt-4 border-t border-orange-500/20">
                  <p className="text-xs text-orange-400 mb-2">📊 Quick Exports (Last 7 days):</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => window.open('/api/reports/export?type=emails', '_blank')}
                      size="sm"
                      className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30"
                    >
                      <Mail size={14} className="mr-1" />
                      Emails
                    </Button>
                    <Button
                      onClick={() => window.open('/api/reports/export?type=metrics', '_blank')}
                      size="sm"
                      className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30"
                    >
                      <BarChart3 size={14} className="mr-1" />
                      Metrics
                    </Button>
                    <Button
                      onClick={() => window.open('/api/reports/export?type=team', '_blank')}
                      size="sm"
                      className="bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30"
                    >
                      <Users size={14} className="mr-1" />
                      Team
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-lg">
                      <TrendingUp className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Avg Reply Time</p>
                      <p className="text-white text-2xl font-bold">{formatTime(dashboardData.avgReplyTimeMinutes)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600/20 rounded-lg">
                      <CheckCircle className="text-green-400" size={24} />
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Resolution Rate</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.avgResolutionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-lg">
                      <AlertCircle className="text-purple-400" size={24} />
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">High Priority</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.highPriorityEmails}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Metrics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reply Time Trend */}
                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Average Reply Time Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.recentMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#9333ea33" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#a78bfa"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#a78bfa" />
                      <ChartTooltip 
                        contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #9333ea', borderRadius: '8px' }}
                        labelStyle={{ color: '#a78bfa' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [formatTime(value), 'Reply Time']}
                      />
                      <Legend wrapperStyle={{ color: '#a78bfa' }} />
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
                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Resolution Rate Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.recentMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#9333ea33" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#a78bfa"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#a78bfa" />
                      <ChartTooltip 
                        contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #9333ea', borderRadius: '8px' }}
                        labelStyle={{ color: '#a78bfa' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Resolution Rate']}
                      />
                      <Legend wrapperStyle={{ color: '#a78bfa' }} />
                      <Bar 
                        dataKey="resolutionRate" 
                        fill="#10b981" 
                        name="Resolution Rate (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Goals Tracking - LIVE */}
              <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <TrendingUp size={24} className="text-amber-400" />
                    Performance Goals vs Actual
                    <span className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/50 rounded-full">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-bold text-red-400">LIVE</span>
                    </span>
                  </h2>
                  <div className="text-right">
                    <p className="text-xs text-amber-400/60">Last update</p>
                    <p className="text-sm text-amber-300 font-mono">{lastUpdate.toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Big Number Metrics - Like the image */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-xs text-amber-400/60 mb-1">First Reply Time</p>
                    <p className="text-4xl font-bold text-white">
                      {formatTime(dashboardData.recentMetrics.length > 0 
                        ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length 
                        : 0)}
                    </p>
                    <p className="text-xs text-amber-400 mt-1">
                      Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-400/60 mb-1">Overall Reply Time</p>
                    <p className="text-4xl font-bold text-white">
                      {formatTime(dashboardData.avgReplyTimeMinutes || 0)}
                    </p>
                    <p className="text-xs text-amber-400 mt-1">
                      Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-400/60 mb-1">Time to Close</p>
                    <p className="text-4xl font-bold text-white">
                      {formatTime((dashboardData.avgReplyTimeMinutes * 1.5) || 0)}
                    </p>
                    <p className="text-xs text-amber-400 mt-1">
                      Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.timeToCloseMinutes || 2880)}
                    </p>
                  </div>
                </div>
                {/* Horizontal Bar Chart - Like your image */}
                <div className="bg-[#1a0f2e]/40 rounded-lg p-6 mb-6">
                  <h3 className="text-white font-semibold mb-4">IGNORING BUSINESS HOURS</h3>
                  <div className="space-y-6">
                    {/* First Reply Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-amber-400">First Reply</span>
                        <span className="text-sm text-white font-mono">
                          {formatTime(dashboardData.recentMetrics.length > 0 
                            ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length 
                            : 0)}
                        </span>
                      </div>
                      <div className="relative h-8 bg-gray-800/50 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, ((dashboardData.recentMetrics.length > 0 
                              ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length 
                              : 0) / (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60)) * 100)}%` 
                          }}
                        ></div>
                        {/* Goal marker */}
                        <div className="absolute top-0 h-full w-1 bg-amber-500" style={{ left: '100%', transform: 'translateX(-50%)' }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-400">
                        <span>0h</span>
                        <span className="text-amber-400">Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60)}</span>
                      </div>
                    </div>

                    {/* Overall Reply Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-amber-400">Overall</span>
                        <span className="text-sm text-white font-mono">
                          {formatTime(dashboardData.avgReplyTimeMinutes || 0)}
                        </span>
                      </div>
                      <div className="relative h-8 bg-gray-800/50 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, ((dashboardData.avgReplyTimeMinutes || 0) / (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480)) * 100)}%` 
                          }}
                        ></div>
                        <div className="absolute top-0 h-full w-1 bg-amber-500" style={{ left: '100%', transform: 'translateX(-50%)' }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-400">
                        <span>0h</span>
                        <span className="text-amber-400">Goal: {formatTime(performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-[#1a0f2e]/40 rounded-lg p-3">
                    <p className="text-xs text-amber-400">First Reply Status</p>
                    <p className={`text-lg font-bold ${(dashboardData.recentMetrics.length > 0 ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length : 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60) ? 'text-green-400' : 'text-red-400'}`}>
                      {(dashboardData.recentMetrics.length > 0 ? dashboardData.recentMetrics.reduce((sum, m) => sum + m.avgFirstReplyTimeMinutes, 0) / dashboardData.recentMetrics.length : 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.firstReplyTimeMinutes || 60) ? '✓ On Track' : '✗ Behind'}
                    </p>
                  </div>
                  <div className="bg-[#1a0f2e]/40 rounded-lg p-3">
                    <p className="text-xs text-amber-400">Overall Reply Status</p>
                    <p className={`text-lg font-bold ${(dashboardData.avgReplyTimeMinutes || 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480) ? 'text-green-400' : 'text-red-400'}`}>
                      {(dashboardData.avgReplyTimeMinutes || 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.overallReplyTimeMinutes || 480) ? '✓ On Track' : '✗ Behind'}
                    </p>
                  </div>
                  <div className="bg-[#1a0f2e]/40 rounded-lg p-3">
                    <p className="text-xs text-amber-400">Time to Close Status</p>
                    <p className={`text-lg font-bold ${(dashboardData.avgReplyTimeMinutes * 1.5 || 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.timeToCloseMinutes || 2880) ? 'text-green-400' : 'text-red-400'}`}>
                      {(dashboardData.avgReplyTimeMinutes * 1.5 || 0) <= (performanceGoals.goals?.find((g: any) => g.channel === selectedChannel)?.timeToCloseMinutes || 2880) ? '✓ On Track' : '✗ Behind'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'alerts' && (
            <div className="space-y-6">
              <AlertsList
                alerts={alerts}
                isLive={alertsLive}
                lastEventAt={alertsLastEventAt}
              />
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-6">
              {/* Leaderboard and Workload for Managers - Using new components */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Leaderboard teamPerformance={teamPerformance} type="resolution" />
                <Leaderboard teamPerformance={teamPerformance} type="workload" />
              </div>
              {/* Team Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <Users className="text-purple-400" size={40} />
                    <div>
                      <p className="text-sm text-purple-300">Total Members</p>
                      <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="text-green-400" size={40} />
                    <div>
                      <p className="text-sm text-purple-300">Active Members</p>
                      <p className="text-2xl font-bold text-white">
                        {teamMembers.filter(m => m.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <Mail className="text-blue-400" size={40} />
                    <div>
                      <p className="text-sm text-purple-300">Agents</p>
                      <p className="text-2xl font-bold text-white">
                        {teamMembers.filter(m => m.role === 'agent').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="text-yellow-400" size={40} />
                    <div>
                      <p className="text-sm text-purple-300">Managers</p>
                      <p className="text-2xl font-bold text-white">
                        {teamMembers.filter(m => m.role === 'manager').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Team Member Form */}
              <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Plus size={24} />
                  Add Team Member
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-400"
                  />
                  
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-400"
                  />
                  
                  <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                    <SelectTrigger className="bg-purple-900/20 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={handleAddTeamMember}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Member
                  </Button>
                </div>
              </div>

              {/* Team Workload Overview */}
              {teamWorkload.length > 0 && (
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="text-blue-400" size={24} />
                        Team Workload Distribution
                      </h3>
                      <p className="text-blue-300 text-sm mt-1">Current capacity and load per agent</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleRebalanceWorkload}
                          disabled={isRebalancing}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg"
                        >
                          {isRebalancing ? (
                            <>
                              <RefreshCw size={18} className="mr-2 animate-spin" />
                              Rebalancing...
                            </>
                          ) : (
                            <>
                              <Shuffle size={18} className="mr-2" />
                              Rebalance Workload
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-blue-900 text-white border-blue-500">
                        <p>Redistributes emails from overloaded agents (&gt;80%) to underloaded agents (&lt;50%)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamWorkload.map((agent) => (
                      <div key={agent.id} className="bg-[#1a0f2e]/60 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                              {agent.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{agent.name}</p>
                              <p className="text-xs text-blue-400">{agent.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">{agent.currentLoad}</p>
                            <p className="text-xs text-blue-400">/{agent.capacity}</p>
                          </div>
                        </div>

                        {/* Workload bar */}
                        <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden mb-2">
                          <div 
                            className={`absolute h-full rounded-full transition-all duration-500 ${
                              agent.currentLoad / agent.capacity > 0.8 
                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                : agent.currentLoad / agent.capacity > 0.5
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                  : 'bg-gradient-to-r from-green-500 to-green-600'
                            }`}
                            style={{ width: `${Math.min(100, (agent.currentLoad / agent.capacity) * 100)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-blue-300">Capacity: {Math.round((agent.currentLoad / agent.capacity) * 100)}%</span>
                          <span className={`font-semibold ${
                            agent.currentLoad / agent.capacity > 0.8 
                              ? 'text-red-400' 
                              : agent.currentLoad / agent.capacity > 0.5
                                ? 'text-yellow-400'
                                : 'text-green-400'
                          }`}>
                            {agent.currentLoad / agent.capacity > 0.8 
                              ? 'Overloaded' 
                              : agent.currentLoad / agent.capacity > 0.5
                                ? 'Moderate'
                                : 'Available'}
                          </span>
                        </div>

                        {/* Performance metrics */}
                        <div className="mt-3 pt-3 border-t border-blue-500/20 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-blue-400">Avg Reply</p>
                            <p className="text-white font-semibold">{agent.avgReplyTimeMinutes > 0 ? `${Math.round(agent.avgReplyTimeMinutes / 60)}h` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-400">Resolution</p>
                            <p className="text-white font-semibold">{agent.resolutionRate}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members Performance */}
              <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Team Performance & KPIs</h2>
                
                {teamPerformance.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto text-purple-400 mb-4" size={64} />
                    <p className="text-purple-300 text-lg">No team members yet</p>
                    <p className="text-purple-400 text-sm mt-2">Add your first team member above to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamPerformance.map((member) => (
                      <div key={member.id} className="p-6 bg-purple-900/20 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                        {/* Member Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div>
                              <p className="font-bold text-white text-xl">{member.name}</p>
                              <p className="text-sm text-purple-300">{member.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  member.role === 'manager' 
                                    ? 'bg-yellow-500/20 text-yellow-400' 
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {member.role === 'manager' ? '👔 Manager' : '👤 Agent'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  member.isActive 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {member.isActive ? '✓ Active' : '✕ Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedTeamMember(member);
                                setIsTeamMemberModalOpen(true);
                              }}
                              size="sm"
                              className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400"
                            >
                              <Eye size={16} className="mr-2" />
                              View KPIs
                            </Button>
                            <Button
                              onClick={() => openDeleteConfirmation('team', member.id, member.name)}
                              variant="destructive"
                              size="sm"
                              className="bg-red-600/20 hover:bg-red-600/40 text-red-400"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                        
                        {/* KPIs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div className="bg-[#1a0f2e]/40 p-4 rounded-lg border border-purple-500/10">
                            <p className="text-xs text-purple-400 mb-1">Total Assigned</p>
                            <p className="text-2xl font-bold text-white">{member.metrics.totalAssigned}</p>
                          </div>
                          
                          <div className="bg-[#1a0f2e]/40 p-4 rounded-lg border border-purple-500/10">
                            <p className="text-xs text-purple-400 mb-1">Replied</p>
                            <p className="text-2xl font-bold text-green-400">{member.metrics.replied}</p>
                          </div>
                          
                          <div className="bg-[#1a0f2e]/40 p-4 rounded-lg border border-purple-500/10">
                            <p className="text-xs text-purple-400 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-yellow-400">{member.metrics.pending}</p>
                          </div>
                          
                          <div className="bg-[#1a0f2e]/40 p-4 rounded-lg border border-purple-500/10">
                            <p className="text-xs text-purple-400 mb-1">Overdue</p>
                            <p className="text-2xl font-bold text-red-400">{member.metrics.overdue}</p>
                          </div>
                          
                          <div className="bg-[#1a0f2e]/40 p-4 rounded-lg border border-purple-500/10">
                            <p className="text-xs text-purple-400 mb-1">Avg Reply Time</p>
                            <p className="text-2xl font-bold text-blue-400">
                              {member.metrics.avgReplyTimeMinutes > 0 
                                ? `${Math.round(member.metrics.avgReplyTimeMinutes / 60)}h ${member.metrics.avgReplyTimeMinutes % 60}m`
                                : 'N/A'}
                            </p>
                          </div>
                          
                          <div className="bg-[#1a0f2e]/40 p-4 rounded-lg border border-purple-500/10">
                            <p className="text-xs text-purple-400 mb-1">Resolution Rate</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold text-purple-400">{member.metrics.resolutionRate}%</p>
                              {member.metrics.resolutionRate >= 90 && <span className="text-green-400">✓</span>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Alerts for this member */}
                        {member.metrics.overdue > 0 && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                            <AlertCircle className="text-red-400" size={20} />
                            <span className="text-red-400 text-sm font-semibold">
                              ⚠️ {member.metrics.overdue} overdue emails - Needs attention!
                            </span>
                          </div>
                        )}
                        
                        {member.metrics.pending > 10 && (
                          <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
                            <AlertCircle className="text-yellow-400" size={20} />
                            <span className="text-yellow-400 text-sm font-semibold">
                              ⚠️ High workload: {member.metrics.pending} pending emails
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configuration Section */}
          {activeSection === 'configuration' && (
            <div className="space-y-8">
              {/* Breadcrumb */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm flex items-center gap-2">
                  <Sliders size={16} />
                  Configuration → <span className="text-white font-semibold">{activeConfigSection.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                </p>
              </div>

              {/* Email Providers Section */}
              {activeConfigSection === 'email-providers' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                  <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">📧 Email & Integration</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                </div>
              
              {/* Email Provider Integration */}
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Mail size={24} className="text-blue-400" />
                    Email Provider Integration
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleConnectProvider('gmail')}
                      className="bg-white hover:bg-gray-100 text-gray-800"
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
                      <div key={provider.id} className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              provider.provider === 'gmail' ? 'bg-red-600/20' : 'bg-blue-600/20'
                            }`}>
                              <Mail className={provider.provider === 'gmail' ? 'text-red-400' : 'text-blue-400'} size={24} />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold capitalize">{provider.provider}</h3>
                              <p className="text-purple-300 text-sm">{provider.email}</p>
                              {provider.lastSyncAt && (
                                <p className="text-purple-400 text-xs mt-1">
                                  Last synced: {new Date(provider.lastSyncAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              provider.isActive ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                            }`}>
                              {provider.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleViewProviderStatus(provider)}
                              className="bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/40"
                            >
                              <Eye size={14} className="mr-2" />
                              Status
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSyncProvider(provider.id)}
                              disabled={isSyncing || !provider.isActive}
                              className={`${isSyncing ? 'bg-green-600/40 border-green-500/50' : 'bg-blue-600/20 border-blue-500/30'} text-white hover:bg-blue-600/40`}
                            >
                              <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                              {isSyncing ? 'Scanning emails...' : 'Sync Now'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDisconnectProvider(provider.id)}
                              className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40"
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
                    <Mail className="text-purple-400 mx-auto mb-4" size={48} />
                    <p className="text-purple-300 mb-4">No email providers connected yet</p>
                    <p className="text-purple-400 text-sm">Connect Gmail or Outlook to sync your emails automatically</p>
                  </div>
                )}
              </div>

              {/* Sync Logs */}
              {syncLogs.length > 0 && (
                <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    {selectedProvider ? `Sync History - ${selectedProvider.email}` : 'Recent Sync History'}
                  </h2>
                  <div className="space-y-3">
                    {syncLogs.map((log) => (
                      <div key={log.id} className={`bg-[#1a0f2e]/40 border rounded-lg p-4 ${
                        log.syncStatus === 'success' ? 'border-green-500/30' :
                        log.syncStatus === 'failed' ? 'border-red-500/30' :
                        'border-yellow-500/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              log.syncStatus === 'success' ? 'bg-green-600/20' :
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
                              <p className="text-white font-semibold capitalize">{log.syncStatus}</p>
                              <p className="text-purple-300 text-sm">
                                {log.emailsProcessed} emails processed
                              </p>
                              {log.errorMessage && (
                                <p className="text-red-400 text-xs mt-1">{log.errorMessage}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-purple-400 text-sm">
                              {new Date(log.startedAt).toLocaleString()}
                            </p>
                            {log.completedAt && (
                              <p className="text-purple-500 text-xs">
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

              {/* Account Information */}
              <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Account Information</h2>
                <div className="space-y-3">
                  <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                    <p className="text-purple-400 text-sm">Name</p>
                    <p className="text-white font-medium">{session.user.name || 'Not set'}</p>
                  </div>
                  <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                    <p className="text-purple-400 text-sm">Email</p>
                    <p className="text-white font-medium">{session.user.email}</p>
                  </div>
                </div>
              </div>
              </div>
              )}

              {/* SLA & Compliance Section */}
              {activeConfigSection === 'sla' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
                  <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider">⏰ SLA & Compliance</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
                </div>

              {/* SLA Settings */}
              <div className="bg-gradient-to-br from-rose-900/30 to-rose-800/10 backdrop-blur-sm border border-rose-500/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock size={24} className="text-rose-400" />
                  SLA Configuration
                </h2>
                
                {/* Create New SLA */}
                <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-4">Create New SLA Setting</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="SLA Name (e.g., VIP Support)"
                      value={newSlaName}
                      onChange={(e) => setNewSlaName(e.target.value)}
                      className="bg-[#0f0820] border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                    <Input
                      type="number"
                      placeholder="Target Time (minutes)"
                      value={newSlaTime}
                      onChange={(e) => setNewSlaTime(e.target.value)}
                      className="bg-[#0f0820] border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                    <Select value={newSlaPriority} onValueChange={setNewSlaPriority}>
                      <SelectTrigger className="bg-[#0f0820] border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateSLA} className="bg-purple-600 hover:bg-purple-700">
                      <CheckCircle size={16} className="mr-2" />
                      Create SLA
                    </Button>
                  </div>
                </div>

                {/* Existing SLA Settings */}
                <div className="space-y-3">
                  <h3 className="text-white font-semibold mb-3">Existing SLA Settings</h3>
                  {slaSettings.length > 0 ? (
                    slaSettings.map((sla) => (
                      <div key={sla.id} className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{sla.name}</h4>
                            <div className="flex gap-4 mt-2 text-sm text-purple-300">
                              <span>Target: {formatTime(sla.targetReplyTimeMinutes)}</span>
                              <span className={`px-2 py-1 rounded ${getPriorityColor(sla.priorityLevel)}`}>
                                {sla.priorityLevel}
                              </span>
                              <span className={sla.isActive ? "text-green-400" : "text-gray-400"}>
                                {sla.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSLA(sla.id, sla.name)}
                            className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40"
                          >
                            <XCircle size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-purple-300 text-center py-8">No SLA settings configured yet. Create your first one above!</p>
                  )}
                </div>
              </div>
              </div>
              )}

              {/* Templates Section */}
              {activeConfigSection === 'templates' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                  <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">📝 Templates & Automation</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </div>

              {/* Reply Templates */}
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Send size={24} className="text-emerald-400" />
                  Reply Templates
                </h2>
                
                {/* Create Template Form */}
                <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-4">Create New Template</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Template Name (e.g., Welcome Email)"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="bg-[#1a0f2e]/40 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                    <Input
                      placeholder="Subject (optional)"
                      value={newTemplateSubject}
                      onChange={(e) => setNewTemplateSubject(e.target.value)}
                      className="bg-[#1a0f2e]/40 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                    <Textarea
                      placeholder="Template Content..."
                      value={newTemplateContent}
                      onChange={(e) => setNewTemplateContent(e.target.value)}
                      className="bg-[#1a0f2e]/40 border-purple-500/30 text-white placeholder:text-purple-400 min-h-[100px]"
                    />
                    <div className="flex gap-3">
                      <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                        <SelectTrigger className="w-40 bg-[#1a0f2e]/40 border-purple-500/30 text-white">
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
                        className="bg-purple-600 hover:bg-purple-700 text-white"
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
                      <div key={template.id} className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-semibold">{template.name}</h3>
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300">
                                {template.category}
                              </span>
                              <span className="text-purple-400 text-xs">
                                Used {template.usageCount} times
                              </span>
                            </div>
                            {template.subject && (
                              <p className="text-purple-300 text-sm mb-2">Subject: {template.subject}</p>
                            )}
                            <p className="text-purple-400 text-sm line-clamp-2">{template.content}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteConfirmation('template', template.id, template.name)}
                            className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40 ml-4"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Send className="text-purple-400 mx-auto mb-4" size={48} />
                    <p className="text-purple-300 mb-2">No templates created yet</p>
                    <p className="text-purple-400 text-sm">Create templates to respond to emails faster</p>
                  </div>
                )}
              </div>
              </div>
              )}

              {/* Performance Goals Section */}
              {activeConfigSection === 'performance-goals' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                  <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">📊 Performance & Analytics</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                </div>

              {/* Performance Goals */}
              <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={24} className="text-amber-400" />
                  Performance Goals
                </h2>
                
                {/* Channel Selector */}
                <div className="mb-6">
                  <label className="text-purple-300 text-sm mb-2 block">Channel</label>
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="w-48 bg-[#1a0f2e]/40 border-purple-500/30 text-white">
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
                  <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">First Reply Time Goal</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={firstReplyGoalHours}
                        onChange={(e) => setFirstReplyGoalHours(e.target.value)}
                        className="w-20 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center"
                        placeholder="00"
                      />
                      <span className="text-purple-300">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={firstReplyGoalMinutes}
                        onChange={(e) => setFirstReplyGoalMinutes(e.target.value)}
                        className="w-20 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center"
                        placeholder="00"
                      />
                    </div>
                    <p className="text-purple-400 text-xs mt-2">Hours : Minutes</p>
                  </div>

                  {/* Overall Reply Time Goal */}
                  <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">Overall Reply Time Goal</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={overallReplyGoalHours}
                        onChange={(e) => setOverallReplyGoalHours(e.target.value)}
                        className="w-20 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center"
                        placeholder="00"
                      />
                      <span className="text-purple-300">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={overallReplyGoalMinutes}
                        onChange={(e) => setOverallReplyGoalMinutes(e.target.value)}
                        className="w-20 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center"
                        placeholder="00"
                      />
                    </div>
                    <p className="text-purple-400 text-xs mt-2">Hours : Minutes</p>
                  </div>

                  {/* Time To Close Goal */}
                  <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">Time To Close Goal</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={timeToCloseGoalHours}
                        onChange={(e) => setTimeToCloseGoalHours(e.target.value)}
                        className="w-20 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center"
                        placeholder="00"
                      />
                      <span className="text-purple-300">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={timeToCloseGoalMinutes}
                        onChange={(e) => setTimeToCloseGoalMinutes(e.target.value)}
                        className="w-20 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center"
                        placeholder="00"
                      />
                    </div>
                    <p className="text-purple-400 text-xs mt-2">Hours : Minutes</p>
                  </div>
                </div>

                <Button
                  onClick={handleSavePerformanceGoals}
                  className="bg-purple-600 hover:bg-purple-700 text-white mb-6"
                >
                  💾 Save Goals
                </Button>

                {/* Time Bands Section */}
                <div className="border-t border-purple-500/20 pt-6 mt-6">
                  <h3 className="text-white font-semibold mb-4">Time Bands</h3>
                  <p className="text-purple-400 text-sm mb-4">
                    In addition to reply time goals, you can optionally also set reply time "bands". If they aren't set, we will use sensible defaults for your reporting.
                  </p>

                  {/* Existing Time Bands */}
                  {performanceGoals.bands.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {performanceGoals.bands.map((band: any) => (
                        <div key={band.id} className="flex items-center justify-between bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300">
                              {band.bandType === 'first_reply' ? 'First Reply' : band.bandType === 'overall_reply' ? 'Overall Reply' : 'Time to Close'}
                            </span>
                            <span className="text-white">{band.label}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTimeBand(band.id)}
                            className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Time Band */}
                  <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="text-purple-300 text-xs mb-1 block">Band Type</label>
                        <Select value={newBandType} onValueChange={setNewBandType}>
                          <SelectTrigger className="bg-[#1a0f2e]/40 border-purple-500/30 text-white">
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
                        <label className="text-purple-300 text-xs mb-1 block">Min Time (HH:MM)</label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            value={newBandMinHours}
                            onChange={(e) => setNewBandMinHours(e.target.value)}
                            className="w-16 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center text-sm"
                            placeholder="00"
                          />
                          <span className="text-purple-300 text-sm">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={newBandMinMinutes}
                            onChange={(e) => setNewBandMinMinutes(e.target.value)}
                            className="w-16 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center text-sm"
                            placeholder="00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-purple-300 text-xs mb-1 block">Max Time (HH:MM)</label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            value={newBandMaxHours}
                            onChange={(e) => setNewBandMaxHours(e.target.value)}
                            className="w-16 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center text-sm"
                            placeholder="00"
                          />
                          <span className="text-purple-300 text-sm">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={newBandMaxMinutes}
                            onChange={(e) => setNewBandMaxMinutes(e.target.value)}
                            className="w-16 bg-[#1a0f2e]/40 border-purple-500/30 text-white text-center text-sm"
                            placeholder="00"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleAddTimeBand}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                  <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">🔗 Webhooks & Integrations</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                </div>

              {/* Webhooks */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Database size={24} className="text-cyan-400" />
                  Outgoing Webhooks
                </h2>
                
                {/* Create Webhook */}
                <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-4">Create New Webhook</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Webhook URL (e.g., https://your-app.com/webhook)"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      className="bg-[#1a0f2e]/40 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                    <div>
                      <p className="text-purple-300 text-sm mb-2">Select Events:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['email.received', 'email.replied', 'email.assigned', 'email.resolved', 'sla.warning', 'sla.breached'].map((event) => (
                          <label key={event} className="flex items-center gap-2 bg-[#0f0820]/40 p-2 rounded cursor-pointer hover:bg-[#0f0820]/60">
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
                            <span className="text-purple-300 text-sm">{event}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateWebhook}
                      disabled={isCreatingWebhook}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
                    <h3 className="text-white font-semibold mb-3">Active Webhooks</h3>
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white font-semibold mb-1">{webhook.url}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {(() => {
                                try {
                                  const events = typeof webhook.events === 'string' 
                                    ? JSON.parse(webhook.events) 
                                    : webhook.events;
                                  return events.map((event: string) => (
                                    <span key={event} className="px-2 py-1 rounded-full text-xs font-semibold bg-cyan-600/20 text-cyan-300">
                                      {event}
                                    </span>
                                  ));
                                } catch (e) {
                                  return <span className="text-red-400 text-xs">Invalid events data</span>;
                                }
                              })()}
                            </div>
                            <div className="flex gap-4 text-xs text-purple-400">
                              <span>Status: <span className={webhook.isActive ? 'text-green-400' : 'text-gray-400'}>{webhook.isActive ? 'Active' : 'Inactive'}</span></span>
                              {webhook.lastTriggeredAt && (
                                <span>Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteConfirmation('webhook', webhook.id, webhook.url)}
                            className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40 ml-4"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="text-cyan-400 mx-auto mb-4" size={48} />
                    <p className="text-purple-300 mb-2">No webhooks configured</p>
                    <p className="text-purple-400 text-sm">Create a webhook to receive real-time notifications</p>
                  </div>
                )}
              </div>
              </div>
              )}

              {/* Business Hours Section */}
              {activeConfigSection === 'business-hours' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                  <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">⏰ Business Hours & Holidays</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                </div>

              <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/10 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock size={24} className="text-indigo-400" />
                  Business Hours Configuration
                </h2>
                
                <div className="space-y-3 mb-6">
                  {Object.entries(businessHours).map(([day, hours]) => (
                    <div key={day} className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
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
                          <span className="text-white font-semibold capitalize w-24">{day}</span>
                          {hours.enabled && (
                            <div className="flex gap-3 items-center">
                              <Input
                                type="time"
                                value={hours.start}
                                onChange={(e) => setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...hours, start: e.target.value }
                                })}
                                className="w-32 bg-[#0f0820]/40 border-purple-500/30 text-white"
                              />
                              <span className="text-purple-400">to</span>
                              <Input
                                type="time"
                                value={hours.end}
                                onChange={(e) => setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...hours, end: e.target.value }
                                })}
                                className="w-32 bg-[#0f0820]/40 border-purple-500/30 text-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-indigo-500/20 pt-6">
                  <h3 className="text-white font-semibold mb-4">Holidays</h3>
                  <div className="flex gap-3 mb-4">
                    <Input
                      type="date"
                      value={newHoliday}
                      onChange={(e) => setNewHoliday(e.target.value)}
                      className="flex-1 bg-[#1a0f2e]/40 border-purple-500/30 text-white"
                    />
                    <Button
                      onClick={handleAddHoliday}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Holiday
                    </Button>
                  </div>
                  {holidays.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {holidays.map((date) => (
                        <div key={date} className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg px-3 py-2 flex items-center gap-2">
                          <span className="text-purple-300 text-sm">{new Date(date).toLocaleDateString()}</span>
                          <button
                            onClick={() => handleRemoveHoliday(date)}
                            className="text-red-400 hover:text-red-300"
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
                  <h2 className="text-sm font-bold text-pink-400 uppercase tracking-wider">👥 Customer Tiers</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
                </div>

              <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/10 backdrop-blur-sm border border-pink-500/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users size={24} className="text-pink-400" />
                  Customer Tier Management
                </h2>
                
                <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-4">Add Customer to Tier</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Customer Email"
                      value={newTierEmail}
                      onChange={(e) => setNewTierEmail(e.target.value)}
                      className="bg-[#1a0f2e]/40 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                    <Select value={newTierLevel} onValueChange={(value: any) => setNewTierLevel(value)}>
                      <SelectTrigger className="bg-[#1a0f2e]/40 border-purple-500/30 text-white">
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
                      className="bg-[#1a0f2e]/40 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                    <Button
                      onClick={handleAddCustomerTier}
                      className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <Plus size={16} className="mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {customerTiers.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold mb-3">Customer Tiers</h3>
                    {customerTiers.map((tier) => (
                      <div key={tier.id} className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">{tier.email}</p>
                            <div className="flex gap-3 mt-2 text-sm">
                              <span className={`px-3 py-1 rounded-full font-semibold ${
                                tier.tier === 'vip' ? 'bg-yellow-600/20 text-yellow-400' :
                                tier.tier === 'enterprise' ? 'bg-blue-600/20 text-blue-400' :
                                'bg-gray-600/20 text-gray-400'
                              }`}>
                                {tier.tier.toUpperCase()}
                              </span>
                              <span className="text-purple-300">SLA: {formatTime(tier.slaMinutes)}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteConfirmation('tier', tier.id, tier.email)}
                            className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="text-pink-400 mx-auto mb-4" size={48} />
                    <p className="text-purple-300 mb-2">No customer tiers configured</p>
                    <p className="text-purple-400 text-sm">Add customers to tiers for priority SLA handling</p>
                  </div>
                )}
              </div>
              </div>
              )}
            </div>
          )}

          {/* Settings Section (Personal) */}
          {activeSection === 'settings' && (
            <div className="space-y-8">
              {/* Breadcrumb */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-300 text-sm flex items-center gap-2">
                  <Settings size={16} />
                  Settings → <span className="text-white font-semibold">{activeSettingsSection.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                </p>
              </div>

              {/* Personal Settings Subsections - show based on activeSettingsSection */}

              {/* Profile Settings */}
              {activeSettingsSection === 'profile' && (
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <User size={28} className="text-purple-400" />
                    Profile Settings
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-purple-300 text-sm font-medium">Full Name</label>
                      <Input 
                        defaultValue={session.user.name || ''} 
                        className="mt-2 bg-[#1a0f2e]/40 border-purple-500/30 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm font-medium">Email</label>
                      <Input 
                        defaultValue={session.user.email || ''} 
                        disabled
                        className="mt-2 bg-[#1a0f2e]/40 border-purple-500/30 text-gray-400"
                      />
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* Billing Settings */}
              {activeSettingsSection === 'billing' && (
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <CreditCard size={28} className="text-purple-400" />
                    Billing & Payments
                  </h2>
                  <div className="text-center py-12">
                    <CreditCard className="mx-auto mb-4 text-purple-400" size={64} />
                    <h3 className="text-white text-lg font-semibold mb-2">Coming Soon</h3>
                    <p className="text-purple-300">Billing and payment management will be available soon</p>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSettingsSection === 'notifications' && (
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <BellRing size={28} className="text-purple-400" />
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg">
                      <div>
                        <h3 className="text-white font-semibold">Email Notifications</h3>
                        <p className="text-purple-300 text-sm">Receive email alerts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg">
                      <div>
                        <h3 className="text-white font-semibold">Desktop Notifications</h3>
                        <p className="text-purple-300 text-sm">Show desktop alerts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeSettingsSection === 'preferences' && (
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Palette size={28} className="text-purple-400" />
                    Preferences
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-purple-300 text-sm font-medium mb-2 block">Theme</label>
                      <ThemeToggle />
                    </div>
                    <div>
                      <label className="text-purple-300 text-sm font-medium mb-2 block">Language</label>
                      <Select>
                        <SelectTrigger className="bg-[#1a0f2e]/40 border-purple-500/30 text-white">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      {/* Email Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl bg-[#2a1f3d] border-purple-500/30 text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Email Details</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-400 text-sm">Subject</p>
                  <p className="text-white font-semibold">{selectedEmail.subject}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm">Status</p>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-400 text-sm">From</p>
                  <p className="text-white">{selectedEmail.senderEmail}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm">To</p>
                  <p className="text-white">{selectedEmail.recipientEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-400 text-sm">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedEmail.priority)}`}>
                    {selectedEmail.priority}
                  </span>
                </div>
                <div>
                  <p className="text-purple-400 text-sm">Time Remaining</p>
                  <p className="text-white font-semibold">{getTimeRemaining(selectedEmail.slaDeadline)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-400 text-sm">Received At</p>
                  <p className="text-white">{new Date(selectedEmail.receivedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm">SLA Deadline</p>
                  <p className="text-white">{new Date(selectedEmail.slaDeadline).toLocaleString()}</p>
                </div>
              </div>

              {selectedEmail.firstReplyAt && (
                <div>
                  <p className="text-purple-400 text-sm">First Reply At</p>
                  <p className="text-white">{new Date(selectedEmail.firstReplyAt).toLocaleString()}</p>
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
              }} className="bg-purple-600 hover:bg-purple-700">
                <Reply size={16} className="mr-2" />
                Reply to Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-2xl bg-[#2a1f3d] border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Reply to Email</DialogTitle>
            <DialogDescription className="text-purple-300">
              {selectedEmail && `Subject: ${selectedEmail.subject}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                  <SelectTrigger className="w-64 bg-[#1a0f2e]/40 border-purple-500/30 text-white">
                    <SelectValue placeholder="Use a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {replyTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name} ({template.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-purple-400 text-sm">or type manually below</span>
              </div>
            )}
            
            <Textarea
              placeholder="Type your reply here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[200px] bg-[#1a0f2e]/40 border-purple-500/30 text-white placeholder:text-purple-400"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyModalOpen(false)} disabled={isReplying}>
              Cancel
            </Button>
            <Button onClick={handleSendReply} disabled={isReplying || !replyContent.trim()} className="bg-purple-600 hover:bg-purple-700">
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
        <DialogContent className="max-w-4xl bg-[#2a1f3d] border-purple-500/30 text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              {selectedTeamMember && (
                <>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-lg">
                    {selectedTeamMember.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p>{selectedTeamMember.name}</p>
                    <p className="text-sm text-purple-300 font-normal">{selectedTeamMember.email}</p>
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
                  <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 p-4 rounded-lg border border-amber-500/30">
                    <p className="text-xs text-amber-400 mb-1">Avg Reply Time</p>
                    <p className="text-2xl font-bold text-white">{formatTime(selectedTeamMember.metrics.avgReplyTimeMinutes)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-4 rounded-lg border border-purple-500/30">
                    <p className="text-xs text-purple-400 mb-1">Resolution Rate</p>
                    <p className="text-3xl font-bold text-white">{selectedTeamMember.metrics.resolutionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-[#1a0f2e]/40 rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Performance Trend</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-400">Response Speed</span>
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
                      <span className="text-sm text-purple-400">Resolution Rate</span>
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
                      <span className="text-sm text-purple-400">Workload (Pending)</span>
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
              <div className="bg-[#1a0f2e]/40 rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Current Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedTeamMember.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-white">{selectedTeamMember.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-purple-400" />
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
        <AlertDialogContent className="bg-[#2a1f3d] border-red-500/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle size={24} />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-purple-300">
              Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmation.name}</span>?
              <br />
              <span className="text-red-400">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
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
          <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-purple-500/50 text-white backdrop-blur-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <Sparkles className="text-yellow-400" size={32} />
                Welcome to TimeToReply!
              </DialogTitle>
              <DialogDescription className="text-purple-200 text-base mt-2">
                Let's get you started in 3 simple steps
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Connect Your Email</h3>
                  <p className="text-purple-200 mb-3">
                    Connect Gmail or Outlook to start tracking your emails and response times.
                  </p>
                  <Button
                    onClick={() => {
                      setShowOnboarding(false);
                      localStorage.setItem('onboarding_completed', 'true');
                      setActiveSection('settings');
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
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Add Your Team</h3>
                  <p className="text-purple-200 mb-3">
                    Add team members to enable auto-assignment and workload distribution.
                  </p>
                  <Button
                    onClick={() => {
                      setShowOnboarding(false);
                      localStorage.setItem('onboarding_completed', 'true');
                      setActiveSection('team');
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
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Configure SLA Goals</h3>
                  <p className="text-purple-200 mb-3">
                    Set your response time targets and track performance against your goals.
                  </p>
                  <Button
                    onClick={() => {
                      setShowOnboarding(false);
                      localStorage.setItem('onboarding_completed', 'true');
                      setActiveSection('settings');
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
                className="bg-transparent border-purple-500 text-purple-200 hover:bg-purple-800/50"
              >
                Skip for Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
        </div>
      </div>
    </TooltipProvider>
  );
}
