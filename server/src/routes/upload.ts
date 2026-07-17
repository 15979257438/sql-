import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 简单图片上传：base64 保存为本地文件
router.post('/image', authMiddleware, async (req: AuthRequest, res) => {
  const { image } = req.body;
  if (!image || typeof image !== 'string') return fail(res, '缺少图片数据');

  const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return fail(res, '图片格式不正确');

  const ext = matches[1];
  const base64 = matches[2];
  const buffer = Buffer.from(base64, 'base64');

  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);

  const url = `/uploads/${filename}`;
  success(res, { url, filename });
});

export default router;
