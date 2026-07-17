import { memo, useState, useEffect, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getUserById } from '@/services/mockData';
import { uploadService } from '@/services/uploadService';
import { storage } from '@/services/storage';
import { formatPrice, formatTime } from '@/utils/format';
import { colors, fontSize, spacing, radius, commonStyles, shadows, durations, easings } from '@/styles/common';
import { CONDITION_MAP } from '@/constants/conditions';
import { TRADE_METHOD_MAP } from '@/constants/tradeMethods';
import LazyImage from './LazyImage';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

/**
 * 商品卡片组件
 * - 使用 React.memo 优化，避免不必要的重新渲染
 * - 使用 LazyImage 实现图片懒加载
 */
function ProductCardComponent({ product }: ProductCardProps) {
  const seller = getUserById(product.sellerId);
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);
  const [isFav, setIsFav] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartbeat, setIsHeartbeat] = useState(false);

  useEffect(() => {
    if (!user) return;
    const favs = storage.get<Record<string, string[]>>('favorites') || {};
    const userFavs: string[] = favs[user.id] || [];
    setIsFav(userFavs.includes(product.id));
  }, [user, product.id]);

  const goProduct = useCallback(() => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${product.id}` });
  }, [product.id]);

  const toggleFav = useCallback((e: any) => {
    e.stopPropagation();
    if (!user) return;

    // 触发心跳动画
    setIsHeartbeat(true);
    setTimeout(() => setIsHeartbeat(false), 600);

    const favs = storage.get<Record<string, string[]>>('favorites') || {};
    const userFavs: string[] = favs[user.id] || [];
    if (isFav) {
      favs[user.id] = userFavs.filter((id: string) => id !== product.id);
      setIsFav(false);
    } else {
      favs[user.id] = [...userFavs, product.id];
      setIsFav(true);
      showToast('已收藏', 'success');
    }
    storage.set('favorites', favs);
  }, [user, product.id, isFav, showToast]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const getImageUrl = useCallback((imageId: string) => {
    if (!imageId) return '';
    if (imageId.startsWith('data:') || imageId.startsWith('http')) return imageId;
    return uploadService.getUrl(imageId);
  }, []);

  return (
    <View
      onClick={goProduct}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hover-scale"
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        overflow: 'hidden',
        marginBottom: spacing.md,
        boxShadow: isHovered ? shadows.lg : '0 2px 8px rgba(0,0,0,0.04)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: `all ${durations.normal} ${easings.easeOut}`,
      }}
    >
      <View style={{ position: 'relative', backgroundColor: colors.background }}>
        <View style={{ width: '100%', aspectRatio: '1' }}>
          <LazyImage
            src={getImageUrl(product.images[0])}
            mode="aspectFill"
            errorText=""
          />
        </View>
        <View
          onClick={toggleFav}
          className={isHeartbeat ? 'animate-heartbeat' : ''}
          style={{
            position: 'absolute',
            top: '16rpx',
            right: '16rpx',
            width: '56rpx',
            height: '56rpx',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.35)',
            ...commonStyles.flexCenter,
            transition: `transform ${durations.fast} ${easings.easeOut}`,
          }}
        >
          <Text style={{ fontSize: '28rpx' }}>{isFav ? '❤️' : '🤍'}</Text>
        </View>
      </View>

      <View style={{ padding: spacing.md }}>
        <Text
          style={{
            fontSize: fontSize.base,
            fontWeight: 500,
            color: colors.textPrimary,
            lineHeight: '40rpx',
            ...commonStyles.textEllipsis2,
            minHeight: '80rpx',
          }}
        >
          {product.title}
        </Text>

        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8rpx', marginTop: '12rpx' }}>
          <Text style={{ ...commonStyles.tag, ...commonStyles.tagPrimary }}>
            {CONDITION_MAP[product.condition]}
          </Text>
          <Text style={{ ...commonStyles.tag, ...commonStyles.tagDefault }}>
            {TRADE_METHOD_MAP[product.tradeMethod]}
          </Text>
        </View>

        <View style={{ ...commonStyles.flexBetween, marginTop: '16rpx' }}>
          <Text style={commonStyles.price}>
            ¥{formatPrice(product.price)}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textHint }}>
            {formatTime(product.createdAt)}
          </Text>
        </View>

        <View style={{ ...commonStyles.flexRow, gap: '12rpx', marginTop: '12rpx' }}>
          <View
            style={{
              width: '36rpx',
              height: '36rpx',
              borderRadius: '50%',
              backgroundColor: colors.primaryLight,
              ...commonStyles.flexCenter,
            }}
          >
            <Text style={{ fontSize: '20rpx', color: colors.primary, fontWeight: 700 }}>
              {seller?.nickname?.[0] || '?'}
            </Text>
          </View>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, ...commonStyles.textEllipsis, flex: 1 }}>
            {seller?.nickname || '未知'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// 使用 React.memo 优化，仅在 product 属性变化时重新渲染
const ProductCard = memo(ProductCardComponent);

export default ProductCard;