import { api, isMockToken } from './api';
import { storage } from './storage';
import type { Conversation, Message, MessageType, Product, User } from '@/types';

function enrichConversation(data: any): Conversation {
  const products = storage.get<Product[]>('products') || [];
  const users = storage.get<User[]>('users') || [];
  const product = products.find(p => p.id === data.productId);
  const buyer = users.find(u => u.id === data.buyerId);
  const seller = users.find(u => u.id === data.sellerId);
  return {
    id: data.id || data._id,
    productId: data.productId,
    buyerId: data.buyerId,
    sellerId: data.sellerId,
    lastMessage: data.lastMessage,
    lastMessageAt: data.lastMessageAt,
    unreadBuyer: data.unreadBuyer || 0,
    unreadSeller: data.unreadSeller || 0,
    product,
    buyer,
    seller,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function mapMessage(data: any): Message {
  return {
    id: data.id || data._id,
    conversationId: data.conversationId,
    senderId: data.senderId?.id || data.senderId?._id || data.senderId,
    type: data.type,
    content: data.content,
    imageUrl: data.imageUrl,
    bargainId: data.bargainId,
    read: data.read,
    createdAt: data.createdAt,
  };
}

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    if (isMockToken()) {
      const local = storage.get<Conversation[]>('conversations') || [];
      return local.map(enrichConversation);
    }
    try {
      const list = await api.get<any[]>('/chats/conversations');
      return list.map(enrichConversation);
    } catch {
      const local = storage.get<Conversation[]>('conversations') || [];
      return local.map(enrichConversation);
    }
  },

  async getConversation(id: string): Promise<Conversation> {
    if (isMockToken()) {
      const local = storage.get<Conversation[]>('conversations') || [];
      const found = local.find(c => c.id === id);
      if (!found) throw new Error('会话不存在');
      return enrichConversation(found);
    }
    const convs = await api.get<any[]>('/chats/conversations');
    const data = convs.find((c: any) => (c.id || c._id) === id);
    if (!data) throw new Error('会话不存在');
    return enrichConversation(data);
  },

  async getOrCreateConversation(productId: string): Promise<Conversation> {
    if (isMockToken()) {
      const local = storage.get<Conversation[]>('conversations') || [];
      const existing = local.find(c => c.productId === productId);
      if (existing) return enrichConversation(existing);
      const products = storage.get<Product[]>('products') || [];
      const product = products.find(p => p.id === productId);
      const currentUser = storage.get<User>('currentUser');
      const conv: Conversation = {
        id: `local_conv_${Date.now()}`,
        productId,
        buyerId: currentUser?.id || '',
        sellerId: product?.sellerId || '',
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadBuyer: 0,
        unreadSeller: 0,
        product,
        buyer: currentUser || undefined,
        seller: product ? (storage.get<User[]>('users') || []).find(u => u.id === product.sellerId) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.set('conversations', [conv, ...local]);
      return conv;
    }
    const data = await api.post<any>('/chats/conversations', { productId });
    return enrichConversation(data);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    if (isMockToken()) {
      return storage.get<Message[]>(`messages_${conversationId}`) || [];
    }
    const list = await api.get<any[]>(`/chats/conversations/${conversationId}/messages`);
    return list.map(mapMessage);
  },

  async sendMessage(data: {
    conversationId: string;
    type: MessageType;
    content: string;
    imageUrl?: string;
    bargainId?: string;
  }): Promise<Message> {
    if (isMockToken()) {
      const msg: Message = {
        id: `local_msg_${Date.now()}`,
        conversationId: data.conversationId,
        senderId: '',
        type: data.type,
        content: data.content,
        imageUrl: data.imageUrl,
        bargainId: data.bargainId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      const key = `messages_${data.conversationId}`;
      const list = storage.get<Message[]>(key) || [];
      storage.set(key, [...list, msg]);
      const convs = storage.get<Conversation[]>('conversations') || [];
      storage.set('conversations', convs.map(c => c.id === data.conversationId ? {
        ...c,
        lastMessage: data.type === 'image' ? '[图片]' : data.content,
        lastMessageAt: msg.createdAt,
      } : c));
      return msg;
    }
    const res = await api.post<any>(`/chats/conversations/${data.conversationId}/messages`, {
      type: data.type,
      content: data.content,
      imageUrl: data.imageUrl,
      bargainId: data.bargainId,
    });
    return mapMessage(res);
  },

  async markRead(conversationId: string): Promise<void> {
    if (isMockToken()) {
      const convs = storage.get<Conversation[]>('conversations') || [];
      storage.set('conversations', convs.map(c => c.id === conversationId ? {
        ...c, unreadBuyer: 0, unreadSeller: 0,
      } : c));
      return;
    }
    await api.post<void>(`/chats/conversations/${conversationId}/read`);
  },

  async getUnreadCount(): Promise<number> {
    const convs = await this.getConversations();
    // 需要当前用户 ID 来判断哪边未读；简单起见由调用方传入
    return 0;
  },
};
