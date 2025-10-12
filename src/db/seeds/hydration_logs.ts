import { db } from '@/db';
import { hydrationLogs } from '@/db/schema';

async function main() {
    const today = new Date();
    const sampleHydrationLogs = [];

    // Generate 14 days of hydration data
    for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dateString = date.toISOString().split('T')[0];
        const createdAt = new Date(date.setHours(20, 0, 0, 0)).toISOString();
        
        // Vary glasses count to show realistic patterns
        let glassesCount: number;
        if (i === 13 || i === 11) {
            glassesCount = 4; // Below goal
        } else if (i === 10 || i === 8) {
            glassesCount = 5; // Below goal
        } else if (i === 9 || i === 6) {
            glassesCount = 6; // Close to goal
        } else if (i === 7 || i === 4) {
            glassesCount = 7; // Close to goal
        } else if (i === 12 || i === 5 || i === 2) {
            glassesCount = 8; // Met goal
        } else if (i === 3 || i === 1) {
            glassesCount = 9; // Exceeded goal
        } else {
            glassesCount = 10; // Exceeded goal
        }

        sampleHydrationLogs.push({
            date: dateString,
            glassesCount: glassesCount,
            goal: 8,
            userId: 'default_user',
            createdAt: createdAt,
        });
    }

    await db.insert(hydrationLogs).values(sampleHydrationLogs);
    
    console.log('✅ Hydration logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});