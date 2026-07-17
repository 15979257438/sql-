import Taro from '@tarojs/taro';

const STORAGE_PREFIX = 'CAMPUS_TRADE_';

export const storage = {
  get<T>(key: string): T | null {
    try {
      return Taro.getStorageSync<T>(STORAGE_PREFIX + key) ?? null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      Taro.setStorageSync(STORAGE_PREFIX + key, value);
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  remove(key: string): void {
    Taro.removeStorageSync(STORAGE_PREFIX + key);
  },

  clear(): void {
    try {
      const { keys } = Taro.getStorageInfoSync();
      keys.filter(k => k.startsWith(STORAGE_PREFIX)).forEach(k => Taro.removeStorageSync(k));
    } catch {
      // ignore
    }
  },
};

/** Simulate network delay */
export function delay(ms: number = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
