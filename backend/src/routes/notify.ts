import { Router, Request, Response } from 'express';
import webpush from 'web-push';
import prisma from '../lib/prisma';
import { isValidAddress } from '../lib/verify';
import { statsLimiter } from '../middleware/rateLimit';

// Configure VAPID for push notifications
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:hello@agenttip.xyz',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const router = Router();

/**
 * GET /notify/vapid-public-key
 * Returns the VAPID public key so the frontend can subscribe
 */
router.get('/vapid-public-key', (_req: Request, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

/**
 * POST /notify/subscribe
 * Browser sends its push subscription object after user clicks "Enable notifications"
 */
router.post('/subscribe', statsLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet, subscription, summaryTime } = req.body;

    if (!wallet || !subscription) {
      res.status(400).json({ error: 'Missing wallet or subscription' });
      return;
    }

    if (!isValidAddress(wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    const normalizedWallet = wallet.toLowerCase();

    await prisma.creator.upsert({
      where: { wallet: normalizedWallet },
      update: {
        pushSubscription: JSON.stringify(subscription),
        summaryTime: summaryTime || '20:00',
        notificationsEnabled: true,
      },
      create: {
        wallet: normalizedWallet,
        pushSubscription: JSON.stringify(subscription),
        summaryTime: summaryTime || '20:00',
        notificationsEnabled: true,
      },
    });

    console.log(`[Notify] Push subscription saved for ${normalizedWallet.slice(0, 10)}...`);
    res.json({ success: true, message: 'Push notifications enabled' });
  } catch (error) {
    console.error('[Notify] Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /notify/unsubscribe
 * Disable push notifications for a creator
 */
router.post('/unsubscribe', statsLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet } = req.body;

    if (!wallet || !isValidAddress(wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    await prisma.creator.update({
      where: { wallet: wallet.toLowerCase() },
      data: { notificationsEnabled: false, pushSubscription: null },
    });

    res.json({ success: true, message: 'Push notifications disabled' });
  } catch (error) {
    console.error('[Notify] Unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /notify/send-summary
 * Sends the daily earnings summary push notification to a creator
 * Called by the cron job or manually for testing
 */
router.post('/send-summary', statsLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet } = req.body;

    if (!wallet || !isValidAddress(wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    const normalizedWallet = wallet.toLowerCase();

    const creator = await prisma.creator.findUnique({
      where: { wallet: normalizedWallet },
    });

    if (!creator?.pushSubscription || !creator.notificationsEnabled) {
      res.json({ success: false, message: 'No subscription found or notifications disabled' });
      return;
    }

    // Fetch today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayTransactions = await prisma.transaction.findMany({
      where: {
        creatorWallet: normalizedWallet,
        status: 'confirmed',
        createdAt: { gte: todayStart },
      },
    });

    const agentVisits = todayTransactions.filter(t => t.type === 'agent').length;
    const humanTips = todayTransactions.filter(t => t.type === 'human').length;
    const totalToday = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Simulate Elsa yield strategy
    const elsaApy = totalToday > 0 ? (8 + Math.random() * 6).toFixed(1) : null;

    // Build notification payload
    const payload = JSON.stringify({
      title: '📊 AgentTip Daily Summary',
      body: `You earned $${totalToday.toFixed(4)} today — ${agentVisits} agent visit${agentVisits !== 1 ? 's' : ''}, ${humanTips} human tip${humanTips !== 1 ? 's' : ''}.${elsaApy ? ` Elsa found ${elsaApy}% APY for your earnings.` : ''}`,
      icon: '/icon.png',
      badge: '/badge.png',
      data: {
        url: `/dashboard?wallet=${normalizedWallet}&action=summary`,
        stats: { totalToday, agentVisits, humanTips },
        elsaStrategy: elsaApy ? { apy: parseFloat(elsaApy), protocol: 'Aave v3 Base' } : null,
        timestamp: new Date().toISOString(),
      },
      actions: [
        { action: 'deploy', title: '💰 Deploy with Elsa' },
        { action: 'view', title: '📊 View Dashboard' },
      ],
    });

    await webpush.sendNotification(
      JSON.parse(creator.pushSubscription),
      payload
    );

    console.log(`[Notify] Daily summary sent to ${normalizedWallet.slice(0, 10)}...`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Notify] Send summary error:', error);

    // If subscription is expired/invalid, clean it up
    if (error.statusCode === 410 || error.statusCode === 404) {
      const { wallet } = req.body;
      if (wallet) {
        await prisma.creator.update({
          where: { wallet: wallet.toLowerCase() },
          data: { notificationsEnabled: false, pushSubscription: null },
        }).catch(() => {});
      }
    }

    res.status(500).json({ success: false, error: error.message || 'Failed to send notification' });
  }
});

export default router;
