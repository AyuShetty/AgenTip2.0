import prisma from '../src/lib/prisma';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create a demo creator
  const demoWallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78';

  await prisma.creator.upsert({
    where: { wallet: demoWallet.toLowerCase() },
    update: {},
    create: {
      wallet: demoWallet.toLowerCase(),
      name: 'Demo Creator',
    },
  });

  // Create demo analytics
  await prisma.analytics.upsert({
    where: { wallet: demoWallet.toLowerCase() },
    update: {},
    create: {
      wallet: demoWallet.toLowerCase(),
      pageViews: 1247,
      agentRequests: 89,
      humanTips: 34,
      totalEarnings: 127.50,
    },
  });

  // Create some demo transactions
  const demoTransactions = [
    { amount: 5.00, type: 'human' as const, txHash: '0xdemo1' + Date.now().toString(16), daysAgo: 0 },
    { amount: 1.00, type: 'human' as const, txHash: '0xdemo2' + Date.now().toString(16), daysAgo: 1 },
    { amount: 0.001, type: 'agent' as const, txHash: '0xdemo3' + Date.now().toString(16), daysAgo: 1 },
    { amount: 0.50, type: 'human' as const, txHash: '0xdemo4' + Date.now().toString(16), daysAgo: 2 },
    { amount: 0.001, type: 'agent' as const, txHash: '0xdemo5' + Date.now().toString(16), daysAgo: 2 },
    { amount: 0.001, type: 'agent' as const, txHash: '0xdemo6' + Date.now().toString(16), daysAgo: 3 },
    { amount: 1.00, type: 'human' as const, txHash: '0xdemo7' + Date.now().toString(16), daysAgo: 4 },
    { amount: 5.00, type: 'human' as const, txHash: '0xdemo8' + Date.now().toString(16), daysAgo: 5 },
    { amount: 0.001, type: 'agent' as const, txHash: '0xdemo9' + Date.now().toString(16), daysAgo: 6 },
    { amount: 0.50, type: 'human' as const, txHash: '0xdemo10' + Date.now().toString(16), daysAgo: 7 },
  ];

  for (const tx of demoTransactions) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - tx.daysAgo);

    await prisma.transaction.create({
      data: {
        creatorWallet: demoWallet.toLowerCase(),
        amount: tx.amount,
        currency: 'USDC',
        type: tx.type,
        txHash: tx.txHash,
        status: 'confirmed',
        createdAt,
      },
    });
  }

  console.log('✅ Seed complete!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
