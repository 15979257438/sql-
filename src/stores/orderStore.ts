import { create } from 'zustand';
import { orderService } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';

interface OrderState {
  orders: Order[];
  loading: boolean;
  createOrder: (productId: string, message?: string, price?: number) => Promise<Order>;
  fetchOrders: (type?: 'buy' | 'sell') => Promise<void>;
  updateStatus: (id: string, status: OrderStatus, cancelReason?: string) => Promise<void>;
  payWithBalance: (id: string) => Promise<{ order: Order; balance: number }>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,

  createOrder: async (productId, message, price) => {
    const order = await orderService.create({ productId, message, price });
    set(state => ({ orders: [order, ...state.orders] }));
    return order;
  },

  fetchOrders: async (type) => {
    set({ loading: true });
    try {
      const orders = await orderService.getByUser(type);
      set({ orders, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status, cancelReason) => {
    const order = await orderService.updateStatus(id, status, cancelReason);
    set(state => ({
      orders: state.orders.map(o => (o.id === id ? order : o)),
    }));
  },

  payWithBalance: async (id) => {
    const result = await orderService.payWithBalance(id);
    set(state => ({
      orders: state.orders.map(o => (o.id === id ? result.order : o)),
    }));
    return result;
  },
}));
