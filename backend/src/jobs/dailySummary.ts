import cron from 'node-cron';
import prisma from '../lib/prisma';

/**
 * Daily Summary Cron Job
 *
 * Runs every minute — checks which creators have their summary time
 * matching the current time and sends them a push notification summary.
 * Max one notification per day per creator.
 */
export function startDailySummaryCron() {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    try {
      // Find all creators whose summary time matches right now
      const creators = await prisma.creator.findMany({
        where: {
          summaryTime: currentTime,
          notificationsEnabled: true,
          pushSubscription: { not: null },
        },
      });

      if (creators.length === 0) return;

      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

      for (const creator of creators) {
        try {
          await fetch(`${backendUrl}/notify/send-summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: creator.wallet }),
          });
        } catch (err) {
          console.error(`[Cron] Failed to send summary to ${creator.wallet.slice(0, 10)}...`, err);
        }
      }

      console.log(`📊 Sent daily summaries to ${creators.length} creator(s) at ${currentTime}`);
    } catch (err) {
      console.error('[Cron] Daily summary error:', err);
    }
  });

  console.log('📅 Daily summary cron job started');
}
