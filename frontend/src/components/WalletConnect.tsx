'use client';

import { useState, useEffect } from 'react';
import { detectAndConnectWallet, getConnectedWallet, formatWalletAddress, onAccountChanged } from '@/lib/wallet';

interface WalletConnectProps {
  onWalletConnected?: (wallet: string) => void;
  onWalletDisconnected?: () => void;
}

export default function WalletConnect({ onWalletConnected, onWalletDisconnected }: WalletConnectProps) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const connected = getConnectedWallet();
    if (connected) {
      setWallet(connected);
      onWalletConnected?.(connected);
    }

    // Listen for account changes
    const unsubscribe = onAccountChanged((account) => {
      if (account) {
        setWallet(account);
        onWalletConnected?.(account);
      } else {
        setWallet(null);
        onWalletDisconnected?.();
      }
    });

    return unsubscribe;
  }, [onWalletConnected, onWalletDisconnected]);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const connected = await detectAndConnectWallet();
      if (connected) {
        setWallet(connected);
        onWalletConnected?.(connected);
      } else {
        setError('No Web3 wallet detected. Please install MetaMask or similar.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    setError(null);
    onWalletDisconnected?.();
  };

  if (wallet) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: '#F5F0E8' }}>
          {formatWalletAddress(wallet)}
        </div>
        <button
          onClick={handleDisconnect}
          style={{
            padding: '0.5rem 1rem',
            fontFamily: "'Syne', sans-serif",
            fontWeight: '700',
            fontSize: '0.8rem',
            background: 'transparent',
            color: '#c54b13',
            border: '1.5px solid #c54b13',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.background = '#c54b13';
            target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.background = 'transparent';
            target.style.color = '#c54b13';
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button
        onClick={handleConnect}
        disabled={loading}
        style={{
          padding: '0.75rem 1.25rem',
          fontFamily: "'Syne', sans-serif",
          fontWeight: '700',
          fontSize: '0.95rem',
          background: loading ? '#8C7B6B' : '#c54b13',
          color: '#ffffff',
          border: '1.5px solid #c54b13',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#FFB74D', padding: '0.5rem', background: 'rgba(255, 183, 77, 0.1)', borderRadius: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
