import { db } from '@/db';
import { medicineLogs } from '@/db/schema';

async function main() {
    const today = new Date();
    const sampleMedicineLogs = [];

    // Generate 14 days of medicine tracking data
    for (let i = 13; i >= 0; i--) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);
        const dateString = currentDate.toISOString().split('T')[0];
        const createdAtTimestamp = currentDate.toISOString();

        // Determine if medicines were taken (mostly taken, occasionally missed)
        const missedDays = [3, 8, 11]; // Days where medicine might be missed
        const isMissedDay = missedDays.includes(i);
        
        // Morning medicine - PAN-D
        const morningTaken = isMissedDay && i === 8 ? 0 : 1;
        sampleMedicineLogs.push({
            date: dateString,
            medicineName: 'PAN-D',
            medicineTime: 'Morning',
            taken: morningTaken,
            userId: 'default_user',
            createdAt: new Date(currentDate.setHours(8, 30, 0, 0)).toISOString(),
        });

        // Evening medicine - Vitamin B12
        const eveningTaken = isMissedDay && (i === 3 || i === 11) ? 0 : 1;
        sampleMedicineLogs.push({
            date: dateString,
            medicineName: 'Vitamin B12',
            medicineTime: 'Evening',
            taken: eveningTaken,
            userId: 'default_user',
            createdAt: new Date(currentDate.setHours(20, 0, 0, 0)).toISOString(),
        });
    }

    await db.insert(medicineLogs).values(sampleMedicineLogs);
    
    console.log('✅ Medicine logs seeder completed successfully');
    console.log(`📊 Generated ${sampleMedicineLogs.length} medicine tracking records (14 days × 2 medicines)`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});