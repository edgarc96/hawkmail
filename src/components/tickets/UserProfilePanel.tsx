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
    <div className="p-4 space-y-4">
      {/* Customer Avatar & Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Customer Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={customer.avatar} />
              <AvatarFallback className="text-xl">
                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-600">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-600">{customer.phone}</span>
              </div>
            )}
            {customer.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building size={16} className="text-gray-400" />
                <span className="text-gray-600">{customer.company}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {customer.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Ticket Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Tickets</span>
            <span className="font-semibold">{customer.totalTickets}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Open Tickets</span>
            <span className="font-semibold text-orange-600">{customer.openTickets}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Resolved Tickets</span>
            <span className="font-semibold text-green-600">{customer.resolvedTickets}</span>
          </div>
          {customer.satisfactionScore !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Satisfaction Score</span>
              <span className="font-semibold">{customer.satisfactionScore}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-gray-600">
              Customer since {new Date(customer.createdAt).toLocaleDateString()}
            </span>
          </div>
          {customer.lastInteractionAt && (
            <div className="flex items-center gap-2 text-sm">
              <TicketIcon size={14} className="text-gray-400" />
              <span className="text-gray-600">
                Last interaction {new Date(customer.lastInteractionAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Fields */}
      {Object.keys(customer.customFields).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Custom Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(customer.customFields).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
