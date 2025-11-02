import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificationPayload {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmailNotification(payload: NotificationPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Email notifications are disabled.');
    return { success: false, error: 'Email service not configured.' };
  }

  try {
    await resend.emails.send({
      from: 'HawkMail <noreply@hawkmail.com>',
      to: payload.to,
      subject: payload.subject,
      html: `<p>${payload.body}</p>`, // In a real app, you'd use a nice HTML template
    });
    console.log(`Email sent to ${payload.to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
