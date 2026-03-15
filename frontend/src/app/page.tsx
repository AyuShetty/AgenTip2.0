'use client';

import { useState, useEffect, useRef } from 'react';
import { subscribeToGlobalTips } from '@/lib/socket';
import WalletConnect from '@/components/WalletConnect';
import DashboardContent from '@/components/DashboardContent';
import TipForm from '@/components/TipForm';
import TransactionsFeed from '@/components/TransactionsFeed';
import EmailNotifications from '@/components/EmailNotifications';
import IntelligenceFeed from '@/components/IntelligenceFeed';

// Project-Specific 3D Visualizer - USDC Payment Flow Network
const AgentTipVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const transactionsRef = useRef<Array<any>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Central nodes representing ecosystem
    const nodes = [
      { x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2, type: 'protocol', radius: 40, label: 'x402' },
      { x: canvas.offsetWidth / 2 - 150, y: canvas.offsetHeight / 2 - 100, type: 'agent', radius: 25, label: 'Agent' },
      { x: canvas.offsetWidth / 2 + 150, y: canvas.offsetHeight / 2 - 100, type: 'human', radius: 25, label: 'Creator' },
      { x: canvas.offsetWidth / 2 - 100, y: canvas.offsetHeight / 2 + 120, type: 'token', radius: 22, label: 'USDC' },
      { x: canvas.offsetWidth / 2 + 100, y: canvas.offsetHeight / 2 + 120, type: 'blockchain', radius: 20, label: 'Base' },
    ];

    // Active transactions flowing
    const activeTransactions: any[] = [];

    const addTransaction = () => {
      if (Math.random() > 0.3) return;
      const fromNode = nodes[Math.random() > 0.5 ? 1 : 2];
      const toNode = nodes[Math.random() > 0.5 ? 3 : 4];
      activeTransactions.push({
        progress: 0,
        fromNode,
        toNode,
        amount: (Math.random() * 4 + 0.001).toFixed(3),
        type: fromNode.type === 'agent' ? 'agent' : 'human',
      });
    };

    // Animation loop
    const animate = () => {
      timeRef.current += 1;

      // Background with gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      gradient.addColorStop(0, '#f8f3ea');
      gradient.addColorStop(1, '#ede8dc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw subtle connecting lines between all nodes
      ctx.strokeStyle = 'rgba(26, 24, 20, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      // Add new transactions periodically
      if (timeRef.current % 20 === 0) addTransaction();

      // Draw and update active transactions (payment flows)
      activeTransactions.forEach((tx, idx) => {
        tx.progress += 0.01;
        if (tx.progress > 1) {
          activeTransactions.splice(idx, 1);
          return;
        }

        const currentX = tx.fromNode.x + (tx.toNode.x - tx.fromNode.x) * tx.progress;
        const currentY = tx.fromNode.y + (tx.toNode.y - tx.fromNode.y) * tx.progress;

        // Glow effect for transaction
        const glowSize = 8 + Math.sin(timeRef.current * 0.1 + idx) * 3;
        const glowGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, glowSize * 2);
        const glowColor = tx.type === 'agent' ? 'rgba(197, 75, 19, ' : 'rgba(74, 124, 89, ';
        glowGradient.addColorStop(0, glowColor + '0.6)');
        glowGradient.addColorStop(1, glowColor + '0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, glowSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Transaction particle
        ctx.fillStyle = tx.type === 'agent' ? '#c54b13' : '#4A7C59';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Amount label mid-way
        if (tx.progress === 0.5) {
          ctx.font = "11px 'DM Mono', monospace";
          ctx.fillStyle = 'rgba(26, 24, 20, 0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(`$${tx.amount}`, currentX, currentY - 12);
        }
      });

      // Draw main nodes
      nodes.forEach((node) => {
        // Node glow
        const glowSize = 15 + Math.sin(timeRef.current * 0.05) * 5;
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);

        if (node.type === 'protocol') {
          glowGradient.addColorStop(0, 'rgba(212, 160, 23, 0.4)');
          glowGradient.addColorStop(1, 'rgba(212, 160, 23, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Central protocol node - animated circle
          ctx.strokeStyle = '#D4A017';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Inner rotating circle
          ctx.strokeStyle = 'rgba(212, 160, 23, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(
            node.x,
            node.y,
            node.radius * 0.6 + Math.sin(timeRef.current * 0.08) * 5,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // x402 label
          ctx.font = "bold 13px 'Syne', sans-serif";
          ctx.fillStyle = '#D4A017';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('x402', node.x, node.y);
        } else if (node.type === 'agent') {
          glowGradient.addColorStop(0, 'rgba(197, 75, 19, 0.3)');
          glowGradient.addColorStop(1, 'rgba(197, 75, 19, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#c54b13';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "bold 11px 'Syne', sans-serif";
          ctx.fillStyle = '#f8f3ea';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🤖', node.x, node.y);
        } else if (node.type === 'human') {
          glowGradient.addColorStop(0, 'rgba(74, 124, 89, 0.3)');
          glowGradient.addColorStop(1, 'rgba(74, 124, 89, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#4A7C59';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "bold 11px 'Syne', sans-serif";
          ctx.fillStyle = '#f8f3ea';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👤', node.x, node.y);
        } else if (node.type === 'token') {
          glowGradient.addColorStop(0, 'rgba(168, 196, 235, 0.3)');
          glowGradient.addColorStop(1, 'rgba(168, 196, 235, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Rotating USDC coin
          ctx.save();
          ctx.translate(node.x, node.y);
          ctx.rotate((timeRef.current * 0.02) % Math.PI * 2);
          ctx.fillStyle = '#A8C4EB';
          ctx.beginPath();
          ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.font = "bold 9px 'Syne', sans-serif";
          ctx.fillStyle = '#1A1814';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('U', node.x, node.y);
        } else if (node.type === 'blockchain') {
          glowGradient.addColorStop(0, 'rgba(100, 200, 150, 0.3)');
          glowGradient.addColorStop(1, 'rgba(100, 200, 150, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Blockchain blocks pattern
          ctx.strokeStyle = '#64C896';
          ctx.lineWidth = 1.5;
          const blockSize = 8;
          for (let bx = -1; bx <= 1; bx++) {
            for (let by = -1; by <= 1; by++) {
              ctx.strokeRect(
                node.x - blockSize + bx * (blockSize + 2),
                node.y - blockSize + by * (blockSize + 2),
                blockSize,
                blockSize
              );
            }
          }
        }

        // Node label
        ctx.font = "10px 'DM Mono', monospace";
        ctx.fillStyle = 'rgba(26, 24, 20, 0.6)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.label, node.x, node.y + node.radius + 12);
      });

      // Transaction counter
      ctx.font = "12px 'DM Mono', monospace";
      ctx.fillStyle = 'rgba(26, 24, 20, 0.5)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`Active flows: ${activeTransactions.length}`, canvas.offsetWidth - 12, 12);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    />
  );
};

export default function HomePage() {
  const [activeView, setActiveView] = useState('view-landing');
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
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

  // Live network activity feed: subscribe to real backend events
  useEffect(() => {
    const unsub = subscribeToGlobalTips((data: any) => {
      // Normalize for feed
      setFeedItems(prev => [
        {
          source: data.senderWallet ? `${data.senderWallet.slice(0, 6)}...${data.senderWallet.slice(-4)}` : (data.type === 'agent' ? 'Agent' : 'Human'),
          amt: `$${Number(data.amount).toFixed(3)}`,
          type: data.type || 'human',
        },
        ...prev.slice(0, 3),
      ]);
    });
    return () => unsub();
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

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(197, 75, 19, 0.7), inset 0 0 20px rgba(197, 75, 19, 0.1); }
          50% { box-shadow: 0 0 0 10px rgba(197, 75, 19, 0), inset 0 0 30px rgba(197, 75, 19, 0.2); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes slideUpStagger {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
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
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(197, 75, 19, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .card:hover::before {
          left: 100%;
        }

        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(26, 24, 20, 0.12), 8px 8px 0 rgba(197, 75, 19, 0.2);
          border-color: var(--rust);
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
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .btn::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(197, 75, 19, 0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn:hover::after {
          width: 300px;
          height: 300px;
        }

        .btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(26, 24, 20, 0.15), 6px 6px 0 var(--ink);
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
          animation: slideUpStagger 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          position: relative;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }

        .stat-value {
          font-family: "DM Mono", monospace;
          font-size: 2rem;
          font-weight: 500;
          color: var(--ink);
          margin: 0.5rem 0;
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-value {
          color: var(--rust);
          transform: scale(1.05);
          text-shadow: 0 0 10px rgba(197, 75, 19, 0.2);
        }

        .live-feed-panel {
          background: var(--ink);
          border-radius: 4px;
          padding: 1rem;
          position: relative;
          z-index: 1;
          animation: slideUpStagger 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #1A1814 0%, #2a2620 100%);
        }

        .live-feed-panel:hover {
          border-color: var(--rust);
          box-shadow: 0 0 20px rgba(197, 75, 19, 0.15), inset 0 0 20px rgba(197, 75, 19, 0.05);
          transform: translateY(-4px);
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
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          font-family: "DM Mono", monospace;
          font-size: 0.8rem;
          padding: 0.5rem;
          border-radius: 3px;
          transition: all 0.2s ease;
        }

        .feed-item:nth-child(1) { animation-delay: 0.05s; }
        .feed-item:nth-child(2) { animation-delay: 0.1s; }
        .feed-item:nth-child(3) { animation-delay: 0.15s; }

        .feed-item:hover {
          background: rgba(197, 75, 19, 0.1);
          transform: translateX(8px);
        }

        .feed-source {
          color: var(--cream);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .feed-item:hover .feed-source {
          color: #FFB74D;
          text-shadow: 0 0 8px rgba(255, 183, 77, 0.4);
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
        <div className="landing-col-left" style={{ background: 'linear-gradient(135deg, #f8f3ea 0%, #ede8dc 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4rem 2rem' }}>
          {/* Main Headline */}
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.1', color: 'var(--ink)', marginBottom: '4rem', textAlign: 'center' }}>
            Create once. Earn forever. Even from <span style={{ color: 'var(--rust)' }}>robots.</span>
          </h1>

          {/* iOS Browser Window - Main MVP */}
          <div style={{ position: 'relative', maxWidth: '500px', width: '100%', marginBottom: '4rem', animation: 'fadeUp 0.6s ease' }}>
            {/* Browser Top Bar with iOS dots */}
            <div style={{ background: '#1A1814', borderRadius: '16px 16px 0 0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF3B30' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF9500' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34C759' }}></div>
              </div>
              <div style={{ fontSize: '11px', color: '#F5F0E8', fontFamily: "'DM Mono', monospace", textAlign: 'center', flex: 1 }}>agenttip.xyz</div>
              <div style={{ width: '24px' }}></div>
            </div>

            {/* Code Window */}
            <div style={{ background: '#1A1814', color: '#A8E6A3', padding: '2rem 1.5rem', borderRadius: '0 0 16px 16px', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', lineHeight: '1.8', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'left' }}>
              <span style={{ color: '#8B5CF6' }}>&lt;script</span><br/>
              <span style={{ color: '#8B5CF6' }}>&nbsp;&nbsp;src</span>
              <span style={{ color: '#E0E0E0' }}>=</span>
              <span style={{ color: '#22C55E' }}>"https://agenttip.xyz/v1.js"</span><br/>
              <span style={{ color: '#8B5CF6' }}>&nbsp;&nbsp;data-wallet</span>
              <span style={{ color: '#E0E0E0' }}>=</span>
              <span style={{ color: '#22C55E' }}>"YOUR_WALLET"</span><br/>
              <span style={{ color: '#8B5CF6' }}>&gt;&lt;/script&gt;</span>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', lineHeight: '1.8', color: '#3A3530', maxWidth: '600px', marginBottom: '3rem', textAlign: 'center' }}>
            The simplest way for creators to accept tips from humans and automated micro-payments from AI agents consuming your content.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-rust" onClick={() => switchView('view-dashboard')} style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              See Dashboard →
            </button>
            <button className="btn" onClick={() => switchView('view-demo')} style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Watch Demo
            </button>
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

        <div className="landing-col-right" style={{ position: 'relative', minHeight: '600px' }}>
          {/* Project-Specific 3D Visualizer - Payment Network */}
          <div style={{ width: '100%', maxWidth: '800px', height: '500px', border: '1.5px solid var(--ink)', borderRadius: '8px', overflow: 'hidden', position: 'relative', marginBottom: '2rem' }}>
            <AgentTipVisualizer />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(248, 243, 234, 0.95), transparent)', textAlign: 'center' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'var(--dust)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <span style={{ color: 'var(--rust)' }}>●</span> Agent Flow <span style={{ marginLeft: '0.8rem', color: 'var(--sage)' }}>●</span> Creator Flow <span style={{ marginLeft: '0.8rem', color: '#D4A017' }}>●</span> x402 Protocol
              </p>
            </div>
          </div>

          {/* Stats Grid Below */}
          <div className="stat-grid" style={{ maxWidth: '800px', width: '100%', marginTop: '1rem' }}>
            <div className="card stat-card" style={{ animation: 'fadeUp 0.6s ease 0.1s backwards' }}>
              <div className="label-mono"><span className="dot dot-sage"></span> Human tips today</div>
              <div className="stat-value">${landingHumanTotal.toFixed(2)}</div>
              <div className="label-mono" style={{ color: 'var(--ink)', textTransform: 'none' }}>284 visitors tipped</div>
            </div>
            <div className="card stat-card" style={{ animation: 'fadeUp 0.6s ease 0.2s backwards' }}>
              <div className="label-mono"><span className="dot dot-rust"></span> Agent payments</div>
              <div className="stat-value">${(landingAgentCalls * 0.001).toFixed(2)}</div>
              <div className="label-mono" style={{ color: 'var(--ink)', textTransform: 'none' }}>{formatStrNum(landingAgentCalls)} calls</div>
            </div>
            <div className="card stat-card" style={{ animation: 'fadeUp 0.6s ease 0.3s backwards' }}>
              <div className="label-mono"><span className="dot dot-gold"></span> Take rate</div>
              <div className="stat-value">1.5%</div>
              <div className="label-mono" style={{ color: 'var(--ink)', textTransform: 'none' }}>Same model as Stripe</div>
            </div>
            <div className="card stat-card" style={{ animation: 'fadeUp 0.6s ease 0.4s backwards' }}>
              <div className="label-mono"><span className="dot dot-ink"></span> x402 volume/day</div>
              <div className="stat-value">$28K</div>
              <div className="label-mono" style={{ color: 'var(--ink)', textTransform: 'none' }}>$420/day addressable</div>
            </div>
          </div>

          <div className="live-feed-panel" style={{ maxWidth: '800px', width: '100%', marginTop: '2rem', animation: 'fadeUp 0.6s ease 0.5s backwards' }}>
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
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="heading-section">Dashboard</h1>
              <div className="label-mono" style={{ marginTop: '0.5rem' }}>Manage your earnings & integrations</div>
            </div>
            <WalletConnect 
              onWalletConnected={setConnectedWallet}
              onWalletDisconnected={() => setConnectedWallet(null)}
            />
          </div>

          {!connectedWallet ? (
            <div style={{ background: '#1A1814', border: '1.5px solid #D4A017', borderRadius: '4px', padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: '800', color: '#D4A017', marginBottom: '1rem' }}>
                Connect Your Wallet
              </div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1rem', color: '#F5F0E8', lineHeight: '1.6' }}>
                Connect your Web3 wallet to view your earnings, send tips, and manage your creator intelligence network.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <DashboardContent wallet={connectedWallet} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <TipForm creatorWallet={connectedWallet} />
                <EmailNotifications wallet={connectedWallet} />
              </div>
            </div>
          )}

          {connectedWallet && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
              <div>
                <TransactionsFeed wallet={connectedWallet} limit={10} filter="all" />
              </div>
              <div>
                <IntelligenceFeed wallet={connectedWallet} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="view-demo" className={`view ${activeView === 'view-demo' ? 'active' : ''}`}>
        <div style={{ minHeight: 'calc(100vh - 61px)', padding: '4rem 3rem', background: 'var(--cream)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="label-mono" style={{ color: 'var(--rust)', marginBottom: '1.5rem', fontSize: '1.1rem', letterSpacing: '0.12em' }}>LIVE DEMO · PROFESSIONAL MODE</div>
            <h1 className="heading-section" style={{ fontSize: '2.6rem', marginBottom: '2.2rem', lineHeight: 1.1, color: '#181818', fontWeight: 900, letterSpacing: '-0.03em' }}>
              What is AgentTip? Why does it matter?
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5rem', marginBottom: '3.5rem' }}>
              <div className="card" style={{ padding: '2.2rem 1.5rem', background: 'linear-gradient(120deg, #f8f3ea 60%, #ede8dc 100%)', boxShadow: '0 4px 32px #eaeaea', position: 'relative', overflow: 'hidden', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.1s both' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--ink)', marginBottom: '0.7rem', letterSpacing: '-0.01em' }}>A New Earning Channel</div>
                <div style={{ fontSize: '1.01rem', color: '#3A3530', marginBottom: '0.7rem' }}>AgentTip lets you monetize your content for both humans and AI agents. Every API call, every read, every view can now pay you—automatically.</div>
                <div style={{ height: 4, width: '100%', background: 'linear-gradient(90deg, #D4A017 0%, #c54b13 100%)', borderRadius: 2, margin: '1.2rem 0', animation: 'shimmer 2.5s linear infinite' }}></div>
                <div style={{ fontSize: '0.98rem', color: '#4A7C59', fontWeight: 600, letterSpacing: '0.01em' }}>No middlemen. No platform lock-in. Just pure protocol.</div>
              </div>
              <div className="card" style={{ padding: '2.2rem 1.5rem', background: 'linear-gradient(120deg, #e6e6ff 60%, #ede8dc 100%)', boxShadow: '0 4px 32px #eaeaea', position: 'relative', overflow: 'hidden', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.3s both' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--ink)', marginBottom: '0.7rem', letterSpacing: '-0.01em' }}>Why Now?</div>
                <div style={{ fontSize: '1.01rem', color: '#3A3530', marginBottom: '0.7rem' }}>AI agents are the fastest-growing consumers of online content. AgentTip is the first protocol to let you earn from both people and bots—at web scale.</div>
                <div style={{ height: 4, width: '100%', background: 'linear-gradient(90deg, #4A7C59 0%, #D4A017 100%)', borderRadius: 2, margin: '1.2rem 0', animation: 'shimmer 2.5s linear infinite' }}></div>
                <div style={{ fontSize: '0.98rem', color: '#c54b13', fontWeight: 600, letterSpacing: '0.01em' }}>Monetize the next wave of the internet.</div>
              </div>
              <div className="card" style={{ padding: '2.2rem 1.5rem', background: 'linear-gradient(120deg, #fffbe6 60%, #ede8dc 100%)', boxShadow: '0 4px 32px #eaeaea', position: 'relative', overflow: 'hidden', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.5s both' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--ink)', marginBottom: '0.7rem', letterSpacing: '-0.01em' }}>Side Hustle for All</div>
                <div style={{ fontSize: '1.01rem', color: '#3A3530', marginBottom: '0.7rem' }}>Anyone can embed AgentTip. Writers, devs, educators, meme lords—turn your site into a 24/7 earning engine. No code required.</div>
                <div style={{ height: 4, width: '100%', background: 'linear-gradient(90deg, #c54b13 0%, #4A7C59 100%)', borderRadius: 2, margin: '1.2rem 0', animation: 'shimmer 2.5s linear infinite' }}></div>
                <div style={{ fontSize: '0.98rem', color: '#D4A017', fontWeight: 600, letterSpacing: '0.01em' }}>Make it your side hustle. Let it cook.</div>
              </div>
            </div>
            <div style={{ margin: '3.5rem 0 2.5rem 0', textAlign: 'center' }}>
              <h2 className="heading-section" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1.2rem', letterSpacing: '-0.01em' }}>How It Works</h2>
              <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                <div className="card" style={{ minWidth: 220, maxWidth: 320, flex: 1, background: '#fff', borderRadius: 8, padding: '1.5rem', border: '1.5px solid var(--ink)', boxShadow: '0 1px 6px #ede8dc', marginBottom: '1rem', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.7s both' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--ink)', fontSize: '1.08rem' }}>1. Embed the Widget</div>
                  <div style={{ fontSize: '0.97rem', color: '#3A3530' }}>Copy one script tag. Instantly enable tipping and agent payments on your site.</div>
                </div>
                <div className="card" style={{ minWidth: 220, maxWidth: 320, flex: 1, background: '#fff', borderRadius: 8, padding: '1.5rem', border: '1.5px solid var(--ink)', boxShadow: '0 1px 6px #ede8dc', marginBottom: '1rem', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.9s both' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--ink)', fontSize: '1.08rem' }}>2. Earn from Everyone</div>
                  <div style={{ fontSize: '0.97rem', color: '#3A3530' }}>Get paid in USDC by humans and AI agents. No approvals, no waiting, no minimums.</div>
                </div>
                <div className="card" style={{ minWidth: 220, maxWidth: 320, flex: 1, background: '#fff', borderRadius: 8, padding: '1.5rem', border: '1.5px solid var(--ink)', boxShadow: '0 1px 6px #ede8dc', marginBottom: '1rem', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 1.1s both' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--ink)', fontSize: '1.08rem' }}>3. Track & Optimize</div>
                  <div style={{ fontSize: '0.97rem', color: '#3A3530' }}>See real-time stats, agent intelligence, and yield optimization—all in your dashboard.</div>
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--ink)', color: 'var(--cream)', padding: '2.2rem', borderRadius: '8px', marginBottom: '2.5rem', fontFamily: "'Instrument Serif'", fontSize: '1.13rem', fontStyle: 'italic', lineHeight: 1.7, textAlign: 'center', letterSpacing: '-0.01em', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 1.3s both' }}>
              "AgentTip is the protocol for the new internet economy. You own your earnings, your data, your future. Let your content work for you—on autopilot."
            </div>
            <div style={{ background: 'var(--paper)', padding: '2rem', borderRadius: '8px', border: `1.5px solid var(--ink)`, marginBottom: '2.5rem', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 1.5s both' }}>
              <div className="label-mono" style={{ color: 'var(--rust)', marginBottom: '1.5rem' }}>Live Network Activity</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--ink)', marginBottom: '0.25rem' }}>$428.50</div>
                  <div className="label-mono" style={{ fontSize: '0.55rem' }}>Earned today</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--rust)', marginBottom: '0.25rem' }}>184K+</div>
                  <div className="label-mono" style={{ fontSize: '0.55rem' }}>Agent calls</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--sage)', marginBottom: '0.25rem' }}>284</div>
                  <div className="label-mono" style={{ fontSize: '0.55rem' }}>Human tippers</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--gold)', marginBottom: '0.25rem' }}>1.5%</div>
                  <div className="label-mono" style={{ fontSize: '0.55rem' }}>Take rate</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--ink)', marginBottom: '0.25rem' }}>Base</div>
                  <div className="label-mono" style={{ fontSize: '0.55rem' }}>Network</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: "'DM Mono'", color: 'var(--ink)', marginBottom: '0.25rem' }}>USDC</div>
                  <div className="label-mono" style={{ fontSize: '0.55rem' }}>Settlement</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', animation: 'fadeUp 1s cubic-bezier(0.4,0,0.2,1) 1.7s both' }}>
              <button className="btn btn-rust" style={{ padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.01em' }} onClick={() => switchView('view-dashboard')}>
                Start Earning Now
              </button>
              <button className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.01em' }} onClick={() => switchView('view-landing')}>
                Back to Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
