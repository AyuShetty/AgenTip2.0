import type { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '').replace(/^http/, 'ws') || 'ws://localhost:3001';
let socket: Socket | null = null;
let ioModule: any = null;

// Initialize io module only on client side
const initIOModule = () => {
  if (ioModule || typeof window === 'undefined') return ioModule;
  try {
    ioModule = require('socket.io-client');
  } catch (e) {
    console.error('Failed to load socket.io-client:', e);
  }
  return ioModule;
};

export function getSocket(): Socket | null {
  if (!socket && typeof window !== 'undefined') {
    const mod = initIOModule();
    if (mod && mod.io) {
      socket = mod.io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });
    }
  }
  return socket;
}

export function createSocket(url: string = SOCKET_URL): Socket | null {
  if (typeof window === 'undefined') return null;
  const mod = initIOModule();
  if (mod && mod.io) {
    return mod.io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return null;
}

export function subscribeToGlobalTips(cb: (data: any) => void) {
  const s = getSocket();
  if (s) {
    s.on('global-tip', cb);
    s.on('global-agent-payment', cb);
    return () => {
      s.off('global-tip', cb);
      s.off('global-agent-payment', cb);
    };
  }
  return () => {};
}
