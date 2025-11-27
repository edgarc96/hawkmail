"use client";

import React from 'react';
import { Customer } from '@/types/ticket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Building, Calendar, TicketIcon } from 'lucide-react';

interface UserProfilePanelProps {
  customer: Customer;
}

export function UserProfilePanel({ customer }: UserProfilePanelProps) {
  return (
    <div className="p-4 space-y-4 bg-[#12111a] h-full border-l border-white/10">
      {/* Customer Avatar & Name */}
      <Card className="bg-[#18181b] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Customer Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={customer.avatar} />
              <AvatarFallback className="text-xl bg-violet-600 text-white">
                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">{customer.name}</h3>
              <p className="text-sm text-gray-400">{customer.email}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-300">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-300">{customer.phone}</span>
              </div>
            )}
            {customer.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building size={16} className="text-gray-400" />
                <span className="text-gray-300">{customer.company}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {customer.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-gray-300 hover:bg-white/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="bg-[#18181b] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Ticket Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Tickets</span>
            <span className="font-semibold text-white">{customer.totalTickets}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Open Tickets</span>
            <span className="font-semibold text-violet-400">{customer.openTickets}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Resolved Tickets</span>
            <span className="font-semibold text-green-400">{customer.resolvedTickets}</span>
          </div>
          {customer.satisfactionScore !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Satisfaction Score</span>
              <span className="font-semibold text-white">{customer.satisfactionScore}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-[#18181b] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-gray-300">
              Customer since {new Date(customer.createdAt).toLocaleDateString()}
            </span>
          </div>
          {customer.lastInteractionAt && (
            <div className="flex items-center gap-2 text-sm">
              <TicketIcon size={14} className="text-gray-400" />
              <span className="text-gray-300">
                Last interaction {new Date(customer.lastInteractionAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Fields */}
      {Object.keys(customer.customFields).length > 0 && (
        <Card className="bg-[#18181b] border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Custom Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(customer.customFields).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium text-white">{String(value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
