import { db } from '@/db';
import { emailProviders } from '@/db/schema';

async function main() {
    const now = Date.now();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
    const tenMinutesAgo = new Date(now - 10 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const twentyDaysAgo = new Date(now - 20 * 24 * 60 * 60 * 1000);

    const sampleProviders = [
        {
            userId: 'user_demo_001',
            provider: 'gmail',
            email: 'demo.user@gmail.com',
            accessToken: 'ya29.mock_gmail_access_token_abcdef123456',
            refreshToken: '1//mock_gmail_refresh_token_xyz789',
            tokenExpiresAt: fiveMinutesAgo,
            scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
            isActive: true,
            lastSyncAt: fiveMinutesAgo,
            webhookChannelId: 'gmail-channel-uuid-12345',
            webhookResourceId: 'gmail-resource-xyz789',
            createdAt: thirtyDaysAgo,
            updatedAt: fiveMinutesAgo,
        },
        {
            userId: 'user_demo_001',
            provider: 'outlook',
            email: 'demo.user@outlook.com',
            accessToken: 'EwBwA8mock_outlook_access_token_qwerty456',
            refreshToken: 'M.R3_mock_outlook_refresh_token_asdf123',
            tokenExpiresAt: tenMinutesAgo,
            scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send',
            isActive: true,
            lastSyncAt: tenMinutesAgo,
            webhookChannelId: null,
            webhookResourceId: 'outlook-subscription-uuid-67890',
            createdAt: twentyDaysAgo,
            updatedAt: tenMinutesAgo,
        },
    ];

    await db.insert(emailProviders).values(sampleProviders);
    
    console.log('✅ Email providers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});