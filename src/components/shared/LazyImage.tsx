import { useState, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import type { ImageProps } from '@tarojs/components';
import { colors, commonStyles } from '@/styles/common';

interface LazyImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  src: string;
  placeholder?: string;
  errorPlaceholder?: string;
  showLoadingSpinner?: boolean;
  loadingText?: string;
  errorText?: string;
}

/**
 * 图片懒加载组件
 * - 支持图片懒加载
 * - 显示加载占位图
 * - 图片加载失败显示占位符
 */
function LazyImage({
  src,
  placeholder,
  errorPlaceholder,
  showLoadingSpinner = true,
  loadingText,
  errorText = '加载失败',
  mode = 'aspectFill',
  style,
  className,
  ...props
}: LazyImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  // 如果没有图片源，直接显示占位符
  if (!src) {
    return (
      <View
        className={className}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: colors.background,
          ...commonStyles.flexCenter,
          ...style,
        }}
      >
        <Text style={{ fontSize: '64rpx', color: colors.textHint }}>🖼️</Text>
      </View>
    );
  }

  return (
    <View style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 加载状态占位 */}
      {loading && !error && showLoadingSpinner && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.background,
            ...commonStyles.flexCenter,
            zIndex: 1,
          }}
        >
          {loadingText ? (
            <Text style={{ fontSize: '28rpx', color: colors.textHint }}>{loadingText}</Text>
          ) : (
            <View
              style={{
                width: '40rpx',
                height: '40rpx',
                border: `3rpx solid ${colors.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
              }}
            />
          )}
        </View>
      )}

      {/* 错误状态占位 */}
      {error && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.background,
            ...commonStyles.flexCenter,
            zIndex: 2,
          }}
        >
          {errorPlaceholder ? (
            <Image src={errorPlaceholder} mode="aspectFit" style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ ...commonStyles.flexCenter, flexDirection: 'column' }}>
              <Text style={{ fontSize: '64rpx', color: colors.textHint }}>🖼️</Text>
              <Text style={{ fontSize: '24rpx', color: colors.textHint, marginTop: '8rpx' }}>{errorText}</Text>
            </View>
          )}
        </View>
      )}

      {/* 实际图片 */}
      <Image
        {...props}
        src={src}
        mode={mode}
        lazyLoad
        className={className}
        style={{
          width: '100%',
          height: '100%',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          ...style,
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
}

export default LazyImage;