import { db } from '@/db';
import { responseMetrics } from '@/db/schema';

async function main() {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const sampleMetrics = [
        {
            userId: 'user_demo_001',
            date: new Date(now - 6 * oneDayMs).toISOString().split('T')[0],
            avgFirstReplyTimeMinutes: 165,
            totalEmails: 35,
            repliedCount: 24,
            overdueCount: 5,
            resolutionRate: 0.68,
            createdAt: new Date(now - 6 * oneDayMs),
        },
        {
            userId: 'user_demo_001',
            date: new Date(now - 5 * oneDayMs).toISOString().split('T')[0],
            avgFirstReplyTimeMinutes: 148,
            totalEmails: 28,
            repliedCount: 20,
            overdueCount: 4,
            resolutionRate: 0.72,
            createdAt: new Date(now - 5 * oneDayMs),
        },
        {
            userId: 'user_demo_001',
            date: new Date(now - 4 * oneDayMs).toISOString().split('T')[0],
            avgFirstReplyTimeMinutes: 132,
            totalEmails: 42,
            repliedCount: 32,
            overdueCount: 3,
            resolutionRate: 0.76,
            createdAt: new Date(now - 4 * oneDayMs),
        },
        {
            userId: 'user_demo_001',
            date: new Date(now - 3 * oneDayMs).toISOString().split('T')[0],
            avgFirstReplyTimeMinutes: 118,
            totalEmails: 31,
            repliedCount: 25,
            overdueCount: 3,
            resolutionRate: 0.79,
            createdAt: new Date(now - 3 * oneDayMs),
        },
        {
            userId: 'user_demo_001',
            date: new Date(now - 2 * oneDayMs).toISOString().split('T')[0],
            avgFirstReplyTimeMinutes: 95,
            totalEmails: 38,
            repliedCount: 32,
            overdueCount: 2,
            resolutionRate: 0.83,
            createdAt: new Date(now - 2 * oneDayMs),
        },
        {
            userId: 'user_demo_001',
            date: new Date(now - 1 * oneDayMs).toISOString().split('T')[0],
            avgFirstReplyTimeMinutes: 78,
            totalEmails: 26,
            repliedCount: 23,
            overdueCount: 1,
            resolutionRate: 0.87,
            createdAt: new Date(now - 1 * oneDayMs),
        },
        {
            userId: 'user_demo_001',
            date: new Date(now).toISOString().split('T')[0],
            avgFirstReplyTimeMinutes: 62,
            totalEmails: 33,
            repliedCount: 30,
            overdueCount: 1,
            resolutionRate: 0.91,
            createdAt: new Date(now),
        },
    ];

    await db.insert(responseMetrics).values(sampleMetrics);
    
    console.log('✅ Response metrics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});