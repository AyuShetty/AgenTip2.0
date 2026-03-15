import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '').replace(/^http/, 'ws') || 'ws://localhost:3001';
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

export function subscribeToGlobalTips(cb: (data: any) => void) {
  const s = getSocket();
  s.on('global-tip', cb);
  s.on('global-agent-payment', cb);
  return () => {
    s.off('global-tip', cb);
    s.off('global-agent-payment', cb);
  };
}
