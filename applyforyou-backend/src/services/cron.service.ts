import cron from 'node-cron';
import { runApplicationCycle } from './apply.service';

export const startCronJobs = (): void => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Running application cycle...');
    await runApplicationCycle();
  });
  console.log('✅ Cron jobs started');
  console.log('   → Application cycle: every 15 minutes');
};
