import { Router } from 'express';
import { Order, Product, User, Transaction } from '../models';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 创建订单
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { productId, message, price } = req.body;
  const product = await Product.findById(productId);
  if (!product) return fail(res, '商品不存在');
  if (product.sellerId.toString() === req.userId) return fail(res, '不能购买自己的商品');
  if (product.status !== 'published') return fail(res, '商品已下架或已售出');

  const order = await Order.create({
    productId,
    buyerId: req.userId,
    sellerId: product.sellerId,
    price: price || product.price,
    message,
    status: 'pending',
  });

  const populated = await Order.findById(order._id)
    .populate('productId')
    .populate('buyerId', 'nickname avatar')
    .populate('sellerId', 'nickname avatar');
  success(res, populated);
});

// 我的订单
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { type } = req.query; // 'buy' | 'sell'
  const filter: any = {};
  if (type === 'buy') filter.buyerId = req.userId;
  if (type === 'sell') filter.sellerId = req.userId;
  if (!type) filter.$or = [{ buyerId: req.userId }, { sellerId: req.userId }];

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate('productId')
    .populate('buyerId', 'nickname avatar')
    .populate('sellerId', 'nickname avatar');
  success(res, orders);
});

// 订单详情
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
  })
    .populate('productId')
    .populate('buyerId', 'nickname avatar')
    .populate('sellerId', 'nickname avatar');
  if (!order) return fail(res, '订单不存在', 404, 404);
  success(res, order);
});

// 更新订单状态
router.put('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  const { status, cancelReason } = req.body;
  const order = await Order.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
  });
  if (!order) return fail(res, '订单不存在', 404, 404);

  // 状态机校验
  const validTransitions: Record<string, string[]> = {
    pending: ['accepted', 'cancelled'],
    accepted: ['shipped', 'cancelled'],
    shipped: ['received'],
    received: ['completed'],
  };
  if (!validTransitions[order.status]?.includes(status)) {
    return fail(res, '订单状态不允许此操作');
  }

  order.status = status;
  if (status === 'cancelled') {
    order.cancelReason = cancelReason;
    order.cancelledBy = new (require('mongoose').Types.ObjectId)(req.userId);
  }
  if (status === 'completed') {
    await Product.findByIdAndUpdate(order.productId, { status: 'sold' });
    await User.findByIdAndUpdate(order.sellerId, { $inc: { soldCount: 1 } });
  }
  await order.save();
  success(res, order);
});

// 余额支付
router.post('/:id/pay', authMiddleware, async (req: AuthRequest, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.userId, status: 'pending' });
  if (!order) return fail(res, '订单不存在或状态不正确');

  const buyer = await User.findById(req.userId);
  if (!buyer) return fail(res, '用户不存在');
  if (buyer.balance < order.price) return fail(res, '余额不足');

  buyer.balance -= order.price;
  await buyer.save();
  await Transaction.create({
    userId: req.userId,
    type: 'pay',
    amount: -order.price,
    balanceAfter: buyer.balance,
    orderId: order._id,
    description: `支付订单 #${order._id.toString().slice(-6)}`,
  });

  order.status = 'accepted';
  order.paidAt = new Date();
  order.payMethod = 'balance';
  await order.save();

  success(res, { order, balance: buyer.balance });
});

export default router;
