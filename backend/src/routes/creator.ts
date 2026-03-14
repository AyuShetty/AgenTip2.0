import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { isValidAddress } from '../lib/verify';
import { getDocViewerUrl } from '../lib/fileverse';
import { statsLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * GET /creator/:wallet/stats
 * Returns creator earnings and analytics
 */
router.get('/:wallet/stats', statsLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const wallet = req.params.wallet as string;

    if (!isValidAddress(wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    const normalizedWallet = wallet.toLowerCase();

    // Get or create analytics
    const analytics = await prisma.analytics.upsert({
      where: { wallet: normalizedWallet },
      update: {},
      create: { wallet: normalizedWallet },
    });

    // Get earnings breakdown
    const humanEarnings = await prisma.transaction.aggregate({
      where: { creatorWallet: normalizedWallet, type: 'human', status: 'confirmed' },
      _sum: { amount: true },
      _count: true,
    });

    const agentEarnings = await prisma.transaction.aggregate({
      where: { creatorWallet: normalizedWallet, type: 'agent', status: 'confirmed' },
      _sum: { amount: true },
      _count: true,
    });

    // Get daily earnings for chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyEarnings = await prisma.$queryRaw`
      SELECT 
        DATE("created_at") as date,
        "type",
        SUM("amount") as total,
        COUNT(*) as count
      FROM transactions
      WHERE "creator_wallet" = ${normalizedWallet}
        AND "created_at" >= ${thirtyDaysAgo}
        AND "status" = 'confirmed'
      GROUP BY DATE("created_at"), "type"
      ORDER BY date ASC
    ` as any[];

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { creatorWallet: normalizedWallet },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      wallet: normalizedWallet,
      totalEarnings: (humanEarnings._sum.amount || 0) + (agentEarnings._sum.amount || 0),
      humanTips: {
        total: humanEarnings._sum.amount || 0,
        count: humanEarnings._count || 0,
      },
      agentPayments: {
        total: agentEarnings._sum.amount || 0,
        count: agentEarnings._count || 0,
      },
      analytics: {
        pageViews: analytics.pageViews,
        agentRequests: analytics.agentRequests,
        humanTips: analytics.humanTips,
      },
      dailyEarnings,
      recentTransactions,
    });
  } catch (error) {
    console.error('[Creator] Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /creator/:wallet/intelligence
 * Returns the creator's Fileverse dDoc viewer URL and recent agent contexts
 */
router.get('/:wallet/intelligence', statsLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const wallet = req.params.wallet as string;

    if (!isValidAddress(wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    const normalizedWallet = wallet.toLowerCase();

    const creator = await prisma.creator.findUnique({
      where: { wallet: normalizedWallet },
    });

    if (!creator?.fileversDocId) {
      res.json({
        hasDoc: false,
        message: 'No agents have visited yet. Your intelligence feed will appear after the first agent payment.',
      });
      return;
    }

    const recentIntelligence = await prisma.transaction.findMany({
      where: {
        creatorWallet: normalizedWallet,
        type: 'agent',
        agentContext: { not: null },
      },
      select: {
        id: true,
        senderWallet: true,
        agentContext: true,
        agentQuery: true,
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      hasDoc: true,
      docId: creator.fileversDocId,
      ipfsHash: creator.fileversDocHash,
      viewerUrl: creator.fileversDocHash ? getDocViewerUrl(creator.fileversDocHash) : null,
      recentIntelligence,
    });
  } catch (error) {
    console.error('[Creator] Error fetching intelligence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
