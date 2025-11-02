"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, CSSProperties } from 'react';
// @ts-ignore - react-window types issue
import { FixedSizeList as List } from 'react-window';
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
  const listRef = useRef<List>(null);

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
    <div className="space-y-6">
      {/* Filters */}
      <Card className="zd-bg-neutral-100 border-zd-border-neutral-200">
        <CardHeader>
          <CardTitle className="zd-text-neutral-800 flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 zd-text-neutral-400" size={16} />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 zd-bg-white border-zd-border-neutral-300 focus:border-zd-primary focus:ring-2 focus:ring-zd-primary/20"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium zd-text-neutral-700 mb-2">Status</label>
            <Select value={statusFilter.join(',')} onValueChange={(value) => setStatusFilter(value ? value.split(',') : [])}>
              <SelectTrigger className="zd-bg-white border-zd-border-neutral-300 focus:border-zd-primary focus:ring-2 focus:ring-zd-primary/20">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {ticketStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status.id)}`}></div>
                      {status.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium zd-text-neutral-700 mb-2">Priority</label>
            <Select value={priorityFilter.join(',')} onValueChange={(value) => setPriorityFilter(value ? value.split(',') : [])}>
              <SelectTrigger className="zd-bg-white border-zd-border-neutral-300 focus:border-zd-primary focus:ring-2 focus:ring-zd-primary/20">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                {ticketPriorities.map((priority) => (
                  <SelectItem key={priority.id} value={priority.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority.id)}`}></div>
                      {priority.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium zd-text-neutral-700 mb-2">Date Range</label>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From"
                value={dateRangeFilter ? dateRangeFilter[0].toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const from = e.target.value ? new Date(e.target.value) : null;
                  const to = dateRangeFilter ? dateRangeFilter[1] : null;
                  setDateRangeFilter(from && to ? [from, to] : null);
                }}
                className="zd-bg-white border-zd-border-neutral-300 focus:border-zd-primary focus:ring-2 focus:ring-zd-primary/20"
              />
              <Input
                type="date"
                placeholder="To"
                value={dateRangeFilter ? dateRangeFilter[1].toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const from = dateRangeFilter ? dateRangeFilter[0] : null;
                  const to = e.target.value ? new Date(e.target.value) : null;
                  setDateRangeFilter(from && to ? [from, to] : null);
                }}
                className="zd-bg-white border-zd-border-neutral-300 focus:border-zd-primary focus:ring-2 focus:ring-zd-primary/20"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <Button onClick={clearAllFilters} variant="outline" className="w-full">
            Clear All Filters
          </Button>
        </CardContent>
      </Card>

      {/* Tickets List with Virtualization */}
      <div>
        {tickets.length === 0 ? (
          <Card className="zd-bg-neutral-100 border-zd-border-neutral-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <Filter size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium zd-text-neutral-700 mb-2">No tickets found</h3>
                <p className="zd-text-neutral-500">Try adjusting your filters or create a new ticket</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <List
            ref={listRef}
            height={Math.min(tickets.length * 200, 800)} // Max height of 800px
            itemCount={tickets.length}
            itemSize={200} // Height of each ticket card
            width="100%"
            className="space-y-4"
          >
            {({ index, style }: { index: number; style: CSSProperties }) => {
              const ticket = tickets[index];
              return (
                <div style={{ ...style, paddingBottom: '16px' }}>
                  <Card
                    className="zd-bg-white border-zd-border-neutral-200 hover:border-zd-primary transition-colors cursor-pointer"
                    onClick={() => onTicketSelect(ticket.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getStatusColor(ticket.status.id) }}
                            ></div>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getPriorityColor(ticket.priority.id) }}
                            ></div>
                            <span className="text-sm zd-text-neutral-500">
                              #{ticket.id.slice(-6)}
                            </span>
                          </div>
                          <h3 className="font-semibold zd-text-neutral-800 mb-1">{ticket.subject}</h3>
                          <p className="text-sm zd-text-neutral-600 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: getStatusColor(ticket.status.id),
                              color: getStatusColor(ticket.status.id),
                            }}
                          >
                            {ticket.status.name}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: getPriorityColor(ticket.priority.id),
                              color: getPriorityColor(ticket.priority.id),
                            }}
                          >
                            {ticket.priority.name}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {ticket.customerId.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs zd-text-neutral-500">
                            Customer ID: {ticket.customerId.slice(-6)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs zd-text-neutral-500">
                          <Clock size={12} />
                          {formatRelativeTime(typeof ticket.createdAt === 'string' ? ticket.createdAt : ticket.createdAt.toISOString())}
                        </div>
                      </div>
                      {ticket.slaDeadline && (
                        <div className="mt-2 flex items-center gap-1">
                          <AlertCircle
                            size={12}
                            className={cn(
                              new Date(ticket.slaDeadline) > new Date()
                                ? "zd-text-warning"
                                : "zd-text-danger"
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs",
                              new Date(ticket.slaDeadline) > new Date()
                                ? "zd-text-warning"
                                : "zd-text-danger"
                            )}
                          >
                            SLA: {formatRelativeTime(typeof ticket.slaDeadline === 'string' ? ticket.slaDeadline : ticket.slaDeadline.toISOString())}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            }}
          </List>
        )}
      </div>
    </div>
  );
}
