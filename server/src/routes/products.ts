import { Router } from 'express';
import { Product } from '../models';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 商品列表（支持筛选、搜索、排序）
router.get('/', async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    condition,
    tradeMethod,
    sellerId,
    status = 'published',
    sort = 'newest',
    page = 1,
    pageSize = 10,
  } = req.query;

  const filter: any = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  if (tradeMethod) filter.tradeMethod = tradeMethod;
  if (sellerId) filter.sellerId = sellerId;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword as string, $options: 'i' } },
      { description: { $regex: keyword as string, $options: 'i' } },
    ];
  }

  let sortOption: any = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };

  const skip = (Number(page) - 1) * Number(pageSize);
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(Number(pageSize)).populate('sellerId', 'nickname avatar school rating'),
    Product.countDocuments(filter),
  ]);

  success(res, {
    list: products,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
    hasMore: skip + products.length < total,
  });
});

// 商品详情
router.get('/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
    .populate('sellerId', 'nickname avatar school department rating soldCount');
  if (!product) return fail(res, '商品不存在', 404, 404);
  success(res, product);
});

// 发布商品
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const product = await Product.create({ ...req.body, sellerId: req.userId });
  success(res, product);
});

// 更新商品
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, sellerId: req.userId },
    req.body,
    { new: true }
  );
  if (!product) return fail(res, '商品不存在或无权限', 403, 403);
  success(res, product);
});

// 删除商品
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.userId });
  if (!product) return fail(res, '商品不存在或无权限', 403, 403);
  success(res, null);
});

export default router;
