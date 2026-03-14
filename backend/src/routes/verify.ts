import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { isValidAddress, isTxHashUsed, markTxHashUsed } from '../lib/verify';
import { emitNewAgentPayment } from '../lib/socket';
import { paymentLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * POST /verify-payment
 * Verifies x402 agent payment proof and grants access
 * Body: { wallet: string, txHash: string, amount?: number }
 */
router.post('/', paymentLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet, txHash, amount } = req.body;

    // Validate required fields
    if (!wallet || !txHash) {
      res.status(400).json({ error: 'Missing required fields: wallet, txHash' });
      return;
    }

    // Validate wallet
    if (!isValidAddress(wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    // Replay protection
    if (await isTxHashUsed(txHash)) {
      res.status(409).json({ error: 'Transaction already processed' });
      return;
    }

    // Mark as used
    markTxHashUsed(txHash);

    const paymentAmount = amount || parseFloat(process.env.X402_PAYMENT_AMOUNT || '0.001');

    // Ensure creator exists
    await prisma.creator.upsert({
      where: { wallet: wallet.toLowerCase() },
      update: {},
      create: { wallet: wallet.toLowerCase() },
    });

    // Record agent payment transaction
    const transaction = await prisma.transaction.create({
      data: {
        creatorWallet: wallet.toLowerCase(),
        amount: paymentAmount,
        currency: 'USDC',
        type: 'agent',
        txHash: txHash.toLowerCase(),
        status: 'confirmed',
      },
    });

    // Update analytics
    await prisma.analytics.upsert({
      where: { wallet: wallet.toLowerCase() },
      update: {
        agentRequests: { increment: 1 },
        totalEarnings: { increment: paymentAmount },
      },
      create: {
        wallet: wallet.toLowerCase(),
        agentRequests: 1,
        totalEarnings: paymentAmount,
      },
    });

    // Emit realtime event
    emitNewAgentPayment(wallet, {
      id: transaction.id,
      amount: paymentAmount,
      type: 'agent',
      txHash,
      createdAt: transaction.createdAt,
    });

    res.status(200).json({
      success: true,
      access: 'granted',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        txHash: transaction.txHash,
      },
    });
  } catch (error) {
    console.error('[Verify] Error verifying payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
