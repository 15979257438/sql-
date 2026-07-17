import { create } from 'zustand';
import { authService } from '@/services/authService';
import { storage } from '@/services/storage';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  loginWithSms: (phone: string, code: string) => Promise<boolean>;
  loginWithWechat: () => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const local = storage.get<User>('currentUser');
    if (!local) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: local, isAuthenticated: true, isLoading: false });
    }
  },

  login: async (phone, password) => {
    const user = await authService.login(phone, password);
    set({ user, isAuthenticated: true });
    return true;
  },

  loginWithSms: async (phone, code) => {
    const user = await authService.loginWithSms(phone, code);
    set({ user, isAuthenticated: true });
    return true;
  },

  loginWithWechat: async () => {
    const user = await authService.loginWithWechat();
    set({ user, isAuthenticated: true });
    return user;
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    const user = await authService.updateProfile(data);
    set({ user });
  },
}));
