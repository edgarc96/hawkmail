import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// Helper function to decode MIME encoded-words (e.g., =?UTF-8?B?...?=)
function decodeMimeHeader(header: string): string {
  if (!header) return "";
  
  // Match MIME encoded-word pattern: =?charset?encoding?encoded-text?=
  const mimePattern = /=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi;
  
  return header.replace(mimePattern, (match, charset, encoding, encodedText) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        // Base64 encoding
        return Buffer.from(encodedText, 'base64').toString('utf-8');
      } else if (encoding.toUpperCase() === 'Q') {
        // Quoted-printable encoding
        const decoded = encodedText
          .replace(/_/g, ' ')
          .replace(/=([0-9A-F]{2})/gi, (_match: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
        return decoded;
      }
    } catch (error) {
      console.error('Error decoding MIME header:', error);
    }
    return match;
  });
}

async function fixEncodingForUser(userId: string) {
  // Get all emails for this user
  const userEmails = await db
    .select()
    .from(emails)
    .where(eq(emails.userId, userId));

  let fixed = 0;
  let errors = 0;

  // Fix encoding for each email
  for (const email of userEmails) {
    try {
      const decodedSubject = decodeMimeHeader(email.subject);
      const decodedSender = decodeMimeHeader(email.senderEmail);
      const decodedRecipient = decodeMimeHeader(email.recipientEmail);

      // Only update if something changed
      if (
        decodedSubject !== email.subject ||
        decodedSender !== email.senderEmail ||
        decodedRecipient !== email.recipientEmail
      ) {
        await db
          .update(emails)
          .set({
            subject: decodedSubject,
            senderEmail: decodedSender,
            recipientEmail: decodedRecipient,
          })
          .where(eq(emails.id, email.id));

        fixed++;
      }
    } catch (error) {
      console.error(`Error fixing email ${email.id}:`, error);
      errors++;
    }
  }

  return {
    message: 'Encoding fix completed',
    total: userEmails.length,
    fixed,
    errors,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await fixEncodingForUser(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/fix-encoding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await fixEncodingForUser(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/fix-encoding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
