import { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { uploadService } from '@/services/uploadService';
import { storage } from '@/services/storage';
import { formatPrice, formatTime } from '@/utils/format';
import { goProduct } from '@/utils/nav';
import { showConfirm } from '@/utils/taro';
import NavBar from '@/components/layout/NavBar';
import { EmptyState } from '@/components/shared/Feedback';
import type { Product } from '@/types';

function getImageSrc(img: string) {
  if (!img) return '';
  if (img.startsWith('data:') || img.startsWith('http')) return img;
  return uploadService.getUrl(img) || img;
}

export default function HistoryPage() {
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    const historyIds = storage.get<string[]>('history') || [];

    if (historyIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const allProducts = storage.get<Product[]>('products') || [];
    const found: Product[] = [];
    for (const id of historyIds) {
      const p = allProducts.find(ap => ap.id === id);
      if (p) found.push(p);
    }
    setProducts(found);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    const confirmed = await showConfirm('清空浏览记录', '确定清空所有浏览记录？');
    if (!confirmed) return;
    storage.set('history', []);
    setProducts([]);
    showToast('已清空浏览记录', 'info');
  };

  const handleRemove = (e: any, id: string) => {
    e.stopPropagation();
    const historyIds = storage.get<string[]>('history') || [];
    const updated = historyIds.filter(hid => hid !== id);
    storage.set('history', updated);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('已删除该记录', 'info');
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar
        title="浏览记录"
        rightAction={
          products.length > 0 ? (
            <View
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '88rpx',
                paddingLeft: '16rpx',
                paddingRight: '16rpx',
              }}
            >
              <Text style={{ fontSize: '28rpx', color: '#FF4D4F', fontWeight: 500 }}>
                清空
              </Text>
            </View>
          ) : null
        }
      />

      {loading ? (
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '48px',
            paddingBottom: '48px',
          }}
        >
          <Text style={{ fontSize: '28rpx', color: '#999999' }}>加载中...</Text>
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          title="暂无浏览记录"
          description="浏览过的商品会出现在这里"
        />
      ) : (
        <View style={{ padding: '32rpx', display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
          {products.map(p => (
            <View
              key={p.id}
              onClick={() => goProduct(p.id)}
              style={{
                display: 'flex',
                gap: '24rpx',
                backgroundColor: '#ffffff',
                borderRadius: '32rpx',
                padding: '24rpx',
              }}
            >
              <View
                style={{
                  width: '180rpx',
                  height: '180rpx',
                  backgroundColor: '#F5F7FA',
                  borderRadius: '24rpx',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {p.images[0] ? (
                  <Image
                    src={getImageSrc(p.images[0])}
                    mode="aspectFill"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : null}
              </View>

              <View style={{ flex: 1, minWidth: 0, paddingTop: '8rpx', paddingBottom: '8rpx' }}>
                <Text
                  maxLines={2}
                  overflow="ellipsis"
                  style={{
                    fontSize: '28rpx',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    lineHeight: '1.3',
                  }}
                >
                  {p.title}
                </Text>

                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx', marginTop: '8rpx' }}>
                  <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#2B8CFF' }}>
                    ¥{formatPrice(p.price)}
                  </Text>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <Text style={{ fontSize: '24rpx', color: '#666666', textDecoration: 'line-through' }}>
                      ¥{formatPrice(p.originalPrice)}
                    </Text>
                  )}
                </View>

                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16rpx' }}>
                  <Text style={{ fontSize: '20rpx', color: '#666666' }}>
                    {formatTime(p.createdAt)}
                  </Text>

                  <Button
                    onClick={(e: any) => handleRemove(e, p.id)}
                    style={{
                      paddingLeft: '24rpx',
                      paddingRight: '24rpx',
                      paddingTop: '8rpx',
                      paddingBottom: '8rpx',
                      border: '1px solid rgba(255, 77, 79, 0.3)',
                      color: '#FF4D4F',
                      fontSize: '24rpx',
                      borderRadius: '16rpx',
                      backgroundColor: '#ffffff',
                      lineHeight: '1.5',
                    }}
                  >
                    删除
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
