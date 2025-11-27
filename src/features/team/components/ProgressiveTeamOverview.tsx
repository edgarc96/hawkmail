"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Users, User, TrendingUp, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Plus, Filter, BarChart3, Mail, Eye, Trash2, RefreshCw, Shuffle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface TeamWorkload {
  id: number;
  name: string;
  role: string;
  currentLoad: number;
  capacity: number;
  avgReplyTimeMinutes: number;
  resolutionRate: number;
}

interface ProgressiveTeamOverviewProps {
  teamMembers?: TeamMember[];
  teamPerformance: TeamPerformance[];
  teamWorkload?: TeamWorkload[];
  onAddTeamMember: () => void;
  onDeleteTeamMember?: (id: number) => void;
  onViewMemberDetails?: (member: TeamPerformance) => void;
  onRebalanceWorkload?: () => void;
  isRebalancing?: boolean;
}

type ViewMode = 'overview' | 'detailed';
type SortField = 'name' | 'resolutionRate' | 'pending' | 'avgReplyTime';
type FilterRole = 'all' | 'agent' | 'manager';

export function ProgressiveTeamOverview({ 
  teamPerformance,
  teamWorkload,
  onAddTeamMember,
  onDeleteTeamMember,
  onViewMemberDetails,
  onRebalanceWorkload,
  isRebalancing = false
}: ProgressiveTeamOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set());
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort team members
  const filteredAndSortedTeam = useMemo(() => {
    let filtered = teamPerformance;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(member => member.role === filterRole);
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'resolutionRate':
          return b.metrics.resolutionRate - a.metrics.resolutionRate;
        case 'pending':
          return b.metrics.pending - a.metrics.pending;
        case 'avgReplyTime':
          return a.metrics.avgReplyTimeMinutes - b.metrics.avgReplyTimeMinutes;
        default:
          return 0;
      }
    });
  }, [teamPerformance, searchTerm, filterRole, sortBy]);

  // Toggle member expansion
  const toggleMemberExpansion = useCallback((memberId: number) => {
    setExpandedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  }, []);

  // Get status color and text
  const getMemberStatus = useCallback((member: TeamPerformance) => {
    if (!member.isActive) return { badgeClasses: 'bg-gray-500/10 text-gray-400 border border-gray-500/30', text: 'Inactive' };
    if (member.metrics.overdue > 0) return { badgeClasses: 'bg-red-500/10 text-red-400 border border-red-500/30', text: 'Needs Attention' };
    if (member.metrics.pending > 10) return { badgeClasses: 'bg-amber-500/10 text-amber-400 border border-amber-500/30', text: 'High Load' };
    if (member.metrics.resolutionRate >= 90) return { badgeClasses: 'bg-green-500/10 text-green-400 border border-green-500/30', text: 'Excellent' };
    return { badgeClasses: 'bg-blue-500/10 text-blue-400 border border-blue-500/30', text: 'Active' };
  }, []);

  // Format time display
  const formatTime = useCallback((minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  // Calculate workload percentage
  const getWorkloadPercentage = useCallback((member: TeamPerformance) => {
    return Math.min(100, (member.metrics.pending / Math.max(member.metrics.totalAssigned, 1)) * 100);
  }, []);

  // Team statistics
  const teamStats = useMemo(() => {
    const totalMembers = teamPerformance.length;
    const activeMembers = teamPerformance.filter(m => m.isActive).length;
    const totalPending = teamPerformance.reduce((sum, m) => sum + m.metrics.pending, 0);
    const totalOverdue = teamPerformance.reduce((sum, m) => sum + m.metrics.overdue, 0);
    const avgResolution = totalMembers > 0 
      ? Math.round(teamPerformance.reduce((sum, m) => sum + m.metrics.resolutionRate, 0) / totalMembers)
      : 0;
    
    return { totalMembers, activeMembers, totalPending, totalOverdue, avgResolution };
  }, [teamPerformance]);

  return (
    <div className="space-y-6 text-white">
      {/* Compact Team Stats Bar */}
      <div className="flex items-center justify-between p-4 bg-[#18181b] rounded-lg border border-white/10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Team</p>
              <p className="text-sm font-semibold text-white">{teamStats.activeMembers}/{teamStats.totalMembers}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs text-gray-400">Pending</p>
              <p className="text-sm font-semibold text-amber-300">{teamStats.totalPending}</p>
            </div>
          </div>
          {teamStats.totalOverdue > 0 && (
            <>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-xs text-gray-400">Overdue</p>
                  <p className="text-sm font-semibold text-red-300">{teamStats.totalOverdue}</p>
                </div>
              </div>
            </>
          )}
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Avg Resolution</p>
              <p className="text-sm font-semibold text-green-300">{teamStats.avgResolution}%</p>
            </div>
          </div>
        </div>
        
        {onRebalanceWorkload && teamWorkload && teamWorkload.length > 0 && (
          <Button
            onClick={onRebalanceWorkload}
            disabled={isRebalancing}
            size="sm"
            className="gap-2 border border-white/10 text-white bg-transparent hover:bg-white/10"
          >
            {isRebalancing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rebalancing...
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4" />
                Rebalance
              </>
            )}
          </Button>
        )}
      </div>

      {/* Header with Search and Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-[#12111a] border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
              />
            </div>
            <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300 border border-white/10">
              {filteredAndSortedTeam.length} of {teamPerformance.length} members
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("text-white hover:bg-white/10", showFilters && "bg-white/10")}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {viewMode === 'overview' ? 'Detailed' : 'Overview'}
            </Button>
            <Button onClick={onAddTeamMember} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4 bg-[#18181b] rounded-lg border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sort by:</span>
                  <div className="flex gap-1">
                    {[
                      { value: 'name', label: 'Name' },
                      { value: 'resolutionRate', label: 'Resolution' },
                      { value: 'pending', label: 'Workload' },
                      { value: 'avgReplyTime', label: 'Speed' }
                    ].map(option => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSortBy(option.value as SortField)}
                        className={cn("text-xs", sortBy === option.value ? "bg-violet-600 hover:bg-violet-700" : "text-white hover:bg-white/10")}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Role:</span>
                  <div className="flex gap-1">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'agent', label: 'Agents' },
                      { value: 'manager', label: 'Managers' }
                    ].map(option => (
                      <Button
                        key={option.value}
                        variant={filterRole === option.value ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterRole(option.value as FilterRole)}
                        className={cn("text-xs", filterRole === option.value ? "bg-violet-600 hover:bg-violet-700" : "text-white hover:bg-white/10")}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Team Grid */}
      <div className="grid gap-4">
        {filteredAndSortedTeam.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No team members found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first team member to get started'}
            </p>
          </div>
        ) : (
          filteredAndSortedTeam.map((member) => {
            const status = getMemberStatus(member);
            const isExpanded = expandedMembers.has(member.id);
            const isHovered = hoveredMember === member.id;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group relative bg-card border rounded-xl transition-all duration-300",
                  isExpanded ? "shadow-lg border-primary/20" : "shadow-sm border-border/50 hover:shadow-md hover:border-border",
                  !member.isActive && "opacity-60"
                )}
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                {/* Main Card Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left: Member Info */}
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg transition-all duration-300",
                          member.isActive 
                            ? "bg-gradient-to-br from-primary to-primary/80" 
                            : "bg-gradient-to-br from-gray-400 to-gray-600"
                        )}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Status Indicator */}
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                          member.isActive ? "bg-green-500" : "bg-gray-400"
                        )} />
                      </div>

                      {/* Basic Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground text-lg">{member.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        
                        {/* Quick Status */}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className={cn("text-xs", status.badgeClasses)}>
                            {status.text}
                          </Badge>
                          {viewMode === 'overview' && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {member.metrics.pending} pending
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {member.metrics.resolutionRate}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Key Metric & Controls */}
                    <div className="flex items-center gap-4">
                      {/* Primary Metric */}
                      {viewMode === 'overview' ? (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Avg Response</p>
                          <p className="text-xl font-bold text-primary">
                            {formatTime(member.metrics.avgReplyTimeMinutes)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Resolution Rate</p>
                          <p className="text-xl font-bold text-primary">
                            {member.metrics.resolutionRate}%
                          </p>
                        </div>
                      )}

                      {/* Expand/Collapse Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMemberExpansion(member.id)}
                        className="p-2"
                      >
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </Button>
                    </div>
                  </div>

                  {/* Hover Preview - Subtle additional info */}
                  <AnimatePresence>
                    {isHovered && !isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border/50"
                      >
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Assigned</p>
                            <p className="font-semibold">{member.metrics.totalAssigned}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Replied</p>
                            <p className="font-semibold text-green-600">{member.metrics.replied}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Overdue</p>
                            <p className="font-semibold text-red-600">{member.metrics.overdue}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Load</p>
                            <Progress value={getWorkloadPercentage(member)} className="h-2 mt-2" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-border/50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Performance Metrics */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-primary" />
                              Performance
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Assigned</span>
                                <span className="font-semibold">{member.metrics.totalAssigned}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Replied</span>
                                <span className="font-semibold text-green-600">{member.metrics.replied}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pending</span>
                                <span className="font-semibold text-yellow-600">{member.metrics.pending}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Overdue</span>
                                <span className="font-semibold text-red-600">{member.metrics.overdue}</span>
                              </div>
                            </div>
                          </div>

                          {/* Response Time */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              Response Time
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Average</span>
                                <span className="font-semibold">{formatTime(member.metrics.avgReplyTimeMinutes)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Resolution Rate</span>
                                <span className="font-semibold">{member.metrics.resolutionRate}%</span>
                              </div>
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-muted-foreground">Workload</span>
                                  <span className="text-sm font-medium">{Math.round(getWorkloadPercentage(member))}%</span>
                                </div>
                                <Progress value={getWorkloadPercentage(member)} className="h-2" />
                              </div>
                            </div>
                          </div>

                          {/* Status & Alerts */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-primary" />
                              Status
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Account Status</span>
                                <Badge className={cn("text-xs", status.badgeClasses)}>
                                  {status.text}
                                </Badge>
                              </div>
                              {member.metrics.overdue > 0 && (
                                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
                                  <p className="text-sm text-red-200 font-medium">
                                    ⚠️ {member.metrics.overdue} overdue emails
                                  </p>
                                </div>
                              )}
                              {member.metrics.pending > 10 && (
                                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                                  <p className="text-sm text-amber-200 font-medium">
                                    📊 High workload: {member.metrics.pending} pending
                                  </p>
                                </div>
                              )}
                              {member.metrics.resolutionRate >= 90 && member.metrics.overdue === 0 && (
                                <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                                  <p className="text-sm text-green-200 font-medium">
                                    ✅ Excellent performance
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Eye className="w-4 h-4 text-primary" />
                              Actions
                            </h4>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewMemberDetails?.(member)}
                                className="w-full justify-start"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Detailed KPIs
                              </Button>
                              {onDeleteTeamMember && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDeleteTeamMember(member.id)}
                                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove Member
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                View Assigned Emails
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Performance History
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}