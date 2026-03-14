import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { statsLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * GET /transactions
 * Returns recent transactions, optionally filtered by wallet
 * Query params: wallet, limit, offset, type
 */
router.get('/', statsLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet, limit = '50', offset = '0', type } = req.query;

    const where: any = { status: 'confirmed' };

    if (wallet && typeof wallet === 'string') {
      where.creatorWallet = wallet.toLowerCase();
    }

    if (type && (type === 'human' || type === 'agent')) {
      where.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit as string), 100),
      skip: parseInt(offset as string),
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    console.error('[Transactions] Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
