import { db } from '@/db';
import { sleepLogs } from '@/db/schema';

async function main() {
    const today = new Date();
    const sampleSleepLogs = [];

    for (let i = 13; i >= 0; i--) {
        const logDate = new Date(today);
        logDate.setDate(today.getDate() - i);
        
        const dayOfWeek = logDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        let bedtime: string;
        let wakeTime: string;
        let hours: number;
        
        if (isWeekend) {
            const bedtimeOptions = ['23:00', '23:15', '23:30', '23:45', '00:00', '00:15', '00:30'];
            const wakeTimeOptions = ['07:30', '07:45', '08:00', '08:15', '08:30'];
            bedtime = bedtimeOptions[Math.floor(Math.random() * bedtimeOptions.length)];
            wakeTime = wakeTimeOptions[Math.floor(Math.random() * wakeTimeOptions.length)];
            hours = 7.5 + Math.random() * 1.0;
        } else {
            const bedtimeOptions = ['22:30', '22:45', '23:00', '23:15', '23:30'];
            const wakeTimeOptions = ['06:30', '06:45', '07:00', '07:15', '07:30'];
            bedtime = bedtimeOptions[Math.floor(Math.random() * bedtimeOptions.length)];
            wakeTime = wakeTimeOptions[Math.floor(Math.random() * wakeTimeOptions.length)];
            hours = 7.0 + Math.random() * 1.0;
        }
        
        hours = Math.round(hours * 10) / 10;
        
        sampleSleepLogs.push({
            date: logDate.toISOString().split('T')[0],
            bedtime: bedtime,
            wakeTime: wakeTime,
            hours: hours,
            userId: 'default_user',
            createdAt: new Date(logDate.setHours(parseInt(wakeTime.split(':')[0]), parseInt(wakeTime.split(':')[1]))).toISOString(),
        });
    }

    await db.insert(sleepLogs).values(sampleSleepLogs);
    
    console.log('✅ Sleep logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});