import { api, isMockToken, getAssetUrl } from './api';
import { storage } from './storage';
import { generateId } from '@/utils/id';
import { notificationService } from './notificationService';
import type { Order, OrderStatus, Product, Transaction, User } from '@/types';

function mapOrder(data: any): Order {
  return {
    id: data.id || data._id,
    productId: data.productId?.id || data.productId?._id || data.productId,
    buyerId: data.buyerId?.id || data.buyerId?._id || data.buyerId,
    sellerId: data.sellerId?.id || data.sellerId?._id || data.sellerId,
    status: data.status,
    price: data.price,
    message: data.message,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    cancelReason: data.cancelReason,
    cancelledBy: data.canceledBy,
    paidAt: data.paidAt,
    payMethod: data.payMethod,
  };
}

// ============ 本地 mock 实现（测试账号） ============
function getLocalOrders(): Order[] {
  return storage.get<Order[]>('orders') || [];
}

function setLocalOrders(orders: Order[]) {
  storage.set('orders', orders);
}

function findLocalProduct(productId: string): Product | undefined {
  const products = storage.get<Product[]>('products') || [];
  return products.find(p => p.id === productId);
}

function getCurrentUser(): User | null {
  return storage.get<User>('currentUser');
}

/** 提取商品摘要，用于系统消息展示 */
function productSummary(productId: string) {
  const product = findLocalProduct(productId);
  if (!product) return undefined;
  const img = product.images?.[0];
  return {
    productId,
    productTitle: product.title,
    productImage: img ? (img.startsWith('http') || img.startsWith('data:') ? img : getAssetUrl(img)) : '',
    price: product.price,
  };
}

/** 订单状态变更时给买卖双方发送系统消息 */
async function notifyOrderEvent(order: Order, event: string, body: string, status?: OrderStatus) {
  const summary = productSummary(order.productId);
  const base = {
    type: 'order' as const,
    relatedId: order.id,
    price: order.price,
    orderStatus: status,
    ...summary,
  };
  // 通知买家
  await notificationService.add({
    ...base,
    userId: order.buyerId,
    title: `订单${event}`,
    body,
  });
  // 通知卖家（内容稍作区分）
  await notificationService.add({
    ...base,
    userId: order.sellerId,
    title: `订单${event}`,
    body: body.replace('您的', '买家的'),
  });
}

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['shipped', 'cancelled'],
  shipped: ['received'],
  received: ['completed'],
};

export const orderService = {
  async create(data: { productId: string; message?: string; price?: number }): Promise<Order> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) throw new Error('未登录');
      const product = findLocalProduct(data.productId);
      if (!product) throw new Error('商品不存在');
      if (product.sellerId === user.id) throw new Error('不能购买自己的商品');
      if (product.status !== 'published') throw new Error('商品已下架或已售出');

      const now = new Date().toISOString();
      const order: Order = {
        id: generateId(),
        productId: data.productId,
        buyerId: user.id,
        sellerId: product.sellerId,
        status: 'pending',
        price: data.price ?? product.price,
        message: data.message,
        createdAt: now,
        updatedAt: now,
      };
      const orders = getLocalOrders();
      orders.unshift(order);
      setLocalOrders(orders);
      // 下单成功系统消息
      notifyOrderEvent(order, '已创建', `您的订单已创建，等待付款 ¥${(order.price / 100).toFixed(2)}`, 'pending');
      return order;
    }
    const res = await api.post<any>('/orders', data);
    return mapOrder(res);
  },

  async getByUser(type?: 'buy' | 'sell'): Promise<Order[]> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) return [];
      const orders = getLocalOrders();
      return orders.filter(o =>
        type === 'buy' ? o.buyerId === user.id :
        type === 'sell' ? o.sellerId === user.id :
        (o.buyerId === user.id || o.sellerId === user.id)
      );
    }
    try {
      const list = await api.get<any[]>('/orders', type ? { type } : undefined);
      return list.map(mapOrder);
    } catch {
      // 后端不可时使用本地订单数据兜底
      const local = storage.get<Order[]>('orders') || [];
      return local;
    }
  },

  async getById(id: string): Promise<Order> {
    if (isMockToken()) {
      const orders = getLocalOrders();
      const order = orders.find(o => o.id === id);
      if (!order) throw new Error('订单不存在');
      return order;
    }
    const res = await api.get<any>(`/orders/${id}`);
    return mapOrder(res);
  },

  async updateStatus(id: string, status: OrderStatus, cancelReason?: string): Promise<Order> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) throw new Error('未登录');
      const orders = getLocalOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx < 0) throw new Error('订单不存在');
      const order = orders[idx];
      if (!VALID_TRANSITIONS[order.status]?.includes(status)) {
        throw new Error('订单状态不允许此操作');
      }
      order.status = status;
      order.updatedAt = new Date().toISOString();
      if (status === 'cancelled') {
        order.cancelReason = cancelReason;
        order.cancelledBy = user.id;
      }
      if (status === 'completed') {
        // 标记商品为已售出
        const products = storage.get<Product[]>('products') || [];
        const pIdx = products.findIndex(p => p.id === order.productId);
        if (pIdx >= 0) {
          products[pIdx] = { ...products[pIdx], status: 'sold' };
          storage.set('products', products);
        }
      }
      orders[idx] = order;
      setLocalOrders(orders);
      // 根据新状态发送系统消息
      const eventMap: Record<string, { event: string; body: string }> = {
        accepted: { event: '已付款', body: '您的订单已付款，等待卖家发货' },
        shipped: { event: '已发货', body: '您的订单已发货，物流运输中，请注意查收' },
        received: { event: '已收货', body: '您的订单已确认收货，交易即将完成' },
        completed: { event: '已完成', body: '您的订单交易已完成，欢迎评价' },
        cancelled: { event: '已取消', body: `您的订单已取消${cancelReason ? '：' + cancelReason : ''}` },
      };
      const ev = eventMap[status];
      if (ev) notifyOrderEvent(order, ev.event, ev.body, status);
      return order;
    }
    const res = await api.put<any>(`/orders/${id}/status`, { status, cancelReason });
    return mapOrder(res);
  },

  async payWithBalance(id: string): Promise<{ order: Order; balance: number }> {
    if (isMockToken()) {
      const user = getCurrentUser();
      if (!user) throw new Error('未登录');
      const orders = getLocalOrders();
      const idx = orders.findIndex(o => o.id === id && o.buyerId === user.id);
      if (idx < 0) throw new Error('订单不存在');
      const order = orders[idx];
      if (order.status !== 'pending') throw new Error('订单状态不正确');
      if ((user.balance || 0) < order.price) throw new Error('余额不足');

      const newBalance = (user.balance || 0) - order.price;
      const updatedUser = { ...user, balance: newBalance, updatedAt: new Date().toISOString() };
      storage.set('currentUser', updatedUser);
      // 同步 users 列表
      const users = storage.get<User[]>('users') || [];
      const uIdx = users.findIndex(u => u.id === user.id);
      if (uIdx >= 0) {
        users[uIdx] = updatedUser;
        storage.set('users', users);
      }

      order.status = 'accepted';
      order.paidAt = new Date().toISOString();
      order.payMethod = 'balance';
      order.updatedAt = new Date().toISOString();
      orders[idx] = order;
      setLocalOrders(orders);

      // 记录交易流水
      const transactions = storage.get<Transaction[]>('transactions') || [];
      transactions.unshift({
        id: generateId(),
        userId: user.id,
        type: 'pay',
        amount: -order.price,
        balanceAfter: newBalance,
        orderId: order.id,
        description: `支付订单 ${order.id.slice(-6)}`,
        createdAt: new Date().toISOString(),
      });
      storage.set('transactions', transactions);

      // 付款成功系统消息
      notifyOrderEvent(order, '已付款', `您的订单已付款 ¥${(order.price / 100).toFixed(2)}，等待卖家发货`, 'accepted');

      return { order, balance: newBalance };
    }
    const res = await api.post<any>(`/orders/${id}/pay`);
    return { order: mapOrder(res.order), balance: res.balance };
  },

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    return this.updateStatus(id, 'cancelled', reason);
  },
};
