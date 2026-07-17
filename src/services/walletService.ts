import { api, isMockToken } from './api';
import { storage } from './storage';
import { generateId } from '@/utils/id';
import type { Transaction, User } from '@/types';

export const walletService = {
  async getWallet(): Promise<{ balance: number; transactions: Transaction[] }> {
    if (isMockToken()) {
      const user = storage.get<User>('currentUser');
      const transactions = storage.get<Transaction[]>('transactions') || [];
      return {
        balance: user?.balance || 0,
        transactions: transactions
          .filter(t => t.userId === user?.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      };
    }
    try {
      return await api.get<{ balance: number; transactions: Transaction[] }>('/wallet');
    } catch {
      // 后端不可用时使用本地用户余额兜底
      const currentUser = storage.get<{ id: string; balance?: number }>('currentUser');
      return {
        balance: currentUser?.balance || 0,
        transactions: storage.get<Transaction[]>('transactions') || [],
      };
    }
  },

  async recharge(amount: number): Promise<{ balance: number }> {
    if (isMockToken()) {
      const user = storage.get<User>('currentUser');
      if (!user) throw new Error('未登录');
      const newBalance = (user.balance || 0) + amount;
      const updatedUser = { ...user, balance: newBalance, updatedAt: new Date().toISOString() };
      storage.set('currentUser', updatedUser);
      // 同步 users 列表
      const users = storage.get<User[]>('users') || [];
      const uIdx = users.findIndex(u => u.id === user.id);
      if (uIdx >= 0) {
        users[uIdx] = updatedUser;
        storage.set('users', users);
      }
      // 记录流水
      const transactions = storage.get<Transaction[]>('transactions') || [];
      transactions.unshift({
        id: generateId(),
        userId: user.id,
        type: 'recharge',
        amount,
        balanceAfter: newBalance,
        description: '充值',
        createdAt: new Date().toISOString(),
      });
      storage.set('transactions', transactions);
      return { balance: newBalance };
    }
    return api.post<{ balance: number }>('/wallet/recharge', { amount });
  },

  async getTransactions(page?: number, pageSize?: number): Promise<{ list: Transaction[]; total: number }> {
    if (isMockToken()) {
      const user = storage.get<User>('currentUser');
      const all = storage.get<Transaction[]>('transactions') || [];
      const mine = all
        .filter(t => t.userId === user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const p = page || 1;
      const ps = pageSize || 20;
      const start = (p - 1) * ps;
      return { list: mine.slice(start, start + ps), total: mine.length };
    }
    return api.get<{ list: Transaction[]; total: number }>('/wallet/transactions', { page, pageSize });
  },
};
