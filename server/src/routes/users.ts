import { Router } from 'express';
import { User } from '../models';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取当前用户信息
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) return fail(res, '用户不存在', 404, 404);
  success(res, {
    id: user._id,
    openid: user.openid,
    nickname: user.nickname,
    avatar: user.avatar,
    phone: user.phone,
    school: user.school,
    department: user.department,
    bio: user.bio,
    verified: user.verified,
    rating: user.rating,
    balance: user.balance,
  });
});

// 更新用户信息
router.put('/me', authMiddleware, async (req: AuthRequest, res) => {
  const { nickname, avatar, school, department, bio, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { nickname, avatar, school, department, bio, phone },
    { new: true }
  );
  if (!user) return fail(res, '用户不存在', 404, 404);
  success(res, {
    id: user._id,
    nickname: user.nickname,
    avatar: user.avatar,
    phone: user.phone,
    school: user.school,
    department: user.department,
    bio: user.bio,
    balance: user.balance,
  });
});

// 根据 ID 获取用户公开信息
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return fail(res, '用户不存在', 404, 404);
  success(res, {
    id: user._id,
    nickname: user.nickname,
    avatar: user.avatar,
    school: user.school,
    department: user.department,
    bio: user.bio,
    rating: user.rating,
    soldCount: user.soldCount,
  });
});

export default router;
