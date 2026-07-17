import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { useUIStore, ToastMessage } from '@/stores/uiStore';

// Toast 图标组件
function ToastIcon({ type }: { type: ToastMessage['type'] }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'ℹ';
    }
  };

  const getBgGradient = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
  };

  return (
    <View
      style={{
        width: '48rpx',
        height: '48rpx',
        borderRadius: '50%',
        background: getBgGradient(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'scaleInBounce 0.4s ease-out',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Text style={{ color: '#ffffff', fontSize: '28rpx', fontWeight: 600 }}>
        {getIcon()}
      </Text>
    </View>
  );
}

// 单个 Toast 组件
function Toast({ toast }: { toast: ToastMessage }) {
  const [visible, setVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    // 延迟显示，触发滑入动画
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const duration = toast.duration || 2500;
    const timer = setTimeout(() => {
      setRemoving(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const getBgGradient = () => {
    switch (toast.type) {
      case 'success':
        return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
      case 'error':
        return 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
      default:
        return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return '#065f46';
      case 'error':
        return '#991b1b';
      case 'warning':
        return '#92400e';
      default:
        return '#1e40af';
    }
  };

  return (
    <View
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '640rpx',
        marginBottom: '24rpx',
        transform: removing ? 'translateY(-20px)' : visible ? 'translateY(0)' : 'translateY(-20px)',
        opacity: removing ? 0 : visible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <View
        style={{
          background: getBgGradient(),
          borderRadius: '16rpx',
          padding: '24rpx 32rpx',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '24rpx',
        }}
      >
        <ToastIcon type={toast.type} />
        <Text
          style={{
            flex: 1,
            fontSize: '28rpx',
            lineHeight: '40rpx',
            color: getTextColor(),
            fontWeight: 500,
          }}
        >
          {toast.message}
        </Text>
      </View>
    </View>
  );
}

// Toast 容器组件
export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <View
      style={{
        position: 'fixed',
        top: '80rpx',
        left: '32rpx',
        right: '32rpx',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

// 保留原有的 Skeleton 和 EmptyState 组件
interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

/** Shared skeleton loader */
export function Skeleton({ className = '', variant = 'rect', width, height, style }: SkeletonProps) {
  const borderRadius = variant === 'circle' ? '50%' : variant === 'text' ? '4px' : '8px';
  return (
    <View
      className={`skeleton-pulse ${className}`}
      style={{
        display: 'block',
        borderRadius,
        width,
        height,
        ...style,
      }}
    />
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Shared empty state placeholder */
export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <View
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '64px',
        paddingBottom: '64px',
        color: '#999999',
      }}
    >
      {icon ? (
        <View style={{ marginBottom: '24rpx', opacity: 0.4 }}>{icon}</View>
      ) : (
        <Text
          style={{
            fontSize: '96rpx',
            lineHeight: '96rpx',
            marginBottom: '24rpx',
            opacity: 0.3,
          }}
        >
          ○
        </Text>
      )}
      <Text style={{ fontSize: '28rpx' }}>{title}</Text>
      {description && (
        <Text
          style={{
            fontSize: '24rpx',
            marginTop: '8rpx',
            textAlign: 'center',
            paddingLeft: '64rpx',
            paddingRight: '64rpx',
          }}
        >
          {description}
        </Text>
      )}
      {action && <View style={{ marginTop: '32rpx' }}>{action}</View>}
    </View>
  );
}