'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Heart, Bot, Shield, Code, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-at-bg">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-at-border bg-at-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-at-primary to-at-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">AgentTip</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-at-primary hover:bg-at-primary-hover transition-colors text-sm font-medium">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-at-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-at-border bg-at-surface mb-8 text-sm text-at-muted">
            <span className="w-2 h-2 rounded-full bg-at-success animate-pulse" />
            Powered by x402 Protocol · USDC on Base
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            The tipping layer<br />
            <span className="gradient-text">for the internet</span>
          </h1>
          
          <p className="text-lg md:text-xl text-at-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            One line of code. Humans tip creators. AI agents pay micropayments.
            All in USDC on Base.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-at-primary to-at-accent hover:shadow-lg hover:shadow-at-primary/25 transition-all text-base font-semibold flex items-center gap-2 group">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#how-it-works" className="px-8 py-3.5 rounded-xl border border-at-border hover:border-at-primary/40 transition-colors text-base font-medium text-at-muted hover:text-at-text">
              How It Works
            </a>
          </div>

          {/* Code snippet */}
          <div className="glass-card glow-primary max-w-xl mx-auto p-1 rounded-2xl">
            <div className="bg-at-bg rounded-xl p-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-at-muted ml-2">index.html</span>
              </div>
              <code className="text-sm md:text-base font-mono">
                <span className="text-at-muted">&lt;</span>
                <span className="text-indigo-400">script</span>
                {' '}
                <span className="text-purple-400">src</span>
                <span className="text-at-muted">=</span>
                <span className="text-green-400">&quot;https://agenttip.xyz/widget.js&quot;</span>
                <br />
                {'  '}
                <span className="text-purple-400">data-wallet</span>
                <span className="text-at-muted">=</span>
                <span className="text-green-400">&quot;YOUR_WALLET&quot;</span>
                <span className="text-at-muted">&gt;&lt;/</span>
                <span className="text-indigo-400">script</span>
                <span className="text-at-muted">&gt;</span>
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Two payment flows.<br />
            <span className="gradient-text">One line of code.</span>
          </h2>
          <p className="text-at-muted text-center mb-16 text-lg max-w-xl mx-auto">
            AgentTip handles both human visitors and AI agents automatically.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Human flow */}
            <div className="glass-card p-8 hover:border-at-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-pink-500/15 flex items-center justify-center mb-5">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Human Tipping</h3>
              <p className="text-at-muted leading-relaxed mb-4">
                Visitors see a floating tip button. Click → choose amount → pay with Coinbase Smart Wallet.
                Tips in $0.50, $1, or $5 USDC.
              </p>
              <div className="flex items-center gap-2 text-sm text-at-primary">
                <Zap className="w-4 h-4" />
                One-click with Coinbase Smart Wallet
              </div>
            </div>

            {/* Agent flow */}
            <div className="glass-card p-8 hover:border-at-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Agent Micropayments</h3>
              <p className="text-at-muted leading-relaxed mb-4">
                AI agents get an HTTP 402 response with x402 payment headers.
                Pay $0.001 USDC → get content access.
              </p>
              <div className="flex items-center gap-2 text-sm text-at-primary">
                <Shield className="w-4 h-4" />
                x402 Protocol · Automatic verification
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '<1 min', label: 'Setup Time' },
              { value: '19kb', label: 'Widget Size' },
              { value: '$0.001', label: 'Min Payment' },
              { value: 'Base', label: 'Settlement' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center">
                <div className="text-2xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-at-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-at-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            Three steps to <span className="gradient-text">monetize your content</span>
          </h2>

          <div className="space-y-12">
            {[
              {
                step: '01',
                icon: Code,
                title: 'Add one line of code',
                desc: 'Paste the AgentTip script tag into your website. Set your wallet address. Done.',
              },
              {
                step: '02',
                icon: Heart,
                title: 'Humans tip, agents pay',
                desc: 'Human visitors see a tip button. AI agents automatically pay micropayments via x402.',
              },
              {
                step: '03',
                icon: BarChart3,
                title: 'Track revenue in real time',
                desc: 'See every tip and payment on your Stripe-style creator dashboard with real-time updates.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-at-surface-2 border border-at-border flex items-center justify-center">
                  <span className="text-sm font-bold gradient-text">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-at-primary" />
                    {item.title}
                  </h3>
                  <p className="text-at-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-at-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-at-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get tipped?
          </h2>
          <p className="text-at-muted text-lg mb-8">
            Start accepting payments from humans and AI in under 60 seconds.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-at-primary to-at-accent hover:shadow-lg hover:shadow-at-primary/25 transition-all text-base font-semibold group">
            Open Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-at-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-at-muted">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-at-primary" />
            <span>AgentTip</span>
          </div>
          <span>Built with x402 · USDC on Base</span>
        </div>
      </footer>
    </main>
  );
}
