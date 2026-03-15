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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agentip-production.up.railway.app';

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

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState('');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [ensName, setEnsName] = useState('');

  const [email, setEmail] = useState('');
  const [summaryTime, setSummaryTime] = useState('20:00');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPushLoading, setIsLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // ENS DeFi Will state
  const [willEns, setWillEns] = useState('');
  const [willPreview, setWillPreview] = useState<any>(null);
  const [willLoading, setWillLoading] = useState(false);

  async function previewWill() {
    if (!willEns) return;
    setWillLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/will/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensName: willEns })
      });
      setWillPreview(await res.json());
    } catch {}
    setWillLoading(false);
  }

  async function handleSubscribe() {
    setIsLoading(true);
    const res = await fetch(`${API_URL}/notify/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: wallet, email, summaryTime })
    });
    if (res.ok) setIsSubscribed(true);
    setIsLoading(false);
  }

  async function handleTestEmail() {
    setTestSent(false);
    await fetch(`${API_URL}/notify/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: wallet })
    });
    setTestSent(true);
  }

  const fetchStats = useCallback(async (walletAddr: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agenttip-token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/creator/${walletAddr}/stats`, { headers });
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
      const token = localStorage.getItem('agenttip-token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/creator/${walletAddr}/intelligence`, { headers });
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

  const handleOnboard = async () => {
    if (wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      try {
        setLoading(true);
        // Ensure ethereum provider exists
        if (!window.ethereum) {
          alert('Please install a Web3 wallet (e.g. MetaMask, Coinbase Wallet)');
          setLoading(false);
          return;
        }

        // Request connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userWallet = accounts[0];

        // Ensure connected wallet matches input
        if (userWallet.toLowerCase() !== wallet.toLowerCase()) {
          alert('Please connect the wallet address you entered.');
          setLoading(false);
          return;
        }

        const ethers = (await import('ethers')).ethers;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // 1. Get SIWE Nonce
        const nonceRes = await fetch(`${API_URL}/auth/nonce`);
        const nonce = await nonceRes.text();

        const { SiweMessage } = await import('siwe');

        // 2. Create SIWE message
        const message = new SiweMessage({
          domain: window.location.host,
          address: userWallet,
          statement: 'Sign in to AgentTip Dashboard to manage your earnings and ENS Will.',
          uri: window.location.origin,
          version: '1',
          chainId: 8453, // Base mainnet (or testnet 84532)
          nonce,
        });

        const preparedMessage = message.prepareMessage();
        
        // 3. Request Signature
        const signature = await signer.signMessage(preparedMessage);

        // 4. Verify & Get JWT Token
        const verifyRes = await fetch(`${API_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: preparedMessage, signature })
        });
        
        const verifyData = await verifyRes.json();

        if (verifyData.token) {
          localStorage.setItem('agenttip-wallet', wallet.toLowerCase());
          localStorage.setItem('agenttip-token', verifyData.token);
          
          setIsOnboarded(true);
          fetchStats(wallet.toLowerCase());
          fetchIntelligence(wallet.toLowerCase());
        } else {
          alert('Failed to authenticate wallet');
        }
      } catch (err: any) {
        console.error('Wallet auth failed:', err);
        alert('Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const copySnippet = () => {
    const snippet = `<script src="https://agenttip.xyz/widget.js" data-wallet="${wallet}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEnsName = async (ensName: string) => {
    try {
      const token = localStorage.getItem('agenttip-token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/creator/${wallet}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ensName })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        alert('ENS Name saved successfully!');
        fetchStats(wallet);
      } else {
        alert(data.error || 'Failed to save ENS name');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save ENS Name');
    }
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

              {/* Email Notifications Card */}
              <div className="rounded-xl border border-gray-800 p-6 bg-gray-900">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h3 className="font-semibold text-white">Daily Earnings Summary</h3>
                    <p className="text-sm text-gray-400">
                      One email per day. Your earnings, top agent topics, and a Hey Elsa yield recommendation.
                    </p>
                  </div>
                </div>

                {!isSubscribed ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 w-full sm:w-auto flex-1 outline-none focus:border-purple-500"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                      <select
                        className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 w-full sm:w-auto outline-none focus:border-purple-500"
                        value={summaryTime}
                        onChange={e => setSummaryTime(e.target.value)}
                      >
                        <option value="18:00">6:00 PM</option>
                        <option value="19:00">7:00 PM</option>
                        <option value="20:00">8:00 PM</option>
                        <option value="21:00">9:00 PM</option>
                        <option value="22:00">10:00 PM</option>
                      </select>
                    </div>
                    <button
                      onClick={handleSubscribe}
                      disabled={isPushLoading || !email || !email.includes('@')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isPushLoading ? 'Enabling...' : '📧 Enable Daily Summary'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                      <span>✅</span>
                      <span>Daily summary enabled at {summaryTime} to {email}</span>
                    </div>
                    <button
                      onClick={handleTestEmail}
                      className="w-full border border-gray-700 text-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      {testSent ? '✅ Test email sent!' : '📩 Send test email now'}
                    </button>
                  </div>
                )}
              </div>

              {/* ENS DeFi Will Card */}
              <div className="rounded-xl border border-gray-800 p-6 bg-gray-900">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📜</span>
                  <div>
                    <h3 className="font-semibold text-white">ENS DeFi Will</h3>
                    <p className="text-sm text-gray-400">
                      Link your ENS name to enable autonomous on-chain distribution of your earnings.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder="e.g. vitalik.eth"
                      className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 w-full flex-1 outline-none focus:border-purple-500"
                      value={ensName}
                      onChange={e => setEnsName(e.target.value)}
                    />
                    <button
                      onClick={() => handleSaveEnsName(ensName)}
                      disabled={!ensName.endsWith('.eth')}
                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      Save ENS
                    </button>
                  </div>
                  {stats && (stats as any).ensName && (
                     <div className="text-green-400 text-sm mt-2 flex items-center gap-2">
                       <span>✅</span> Current ENS Will: {(stats as any).ensName}
                     </div>
                  )}
                </div>
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

              {/* ENS DeFi Will Card */}
              <div className="rounded-xl border border-amber-800/40 bg-gray-900 p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">⚖️</span>
                  <h3 className="font-semibold text-white">ENS DeFi Will</h3>
                  <span className="ml-auto text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">
                    Powered by ENS
                  </span>
                </div>
                <p className="text-gray-500 text-xs mb-4">
                  Write financial wishes into your ENS name. An agent executes them if you go idle.
                </p>

                {/* What to set on ENS */}
                <div className="bg-gray-800/60 rounded-lg p-4 mb-4 font-mono text-xs space-y-1.5 break-all">
                  <p className="text-gray-500 mb-2 font-sans">
                    Set these on{' '}
                    <a href="https://app.ens.domains" target="_blank" className="text-blue-400 underline">
                      app.ens.domains
                    </a>:
                  </p>
                  <p><span className="text-amber-400">agenttip.will.idle-days</span>  <span className="text-gray-400">→</span>  <span className="text-white">30</span></p>
                  <p><span className="text-amber-400">agenttip.will.action</span>     <span className="text-gray-400">→</span>  <span className="text-white">split</span></p>
                  <p><span className="text-amber-400">agenttip.will.split</span>      <span className="text-gray-400">→</span>  <span className="text-white">friend.eth:60,gitcoin.eth:40</span></p>
                  <p><span className="text-amber-400">agenttip.will.message</span>    <span className="text-gray-400">→</span>  <span className="text-white">"For my contributors"</span></p>
                </div>

                {/* ENS lookup */}
                <div className="flex gap-2 mb-3">
                  <input
                    value={willEns}
                    onChange={e => setWillEns(e.target.value)}
                    placeholder="yourname.eth"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-600 w-0"
                  />
                  <button
                    onClick={previewWill}
                    disabled={willLoading || !willEns}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
                  >
                    {willLoading ? 'Reading...' : 'Preview'}
                  </button>
                </div>

                {/* Preview result */}
                {willPreview && (
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total to distribute</span>
                      <span className="text-white font-medium">${willPreview.totalAmount?.toFixed(4)} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Triggers after</span>
                      <span className="text-white">{willPreview.idleDays} days idle</span>
                    </div>
                    {willPreview.message && (
                      <p className="text-gray-400 text-sm italic border-l-2 border-amber-700 pl-3">
                        "{willPreview.message}"
                      </p>
                    )}
                    <div className="space-y-2 pt-1">
                      {(willPreview.recipients || []).map((r: any) => (
                        <div key={r.ensName} className="flex flex-wrap items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${r.addressResolved ? 'bg-green-500' : 'bg-red-500'}`}/>
                            <span className="text-blue-400 text-sm truncate max-w-[120px]" title={r.ensName}>{r.ensName}</span>
                            <span className="text-gray-600 text-xs">{r.percentage}%</span>
                          </div>
                          <span className="text-white text-sm">{r.wouldReceive} USDC</span>
                        </div>
                      ))}
                    </div>
                    {willPreview.warning && (
                      <p className="text-amber-400 text-xs">⚠️ {willPreview.warning}</p>
                    )}
                    <p className="text-gray-600 text-xs pt-1">
                      ✓ ENS names resolve at execution time — beneficiaries can change wallets
                    </p>
                  </div>
                )}
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
