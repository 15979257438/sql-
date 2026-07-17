import { Router } from 'express';
import { User, Transaction } from '../models';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取钱包余额与最近流水
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) return fail(res, '用户不存在', 404, 404);
  const transactions = await Transaction.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(50);
  success(res, { balance: user.balance, transactions });
});

// 充值（演示用，真实环境应接入微信支付）
router.post('/recharge', authMiddleware, async (req: AuthRequest, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return fail(res, '充值金额无效');

  const user = await User.findById(req.userId);
  if (!user) return fail(res, '用户不存在', 404, 404);

  user.balance += amount;
  await user.save();
  await Transaction.create({
    userId: req.userId,
    type: 'recharge',
    amount,
    balanceAfter: user.balance,
    description: '余额充值',
  });

  success(res, { balance: user.balance });
});

// 账单明细
router.get('/transactions', authMiddleware, async (req: AuthRequest, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const [transactions, total] = await Promise.all([
    Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize)),
    Transaction.countDocuments({ userId: req.userId }),
  ]);
  success(res, { list: transactions, total, page: Number(page), pageSize: Number(pageSize) });
});

export default router;
