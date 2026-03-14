import { Request, Response, NextFunction } from 'express';

const AGENT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scrapy/i,
  /python-requests/i,
  /python-urllib/i,
  /axios/i,
  /node-fetch/i,
  /curl/i,
  /wget/i,
  /httpie/i,
  /postman/i,
  /ai-agent/i,
  /openai/i,
  /anthropic/i,
  /claude/i,
  /gpt/i,
  /langchain/i,
  /autogpt/i,
  /agentkit/i,
  /coinbase-agent/i,
];

/**
 * Detect if a request is from an AI agent via User-Agent or custom headers
 */
export function isAgentRequest(req: Request): boolean {
  const userAgent = req.headers['user-agent'] || '';
  const agentHeader = req.headers['x-agent-type'] || req.headers['x-ai-agent'];

  // Check custom agent header
  if (agentHeader) return true;

  // Check user-agent patterns
  for (const pattern of AGENT_PATTERNS) {
    if (pattern.test(userAgent)) return true;
  }

  // No Accept header with text/html usually indicates a programmatic client
  const accept = req.headers['accept'] || '';
  if (!accept.includes('text/html') && !accept.includes('*/*')) return true;

  return false;
}

/**
 * x402 middleware: returns 402 Payment Required for agent requests without valid payment proof
 */
export function x402Middleware(defaultWallet?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only apply to GET requests (content requests)
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Check if this is an agent request
    if (!isAgentRequest(req)) {
      next();
      return;
    }

    // Check if payment proof is provided
    const paymentProof = req.headers['x-payment-proof'] || req.headers['x-payment-txhash'];
    if (paymentProof) {
      // Payment proof provided — let subsequent middleware verify it
      next();
      return;
    }

    // No payment proof — return 402 with x402 headers
    const wallet = defaultWallet || process.env.DEFAULT_CREATOR_WALLET || '0x0000000000000000000000000000000000000000';
    const paymentAmount = process.env.X402_PAYMENT_AMOUNT || '0.001';
    const paymentAsset = process.env.X402_PAYMENT_ASSET || 'USDC';
    const paymentNetwork = process.env.X402_PAYMENT_NETWORK || 'base';
    const usdcContract = process.env.USDC_CONTRACT || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

    res.status(402).json({
      error: 'Payment Required',
      protocol: 'x402',
      payment: {
        amount: paymentAmount,
        asset: paymentAsset,
        network: paymentNetwork,
        recipient: wallet,
        contract: usdcContract,
        description: 'Micropayment required to access this content',
      },
      headers: {
        'X-Payment-Proof': 'Include the transaction hash of your USDC payment',
      },
    });
  };
}
