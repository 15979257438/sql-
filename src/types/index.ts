// ============ Category ============
export type Category =
  | 'textbook'   // 教材教辅
  | 'digital'    // 数码电子
  | 'clothing'   // 服装鞋包
  | 'beauty'     // 美妆护肤
  | 'home'       // 家居日用
  | 'sports'     // 运动户外
  | 'other';     // 其他

// ============ Condition ============
export type Condition = 'new' | 'like_new' | 'used';

// ============ Trade Method ============
export type TradeMethod = 'pickup' | 'delivery' | 'both';

// ============ Product Status ============
export type ProductStatus = 'published' | 'sold' | 'offline';

// ============ Order Status ============
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'shipped'
  | 'received'
  | 'completed'
  | 'cancelled';

// ============ Message Type ============
export type MessageType = 'text' | 'image' | 'bargain' | 'system';

// ============ User ============
export interface User {
  id: string;
  openid?: string;
  phone?: string;
  nickname: string;
  avatar: string;
  school: string;
  department: string;
  bio: string;
  verified: boolean;
  rating: number; // 1-5
  balance: number; // 分
  createdAt: string;
  updatedAt: string;
}

// ============ Product ============
export interface Product {
  id: string;
  sellerId: string;
  seller?: User;
  title: string;
  description: string;
  price: number; // 分
  originalPrice?: number;
  category: Category;
  condition: Condition;
  images: string[];
  tradeMethod: TradeMethod;
  location?: string;
  status: ProductStatus;
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
}

// ============ Order ============
export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  price: number; // 分
  message?: string;
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
  cancelledBy?: string;
  paidAt?: string;
  payMethod?: 'balance' | 'wechat';
}

// ============ Review ============
export interface Review {
  id: string;
  orderId: string;
  productId: string;
  reviewerId: string;
  targetId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

// ============ Message ============
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  imageUrl?: string;
  bargainId?: string;
  read: boolean;
  createdAt: string;
}

// ============ Conversation ============
export interface Conversation {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadBuyer: number;
  unreadSeller: number;
  product?: Product;
  buyer?: User;
  seller?: User;
  createdAt: string;
  updatedAt: string;
}

// ============ Bargain ============
export type BargainStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface BargainOffer {
  userId: string;
  price: number;
  message?: string;
  createdAt: string;
}

export interface Bargain {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  originalPrice: number;
  currentPrice: number;
  targetPrice: number;
  status: BargainStatus;
  offers: BargainOffer[];
  product?: Product;
  buyer?: User;
  seller?: User;
  createdAt: string;
  updatedAt: string;
}

// ============ Transaction ============
export type TransactionType = 'recharge' | 'pay' | 'refund' | 'withdraw';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  orderId?: string;
  description?: string;
  createdAt: string;
}

// ============ Notification ============
export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'message' | 'system';
  title: string;
  body: string;
  relatedId?: string;
  // 系统消息关联的商品/订单详情，用于消息界面展示
  productId?: string;
  productImage?: string;
  productTitle?: string;
  price?: number;
  orderStatus?: OrderStatus;
  read: boolean;
  createdAt: string;
}

// ============ API ============
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export type TargetType = 'product' | 'user' | 'message';
export type ReportStatus = 'pending' | 'resolved' | 'rejected';

export interface Report {
  id: string;
  reporterId: string;
  targetType: TargetType;
  targetId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// ============ Address ============
export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}