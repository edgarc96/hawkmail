"use client";

import { Mail, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { formatTime } from "@/lib/utils/email-helpers";

interface MetricsCardsProps {
  totalEmails: number;
  pendingEmails: number;
  repliedEmails: number;
  overdueEmails: number;
  avgReplyTimeMinutes?: number;
  avgResolutionRate?: number;
  highPriorityEmails?: number;
  variant?: 'dashboard' | 'analytics';
}

export function MetricsCards({
  totalEmails,
  pendingEmails,
  repliedEmails,
  overdueEmails,
  avgReplyTimeMinutes,
  avgResolutionRate,
  highPriorityEmails,
  variant = 'dashboard',
}: MetricsCardsProps) {

  if (variant === 'analytics') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-purple-300 text-sm">Avg Reply Time</p>
              <p className="text-white text-2xl font-bold">{avgReplyTimeMinutes !== undefined ? formatTime(avgReplyTimeMinutes) : 'N/A'}</p>
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
              <p className="text-white text-2xl font-bold">{avgResolutionRate !== undefined ? `${avgResolutionRate.toFixed(1)}%` : 'N/A'}</p>
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
              <p className="text-white text-2xl font-bold">{highPriorityEmails !== undefined ? highPriorityEmails : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600/20 rounded-lg">
            <Mail className="text-purple-400" size={24} />
          </div>
          <div>
            <p className="text-purple-300 text-sm">Total Emails</p>
            <p className="text-white text-2xl font-bold">{totalEmails}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-600/20 rounded-lg">
            <Clock className="text-yellow-400" size={24} />
          </div>
          <div>
            <p className="text-purple-300 text-sm">Pending</p>
            <p className="text-white text-2xl font-bold">{pendingEmails}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-600/20 rounded-lg">
            <CheckCircle className="text-green-400" size={24} />
          </div>
          <div>
            <p className="text-purple-300 text-sm">Replied</p>
            <p className="text-white text-2xl font-bold">{repliedEmails}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/20 rounded-lg">
            <AlertCircle className="text-red-400" size={24} />
          </div>
          <div>
            <p className="text-purple-300 text-sm">Overdue</p>
            <p className="text-white text-2xl font-bold">{overdueEmails}</p>
          </div>
        </div>
      </div>
    </div>
  );
}