import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIState {
  offline: boolean;
  toasts: ToastMessage[];
  setOffline: (v: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set) => ({
  offline: false,
  toasts: [],

  setOffline: (v) => set({ offline: v }),

  showToast: (message, type = 'info') => {
    const id = `toast_${++toastId}_${Date.now()}`;
    const duration = 2500;

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    // 自动移除
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration + 300); // 加上动画时间
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));