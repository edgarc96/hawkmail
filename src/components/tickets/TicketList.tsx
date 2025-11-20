"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTickets, useTicketFilters, useFilteredTickets, useTicketLoading, useTicketError, useTicketStatuses, useTicketPriorities, useTicketStore } from '@/lib/stores/ticketStore';
import { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';
import { formatRelativeTime } from '@/lib/utils/date';
import { Search, Filter, Plus, Calendar, User, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketListProps {
  onTicketSelect: (ticketId: string) => void;
  selectedTicketId?: string;
}

export function TicketList({ onTicketSelect, selectedTicketId }: TicketListProps) {
  const tickets = useFilteredTickets();
  const allTickets = useTickets();
  const filters = useTicketFilters();
  const isLoading = useTicketLoading();
  const error = useTicketError();
  const ticketStatuses = useTicketStatuses();
  const ticketPriorities = useTicketPriorities();
  const { setFilters, resetFilters } = useTicketStore();
  
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || []);
  const [priorityFilter, setPriorityFilter] = useState(filters.priority || []);
  const [assigneeFilter, setAssigneeFilter] = useState(filters.assignee || []);
  const [dateRangeFilter, setDateRangeFilter] = useState(filters.dateRange || null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply filters when they change
  useEffect(() => {
    setFilters({
      search: debouncedSearchTerm,
      status: statusFilter,
      priority: priorityFilter,
      assignee: assigneeFilter,
      dateRange: dateRangeFilter,
    });
  }, [debouncedSearchTerm, statusFilter, priorityFilter, assigneeFilter, dateRangeFilter, setFilters]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    if (statusFilter.includes(value)) {
      setStatusFilter(statusFilter.filter((status) => status !== value));
    } else {
      setStatusFilter([...statusFilter, value]);
    }
  }, [statusFilter]);

  const handlePriorityChange = useCallback((value: string) => {
    if (priorityFilter.includes(value)) {
      setPriorityFilter(priorityFilter.filter((priority) => priority !== value));
    } else {
      setPriorityFilter([...priorityFilter, value]);
    }
  }, [priorityFilter]);

  const handleAssigneeChange = useCallback((value: string) => {
    if (assigneeFilter.includes(value)) {
      setAssigneeFilter(assigneeFilter.filter((assignee) => assignee !== value));
    } else {
      setAssigneeFilter([...assigneeFilter, value]);
    }
  }, [assigneeFilter]);

  const handleDateRangeChange = useCallback((range: [Date, Date] | null) => {
    setDateRangeFilter(range);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setAssigneeFilter([]);
    setDateRangeFilter(null);
    resetFilters();
  }, [resetFilters]);

  // Memoize color lookups
  const statusColorMap = useMemo(() => {
    return new Map(ticketStatuses.map(s => [s.id, s.color || '#6c757d']));
  }, [ticketStatuses]);

  const priorityColorMap = useMemo(() => {
    return new Map(ticketPriorities.map(p => [p.id, p.color || '#6c757d']));
  }, [ticketPriorities]);

  const getStatusColor = useCallback((statusId: string) => {
    return statusColorMap.get(statusId) || '#6c757d';
  }, [statusColorMap]);

  const getPriorityColor = useCallback((priorityId: string) => {
    return priorityColorMap.get(priorityId) || '#6c757d';
  }, [priorityColorMap]);

  const formatTicketDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 border-t-zd-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="zd-bg-danger/10 border-zd-border-neutral-300">
        <CardHeader>
          <CardTitle className="zd-text-danger flex items-center gap-2">
            <AlertCircle size={20} />
            Error Loading Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="zd-text-neutral-700">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 zd-bg-danger hover:zd-bg-danger-hover text-white">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#12111a] rounded-lg border border-white/10 overflow-hidden">
      {/* Filters & Search Bar */}
      <div className="border-b border-white/10 px-4 py-3 bg-[#12111a]">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 bg-[#18181b] border-white/10 text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter[0] || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? [] : [value])}>
            <SelectTrigger className="w-[180px] bg-[#18181b] border-white/10 text-white">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#18181b] border-white/10 text-white">
              <SelectItem value="all">All statuses</SelectItem>
              {ticketStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter[0] || 'all'} onValueChange={(value) => setPriorityFilter(value === 'all' ? [] : [value])}>
            <SelectTrigger className="w-[180px] bg-[#18181b] border-white/10 text-white">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent className="bg-[#18181b] border-white/10 text-white">
              <SelectItem value="all">All priorities</SelectItem>
              {ticketPriorities.map((priority) => (
                <SelectItem key={priority.id} value={priority.id}>
                  {priority.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter Button */}
          <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/10">
            <Filter size={16} className="mr-2" />
            Filters
          </Button>

          {/* Clear Filters */}
          {(statusFilter.length > 0 || priorityFilter.length > 0 || searchTerm) && (
            <Button onClick={clearAllFilters} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-auto bg-[#12111a]">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200 mb-2">No tickets found</h3>
              <p className="text-gray-500">Try adjusting your filters or create a new ticket</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {tickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              const isPastSLA = ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date();
              
              return (
                <div
                  key={ticket.id}
                  className={cn(
                    "bg-[#12111a] hover:bg-white/5 cursor-pointer transition-colors border-l-4",
                    isSelected ? "bg-violet-500/10 border-l-violet-500" : "border-l-transparent"
                  )}
                  onClick={() => onTicketSelect(ticket.id)}
                >
                  <div className="px-6 py-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Status Indicator */}
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getStatusColor(ticket.status.id) }}
                        />
                        
                        {/* Ticket Subject */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-200 truncate">{ticket.subject}</h3>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                        <Clock size={12} />
                        {formatRelativeTime(typeof ticket.createdAt === 'string' ? ticket.createdAt : ticket.createdAt.toISOString())}
                      </div>
                    </div>

                    {/* Customer & Details Row */}
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] bg-white/10 text-gray-300">
                            {ticket.customerId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">Customer ID: {ticket.customerId.slice(-8)}</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs">#{ticket.id.slice(-6)}</span>
                    </div>

                    {/* Badges Row */}
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          borderColor: getStatusColor(ticket.status.id),
                          color: getStatusColor(ticket.status.id),
                          backgroundColor: `${getStatusColor(ticket.status.id)}10`
                        }}
                      >
                        {ticket.status.name}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          borderColor: getPriorityColor(ticket.priority.id),
                          color: getPriorityColor(ticket.priority.id),
                          backgroundColor: `${getPriorityColor(ticket.priority.id)}10`
                        }}
                      >
                        {ticket.priority.name}
                      </Badge>
                      {isPastSLA && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border-red-500/30">
                          SLA Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
