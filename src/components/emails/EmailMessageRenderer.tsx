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

    let content = htmlContent;

    // Detect if it's plain text (no HTML tags)
    const isPlainText = !/<[^>]+>/.test(content);
    
    if (isPlainText) {
      // Convert URLs to clickable links with smart truncation
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      
      // Split content into main body and footer
      const footerMarkers = [
        'This email was sent to',
        'Unsubscribe:',
        'Email Preferences:',
        'Contact support at:',
        ' 202', // Copyright
        'Use of the service',
        'All rights reserved'
      ];
      
      let lines = content.split('\n');
      let footerStartIndex = lines.length;
      
      // Find where footer starts
      for (let i = 0; i < lines.length; i++) {
        if (footerMarkers.some(marker => lines[i].includes(marker))) {
          footerStartIndex = i;
          break;
        }
      }
      
      // Process only body content (before footer)
      const bodyLines = lines.slice(0, footerStartIndex);
      
      content = bodyLines
        .map(line => {
          if (!line.trim()) return '<br/>';
          
          // Detect quoted lines (starts with >)
          if (line.trim().startsWith('>')) {
            return `<blockquote class="email-quote">${line.replace(/^>\s*/, '')}</blockquote>`;
          }
          
          // Detect headers (ALL CAPS lines or lines ending with :)
          if (line.trim().length > 0 && (
            line.trim() === line.trim().toUpperCase() && line.trim().length < 100 ||
            (line.trim().endsWith(':') && !line.includes('http'))
          )) {
            return `<h3 class="email-heading">${line.trim()}</h3>`;
          }
          
          // Convert URLs to links with smart display
          let processedLine = line.replace(urlRegex, (url) => {
            // Clean up trailing characters
            let cleanUrl = url.replace(/[\)\s]+$/, '');
            
            // Truncate long tracking URLs for display
            let displayUrl = cleanUrl;
            if (cleanUrl.length > 60) {
              // Check if it's a tracking URL (sendgrid, mailchimp, etc.)
              if (cleanUrl.includes('sendgrid.net') || 
                  cleanUrl.includes('click.') || 
                  cleanUrl.includes('/click?') ||
                  cleanUrl.includes('upn=')) {
                // Extract domain for display
                try {
                  const urlObj = new URL(cleanUrl);
                  displayUrl = `${urlObj.hostname}...`;
                } catch {
                  displayUrl = cleanUrl.substring(0, 40) + '...';
                }
              } else {
                displayUrl = cleanUrl.substring(0, 60) + '...';
              }
            }
            
            return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}">${displayUrl}</a>`;
          });
          
          return `<p>${processedLine}</p>`;
        })
        .join('');
        
      // Add collapsed footer if exists
      if (footerStartIndex < lines.length) {
        const footerContent = lines.slice(footerStartIndex).join('\n');
        content += `
          <div class="email-footer" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
            <details style="cursor: pointer;">
              <summary style="color: #5f6368; font-size: 12px;">Ver información del email</summary>
              <div style="margin-top: 10px; color: #5f6368; font-size: 11px; white-space: pre-wrap;">${footerContent}</div>
            </details>
          </div>
        `;
      }
    } else {
      // STEP 1: Detect and collapse forwarded messages (like Zendesk)
      const forwardedRegex = /(-{5,}\s*Forwarded message\s*-{5,}|De:|Date:|Subject:|To:)/gi;
      if (forwardedRegex.test(content)) {
        // Extract forwarded metadata
        const lines = content.split(/<br\s*\/?>/gi);
        let forwardedStart = -1;
        let mainContentStart = -1;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (/(-{5,}\s*Forwarded message\s*-{5,})/i.test(line)) {
            forwardedStart = i;
          } else if (forwardedStart >= 0 && mainContentStart < 0) {
            // Check if this line is metadata (De:, Date:, Subject:, To:)
            if (!/^(De|Date|Subject|To):/i.test(line.replace(/<[^>]+>/g, '').trim())) {
              // First non-metadata line after forwarded header
              mainContentStart = i;
              break;
            }
          }
        }
        
        if (forwardedStart >= 0 && mainContentStart > forwardedStart) {
          // Extract metadata lines
          const metadataLines = lines.slice(forwardedStart + 1, mainContentStart);
          const mainContent = lines.slice(mainContentStart).join('<br>');
          
          // Create collapsed forwarded section
          const metadataHtml = metadataLines
            .map(line => line.replace(/<[^>]+>/g, '').trim())
            .filter(line => line)
            .join('<br>');
          
          content = `
            <details class="forwarded-message" style="margin: 16px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
              <summary style="cursor: pointer; color: #5f6368; font-size: 13px; font-weight: 500; list-style: none; display: flex; align-items: center; gap: 6px;">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style="transform: rotate(0deg); transition: transform 0.2s;">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </svg>
                Forwarded message
              </summary>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #5f6368; line-height: 1.6;">
                ${metadataHtml}
              </div>
            </details>
            ${mainContent}
          `;
        }
      }
      
      // STEP 2: Clean up common email artifacts
      content = content
        // Remove gmail_quote divs but keep the content
        .replace(/<div class="gmail_quote"[^>]*>/gi, '<blockquote class="email-quote">')
        .replace(/<\/div>\s*$/gi, '</blockquote>')
        // Clean up excessive whitespace
        .replace(/\s{2,}/g, ' ')
        // Remove empty paragraphs
        .replace(/<p>\s*<\/p>/gi, '')
        // Clean inline styles that break layout but preserve important ones
        .replace(/style="([^"]*?)font-family:[^;"]*;?/gi, 'style="$1')
        .replace(/style="([^"]*?)font-size:[^;"]*;?/gi, 'style="$1')
        // Ensure images have proper classes
        .replace(/<img([^>]*)>/gi, '<img$1 class="email-inline-image">')
        // Convert tracking URLs in HTML to display versions
        .replace(/<a href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, (match, href, text) => {
          if (href.length > 60 && (href.includes('sendgrid.net') || href.includes('click.') || href.includes('/click?'))) {
            try {
              const urlObj = new URL(href);
              return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${href}">${urlObj.hostname}</a>`;
            } catch {
              return match;
            }
          }
          return match;
        });
    }

    // DOMPurify configuration for email content
    const cleanHtml = DOMPurify.sanitize(content, {
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
      ADD_ATTR: ['target'],
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
      className={`email-content ${className}`}
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
