import { io, Socket } from 'socket.io-client';
import { WebSocketMessage } from '@/types';

class WebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(url: string = 'ws://localhost:3030') {
    if (this.socket?.connected) return;

    this.socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
    });

    this.socket.on('message', (message: WebSocketMessage) => {
      this.emit(message.type, message.data);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const wsClient = new WebSocketClient();