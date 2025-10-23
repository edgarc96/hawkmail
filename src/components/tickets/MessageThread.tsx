"use client";

import React, { useState } from 'react';
import { Message } from '@/types/ticket';
import { EmailMessageRenderer, QuotedEmail } from '@/components/emails/EmailMessageRenderer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/date';
import { Paperclip, ChevronDown, ChevronUp } from 'lucide-react';

interface MessageThreadProps {
  messages: Message[];
  ticketId: string;
}

interface MessageItemProps {
  message: Message;
  isLatest: boolean;
}

function MessageItem({ message, isLatest }: MessageItemProps) {
  const [isExpanded, setIsExpanded] = useState(isLatest);
  const [showQuotedText, setShowQuotedText] = useState(false);

  // Detect quoted content (basic heuristic)
  const hasQuotedContent = message.content.includes('<blockquote') || 
                           message.content.includes('&gt;');

  return (
    <div className={`border-b border-gray-200 ${isLatest ? 'bg-blue-50/50' : 'bg-white'}`}>
      {/* Message Header */}
      <div 
        className="p-4 flex items-start justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={message.sender.avatar} />
            <AvatarFallback>
              {message.sender.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{message.sender.name}</span>
              <span className="text-sm text-gray-500">&lt;{message.sender.email}&gt;</span>
              {message.sender.isAgent && (
                <Badge variant="outline" className="text-xs">Agent</Badge>
              )}
              {message.isInternal && (
                <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-300 text-yellow-700">
                  Internal Note
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatRelativeTime(message.timestamp.toISOString())} · To: {message.recipient}
            </div>
            {!isExpanded && (
              <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                {message.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {message.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Paperclip size={16} />
              <span>{message.attachments.length}</span>
            </div>
          )}
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Message Body */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-gray-200 pt-4">
            <EmailMessageRenderer htmlContent={message.content} />
            
            {hasQuotedContent && (
              <QuotedEmail 
                content={message.content}
                isExpanded={showQuotedText}
                onToggle={() => setShowQuotedText(!showQuotedText)}
              />
            )}

            {/* Attachments */}
            {message.attachments.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Attachments ({message.attachments.length})
                </h4>
                <div className="space-y-2">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <Paperclip size={16} className="text-gray-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{attachment.filename}</div>
                        <div className="text-xs text-gray-500">
                          {(attachment.sizeBytes / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Displays email message thread in chronological order (Zendesk style)
 */
export function MessageThread({ messages, ticketId }: MessageThreadProps) {
  const sortedMessages = [...messages].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No messages in this ticket</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {sortedMessages.map((message, index) => (
        <MessageItem 
          key={message.id} 
          message={message}
          isLatest={index === sortedMessages.length - 1}
        />
      ))}
    </div>
  );
}
