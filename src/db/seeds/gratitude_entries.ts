import { db } from '@/db';
import { gratitudeEntries } from '@/db/schema';

async function main() {
    const sampleEntries = [
        {
            date: '2024-12-24',
            entryText: 'Grateful for a peaceful morning walk and the fresh air. It helped clear my mind before a busy day.',
            userId: 'default_user',
            createdAt: new Date('2024-12-24T08:30:00').toISOString(),
        },
        {
            date: '2024-12-22',
            entryText: 'Thankful for my supportive friends who always listen when I need to talk. Their presence in my life means everything.',
            userId: 'default_user',
            createdAt: new Date('2024-12-22T20:15:00').toISOString(),
        },
        {
            date: '2024-12-20',
            entryText: 'Appreciating my health and the ability to exercise today. Feeling strong and energized after my workout.',
            userId: 'default_user',
            createdAt: new Date('2024-12-20T18:45:00').toISOString(),
        },
        {
            date: '2024-12-19',
            entryText: 'Grateful for a good night\'s sleep and waking up refreshed. It made such a difference in my productivity today.',
            userId: 'default_user',
            createdAt: new Date('2024-12-19T07:00:00').toISOString(),
        },
        {
            date: '2024-12-17',
            entryText: 'Thankful for small moments of joy - a great cup of coffee and a good book. Sometimes the simple things bring the most happiness.',
            userId: 'default_user',
            createdAt: new Date('2024-12-17T21:30:00').toISOString(),
        },
        {
            date: '2024-12-16',
            entryText: 'Appreciating my family\'s support during stressful times. They always know how to make me feel better.',
            userId: 'default_user',
            createdAt: new Date('2024-12-16T19:20:00').toISOString(),
        },
        {
            date: '2024-12-14',
            entryText: 'Grateful for professional growth and learning new skills at work. Each challenge helps me become better at what I do.',
            userId: 'default_user',
            createdAt: new Date('2024-12-14T22:00:00').toISOString(),
        },
        {
            date: '2024-12-13',
            entryText: 'Thankful for sunshine today after several rainy days. The warmth and light lifted my spirits.',
            userId: 'default_user',
            createdAt: new Date('2024-12-13T16:30:00').toISOString(),
        },
        {
            date: '2024-12-11',
            entryText: 'Appreciating my body and all it does for me every day. I\'m learning to be kinder to myself and celebrate what my body can do.',
            userId: 'default_user',
            createdAt: new Date('2024-12-11T20:45:00').toISOString(),
        },
        {
            date: '2024-12-10',
            entryText: 'Grateful for delicious healthy meals and taking time to nourish myself. Cooking with fresh ingredients brought me so much joy today.',
            userId: 'default_user',
            createdAt: new Date('2024-12-10T19:00:00').toISOString(),
        },
    ];

    await db.insert(gratitudeEntries).values(sampleEntries);
    
    console.log('✅ Gratitude entries seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});