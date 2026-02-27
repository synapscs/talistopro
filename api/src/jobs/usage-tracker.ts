import cron from 'node-cron';
import { prisma } from '../lib/db';
import { PlatformUsageService } from '../services/platform/usage';

export function startUsageTrackingJob() {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Usage Tracker] Processing daily usage updates...');
    
    try {
      const organizations = await prisma.organization.findMany({
        where: {
          subscriptionStatus: 'active' || 'trial'
        },
        include: {
          plan: true
        }
      });

      for (const org of organizations) {
        await PlatformUsageService.checkLimitsAndNotify(org.id);
      }

      console.log('[Usage Tracker] Completed daily update');
    } catch (error) {
      console.error('[Usage Tracker] Error:', error);
    }
  });

  console.log('[Usage Tracker] Daily job scheduled at 00:00');
}

export async function triggerManualUsageCheck(orgId: string) {
  await PlatformUsageService.checkLimitsAndNotify(orgId);
}