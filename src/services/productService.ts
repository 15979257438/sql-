import { api, getAssetUrl, isMockToken } from './api';
import { storage } from './storage';
import type { Product, Category, Condition, TradeMethod } from '@/types';

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: Category;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  tradeMethod?: TradeMethod;
  sort?: 'latest' | 'price_asc' | 'price_desc';
  sellerId?: string;
  status?: string;
}

function mapUser(data: any): any {
  if (!data) return undefined;
  return {
    id: data.id || data._id,
    nickname: data.nickname,
    avatar: data.avatar,
    school: data.school,
    department: data.department,
    rating: data.rating,
    soldCount: data.soldCount,
  };
}

function mapProduct(data: any): Product {
  return {
    id: data.id || data._id,
    sellerId: data.sellerId?.id || data.sellerId?._id || data.sellerId,
    seller: mapUser(data.sellerId),
    title: data.title,
    description: data.description,
    price: data.price,
    originalPrice: data.originalPrice,
    category: data.category,
    condition: data.condition,
    images: (data.images || []).map((url: string) => getAssetUrl(url)),
    tradeMethod: data.tradeMethod,
    location: data.location,
    status: data.status,
    views: data.views || 0,
    favorites: data.favorites || 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function getLocalProducts(): Product[] {
  return storage.get<Product[]>('products') || [];
}

function filterLocalProducts(params: ProductListParams): { items: Product[]; total: number; hasMore: boolean } {
  const { page = 1, pageSize = 10, category, keyword, minPrice, maxPrice, condition, tradeMethod, sort = 'latest', sellerId, status } = params;
  let products = getLocalProducts();

  if (!sellerId && !status) {
    products = products.filter(p => p.status === 'published');
  }
  if (sellerId) products = products.filter(p => p.sellerId === sellerId);
  if (status) products = products.filter(p => p.status === status);
  if (category) products = products.filter(p => p.category === category);
  if (keyword?.trim()) {
    const kw = keyword.trim().toLowerCase();
    products = products.filter(p => p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw));
  }
  if (minPrice !== undefined) products = products.filter(p => p.price >= minPrice);
  if (maxPrice !== undefined) products = products.filter(p => p.price <= maxPrice);
  if (condition) products = products.filter(p => p.condition === condition);
  if (tradeMethod && tradeMethod !== 'both') {
    products = products.filter(p => p.tradeMethod === tradeMethod || p.tradeMethod === 'both');
  }

  switch (sort) {
    case 'price_asc': products.sort((a, b) => a.price - b.price); break;
    case 'price_desc': products.sort((a, b) => b.price - a.price); break;
    case 'latest': default: products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
  }

  const total = products.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { items: products.slice(start, end), total, hasMore: end < total };
}

export const productService = {
  async list(params: ProductListParams = {}): Promise<{ items: Product[]; total: number; hasMore: boolean }> {
    // 测试账号直接走本地数据，避免后端不可用时的连接错误
    if (isMockToken()) {
      return filterLocalProducts(params);
    }
    try {
      const res = await api.get<{ list: any[]; total: number; page: number; pageSize: number; hasMore: boolean }>('/products', params as Record<string, any>);
      return {
        items: res.list.map(mapProduct),
        total: res.total,
        hasMore: res.hasMore,
      };
    } catch {
      return filterLocalProducts(params);
    }
  },

  async getById(id: string): Promise<Product | null> {
    // 测试账号直接走本地，避免后端不可用时连接超时导致卡顿
    if (isMockToken()) {
      const products = getLocalProducts();
      return products.find(p => p.id === id) || null;
    }
    try {
      const data = await api.get<any>(`/products/${id}`);
      return mapProduct(data);
    } catch {
      const products = getLocalProducts();
      const product = products.find(p => p.id === id) || null;
      return product;
    }
  },

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites' | 'status'>): Promise<Product> {
    if (isMockToken()) {
      const user = storage.get<{ id: string }>('currentUser');
      if (!user) throw new Error('未登录');
      const now = new Date().toISOString();
      const product: Product = {
        ...data,
        id: `p_${Date.now()}`,
        sellerId: user.id,
        status: 'published',
        views: 0,
        favorites: 0,
        createdAt: now,
        updatedAt: now,
      };
      const products = getLocalProducts();
      products.unshift(product);
      storage.set('products', products);
      return product;
    }
    const res = await api.post<any>('/products', data as Record<string, any>);
    return mapProduct(res);
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    if (isMockToken()) {
      const products = getLocalProducts();
      const idx = products.findIndex(p => p.id === id);
      if (idx < 0) throw new Error('商品不存在');
      products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
      storage.set('products', products);
      return products[idx];
    }
    const res = await api.put<any>(`/products/${id}`, data as Record<string, any>);
    return mapProduct(res);
  },

  async delete(id: string): Promise<void> {
    if (isMockToken()) {
      const products = getLocalProducts();
      storage.set('products', products.filter(p => p.id !== id));
      return;
    }
    await api.delete<void>(`/products/${id}`);
  },

  async markAsSold(id: string): Promise<Product> {
    return this.update(id, { status: 'sold' });
  },

  async markAsOffline(id: string): Promise<Product> {
    return this.update(id, { status: 'offline' });
  },

  async relist(id: string): Promise<Product> {
    return this.update(id, { status: 'published' });
  },
};
