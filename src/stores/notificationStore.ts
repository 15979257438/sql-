import { create } from 'zustand';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchAll: (userId: string) => Promise<void>;
  add: (userId: string, type: 'order' | 'message' | 'system', title: string, body: string, relatedId?: string) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
  fetchUnreadCount: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchAll: async (userId) => {
    set({ loading: true });
    try {
      const notifications = await notificationService.getAll(userId);
      set({ notifications, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  add: async (userId, type, title, body, relatedId) => {
    await notificationService.add({ userId, type, title, body, relatedId });
  },

  markRead: async (id) => {
    await notificationService.markRead(id);
    set(state => ({
      notifications: state.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async (userId) => {
    await notificationService.markAllRead(userId);
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  fetchUnreadCount: async (userId) => {
    const count = await notificationService.getUnreadCount(userId);
    set({ unreadCount: count });
  },
}));
