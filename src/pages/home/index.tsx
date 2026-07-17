import { useState, useEffect, useMemo, useCallback } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Button, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import { useProductStore } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/utils/format';
import { storage } from '@/services/storage';
import { uploadService } from '@/services/uploadService';
import { CATEGORIES } from '@/constants/categories';
import { showConfirm } from '@/utils/taro';
import { EmptyState } from '@/components/shared/Feedback';
import ProductCard from '@/components/shared/ProductCard';
import LazyImage from '@/components/shared/LazyImage';
import { colors, fontSize, spacing, radius, commonStyles, durations, easings } from '@/styles/common';
import type { Product, Category } from '@/types';

const categoryIcons: Record<Category, string> = {
  textbook: '📚',
  digital: '📱',
  clothing: '👕',
  beauty: '💄',
  home: '🏠',
  sports: '⚽',
  other: '📦',
};

export default function HomePage() {
  const { products, loading, hasMore, fetchProducts } = useProductStore();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const cartCount = useCartStore(s => s.count);
  const [categoryCounts, setCategoryCounts] = useState<Record<Category, number>>({} as Record<Category, number>);

  useLoad(() => {
    const all = storage.get<Product[]>('products') || [];
    const counts = {} as Record<Category, number>;
    CATEGORIES.forEach(cat => {
      counts[cat.value] = all.filter(p => p.category === cat.value).length;
    });
    setCategoryCounts(counts);
    fetchProducts(true);
  });

  usePullDownRefresh(() => {
    fetchProducts(true).finally(() => {
      Taro.stopPullDownRefresh();
    });
  });

  const bannerProducts = useMemo(() => products.slice(0, 5), [products]);
  const trendingProducts = useMemo(() => products.slice(0, 10), [products]);
  const activeBanner = useMemo(() => bannerProducts[0], [bannerProducts]);
  const leftColumn = useMemo(() => products.filter((_, i) => i % 2 === 0), [products]);
  const rightColumn = useMemo(() => products.filter((_, i) => i % 2 === 1), [products]);
  const count = useMemo(() => cartCount(), [cartCount]);

  const goSearch = useCallback(() => Taro.navigateTo({ url: '/pages/search/index' }), []);
  const goCategory = useCallback(() => Taro.navigateTo({ url: '/pages/category/index' }), []);
  const goCart = useCallback(() => Taro.switchTab({ url: '/pages/cart/index' }), []);
  const goLogin = useCallback(() => Taro.redirectTo({ url: '/pages/login/index' }), []);
  const goProduct = useCallback((id: string) => Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` }), []);

  const handleLogout = useCallback(async () => {
    const confirmed = await showConfirm('退出登录', '确定退出登录？');
    if (!confirmed) return;
    await logout();
    goLogin();
  }, [logout, goLogin]);

  const handleScrollToLower = useCallback(() => {
    if (!loading && hasMore) fetchProducts();
  }, [loading, hasMore, fetchProducts]);

  const getImageUrl = useCallback((imageId: string) => {
    if (!imageId) return '';
    if (imageId.startsWith('data:') || imageId.startsWith('http')) return imageId;
    return uploadService.getUrl(imageId);
  }, []);

  return (
    <View style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx - env(safe-area-inset-bottom))' }} lowerThreshold={80} onScrollToLower={handleScrollToLower}>
        {bannerProducts.length > 0 && (
          <View style={{ position: 'relative', height: '720rpx', overflow: 'hidden' }}>
            <Swiper autoplay circular interval={4000} style={{ height: '720rpx' }}>
              {bannerProducts.map(product => (
                <SwiperItem key={product.id} onClick={() => goProduct(product.id)}>
                  <View style={{ width: '100%', height: '100%' }}>
                    <LazyImage src={getImageUrl(product.images[0])} mode="aspectFill" showLoadingSpinner={false} />
                  </View>
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.6) 100%)' }} />
                </SwiperItem>
              ))}
            </Swiper>

            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, paddingTop: 'calc(16rpx + env(safe-area-inset-top))', paddingLeft: spacing.lg, paddingRight: spacing.lg, paddingBottom: spacing.md }}>
              <View style={{ ...commonStyles.flexRow, gap: spacing.md }}>
                <Button onClick={goSearch} style={{ flex: 1, height: '76rpx', display: 'flex', alignItems: 'center', paddingLeft: spacing.md, paddingRight: spacing.md, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: radius.xl, textAlign: 'left', border: 'none' }}>
                  <Text style={{ fontSize: fontSize.base, color: colors.textHint }}>🔍 搜索闲置好物...</Text>
                </Button>
                <Button onClick={handleLogout} style={{ height: '76rpx', paddingLeft: spacing.md, paddingRight: spacing.md, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: radius.xl, border: 'none' }}>
                  <Text style={{ fontSize: fontSize.sm, color: '#ffffff' }}>退出</Text>
                </Button>
                <Button onClick={goCart} style={{ position: 'relative', width: '76rpx', height: '76rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: radius.xl, border: 'none' }}>
                  <Text style={{ fontSize: '40rpx' }}>🛒</Text>
                  {count > 0 && (
                    <View style={{ position: 'absolute', top: '-4rpx', right: '-4rpx', minWidth: '32rpx', height: '32rpx', borderRadius: '50%', backgroundColor: colors.primary, ...commonStyles.flexCenter, paddingLeft: '6rpx', paddingRight: '6rpx' }}>
                      <Text style={{ color: '#ffffff', fontSize: '20rpx', fontWeight: 700 }}>{count > 99 ? '99+' : count}</Text>
                    </View>
                  )}
                </Button>
              </View>
            </View>

            {activeBanner && (
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, padding: spacing.lg, paddingBottom: '48rpx' }}>
                <Text style={{ fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)' }}>热门推荐</Text>
                <Text style={{ fontSize: '44rpx', fontWeight: 700, color: '#ffffff', marginTop: '8rpx', lineHeight: '60rpx', ...commonStyles.textEllipsis2 }}>{activeBanner.title}</Text>
                <View style={{ ...commonStyles.flexRow, gap: spacing.sm, marginTop: '12rpx' }}>
                  <Text style={{ fontSize: fontSize.xxl, fontWeight: 700, background: colors.gradientPrimary, '-webkit-background-clip': 'text', '-webkit-text-fill-color': 'transparent' }}>¥{formatPrice(activeBanner.price)}</Text>
                  {activeBanner.originalPrice && activeBanner.originalPrice > activeBanner.price && (
                    <Text style={{ fontSize: fontSize.base, color: 'rgba(255,255,255,0.7)', textDecoration: 'line-through' }}>¥{formatPrice(activeBanner.originalPrice)}</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ padding: spacing.lg }}>
          {trendingProducts.length > 0 && (
            <View style={{ marginBottom: spacing.xl }}>
              <View style={{ ...commonStyles.flexBetween, marginBottom: spacing.md }}>
                <Text style={commonStyles.sectionTitle}>热门推荐</Text>
                <Button onClick={goSearch} style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}>
                  <Text style={{ fontSize: fontSize.base, color: colors.primary }}>查看全部 {'>'}</Text>
                </Button>
              </View>
              <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
                <View style={{ display: 'inline-flex', gap: spacing.md, paddingBottom: '8rpx' }}>
                  {trendingProducts.map(product => (
                    <View key={product.id} onClick={() => goProduct(product.id)} className="hover-scale" style={{ display: 'inline-block', width: '240rpx', backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', verticalAlign: 'top', transition: `all ${durations.normal} ${easings.easeOut}` }}>
                      <View style={{ width: '240rpx', height: '320rpx' }}>
                        <LazyImage src={getImageUrl(product.images[0])} mode="aspectFill" />
                      </View>
                      <View style={{ padding: spacing.sm }}>
                        <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: 500, ...commonStyles.textEllipsis }}>{product.title}</Text>
                        <View style={{ ...commonStyles.flexBetween, marginTop: '8rpx' }}>
                          <Text style={commonStyles.priceSmall}>¥{formatPrice(product.price)}</Text>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <Text style={{ fontSize: fontSize.xs, color: colors.textHint, textDecoration: 'line-through' }}>¥{formatPrice(product.originalPrice)}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={{ marginBottom: spacing.xl }}>
            <View style={{ ...commonStyles.flexBetween, marginBottom: spacing.md }}>
              <Text style={commonStyles.sectionTitle}>分类</Text>
              <Button onClick={goCategory} style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}>
                <Text style={{ fontSize: fontSize.base, color: colors.primary }}>查看全部 {'>'}</Text>
              </Button>
            </View>
            <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
              <View style={{ display: 'inline-flex', gap: spacing.md, paddingBottom: '8rpx' }}>
                {CATEGORIES.map(cat => {
                  const catCount = categoryCounts[cat.value] || 0;
                  return (
                    <Button key={cat.value} onClick={() => Taro.navigateTo({ url: `/pages/category/index?cat=${cat.value}` })} className="hover-scale" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: spacing.sm, paddingLeft: spacing.md, paddingRight: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm, backgroundColor: colors.card, borderRadius: radius.full, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', transition: `all ${durations.fast} ${easings.easeOut}` }}>
                      <Text style={{ fontSize: '32rpx' }}>{categoryIcons[cat.value]}</Text>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.textPrimary }}>{cat.label}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textHint }}>{catCount}</Text>
                    </Button>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View>
            <View style={{ ...commonStyles.flexBetween, marginBottom: spacing.md }}>
              <Text style={commonStyles.sectionTitle}>猜你喜欢</Text>
            </View>

            {loading && products.length === 0 ? (
              <View style={{ ...commonStyles.flexCenter, paddingTop: '48px' }}>
                <View style={{ width: '24px', height: '24px', border: `2px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
              </View>
            ) : products.length === 0 ? (
              <EmptyState title="暂无商品" description="快去发布第一件商品吧" />
            ) : (
              <View style={{ display: 'flex', gap: spacing.md }}>
                <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {leftColumn.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </View>
                <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {rightColumn.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </View>
              </View>
            )}

            {loading && products.length > 0 && (
              <View style={{ ...commonStyles.flexCenter, paddingTop: '16px', paddingBottom: '16px' }}>
                <View style={{ width: '20px', height: '20px', border: `2px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}