import { useState, useEffect, useMemo, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Button, Input, ScrollView, Swiper, SwiperItem, Textarea } from '@tarojs/components';
import LazyImage from '@/components/shared/LazyImage';
import { productService } from '@/services/productService';
import { chatService } from '@/services/chatService';
import { bargainService } from '@/services/bargainService';
import { orderService } from '@/services/orderService';
import { reviewService } from '@/services/reviewService';
import { getUserById } from '@/services/mockData';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useOrderStore } from '@/stores/orderStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { uploadService } from '@/services/uploadService';
import { storage } from '@/services/storage';
import { formatPrice, formatTime, formatViews } from '@/utils/format';
import { CATEGORY_MAP } from '@/constants/categories';
import { CONDITION_MAP } from '@/constants/conditions';
import { TRADE_METHOD_MAP } from '@/constants/tradeMethods';
import { getPageParams } from '@/utils/nav';
import { showConfirm, showPrompt } from '@/utils/taro';
import { getAssetUrl } from '@/services/api';
import NavBar from '@/components/layout/NavBar';
import ReviewModal from '@/components/shared/ReviewModal';
import StarRating from '@/components/shared/StarRating';
import type { Product, User, Order, Review } from '@/types';

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '待确认',
  accepted: '等待发货',
  shipped: '已发货',
  received: '已收货',
  completed: '已完成',
  cancelled: '已取消',
};

export default function ProductDetailPage() {
  const params = getPageParams();
  const id = params.id;
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);
  const { getOrCreateConversation } = useChatStore();
  const { createOrder } = useOrderStore();
  const { add: addToCart, isInCart, count: cartCount } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showWantModal, setShowWantModal] = useState(false);
  const [wantMessage, setWantMessage] = useState('');
  const [showBargainModal, setShowBargainModal] = useState(false);
  const [bargainPrice, setBargainPrice] = useState('');
  const [bargainMessage, setBargainMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [sellerCompletedCount, setSellerCompletedCount] = useState(0);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const getImageUrl = useCallback((imageId: string) => {
    return getAssetUrl(imageId);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService.getById(id).then(p => {
      setProduct(p);
      if (p) {
        const s = p.seller || getUserById(p.sellerId);
        setSeller(s || null);

        // Record browse history
        const history = storage.get<string[]>('history') || [];
        const filtered = history.filter(h => h !== p.id);
        filtered.unshift(p.id);
        storage.set('history', filtered.slice(0, 50));

        // Check if favorited
        const favs = storage.get<Record<string, string[]>>('favorites') || {};
        const userFavs: string[] = favs[user?.id || ''] || [];
        setIsFavorited(userFavs.includes(p.id));

        // Check for existing order
        if (user && user.id !== p.sellerId) {
          orderService.getByUser('buy').then(orders => {
            const existing = orders.find((o: Order) => o.productId === p.id && o.status !== 'cancelled' && o.status !== 'completed');
            setExistingOrder(existing || null);
          });
        }
      }
      setLoading(false);
    });
  }, [id, user]);

  // Fetch seller's orders for this product
  useEffect(() => {
    if (product && user?.id === product.sellerId) {
      const orders = storage.get<Order[]>('orders') || [];
      setSellerOrders(orders.filter((o: Order) => o.productId === product.id && o.status !== 'cancelled'));
    }
  }, [product, user]);

  // Load reviews for this product and update seller rating / completed count
  useEffect(() => {
    if (!product) return;
    reviewService.getByProduct(product.id).then(setReviews);
    reviewService.getByTarget(product.sellerId).then(() => {
      setSeller(product.seller || getUserById(product.sellerId) || null);
    });

    const allOrders = storage.get<Order[]>('orders') || [];
    const completed = allOrders.filter(o => o.sellerId === product.sellerId && o.status === 'completed').length;
    setSellerCompletedCount(completed);
  }, [product]);

  const toggleFavorite = useCallback(() => {
    if (!user || !product) return;
    const favs = storage.get<Record<string, string[]>>('favorites') || {};
    const userFavs: string[] = favs[user.id] || [];

    if (isFavorited) {
      favs[user.id] = userFavs.filter((pid: string) => pid !== product.id);
      setIsFavorited(false);
      showToast('已取消收藏', 'info');
    } else {
      favs[user.id] = [...userFavs, product.id];
      setIsFavorited(true);
      showToast('已收藏', 'success');
      // 触发心跳动画
      setHeartAnimating(true);
      setTimeout(() => setHeartAnimating(false), 600);
    }
    storage.set('favorites', favs);
  }, [user, product, isFavorited, showToast]);

  const handleImageClick = useCallback((idx: number) => {
    if (!product) return;
    Taro.previewImage({
      current: getImageUrl(product.images[idx]),
      urls: product.images.map(getImageUrl),
    });
  }, [product, getImageUrl]);

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <NavBar title="商品详情" transparent={false} />
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <View style={{ width: '100%', paddingBottom: '80%', backgroundColor: '#e5e5e5', borderRadius: '16px' }} />
          <View style={{ height: '32px', width: '75%', backgroundColor: '#e5e5e5', borderRadius: '4px' }} />
          <View style={{ height: '20px', width: '33%', backgroundColor: '#e5e5e5', borderRadius: '4px' }} />
          <View style={{ height: '96px', width: '100%', backgroundColor: '#e5e5e5', borderRadius: '12px' }} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <NavBar title="商品详情" transparent={false} />
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px' }}>
          <Text style={{ fontSize: '14px', color: '#666666' }}>商品不存在或已下架</Text>
        </View>
      </View>
    );
  }

  const isOwner = user?.id === product.sellerId;
  const images = product.images;

  const handleWant = async () => {
    if (!user) return;
    if (isOwner) { showToast('这是您自己的商品', 'info'); return; }
    if (!wantMessage.trim()) { showToast('请填写留言', 'error'); return; }

    setSubmitting(true);
    try {
      const order = await createOrder(product.id, wantMessage.trim(), product.price);
      setExistingOrder(order);

      const conv = await getOrCreateConversation(product.id);
      await chatService.sendMessage({
        conversationId: conv.id,
        type: 'text',
        content: `我对您的商品「${product.title}」感兴趣！\n\n留言：${wantMessage.trim()}\n\n—— 来自"我想要"`,
      });
      Taro.navigateTo({ url: `/pages/chat-detail/index?conversationId=${conv.id}` });

      // Notify seller
      const notifs = storage.get<any[]>('notifications') || [];
      notifs.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        userId: product.sellerId,
        type: 'order',
        title: '收到新的购买意向',
        body: `买家对「${product.title}」感兴趣，留言：${wantMessage.trim()}`,
        relatedId: order.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      storage.set('notifications', notifs);

      showToast('意向已发送，请在下方确认下单', 'success');
      setShowWantModal(false);
      setWantMessage('');
    } catch (e) {
      showToast('操作失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!existingOrder || !user) return;
    setOrderLoading(true);
    try {
      await orderService.updateStatus(existingOrder.id, 'accepted');
      setExistingOrder({ ...existingOrder, status: 'accepted' });

      // Notify seller
      const notifs = storage.get<any[]>('notifications') || [];
      notifs.unshift({
        id: Date.now().toString(36),
        userId: product.sellerId,
        type: 'order',
        title: '买家已下单',
        body: `您的商品「${product.title}」已被下单，请尽快处理`,
        relatedId: existingOrder.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      storage.set('notifications', notifs);

      showToast('下单成功，等待卖家发货', 'success');
    } catch (e) {
      showToast('操作失败', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleShip = async () => {
    if (!existingOrder || !user) return;
    setOrderLoading(true);
    try {
      await orderService.updateStatus(existingOrder.id, 'shipped');
      setExistingOrder({ ...existingOrder, status: 'shipped' });

      // Notify buyer
      const notifs = storage.get<any[]>('notifications') || [];
      notifs.unshift({
        id: Date.now().toString(36),
        userId: existingOrder.buyerId,
        type: 'order',
        title: '卖家已发货',
        body: `您的订单「${product.title}」已发货，请留意收货`,
        relatedId: existingOrder.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      storage.set('notifications', notifs);

      showToast('已确认发货', 'success');
    } catch (e) {
      showToast('操作失败', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleChatNow = async () => {
    if (!user || !product) return;
    if (isOwner) { showToast('不能和自己聊天', 'info'); return; }
    const conv = await getOrCreateConversation(product.id);
    Taro.navigateTo({ url: `/pages/chat-detail/index?conversationId=${conv.id}` });
  };

  const handleBargain = async () => {
    if (!user || !product) return;
    if (isOwner) { showToast('不能砍价自己的商品', 'info'); return; }
    const price = Number(bargainPrice);
    if (!price || price <= 0 || price >= product.price) {
      showToast('请输入合理的砍价金额', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await bargainService.create(product.id, price, bargainMessage);
      // 同步发送一条聊天消息通知卖家
      try {
        const conv = await getOrCreateConversation(product.id);
        await chatService.sendMessage({
          conversationId: conv.id,
          type: 'bargain',
          content: `我对商品「${product.title}」发起砍价：¥${formatPrice(price)}`,
        });
      } catch { /* 聊天通知失败不影响砍价流程 */ }
      showToast('砍价已发起，等待卖家回应', 'success');
      setShowBargainModal(false);
      setBargainPrice('');
      setBargainMessage('');
      // 跳转到砍价列表页进行后续还价/接受交互
      Taro.navigateTo({ url: '/pages/bargains/index' });
    } catch (e: any) {
      showToast(e.message || '砍价失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!existingOrder || !user || !product) return;
    const res = await showPrompt('取消订单', '确定要取消订单吗？可填写原因（选填）：');
    if (!res.confirm) return;
    const reason = res.value || undefined;
    setOrderLoading(true);
    try {
      await orderService.cancelOrder(existingOrder.id, reason);
      setExistingOrder({ ...existingOrder, status: 'cancelled' });

      const notifs = storage.get<any[]>('notifications') || [];
      notifs.unshift({
        id: Date.now().toString(36),
        userId: product.sellerId,
        type: 'order',
        title: '买家已取消订单',
        body: `订单「${product.title}」已被取消${reason ? `，原因：${reason}` : ''}`,
        relatedId: existingOrder.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      storage.set('notifications', notifs);

      showToast('订单已取消', 'success');
    } catch (e: any) {
      showToast(e.message || '操作失败', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!existingOrder || !user) return;
    setOrderLoading(true);
    try {
      await orderService.updateStatus(existingOrder.id, 'completed');
      setExistingOrder({ ...existingOrder, status: 'completed' });

      // Mark product as sold
      await productService.markAsSold(product.id);
      setProduct({ ...product, status: 'sold' });

      // Show review modal after successful receipt
      const alreadyReviewed = await reviewService.hasReviewed(existingOrder.id, user.id);
      if (!alreadyReviewed) {
        setShowReviewModal(true);
      }

      showToast('已确认收货，交易完成！', 'success');
    } catch (e) {
      showToast('操作失败', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!existingOrder || !user || !product || !seller) return;
    setReviewSubmitting(true);
    try {
      await reviewService.create({
        orderId: existingOrder.id,
        productId: product.id,
        reviewerId: user.id,
        targetId: seller.id,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        comment,
      });
      // Refresh reviews and seller rating
      const [productReviews] = await Promise.all([
        reviewService.getByProduct(product.id),
        reviewService.getByTarget(seller.id),
      ]);
      setReviews(productReviews);
      setSeller(product.seller || getUserById(seller.id) || null);
      setShowReviewModal(false);
      showToast('评价提交成功', 'success');
    } catch (e) {
      showToast('评价提交失败', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderBottomBar = () => {
    // Owner viewing own product
    if (isOwner) {
      return (
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            className="hover-scale"
            onClick={() => Taro.navigateTo({ url: '/pages/publish-edit/index?id=' + product.id })}
            style={{
              flex: 1,
              height: '96rpx',
              lineHeight: '96rpx',
              border: '1px solid #667eea',
              color: '#667eea',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '16px',
              backgroundColor: '#ffffff',
              transition: 'all 0.3s ease',
            }}
          >
            编辑商品
          </Button>
          <Button
            className="hover-scale"
            onClick={async () => {
              const confirmed = await showConfirm('下架商品', '确定下架该商品？');
              if (confirmed) {
                await productService.markAsOffline(product.id);
                showToast('已下架', 'success');
                Taro.navigateTo({ url: '/pages/me-products/index' });
              }
            }}
            style={{
              flex: 1,
              height: '96rpx',
              lineHeight: '96rpx',
              backgroundColor: '#f5f5f5',
              color: '#666666',
              borderRadius: '16px',
              fontWeight: 600,
              border: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            下架
          </Button>
        </View>
      );
    }

    // Buyer has an existing order
    if (existingOrder) {
      const status = existingOrder.status;
      const statusSteps = ['pending', 'accepted', 'shipped', 'completed'];
      const statusLabels: Record<string, string> = {
        pending: '待确认',
        accepted: '待发货',
        shipped: '已发货',
        completed: '已完成',
      };
      const currentIdx = statusSteps.indexOf(status);
      return (
        <View>
          {/* Order status tracker with animations */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
            {statusSteps.map((s, i) => {
              const isDone = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <View key={s} style={{ display: 'flex', alignItems: 'center' }}>
                  <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <View
                      className={isCurrent ? 'animate-pulse' : ''}
                      style={{
                        width: '40rpx',
                        height: '40rpx',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDone ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e5e5',
                        background: isDone ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e5e5',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(102, 126, 234, 0.3)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Text style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: isDone ? '#ffffff' : '#999999',
                      }}>
                        {isDone ? '✓' : i + 1}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: '10px',
                      marginTop: '2px',
                      color: isDone ? '#667eea' : '#999999',
                      whiteSpace: 'nowrap',
                      fontWeight: isCurrent ? 'bold' : 'normal',
                    }}>
                      {statusLabels[s]}
                    </Text>
                  </View>
                  {i < 3 && (
                    <View style={{
                      width: '24px',
                      height: '3px',
                      marginLeft: '2px',
                      marginRight: '2px',
                      borderRadius: '2px',
                      background: i < currentIdx ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : i === currentIdx ? 'linear-gradient(90deg, #667eea 30%, #e5e5e5 70%)' : '#e5e5e5',
                      transition: 'all 0.3s ease',
                    }} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Action buttons */}
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {status === 'pending' && (
              <>
                <Button
                  className="hover-scale"
                  onClick={handleConfirmOrder}
                  disabled={orderLoading}
                  style={{
                    flex: 1,
                    height: '96rpx',
                    lineHeight: '96rpx',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    borderRadius: '16px',
                    fontWeight: 600,
                    fontSize: '16px',
                    border: 'none',
                    opacity: orderLoading ? 0.5 : 1,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {orderLoading ? '处理中...' : '确认下单'}
                </Button>
                <Button
                  className="hover-scale"
                  onClick={handleCancelOrder}
                  disabled={orderLoading}
                  style={{
                    flex: 1,
                    height: '96rpx',
                    lineHeight: '96rpx',
                    border: '1px solid #FF4D4F',
                    color: '#FF4D4F',
                    borderRadius: '16px',
                    fontWeight: 600,
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    opacity: orderLoading ? 0.5 : 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  取消订单
                </Button>
              </>
            )}
            {status === 'accepted' && (
              <View style={{
                flex: 1,
                height: '96rpx',
                backgroundColor: '#f5f5f5',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: '14px', color: '#666666' }}>等待卖家发货...</Text>
              </View>
            )}
            {status === 'shipped' && (
              <Button
                className="hover-scale"
                onClick={handleConfirmReceived}
                disabled={orderLoading}
                style={{
                  width: '100%',
                  height: '96rpx',
                  lineHeight: '96rpx',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  borderRadius: '16px',
                  fontWeight: 600,
                  fontSize: '16px',
                  border: 'none',
                  opacity: orderLoading ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                {orderLoading ? '处理中...' : '确认收货'}
              </Button>
            )}
            {status === 'completed' && (
              <View style={{
                flex: 1,
                height: '96rpx',
                backgroundColor: '#e6f2ff',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: '14px', color: '#667eea', fontWeight: 'bold' }}>交易已完成 ✓</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    // No existing order, show chat + cart + bargain + want buttons
    const inCart = isInCart(product.id);
    return (
      <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <View
          className="hover-scale"
          onClick={handleChatNow}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96rpx',
            height: '96rpx',
            borderRadius: '16px',
            border: '1px solid #EEEEEE',
            backgroundColor: '#ffffff',
            transition: 'all 0.3s ease',
          }}
        >
          <Text style={{ fontSize: '20px', color: '#666666' }}>💬</Text>
          <Text style={{ fontSize: '10px', marginTop: '2px', color: '#666666' }}>聊一聊</Text>
        </View>
        <View
          className="hover-scale"
          onClick={() => { if (!inCart) { addToCart(product.id); showToast('已加入购物车', 'success'); } }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96rpx',
            height: '96rpx',
            borderRadius: '16px',
            border: '1px solid #EEEEEE',
            backgroundColor: inCart ? '#f5f5f5' : '#ffffff',
            transition: 'all 0.3s ease',
          }}
        >
          <Text style={{ fontSize: '20px', color: '#666666' }}>🛒</Text>
          <Text style={{ fontSize: '10px', marginTop: '2px', color: '#666666' }}>{inCart ? '已加购' : '加购'}</Text>
        </View>
        <Button
          className="hover-scale"
          onClick={() => setShowBargainModal(true)}
          style={{
            flex: 1,
            height: '96rpx',
            lineHeight: '96rpx',
            border: '1px solid #667eea',
            color: '#667eea',
            borderRadius: '16px',
            fontWeight: 600,
            fontSize: '16px',
            backgroundColor: '#ffffff',
            transition: 'all 0.3s ease',
          }}
        >
          砍价
        </Button>
        <Button
          className="hover-scale"
          onClick={() => setShowWantModal(true)}
          style={{
            flex: 1,
            height: '96rpx',
            lineHeight: '96rpx',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            fontWeight: 600,
            fontSize: '16px',
            border: 'none',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          我想要
        </Button>
      </View>
    );
  };

  const sellerOrder = sellerOrders[0]; // Most recent active order

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', position: 'relative' }}>
      {/* Transparent NavBar with white icons */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <NavBar
          dark
          transparent
          rightAction={
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View onClick={() => Taro.switchTab({ url: '/pages/cart/index' })} style={{ position: 'relative', padding: '4px' }}>
                <Text style={{ fontSize: '44rpx' }}>🛒</Text>
                {cartCount() > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '32rpx',
                    height: '32rpx',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '2px',
                    paddingRight: '2px',
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: '20rpx', fontWeight: 'bold' }}>
                      {cartCount() > 99 ? '99+' : cartCount()}
                    </Text>
                  </View>
                )}
              </View>
              <View onClick={() => Taro.navigateTo({ url: '/pages/report/index?targetType=product&targetId=' + product.id })} style={{ padding: '4px' }}>
                <Text style={{ fontSize: '44rpx' }}>⚠️</Text>
              </View>
              <View onClick={toggleFavorite} style={{ padding: '4px' }}>
                <Text
                  className={heartAnimating ? 'animate-heartbeat' : ''}
                  style={{
                    fontSize: '44rpx',
                    display: 'inline-block',
                  }}
                >
                  {isFavorited ? '❤️' : '🤍'}
                </Text>
              </View>
            </View>
          }
        />
      </View>

      <ScrollView scrollY style={{ height: '100vh', backgroundColor: '#F5F7FA', paddingBottom: '112px' }}>
        {/* Image carousel with fade animation */}
        <View
          style={{
            position: 'relative',
            backgroundColor: '#f5f5f5',
            borderRadius: '0 0 64rpx 64rpx',
            overflow: 'hidden',
            height: '750rpx',
          }}
        >
          {images.length > 0 ? (
            <>
              <Swiper
                current={currentImage}
                onChange={(e) => setCurrentImage(e.detail.current)}
                indicatorDots={images.length > 1}
                indicatorColor="rgba(255,255,255,0.5)"
                indicatorActiveColor="#ffffff"
                autoplay
                interval={3000}
                circular
                duration={500}
                style={{ height: '100%' }}
              >
                {images.map((img, idx) => (
                  <SwiperItem key={idx}>
                    <View
                      style={{ width: '100%', height: '100%' }}
                      onClick={() => handleImageClick(idx)}
                    >
                      <LazyImage
                        src={getImageUrl(img)}
                        mode="aspectFill"
                        showLoadingSpinner={false}
                      />
                    </View>
                  </SwiperItem>
                ))}
              </Swiper>
              <View style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '9999px',
                paddingLeft: '10px',
                paddingRight: '10px',
                paddingTop: '4px',
                paddingBottom: '4px',
              }}>
                <Text style={{ color: '#ffffff', fontSize: '24rpx' }}>
                  {currentImage + 1} / {images.length}
                </Text>
              </View>
            </>
          ) : (
            <View style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '48px', color: '#cccccc' }}>🖼️</Text>
            </View>
          )}
        </View>

        {/* Price & Title card overlapping image */}
        <View style={{
          backgroundColor: '#ffffff',
          padding: '36rpx',
          marginTop: '-64rpx',
          marginLeft: '32rpx',
          marginRight: '32rpx',
          borderRadius: '32rpx',
          position: 'relative',
          zIndex: 10,
        }}>
          <View style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <Text style={{
              fontSize: '56rpx',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '56rpx',
            }}>¥{formatPrice(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={{ fontSize: '14px', color: '#666666', textDecoration: 'line-through' }}>¥{formatPrice(product.originalPrice)}</Text>
            )}
            {product.status === 'sold' && (
              <View style={{ marginLeft: 'auto', paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px', backgroundColor: '#f5f5f5', borderRadius: '9999px' }}>
                <Text style={{ fontSize: '12px', color: '#666666', fontWeight: 500 }}>已售出</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: '36rpx', fontWeight: 'bold', color: '#1A1A1A', marginTop: '12px', lineHeight: '48rpx' }}>{product.title}</Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            <View style={{ paddingLeft: '24rpx', paddingRight: '24rpx', paddingTop: '8rpx', paddingBottom: '8rpx', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: '9999px' }}>
              <Text style={{ fontSize: '12px', color: '#667eea', fontWeight: 500 }}>{CATEGORY_MAP[product.category]}</Text>
            </View>
            <View style={{ paddingLeft: '24rpx', paddingRight: '24rpx', paddingTop: '8rpx', paddingBottom: '8rpx', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: '9999px' }}>
              <Text style={{ fontSize: '12px', color: '#667eea', fontWeight: 500 }}>{CONDITION_MAP[product.condition]}</Text>
            </View>
            <View style={{ paddingLeft: '24rpx', paddingRight: '24rpx', paddingTop: '8rpx', paddingBottom: '8rpx', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: '9999px' }}>
              <Text style={{ fontSize: '12px', color: '#667eea', fontWeight: 500 }}>{TRADE_METHOD_MAP[product.tradeMethod]}</Text>
            </View>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            <Text style={{ fontSize: '12px', color: '#666666' }}>{formatTime(product.createdAt)}</Text>
            <Text style={{ fontSize: '12px', color: '#666666' }}>{formatViews(product.views)} 浏览</Text>
            <Text style={{ fontSize: '12px', color: '#666666' }}>{product.favorites} 收藏</Text>
          </View>
        </View>

        {/* Description */}
        <View style={{
          backgroundColor: '#ffffff',
          marginTop: '12px',
          marginLeft: '32rpx',
          marginRight: '32rpx',
          borderRadius: '16px',
          padding: '28rpx 36rpx',
        }}>
          <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '12px' }}>商品描述</Text>
          <Text style={{ fontSize: '14px', color: '#666666', lineHeight: '22px', whiteSpace: 'pre-wrap' }}>{product.description}</Text>
          {product.location && (
            <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
              <Text style={{ fontSize: '14px', color: '#666666' }}>📍</Text>
              <Text style={{ fontSize: '12px', color: '#666666' }}>{product.location}</Text>
            </View>
          )}
        </View>

        {/* Seller card */}
        {seller && (
          <View style={{
            backgroundColor: '#ffffff',
            marginTop: '12px',
            marginLeft: '32rpx',
            marginRight: '32rpx',
            borderRadius: '16px',
            padding: '28rpx 36rpx',
          }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View style={{
                width: '108rpx',
                height: '108rpx',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                {seller.avatar ? (
                  <Image src={seller.avatar} mode="aspectFill" style={{ width: '108rpx', height: '108rpx', borderRadius: '50%' }} />
                ) : (
                  <Text style={{ color: '#667eea', fontWeight: 'bold', fontSize: '20px' }}>{seller.nickname[0]}</Text>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text style={{ fontWeight: 'bold', color: '#1A1A1A', fontSize: '32rpx' }}>{seller.nickname}</Text>
                  {seller.verified && (
                    <View style={{
                      width: '28rpx',
                      height: '28rpx',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>{seller.school} · {seller.department}</Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <StarRating rating={seller.rating || 5} size={14} />
                  <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#1A1A1A' }}>{seller.rating?.toFixed(1) || '5.0'}</Text>
                  <Text style={{ fontSize: '12px', color: '#666666' }}>卖家评分</Text>
                  <Text style={{ fontSize: '12px', color: '#666666' }}>·</Text>
                  <Text style={{ fontSize: '12px', color: '#666666' }}>已售 {sellerCompletedCount} 件</Text>
                </View>
              </View>
              {!isOwner && (
                <Button
                  className="hover-scale"
                  onClick={async () => {
                    const conv = await getOrCreateConversation(product.id);
                    Taro.navigateTo({ url: `/pages/chat-detail/index?conversationId=${conv.id}` });
                  }}
                  style={{
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    border: '1px solid #667eea',
                    color: '#667eea',
                    fontSize: '12px',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease',
                  }}
                >
                  联系卖家
                </Button>
              )}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View style={{
          backgroundColor: '#ffffff',
          marginTop: '12px',
          marginLeft: '32rpx',
          marginRight: '32rpx',
          borderRadius: '16px',
          padding: '28rpx 36rpx',
        }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#1A1A1A' }}>交易评价</Text>
            {reviews.length > 0 ? (
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StarRating rating={reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length} size={12} />
                <Text style={{ fontSize: '12px', color: '#666666' }}>
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} · 共 {reviews.length} 条
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: '12px', color: '#666666' }}>暂无评价</Text>
            )}
          </View>
          {reviews.length > 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.slice(0, 3).map(review => {
                const reviewer = getUserById(review.reviewerId);
                return (
                  <View key={review.id} style={{ borderBottom: '1px solid #EEEEEE', paddingBottom: '12px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <View style={{
                          width: '56rpx',
                          height: '56rpx',
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{ color: '#667eea', fontSize: '12px', fontWeight: 'bold' }}>{reviewer?.nickname?.[0] || '?'}</Text>
                        </View>
                        <Text style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 500 }}>{reviewer?.nickname || '匿名'}</Text>
                      </View>
                      <StarRating rating={review.rating} size={12} />
                    </View>
                    {review.comment && <Text style={{ fontSize: '14px', color: '#666666', marginTop: '6px' }}>{review.comment}</Text>}
                    <Text style={{ fontSize: '11px', color: '#999999', marginTop: '4px' }}>{formatTime(review.createdAt)}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ fontSize: '14px', color: '#666666', paddingTop: '16px', paddingBottom: '16px', textAlign: 'center' }}>暂无评价，购买交易完成后可评价</Text>
          )}
        </View>

        {/* Seller: show orders for this product */}
        {isOwner && sellerOrder && (
          <View style={{
            backgroundColor: '#ffffff',
            marginTop: '12px',
            marginLeft: '32rpx',
            marginRight: '32rpx',
            borderRadius: '16px',
            padding: '28rpx 36rpx',
          }}>
            <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '12px' }}>订单管理</Text>
            <View style={{ backgroundColor: '#F5F7FA', borderRadius: '12px', padding: '12px' }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '12px', color: '#666666' }}>买家: {getUserById(sellerOrder.buyerId)?.nickname || '未知'}</Text>
                <View style={{
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  borderRadius: '9999px',
                  backgroundColor: sellerOrder.status === 'accepted' ? '#e6f2ff' : sellerOrder.status === 'shipped' ? '#fff9e6' : sellerOrder.status === 'completed' ? '#e6f7e6' : '#f5f5f5',
                }}>
                  <Text style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: sellerOrder.status === 'accepted' ? '#667eea' : sellerOrder.status === 'shipped' ? '#d4a000' : sellerOrder.status === 'completed' ? '#22a722' : '#666666',
                  }}>
                    {ORDER_STATUS_LABEL[sellerOrder.status]}
                  </Text>
                </View>
              </View>
              {sellerOrder.message && <Text style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>留言: {sellerOrder.message}</Text>}
              <View style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {sellerOrder.status === 'accepted' && (
                  <Button
                    className="hover-scale"
                    onClick={handleShip}
                    disabled={orderLoading}
                    style={{
                      flex: 1,
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      fontSize: '14px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      border: 'none',
                      opacity: orderLoading ? 0.5 : 1,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {orderLoading ? '处理中...' : '确认发货'}
                  </Button>
                )}
                {sellerOrder.status === 'shipped' && (
                  <View style={{
                    flex: 1,
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: '14px', color: '#666666' }}>等待买家收货</Text>
                  </View>
                )}
                {sellerOrder.status === 'completed' && (
                  <View style={{
                    flex: 1,
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    backgroundColor: '#e6f2ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: '14px', color: '#667eea', fontWeight: 'bold' }}>交易已完成</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom fixed bar with glass effect */}
      <View
        className="glass-effect"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderTop: '1px solid rgba(238, 238, 238, 0.5)',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingTop: '24rpx',
          zIndex: 40,
          paddingBottom: 'calc(24rpx + env(safe-area-inset-bottom))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <View style={{ maxWidth: '512px', marginLeft: 'auto', marginRight: 'auto' }}>
          {renderBottomBar()}
        </View>
      </View>

      {/* Want modal */}
      {showWantModal && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onClick={() => setShowWantModal(false)}
          />
          <View
            className="animate-slideInUp"
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '16px 16px 0 0',
              padding: '20px',
            }}
          >
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '16px' }}>发送意向</Text>
            <Textarea
              value={wantMessage}
              onInput={(e) => setWantMessage(e.detail.value)}
              placeholder="写一段留言给卖家吧（如：什么时候方便交易？）"
              maxlength={200}
              style={{
                width: '100%',
                height: '224rpx',
                backgroundColor: '#f5f5f5',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '32rpx',
                boxSizing: 'border-box',
              }}
            />
            <View style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button
                className="hover-scale"
                onClick={() => setShowWantModal(false)}
                style={{
                  flex: 1,
                  height: '96rpx',
                  lineHeight: '96rpx',
                  border: '1px solid #EEEEEE',
                  borderRadius: '16px',
                  color: '#666666',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.3s ease',
                }}
              >
                取消
              </Button>
              <Button
                className="hover-scale"
                onClick={handleWant}
                disabled={submitting || !wantMessage.trim()}
                style={{
                  flex: 1,
                  height: '96rpx',
                  lineHeight: '96rpx',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  borderRadius: '16px',
                  fontWeight: 600,
                  border: 'none',
                  opacity: submitting || !wantMessage.trim() ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                {submitting ? '发送中...' : '确认发送'}
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* Bargain modal */}
      {showBargainModal && product && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onClick={() => setShowBargainModal(false)}
          />
          <View
            className="animate-slideInUp"
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '16px 16px 0 0',
              padding: '20px',
            }}
          >
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '16px' }}>我要砍价</Text>
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '28rpx', color: '#666666', marginBottom: '8rpx' }}>当前价：¥{formatPrice(product.price)}</Text>
              <Input
                type="number"
                value={bargainPrice}
                onInput={(e) => setBargainPrice(e.detail.value)}
                placeholder="输入你的期望价格（分）"
                style={{
                  width: '100%',
                  height: '88rpx',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  fontSize: '32rpx',
                  boxSizing: 'border-box',
                }}
              />
              <Text style={{ fontSize: '22rpx', color: '#999999', marginTop: '6rpx', display: 'block' }}>
                提示：1 元 = 100 分，例如输入 1500 表示 ¥15.00
              </Text>
            </View>
            <Textarea
              value={bargainMessage}
              onInput={(e) => setBargainMessage(e.detail.value)}
              placeholder="给卖家捎句话（选填）"
              maxlength={200}
              style={{
                width: '100%',
                height: '160rpx',
                backgroundColor: '#f5f5f5',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '32rpx',
                boxSizing: 'border-box',
              }}
            />
            <View style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button
                className="hover-scale"
                onClick={() => setShowBargainModal(false)}
                style={{
                  flex: 1,
                  height: '96rpx',
                  lineHeight: '96rpx',
                  border: '1px solid #EEEEEE',
                  borderRadius: '16px',
                  color: '#666666',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.3s ease',
                }}
              >
                取消
              </Button>
              <Button
                className="hover-scale"
                onClick={handleBargain}
                disabled={submitting || !bargainPrice.trim()}
                style={{
                  flex: 1,
                  height: '96rpx',
                  lineHeight: '96rpx',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  borderRadius: '16px',
                  fontWeight: 600,
                  border: 'none',
                  opacity: submitting || !bargainPrice.trim() ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                {submitting ? '发送中...' : '确认砍价'}
              </Button>
            </View>
          </View>
        </View>
      )}

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