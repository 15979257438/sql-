import type { Condition } from '@/types';

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'new', label: '全新' },
  { value: 'like_new', label: '几乎全新' },
  { value: 'used', label: '有使用痕迹' },
];

export const CONDITION_MAP: Record<Condition, string> = {
  new: '全新',
  like_new: '几乎全新',
  used: '有使用痕迹',
};
