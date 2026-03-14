'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowLeft, DollarSign, Heart, Bot, Eye,
  Copy, Check, TrendingUp, ExternalLink, Brain, Shield, Lock
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Stats {
  wallet: string;
  totalEarnings: number;
  humanTips: { total: number; count: number };
  agentPayments: { total: number; count: number };
  analytics: { pageViews: number; agentRequests: number; humanTips: number };
  dailyEarnings: Array<{ date: string; type: string; total: number; count: number }>;
  recentTransactions: Array<{
    id: string;
    creatorWallet: string;
    amount: number;
    currency: string;
    type: 'human' | 'agent';
    txHash: string;
    status: string;
    createdAt: string;
  }>;
}

interface IntelligenceData {
  hasDoc: boolean;
  message?: string;
  docId?: string;
  ipfsHash?: string;
  viewerUrl?: string;
  recentIntelligence?: Array<{
    id: string;
    senderWallet: string | null;
    agentContext: string | null;
    agentQuery: string | null;
    amount: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState('');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchStats = useCallback(async (walletAddr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/creator/${walletAddr}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIntelligence = useCallback(async (walletAddr: string) => {
    try {
      const res = await fetch(`${API_URL}/creator/${walletAddr}/intelligence`);
      if (res.ok) {
        const data = await res.json();
        setIntelligence(data);
      }
    } catch (err) {
      console.error('Failed to fetch intelligence:', err);
    }
  }, []);

  useEffect(() => {
    // Check localStorage for saved wallet
    const saved = localStorage.getItem('agenttip-wallet');
    if (saved) {
      setWallet(saved);
      setIsOnboarded(true);
      fetchStats(saved);
      fetchIntelligence(saved);
    }
  }, [fetchStats, fetchIntelligence]);

  useEffect(() => {
    if (!isOnboarded || !wallet) return;

    // Connect WebSocket
    const s = io(API_URL);
    setSocket(s);

    s.emit('join-creator', wallet);

    s.on('new-tip', () => fetchStats(wallet));
    s.on('new-agent-payment', () => {
      fetchStats(wallet);
      fetchIntelligence(wallet);
    });

    return () => { s.disconnect(); };
  }, [isOnboarded, wallet, fetchStats, fetchIntelligence]);

  const handleOnboard = () => {
    if (wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      localStorage.setItem('agenttip-wallet', wallet.toLowerCase());
      setIsOnboarded(true);
      fetchStats(wallet.toLowerCase());
      fetchIntelligence(wallet.toLowerCase());
    }
  };

  const copySnippet = () => {
    const snippet = `<script src="https://agenttip.xyz/widget.js" data-wallet="${wallet}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare chart data
  const chartData = stats?.dailyEarnings
    ? Object.values(
        stats.dailyEarnings.reduce((acc: Record<string, any>, item) => {
          const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!acc[date]) acc[date] = { date, human: 0, agent: 0 };
          acc[date][item.type] = Number(item.total);
          return acc;
        }, {})
      )
    : [];

  // Onboarding view
  if (!isOnboarded) {
    return (
      <main className="min-h-screen bg-at-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-at-muted hover:text-at-text mb-8 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="glass-card p-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-at-primary to-at-accent flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to AgentTip</h1>
            <p className="text-at-muted mb-6">Enter your wallet address to get started</p>

            <label className="block text-sm font-medium text-at-muted mb-2">
              Wallet Address (Base)
            </label>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-xl bg-at-surface border border-at-border text-at-text placeholder-at-muted/50 focus:border-at-primary focus:outline-none transition-colors mb-4 font-mono text-sm"
            />

            <button
              onClick={handleOnboard}
              disabled={!wallet.match(/^0x[a-fA-F0-9]{40}$/)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-at-primary to-at-accent text-white font-semibold transition-all hover:shadow-lg hover:shadow-at-primary/25 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard view
  return (
    <main className="min-h-screen bg-at-bg">
      {/* Header */}
      <header className="border-b border-at-border bg-at-bg/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-at-primary to-at-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">AgentTip</span>
            </Link>
            <span className="text-at-muted text-sm">/ Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-at-surface border border-at-border text-xs font-mono text-at-muted">
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </div>
            <div className="w-2 h-2 rounded-full bg-at-success animate-pulse" title="Connected" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && !stats ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-at-primary/30 border-t-at-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={DollarSign}
                label="Total Earnings"
                value={`$${(stats?.totalEarnings || 0).toFixed(2)}`}
                subtext="USDC"
                color="text-green-400"
                bgColor="bg-green-500/10"
              />
              <StatCard
                icon={Heart}
                label="Human Tips"
                value={`$${(stats?.humanTips.total || 0).toFixed(2)}`}
                subtext={`${stats?.humanTips.count || 0} tips`}
                color="text-pink-400"
                bgColor="bg-pink-500/10"
              />
              <StatCard
                icon={Bot}
                label="Agent Payments"
                value={`$${(stats?.agentPayments.total || 0).toFixed(4)}`}
                subtext={`${stats?.agentPayments.count || 0} requests`}
                color="text-cyan-400"
                bgColor="bg-cyan-500/10"
              />
              <StatCard
                icon={Eye}
                label="Page Views"
                value={String(stats?.analytics.pageViews || 0)}
                subtext="total visits"
                color="text-amber-400"
                bgColor="bg-amber-500/10"
              />
            </div>

            {/* Chart + Embed */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-at-primary" />
                    Revenue
                  </h2>
                  <span className="text-xs text-at-muted">Last 30 days</span>
                </div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a24',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px',
                          fontSize: 13,
                        }}
                        itemStyle={{ color: '#f1f1f4' }}
                        formatter={(value: number) => [`$${value.toFixed(4)}`, '']}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
                      />
                      <Bar dataKey="human" name="Human Tips" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="agent" name="Agent Payments" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-at-muted text-sm">
                    No revenue data yet. Share your page to start earning!
                  </div>
                )}
              </div>

              {/* Embed code */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Install Widget</h2>
                <p className="text-sm text-at-muted mb-4">
                  Add this one line to your website to start accepting tips:
                </p>
                <div className="bg-at-bg rounded-lg p-4 border border-at-border mb-4 relative group">
                  <code className="text-xs font-mono text-indigo-300 break-all leading-relaxed">
                    &lt;script src=&quot;https://agenttip.xyz/widget.js&quot; data-wallet=&quot;{wallet.slice(0, 6)}...{wallet.slice(-4)}&quot;&gt;&lt;/script&gt;
                  </code>
                  <button
                    onClick={copySnippet}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-at-surface-2 border border-at-border opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-at-success" /> : <Copy className="w-3.5 h-3.5 text-at-muted" />}
                  </button>
                </div>
                <div className="space-y-2 text-xs text-at-muted">
                  <p>✅ Works on any website</p>
                  <p>✅ Auto-detects humans vs agents</p>
                  <p>✅ Only 19kb — no dependencies</p>
                  <p>✅ Shadow DOM — no CSS conflicts</p>
                </div>
              </div>
            </div>

            {/* ── AI Intelligence Feed ── */}
            <IntelligenceFeed data={intelligence} />

            {/* Transaction table */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-at-border">
                      <th className="text-left py-3 px-4 text-at-muted font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-at-muted font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-at-muted font-medium hidden md:table-cell">Tx Hash</th>
                      <th className="text-left py-3 px-4 text-at-muted font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-at-muted font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                      stats.recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-at-border/50 hover:bg-at-surface/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              tx.type === 'human'
                                ? 'bg-pink-500/10 text-pink-400'
                                : 'bg-cyan-500/10 text-cyan-400'
                            }`}>
                              {tx.type === 'human' ? <Heart className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                              {tx.type === 'human' ? 'Tip' : 'Agent'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            ${tx.amount.toFixed(tx.type === 'agent' ? 4 : 2)}
                            <span className="text-at-muted ml-1">USDC</span>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <a
                              href={`https://basescan.org/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-at-primary hover:underline flex items-center gap-1"
                            >
                              {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-medium ${
                              tx.status === 'confirmed' ? 'text-at-success' : 'text-amber-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-at-muted text-xs">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-at-muted">
                          No transactions yet. Install the widget to start earning!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ─── Intelligence Feed Component ─── */
function IntelligenceFeed({ data }: { data: IntelligenceData | null }) {
  const entries = data?.recentIntelligence?.slice(0, 5) || [];

  return (
    <div className="mb-8">
      <div className="glass-card p-6 intelligence-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">🧠 AI Intelligence Feed</h2>
              <p className="text-sm text-at-muted">What AI agents were researching when they paid you</p>
            </div>
          </div>
          {data?.viewerUrl && (
            <a
              href={data.viewerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/20 transition-colors"
            >
              Open full doc in dDocs
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Content */}
        {!data?.hasDoc ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-at-surface-2 border border-at-border flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-at-muted/50" />
            </div>
            <p className="text-at-muted mb-1">No agents have visited yet</p>
            <p className="text-at-muted/60 text-sm max-w-md">
              Your intelligence feed will appear here after the first AI agent pays to access your content.
              Each agent will leave a note about what they were researching.
            </p>
          </div>
        ) : (
          /* Intelligence entries */
          <div className="space-y-3">
            <AnimatePresence>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="bg-at-bg/80 rounded-xl p-4 border border-at-border/60 hover:border-purple-500/20 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <span className="font-mono text-xs text-purple-300">
                        {entry.senderWallet
                          ? `${entry.senderWallet.slice(0, 8)}...${entry.senderWallet.slice(-4)}`
                          : 'unknown agent'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-at-muted">
                      <span className="text-green-400 font-medium">${entry.amount.toFixed(4)} USDC</span>
                      <span>
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-at-text/90">
                      <span className="text-at-muted">📋 Task:</span>{' '}
                      {entry.agentContext || 'General research'}
                    </p>
                    <p className="text-at-text/80">
                      <span className="text-at-muted">❓ Researching:</span>{' '}
                      {entry.agentQuery || 'No query specified'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {entries.length === 0 && data.hasDoc && (
              <div className="text-center py-8 text-at-muted text-sm">
                Intelligence doc created. Entries will appear after the next agent payment.
              </div>
            )}
          </div>
        )}

        {/* Privacy banner */}
        <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-at-surface/50 border border-at-border/50">
          <div className="flex items-center gap-1.5 text-at-muted/70">
            <Lock className="w-3.5 h-3.5" />
            <Shield className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-at-muted/70">
            This document is written by agents, encrypted by Fileverse, and stored on IPFS. AgentTip cannot read it.
          </p>
        </div>

        {/* Mobile CTA */}
        {data?.viewerUrl && (
          <a
            href={data.viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/20 transition-colors"
          >
            Open full doc in dDocs
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── Stat Card Component ─── */
function StatCard({
  icon: Icon, label, value, subtext, color, bgColor
}: {
  icon: any; label: string; value: string; subtext: string; color: string; bgColor: string;
}) {
  return (
    <div className="glass-card p-5 hover:border-at-primary/15 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-sm text-at-muted">{label}</span>
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-xs text-at-muted">{subtext}</div>
    </div>
  );
}
