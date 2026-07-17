import { api, isMockToken } from './api';
import { storage } from './storage';
import { generateId } from '@/utils/id';
import type { Bargain, BargainOffer, Product, User } from '@/types';

function mapBargain(data: any): Bargain {
  return {
    id: data.id || data._id,
    productId: data.productId?.id || data.productId?._id || data.productId,
    buyerId: data.buyerId?.id || data.buyerId?._id || data.buyerId,
    sellerId: data.sellerId?.id || data.sellerId?._id || data.sellerId,
    originalPrice: data.originalPrice,
    currentPrice: data.currentPrice,
    targetPrice: data.targetPrice,
    status: data.status,
    offers: data.offers || [],
    product: data.productId,
    buyer: data.buyerId,
    seller: data.sellerId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ============ 本地 mock 实现（测试账号） ============
function getLocalBargains(): Bargain[] {
  return storage.get<Bargain[]>('bargains') || [];
}

function setLocalBargains(list: Bargain[]) {
  storage.set('bargains', list);
}

function getCurrentUser(): User | null {
  return storage.get<User>('currentUser');
}

function findLocalProduct(productId: string): Product | undefined {
  const products = storage.get<Product[]>('products') || [];
  return products.find(p => p.id === productId);
}

/** 填充本地砍价的 product/buyer/seller 关联对象，便于 UI 展示 */
function populateLocal(bargain: Bargain): Bargain {
  const product = findLocalProduct(bargain.productId);
  const users = storage.get<User[]>('users') || [];
  return {
    ...bargain,
    product,
    buyer: users.find(u => u.id === bargain.buyerId),
    seller: users.find(u => u.id === bargain.sellerId),
  };
}

export const bargainService = {
  async create(productId: string, targetPrice: number, message?: string): Promise<Bargain> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) throw new Error('未登录');
      const product = findLocalProduct(productId);
      if (!product) throw new Error('商品不存在');
      if (product.sellerId === user.id) throw new Error('不能砍价自己的商品');
      if (targetPrice >= product.price) throw new Error('砍价目标需低于当前价格');

      const list = getLocalBargains();
      const existing = list.find(b => b.productId === productId && b.buyerId === user.id && b.status === 'pending');
      if (existing) throw new Error('已存在进行中的砍价，请先处理');

      const now = new Date().toISOString();
      const bargain: Bargain = {
        id: generateId(),
        productId,
        buyerId: user.id,
        sellerId: product.sellerId,
        originalPrice: product.price,
        currentPrice: targetPrice,
        targetPrice,
        status: 'pending',
        offers: [{ userId: user.id, price: targetPrice, message, createdAt: now }],
        createdAt: now,
        updatedAt: now,
      };
      setLocalBargains([bargain, ...list]);
      return populateLocal(bargain);
    }
    const data = await api.post<any>('/bargains', { productId, targetPrice, message });
    return mapBargain(data);
  },

  async getList(role?: 'buyer' | 'seller'): Promise<Bargain[]> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) return [];
      const list = getLocalBargains();
      const filtered = list.filter(b =>
        role === 'buyer' ? b.buyerId === user.id :
        role === 'seller' ? b.sellerId === user.id :
        (b.buyerId === user.id || b.sellerId === user.id)
      );
      return filtered
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .map(populateLocal);
    }
    try {
      const list = await api.get<any[]>('/bargains', role ? { role } : undefined);
      return list.map(mapBargain);
    } catch {
      // 后端不可用时使用本地数据兜底
      const local = storage.get<Bargain[]>('bargains') || [];
      return local;
    }
  },

  async getById(id: string): Promise<Bargain> {
    if (isMockToken()) {
      const list = getLocalBargains();
      const bargain = list.find(b => b.id === id);
      if (!bargain) throw new Error('砍价不存在');
      return populateLocal(bargain);
    }
    const data = await api.get<any>(`/bargains/${id}`);
    return mapBargain(data);
  },

  async offer(id: string, price: number, message?: string): Promise<Bargain> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) throw new Error('未登录');
      if (!price || price <= 0) throw new Error('请输入有效价格');
      const list = getLocalBargains();
      const idx = list.findIndex(b => b.id === id);
      if (idx < 0) throw new Error('砍价不存在');
      const bargain = list[idx];
      if (bargain.status !== 'pending') throw new Error('砍价已结束');
      // 不能给自己连续出价
      const lastOffer = bargain.offers[bargain.offers.length - 1];
      if (lastOffer && lastOffer.userId === user.id) {
        throw new Error('请等待对方回应');
      }
      const offer: BargainOffer = {
        userId: user.id,
        price,
        message,
        createdAt: new Date().toISOString(),
      };
      bargain.offers.push(offer);
      bargain.currentPrice = price;
      bargain.updatedAt = new Date().toISOString();
      list[idx] = bargain;
      setLocalBargains(list);
      return populateLocal(bargain);
    }
    const data = await api.post<any>(`/bargains/${id}/offer`, { price, message });
    return mapBargain(data);
  },

  async accept(id: string): Promise<{ bargain: Bargain; orderId: string }> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) throw new Error('未登录');
      const list = getLocalBargains();
      const idx = list.findIndex(b => b.id === id);
      if (idx < 0) throw new Error('砍价不存在');
      const bargain = list[idx];
      if (bargain.status !== 'pending') throw new Error('砍价已结束');
      const lastOffer = bargain.offers[bargain.offers.length - 1];
      if (!lastOffer) throw new Error('暂无出价可接受');
      if (lastOffer.userId === user.id) {
        throw new Error('不能接受自己的出价，请等待对方回应');
      }

      bargain.status = 'accepted';
      bargain.updatedAt = new Date().toISOString();
      list[idx] = bargain;
      setLocalBargains(list);

      // 生成待支付订单
      const now = new Date().toISOString();
      const order = {
        id: generateId(),
        productId: bargain.productId,
        buyerId: bargain.buyerId,
        sellerId: bargain.sellerId,
        status: 'pending' as const,
        price: bargain.currentPrice,
        message: `砍价成交 ¥${bargain.currentPrice}`,
        createdAt: now,
        updatedAt: now,
      };
      const orders = storage.get<any[]>('orders') || [];
      orders.unshift(order);
      storage.set('orders', orders);

      return { bargain: populateLocal(bargain), orderId: order.id };
    }
    const data = await api.post<any>(`/bargains/${id}/accept`);
    return { bargain: mapBargain(data.bargain), orderId: data.orderId };
  },

  async reject(id: string): Promise<Bargain> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) throw new Error('未登录');
      const list = getLocalBargains();
      const idx = list.findIndex(b => b.id === id);
      if (idx < 0) throw new Error('砍价不存在');
      const bargain = list[idx];
      if (bargain.status !== 'pending') throw new Error('砍价已结束');
      bargain.status = 'rejected';
      bargain.updatedAt = new Date().toISOString();
      list[idx] = bargain;
      setLocalBargains(list);
      return populateLocal(bargain);
    }
    const data = await api.post<any>(`/bargains/${id}/reject`);
    return mapBargain(data);
  },
};
