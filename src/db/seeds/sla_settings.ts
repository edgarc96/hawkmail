import { db } from '@/db';
import { slaSettings } from '@/db/schema';

async function main() {
    const sampleSlaSettings = [
        {
            userId: 'user_demo_001',
            name: 'Critical Support Requests',
            targetReplyTimeMinutes: 60,
            priorityLevel: 'high',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Standard Support Requests',
            targetReplyTimeMinutes: 240,
            priorityLevel: 'medium',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Billing & Payment Questions',
            targetReplyTimeMinutes: 180,
            priorityLevel: 'medium',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'General Inquiries',
            targetReplyTimeMinutes: 1440,
            priorityLevel: 'low',
            isActive: true,
            createdAt: new Date(),
        }
    ];

    await db.insert(slaSettings).values(sampleSlaSettings);
    
    console.log('✅ SLA settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});
