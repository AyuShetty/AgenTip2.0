import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a room based on creator wallet for targeted updates
    socket.on('join-creator', (wallet: string) => {
      const normalizedWallet = wallet.toLowerCase();
      socket.join(`creator:${normalizedWallet}`);
      console.log(`[Socket] ${socket.id} joined room creator:${normalizedWallet}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
}

export function emitNewTip(creatorWallet: string, data: any): void {
  const normalizedWallet = creatorWallet.toLowerCase();
  getIO().to(`creator:${normalizedWallet}`).emit('new-tip', data);
  getIO().emit('global-tip', data); // Also emit globally for demo
}

export function emitNewAgentPayment(creatorWallet: string, data: any): void {
  const normalizedWallet = creatorWallet.toLowerCase();
  getIO().to(`creator:${normalizedWallet}`).emit('new-agent-payment', data);
  getIO().emit('global-agent-payment', data);
}
