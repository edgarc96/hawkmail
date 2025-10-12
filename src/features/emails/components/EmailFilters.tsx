"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface EmailFiltersProps {
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

export function EmailFilters({
  searchTerm,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClearFilters,
  onApplyFilters,
}: EmailFiltersProps) {
  return (
    <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
            <Input
              type="text"
              placeholder="Search emails by subject, sender, or recipient..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-[#1a0f2e]/40 border-purple-500/30 text-white placeholder:text-purple-400"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full md:w-40 bg-[#1a0f2e]/40 border-purple-500/30 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-full md:w-40 bg-[#1a0f2e]/40 border-purple-500/30 text-white">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="bg-[#1a0f2e]/40 border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
        >
          <X size={16} className="mr-2" />
          Clear
        </Button>
        <Button
          onClick={onApplyFilters}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Filter size={16} className="mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
}