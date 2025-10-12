import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails, emailReplies, emailProviders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { google } from 'googleapis';

// Resolve app URL consistently across environments
const appUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    // Validate ID parameter
    const { id } = await params;
    const emailId = id;
    if (!emailId || isNaN(parseInt(emailId))) {
      return NextResponse.json(
        { error: 'Valid email ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { replyContent } = body;

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Validate replyContent is provided
    if (!replyContent) {
      return NextResponse.json(
        { error: 'Reply content is required', code: 'MISSING_REPLY_CONTENT' },
        { status: 400 }
      );
    }

    // Validate replyContent is non-empty string
    if (typeof replyContent !== 'string' || replyContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply content cannot be empty', code: 'EMPTY_REPLY_CONTENT' },
        { status: 400 }
      );
    }

    // Check if email exists and belongs to authenticated user
    const existingEmail = await db
      .select()
      .from(emails)
      .where(and(eq(emails.id, parseInt(emailId)), eq(emails.userId, user.id)))
      .limit(1);

    if (existingEmail.length === 0) {
      return NextResponse.json(
        { error: 'Email not found', code: 'EMAIL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const email = existingEmail[0];
    const currentTimestamp = new Date();

    // Get email provider to send through Gmail
    let provider;
    
    if (email.providerId) {
      // Try to get specific provider
      provider = await db
        .select()
        .from(emailProviders)
        .where(
          and(
            eq(emailProviders.id, email.providerId),
            eq(emailProviders.userId, user.id)
          )
        )
        .limit(1);
    }
    
    // If no provider found or email doesn't have providerId, get any active Gmail provider for user
    if (!provider || provider.length === 0) {
      provider = await db
        .select()
        .from(emailProviders)
        .where(
          and(
            eq(emailProviders.userId, user.id),
            eq(emailProviders.provider, 'gmail'),
            eq(emailProviders.isActive, true)
          )
        )
        .limit(1);
    }

    if (!provider || provider.length === 0) {
      return NextResponse.json(
        { error: 'No active Gmail provider found. Please connect your Gmail account in Settings.', code: 'PROVIDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Send email through Gmail API
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${appUrl}/api/oauth/gmail/callback`
      );

      oauth2Client.setCredentials({
        access_token: provider[0].accessToken,
        refresh_token: provider[0].refreshToken,
      });

      // Handle token refresh if needed
      oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
          await db
            .update(emailProviders)
            .set({
              accessToken: tokens.access_token,
              tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000),
            })
            .where(eq(emailProviders.id, provider[0].id));
        }
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Create email message
      const to = email.senderEmail;
      const from = provider[0].email;
      const subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
      
      const messageParts = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `In-Reply-To: ${email.externalId}`,
        `References: ${email.externalId}`,
        '',
        replyContent.trim(),
      ];
      
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId: email.threadId || undefined,
        },
      });

    } catch (gmailError) {
      console.error('Gmail send error:', gmailError);
      return NextResponse.json(
        { error: 'Failed to send email through Gmail', code: 'GMAIL_SEND_FAILED' },
        { status: 500 }
      );
    }

    // Create reply record
    const newReply = await db
      .insert(emailReplies)
      .values({
        emailId: parseInt(emailId),
        userId: user.id,
        replyContent: replyContent.trim(),
        sentAt: currentTimestamp,
      })
      .returning();

    // Update email record
    const updatedEmail = await db
      .update(emails)
      .set({
        status: 'replied',
        isResolved: true,
        firstReplyAt: email.firstReplyAt || currentTimestamp,
      })
      .where(and(eq(emails.id, parseInt(emailId)), eq(emails.userId, user.id)))
      .returning();

    return NextResponse.json(
      {
        reply: newReply[0],
        email: updatedEmail[0],
        message: 'Reply sent successfully through Gmail',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/emails/[id]/reply error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}