import { db } from '@/db';
import { cycleData } from '@/db/schema';

async function main() {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    const sampleCycleData = [
        {
            lastPeriodStart: tenDaysAgo.toISOString().split('T')[0],
            periodLength: 5,
            cycleLength: 28,
            userId: 'default_user',
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(cycleData).values(sampleCycleData);
    
    console.log('✅ Cycle data seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});