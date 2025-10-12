import { db } from '@/db';
import { weightLogs } from '@/db/schema';

async function main() {
    const today = new Date();
    const sampleWeightLogs = [
        {
            date: new Date(today.getTime() - 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 150.5,
            weekLabel: 'Week 1',
            userId: 'default_user',
            createdAt: new Date(today.getTime() - 56 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            date: new Date(today.getTime() - 49 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 149.8,
            weekLabel: 'Week 2',
            userId: 'default_user',
            createdAt: new Date(today.getTime() - 49 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            date: new Date(today.getTime() - 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 149.2,
            weekLabel: 'Week 3',
            userId: 'default_user',
            createdAt: new Date(today.getTime() - 42 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            date: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 148.4,
            weekLabel: 'Week 4',
            userId: 'default_user',
            createdAt: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            date: new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 147.9,
            weekLabel: 'Week 5',
            userId: 'default_user',
            createdAt: new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            date: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 147.1,
            weekLabel: 'Week 6',
            userId: 'default_user',
            createdAt: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 146.3,
            weekLabel: 'Week 7',
            userId: 'default_user',
            createdAt: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 145.6,
            weekLabel: 'Week 8',
            userId: 'default_user',
            createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(weightLogs).values(sampleWeightLogs);
    
    console.log('✅ Weight logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});