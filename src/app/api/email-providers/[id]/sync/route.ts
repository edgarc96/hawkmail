import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailProviders, emailSyncLogs, emails, responseMetrics } from '@/db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { google } from 'googleapis';

// Robust MIME header decoder
function decodeMimeHeader(text: string): string {
  if (!text) return "";
  
  try {
    // Pattern for encoded words: =?charset?encoding?encoded-text?=
    const pattern = /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g;
    
    let decoded = text;
    let match;
    
    // Keep decoding until no more encoded words are found
    while ((match = pattern.exec(decoded)) !== null) {
      const fullMatch = match[0];
      const charset = match[1];
      const encoding = match[2].toUpperCase();
      const encodedText = match[3];
      
      let decodedPart = '';
      
      if (encoding === 'B') {
        // Base64 decoding
        try {
          const buffer = Buffer.from(encodedText, 'base64');
          decodedPart = buffer.toString('utf-8');
        } catch (e) {
          console.error('Base64 decode error:', e);
          decodedPart = encodedText;
        }
      } else if (encoding === 'Q') {
        // Quoted-Printable decoding
        try {
          let qpDecoded = encodedText
            .replace(/_/g, ' ')
            .replace(/=([0-9A-F]{2})/gi, (_: string, hex: string) => {
              return String.fromCharCode(parseInt(hex, 16));
            });
          decodedPart = qpDecoded;
        } catch (e) {
          console.error('Quoted-printable decode error:', e);
          decodedPart = encodedText;
        }
      }
      
      // Replace the encoded part with decoded text
      decoded = decoded.replace(fullMatch, decodedPart);
      // Reset regex for next iteration
      pattern.lastIndex = 0;
    }
    
    return decoded;
  } catch (error) {
    console.error('MIME header decode error:', error);
    return text; // Return original on error
  }
}

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
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const user = session.user;

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid provider ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const providerId = parseInt(id);

    const provider = await db
      .select()
      .from(emailProviders)
      .where(
        and(
          eq(emailProviders.id, providerId),
          eq(emailProviders.userId, user.id)
        )
      )
      .limit(1);

    if (provider.length === 0) {
      return NextResponse.json(
        { error: 'Provider not found', code: 'PROVIDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!provider[0].isActive) {
      return NextResponse.json(
        { error: 'Provider is not active', code: 'PROVIDER_INACTIVE' },
        { status: 400 }
      );
    }

    const now = new Date();

    const syncLog = await db
      .insert(emailSyncLogs)
      .values({
        providerId: providerId,
        userId: user.id,
        syncStatus: 'in_progress',
        startedAt: now,
        emailsProcessed: 0,
        createdAt: now,
      })
      .returning();

    // Execute sync immediately (not in background) for better UX
    const result = await syncGmailEmails(provider[0], user.id, syncLog[0].id);

    // ALWAYS calculate metrics after sync (even if no new emails)
    if (result.success) {
      try {
        console.log('[Sync] Calculating metrics...');
        await calculateMetrics(user.id);
        console.log('[Sync] Metrics calculated successfully');
      } catch (error) {
        console.error('[Sync] Failed to calculate metrics:', error);
      }
    }

    return NextResponse.json(
      {
        message: result.success ? 'Sync completed' : 'Sync failed',
        syncLogId: syncLog[0].id,
        status: result.success ? 'success' : 'failed',
        emailsProcessed: result.emailsProcessed,
        totalFound: result.totalFound,
        skipped: result.skipped,
        errors: result.errors,
        errorDetails: result.errorDetails,
        provider: provider[0],
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

async function syncGmailEmails(provider: any, userId: string, syncLogId: number): Promise<{ success: boolean; emailsProcessed: number; skipped: number; errors: number; totalFound: number; errorDetails?: string[] }> {
  console.log(`🔵 [Sync ${syncLogId}] Starting Gmail sync v2 (no bodyContent) for provider ${provider.id}, Email: ${provider.email}`);
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/oauth/gmail/callback`
    );

    oauth2Client.setCredentials({
      access_token: provider.accessToken,
      refresh_token: provider.refreshToken,
    });

    console.log(`[Sync ${syncLogId}] OAuth client configured`);
    
    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await db
          .update(emailProviders)
          .set({
            accessToken: tokens.access_token,
            tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000),
          })
          .where(eq(emailProviders.id, provider.id));
      }
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get emails from last 7 days (optimized for faster sync)
    // Search in inbox OR sent (to catch emails sent to yourself)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const query = `(in:inbox OR in:sent) after:${Math.floor(sevenDaysAgo.getTime() / 1000)}`;

    console.log(`📧 [Sync ${syncLogId}] Fetching emails with query: ${query}`);
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50, // Reduced to 50 for faster sync
    });

    const messages = response.data.messages || [];
    console.log(`✅ [Sync ${syncLogId}] Found ${messages.length} messages in Gmail`);
    
    if (messages.length === 0) {
      console.log(`⚠️ [Sync ${syncLogId}] No messages found in the last 7 days. Check your Gmail.`);
      
      // Update sync log even if no messages
      await db
        .update(emailSyncLogs)
        .set({
          syncStatus: 'success',
          emailsProcessed: 0,
          completedAt: new Date(),
        })
        .where(eq(emailSyncLogs.id, syncLogId));
        
      return { success: true, emailsProcessed: 0, skipped: 0, errors: 0, totalFound: 0 };
    }
    
    console.log(`📋 [Sync ${syncLogId}] Message IDs found: ${messages.map(m => m.id).slice(0, 5).join(', ')}${messages.length > 5 ? '...' : ''}`);
    let emailsProcessed = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errorDetails: string[] = [];

    // Process messages in parallel batches of 10 for faster sync
    const batchSize = 10;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (message) => {
        try {
          const emailData = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full',
          });

        const headers = emailData.data.payload?.headers || [];
        const subjectRaw = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
        const fromRaw = headers.find((h) => h.name === 'From')?.value || 'Unknown';
        const toRaw = headers.find((h) => h.name === 'To')?.value || provider.email;
        const dateStr = headers.find((h) => h.name === 'Date')?.value;
        const receivedAt = dateStr ? new Date(dateStr) : new Date();
        
        // Decode MIME encoded headers
        const subject = decodeMimeHeader(subjectRaw);
        const from = decodeMimeHeader(fromRaw);
        const to = decodeMimeHeader(toRaw);

        // Extract email body content
        let bodyContent = '';
        if (emailData.data.payload?.parts) {
          // Multipart email - find text/plain part
          for (const part of emailData.data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              bodyContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
              break;
            }
          }
          // If no text/plain found, try text/html
          if (!bodyContent) {
            for (const part of emailData.data.payload.parts) {
              if (part.mimeType === 'text/html' && part.body?.data) {
                bodyContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
                break;
              }
            }
          }
        } else if (emailData.data.payload?.body?.data) {
          // Single part email
          bodyContent = Buffer.from(emailData.data.payload.body.data, 'base64').toString('utf-8');
        }

        // Calculate SLA deadline (24 hours by default)
        const slaDeadline = new Date(receivedAt);
        slaDeadline.setHours(slaDeadline.getHours() + 24);

        // Check if email already exists
        const existingEmail = await db
          .select()
          .from(emails)
          .where(and(
            eq(emails.externalId, message.id!),
            eq(emails.userId, userId)
          ))
          .limit(1);

        if (existingEmail.length === 0) {
          console.log(`💾 [Sync ${syncLogId}] Inserting NEW email - Subject: "${subject.substring(0, 50)}...", From: ${from}`);
          
          // Prepare insert data with explicit typing for LibSQL/Turso compatibility
          // NOTE: bodyContent removed temporarily - column doesn't exist in production DB yet
          const emailInsertData = {
            userId,
            subject,
            senderEmail: from,
            recipientEmail: to,
            // bodyContent: bodyContent || null, // TODO: Add this column to production DB
            receivedAt,
            slaDeadline,
            status: 'pending' as const,
            priority: 'medium' as const,
            isResolved: false,
            providerId: provider.id,
            externalId: message.id!,
            threadId: emailData.data.threadId || null,
            createdAt: new Date(),
          };
          
          console.log(`🔍 [Sync ${syncLogId}] Insert data:`, {
            userId: emailInsertData.userId,
            subject: emailInsertData.subject.substring(0, 30),
            from: emailInsertData.senderEmail.substring(0, 30),
            receivedAt: emailInsertData.receivedAt,
            isResolved: emailInsertData.isResolved,
          });
          
          await db.insert(emails).values(emailInsertData);
          emailsProcessed++;
          console.log(`✅ [Sync ${syncLogId}] Successfully inserted email #${emailsProcessed}`);
        } else {
          skippedCount++;
          console.log(`⏭️  [Sync ${syncLogId}] Email already exists (${skippedCount} skipped) - Subject: "${subject.substring(0, 50)}..."`);
        }
        } catch (emailError) {
          errorCount++;
          const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
          const fullError = emailError instanceof Error && 'cause' in emailError 
            ? `${errorMsg} | Cause: ${(emailError.cause as any)?.message || emailError.cause}`
            : errorMsg;
          errorDetails.push(`Email ${message.id}: ${fullError}`);
          console.error(`❌ [Sync ${syncLogId}] ERROR #${errorCount} processing email ${message.id}:`, emailError);
        }
      }));
    }

    // Update sync log as completed
    await db
      .update(emailSyncLogs)
      .set({
        syncStatus: 'success',
        emailsProcessed,
        completedAt: new Date(),
      })
      .where(eq(emailSyncLogs.id, syncLogId));

    // Update provider lastSyncAt
    await db
      .update(emailProviders)
      .set({
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emailProviders.id, provider.id));

    console.log(`🎉 [Sync ${syncLogId}] Gmail sync completed! Processed ${emailsProcessed} NEW emails, ${skippedCount} already existed, ${errorCount} errors, ${messages.length} total found`);
    
    if (errorCount > 0) {
      console.warn(`⚠️ [Sync ${syncLogId}] Warning: ${errorCount} emails failed to process. Check errors above.`);
    }
    
    return { 
      success: true, 
      emailsProcessed, 
      skipped: skippedCount,
      errors: errorCount,
      totalFound: messages.length,
      errorDetails: errorDetails.length > 0 ? errorDetails.slice(0, 5) : undefined // Only first 5 errors
    };
  } catch (error) {
    console.error(`❌ [Sync ${syncLogId}] Gmail sync error:`, error);
    
    // Update sync log as failed
    await db
      .update(emailSyncLogs)
      .set({
        syncStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      })
      .where(eq(emailSyncLogs.id, syncLogId));
    
    return { success: false, emailsProcessed: 0, skipped: 0, errors: 1, totalFound: 0, errorDetails: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

async function calculateMetrics(userId: string) {
  console.log('[calculateMetrics] Starting for user:', userId);
  
  // Get last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyMetrics = await db
    .select({
      date: sql<string>`DATE(${emails.receivedAt})`,
      avgFirstReplyTimeMinutes: sql<number>`
        CAST(AVG(
          CASE 
            WHEN ${emails.firstReplyAt} IS NOT NULL 
            THEN (julianday(${emails.firstReplyAt}) - julianday(${emails.receivedAt})) * 24 * 60
            ELSE NULL
          END
        ) AS INTEGER)
      `,
      totalEmails: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      repliedCount: sql<number>`CAST(SUM(CASE WHEN ${emails.firstReplyAt} IS NOT NULL THEN 1 ELSE 0 END) AS INTEGER)`,
      overdueCount: sql<number>`CAST(SUM(CASE WHEN ${emails.status} = 'overdue' THEN 1 ELSE 0 END) AS INTEGER)`,
      resolutionRate: sql<number>`
        CAST(SUM(CASE WHEN ${emails.isResolved} = 1 THEN 1 ELSE 0 END) AS REAL) / NULLIF(COUNT(*), 0) * 100
      `,
    })
    .from(emails)
    .where(
      and(
        eq(emails.userId, userId),
        gte(emails.receivedAt, thirtyDaysAgo)
      )
    )
    .groupBy(sql`DATE(${emails.receivedAt})`);

  console.log('[calculateMetrics] Found metrics for', dailyMetrics.length, 'days');

  let inserted = 0;
  let updated = 0;

  for (const metric of dailyMetrics) {
    const existing = await db
      .select()
      .from(responseMetrics)
      .where(
        and(
          eq(responseMetrics.userId, userId),
          eq(responseMetrics.date, metric.date)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(responseMetrics).values({
        userId,
        date: metric.date,
        avgFirstReplyTimeMinutes: metric.avgFirstReplyTimeMinutes || 0,
        totalEmails: metric.totalEmails || 0,
        repliedCount: metric.repliedCount || 0,
        overdueCount: metric.overdueCount || 0,
        resolutionRate: metric.resolutionRate || 0,
      });
      inserted++;
    } else {
      await db
        .update(responseMetrics)
        .set({
          avgFirstReplyTimeMinutes: metric.avgFirstReplyTimeMinutes || 0,
          totalEmails: metric.totalEmails || 0,
          repliedCount: metric.repliedCount || 0,
          overdueCount: metric.overdueCount || 0,
          resolutionRate: metric.resolutionRate || 0,
        })
        .where(eq(responseMetrics.id, existing[0].id));
      updated++;
    }
  }

  console.log('[calculateMetrics] Inserted:', inserted, 'Updated:', updated);
}