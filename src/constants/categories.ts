import type { Category } from '@/types';

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'textbook', label: '教材教辅', icon: 'book' },
  { value: 'digital', label: '数码电子', icon: 'smartphone' },
  { value: 'clothing', label: '服装鞋包', icon: 'shirt' },
  { value: 'beauty', label: '美妆护肤', icon: 'sparkles' },
  { value: 'home', label: '家居日用', icon: 'home' },
  { value: 'sports', label: '运动户外', icon: 'dumbbell' },
  { value: 'other', label: '其他', icon: 'more-horizontal' },
];

export const CATEGORY_MAP: Record<Category, string> = {
  textbook: '教材教辅',
  digital: '数码电子',
  clothing: '服装鞋包',
  beauty: '美妆护肤',
  home: '家居日用',
  sports: '运动户外',
  other: '其他',
};
