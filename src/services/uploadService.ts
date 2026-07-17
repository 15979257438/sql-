import Taro from '@tarojs/taro';
import { storage, delay } from './storage';
import { generateId } from '@/utils/id';

const USE_MOCK = true;
const API_BASE = '';

async function mockUpload(tempFilePath: string): Promise<string> {
  await delay(300);
  return new Promise((resolve, reject) => {
    Taro.getFileSystemManager().readFile({
      filePath: tempFilePath,
      encoding: 'base64',
      success: (res) => {
        const id = generateId();
        const images = storage.get<Record<string, string>>('uploadedImages') || {};
        images[id] = `data:image/jpeg;base64,${res.data}`;
        storage.set('uploadedImages', images);
        resolve(id);
      },
      fail: (err) => reject(new Error(err.errMsg || '读取图片失败')),
    });
  });
}

async function realUpload(tempFilePath: string): Promise<string> {
  const uploadRes = await Taro.uploadFile({
    url: `${API_BASE}/upload`,
    filePath: tempFilePath,
    name: 'file',
  });
  const data = JSON.parse(uploadRes.data);
  return data.url || data.id;
}

export const uploadService = {
  async upload(tempFilePath: string): Promise<string> {
    if (USE_MOCK) {
      return mockUpload(tempFilePath);
    }
    return realUpload(tempFilePath);
  },

  getUrl(id: string): string {
    if (!id) return '';
    if (id.startsWith('data:') || id.startsWith('http')) return id;
    const images = storage.get<Record<string, string>>('uploadedImages') || {};
    return images[id] || '';
  },

  async chooseAndUpload(maxCount: number = 9): Promise<string[]> {
    const res = await Taro.chooseMedia({
      count: maxCount,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    });
    const paths = res.tempFiles.map(f => f.tempFilePath);
    return Promise.all(paths.map(p => this.upload(p)));
  },

  remove(id: string): void {
    const images = storage.get<Record<string, string>>('uploadedImages') || {};
    delete images[id];
    storage.set('uploadedImages', images);
  },
};
