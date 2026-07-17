import { useEffect, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { notificationService } from '@/services/notificationService';
import { formatTime, formatPrice } from '@/utils/format';
import { getAssetUrl } from '@/services/api';
import NavBar from '@/components/layout/NavBar';
import type { Conversation, Notification } from '@/types';
import './index.scss';

export default function ChatListPage() {
  const user = useAuthStore(s => s.user);
  const { conversations, loadingConversations, fetchConversations } = useChatStore();
  const [mounted, setMounted] = useState(false);
  const [sysNotifs, setSysNotifs] = useState<Notification[]>([]);
  const [sysUnread, setSysUnread] = useState(0);

  const loadSysNotifs = async () => {
    if (!user) return;
    const list = await notificationService.getAll(user.id);
    setSysNotifs(list.slice(0, 1)); // 只取最新一条作为预览
    setSysUnread(list.filter(n => !n.read).length);
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      loadSysNotifs();
    }
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [user]);

  useDidShow(() => {
    if (user) {
      fetchConversations();
      loadSysNotifs();
    }
  });

  const getUnread = (conv: Conversation) => {
    if (!user) return 0;
    return conv.buyerId === user.id ? conv.unreadBuyer : conv.unreadSeller;
  };

  const getOther = (conv: Conversation) => {
    if (!user) return conv.seller;
    return conv.buyerId === user.id ? conv.seller : conv.buyer;
  };

  const goChat = (conv: Conversation) => {
    Taro.navigateTo({ url: `/pages/chat-detail/index?conversationId=${conv.id}` });
  };

  const productImage = (conv: Conversation) => {
    const images = conv.product?.images || [];
    return images[0] ? getAssetUrl(images[0]) : '';
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="消息" />

      {/* 内联样式定义动画 */}
      <View>
        {/* 未读徽章脉冲动画 */}
        <View style={{
          position: 'absolute',
          width: 0,
          height: 0,
          overflow: 'hidden',
        }}>
          <View style={{
            animation: 'pulse 2s ease-in-out infinite',
          }} />
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 48px - 120rpx - env(safe-area-inset-bottom) - var(--safe-area-inset-top))' }}>
        {/* 系统消息入口 */}
        <View style={{ padding: '24rpx 24rpx 0' }}>
          <Button
            onClick={() => Taro.navigateTo({ url: '/pages/notifications/index' })}
            hoverClass="card-hover"
            style={{
              display: 'flex', alignItems: 'center', gap: '20rpx', width: '100%',
              padding: '24rpx', backgroundColor: '#ffffff', borderRadius: '28rpx',
              textAlign: 'left', border: 'none',
              boxShadow: '0 2px 12px rgba(43,140,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <View style={{
              width: '88rpx', height: '88rpx', borderRadius: '20rpx',
              background: 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ fontSize: '40rpx' }}>🔔</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1A1A1A' }}>系统消息</Text>
                {sysUnread > 0 && (
                  <View style={{
                    minWidth: '32rpx', height: '32rpx', borderRadius: '9999px',
                    backgroundColor: '#FF4D4F', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    paddingLeft: '8rpx', paddingRight: '8rpx',
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: '20rpx', fontWeight: 700 }}>{sysUnread > 99 ? '99+' : sysUnread}</Text>
                  </View>
                )}
              </View>
              <Text style={{
                fontSize: '24rpx', color: '#999999', marginTop: '4rpx',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {sysNotifs[0] ? sysNotifs[0].title + ' · ' + sysNotifs[0].body : '下单、付款、发货等进度通知'}
              </Text>
            </View>
            <Text style={{ fontSize: '36rpx', color: '#CCCCCC', flexShrink: 0 }}>›</Text>
          </Button>
        </View>

        {/* 分区标题 */}
        <View style={{ padding: '28rpx 32rpx 12rpx' }}>
          <Text style={{ fontSize: '24rpx', color: '#999999', fontWeight: 500 }}>聊天消息</Text>
        </View>

        {conversations.length === 0 ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '80px',
              color: '#666666',
            }}
          >
            <Text style={{ fontSize: '96rpx', marginBottom: '12px', opacity: 0.3 }}>💬</Text>
            <Text style={{ fontSize: '28rpx' }}>暂无消息</Text>
            <Text style={{ fontSize: '24rpx', marginTop: '4px' }}>去看看有什么好东西吧</Text>
          </View>
        ) : (
          <View style={{ padding: '32rpx', display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
            {conversations.map((conv, index) => {
              const other = getOther(conv);
              const unread = getUnread(conv);
              const product = conv.product;
              return (
                <View
                  key={conv.id}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.4s ease ${index * 0.05}s`,
                  }}
                >
                  <Button
                    onClick={() => goChat(conv)}
                    hoverClass="card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '24rpx',
                      padding: '24rpx',
                      backgroundColor: '#ffffff',
                      borderRadius: '32rpx',
                      textAlign: 'left',
                      border: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <Image
                      src={productImage(conv)}
                      mode="aspectFill"
                      style={{
                        width: '120rpx',
                        height: '120rpx',
                        borderRadius: '16rpx',
                        backgroundColor: '#F5F7FA',
                        flexShrink: 0,
                      }}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1A1A1A' }}>{other?.nickname || '未知用户'}</Text>
                        <Text style={{ fontSize: '22rpx', color: '#999999' }}>
                          {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                        </Text>
                      </View>
                      {/* 最新消息淡入动画 */}
                      <Text
                        style={{
                          fontSize: '24rpx',
                          color: '#666666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '4rpx',
                          animation: 'fadeIn 0.5s ease-out',
                        }}
                      >
                        {conv.lastMessage || '暂无消息'}
                      </Text>
                      {product && (
                        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8rpx' }}>
                          <Text
                            style={{
                              fontSize: '22rpx',
                              color: '#999999',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '70%',
                            }}
                          >
                            {product.title}
                          </Text>
                          <Text style={{ fontSize: '24rpx', fontWeight: 700, color: '#2B8CFF' }}>¥{formatPrice(product.price)}</Text>
                        </View>
                      )}
                    </View>
                    {/* 未读消息徽章脉冲动画 */}
                    {unread > 0 && (
                      <View
                        style={{
                          minWidth: '36rpx',
                          height: '36rpx',
                          borderRadius: '50%',
                          backgroundColor: '#FF4D4F',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingLeft: '12rpx',
                          paddingRight: '12rpx',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        }}
                      >
                        <Text style={{ color: '#ffffff', fontSize: '20rpx', fontWeight: 'bold' }}>
                          {unread > 99 ? '99+' : unread}
                        </Text>
                      </View>
                    )}
                  </Button>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}