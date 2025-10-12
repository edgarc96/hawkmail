import { db } from '@/db';
import { alerts } from '@/db/schema';

async function main() {
    const now = Date.now();
    
    const sampleAlerts = [
        {
            emailId: 2,
            userId: 'user_demo_001',
            alertType: 'high_priority',
            message: 'HIGH PRIORITY: Email from sarah.johnson@techcorp.com about "Critical: Payment gateway failure affecting checkout" requires immediate attention',
            isRead: false,
            createdAt: new Date(now - (2 * 60 * 60 * 1000)),
        },
        {
            emailId: 5,
            userId: 'user_demo_001',
            alertType: 'overdue',
            message: 'OVERDUE: Email from mike.chen@startup.io regarding "Account access issue - unable to login" was due 6 hours ago',
            isRead: false,
            createdAt: new Date(now - (6 * 60 * 60 * 1000)),
        },
        {
            emailId: 8,
            userId: 'user_demo_001',
            alertType: 'deadline_approaching',
            message: 'Email from alex.rivera@consulting.com about "API integration help needed for client project" is due in 3 hours',
            isRead: false,
            createdAt: new Date(now - (4 * 60 * 60 * 1000)),
        },
        {
            emailId: 12,
            userId: 'user_demo_001',
            alertType: 'overdue',
            message: 'OVERDUE: Email from emily.watson@enterprise.com regarding "Data migration concerns and timeline questions" was due 8 hours ago',
            isRead: true,
            createdAt: new Date(now - (8 * 60 * 60 * 1000)),
        },
        {
            emailId: 15,
            userId: 'user_demo_001',
            alertType: 'high_priority',
            message: 'HIGH PRIORITY: Email from david.kim@agency.com about "Production server down - urgent assistance needed" requires immediate attention',
            isRead: false,
            createdAt: new Date(now - (1 * 60 * 60 * 1000)),
        },
        {
            emailId: 19,
            userId: 'user_demo_001',
            alertType: 'deadline_approaching',
            message: 'Email from jennifer.lee@corporation.net about "Contract renewal deadline approaching next week" is due in 5 hours',
            isRead: true,
            createdAt: new Date(now - (12 * 60 * 60 * 1000)),
        },
        {
            emailId: 23,
            userId: 'user_demo_001',
            alertType: 'overdue',
            message: 'OVERDUE: Email from robert.garcia@business.com regarding "Invoice payment status inquiry for Q4 billing" was due 4 hours ago',
            isRead: false,
            createdAt: new Date(now - (4 * 60 * 60 * 1000)),
        },
        {
            emailId: 27,
            userId: 'user_demo_001',
            alertType: 'deadline_approaching',
            message: 'Email from lisa.brown@services.io about "Feature request approval needed for next sprint" is due in 2 hours',
            isRead: true,
            createdAt: new Date(now - (18 * 60 * 60 * 1000)),
        },
    ];

    await db.insert(alerts).values(sampleAlerts);
    
    console.log('✅ Alerts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});