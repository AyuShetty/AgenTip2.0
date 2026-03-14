'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [activeView, setActiveView] = useState('view-landing');
  const [landingHumanTotal, setLandingHumanTotal] = useState(428.50);
  const [landingAgentCalls, setLandingAgentCalls] = useState(184220);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const humanNames = ["Elena R.", "Alex K.", "Sarah W.", "Mike T.", "David O.", "Jenny L."];
  const agentNames = ["GPT-4o Crawler", "Claude Research", "Perplexity Bot", "LangChain Node", "AutoGPT-X"];

  useEffect(() => {
    const interval = setInterval(() => {
      setLandingAgentCalls(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const feedInterval = setInterval(() => {
      const isHuman = Math.random() > 0.6;
      let source, amt, typeName;

      if (isHuman) {
        source = humanNames[Math.floor(Math.random() * humanNames.length)];
        amt = `$${Math.floor(Math.random() * 5) + 1}`;
        typeName = 'human';
      } else {
        source = agentNames[Math.floor(Math.random() * agentNames.length)];
        amt = '$0.001';
        typeName = 'agent';
      }

      setFeedItems(prev => [{ source, amt, type: typeName }, ...prev.slice(0, 3)]);
    }, 2800);

    return () => clearInterval(feedInterval);
  }, []);

  const switchView = (viewId: string) => {
    setActiveView(viewId);
  };

  const formatStrNum = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const copyEmbed = () => {
    navigator.clipboard.writeText('<script src="https://cdn.agenttip.xyz/v1.js" data-wallet="0x8Fb...2c1"></script>');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        :root {
          --cream: #f8f3ea;
          --ink: #1A1814;
          --rust: #c54b13;
          --gold: #D4A017;
          --sage: #4A7C59;
          --dust: #8C7B6B;
          --paper: #EDE8DC;
          --white: #ffffff;
          --border-width: 1.5px;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          background-color: var(--cream);
          color: var(--ink);
          font-family: "Syne", sans-serif;
          overflow-x: hidden;
        }

        @keyframes fadeUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }

        @keyframes slideIn {
          0% { transform: translateX(-10px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes ticker-anim {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes rollText {
          0%, 15% { transform: translateY(0); }
          20%, 35% { transform: translateY(-1.75em); }
          40%, 55% { transform: translateY(-3.5em); }
          60%, 75% { transform: translateY(-5.25em); }
          80%, 95% { transform: translateY(-7em); }
          100% { transform: translateY(-8.75em); }
        }

        .sticky-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--white);
          border-bottom: var(--border-width) solid var(--ink);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 2rem;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo {
          font-family: "Syne", sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
        }

        .logo-pulse {
          width: 8px;
          height: 8px;
          background-color: var(--rust);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .tab-group {
          display: flex;
          border: var(--border-width) solid var(--ink);
          border-radius: 4px;
          overflow: hidden;
        }

        .tab {
          background: transparent;
          border: none;
          border-right: var(--border-width) solid var(--ink);
          padding: 0.5rem 1rem;
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--ink);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .tab:last-child {
          border-right: none;
        }

        .tab.active {
          background: var(--ink);
          color: var(--cream);
        }

        .view {
          display: none;
        }

        .view.active {
          display: block;
        }

        .card {
          background: var(--white);
          border: var(--border-width) solid var(--ink);
          border-radius: 4px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .card:hover {
          box-shadow: 6px 6px 0 var(--ink);
        }

        .btn {
          font-family: "Syne", sans-serif;
          font-weight: 700;
          cursor: pointer;
          border: var(--border-width) solid var(--ink);
          border-radius: 4px;
          padding: 0.75rem 1.25rem;
          background: var(--white);
          color: var(--ink);
          text-decoration: none;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 4px 4px 0 var(--ink);
        }

        .btn-rust {
          background: var(--rust);
          color: var(--white);
        }

        .label-mono {
          font-family: "DM Mono", monospace;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--dust);
        }

        .heading-hero {
          font-family: "Syne", sans-serif;
          font-size: clamp(2.8rem, 5vw, 5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: var(--ink);
        }

        .heading-section {
          font-family: "Syne", sans-serif;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #ffffff;
        }

        .pro-tip {
          border: 1.5px solid #ffffff;
          border-radius: 4px;
          padding: 1.5rem;
          background: transparent;
          margin-top: 2rem;
          margin-bottom: 2rem;
        }

        .pro-tip-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pro-tip-text {
          font-family: 'Instrument Serif', serif;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #ffffff;
        }

        .body-prose {
          font-family: "Instrument Serif", serif;
          font-size: 1.05rem;
          line-height: 1.85;
          color: #3A3530;
        }

        .emotional-italic {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          color: var(--rust);
          font-weight: normal;
        }

        .text-mono {
          font-family: "DM Mono", monospace;
        }

        .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 6px;
        }

        .dot-rust { background: var(--rust); }
        .dot-sage { background: var(--sage); }
        .dot-gold { background: var(--gold); }
        .dot-ink { background: var(--ink); }

        #view-landing.active {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 61px);
        }

        .landing-col-left {
          padding: 5rem 4rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
          min-height: 100vh;
        }

        .landing-col-right {
          padding: 5rem 4rem;
          background: var(--paper);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          width: 100%;
          min-height: auto;
        }

        .ticker-wrap {
          border-top: var(--border-width) solid var(--ink);
          background: var(--ink);
          color: var(--cream);
          overflow: hidden;
          display: flex;
          align-items: center;
          width: 100%;
          height: 48px;
        }

        .ticker {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: ticker-anim 25s linear infinite;
          font-family: "DM Mono", monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .ticker-item {
          padding: 0 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .ticker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--rust);
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--dust);
          border-radius: 100px;
          padding: 0.25rem 0.75rem;
          margin-bottom: 2rem;
          width: fit-content;
        }

        .hero-tag-dot {
          width: 6px;
          height: 6px;
          background: var(--sage);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .hero-code {
          background: var(--ink);
          color: #A8E6A3;
          padding: 2.5rem 1.25rem 1.25rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-size: 0.85rem;
          line-height: 1.5;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          position: relative;
        }

        .hero-code::before {
          content: '';
          position: absolute;
          top: 0.75rem;
          left: 1rem;
          width: 70px;
          height: 12px;
          background: 
            radial-gradient(circle, #FF5F56 5px, transparent 5px) 0 0,
            radial-gradient(circle, #FFBD2E 5px, transparent 5px) 24px 0,
            radial-gradient(circle, #27C93F 5px, transparent 5px) 48px 0;
          background-repeat: no-repeat;
          background-size: 10px 10px;
          pointer-events: none;
        }

        .hero-code::after {
          display: none;
        }

        .hero-ctas {
          display: flex;
          gap: 1.5rem;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          animation: fadeUp 0.4s ease forwards;
        }

        .stat-value {
          font-family: "DM Mono", monospace;
          font-size: 2rem;
          font-weight: 500;
          color: var(--ink);
          margin: 0.5rem 0;
        }

        .live-feed-panel {
          background: var(--ink);
          border-radius: 4px;
          padding: 1rem;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.4s ease forwards;
          min-height: 220px;
          display: flex;
          flex-direction: column;
        }

        .feed-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }

        .feed-dot {
          width: 6px;
          height: 6px;
          background: #81C784;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .feed-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow: hidden;
          flex-grow: 1;
        }

        .feed-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: slideIn 0.3s ease forwards;
          font-family: "DM Mono", monospace;
          font-size: 0.8rem;
        }

        .feed-source {
          color: var(--cream);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .feed-badge {
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .feed-badge.human {
          background: #1B4332;
          color: #81C784;
        }

        .feed-badge.agent {
          background: #3D1C02;
          color: #FFB74D;
        }

        .feed-amount {
          color: var(--cream);
        }

        #view-dashboard {
          background-color: #11100D;
          color: #ffffff;
          min-height: calc(100vh - 61px);
          padding: 3rem 2.5rem;
        }

        .dash-content-wrapper {
          max-width: 1100px;
          margin: 0 auto;
        }

        .embed-section {
          background: #1A1814;
          border: var(--border-width) solid #F5F0E8;
          border-radius: 4px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .embed-code {
          background: #F5F0E8;
          color: #1A1814;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.85rem;
          flex-grow: 1;
          margin: 0 1.5rem;
          overflow-x: auto;
          font-family: "DM Mono", monospace;
        }

        .embed-btn {
          padding: 0.5rem 1rem;
          background: #F5F0E8;
          color: #1A1814;
          font-family: "DM Mono", monospace;
          font-size: 0.75rem;
          cursor: pointer;
          border: none;
          border-radius: 2px;
          transition: opacity 0.2s;
        }

        .embed-btn:hover {
          opacity: 0.8;
        }

        .text-roller-container {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
          height: 1.75em;
          position: relative;
          margin-left: 4px;
        }

        .text-roller {
          display: inline-flex;
          flex-direction: column;
          animation: rollText 12s cubic-bezier(0.8, 0, 0.2, 1) infinite;
          color: var(--rust);
          font-family: "DM Mono", monospace;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.95em;
        }

        .text-roller span {
          height: 1.75em;
          line-height: 1.75em;
          padding: 0 4px;
        }

        .hero-copy {
          margin-bottom: 2.5rem;
          max-width: 480px;
          line-height: 1.9;
        }
      `}</style>

      <nav className="sticky-nav">
        <div className="nav-left">
          <div className="logo-pulse"></div>
          <div className="logo">AgenTip</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="tab-group">
            <button className={`tab ${activeView === 'view-landing' ? 'active' : ''}`} onClick={() => switchView('view-landing')}>Product</button>
            <button className={`tab ${activeView === 'view-dashboard' ? 'active' : ''}`} onClick={() => switchView('view-dashboard')}>Dashboard</button>
            <button className={`tab ${activeView === 'view-demo' ? 'active' : ''}`} onClick={() => switchView('view-demo')}>Live Demo</button>
          </div>
        </div>
      </nav>

      <div id="view-landing" className={`view ${activeView === 'view-landing' ? 'active' : ''}`}>
        <div className="landing-col-left">
          <div className="hero-tag">
            <div className="hero-tag-dot"></div>
            <span className="label-mono">Built on x402 · Base · USDC</span>
          </div>

          <h1 className="heading-hero" style={{ marginBottom: '1.5rem' }}>
            Monetize the internet.<br />With <span className="emotional-italic">zero</span> friction.<br />Powered by agents.
          </h1>

          <p className="body-prose hero-copy">
            The simplest way for creators to accept tips from humans and automated micro-payments from AI agents consuming your
            <span className="text-roller-container">
              <span className="text-roller">
                <span>articles.</span>
                <span>open source.</span>
                <span>reels.</span>
                <span>blogs.</span>
                <span>posts.</span>
                <span>articles.</span>
              </span>
            </span>
          </p>

          <div className="hero-code text-mono">
            <span style={{ color: '#8B5CF6' }}>&lt;script</span>
            <span style={{ color: '#8B5CF6' }}> src</span>
            <span style={{ color: '#E0E0E0' }}>=</span>
            <span style={{ color: '#22C55E' }}>"https://agenttip.xyz/widget.js"</span><br />
            <span style={{ color: '#8B5CF6' }}>  data-wallet</span>
            <span style={{ color: '#E0E0E0' }}>=</span>
            <span style={{ color: '#22C55E' }}>"YOUR_WALLET"</span>
            <span style={{ color: '#8B5CF6' }}>&gt;&lt;/script&gt;</span>
          </div>

          <div className="hero-ctas">
            <button className="btn btn-rust" onClick={() => switchView('view-dashboard')}>See Dashboard →</button>
            <button className="btn" onClick={() => switchView('view-demo')}>Watch Demo</button>
          </div>
        </div>

        <div className="ticker-wrap">
          <div className="ticker">
            {['agenttip x402', 'live web3 payments', 'base network', 'zero platform risk', 'autonomous micropayments', 'native usdc'].map((item, idx) => (
              <div key={idx} className="ticker-item">
                {item}
                <div className="ticker-dot"></div>
              </div>
            ))}
            {['agenttip x402', 'live web3 payments', 'base network', 'zero platform risk', 'autonomous micropayments', 'native usdc'].map((item, idx) => (
              <div key={`repeat-${idx}`} className="ticker-item">
                {item}
                <div className="ticker-dot"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-col-right">
          <div className="stat-grid" style={{ maxWidth: '800px', width: '100%' }}>
            <div className="card stat-card">
              <div className="label-mono"><span className="dot dot-sage"></span> Human tips today</div>
              <div className="stat-value">${landingHumanTotal.toFixed(2)}</div>
              <div className="label-mono" style={{ color: 'var(--ink)', textTransform: 'none' }}>284 visitors tipped</div>
            </div>
            <div className="card stat-card">
              <div className="label-mono"><span className="dot dot-rust"></span> Agent payments</div>
              <div className="stat-value">${(landingAgentCalls * 0.001).toFixed(2)}</div>
              <div className="label-mono" style={{ color: 'var(--ink)', textTransform: 'none' }}>{formatStrNum(landingAgentCalls)} calls</div>
            </div>
            <div className="card stat-card">
              <div className="label-mono"><span className="dot dot-gold"></span> Take rate</div>
              <div className="stat-value">1.5%</div>
              <div className="label-mono" style={{ color: 'var(--ink)', textTransform: 'none' }}>Same model as Stripe</div>
            </div>
            <div className="card stat-card">
              <div className="label-mono"><span className="dot dot-ink"></span> x402 volume/day</div>
              <div className="stat-value">$28K</div>
              <div className="label-mono" style={{ color: 'var(--ink)', textTransform: 'none' }}>$420/day addressable</div>
            </div>
          </div>

          <div className="live-feed-panel" style={{ maxWidth: '800px', width: '100%', marginTop: '2rem' }}>
            <div className="feed-header">
              <div className="feed-dot"></div>
              <span className="label-mono" style={{ color: 'var(--cream)' }}>live payment feed</span>
            </div>
            <div className="feed-list">
              {feedItems.map((item, idx) => (
                <div key={idx} className="feed-item">
                  <div className="feed-source">
                    <span className={`feed-badge ${item.type}`}>{item.type}</span>
                    <span>{item.source}</span>
                  </div>
                  <div className="feed-amount">{item.amt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="view-dashboard" className={`view ${activeView === 'view-dashboard' ? 'active' : ''}`}>
        <div className="dash-content-wrapper">
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="heading-section">Your Earnings</h1>
              <div className="label-mono" style={{ marginTop: '0.5rem', color: '#ffffff' }}>March 1 - March 14, 2026</div>
            </div>
            <button className="btn" style={{ background: '#5A9A6E', color: 'white' }}>↓ Withdraw to Bank</button>
          </div>

          <div className="pro-tip">
            <div className="pro-tip-title">💡 Pro Tip</div>
            <div className="pro-tip-text">Visitors can tip instantly with a web3 wallet, and AI agents automatically pay $0.001 USDC per request to access your content.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card" style={{ padding: '1.5rem', background: '#1A1814' }}>
              <div className="label-mono" style={{ color: '#8C7B6B', marginBottom: '0.5rem' }}>Total Earned</div>
              <div style={{ fontSize: '2.2rem', fontFamily: "'DM Mono'", color: '#F5F0E8', fontWeight: 500, marginBottom: '0.25rem' }}>$847.23</div>
              <div className="label-mono" style={{ color: '#5A9A6E', fontSize: '0.75rem' }}>↑ +34% from last month</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: '#1A1814' }}>
              <div className="label-mono" style={{ color: '#8C7B6B', marginBottom: '0.5rem' }}><span className="dot dot-sage"></span> Human Tips</div>
              <div style={{ fontSize: '2.2rem', fontFamily: "'DM Mono'", color: '#F5F0E8', fontWeight: 500, marginBottom: '0.25rem' }}>$612.80</div>
              <div className="label-mono" style={{ color: '#5A9A6E', fontSize: '0.75rem' }}>↑ 1,024 tips</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: '#1A1814' }}>
              <div className="label-mono" style={{ color: '#8C7B6B', marginBottom: '0.5rem' }}><span className="dot dot-rust"></span> Agent Payments</div>
              <div style={{ fontSize: '2.2rem', fontFamily: "'DM Mono'", color: '#F5F0E8', fontWeight: 500, marginBottom: '0.25rem' }}>$234.43</div>
              <div className="label-mono" style={{ color: '#5A9A6E', fontSize: '0.75rem' }}>↑ 234,430 calls</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: '#1A1814' }}>
              <div className="label-mono" style={{ color: '#8C7B6B', marginBottom: '0.5rem' }}>Pending Payout</div>
              <div style={{ fontSize: '2.2rem', fontFamily: "'DM Mono'", color: '#F5F0E8', fontWeight: 500, marginBottom: '0.25rem' }}>$198.10</div>
              <div className="label-mono" style={{ color: '#8C7B6B', fontSize: '0.75rem' }}>ACH in 2 days</div>
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <div className="card" style={{ padding: '1.5rem', background: '#1A1814' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="label-mono" style={{ color: '#F5F0E8' }}>Daily Revenue, 14 days</div>
                <div className="label-mono" style={{ color: '#F5F0E8' }}>
                  <span className="dot dot-sage"></span> Human &nbsp;&nbsp;
                  <span className="dot dot-rust"></span> Agent
                </div>
              </div>
              <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #F5F0E8', paddingBottom: '5px' }}>
                {[12, 15, 8, 22, 18, 25, 30, 28, 15, 40, 35, 20, 42, 45].map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', width: '100%', height: '100%' }}>
                    <div style={{ flex: 1, height: `${(h / 45) * 100}%`, background: '#5A9A6E', borderRadius: '2px 2px 0 0' }}></div>
                    <div style={{ flex: 1, height: `${((20 - i) / 45) * 100}%`, background: '#F26222', borderRadius: '2px 2px 0 0' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: '#1A1814', marginBottom: '3rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #F5F0E8' }} className="label-mono">Time</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #F5F0E8' }} className="label-mono">Type</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #F5F0E8' }} className="label-mono">Source</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', borderBottom: '1px solid #F5F0E8' }} className="label-mono">Amount</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', borderBottom: '1px solid #F5F0E8' }} className="label-mono">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: "14:02:11", type: "human", src: "David O.", a: "$2.00" },
                  { t: "14:00:54", type: "agent", src: "Claude Research", a: "$0.001" },
                  { t: "13:45:22", type: "human", src: "Sarah W.", a: "$5.00" },
                  { t: "13:30:01", type: "agent", src: "GPT-4o Crawler", a: "$0.001" },
                  { t: "13:28:44", type: "agent", src: "LangChain Node", a: "$0.001" },
                  { t: "11:15:10", type: "human", src: "Elena R.", a: "$1.00" },
                  { t: "10:42:05", type: "agent", src: "Perplexity Bot", a: "$0.001" },
                  { t: "09:20:12", type: "human", src: "Alex K.", a: "$10.00" }
                ].map((tx, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(26, 24, 20, 0.1)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: "'DM Mono'", fontSize: '0.85rem', color: '#F5F0E8' }}>{tx.t}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`feed-badge ${tx.type}`}>{tx.type}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: "'DM Mono'", fontSize: '0.85rem', color: '#F5F0E8' }}>{tx.src}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: "'DM Mono'", fontSize: '0.85rem', color: '#F5F0E8', textAlign: 'right', fontWeight: 600 }}>{tx.a}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#5A9A6E', textAlign: 'right' }}>✓ Settled</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <h2 className="heading-section" style={{ marginBottom: '2rem' }}>Add AgentTip to Your Site</h2>
            <div style={{ background: '#1A1814', border: '1.5px solid #F5F0E8', borderRadius: '6px', padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span className="label-mono" style={{ color: '#FFB74D' }}>index.html</span>
              </div>
              <div style={{ background: '#0F0D0A', borderRadius: '4px', padding: '1.5rem', fontFamily: "'DM Mono'", fontSize: '0.9rem', lineHeight: '1.6', color: '#A8E6A3', overflow: 'auto', marginBottom: '1.5rem' }}>
                <div><span style={{ color: '#64B5F6' }}>&lt;</span><span style={{ color: '#A8E6A3' }}>script </span><span style={{ color: '#FFB74D' }}>src</span><span style={{ color: '#F5F0E8' }}>=</span><span style={{ color: '#81C784' }}>"https://cdn.agenttip.xyz/widget.js"</span></div>
                <div style={{ marginLeft: '2rem' }}><span style={{ color: '#FFB74D' }}>data-wallet</span><span style={{ color: '#F5F0E8' }}>=</span><span style={{ color: '#81C784' }}>"YOUR_WALLET"</span><span style={{ color: '#64B5F6' }}>&gt;&lt;/</span><span style={{ color: '#A8E6A3' }}>script</span><span style={{ color: '#64B5F6' }}>&gt;</span></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="label-mono" style={{ color: '#8C7B6B' }}>Copy and paste into your site's &lt;head&gt;</span>
                <button className="embed-btn" onClick={copyEmbed} style={{ background: '#F5F0E8', color: '#1A1814', padding: '0.6rem 1.2rem' }}>
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="view-demo" className={`view ${activeView === 'view-demo' ? 'active' : ''}`}>
        <div style={{ minHeight: 'calc(100vh - 61px)', padding: '4rem 3rem', background: 'var(--cream)' }}>
          <div style={{ maxWidth: '950px', margin: '0 auto' }}>
            <div className="label-mono" style={{ color: 'var(--rust)', marginBottom: '1rem' }}>Web3 · AI Infrastructure</div>
            
            <h1 className="heading-section" style={{ fontSize: '2.8rem', marginBottom: '1rem', lineHeight: 1.1, color: '#000000' }}>
              Why agents will <span className="emotional-italic">pay</span> for content
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }} className="text-mono">
              <span style={{ color: 'var(--dust)' }}>March 14, 2026</span>
              <span style={{ color: 'var(--dust)' }}>·</span>
              <span style={{ color: 'var(--dust)' }}>5 min read</span>
            </div>

            <div style={{ height: 'var(--border-width)', background: 'var(--ink)', opacity: 0.15, marginBottom: '2.5rem' }}></div>

            <div className="body-prose" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#3A3530', marginBottom: '2.5rem' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                The internet was built on an assumption: humans view ads, or humans pay subscriptions. But what happens when 40% of page views are autonomous AI agents scraping, summarizing, and reasoning over your content?
              </p>

              <p style={{ marginBottom: '1.5rem' }}>
                These aren't humans. They don't have eyeballs to view ads. They don't want subscriptions. But they do have something more valuable: crypto wallets.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              <div className="card" style={{ padding: '2rem', background: 'var(--paper)' }}>
                <h2 style={{ fontFamily: "'Syne'", fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--ink)' }}>The x402 Protocol</h2>
                <p className="body-prose" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  HTTP 402 (Payment Required) was proposed in 1991 but never standardized. Now x402 revives it for machine-to-machine micro-transactions on Base network.
                </p>
              </div>

              <div className="card" style={{ padding: '2rem', background: 'var(--paper)' }}>
                <h2 style={{ fontFamily: "'Syne'", fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--ink)' }}>Instant Settlement</h2>
                <p className="body-prose" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Agents stream fractions of a cent ($0.001) per request. Direct to your wallet. No intermediaries. No friction.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--ink)', color: 'var(--cream)', padding: '2.5rem', borderRadius: '8px', marginBottom: '2.5rem' }}>
              <div style={{ fontFamily: "'Instrument Serif'", fontSize: '1.15rem', fontStyle: 'italic', lineHeight: 1.7 }}>
                "Agents don't view ads. They don't need subscriptions. But they <span style={{ color: 'var(--rust)' }}>do</span> have wallets. The new web monetizes utility, not attention."
              </div>
            </div>

            <div className="body-prose" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#3A3530' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                For human readers, the experience remains unchanged. A lightweight tipping widget appears—zero friction. Supporters contribute via modern web3 wallets with a single click.
              </p>

              <p style={{ marginBottom: '2rem' }}>
                The result: a two-tier monetization model. Humans tip. Agents pay. Both fund creators directly.
              </p>
            </div>

            <div style={{ background: 'var(--paper)', padding: '2rem', borderRadius: '8px', border: `1.5px solid var(--ink)`, marginBottom: '2.5rem' }}>
              <div className="label-mono" style={{ color: 'var(--rust)', marginBottom: '1.5rem' }}>Today's Network</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--ink)', marginBottom: '0.25rem' }}>$428.50</div>
                  <div className="label-mono" style={{ fontSize: '0.6rem' }}>Earned today</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--ink)', marginBottom: '0.25rem' }}>284</div>
                  <div className="label-mono" style={{ fontSize: '0.6rem' }}>Human supporters</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--ink)', marginBottom: '0.25rem' }}>14.2K</div>
                  <div className="label-mono" style={{ fontSize: '0.6rem' }}>Agent requests</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--ink)', marginBottom: '0.25rem' }}>Base</div>
                  <div className="label-mono" style={{ fontSize: '0.6rem' }}>Settled on</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-rust" style={{ flex: 1 }} onClick={() => switchView('view-dashboard')}>
                Start Earning
              </button>
              <button className="btn" style={{ flex: 1 }} onClick={() => switchView('view-landing')}>
                Back to Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
