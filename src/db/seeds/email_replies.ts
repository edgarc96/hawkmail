import { db } from '@/db';
import { emailReplies, emails } from '@/db/schema';

async function main() {
    const existingEmails = await db.select().from(emails);
    
    const emailIdMap = new Map(existingEmails.map(email => [email.id, email]));
    
    const targetEmailIds = [1, 3, 4, 5, 7, 10, 11, 13, 15, 16, 17, 20];
    
    const replyData = [
        {
            emailId: 1,
            content: "Thank you for reporting this critical issue. We have identified the problem with the payment gateway and deployed a fix. The issue was caused by a timeout in our authentication service. Please try processing your payment again, and it should work smoothly now. If you continue to experience any problems, please don't hesitate to reach out.",
            hoursOffset: 1.5
        },
        {
            emailId: 3,
            content: "Thank you for reaching out about the 403 error. I have investigated your account and found that your API credentials had expired. I have generated new API credentials and sent them to your registered email address. Please update your application with the new credentials. The new keys are valid for 365 days.",
            hoursOffset: 2
        },
        {
            emailId: 4,
            content: "To add team members to your account, please follow these steps: 1) Navigate to Settings in the main menu, 2) Click on Team Management in the sidebar, 3) Click the 'Invite Team Member' button, 4) Enter their email address and select their role (Agent or Manager), 5) Click Send Invitation. They will receive an email with instructions to join your team.",
            hoursOffset: 1
        },
        {
            emailId: 5,
            content: "I sincerely apologize for the billing confusion and any inconvenience this has caused. I have reviewed your account and confirmed the duplicate charge. I have initiated a full refund for the duplicate transaction, which should appear in your account within 5-7 business days. I have also added a credit to your account for the inconvenience. Is there anything else I can help you with?",
            hoursOffset: 2.5
        },
        {
            emailId: 7,
            content: "Excel export functionality is available in our Reports section. Here's how to access it: 1) Go to the Analytics dashboard, 2) Navigate to the Reports tab, 3) Select the date range and filters you need, 4) Click the Export button in the top-right corner, 5) Choose 'Excel Format (XLSX)' from the dropdown menu. The export will download automatically. You can export up to 100,000 rows per file.",
            hoursOffset: 1.5
        },
        {
            emailId: 10,
            content: "To enable Two-Factor Authentication (2FA) on your account: 1) Go to Settings > Security, 2) Click 'Enable Two-Factor Authentication', 3) Use your authenticator app (Google Authenticator, Authy, etc.) to scan the QR code displayed, 4) Enter the 6-digit code from your app to verify, 5) Save your backup codes in a secure location. 2FA will be required for all future logins. Let me know if you need any assistance with this process.",
            hoursOffset: 2
        },
        {
            emailId: 11,
            content: "Slack integration is available and easy to set up! Here's how: 1) Navigate to Settings > Integrations, 2) Find 'Slack' in the list of available integrations, 3) Click 'Connect to Slack', 4) You'll be redirected to Slack to authorize the connection, 5) Select the workspace and channel where you want to receive notifications, 6) Click 'Allow' to complete the setup. Once connected, you'll receive real-time notifications for new emails, approaching deadlines, and overdue items.",
            hoursOffset: 1
        },
        {
            emailId: 13,
            content: "I have increased your account's upload limit from 100MB to 200MB and extended the timeout duration from 30 seconds to 60 seconds. These changes are now active on your account. Please try uploading your file again. If you continue to experience any issues with large file uploads, please let me know the file size and type, and I'll investigate further.",
            hoursOffset: 3
        },
        {
            emailId: 15,
            content: "To download your monthly reports: 1) Navigate to Analytics > Reports in the main menu, 2) Select 'Monthly Reports' from the report type dropdown, 3) Choose your desired month from the date picker, 4) Click 'Generate Report', 5) Once generated, click 'Download' and select your preferred format (PDF or Excel). Reports include email volume, response times, SLA compliance, and team performance metrics. You can also schedule automated monthly reports to be sent to your email.",
            hoursOffset: 2
        },
        {
            emailId: 16,
            content: "Thank you for your interest in dark mode! I'm excited to share that this feature is currently in active development and is scheduled for release in our next major update next month. The dark mode will include customizable themes and automatic switching based on system preferences. I've added your account to our early access list, so you'll be among the first to try it when it launches. I'll send you an email as soon as it's available.",
            hoursOffset: 1.5
        },
        {
            emailId: 17,
            content: "I have successfully unlocked your account. The account was locked due to multiple failed login attempts for security purposes. I have sent a temporary password to your registered email address. Please use this password to log in, and you'll be prompted to create a new password immediately. For security, I recommend enabling Two-Factor Authentication to prevent unauthorized access in the future. If you didn't attempt these logins, please let me know immediately.",
            hoursOffset: 2
        },
        {
            emailId: 20,
            content: "Custom domain setup is available on our Enterprise plan, which includes advanced DNS configuration and SSL certificate management. I'd be happy to guide you through the setup process: 1) Add a CNAME record pointing to our servers, 2) Verify domain ownership, 3) Configure SSL certificate (we provide free Let's Encrypt certificates), 4) Set up email routing rules. The entire process typically takes 15-30 minutes. Would you like to schedule a call to walk through the configuration together? I can also provide detailed documentation if you prefer to set it up independently.",
            hoursOffset: 2.5
        }
    ];
    
    const sampleReplies = replyData
        .filter(reply => emailIdMap.has(reply.emailId))
        .map(reply => {
            const email = emailIdMap.get(reply.emailId)!;
            const offsetMilliseconds = reply.hoursOffset * 60 * 60 * 1000;
            const sentAt = new Date(email.receivedAt.getTime() + offsetMilliseconds);
            
            return {
                emailId: reply.emailId,
                userId: 'user_demo_001',
                replyContent: reply.content,
                sentAt: sentAt,
            };
        });
    
    await db.insert(emailReplies).values(sampleReplies);
    
    console.log('✅ Email replies seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});