import { db } from '@/db';
import { cycleLogs } from '@/db/schema';

async function main() {
    const today = new Date();
    const sampleCycleLogs = [];

    // Period phase (days 1-3): medium/heavy flow, cramps, lower energy, cravings
    for (let i = 9; i >= 7; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        sampleCycleLogs.push({
            date: dateStr,
            cramps: i === 9 ? 1 : i === 8 ? 1 : 0,
            headache: i === 9 ? 1 : 0,
            flowLevel: i === 9 ? 'heavy' : 'medium',
            cravings: 1,
            mood: i === 9 ? 'tired' : i === 8 ? 'irritated' : 'neutral',
            energy: 'low',
            notes: i === 9 ? 'Light cramps in the morning' : i === 8 ? 'Craving chocolate' : null,
            userId: 'default_user',
            createdAt: new Date(date.setHours(8, 0, 0, 0)).toISOString(),
        });
    }

    // Post-period phase (days 4-7): light/none flow, normal energy, better mood
    for (let i = 6; i >= 3; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        sampleCycleLogs.push({
            date: dateStr,
            cramps: 0,
            headache: i === 6 ? 1 : 0,
            flowLevel: i >= 5 ? 'light' : 'none',
            cravings: 0,
            mood: i === 6 ? 'neutral' : i === 5 ? 'neutral' : 'happy',
            energy: 'normal',
            notes: i === 6 ? 'Feeling a bit tired today' : null,
            userId: 'default_user',
            createdAt: new Date(date.setHours(8, 0, 0, 0)).toISOString(),
        });
    }

    // Mid-cycle phase (days 8-10): no flow, high energy, happy mood
    for (let i = 2; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        sampleCycleLogs.push({
            date: dateStr,
            cramps: 0,
            headache: 0,
            flowLevel: 'none',
            cravings: 0,
            mood: 'happy',
            energy: 'high',
            notes: null,
            userId: 'default_user',
            createdAt: new Date(date.setHours(8, 0, 0, 0)).toISOString(),
        });
    }

    await db.insert(cycleLogs).values(sampleCycleLogs);
    
    console.log('✅ Cycle logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});