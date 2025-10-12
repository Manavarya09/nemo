import { db } from '@/db';
import { moodLogs } from '@/db/schema';

async function main() {
    const today = new Date();
    const sampleMoodLogs = [];

    const moodData = [
        { value: 3, label: 'Great' },      // Day 1 (13 days ago)
        { value: 2, label: 'Good' },       // Day 2
        { value: 2, label: 'Good' },       // Day 3
        { value: 4, label: 'Amazing' },    // Day 4
        { value: 3, label: 'Great' },      // Day 5
        { value: 1, label: 'Meh' },        // Day 6
        { value: 2, label: 'Good' },       // Day 7
        { value: 3, label: 'Great' },      // Day 8
        { value: 0, label: 'Rough' },      // Day 9
        { value: 2, label: 'Good' },       // Day 10
        { value: 3, label: 'Great' },      // Day 11
        { value: 1, label: 'Meh' },        // Day 12
        { value: 4, label: 'Amazing' },    // Day 13
        { value: 3, label: 'Great' },      // Day 14 (yesterday)
    ];

    for (let i = 13; i >= 0; i--) {
        const logDate = new Date(today);
        logDate.setDate(today.getDate() - i);
        
        const dateString = logDate.toISOString().split('T')[0];
        const mood = moodData[13 - i];
        
        sampleMoodLogs.push({
            date: dateString,
            moodValue: mood.value,
            moodLabel: mood.label,
            userId: 'default_user',
            createdAt: new Date(logDate.setHours(20, 30, 0, 0)).toISOString(),
        });
    }

    await db.insert(moodLogs).values(sampleMoodLogs);
    
    console.log('✅ Mood logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});