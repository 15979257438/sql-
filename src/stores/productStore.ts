import { create } from 'zustand';
import { productService } from '@/services/productService';
import type { Product, Category, Condition, TradeMethod } from '@/types';

interface ProductState {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  filters: {
    category?: Category;
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: Condition;
    tradeMethod?: TradeMethod;
    sort?: 'latest' | 'price_asc' | 'price_desc';
  };
  fetchProducts: (reset?: boolean) => Promise<void>;
  getProduct: (id: string) => Promise<Product | null>;
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites' | 'status'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  markAsSold: (id: string) => Promise<void>;
  markAsOffline: (id: string) => Promise<void>;
  relist: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ProductState['filters']>) => void;
  fetchUserProducts: (userId: string) => Promise<Product[]>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  hasMore: true,
  page: 1,
  filters: { sort: 'latest' },

  fetchProducts: async (reset = false) => {
    const state = get();
    if (state.loading) return;
    if (!reset && !state.hasMore) return;

    set({ loading: true });
    const page = reset ? 1 : state.page;

    try {
      const result = await productService.list({
        page,
        pageSize: 10,
        ...state.filters,
      });

      set({
        products: reset ? result.items : [...state.products, ...result.items],
        hasMore: result.hasMore,
        page: page + 1,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  getProduct: async (id) => {
    return productService.getById(id);
  },

  createProduct: async (data) => {
    const product = await productService.create(data);
    return product;
  },

  updateProduct: async (id, data) => {
    await productService.update(id, data);
  },

  deleteProduct: async (id) => {
    await productService.delete(id);
    set(state => ({ products: state.products.filter(p => p.id !== id) }));
  },

  markAsSold: async (id) => {
    await productService.markAsSold(id);
    set(state => ({
      products: state.products.map(p => p.id === id ? { ...p, status: 'sold' as const } : p),
    }));
  },

  markAsOffline: async (id) => {
    await productService.markAsOffline(id);
    set(state => ({
      products: state.products.map(p => p.id === id ? { ...p, status: 'offline' as const } : p),
    }));
  },

  relist: async (id) => {
    await productService.relist(id);
    set(state => ({
      products: state.products.map(p => p.id === id ? { ...p, status: 'published' as const } : p),
    }));
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  fetchUserProducts: async (userId) => {
    const result = await productService.list({ sellerId: userId, pageSize: 100 });
    return result.items;
  },
}));
