/**
 * Email Sanitizer for HawkMail
 * Zendesk-style email cleaning and rendering
 * 
 * Features:
 * - XSS protection via sanitize-html
 * - HTML entity decoding
 * - Signature detection and removal
 * - Reply quote conversion to blockquotes
 * - Style normalization (Tailwind-compatible)
 * - Forwarded message detection
 * - Tracking URL truncation
 */

import sanitizeHtml from 'sanitize-html';
import { decode } from 'he';

interface SanitizeOptions {
  removeSignatures?: boolean;
  collapseQuotes?: boolean;
  truncateTrackingUrls?: boolean;
  maxImageWidth?: number;
}

const DEFAULT_OPTIONS: SanitizeOptions = {
  removeSignatures: true,
  collapseQuotes: true,
  truncateTrackingUrls: true,
  maxImageWidth: 600,
};

/**
 * Main sanitization function
 * Cleans raw HTML from Gmail API and returns safe, Zendesk-style HTML
 */
export async function sanitizeEmailHTML(
  rawHtml: string,
  options: SanitizeOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!rawHtml || rawHtml.trim().length === 0) {
    return '<p style="color: #9ca3af; font-style: italic;">No content available</p>';
  }

  // Step 1: Decode HTML entities
  let content = decode(rawHtml);

  // Step 2: Detect if it's plain text (no HTML tags)
  const isPlainText = !/<[^>]+>/.test(content);

  if (isPlainText) {
    content = convertPlainTextToHTML(content, opts);
  } else {
    content = sanitizeHTMLContent(content, opts);
  }

  // Step 3: Inject global styles for uniform rendering
  const styledContent = injectEmailStyles(content);

  return styledContent;
}

/**
 * Convert plain text email to HTML
 */
function convertPlainTextToHTML(
  text: string,
  options: SanitizeOptions
): string {
  let lines = text.split('\n');

  // Remove signature if enabled
  if (options.removeSignatures) {
    lines = removeSignature(lines);
  }

  // Process lines
  const processedLines: string[] = [];
  let inQuote = false;
  let quoteBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      if (inQuote) {
        processedLines.push(createQuoteBlock(quoteBuffer));
        quoteBuffer = [];
        inQuote = false;
      }
      processedLines.push('<br/>');
      continue;
    }

    // Quote line (starts with >)
    if (trimmed.startsWith('>')) {
      inQuote = true;
      quoteBuffer.push(trimmed.replace(/^>\s*/, ''));
      continue;
    }

    // End quote if needed
    if (inQuote) {
      processedLines.push(createQuoteBlock(quoteBuffer));
      quoteBuffer = [];
      inQuote = false;
    }

    // Detect headers (ALL CAPS or ends with :)
    if (
      (trimmed === trimmed.toUpperCase() && trimmed.length < 100) ||
      (trimmed.endsWith(':') && !trimmed.includes('http'))
    ) {
      processedLines.push(`<h4 class="email-heading">${escapeHtml(trimmed)}</h4>`);
      continue;
    }

    // Regular paragraph with URL conversion
    const lineWithLinks = convertUrlsToLinks(line, options.truncateTrackingUrls);
    processedLines.push(`<p>${lineWithLinks}</p>`);
  }

  // Close any remaining quote
  if (inQuote) {
    processedLines.push(createQuoteBlock(quoteBuffer));
  }

  return processedLines.join('\n');
}

/**
 * Remove email client wrapper tables and divs
 * Extracts only the actual content from nested layout tables
 * BUT preserves padding on content-containing cells
 */
function removeEmailWrappers(html: string): string {
  let cleaned = html;
  
  // 1. Convert layout tables to divs, but PRESERVE padding from td elements
  cleaned = cleaned.replace(/<table[^>]*width="100%"[^>]*>/gi, '<div class="email-layout">');
  cleaned = cleaned.replace(/<table[^>]*width="600"[^>]*>/gi, '<div class="email-content-block">');
  cleaned = cleaned.replace(/<\/table>/gi, '</div>');
  
  // 2. Remove tbody tags (not needed for content)
  cleaned = cleaned.replace(/<\/?tbody[^>]*>/gi, '');
  
  // 3. Remove tr tags (just wrappers)
  cleaned = cleaned.replace(/<tr[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/tr>/gi, '');
  
  // 4. Convert td to div BUT PRESERVE padding/margin styles
  cleaned = cleaned.replace(/<td([^>]*)>/gi, (match, attrs) => {
    // Extract padding and margin from style attribute if present
    const styleMatch = attrs.match(/style="([^"]*)"/i);
    if (styleMatch) {
      const style = styleMatch[1];
      // Keep only padding and margin
      const paddingMatch = style.match(/padding[^;]*(;|$)/gi);
      const marginMatch = style.match(/margin[^;]*(;|$)/gi);
      const preservedStyles = [...(paddingMatch || []), ...(marginMatch || [])].join(' ');
      if (preservedStyles) {
        return `<div style="${preservedStyles}">`;
      }
    }
    return '<div class="email-cell">';
  });
  cleaned = cleaned.replace(/<\/td>/gi, '</div>');
  
  // 5. Remove empty divs
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/gi, '');
  
  // 6. Remove class attributes from converted layout divs
  cleaned = cleaned.replace(/<div class="email-layout">/gi, '<div>');
  cleaned = cleaned.replace(/<div class="email-content-block">/gi, '<div>');
  
  // 7. Collapse multiple consecutive <br> tags
  cleaned = cleaned.replace(/(<br\s*\/?>\s*){3,}/gi, '<br/><br/>');
  
  return cleaned;
}

/**
 * Sanitize HTML content (not plain text)
 */
function sanitizeHTMLContent(
  html: string,
  options: SanitizeOptions
): string {
  // Step 1: Remove email client wrapper tables (Gmail, Outlook, Vercel, etc.)
  html = removeEmailWrappers(html);

  // Step 2: Detect and collapse forwarded messages
  html = detectAndCollapseForwarded(html);

  // Step 4: Clean with sanitize-html
  let cleanHtml = sanitizeHtml(html, {
    allowedTags: [
      'p', 'div', 'span', 'br', 'strong', 'em', 'u', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'b', 'i', 's', 'strike', 'del', 'ins',
      'details', 'summary',
    ],
    allowedAttributes: {
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height', 'class'],
      'div': ['class', 'style'],
      'span': ['class', 'style'],
      'p': ['class', 'style'],
      'td': ['colspan', 'rowspan', 'style'],
      'th': ['colspan', 'rowspan', 'style'],
      'blockquote': ['class', 'style'],
      'details': ['class', 'style', 'open'],
      'summary': ['class', 'style'],
      '*': ['class'],
    },
    allowedStyles: {
      '*': {
        'color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(/i, /^rgba\(/i],
        'background-color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(/i, /^rgba\(/i],
        'text-align': [/^left$/i, /^right$/i, /^center$/i],
        'font-weight': [/^\d+$/, /^bold$/i, /^normal$/i],
        'font-style': [/^italic$/i, /^normal$/i],
        'text-decoration': [/^underline$/i, /^none$/i],
        'margin': [/.*/], // Allow all margin formats (top, bottom, left, right, shorthand)
        'margin-top': [/.*/],
        'margin-bottom': [/.*/],
        'margin-left': [/.*/],
        'margin-right': [/.*/],
        'padding': [/.*/], // Allow all padding formats
        'padding-top': [/.*/],
        'padding-bottom': [/.*/],
        'padding-left': [/.*/],
        'padding-right': [/.*/],
        'border': [/.*/],
        'border-left': [/.*/],
        'border-radius': [/^\d+px$/i],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data', 'cid'],
    },
    transformTags: {
      'a': (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
            href: attribs.href || '#',
          },
        };
      },
      'img': (tagName, attribs) => {
        const maxWidth = options.maxImageWidth || 600;
        return {
          tagName: 'img',
          attribs: {
            ...attribs,
            class: 'email-inline-image',
            style: `max-width: ${maxWidth}px; height: auto;`,
          },
        };
      },
    },
  });

  // Step 5: Remove dangerous inline styles and layout styles
  cleanHtml = removeDangerousStyles(cleanHtml);
  cleanHtml = removeLayoutStyles(cleanHtml);

  // Step 6: Normalize Gmail-specific classes
  cleanHtml = cleanHtml.replace(/<div class="gmail_quote"[^>]*>/gi, '<blockquote class="email-quote">');
  cleanHtml = cleanHtml.replace(/<div class="gmail_signature"[^>]*>/gi, '<div class="email-signature">');

  // Step 7: Truncate tracking URLs if enabled
  if (options.truncateTrackingUrls) {
    cleanHtml = truncateTrackingUrls(cleanHtml);
  }

  // Step 8: Remove excessive whitespace
  cleanHtml = cleanHtml.replace(/\s{2,}/g, ' ');
  cleanHtml = cleanHtml.replace(/<p>\s*<\/p>/gi, '');
  cleanHtml = cleanHtml.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br/>');

  return cleanHtml;
}

/**
 * Remove email signatures
 */
function removeSignature(lines: string[]): string[] {
  const signatureMarkers = [
    /^--\s*$/,
    /^_{3,}$/,
    /sent from/i,
    /enviado desde/i,
    /get outlook/i,
    /download.*app/i,
    /this email was sent to/i,
    /unsubscribe/i,
    /© 20\d{2}/,
    /all rights reserved/i,
  ];

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (signatureMarkers.some(marker => marker.test(line))) {
      // Found signature marker, truncate from here
      return lines.slice(0, i);
    }
  }

  return lines;
}

/**
 * Create a blockquote from quote lines
 */
function createQuoteBlock(lines: string[]): string {
  const content = lines.map(line => escapeHtml(line)).join('<br/>');
  return `<blockquote class="email-quote">${content}</blockquote>`;
}

/**
 * Convert URLs in text to clickable links
 */
function convertUrlsToLinks(text: string, truncate: boolean = true): string {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;

  return escapeHtml(text).replace(urlRegex, (url) => {
    const cleanUrl = url.replace(/[)\s]+$/, '');
    let displayUrl = cleanUrl;

    if (truncate && cleanUrl.length > 60) {
      if (isTrackingUrl(cleanUrl)) {
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
}

/**
 * Check if URL is a tracking URL
 */
function isTrackingUrl(url: string): boolean {
  return (
    url.includes('sendgrid.net') ||
    url.includes('click.') ||
    url.includes('/click?') ||
    url.includes('upn=') ||
    url.includes('tracking') ||
    url.includes('redirect')
  );
}

/**
 * Truncate tracking URLs in HTML
 */
function truncateTrackingUrls(html: string): string {
  return html.replace(/<a\s+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, (match, href, text) => {
    if (href.length > 60 && isTrackingUrl(href)) {
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

/**
 * Detect and remove forwarded message headers
 */
function detectAndCollapseForwarded(html: string): string {
  const forwardedRegex = /(-{5,}\s*Forwarded message\s*-{5,})/gi;

  if (!forwardedRegex.test(html)) {
    return html;
  }

  // Split by <br> tags
  const lines = html.split(/<br\s*\/?>/gi);
  let forwardedStart = -1;
  let mainContentStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(-{5,}\s*Forwarded message\s*-{5,})/i.test(line)) {
      forwardedStart = i;
    } else if (forwardedStart >= 0 && mainContentStart < 0) {
      // Check if metadata line
      const stripped = line.replace(/<[^>]+>/g, '').trim();
      if (!/^(De|From|Date|Subject|To):/i.test(stripped) && stripped.length > 0) {
        mainContentStart = i;
        break;
      }
    }
  }

  // Remove forwarded header and metadata, keep only main content
  if (forwardedStart >= 0 && mainContentStart > forwardedStart) {
    const beforeForwarded = lines.slice(0, forwardedStart).join('<br>');
    const mainContent = lines.slice(mainContentStart).join('<br>');
    
    // Combine content before forwarded section (if any) with main content
    return beforeForwarded ? `${beforeForwarded}<br>${mainContent}` : mainContent;
  }

  return html;
}

/**
 * Remove dangerous inline styles
 */
function removeDangerousStyles(html: string): string {
  const dangerousProps = [
    'position',
    'z-index',
    'top',
    'left',
    'right',
    'bottom',
    'position',
    'display: none',
    'visibility: hidden',
    'opacity: 0',
  ];

  let cleaned = html;
  dangerousProps.forEach(prop => {
    const regex = new RegExp(`${prop}\\s*:[^;]+;?`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });

  return cleaned;
}

/**
 * Remove layout styles that create visual containers
 * But preserve padding/margins on actual content containers
 */
function removeLayoutStyles(html: string): string {
  let cleaned = html;
  
  // Remove only specific non-content layout styles
  const layoutProps = [
    'border-collapse:',
    'cellpadding',
    'cellspacing',
  ];
  
  layoutProps.forEach(prop => {
    const regex = new RegExp(`${prop.replace(':', '\\s*:')}[^;"]*;?`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  // Only remove zero borders and 100% widths from layout tables
  cleaned = cleaned.replace(/border:\s*0[px]*[^;]*/gi, '');
  cleaned = cleaned.replace(/border:\s*none[^;]*/gi, '');
  
  // Remove empty style attributes
  cleaned = cleaned.replace(/style=""\s*/gi, '');
  cleaned = cleaned.replace(/style="\s*"\s*/gi, '');
  
  return cleaned;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Inject Zendesk-style CSS into the email content
 */
function injectEmailStyles(content: string): string {
  const styles = `
<style>
/* Zendesk-style Email Rendering */
.email-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* Preserve spacing on content containers */
.email-content > div {
  border: none;
}

/* Don't override inline padding/margin styles from the email */
.email-content div[style*="padding"],
.email-content div[style*="margin"] {
  /* Keep the inline styles - don't override */
}

/* Only add spacing to content elements that don't have their own */
.email-content > div > p,
.email-content > div > div > p {
  margin: 0 0 0.75em 0;
}

/* Preserve top spacing for first content element (like titles in TripleTen emails) */
.email-content > div:first-child,
.email-content > div > div:first-child {
  margin-top: 0;
}

/* Email cells should preserve their padding, or get default spacing */
.email-content .email-cell {
  /* Will inherit padding from inline styles if present */
  /* Default padding if none specified */
}

.email-content .email-cell:not([style*="padding"]) {
  padding: 12px 0;
}

.email-content p {
  margin: 0 0 0.75em 0;
  line-height: 1.5;
}

.email-content p:first-child {
  margin-top: 0;
}

.email-content p:last-child {
  margin-bottom: 0;
}

/* Links */
.email-content a {
  color: #2563eb;
  text-decoration: none;
  word-break: break-word;
}

.email-content a:hover {
  text-decoration: underline;
  color: #1d4ed8;
}

/* Blockquotes - Zendesk style */
.email-content blockquote,
.email-content .email-quote {
  border-left: 3px solid #e5e7eb;
  padding-left: 12px;
  color: #6b7280;
  margin: 12px 0;
  font-size: 13px;
  background-color: #f9fafb;
  padding: 8px 12px;
  border-radius: 4px;
}

/* Headings */
.email-content h1, .email-content h2, .email-content h3, 
.email-content h4, .email-content .email-heading {
  font-weight: 600;
  color: #111827;
  margin: 12px 0 8px 0;
  line-height: 1.3;
}

.email-content h1 { font-size: 20px; }
.email-content h2 { font-size: 18px; }
.email-content h3 { font-size: 16px; }
.email-content h4,
.email-content .email-heading { font-size: 14px; }

/* Images */
.email-content img,
.email-content .email-inline-image {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 12px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: block;
}

/* Tables */
.email-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  font-size: 13px;
}

.email-content table td,
.email-content table th {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: left;
}

.email-content table th {
  background-color: #f9fafb;
  font-weight: 600;
}

/* Lists */
.email-content ul,
.email-content ol {
  margin: 8px 0;
  padding-left: 24px;
}

.email-content li {
  margin: 4px 0;
  line-height: 1.5;
}

/* Code */
.email-content pre,
.email-content code {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
}

.email-content pre {
  padding: 12px;
  overflow-x: auto;
}

/* Forwarded message */
.email-content details.forwarded-message {
  margin: 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.email-content details.forwarded-message[open] {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.email-content details.forwarded-message summary {
  cursor: pointer;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  outline: none;
}

.email-content details.forwarded-message summary::-webkit-details-marker {
  display: none;
}

.email-content details.forwarded-message summary:hover {
  color: #374151;
}

.email-content details.forwarded-message[open] summary svg {
  transform: rotate(90deg);
}

.email-content details.forwarded-message summary svg {
  transition: transform 0.2s ease;
}

.email-content .forwarded-metadata {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
}

/* Horizontal rule */
.email-content hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
}
</style>
`;

  return `${styles}\n<div class="email-content">\n${content}\n</div>`;
}

/**
 * Utility: Extract text content from HTML (for previews, search, etc.)
 */
export function extractTextFromEmail(html: string): string {
  const withoutTags = html.replace(/<[^>]+>/g, ' ');
  const decoded = decode(withoutTags);
  const normalized = decoded.replace(/\s+/g, ' ').trim();
  return normalized;
}

/**
 * Utility: Check if email has attachments
 */
export function hasInlineImages(html: string): boolean {
  return /<img[^>]+src=/i.test(html);
}

/**
 * Utility: Extract all image URLs from email
 */
export function extractImageUrls(html: string): string[] {
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;
  const urls: string[] = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}
