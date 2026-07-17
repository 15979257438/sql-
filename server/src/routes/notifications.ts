import { Router } from 'express';
import { Notification } from '../models';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 通知列表
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const notifications = await Notification.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(100);
  success(res, notifications);
});

// 未读数
router.get('/unread-count', authMiddleware, async (req: AuthRequest, res) => {
  const count = await Notification.countDocuments({ userId: req.userId, read: false });
  success(res, { count });
});

// 标记已读
router.post('/:id/read', authMiddleware, async (req: AuthRequest, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { read: true });
  success(res, null);
});

// 全部已读
router.post('/read-all', authMiddleware, async (req: AuthRequest, res) => {
  await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
  success(res, null);
});

export default router;
