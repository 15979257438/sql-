import { Router } from 'express';
import { Bargain, Order, Product, User } from '../models';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 发起砍价
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { productId, targetPrice, message } = req.body;
  const product = await Product.findById(productId);
  if (!product) return fail(res, '商品不存在');
  if (product.sellerId.toString() === req.userId) return fail(res, '不能砍价自己的商品');
  if (targetPrice >= product.price) return fail(res, '砍价目标需低于当前价格');

  const existing = await Bargain.findOne({
    productId,
    buyerId: req.userId,
    sellerId: product.sellerId,
    status: 'pending',
  });
  if (existing) return fail(res, '已存在进行中的砍价，请先处理');

  const bargain = await Bargain.create({
    productId,
    buyerId: req.userId,
    sellerId: product.sellerId,
    originalPrice: product.price,
    currentPrice: targetPrice,
    targetPrice,
    offers: [{ userId: req.userId, price: targetPrice, message, createdAt: new Date() }],
  });

  await bargain.populate('productId', 'title images price');
  await bargain.populate('buyerId', 'nickname avatar');
  await bargain.populate('sellerId', 'nickname avatar');
  success(res, bargain);
});

// 我的砍价列表
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { role } = req.query; // 'buyer' | 'seller'
  const filter: any = {};
  if (role === 'buyer') filter.buyerId = req.userId;
  if (role === 'seller') filter.sellerId = req.userId;
  if (!role) filter.$or = [{ buyerId: req.userId }, { sellerId: req.userId }];

  const bargains = await Bargain.find(filter)
    .sort({ updatedAt: -1 })
    .populate('productId', 'title images price')
    .populate('buyerId', 'nickname avatar')
    .populate('sellerId', 'nickname avatar');
  success(res, bargains);
});

// 砍价详情
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const bargain = await Bargain.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
  })
    .populate('productId', 'title images price')
    .populate('buyerId', 'nickname avatar')
    .populate('sellerId', 'nickname avatar');
  if (!bargain) return fail(res, '砍价不存在', 404, 404);
  success(res, bargain);
});

// 出价/还价（买家可继续压价，卖家可还价）
router.post('/:id/offer', authMiddleware, async (req: AuthRequest, res) => {
  const { price, message } = req.body;
  if (!price || price <= 0) return fail(res, '请输入有效价格');

  const bargain = await Bargain.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
    status: 'pending',
  });
  if (!bargain) return fail(res, '砍价不存在或已结束');

  // 不能给自己的最近出价再出价（需对方先回应）
  const lastOffer = bargain.offers[bargain.offers.length - 1];
  if (lastOffer && lastOffer.userId.toString() === req.userId) {
    return fail(res, '请等待对方回应');
  }

  bargain.offers.push({
    userId: new (require('mongoose').Types.ObjectId)(req.userId),
    price,
    message,
    createdAt: new Date(),
  });
  bargain.currentPrice = price;
  await bargain.save();

  await bargain.populate('productId', 'title images price');
  await bargain.populate('buyerId', 'nickname avatar');
  await bargain.populate('sellerId', 'nickname avatar');
  success(res, bargain);
});

// 接受砍价（买家和卖家均可）
// - 卖家接受：接受买家最近出价，生成待支付订单
// - 买家接受：接受卖家最近还价，生成待支付订单
router.post('/:id/accept', authMiddleware, async (req: AuthRequest, res) => {
  const bargain = await Bargain.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
    status: 'pending',
  });
  if (!bargain) return fail(res, '砍价不存在或已结束');

  // 必须存在对方的有效出价才能接受
  const lastOffer = bargain.offers[bargain.offers.length - 1];
  if (!lastOffer) return fail(res, '暂无出价可接受');
  if (lastOffer.userId.toString() === req.userId) {
    return fail(res, '不能接受自己的出价，请等待对方回应');
  }

  bargain.status = 'accepted';
  await bargain.save();

  // 以最后出价生成待支付订单
  const order = await Order.create({
    productId: bargain.productId,
    buyerId: bargain.buyerId,
    sellerId: bargain.sellerId,
    price: bargain.currentPrice,
    status: 'pending',
  });

  await bargain.populate('productId', 'title images price');
  await bargain.populate('buyerId', 'nickname avatar');
  await bargain.populate('sellerId', 'nickname avatar');

  success(res, { bargain, orderId: order._id });
});

// 拒绝砍价（买家和卖家均可）
router.post('/:id/reject', authMiddleware, async (req: AuthRequest, res) => {
  const bargain = await Bargain.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
    status: 'pending',
  });
  if (!bargain) return fail(res, '砍价不存在或已结束');

  bargain.status = 'rejected';
  await bargain.save();

  await bargain.populate('productId', 'title images price');
  await bargain.populate('buyerId', 'nickname avatar');
  await bargain.populate('sellerId', 'nickname avatar');

  success(res, bargain);
});

export default router;
