"use client";

import React, { useEffect, useRef } from 'react';

interface EmailRendererProps {
  htmlContent: string;
  className?: string;
}

export function EmailRenderer({ htmlContent, className = "" }: EmailRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !htmlContent) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    // Create a clean, professional email template
    const processedHTML = processEmailHTML(htmlContent);
    
    // Write the processed HTML to the iframe
    doc.open();
    doc.write(\`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #334155;
              max-width: 100%;
              margin: 0;
              padding: 16px;
              background-color: #ffffff;
            }
            a {
              color: #3b82f6;
              text-decoration: none;
              border-bottom: 1px dotted #3b82f6;
            }
            a:hover {
              color: #2563eb;
              border-bottom-style: solid;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #1e293b;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            p {
              margin-bottom: 1em;
            }
            ul, ol {
              padding-left: 2em;
              margin-bottom: 1em;
            }
            blockquote {
              border-left: 4px solid #e2e8f0;
              padding-left: 1em;
              margin: 1em 0;
              color: #64748b;
              font-style: italic;
            }
            code {
              background-color: #f1f5f9;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: 'Courier New', Courier, monospace;
              font-size: 0.9em;
            }
            pre {
              background-color: #f1f5f9;
              padding: 1em;
              border-radius: 6px;
              overflow-x: auto;
            }
            pre code {
              background-color: transparent;
              padding: 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1em;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 0.75em;
              text-align: left;
            }
            th {
              background-color: #f8fafc;
              font-weight: 600;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            /* Special styling for tracking links */
            a[href*="hubspotlinks.com"],
            a[href*="hs-"] {
              display: inline-block;
              background-color: #f1f5f9;
              color: #475569;
              padding: 0.25em 0.5em;
              border-radius: 4px;
              font-size: 0.8em;
              text-decoration: none;
              border-bottom: none;
              margin: 0.25em 0;
            }
          </style>
        </head>
        <body>
          \${processedHTML}
        </body>
      </html>
    \`);
    doc.close();
  }, [htmlContent]);

  if (!htmlContent) {
    return (
      <div className={\`text-gray-500 italic \${className}\`}>
        No email content available
      </div>
    );
  }

  return (
    <div className={\`w-full \${className}\`}>
      <iframe
        ref={iframeRef}
        className="w-full h-full min-h-[400px] border-0 rounded-lg"
        title="Email Content"
        sandbox="allow-same-origin"
      />
    </div>
  );
}

// Function to process and clean email HTML
function processEmailHTML(html: string): string {
  if (!html) return '';
  
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Process links to make them more readable
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.includes('hubspotlinks.com') || href.includes('hs-'))) {
      // This is a tracking link, make it more apparent
      link.textContent = '🔗 Tracking Link';
      link.title = 'This is a tracking link';
    }
  });
  
  // Remove any script tags for security
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Return the processed HTML
  return tempDiv.innerHTML;
}
