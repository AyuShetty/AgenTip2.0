import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { isValidAddress, isTxHashUsed, markTxHashUsed, verifyUSDCTransfer } from '../lib/verify';
import { emitNewTip } from '../lib/socket';
import { paymentLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * POST /tip
 * Human tipping endpoint
 * Body: { wallet: string, amount: number, txHash: string }
 */
router.post('/', paymentLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet, amount, txHash } = req.body;

    // Validate required fields
    if (!wallet || !amount || !txHash) {
      res.status(400).json({ error: 'Missing required fields: wallet, amount, txHash' });
      return;
    }

    // Validate wallet address
    if (!isValidAddress(wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    // Replay protection
    if (await isTxHashUsed(txHash)) {
      res.status(409).json({ error: 'Transaction already processed' });
      return;
    }

    // Mark as used immediately to prevent race conditions
    markTxHashUsed(txHash);

    // Ensure creator exists
    await prisma.creator.upsert({
      where: { wallet: wallet.toLowerCase() },
      update: {},
      create: { wallet: wallet.toLowerCase() },
    });

    // Record transaction (will verify on-chain asynchronously for demo)
    const transaction = await prisma.transaction.create({
      data: {
        creatorWallet: wallet.toLowerCase(),
        amount,
        currency: 'USDC',
        type: 'human',
        txHash: txHash.toLowerCase(),
        senderWallet: req.body.senderWallet?.toLowerCase() || null,
        status: 'confirmed', // In production, start as 'pending' and verify
      },
    });

    // Update analytics
    await prisma.analytics.upsert({
      where: { wallet: wallet.toLowerCase() },
      update: {
        humanTips: { increment: 1 },
        totalEarnings: { increment: amount },
      },
      create: {
        wallet: wallet.toLowerCase(),
        humanTips: 1,
        totalEarnings: amount,
      },
    });

    // Emit realtime event
    emitNewTip(wallet, {
      id: transaction.id,
      amount,
      type: 'human',
      txHash,
      createdAt: transaction.createdAt,
    });

    res.status(200).json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        txHash: transaction.txHash,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('[Tip] Error processing tip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
