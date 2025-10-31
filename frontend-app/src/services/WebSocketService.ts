import { io, Socket } from 'socket.io-client';
import { NewAlertEvent, AlertUpdatedEvent } from '@/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(WS_URL, {
        auth: { token },
        reconnection: false,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        this.emit('connected');
        resolve();
      });

      this.socket.on('disconnect', () => {
        this.emit('disconnected');
      });

      this.socket.on('alert', (event: any) => {
        if (event.type === 'NEW_ALERT') {
          this.emit('newAlert', event.data);
        } else if (event.type === 'ALERT_UPDATED') {
          this.emit('alertUpdated', event.data);
        }
      });

      this.socket.on('error', (error: any) => {
        this.emit('error', error);
        reject(error);
      });

      setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  reconnect(token: string): Promise<void> {
    this.disconnect();
    return this.connect(token);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const webSocketService = new WebSocketService();
