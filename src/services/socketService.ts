import { io, Socket } from 'socket.io-client';
import Taro from '@tarojs/taro';
import { CONFIG } from '@/constants/config';
import { getToken, isMockToken } from './api';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  connect() {
    if (this.socket?.connected) return;
    const token = getToken();
    if (!token || isMockToken(token)) return;

    const baseUrl = CONFIG.API_BASE_URL.replace(/\/api$/, '');
    this.socket = io(baseUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('message', (data) => {
      this.emit('message', data);
    });

    this.socket.on('conversation_updated', (data) => {
      this.emit('conversation_updated', data);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendMessage(data: { conversationId: string; type: string; content: string; imageUrl?: string }) {
    this.socket?.emit('send_message', data);
  }

  markRead(conversationId: string) {
    this.socket?.emit('mark_read', conversationId);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }
}

export const socketService = new SocketService();
