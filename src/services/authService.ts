import Taro from '@tarojs/taro';
import { api, getToken, setToken, removeToken, getAssetUrl, isMockToken } from './api';
import { storage } from './storage';
import type { User } from '@/types';

function mapUser(data: any): User {
  return {
    id: data.id || data._id,
    openid: data.openid,
    phone: data.phone,
    nickname: data.nickname,
    avatar: data.avatar || '',
    school: data.school || '',
    department: data.department || '',
    bio: data.bio || '',
    verified: data.verified || false,
    rating: data.rating ?? 5,
    balance: data.balance ?? 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export const authService = {
  // 微信一键登录
  async loginWithWechat(): Promise<User> {
    const { code } = await Taro.login();

    // 获取用户头像昵称（需要用户点击按钮触发）
    let profile: { nickname?: string; avatar?: string } = {};
    try {
      const res = await Taro.getUserProfile({ desc: '用于完善用户资料' });
      profile = {
        nickname: res.userInfo.nickName,
        avatar: res.userInfo.avatarUrl,
      };
    } catch {
      // 用户拒绝授权，后端会使用默认昵称
    }

    const data = await api.post<{ token: string; user: any }>('/auth/wechat', {
      code,
      nickname: profile.nickname,
      avatar: profile.avatar,
    });

    setToken(data.token);
    const user = mapUser(data.user);
    storage.set('currentUser', user);
    return user;
  },

  // 获取微信手机号（需接入真实解密，当前为占位）
  async getPhoneNumber(): Promise<string> {
    throw new Error('手机号授权需后端接入微信解密接口');
  },

  // 保留测试账号登录用于开发调试
  async login(phone: string, password: string): Promise<User> {
    if (['1', '2', '3'].includes(phone) && password === '123456') {
      const testUsers: Record<string, Partial<User>> = {
        '1': { nickname: '小明', school: '清华大学', department: '计算机科学与技术系', bio: '热爱编程，喜欢数码产品', verified: true, rating: 4.8 },
        '2': { nickname: '小红', school: '清华大学', department: '经济管理学院', bio: '美妆爱好者，闲置衣物的搬运工', verified: true, rating: 4.5 },
        '3': { nickname: '小刚', school: '清华大学', department: '机械工程系', bio: '运动达人，数码控', verified: false, rating: 4.2 },
      };
      const user: User = {
        id: `u${phone}`,
        phone,
        nickname: testUsers[phone]?.nickname || `用户${phone}`,
        avatar: '',
        school: testUsers[phone]?.school || '',
        department: testUsers[phone]?.department || '',
        bio: testUsers[phone]?.bio || '',
        verified: testUsers[phone]?.verified || false,
        rating: testUsers[phone]?.rating || 5,
        balance: 100000, // 开发期赠送 1000 元余额
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setToken(`mock_${phone}`);
      storage.set('currentUser', user);
      return user;
    }
    throw new Error('账号或密码错误');
  },

  async sendSmsCode(_phone: string): Promise<void> {
    // 演示期直接成功，真实环境对接短信服务
  },

  async loginWithSms(phone: string, code: string): Promise<User> {
    if (code !== '123456') throw new Error('验证码错误');
    return this.login(phone, '123456');
  },

  async logout(): Promise<void> {
    removeToken();
    storage.remove('currentUser');
  },

  async getProfile(): Promise<User | null> {
    const local = storage.get<User>('currentUser');
    if (!local) return null;
    // 测试账号使用本地数据，避免向后端发送无效 token
    if (isMockToken()) return local;
    // 兼容旧版本：测试账号未写入 token 时直接走本地
    if (!getToken() && ['u1', 'u2', 'u3'].includes(local.id)) return local;
    try {
      const remote = await api.get<any>('/users/me');
      const user = mapUser(remote);
      storage.set('currentUser', user);
      return user;
    } catch {
      return local;
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const local = storage.get<User>('currentUser');
    // 测试账号仅更新本地数据
    if (isMockToken() && local) {
      const user = { ...local, ...data, updatedAt: new Date().toISOString() };
      storage.set('currentUser', user);
      return user;
    }
    const remote = await api.put<any>('/users/me', data);
    const user = mapUser(remote);
    storage.set('currentUser', user);
    return user;
  },

  async uploadAvatar(): Promise<string> {
    const res = await Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    });
    const tempFilePath = res.tempFiles[0]?.tempFilePath;
    if (!tempFilePath) throw new Error('未选择图片');

    const base64 = await new Promise<string>((resolve, reject) => {
      Taro.getFileSystemManager().readFile({
        filePath: tempFilePath,
        encoding: 'base64',
        success: (readRes: any) => resolve(`data:image/jpeg;base64,${readRes.data}`),
        fail: (err: any) => reject(new Error(err.errMsg || '读取图片失败')),
      });
    });
    const { url } = await api.upload(base64);
    return getAssetUrl(url);
  },

  isAuthenticated(): boolean {
    return !!storage.get<User>('currentUser');
  },
};
