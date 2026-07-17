import { useState, useEffect } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import { CATEGORIES, CATEGORY_MAP } from '@/constants/categories';
import { productService } from '@/services/productService';
import { uploadService } from '@/services/uploadService';
import { formatPrice, formatTime } from '@/utils/format';
import { getUserById } from '@/services/mockData';
import NavBar from '@/components/layout/NavBar';
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

export default function CategoryPage() {
  const [selected, setSelected] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useLoad(() => {
    const params = Taro.getCurrentInstance().router?.params || {};
    const cat = params.cat as Category | undefined;
    if (cat && CATEGORIES.some(c => c.value === cat)) {
      handleSelect(cat);
    }
  });

  const handleSelect = async (cat: Category) => {
    setSelected(cat);
    setLoading(true);
    const result = await productService.list({ category: cat, pageSize: 50 });
    setProducts(result.items);
    setLoading(false);
  };

  const handleBack = () => {
    if (selected) {
      setSelected(null);
      setProducts([]);
    }
  };

  const goProduct = (id: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', paddingBottom: '16px' }}>
      <NavBar
        title={selected ? CATEGORY_MAP[selected] : '分类浏览'}
        showBack={!!selected}
        onBack={handleBack}
      />

      {!selected ? (
        <View style={{ padding: '32rpx' }}>
          <View
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24rpx',
            }}
          >
            {CATEGORIES.map(cat => (
              <Button
                key={cat.value}
                onClick={() => handleSelect(cat.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24rpx',
                  padding: '28rpx',
                  backgroundColor: '#ffffff',
                  borderRadius: '32rpx',
                  textAlign: 'left',
                  border: 'none',
                }}
              >
                <View
                  style={{
                    width: '96rpx',
                    height: '96rpx',
                    borderRadius: '24rpx',
                    backgroundColor: '#E8F4FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ fontSize: '56rpx' }}>{categoryIcons[cat.value]}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1A1A1A' }}>{cat.label}</Text>
                  <Text style={{ fontSize: '24rpx', color: '#666666', marginTop: '2px' }}>点击查看</Text>
                </View>
              </Button>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView
          scrollY
          style={{ height: 'calc(100vh - 48px - var(--safe-area-inset-top))', padding: '12px 16px' }}
        >
          {loading ? (
            <View style={{ display: 'flex', justifyContent: 'center', paddingTop: '48px' }}>
              <View
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #2B8CFF',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                }}
              />
            </View>
          ) : products.length === 0 ? (
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '80px',
                color: '#666666',
              }}
            >
              <Text style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>🖼️</Text>
              <Text style={{ fontSize: '14px' }}>该分类暂无商品</Text>
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
              {products.map(product => {
                const seller = getUserById(product.sellerId);
                return (
                  <Button
                    key={product.id}
                    onClick={() => goProduct(product.id)}
                    style={{
                      display: 'flex',
                      gap: '24rpx',
                      backgroundColor: '#ffffff',
                      borderRadius: '32rpx',
                      padding: '24rpx',
                      textAlign: 'left',
                      border: 'none',
                    }}
                  >
                    <View
                      style={{
                        width: '180rpx',
                        height: '180rpx',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '24rpx',
                        flexShrink: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].startsWith('data:') ? product.images[0] : (uploadService.getUrl(product.images[0]) || product.images[0])}
                          mode="aspectFill"
                          style={{ width: '180rpx', height: '180rpx', borderRadius: '24rpx' }}
                        />
                      ) : (
                        <Text style={{ fontSize: '28px', color: '#cccccc' }}>🖼️</Text>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0, paddingTop: '4px', paddingBottom: '4px' }}>
                      <Text
                        style={{
                          fontSize: '28rpx',
                          fontWeight: 600,
                          color: '#1A1A1A',
                          lineHeight: '40rpx',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.title}
                      </Text>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#2B8CFF' }}>¥{formatPrice(product.price)}</Text>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <Text style={{ fontSize: '24rpx', color: '#666666', textDecoration: 'line-through' }}>
                            ¥{formatPrice(product.originalPrice)}
                          </Text>
                        )}
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        <View
                          style={{
                            width: '32rpx',
                            height: '32rpx',
                            backgroundColor: '#E8F4FF',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Text style={{ fontSize: '18rpx', color: '#2B8CFF', fontWeight: 'bold' }}>{seller?.nickname?.[0] || '?'}</Text>
                        </View>
                        <Text
                          style={{
                            fontSize: '20rpx',
                            color: '#666666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {seller?.nickname || '未知'} · {formatTime(product.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </Button>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
