/**
 * EmailMessageRenderer Component
 * 
 * Professional email rendering using the emailSanitizer module
 * Renders emails Zendesk-style with XSS protection
 */

"use client";

import React, { useEffect, useState } from 'react';
import { sanitizeEmailHTML } from '@/lib/emailSanitizer';
import { Loader2 } from 'lucide-react';

interface EmailMessageRendererProps {
  htmlContent: string;
  className?: string;
  onImageLoad?: (img: HTMLImageElement) => void;
}

/**
 * Renders HTML email content safely with:
 * - XSS protection via sanitize-html
 * - Professional Zendesk-style formatting
 * - Forwarded message collapsing
 * - Quote detection and styling
 * - Signature removal
 * - Tracking URL truncation
 */
export function EmailMessageRenderer({ 
  htmlContent, 
  className = "",
  onImageLoad 
}: EmailMessageRendererProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function sanitize() {
      try {
        setIsLoading(true);
        const cleaned = await sanitizeEmailHTML(htmlContent, {
          removeSignatures: true,
          collapseQuotes: true,
          truncateTrackingUrls: true,
          maxImageWidth: 600,
        });
        setSanitizedHtml(cleaned);
      } catch (error) {
        console.error('Email sanitization error:', error);
        setSanitizedHtml('<p style="color: #ef4444;">Failed to load email content</p>');
      } finally {
        setIsLoading(false);
      }
    }

    if (htmlContent) {
      sanitize();
    } else {
      setSanitizedHtml('');
      setIsLoading(false);
    }
  }, [htmlContent]);

  useEffect(() => {
    // Post-processing for images
    const container = document.getElementById('email-content-container');
    if (!container) return;

    const images = container.querySelectorAll('img');
    images.forEach(img => {
      if (onImageLoad) {
        img.onload = () => onImageLoad(img as HTMLImageElement);
      }
    });
  }, [sanitizedHtml, onImageLoad]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!htmlContent || !sanitizedHtml) {
    return (
      <div className={`text-sm text-gray-500 italic ${className}`}>
        No content available
      </div>
    );
  }

  return (
    <div 
      id="email-content-container"
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

/**
 * Component for rendering quoted/threaded email content
 */
interface QuotedEmailProps {
  content: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function QuotedEmail({ content, isExpanded = false, onToggle }: QuotedEmailProps) {
  return (
    <div className="my-4 border-l-4 border-gray-300 pl-4">
      {!isExpanded && (
        <button
          onClick={onToggle}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>···</span>
          <span>Show quoted text</span>
        </button>
      )}
      {isExpanded && (
        <div className="space-y-2">
          <button
            onClick={onToggle}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Hide quoted text
          </button>
          <EmailMessageRenderer htmlContent={content} className="text-gray-600" />
        </div>
      )}
    </div>
  );
}
