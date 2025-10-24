/**
 * Email Sanitizer - Usage Examples
 * Test cases and integration examples
 */

import { sanitizeEmailHTML, extractTextFromEmail, hasInlineImages } from '../emailSanitizer';

// Example 1: Plain text email with URLs
export const EXAMPLE_PLAIN_TEXT = `
Hello,

Thanks for signing up for TripleTen! 

Check out our course here:
https://tripleten.com/courses/ai-engineering?utm_source=email&utm_medium=tracking12345

Best regards,
The Team

--
Sent from my iPhone
`;

// Example 2: HTML email with inline styles
export const EXAMPLE_HTML_EMAIL = `
<div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
  <h2 style="color: #333;">Welcome to HawkMail!</h2>
  <p style="color: #666; line-height: 1.6;">
    Thanks for joining us. We're excited to have you on board.
  </p>
  <img src="https://example.com/logo.png" width="200" alt="Logo" />
  <p>
    <a href="https://example.com/get-started" style="color: #007bff;">Get Started</a>
  </p>
</div>
`;

// Example 3: Forwarded message
export const EXAMPLE_FORWARDED = `
Hi team,

FYI - see below.

---------- Forwarded message ---------
From: John Doe <john@example.com>
Date: Wed, Oct 23, 2025 at 2:30 PM
Subject: Project Update
To: Jane Smith <jane@example.com>

<p>The project is on track for next week's release.</p>
<p>Let me know if you have any questions.</p>
`;

// Example 4: Email with reply quotes
export const EXAMPLE_WITH_QUOTES = `
> This is great news!
> Thanks for the update.

I agree! Let's move forward with the plan.

> > Original message from last week
> > About the budget approval
`;

// Example 5: Email with signature
export const EXAMPLE_WITH_SIGNATURE = `
<p>Thanks for your email. I'll review and get back to you soon.</p>
<p>Best regards,<br/>
Edgar Cabrera</p>

--
Edgar Cabrera
Software Engineer
HawkMail Inc.
edgar@hawkmail.com
`;

// Example 6: Gmail API raw response (base64 decoded)
export const EXAMPLE_GMAIL_RAW = `
<div dir="ltr">Hi there,<div><br></div><div>Thanks for reaching out!</div><div><br></div><div>Best,</div><div>Support Team</div></div>
`;

// Example 7: Email with tracking URLs
export const EXAMPLE_WITH_TRACKING = `
<p>Click here to view your receipt:</p>
<a href="https://u4683470.ct.sendgrid.net/ls/click?upn=u001.7fRMHT2F4lhm69-2BA8eu72C002BXCN0ux-2Boz6JG9z6gLDbtR2rpKBVXFQ63r2hYRe09DYD">View Receipt</a>
`;

// Example 8: Dangerous HTML (should be sanitized)
export const EXAMPLE_DANGEROUS_HTML = `
<script>alert('XSS')</script>
<p onclick="alert('XSS')">Click me</p>
<iframe src="https://evil.com"></iframe>
<link rel="stylesheet" href="https://evil.com/style.css">
<p style="position: fixed; z-index: 9999; top: 0; left: 0;">Overlay</p>
<p>Safe content here</p>
`;

/**
 * Run all examples
 */
export async function runExamples() {
  console.log('=== Email Sanitizer Examples ===\n');

  // Example 1
  console.log('1. Plain Text Email:');
  const plain = await sanitizeEmailHTML(EXAMPLE_PLAIN_TEXT);
  console.log('Text extracted:', extractTextFromEmail(plain).substring(0, 100));
  console.log('Has images:', hasInlineImages(plain));
  console.log('');

  // Example 2
  console.log('2. HTML Email:');
  const html = await sanitizeEmailHTML(EXAMPLE_HTML_EMAIL);
  console.log('Has images:', hasInlineImages(html));
  console.log('');

  // Example 3
  console.log('3. Forwarded Message:');
  const forwarded = await sanitizeEmailHTML(EXAMPLE_FORWARDED);
  console.log('Contains <details>:', forwarded.includes('<details'));
  console.log('');

  // Example 4
  console.log('4. Email with Quotes:');
  const quotes = await sanitizeEmailHTML(EXAMPLE_WITH_QUOTES);
  console.log('Contains <blockquote>:', quotes.includes('<blockquote'));
  console.log('');

  // Example 5
  console.log('5. Email with Signature (removed):');
  const withSig = await sanitizeEmailHTML(EXAMPLE_WITH_SIGNATURE, {
    removeSignatures: true,
  });
  const withoutSig = await sanitizeEmailHTML(EXAMPLE_WITH_SIGNATURE, {
    removeSignatures: false,
  });
  console.log('Signature removed:', !withSig.includes('--'));
  console.log('Signature kept:', withoutSig.includes('--'));
  console.log('');

  // Example 6
  console.log('6. Gmail Raw HTML:');
  const gmail = await sanitizeEmailHTML(EXAMPLE_GMAIL_RAW);
  console.log('Cleaned successfully');
  console.log('');

  // Example 7
  console.log('7. Tracking URLs:');
  const tracking = await sanitizeEmailHTML(EXAMPLE_WITH_TRACKING, {
    truncateTrackingUrls: true,
  });
  console.log('URL truncated:', tracking.includes('sendgrid.net'));
  console.log('');

  // Example 8
  console.log('8. Dangerous HTML (sanitized):');
  const dangerous = await sanitizeEmailHTML(EXAMPLE_DANGEROUS_HTML);
  console.log('Script removed:', !dangerous.includes('<script'));
  console.log('Onclick removed:', !dangerous.includes('onclick'));
  console.log('Iframe removed:', !dangerous.includes('<iframe'));
  console.log('Safe content kept:', dangerous.includes('Safe content'));
  console.log('');

  return {
    plain,
    html,
    forwarded,
    quotes,
    withSig,
    gmail,
    tracking,
    dangerous,
  };
}

/**
 * Integration with Gmail API
 */
export async function sanitizeGmailMessage(gmailPayload: any): Promise<string> {
  // Extract body from Gmail API response
  let bodyData = '';

  if (gmailPayload.parts) {
    // Multipart email - prefer HTML
    for (const part of gmailPayload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        bodyData = Buffer.from(part.body.data, 'base64').toString('utf-8');
        break;
      }
    }
    // Fallback to plain text
    if (!bodyData) {
      for (const part of gmailPayload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          bodyData = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    }
  } else if (gmailPayload.body?.data) {
    // Single part email
    bodyData = Buffer.from(gmailPayload.body.data, 'base64').toString('utf-8');
  }

  // Sanitize and return
  return await sanitizeEmailHTML(bodyData);
}

/**
 * Integration with React component
 */
export const IntegrationExample = `
// In your ticket detail page:
import { EmailThreadView } from '@/components/emails/EmailThreadView';

export default function TicketDetailPage({ ticketId }) {
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetch(\`/api/tickets/\${ticketId}\`)
      .then(res => res.json())
      .then(data => setTicket(data));
  }, [ticketId]);

  return (
    <div>
      <h1>{ticket?.subject}</h1>
      <EmailThreadView 
        htmlContent={ticket?.bodyContent || ''}
        onLoad={() => console.log('Email loaded')}
      />
    </div>
  );
}
`;
