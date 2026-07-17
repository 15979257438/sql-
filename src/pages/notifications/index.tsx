import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button, Image } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatTime, formatPrice } from '@/utils/format';
import NavBar from '@/components/layout/NavBar';
import type { Notification, OrderStatus } from '@/types';

// 订单状态 → 图标/颜色/文案
const STATUS_META: Record<OrderStatus, { icon: string; label: string; color: string; bg: string }> = {
  pending: { icon: '💰', label: '待付款', color: '#FA8C16', bg: 'rgba(250,140,22,0.1)' },
  accepted: { icon: '✅', label: '已付款', color: '#2B8CFF', bg: 'rgba(43,140,255,0.1)' },
  shipped: { icon: '🚚', label: '运输中', color: '#722ED1', bg: 'rgba(114,46,209,0.1)' },
  received: { icon: '📦', label: '已收货', color: '#13C2C2', bg: 'rgba(19,194,194,0.1)' },
  completed: { icon: '⭐', label: '已完成', color: '#52C41A', bg: 'rgba(82,196,26,0.1)' },
  cancelled: { icon: '❌', label: '已取消', color: '#FF4D4F', bg: 'rgba(255,77,79,0.1)' },
};

export default function NotificationsPage() {
  const user = useAuthStore(s => s.user);
  const { notifications, loading, fetchAll, markRead, markAllRead, unreadCount } = useNotificationStore();

  useEffect(() => {
    if (user) fetchAll(user.id);
  }, [user]);

  const handleClick = (notif: Notification) => {
    markRead(notif.id);
    // 订单类通知跳转到订单页
    if (notif.type === 'order') {
      Taro.navigateTo({ url: '/pages/me-orders/index' });
    } else if (notif.productId) {
      Taro.navigateTo({ url: `/pages/product-detail/index?id=${notif.productId}` });
    }
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar
        title="系统消息"
        rightAction={
          unreadCount > 0 ? (
            <Button
              onClick={() => user && markAllRead(user.id)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                color: '#2B8CFF',
                fontSize: '28rpx',
                fontWeight: 500,
                lineHeight: 'normal',
                height: 'auto',
              }}
            >
              全部已读
            </Button>
          ) : null
        }
      />

      {loading ? (
        <View style={{ display: 'flex', justifyContent: 'center', paddingTop: '48px' }}>
          <View style={{
            width: '24px', height: '24px',
            border: '2px solid #2B8CFF', borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '96px', color: '#666666' }}>
          <Text style={{ fontSize: '96rpx', marginBottom: '16px', opacity: 0.3 }}>🔔</Text>
          <Text style={{ fontSize: '28rpx' }}>暂无系统消息</Text>
          <Text style={{ fontSize: '24rpx', marginTop: '4px', color: '#999999' }}>下单、付款、发货等进度会在这里通知你</Text>
        </View>
      ) : (
        <View style={{ padding: '24rpx', display: 'flex', flexDirection: 'column', gap: '20rpx' }}>
          {notifications.map(notif => {
            const meta = notif.orderStatus ? STATUS_META[notif.orderStatus] : null;
            const isOrder = notif.type === 'order';
            return (
              <View
                key={notif.id}
                onClick={() => handleClick(notif)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '28rpx',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  opacity: notif.read ? 0.85 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* 顶部状态条 */}
                <View style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20rpx 28rpx',
                  backgroundColor: meta ? meta.bg : '#F5F7FA',
                }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                    <Text style={{ fontSize: '32rpx' }}>{meta ? meta.icon : '🔔'}</Text>
                    <Text style={{ fontSize: '28rpx', fontWeight: 600, color: meta ? meta.color : '#1A1A1A' }}>
                      {notif.title}
                    </Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                    {meta && (
                      <View style={{
                        paddingLeft: '14rpx', paddingRight: '14rpx', paddingTop: '4rpx', paddingBottom: '4rpx',
                        borderRadius: '9999px', backgroundColor: meta.color,
                      }}>
                        <Text style={{ fontSize: '20rpx', color: '#ffffff', fontWeight: 600 }}>{meta.label}</Text>
                      </View>
                    )}
                    {!notif.read && (
                      <View style={{ width: '14rpx', height: '14rpx', borderRadius: '50%', backgroundColor: '#FF4D4F' }} />
                    )}
                  </View>
                </View>

                {/* 商品详情区 */}
                {isOrder && notif.productTitle && (
                  <View style={{ display: 'flex', alignItems: 'center', gap: '20rpx', padding: '24rpx 28rpx' }}>
                    <View style={{ width: '96rpx', height: '96rpx', borderRadius: '16rpx', backgroundColor: '#F5F7FA', overflow: 'hidden', flexShrink: 0 }}>
                      {notif.productImage ? (
                        <Image src={notif.productImage} mode="aspectFill" style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <View style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: '32rpx', opacity: 0.4 }}>📦</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: '28rpx', fontWeight: 500, color: '#1A1A1A',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {notif.productTitle}
                      </Text>
                      <Text style={{ fontSize: '32rpx', fontWeight: 700, color: '#2B8CFF', marginTop: '6rpx' }}>
                        ¥{formatPrice(notif.price || 0)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: '40rpx', color: '#CCCCCC' }}>›</Text>
                  </View>
                )}

                {/* 消息内容 */}
                <View style={{
                  padding: '20rpx 28rpx',
                  backgroundColor: '#FAFBFC',
                  borderTop: '1rpx solid #F0F0F0',
                }}>
                  <Text style={{ fontSize: '26rpx', color: '#666666', lineHeight: 1.6, display: 'block' }}>
                    {notif.body}
                  </Text>
                  <Text style={{ fontSize: '22rpx', color: '#999999', marginTop: '8rpx', display: 'block' }}>
                    {formatTime(notif.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
