import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { productService } from '@/services/productService';
import { storage } from '@/services/storage';
import {
  goMeProfile,
  goMeProducts,
  goMeFavorites,
  goMeHistory,
  goMeOrders,
  goMeSettings,
  goLogin,
} from '@/utils/nav';
import { formatPrice } from '@/utils/format';
import { showConfirm } from '@/utils/taro';

const menuItems = [
  {
    label: '我的砍价',
    nav: () => Taro.navigateTo({ url: '/pages/bargains/index' }),
    iconColor: { bg: '#FFF7ED', text: '#F97316' },
    icon: '🔨',
  },
  {
    label: '我的钱包',
    nav: () => Taro.navigateTo({ url: '/pages/wallet/index' }),
    iconColor: { bg: '#ECFDF5', text: '#10B981' },
    icon: '💰',
  },
  {
    label: '我的发布',
    nav: goMeProducts,
    iconColor: { bg: '#EFF6FF', text: '#3B82F6' },
    icon: '📦',
  },
  {
    label: '我的收藏',
    nav: goMeFavorites,
    iconColor: { bg: '#FEF2F2', text: '#EF4444' },
    icon: '❤',
  },
  {
    label: '浏览记录',
    nav: goMeHistory,
    iconColor: { bg: '#FAF5FF', text: '#A855F7' },
    icon: '👁',
  },
  {
    label: '我的订单',
    nav: goMeOrders,
    iconColor: { bg: '#FFFBEB', text: '#F59E0B' },
    icon: '📝',
  },
  {
    label: '设置',
    nav: goMeSettings,
    iconColor: { bg: '#F3F4F6', text: '#666666' },
    icon: '⚙',
  },
];

export default function MePage() {
  const { user, logout } = useAuthStore();
  const [productCount, setProductCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (user) {
      productService.list({ sellerId: user.id, pageSize: 1 }).then(r => setProductCount(r.total));
      productService.list({ sellerId: user.id, status: 'sold', pageSize: 1 }).then(r => setSoldCount(r.total));
      const orders = storage.get<any[]>('orders') || [];
      setOrderCount(orders.filter((o: any) => o.buyerId === user.id || o.sellerId === user.id).length);
    }
  }, [user]);

  const stats = [
    { label: '在售', value: productCount },
    { label: '已售', value: soldCount },
    { label: '订单', value: orderCount },
    { label: '余额', value: `¥${formatPrice(user?.balance || 0)}` },
  ];

  const handleLogout = async () => {
    const confirmed = await showConfirm('退出登录', '确定退出登录？');
    if (confirmed) {
      await logout();
      goLogin();
    }
  };

  return (
    <View
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7FA',
        paddingBottom: 'calc(128rpx + env(safe-area-inset-bottom))',
      }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: '#2B8CFF',
          paddingLeft: '48rpx',
          paddingRight: '48rpx',
          paddingTop: '80rpx',
          paddingBottom: '96rpx',
          borderBottomLeftRadius: '64rpx',
          borderBottomRightRadius: '64rpx',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '320rpx',
            height: '320rpx',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translateY(-50%) translateX(33%)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '192rpx',
            height: '192rpx',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translateY(50%) translateX(-33%)',
          }}
        />

        <View
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '32rpx',
          }}
        >
          <Button
            onClick={goMeProfile}
            style={{
              width: '144rpx',
              height: '144rpx',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              padding: 0,
              border: 'none',
            }}
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                mode="aspectFill"
                style={{ width: '144rpx', height: '144rpx' }}
              />
            ) : (
              <Text style={{ color: '#2B8CFF', fontWeight: 'bold', fontSize: '60rpx' }}>
                {user?.nickname?.[0] || '?'}
              </Text>
            )}
          </Button>
          <View style={{ flex: 1, minWidth: 0, color: '#ffffff' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text
                style={{
                  fontSize: '40rpx',
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.nickname || '未设置'}
              </Text>
              {user?.verified && (
                <Text style={{ fontSize: '36rpx', color: '#ffffff' }}>✓</Text>
              )}
            </View>
            <Text
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.school || '未设置学校'} {user?.department ? '· ' + user.department : ''}
            </Text>
            {user?.bio && (
              <Text
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.bio}
              </Text>
            )}
          </View>
          <Button
            onClick={goMeProfile}
            style={{
              position: 'relative',
              zIndex: 10,
              fontSize: '24rpx',
              color: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '9999px',
              paddingLeft: '24rpx',
              paddingRight: '24rpx',
              paddingTop: '12rpx',
              paddingBottom: '12rpx',
              backgroundColor: 'transparent',
            }}
          >
            编辑资料
          </Button>
        </View>
      </View>

      {/* Stats card */}
      <View
        style={{
          marginLeft: '32rpx',
          marginRight: '32rpx',
          marginTop: '-48rpx',
          backgroundColor: '#ffffff',
          borderRadius: '32rpx',
          padding: '32rpx',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <View
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
          }}
        >
          {stats.map(s => (
            <Button
              key={s.label}
              onClick={goMeProducts}
              style={{
                textAlign: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '4px 0',
              }}
            >
              <Text style={{ fontSize: '36rpx', fontWeight: 'bold', color: '#1A1A1A' }}>{s.value}</Text>
              <Text style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>{s.label}</Text>
            </Button>
          ))}
        </View>
      </View>

      {/* Menu grid */}
      <View style={{ paddingLeft: '32rpx', paddingRight: '32rpx', marginTop: '16px' }}>
        <View
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          {menuItems.map(item => (
            <Button
              key={item.label}
              onClick={item.nav}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '32rpx',
                padding: '28rpx',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                border: 'none',
              }}
            >
              <View
                style={{
                  width: '80rpx',
                  height: '80rpx',
                  borderRadius: '24rpx',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: item.iconColor.bg,
                }}
              >
                <Text style={{ fontSize: '40rpx', color: item.iconColor.text }}>{item.icon}</Text>
              </View>
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#1A1A1A' }}>{item.label}</Text>
            </Button>
          ))}
        </View>
      </View>

      {/* Logout */}
      <View style={{ paddingLeft: '32rpx', paddingRight: '32rpx', marginTop: '16px' }}>
        <Button
          onClick={handleLogout}
          style={{
            width: '100%',
            paddingTop: '28rpx',
            paddingBottom: '28rpx',
            backgroundColor: '#ffffff',
            color: '#FF4D4F',
            fontWeight: '500',
            borderRadius: '32rpx',
            border: 'none',
          }}
        >
          退出登录
        </Button>
      </View>
    </View>
  );
}
