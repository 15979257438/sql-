import { Router } from 'express';
import axios from 'axios';
import { User } from '../models';
import { success, fail } from '../utils/response';
import { signToken } from '../middleware/auth';

const router = Router();

const WECHAT_APPID = process.env.WECHAT_APPID || '';
const WECHAT_SECRET = process.env.WECHAT_SECRET || '';

// 微信小程序登录
router.post('/wechat', async (req, res) => {
  const { code, nickname, avatar } = req.body;
  if (!code) {
    return fail(res, '缺少微信登录凭证');
  }

  let openid = '';
  let sessionKey = '';

  // 有配置才调用微信接口，否则使用开发模式（code 即 openid）
  if (WECHAT_APPID && WECHAT_SECRET) {
    try {
      const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: WECHAT_APPID,
          secret: WECHAT_SECRET,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });
      if (data.errcode) {
        return fail(res, `微信登录失败：${data.errmsg}`);
      }
      openid = data.openid;
      sessionKey = data.session_key;
    } catch (err) {
      return fail(res, '微信接口调用失败');
    }
  } else {
    // 开发模式：直接用 code 作为 openid，便于无配置时测试
    openid = `dev_${code}`;
    sessionKey = '';
  }

  if (!openid) {
    return fail(res, '无法获取用户openid');
  }

  let user = await User.findOne({ openid });
  if (!user) {
    user = await User.create({
      openid,
      nickname: nickname || `微信用户${openid.slice(-6)}`,
      avatar: avatar || '',
      balance: 0,
    });
  } else {
    // 更新昵称和头像（如果用户重新授权）
    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    await user.save();
  }

  const token = signToken(user._id.toString());
  success(res, {
    token,
    user: {
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
    },
  });
});

// 更新手机号（演示期可直接更新，真实环境需解密微信加密数据）
router.put('/phone', async (req, res) => {
  // TODO: 接入微信加密数据解密
  return fail(res, '请接入微信手机号解密');
});

export default router;
