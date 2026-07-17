import type { TargetType } from '@/types';

export interface ReportReason {
  value: string;
  label: string;
}

export const PRODUCT_REPORT_REASONS: ReportReason[] = [
  { value: 'false_info', label: '虚假信息' },
  { value: 'prohibited', label: '违禁品' },
  { value: 'fraud', label: '诈骗' },
  { value: 'infringement', label: '侵权' },
  { value: 'other', label: '其他' },
];

export const USER_REPORT_REASONS: ReportReason[] = [
  { value: 'harassment', label: '辱骂骚扰' },
  { value: 'fraud', label: '诈骗' },
  { value: 'spam', label: '广告垃圾' },
  { value: 'other', label: '其他' },
];

export const MESSAGE_REPORT_REASONS: ReportReason[] = [
  { value: 'harassment', label: '辱骂骚扰' },
  { value: 'fraud', label: '诈骗' },
  { value: 'spam', label: '广告垃圾' },
  { value: 'other', label: '其他' },
];

export const REPORT_REASONS_MAP: Record<TargetType, ReportReason[]> = {
  product: PRODUCT_REPORT_REASONS,
  user: USER_REPORT_REASONS,
  message: MESSAGE_REPORT_REASONS,
};
