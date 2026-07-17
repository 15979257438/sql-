import { create } from 'zustand';
import { chatService } from '@/services/chatService';
import type { Conversation, Message, MessageType } from '@/types';

interface ChatState {
  conversations: Conversation[];
  currentMessages: Message[];
  currentConversationId: string | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
  unreadCount: number;
  fetchConversations: () => Promise<void>;
  getOrCreateConversation: (productId: string) => Promise<Conversation>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, type: MessageType, content: string, imageUrl?: string, bargainId?: string) => Promise<Message>;
  markRead: (conversationId: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setCurrentConversation: (id: string | null) => void;
  appendMessage: (message: Message) => void;
  updateConversation: (conversation: Conversation) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentMessages: [],
  currentConversationId: null,
  loadingConversations: false,
  loadingMessages: false,
  unreadCount: 0,

  fetchConversations: async () => {
    set({ loadingConversations: true });
    try {
      const conversations = await chatService.getConversations();
      set({ conversations, loadingConversations: false });
    } catch {
      set({ loadingConversations: false });
    }
  },

  getOrCreateConversation: async (productId) => {
    return chatService.getOrCreateConversation(productId);
  },

  fetchMessages: async (conversationId) => {
    set({ loadingMessages: true, currentConversationId: conversationId });
    try {
      const messages = await chatService.getMessages(conversationId);
      set({ currentMessages: messages, loadingMessages: false });
    } catch {
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (conversationId, type, content, imageUrl, bargainId) => {
    const message = await chatService.sendMessage({ conversationId, type, content, imageUrl, bargainId });
    set(state => ({
      currentMessages: [...state.currentMessages, message],
    }));
    return message;
  },

  markRead: async (conversationId) => {
    await chatService.markRead(conversationId);
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === conversationId ? { ...c, unreadBuyer: 0, unreadSeller: 0 } : c
      ),
    }));
  },

  fetchUnreadCount: async () => {
    const conversations = await chatService.getConversations();
    // 由页面传入 userId 计算；store 自身不持有 userId
    set({ conversations });
  },

  setCurrentConversation: (id) => {
    set({ currentConversationId: id });
  },

  appendMessage: (message) => {
    set(state => ({
      currentMessages: [...state.currentMessages, message],
    }));
  },

  updateConversation: (conversation) => {
    set(state => ({
      conversations: [
        conversation,
        ...state.conversations.filter(c => c.id !== conversation.id),
      ].sort((a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime()),
    }));
  },
}));
