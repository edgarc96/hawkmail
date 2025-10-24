/**
 * EmailThreadView Component
 * 
 * Example usage of the emailSanitizer module
 * Renders email threads Zendesk-style with sanitized HTML
 */

"use client";

import React, { useEffect, useState } from 'react';
import { sanitizeEmailHTML } from '@/lib/emailSanitizer';
import { Loader2 } from 'lucide-react';

interface EmailThreadViewProps {
  htmlContent: string;
  className?: string;
  onLoad?: () => void;
}

export function EmailThreadView({ 
  htmlContent, 
  className = "",
  onLoad 
}: EmailThreadViewProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function sanitize() {
      try {
        setIsLoading(true);
        setError(null);
        
        const cleaned = await sanitizeEmailHTML(htmlContent, {
          removeSignatures: true,
          collapseQuotes: true,
          truncateTrackingUrls: true,
          maxImageWidth: 600,
        });
        
        setSanitizedHtml(cleaned);
        onLoad?.();
      } catch (err) {
        console.error('Email sanitization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to sanitize email');
      } finally {
        setIsLoading(false);
      }
    }

    if (htmlContent) {
      sanitize();
    }
  }, [htmlContent, onLoad]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-600 bg-red-50 p-4 rounded-md ${className}`}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!sanitizedHtml) {
    return (
      <div className={`text-sm text-gray-500 italic py-4 ${className}`}>
        No content available
      </div>
    );
  }

  return (
    <div 
      className={`email-thread-container ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

/**
 * Example: Email Thread with Multiple Messages
 */
interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  htmlContent: string;
  timestamp: Date;
}

interface EmailThreadProps {
  messages: EmailMessage[];
}

export function EmailThread({ messages }: EmailThreadProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div 
          key={message.id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                  {message.from.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {message.from}
                  </div>
                  <div className="text-xs text-gray-500">
                    to {message.to}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {message.timestamp.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
            <EmailThreadView htmlContent={message.htmlContent} />
          </div>
        </div>
      ))}
    </div>
  );
}
