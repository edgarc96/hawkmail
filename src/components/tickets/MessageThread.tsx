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
  const [showHeaders, setShowHeaders] = useState(false);

  // Split content into main and quoted parts
  const { mainContent, quotedContent } = React.useMemo(() => {
    let content = message.content;
    let main = content;
    let quoted = '';

    // Try to find blockquotes
    const blockquoteMatch = content.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (blockquoteMatch) {
      main = content.substring(0, blockquoteMatch.index);
      quoted = blockquoteMatch[0];
    } else {
      // Try to find Gmail-style quoted text markers
      const gmailQuoteIdx = content.toLowerCase().indexOf('<div class="gmail_quote">');
      if (gmailQuoteIdx > 0) {
        main = content.substring(0, gmailQuoteIdx);
        quoted = content.substring(gmailQuoteIdx);
      } else {
        // Try to find "On ... wrote:" pattern
        const onWrotePattern = /On .+?wrote:/i;
        const onWroteMatch = content.match(onWrotePattern);
        if (onWroteMatch && onWroteMatch.index) {
          main = content.substring(0, onWroteMatch.index);
          quoted = content.substring(onWroteMatch.index);
        }
      }
    }

    return {
      mainContent: main.trim(),
      quotedContent: quoted.trim()
    };
  }, [message.content]);

  const hasQuotedContent = quotedContent.length > 0;

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
              {formatRelativeTime(message.timestamp.toISOString())}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="text-gray-500">Para:</span>{' '}
              <span className="text-gray-700">
                {Array.isArray((message as any).to)
                  ? (message as any).to.join(', ')
                  : (message.metadata && Array.isArray((message.metadata as any).to))
                    ? (message.metadata as any).to.join(', ')
                    : message.recipient}
              </span>
              <button
                className="ml-2 text-blue-600 hover:text-blue-800"
                onClick={(e) => { e.stopPropagation(); setShowHeaders(!showHeaders); }}
              >
                {showHeaders ? 'Mostrar menos' : 'Mostrar más'}
              </button>
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
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <EmailMessageRenderer htmlContent={mainContent} />
              
              {hasQuotedContent && (
                <div className="mt-4">
                  {!showQuotedText && (
                    <button
                      onClick={() => setShowQuotedText(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>···</span>
                      <span>Mostrar texto citado</span>
                    </button>
                  )}
                  {showQuotedText && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowQuotedText(false)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Ocultar texto citado
                      </button>
                      <div className="border-l-3 border-gray-300 pl-4">
                        <EmailMessageRenderer htmlContent={quotedContent} className="text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

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
