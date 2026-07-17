import type { TradeMethod } from '@/types';

export const TRADE_METHODS: { value: TradeMethod; label: string }[] = [
  { value: 'pickup', label: '仅自提' },
  { value: 'delivery', label: '仅快递' },
  { value: 'both', label: '均可' },
];

export const TRADE_METHOD_MAP: Record<TradeMethod, string> = {
  pickup: '仅自提',
  delivery: '仅快递',
  both: '均可',
};
