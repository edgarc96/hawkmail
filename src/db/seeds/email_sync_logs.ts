import { db } from '@/db';
import { emailSyncLogs } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleSyncLogs = [
        {
            providerId: 1,
            userId: 'user_demo_001',
            syncStatus: 'success',
            emailsProcessed: 47,
            errorMessage: null,
            startedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
            completedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000 + 2 * 60 * 1000),
            createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        },
        {
            providerId: 2,
            userId: 'user_demo_001',
            syncStatus: 'success',
            emailsProcessed: 33,
            errorMessage: null,
            startedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
            completedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000 + 90 * 1000),
            createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        },
        {
            providerId: 1,
            userId: 'user_demo_001',
            syncStatus: 'failed',
            emailsProcessed: 12,
            errorMessage: 'Authentication failed: Token expired',
            startedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
            completedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000 + 30 * 1000),
            createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        },
        {
            providerId: 2,
            userId: 'user_demo_001',
            syncStatus: 'success',
            emailsProcessed: 28,
            errorMessage: null,
            startedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            completedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000 + 60 * 1000),
            createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        },
        {
            providerId: 1,
            userId: 'user_demo_001',
            syncStatus: 'in_progress',
            emailsProcessed: 15,
            errorMessage: null,
            startedAt: new Date(now.getTime() - 2 * 60 * 1000),
            completedAt: null,
            createdAt: new Date(now.getTime() - 2 * 60 * 1000),
        },
    ];

    await db.insert(emailSyncLogs).values(sampleSyncLogs);
    
    console.log('✅ Email sync logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});