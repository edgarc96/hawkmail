import { db } from '@/db';
import { teamMembers } from '@/db/schema';

async function main() {
    const sampleTeamMembers = [
        {
            userId: 'user_demo_001',
            name: 'Emma Thompson',
            email: 'emma.thompson@company.com',
            role: 'Customer Support',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Marcus Rodriguez',
            email: 'marcus.rodriguez@company.com',
            role: 'Team Lead',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Aisha Patel',
            email: 'aisha.patel@company.com',
            role: 'Customer Support',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'James O\'Connor',
            email: 'james.oconnor@company.com',
            role: 'Manager',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Yuki Tanaka',
            email: 'yuki.tanaka@company.com',
            role: 'Support Agent',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Sofia Kowalski',
            email: 'sofia.kowalski@company.com',
            role: 'Customer Support',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Ahmed Hassan',
            email: 'ahmed.hassan@company.com',
            role: 'Team Lead',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Isabella Martinez',
            email: 'isabella.martinez@company.com',
            role: 'Support Agent',
            isActive: false,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Chen Wei',
            email: 'chen.wei@company.com',
            role: 'Manager',
            isActive: true,
            createdAt: new Date(),
        },
        {
            userId: 'user_demo_001',
            name: 'Olivia Johnson',
            email: 'olivia.johnson@company.com',
            role: 'Customer Support',
            isActive: false,
            createdAt: new Date(),
        },
    ];

    await db.insert(teamMembers).values(sampleTeamMembers);
    
    console.log('✅ Team members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});