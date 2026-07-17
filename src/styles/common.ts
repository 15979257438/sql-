export const colors = {
  // 主色调渐变
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#e8f4ff',
  gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientPrimaryHover: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',

  // 基础色
  background: '#f5f7fa',
  card: '#ffffff',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textHint: '#999999',
  border: '#eeeeee',

  // 功能色 - 更鲜艳
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // 旧版兼容
  successOld: '#52c41a',
  successLightOld: '#f6ffed',
  warningOld: '#faad14',
  warningLightOld: '#fffbe6',
  dangerOld: '#ff4d4f',
  dangerLightOld: '#fff2f0',
};

export const spacing = {
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '18px',
  xl: '22px',
  xxl: '28px',
  xxxl: '36px',
};

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  full: '9999px',
};

export const fontSize = {
  xs: '22rpx',
  sm: '24rpx',
  base: '28rpx',
  md: '30rpx',
  lg: '32rpx',
  xl: '36rpx',
  xxl: '40rpx',
  xxxl: '48rpx',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(102, 126, 234, 0.1)',
  lg: '0 10px 15px rgba(102, 126, 234, 0.15)',
  xl: '0 20px 25px rgba(102, 126, 234, 0.2)',
};

export const durations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

export const easings = {
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export const commonStyles = {
  page: {
    minHeight: '100vh',
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  cardShadow: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    boxShadow: shadows.md,
  },
  cardHover: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    boxShadow: shadows.md,
    transition: `all ${durations.normal} ${easings.easeOut}`,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  sectionSubTitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  primaryButton: {
    background: colors.gradientPrimary,
    color: '#ffffff',
    borderRadius: radius.lg,
    border: 'none',
    fontWeight: 600,
    transition: `all ${durations.fast} ${easings.easeOut}`,
  },
  primaryButtonHover: {
    background: colors.gradientPrimaryHover,
    transform: 'scale(1.02)',
    boxShadow: shadows.lg,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    transition: `all ${durations.fast} ${easings.easeOut}`,
  },
  dangerButton: {
    backgroundColor: colors.card,
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
    borderRadius: radius.lg,
  },
  successButton: {
    backgroundColor: colors.success,
    color: '#ffffff',
    borderRadius: radius.lg,
    border: 'none',
    fontWeight: 600,
  },
  tag: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    paddingTop: '4rpx',
    paddingBottom: '4rpx',
    borderRadius: radius.full,
    fontSize: fontSize.xs,
  },
  tagPrimary: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
  },
  tagSuccess: {
    backgroundColor: colors.successLight,
    color: colors.success,
  },
  tagWarning: {
    backgroundColor: colors.warningLight,
    color: colors.warning,
  },
  tagDanger: {
    backgroundColor: colors.dangerLight,
    color: colors.danger,
  },
  tagDefault: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  price: {
    fontSize: fontSize.xxl,
    fontWeight: 700,
    background: colors.gradientPrimary,
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    backgroundClip: 'text',
  },
  priceSmall: {
    fontSize: fontSize.lg,
    fontWeight: 700,
    color: colors.primary,
  },
  textEllipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  textEllipsis2: {
    display: '-webkit-box' as const,
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  flexBetween: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  flexCenter: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  flexRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  flexColumn: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
  },
  safeBottom: {
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
  },
  input: {
    width: '100%',
    height: '88rpx',
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    fontSize: fontSize.base,
    transition: `all ${durations.fast} ${easings.easeOut}`,
  },
  inputFocus: {
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${colors.primaryLight}`,
  },
  textarea: {
    width: '100%',
    minHeight: '192rpx',
    padding: spacing.md,
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    fontSize: fontSize.base,
    transition: `all ${durations.fast} ${easings.easeOut}`,
  },
  glassEffect: {
    backdropFilter: 'blur(10px)',
    webkitBackdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  animateScaleOnHover: {
    transition: `transform ${durations.fast} ${easings.easeOut}`,
  },
};

// 动画样式生成器
export const animations = {
  fadeIn: {
    animation: `fadeIn ${durations.normal} ${easings.easeOut}`,
  },
  slideInUp: {
    animation: `slideInUp ${durations.normal} ${easings.easeOut}`,
  },
  slideInDown: {
    animation: `slideInDown ${durations.normal} ${easings.easeOut}`,
  },
  scaleInBounce: {
    animation: `scaleInBounce ${durations.slow} ${easings.easeBounce}`,
  },
  heartbeat: {
    animation: 'heartbeat 0.6s ease-in-out',
  },
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  spin: {
    animation: 'spin 1s linear infinite',
  },
  shake: {
    animation: 'shake 0.5s ease-in-out',
  },
};

export function getStatusStyle(status: string) {
  switch (status) {
    case 'published':
    case 'accepted':
      return { bg: colors.primaryLight, color: colors.primary };
    case 'sold':
    case 'completed':
      return { bg: colors.successLight, color: colors.success };
    case 'offline':
    case 'cancelled':
      return { bg: colors.dangerLight, color: colors.danger };
    case 'shipped':
      return { bg: colors.warningLight, color: colors.warning };
    case 'pending':
    default:
      return { bg: colors.background, color: colors.textSecondary };
  }
}