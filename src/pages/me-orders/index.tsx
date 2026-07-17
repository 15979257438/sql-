import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';
import { getUserById } from '@/services/mockData';
import { uploadService } from '@/services/uploadService';
import { formatPrice, formatTime } from '@/utils/format';
import { useUIStore } from '@/stores/uiStore';
import { storage } from '@/services/storage';
import { EmptyState } from '@/components/shared/Feedback';
import NavBar from '@/components/layout/NavBar';
import ReviewModal from '@/components/shared/ReviewModal';
import { reviewService } from '@/services/reviewService';
import { chatService } from '@/services/chatService';
import { showPrompt } from '@/utils/taro';
import type { Order, Product, User } from '@/types';

const STATUS_FLOW = ['pending', 'accepted', 'shipped', 'completed'] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: '待确认', accepted: '待发货', shipped: '已发货', received: '已收货',
  completed: '已完成', cancelled: '已取消',
};

function OrderItem({ order, tab, onRefresh }: { order: Order; tab: 'buy' | 'sell'; onRefresh: () => void }) {
  const showToast = useUIStore(s => s.showToast);
  const [product, setProduct] = useState<Product | null>(null);
  const [other, setOther] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const allProducts = storage.get<Product[]>('products') || [];
    const found = allProducts.find((p: Product) => p.id === order.productId);
    if (found) setProduct(found);
    const otherId = tab === 'buy' ? order.sellerId : order.buyerId;
    setOther(getUserById(otherId) || null);

    if (order.status === 'completed') {
      reviewService.hasReviewed(order.id, order.buyerId).then(setReviewed);
    }
  }, [order, tab]);

  const sendNotification = (targetUserId: string, title: string, body: string) => {
    const notifs = storage.get<any[]>('notifications') || [];
    notifs.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
      userId: targetUserId,
      type: 'order',
      title,
      body,
      relatedId: order.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
    storage.set('notifications', notifs);
  };

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      let newStatus = '';
      let notifUserId = '';
      let notifTitle = '';
      let notifBody = '';

      if (action === 'confirm') {
        newStatus = 'accepted';
        notifUserId = order.sellerId;
        notifTitle = '买家已下单';
        notifBody = `「${product?.title || '商品'}」已被买家确认下单，请尽快发货`;
      } else if (action === 'ship') {
        newStatus = 'shipped';
        notifUserId = order.buyerId;
        notifTitle = '卖家已发货';
        notifBody = `「${product?.title || '商品'}」已发货，请留意收货`;
      } else if (action === 'receive') {
        newStatus = 'completed';
        notifUserId = order.sellerId;
        notifTitle = '买家已收货';
        notifBody = `「${product?.title || '商品'}」已被买家确认收货，交易完成`;
        if (product) {
          await productService.markAsSold(product.id);
        }
      }

      await orderService.updateStatus(order.id, newStatus as any);
      sendNotification(notifUserId, notifTitle, notifBody);

      showToast(
        action === 'confirm' ? '已确认下单' :
        action === 'ship' ? '已确认发货' :
        '已确认收货，交易完成！',
        'success'
      );
      onRefresh();

      if (action === 'receive') {
        const alreadyReviewed = await reviewService.hasReviewed(order.id, order.buyerId);
        if (!alreadyReviewed) {
          setShowReviewModal(true);
        }
      }
    } catch (e) {
      showToast('操作失败', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const isBuyer = tab === 'buy';
    const label = isBuyer ? '取消订单' : '拒绝订单';
    const res = await showPrompt(`确定要${label}吗？`, '可填写原因（选填）：');
    if (!res.confirm) return;

    setActionLoading(true);
    try {
      await orderService.cancelOrder(order.id, res.value || undefined);

      sendNotification(
        isBuyer ? order.sellerId : order.buyerId,
        isBuyer ? '买家已取消订单' : '卖家已拒绝订单',
        `订单「${product?.title || '商品'}」已被${isBuyer ? '买家取消' : '卖家拒绝'}${res.value ? `，原因：${res.value}` : ''}`
      );

      showToast(`${label}成功`, 'success');
      onRefresh();
    } catch (e: any) {
      showToast(e.message || '操作失败', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusTracker = () => {
    if (order.status === 'cancelled') return null;
    const currentIdx = STATUS_FLOW.indexOf(order.status as any);
    return (
      <View style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
        {STATUS_FLOW.map((s, i) => {
          const isDone = i <= (currentIdx >= 0 ? currentIdx : -1);
          return (
            <View key={s} style={{ display: 'flex', alignItems: 'center', flex: i === 3 ? 'none' : 1 }}>
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <View
                  style={{
                    width: '40rpx',
                    height: '40rpx',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20rpx',
                    fontWeight: 'bold',
                    backgroundColor: isDone ? '#2B8CFF' : '#E5E5E5',
                    color: isDone ? '#ffffff' : '#666666',
                  }}
                >
                  <Text style={{ fontSize: '20rpx', color: isDone ? '#ffffff' : '#666666', fontWeight: 'bold' }}>
                    {isDone ? '✓' : i + 1}
                  </Text>
                </View>
                <Text style={{ fontSize: '18rpx', color: '#666666', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {s === 'pending' ? '待确认' : s === 'accepted' ? '待发货' : s === 'shipped' ? '已发货' : '已完成'}
                </Text>
              </View>
              {i < 3 && (
                <View
                  style={{
                    flex: 1,
                    height: '4rpx',
                    marginLeft: '4px',
                    marginRight: '4px',
                    backgroundColor: i < (currentIdx >= 0 ? currentIdx : -1) ? '#2B8CFF' : '#E5E5E5',
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    setReviewSubmitting(true);
    try {
      await reviewService.create({
        orderId: order.id,
        productId: order.productId,
        reviewerId: order.buyerId,
        targetId: order.sellerId,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        comment,
      });
      setReviewed(true);
      setShowReviewModal(false);
      showToast('评价提交成功', 'success');
      onRefresh();
    } catch (e) {
      showToast('评价提交失败', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderActions = () => {
    const status = order.status;
    if (status === 'cancelled') {
      return (
        <View style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #EEEEEE' }}>
          <Button
            onClick={() => Taro.navigateTo({ url: `/pages/product-detail/index?id=${order.productId}` })}
            style={{
              flex: 1,
              height: '72rpx',
              lineHeight: '72rpx',
              border: '1px solid #EEEEEE',
              color: '#666666',
              fontSize: '24rpx',
              borderRadius: '16rpx',
              backgroundColor: '#ffffff',
            }}
          >
            查看商品
          </Button>
        </View>
      );
    }

    return (
      <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #EEEEEE' }}>
        {tab === 'buy' && status === 'pending' && (
          <Button
            onClick={() => handleAction('confirm')}
            disabled={actionLoading}
            style={{
              flex: 1,
              minWidth: '80px',
              height: '72rpx',
              lineHeight: '72rpx',
              backgroundColor: '#2B8CFF',
              color: '#ffffff',
              fontSize: '24rpx',
              borderRadius: '16rpx',
              border: 'none',
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            {actionLoading ? '处理中...' : '确认下单'}
          </Button>
        )}
        {tab === 'buy' && status === 'pending' && (
          <Button
            onClick={handleCancel}
            disabled={actionLoading}
            style={{
              flex: 1,
              minWidth: '80px',
              height: '72rpx',
              lineHeight: '72rpx',
              border: '1px solid #FF4D4F',
              color: '#FF4D4F',
              fontSize: '24rpx',
              borderRadius: '16rpx',
              backgroundColor: '#ffffff',
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            取消订单
          </Button>
        )}
        {tab === 'buy' && status === 'shipped' && (
          <Button
            onClick={() => handleAction('receive')}
            disabled={actionLoading}
            style={{
              flex: 1,
              minWidth: '80px',
              height: '72rpx',
              lineHeight: '72rpx',
              backgroundColor: '#2B8CFF',
              color: '#ffffff',
              fontSize: '24rpx',
              borderRadius: '16rpx',
              border: 'none',
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            {actionLoading ? '处理中...' : '确认收货'}
          </Button>
        )}
        {tab === 'buy' && status === 'completed' && (
          reviewed ? (
            <View
              style={{
                flex: 1,
                minWidth: '80px',
                height: '72rpx',
                backgroundColor: '#F5F7FA',
                borderRadius: '16rpx',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: '24rpx', color: '#666666' }}>已评价</Text>
            </View>
          ) : (
            <Button
              onClick={() => setShowReviewModal(true)}
              disabled={actionLoading}
              style={{
                flex: 1,
                minWidth: '80px',
                height: '72rpx',
                lineHeight: '72rpx',
                backgroundColor: '#2B8CFF',
                color: '#ffffff',
                fontSize: '24rpx',
                borderRadius: '16rpx',
                border: 'none',
                opacity: actionLoading ? 0.5 : 1,
              }}
            >
              评价
            </Button>
          )
        )}
        {tab === 'sell' && status === 'pending' && (
          <Button
            onClick={handleCancel}
            disabled={actionLoading}
            style={{
              flex: 1,
              minWidth: '80px',
              height: '72rpx',
              lineHeight: '72rpx',
              border: '1px solid #FF4D4F',
              color: '#FF4D4F',
              fontSize: '24rpx',
              borderRadius: '16rpx',
              backgroundColor: '#ffffff',
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            拒绝订单
          </Button>
        )}
        {tab === 'sell' && status === 'accepted' && (
          <Button
            onClick={() => handleAction('ship')}
            disabled={actionLoading}
            style={{
              flex: 1,
              minWidth: '80px',
              height: '72rpx',
              lineHeight: '72rpx',
              backgroundColor: '#2B8CFF',
              color: '#ffffff',
              fontSize: '24rpx',
              borderRadius: '16rpx',
              border: 'none',
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            {actionLoading ? '处理中...' : '确认发货'}
          </Button>
        )}
        <Button
          onClick={() => Taro.navigateTo({ url: `/pages/product-detail/index?id=${order.productId}` })}
          style={{
            flex: 1,
            minWidth: '80px',
            height: '72rpx',
            lineHeight: '72rpx',
            border: '1px solid #EEEEEE',
            color: '#666666',
            fontSize: '24rpx',
            borderRadius: '16rpx',
            backgroundColor: '#ffffff',
          }}
        >
          查看商品
        </Button>
        <Button
          onClick={async () => {
            try {
              const conv = await chatService.getOrCreateConversation(order.productId);
              Taro.navigateTo({ url: `/pages/chat-detail/index?conversationId=${conv.id}` });
            } catch (e) {
              console.error('打开聊天失败:', e);
            }
          }}
          style={{
            flex: 1,
            minWidth: '80px',
            height: '72rpx',
            lineHeight: '72rpx',
            border: '1px solid #EEEEEE',
            color: '#666666',
            fontSize: '24rpx',
            borderRadius: '16rpx',
            backgroundColor: '#ffffff',
          }}
        >
          联系{tab === 'buy' ? '卖家' : '买家'}
        </Button>
      </View>
    );
  };

  const getImageSrc = (img: string) => {
    if (!img) return '';
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    return uploadService.getUrl(img) || img;
  };

  const statusColor =
    order.status === 'completed' ? { bg: '#DCFCE7', color: '#15803D' } :
    order.status === 'cancelled' ? { bg: '#FEE2E2', color: '#DC2626' } :
    order.status === 'shipped' ? { bg: '#FEF3C7', color: '#D97706' } :
    order.status === 'accepted' ? { bg: '#E8F4FF', color: '#2B8CFF' } :
    { bg: '#F5F7FA', color: '#666666' };

  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: '32rpx', padding: '28rpx' }}>
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: '24rpx', color: '#666666' }}>订单号: {order.id.slice(-8)}</Text>
        <View
          style={{
            paddingLeft: '20rpx',
            paddingRight: '20rpx',
            paddingTop: '2px',
            paddingBottom: '2px',
            borderRadius: '9999px',
            backgroundColor: statusColor.bg,
          }}
        >
          <Text style={{ fontSize: '24rpx', color: statusColor.color, fontWeight: 500 }}>
            {STATUS_LABEL[order.status] || order.status}
          </Text>
        </View>
      </View>

      <View
        style={{ display: 'flex', gap: '24rpx', marginTop: '12px' }}
        onClick={() => product && Taro.navigateTo({ url: `/pages/product-detail/index?id=${product.id}` })}
      >
        <View
          style={{
            width: '160rpx',
            height: '160rpx',
            backgroundColor: '#f5f5f5',
            borderRadius: '24rpx',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {product?.images?.[0] ? (
            <Image
              src={getImageSrc(product.images[0])}
              mode="aspectFill"
              style={{ width: '160rpx', height: '160rpx' }}
            />
          ) : null}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
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
            {product?.title || '商品已删除'}
          </Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            {product && <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#2B8CFF' }}>¥{formatPrice(product.price)}</Text>}
          </View>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <Text style={{ fontSize: '22rpx', color: '#666666' }}>
              {tab === 'buy' ? '卖家' : '买家'}: {other?.nickname || '未知'}
            </Text>
            <Text style={{ fontSize: '20rpx', color: '#666666' }}>{formatTime(order.createdAt)}</Text>
          </View>
        </View>
      </View>

      {order.message && (
        <View style={{ marginTop: '12px', backgroundColor: '#F5F7FA', borderRadius: '24rpx', padding: '20rpx' }}>
          <Text style={{ fontSize: '22rpx', color: '#666666' }}>留言: {order.message}</Text>
        </View>
      )}
      {order.status === 'cancelled' && order.cancelReason && (
        <View style={{ marginTop: '12px', backgroundColor: '#FEF2F2', borderRadius: '24rpx', padding: '20rpx' }}>
          <Text style={{ fontSize: '22rpx', color: '#FF4D4F' }}>
            {order.cancelledBy === order.buyerId ? '买家' : '卖家'}取消原因: {order.cancelReason}
          </Text>
        </View>
      )}

      {renderStatusTracker()}
      {renderActions()}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
        loading={reviewSubmitting}
        title="评价本次交易"
      />
    </View>
  );
}

export default function OrdersPage() {
  const user = useAuthStore(s => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  const fetchOrders = () => {
    if (!user) return;
    const allOrders = storage.get<Order[]>('orders') || [];
    setOrders(allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const filtered = orders.filter(o => tab === 'buy' ? o.buyerId === user?.id : o.sellerId === user?.id);

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="我的订单" />
      <View style={{ display: 'flex', backgroundColor: '#ffffff', borderBottom: '1px solid #EEEEEE' }}>
        {[{ key: 'buy', label: '我买的' }, { key: 'sell', label: '我卖的' }].map(t => (
          <Button
            key={t.key}
            onClick={() => setTab(t.key as 'buy' | 'sell')}
            style={{
              flex: 1,
              paddingTop: '24rpx',
              paddingBottom: '24rpx',
              fontSize: '28rpx',
              fontWeight: 500,
              border: 'none',
              borderBottom: `2px solid ${tab === t.key ? '#2B8CFF' : 'transparent'}`,
              color: tab === t.key ? '#2B8CFF' : '#666666',
              backgroundColor: '#ffffff',
              borderRadius: 0,
            }}
          >
            {t.label}
          </Button>
        ))}
      </View>
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
      ) : filtered.length === 0 ? (
        <EmptyState
          title="暂无订单"
          description="快去逛逛有什么好物吧"
        />
      ) : (
        <ScrollView scrollY style={{ padding: '32rpx' }}>
          <View style={{ display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
            {filtered.map(o => (
              <OrderItem key={o.id} order={o} tab={tab} onRefresh={fetchOrders} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
