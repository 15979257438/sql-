import { create } from 'zustand';
import { storage } from '@/services/storage';
import type { Condition, TradeMethod } from '@/types';

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  tradeMethod?: TradeMethod;
  sort?: 'latest' | 'price_asc' | 'price_desc';
}

interface SearchState {
  history: string[];
  filters: SearchFilters;
  addToHistory: (keyword: string) => void;
  clearHistory: () => void;
  removeFromHistory: (keyword: string) => void;
  loadHistory: () => void;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  history: [],
  filters: { sort: 'latest' },

  loadHistory: () => {
    const history = storage.get<string[]>('searchHistory') || [];
    set({ history });
  },

  addToHistory: (keyword) => {
    if (!keyword.trim()) return;
    const { history } = get();
    const filtered = history.filter(h => h !== keyword);
    const updated = [keyword, ...filtered].slice(0, 20);
    set({ history: updated });
    storage.set('searchHistory', updated);
  },

  clearHistory: () => {
    set({ history: [] });
    storage.set('searchHistory', []);
  },

  removeFromHistory: (keyword) => {
    const { history } = get();
    const updated = history.filter(h => h !== keyword);
    set({ history: updated });
    storage.set('searchHistory', updated);
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  clearFilters: () => {
    set({ filters: { sort: 'latest' } });
  },
}));
