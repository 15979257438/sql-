import { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { productService } from '@/services/productService';
import { uploadService } from '@/services/uploadService';
import { formatPrice, formatTime } from '@/utils/format';
import { CATEGORY_MAP } from '@/constants/categories';
import NavBar from '@/components/layout/NavBar';
import { goProduct, goPublishEdit } from '@/utils/nav';
import { showConfirm } from '@/utils/taro';
import type { Product, ProductStatus } from '@/types';

const statusTabs: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'published', label: '在售' },
  { value: 'sold', label: '已售出' },
  { value: 'offline', label: '已下架' },
];

const statusStyle = {
  published: { bg: '#DCFCE7', color: '#15803D' },
  sold: { bg: '#F3F4F6', color: '#6B7280' },
  offline: { bg: '#FFEDD5', color: '#C2410C' },
};

export default function MyProductsPage() {
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    productService.list({ sellerId: user.id, pageSize: 100, status: filter === 'all' ? undefined : filter })
      .then(r => { setProducts(r.items); setLoading(false); });
  }, [user, filter]);

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('删除商品', '确定删除该商品？此操作不可恢复。');
    if (!confirmed) return;
    await productService.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('已删除', 'success');
  };

  const handleMarkSold = async (id: string) => {
    await productService.markAsSold(id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'sold' as const } : p));
    showToast('已标记为售出', 'success');
  };

  const handleRelist = async (id: string) => {
    await productService.relist(id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'published' as const } : p));
    showToast('已重新上架', 'success');
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="我的发布" />

      <View
        style={{
          backgroundColor: '#ffffff',
          paddingLeft: '32rpx',
          paddingRight: '32rpx',
          paddingTop: '24rpx',
          paddingBottom: '24rpx',
          display: 'flex',
          gap: '24rpx',
          overflowX: 'auto',
          borderBottom: '1px solid #EEEEEE',
        }}
      >
        {statusTabs.map(tab => (
          <Button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              flexShrink: 0,
              paddingLeft: '32rpx',
              paddingRight: '32rpx',
              paddingTop: '12rpx',
              paddingBottom: '12rpx',
              borderRadius: '9999px',
              fontSize: '28rpx',
              border: 'none',
              backgroundColor: filter === tab.value ? '#2B8CFF' : '#F3F4F6',
              color: filter === tab.value ? '#ffffff' : '#666666',
            }}
          >
            {tab.label}
          </Button>
        ))}
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 48px - var(--safe-area-inset-top) - 49px)' }}>
        {loading ? (
          <View style={{ display: 'flex', justifyContent: 'center', paddingTop: '48px' }}>
            <View
              style={{
                width: '48rpx',
                height: '48rpx',
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
              color: '#999999',
            }}
          >
            <Text style={{ fontSize: '28rpx' }}>暂无商品</Text>
          </View>
        ) : (
          <View style={{ padding: '32rpx', display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
            {products.map(product => (
              <View key={product.id} style={{ backgroundColor: '#ffffff', borderRadius: '16rpx', padding: '24rpx' }}>
                <Button
                  onClick={() => goProduct(product.id)}
                  style={{
                    display: 'flex',
                    gap: '24rpx',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  <View
                    style={{
                      width: '160rpx',
                      height: '160rpx',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '16rpx',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].startsWith('data:') ? product.images[0] : uploadService.getUrl(product.images[0])}
                        mode="aspectFill"
                        style={{ width: '160rpx', height: '160rpx', borderRadius: '16rpx' }}
                      />
                    ) : (
                      <Text style={{ fontSize: '56rpx', color: '#cccccc' }}>🖼️</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Text
                        style={{
                          fontSize: '28rpx',
                          color: '#1A1A1A',
                          lineHeight: '40rpx',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: '24rpx',
                          paddingLeft: '16rpx',
                          paddingRight: '16rpx',
                          paddingTop: '4rpx',
                          paddingBottom: '4rpx',
                          borderRadius: '9999px',
                          flexShrink: 0,
                          marginLeft: '16rpx',
                          backgroundColor: (statusStyle[product.status] || statusStyle.offline).bg,
                          color: (statusStyle[product.status] || statusStyle.offline).color,
                        }}
                      >
                        {product.status === 'published' ? '在售' : product.status === 'sold' ? '已售出' : '已下架'}
                      </Text>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx', marginTop: '8rpx' }}>
                      <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#1A1A1A' }}>¥{formatPrice(product.price)}</Text>
                      <Text style={{ fontSize: '20rpx', color: '#999999' }}>{CATEGORY_MAP[product.category]}</Text>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx', marginTop: '8rpx' }}>
                      <Text style={{ fontSize: '20rpx', color: '#999999' }}>{formatTime(product.createdAt)}</Text>
                      <Text style={{ fontSize: '20rpx', color: '#999999' }}>👁 {product.views} 浏览</Text>
                      <Text style={{ fontSize: '20rpx', color: '#999999' }}>❤ {product.favorites} 收藏</Text>
                    </View>
                  </View>
                </Button>

                <View
                  style={{
                    display: 'flex',
                    gap: '16rpx',
                    marginTop: '24rpx',
                    paddingTop: '24rpx',
                    borderTop: '1px solid #EEEEEE',
                  }}
                >
                  {product.status === 'published' && (
                    <>
                      <Button
                        onClick={() => goPublishEdit(product.id)}
                        style={{
                          flex: 1,
                          paddingTop: '12rpx',
                          paddingBottom: '12rpx',
                          fontSize: '24rpx',
                          border: '1px solid #EEEEEE',
                          borderRadius: '8rpx',
                          color: '#666666',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        onClick={() => handleMarkSold(product.id)}
                        style={{
                          flex: 1,
                          paddingTop: '12rpx',
                          paddingBottom: '12rpx',
                          fontSize: '24rpx',
                          border: '1px solid #EEEEEE',
                          borderRadius: '8rpx',
                          color: '#666666',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        标记售出
                      </Button>
                    </>
                  )}
                  {(product.status === 'sold' || product.status === 'offline') && (
                    <Button
                      onClick={() => handleRelist(product.id)}
                      style={{
                        flex: 1,
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        fontSize: '12px',
                        border: '1px solid #2B8CFF',
                        borderRadius: '8rpx',
                        color: '#2B8CFF',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      重新上架
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(product.id)}
                    style={{
                      flex: 1,
                      paddingTop: '6px',
                      paddingBottom: '6px',
                      fontSize: '12px',
                      border: '1px solid #FFCDD2',
                      borderRadius: '8rpx',
                      color: '#FF4D4F',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
