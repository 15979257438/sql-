import { create } from 'zustand';
import { storage } from '@/services/storage';

interface CartState {
  items: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  clear: () => void;
  isInCart: (productId: string) => boolean;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: storage.get<string[]>('cart') || [],

  add: (productId) => {
    const { items } = get();
    if (items.includes(productId)) return;
    const updated = [...items, productId];
    set({ items: updated });
    storage.set('cart', updated);
  },

  remove: (productId) => {
    const { items } = get();
    const updated = items.filter(id => id !== productId);
    set({ items: updated });
    storage.set('cart', updated);
  },

  toggle: (productId) => {
    const { items, add, remove } = get();
    if (items.includes(productId)) {
      remove(productId);
    } else {
      add(productId);
    }
  },

  clear: () => {
    set({ items: [] });
    storage.set('cart', []);
  },

  isInCart: (productId) => get().items.includes(productId),

  count: () => get().items.length,
}));
