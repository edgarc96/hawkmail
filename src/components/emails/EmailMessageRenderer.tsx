"use client";

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface EmailMessageRendererProps {
  htmlContent: string;
  className?: string;
  onImageLoad?: (img: HTMLImageElement) => void;
}

/**
 * Renders HTML email content safely with:
 * - XSS protection via DOMPurify
 * - Inline image handling (cid: protocol)
 * - Quote collapsing
 * - Link target="_blank" enforcement
 */
export function EmailMessageRenderer({ 
  htmlContent, 
  className = "",
  onImageLoad 
}: EmailMessageRendererProps) {
  
  const sanitizedHtml = useMemo(() => {
    if (!htmlContent) return "";

    // DOMPurify configuration for email content
    const cleanHtml = DOMPurify.sanitize(htmlContent, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'p', 'div', 'span', 'br', 'strong', 'em', 'u', 'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'td', 'th',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'hr', 'b', 'i', 's', 'strike', 'del', 'ins',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'style', 'class',
        'width', 'height', 'border', 'cellpadding', 'cellspacing',
        'align', 'valign', 'bgcolor', 'color',
      ],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      ADD_ATTR: ['target'], // For forcing target="_blank" on links
      FORCE_BODY: true,
    });

    return cleanHtml;
  }, [htmlContent]);

  React.useEffect(() => {
    // Post-processing for links and images
    const container = document.getElementById('email-content-container');
    if (!container) return;

    // Force all links to open in new tab
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    // Handle inline images
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      // Add loading indicator
      img.classList.add('email-inline-image');
      
      // Handle cid: protocol (inline attachments)
      const src = img.getAttribute('src');
      if (src?.startsWith('cid:')) {
        // You'll need to fetch this from your attachments API
        const cid = src.replace('cid:', '');
        // TODO: Replace with actual attachment lookup
        console.log('Inline image CID:', cid);
      }

      if (onImageLoad) {
        img.onload = () => onImageLoad(img as HTMLImageElement);
      }
    });
  }, [sanitizedHtml, onImageLoad]);

  if (!htmlContent) {
    return (
      <div className={`text-sm text-gray-500 italic ${className}`}>
        No content available
      </div>
    );
  }

  return (
    <div 
      id="email-content-container"
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      style={{
        // Email-specific styling
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      }}
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
