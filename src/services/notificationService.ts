import { storage } from './storage';
import { generateId } from '@/utils/id';
import type { Notification } from '@/types';

export const notificationService = {
  async getAll(userId: string): Promise<Notification[]> {
    const notifications = storage.get<Notification[]>('notifications') || [];
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async add(data: {
    userId: string;
    type: 'order' | 'message' | 'system';
    title: string;
    body: string;
    relatedId?: string;
    productId?: string;
    productImage?: string;
    productTitle?: string;
    price?: number;
    orderStatus?: import('@/types').OrderStatus;
  }): Promise<Notification> {
    const notifications = storage.get<Notification[]>('notifications') || [];
    const notification: Notification = {
      id: generateId(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      relatedId: data.relatedId,
      productId: data.productId,
      productImage: data.productImage,
      productTitle: data.productTitle,
      price: data.price,
      orderStatus: data.orderStatus,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(notification);
    storage.set('notifications', notifications);
    return notification;
  },

  async markRead(id: string): Promise<void> {
    const notifications = storage.get<Notification[]>('notifications') || [];
    const idx = notifications.findIndex(n => n.id === id);
    if (idx >= 0) {
      notifications[idx].read = true;
      storage.set('notifications', notifications);
    }
  },

  async markAllRead(userId: string): Promise<void> {
    const notifications = storage.get<Notification[]>('notifications') || [];
    notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    storage.set('notifications', notifications);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = storage.get<Notification[]>('notifications') || [];
    return notifications.filter(n => n.userId === userId && !n.read).length;
  },
};
