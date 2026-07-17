import Taro from '@tarojs/taro';
import { CONFIG } from '@/constants/config';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const TOKEN_KEY = `${CONFIG.STORAGE_PREFIX}token`;

export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null;
}

export function setToken(token: string) {
  Taro.setStorageSync(TOKEN_KEY, token);
}

export function removeToken() {
  Taro.removeStorageSync(TOKEN_KEY);
}

export function isMockToken(token: string | null = getToken()): boolean {
  return !!token && token.startsWith('mock_');
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: Record<string, any>,
  options?: { headers?: Record<string, string>; noAuth?: boolean }
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };
  if (token && !options?.noAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${CONFIG.API_BASE_URL}${path}`;

  try {
    const res = await Taro.request({
      url,
      method,
      data: body,
      header: headers,
      timeout: 15000,
    });

    const data = res.data as ApiResponse<T>;
    if (data.code !== 0) {
      if (data.code === 401) {
        removeToken();
      }
      throw new Error(data.message || '请求失败');
    }
    return data.data;
  } catch (err: any) {
    const errMsg = err?.errMsg || err?.message || '';
    if (errMsg.includes('timeout')) {
      throw new Error('请求超时，请检查网络');
    }
    if (errMsg.includes('ECONNREFUSED') || errMsg.includes('CONNECTION_REFUSED') || errMsg.includes('CONNECTION_RESET') || errMsg.includes('request:fail')) {
      throw new Error('服务器连接失败，请检查后端服务是否启动');
    }
    throw new Error(err.message || '网络错误');
  }
}

export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const base = CONFIG.API_BASE_URL.replace(/\/api$/, '');
  return `${base}${path}`;
}

export const api = {
  get: <T>(path: string, params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()}` : '';
    return request<T>('GET', `${path}${query}`);
  },
  post: <T>(path: string, body?: Record<string, any>) => request<T>('POST', path, body),
  put: <T>(path: string, body?: Record<string, any>) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: async (image: string) => {
    const token = getToken();
    const res = await Taro.request({
      url: `${CONFIG.API_BASE_URL}/upload/image`,
      method: 'POST',
      data: { image },
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 30000,
    });
    const data = res.data as ApiResponse<{ url: string; filename: string }>;
    if (data.code !== 0) throw new Error(data.message || '上传失败');
    return data.data;
  },
};
