"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Interaction } from '@/types/ticket';
import { Mail, Phone, MessageSquare, FileText, Ticket, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';

interface InteractionTimelineProps {
  customerId: string;
  currentTicketId: string;
}

interface TimelineEvent {
  id: string;
  type: 'email' | 'phone' | 'chat' | 'note' | 'ticket' | 'status_change' | 'assignment';
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  icon: React.ReactNode;
  color: string;
}

/**
 * Displays chronological interaction history for a customer
 * Similar to Zendesk's activity timeline
 */
export function InteractionTimeline({ customerId, currentTicketId }: InteractionTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual interaction history from API
    // Mock data for now
    const mockEvents: TimelineEvent[] = [
      {
        id: '1',
        type: 'email',
        title: 'Email received',
        description: 'Customer sent initial inquiry about billing issue',
        timestamp: new Date(Date.now() - 3600000),
        icon: <Mail size={16} />,
        color: 'blue',
      },
      {
        id: '2',
        type: 'assignment',
        title: 'Ticket assigned',
        description: 'Assigned to Support Agent',
        timestamp: new Date(Date.now() - 3000000),
        icon: <Ticket size={16} />,
        color: 'purple',
      },
      {
        id: '3',
        type: 'status_change',
        title: 'Status changed',
        description: 'Status changed from New to Open',
        timestamp: new Date(Date.now() - 2400000),
        icon: <FileText size={16} />,
        color: 'orange',
      },
      {
        id: '4',
        type: 'note',
        title: 'Internal note added',
        description: 'Agent reviewed account history',
        timestamp: new Date(Date.now() - 1800000),
        icon: <MessageSquare size={16} />,
        color: 'gray',
      },
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
    }, 500);
  }, [customerId]);

  const getEventColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 border-blue-300',
      purple: 'bg-purple-100 text-purple-600 border-purple-300',
      orange: 'bg-orange-100 text-orange-600 border-orange-300',
      gray: 'bg-gray-100 text-gray-600 border-gray-300',
      green: 'bg-green-100 text-green-600 border-green-300',
    };
    return colors[color] || colors.gray;
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock size={16} />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No activity history available
              </p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

                {/* Events */}
                <div className="space-y-6">
                  {events.map((event, index) => (
                    <div key={event.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventColor(event.color)}`}
                      >
                        {event.icon}
                      </div>

                      {/* Event content */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(event.timestamp.toISOString())}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600">{event.description}</p>
                        )}
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
