import { CONFIG } from '@/constants/config';

export function validateTitle(title: string): string | null {
  if (!title.trim()) return '请输入标题';
  if (title.length > CONFIG.MAX_TITLE_LENGTH) return `标题最多${CONFIG.MAX_TITLE_LENGTH}字`;
  return null;
}

export function validateDescription(desc: string): string | null {
  if (!desc.trim()) return '请输入描述';
  if (desc.length > CONFIG.MAX_DESC_LENGTH) return `描述最多${CONFIG.MAX_DESC_LENGTH}字`;
  return null;
}

export function validatePrice(price: number): string | null {
  if (isNaN(price) || price < CONFIG.MIN_PRICE) return '请输入有效价格';
  if (price > CONFIG.MAX_PRICE) return '价格超出上限';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!/^1[3-9]\d{9}$/.test(phone)) return '请输入正确的手机号';
  return null;
}
