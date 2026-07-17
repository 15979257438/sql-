import { Router } from 'express';
import { success, fail } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 微信支付统一下单（脚手架，需配置商户号后启用）
router.post('/unified-order', authMiddleware, async (req: AuthRequest, res) => {
  const { orderId } = req.body;
  const mchId = process.env.WECHAT_MCH_ID;
  if (!mchId) {
    return fail(res, '微信支付商户号未配置');
  }
  // TODO: 接入微信支付 APIv3 统一下单
  return fail(res, '微信支付尚未完成接入，请先使用余额支付');
});

// 微信支付回调
router.post('/notify', async (req, res) => {
  // TODO: 验证签名、更新订单状态
  res.set('Content-Type', 'application/xml');
  res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code></return_code></xml>');
});

export default router;
