import { useEffect, useState, useCallback, useRef } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text, Button, ScrollView, Input, Textarea, Image } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { bargainService } from '@/services/bargainService';
import { getAssetUrl } from '@/services/api';
import { formatPrice, formatTime } from '@/utils/format';
import NavBar from '@/components/layout/NavBar';
import type { Bargain } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  pending: '进行中',
  accepted: '已成交',
  rejected: '已拒绝',
  expired: '已过期',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#2B8CFF',
  accepted: '#52C41A',
  rejected: '#FF4D4F',
  expired: '#999999',
};

type TabKey = 'all' | 'buyer' | 'seller';

export default function BargainListPage() {
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);
  const [bargains, setBargains] = useState<Bargain[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 还价弹窗状态
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerBargain, setOfferBargain] = useState<Bargain | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    // 防止并发/重复加载导致 loading 状态无法复位（真机常见）
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    // 兜底：无论如何 8 秒后强制关闭 loading，避免真机异常卡死
    const safetyTimer = setTimeout(() => {
      loadingRef.current = false;
      setLoading(false);
    }, 8000);
    try {
      const list = await bargainService.getList();
      setBargains(list);
    } catch (e: any) {
      showToast(e.message || '加载失败', 'error');
    } finally {
      clearTimeout(safetyTimer);
      loadingRef.current = false;
      setLoading(false);
    }
  }, [showToast]);

  useDidShow(load);

  const filtered = bargains.filter(b => {
    if (!user) return false;
    if (tab === 'buyer') return b.buyerId === user.id;
    if (tab === 'seller') return b.sellerId === user.id;
    return b.buyerId === user.id || b.sellerId === user.id;
  });

  const isSeller = (b: Bargain) => user?.id === b.sellerId;
  const isBuyer = (b: Bargain) => user?.id === b.buyerId;

  // 判断是否轮到当前用户回应
  const isMyTurn = (b: Bargain): boolean => {
    if (b.status !== 'pending' || !user) return false;
    const last = b.offers[b.offers.length - 1];
    if (!last) return false;
    return last.userId !== user.id;
  };

  const refreshList = (updated: Bargain) => {
    setBargains(prev => [updated, ...prev.filter(b => b.id !== updated.id)]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleAccept = async (b: Bargain) => {
    setActionLoading(b.id);
    try {
      const { orderId } = await bargainService.accept(b.id);
      const updated = await bargainService.getById(b.id);
      refreshList(updated);
      showToast('已接受，订单已生成', 'success');
      // 跳转到订单页
      setTimeout(() => {
        Taro.navigateTo({ url: `/pages/me-orders/index` });
      }, 600);
    } catch (e: any) {
      showToast(e.message || '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (b: Bargain) => {
    setActionLoading(b.id);
    try {
      const updated = await bargainService.reject(b.id);
      refreshList(updated);
      showToast('已拒绝', 'info');
    } catch (e: any) {
      showToast(e.message || '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openOfferModal = (b: Bargain) => {
    setOfferBargain(b);
    setOfferPrice('');
    setOfferMessage('');
    setShowOfferModal(true);
  };

  const submitOffer = async () => {
    if (!offerBargain) return;
    const price = Number(offerPrice);
    if (!price || price <= 0) {
      showToast('请输入有效价格', 'error');
      return;
    }
    setActionLoading(offerBargain.id);
    try {
      const updated = await bargainService.offer(offerBargain.id, price, offerMessage.trim() || undefined);
      refreshList(updated);
      showToast('出价已发送', 'success');
      setShowOfferModal(false);
    } catch (e: any) {
      showToast(e.message || '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const goProduct = (productId: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${productId}` });
  };

  const productImage = (b: Bargain) => {
    const imgs = b.product?.images || [];
    return imgs[0] ? getAssetUrl(imgs[0]) : '';
  };

  const renderOfferText = (b: Bargain, offerUserId: string) => {
    if (offerUserId === user?.id) return '我';
    return isSeller(b) ? '买家' : '卖家';
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="我的砍价" />

      {/* Tab 切换 */}
      <View style={{
        display: 'flex',
        backgroundColor: '#ffffff',
        padding: '16rpx 24rpx',
        gap: '8rpx',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}>
        {([
          { key: 'all', label: '全部' },
          { key: 'buyer', label: '我发起的' },
          { key: 'seller', label: '向我砍价的' },
        ] as { key: TabKey; label: string }[]).map(t => (
          <Button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              height: '68rpx',
              lineHeight: '68rpx',
              fontSize: '26rpx',
              fontWeight: 600,
              borderRadius: '16rpx',
              border: 'none',
              backgroundColor: tab === t.key ? '#2B8CFF' : '#F5F7FA',
              color: tab === t.key ? '#ffffff' : '#666666',
              transition: 'all 0.2s ease',
              padding: 0,
            }}
          >
            {t.label}
          </Button>
        ))}
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 88px - 48px - var(--safe-area-inset-top))' }}>
        <View style={{ padding: '24rpx', display: 'flex', flexDirection: 'column', gap: '20rpx' }}>
          {loading && bargains.length === 0 ? (
            <View style={{ display: 'flex', justifyContent: 'center', paddingTop: '64rpx' }}>
              <View style={{
                width: '24px', height: '24px',
                border: '2px solid #2B8CFF', borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', color: '#666666' }}>
              <Text style={{ fontSize: '96rpx', opacity: 0.3, marginBottom: '12px' }}>🔨</Text>
              <Text style={{ fontSize: '28rpx' }}>暂无砍价记录</Text>
              <Text style={{ fontSize: '24rpx', marginTop: '4px', color: '#999999' }}>在商品详情页可以对心仪商品发起砍价</Text>
            </View>
          ) : (
            filtered.map(b => {
              const myTurn = isMyTurn(b);
              const lastOffer = b.offers[b.offers.length - 1];
              const product = b.product;
              const other = isBuyer(b) ? b.seller : b.buyer;
              return (
                <View
                  key={b.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '28rpx',
                    padding: '28rpx',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* 顶部：商品 + 状态 */}
                  <View style={{ display: 'flex', alignItems: 'center', gap: '20rpx' }}>
                    <View
                      onClick={() => goProduct(b.productId)}
                      style={{ width: '112rpx', height: '112rpx', borderRadius: '16rpx', backgroundColor: '#F5F7FA', overflow: 'hidden', flexShrink: 0 }}
                    >
                      {productImage(b) ? (
                        <Image src={productImage(b)} mode="aspectFill" style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <View style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: '32rpx', opacity: 0.4 }}>📦</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{ fontSize: '28rpx', fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onClick={() => goProduct(b.productId)}
                      >
                        {product?.title || '商品'}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#999999', marginTop: '4rpx' }}>
                        {isBuyer(b) ? '卖家' : '买家'}：{other?.nickname || '未知用户'}
                      </Text>
                      <View style={{ display: 'flex', alignItems: 'baseline', gap: '8rpx', marginTop: '6rpx' }}>
                        <Text style={{ fontSize: '22rpx', color: '#999999' }}>原价</Text>
                        <Text style={{ fontSize: '22rpx', color: '#999999', textDecoration: 'line-through' }}>¥{formatPrice(b.originalPrice)}</Text>
                      </View>
                    </View>
                    <View style={{
                      paddingLeft: '16rpx', paddingRight: '16rpx', paddingTop: '6rpx', paddingBottom: '6rpx',
                      borderRadius: '9999px',
                      backgroundColor: b.status === 'pending' ? 'rgba(43,140,255,0.1)' : b.status === 'accepted' ? 'rgba(82,196,26,0.1)' : 'rgba(255,77,79,0.1)',
                    }}>
                      <Text style={{ fontSize: '22rpx', fontWeight: 600, color: STATUS_COLOR[b.status] }}>
                        {STATUS_LABEL[b.status]}
                      </Text>
                    </View>
                  </View>

                  {/* 当前价突出 */}
                  <View style={{
                    marginTop: '20rpx', padding: '20rpx', backgroundColor: '#F5F7FA', borderRadius: '16rpx',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Text style={{ fontSize: '24rpx', color: '#666666' }}>当前成交价</Text>
                    <Text style={{ fontSize: '40rpx', fontWeight: 700, color: '#2B8CFF' }}>¥{formatPrice(b.currentPrice)}</Text>
                  </View>

                  {/* 出价历史 */}
                  <View style={{ marginTop: '16rpx', display: 'flex', flexDirection: 'column', gap: '8rpx' }}>
                    {b.offers.slice(-4).map((offer, idx) => (
                      <View key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: '24rpx', color: '#666666' }}>
                          {renderOfferText(b, offer.userId)}出价
                          {offer.message ? ` · ${offer.message}` : ''}
                        </Text>
                        <Text style={{ fontSize: '26rpx', fontWeight: 600, color: offer.userId === user?.id ? '#2B8CFF' : '#1A1A1A' }}>
                          ¥{formatPrice(offer.price)}
                        </Text>
                      </View>
                    ))}
                    {b.offers.length > 4 && (
                      <Text style={{ fontSize: '22rpx', color: '#999999' }}>共 {b.offers.length} 次出价</Text>
                    )}
                  </View>

                  {/* 操作区 */}
                  {b.status === 'pending' && (
                    <View style={{ marginTop: '20rpx' }}>
                      {myTurn ? (
                        <View style={{ display: 'flex', gap: '12rpx' }}>
                          <Button
                            onClick={() => handleAccept(b)}
                            disabled={actionLoading === b.id}
                            style={{
                              flex: 1, height: '76rpx', lineHeight: '76rpx',
                              backgroundColor: '#2B8CFF', color: '#ffffff',
                              borderRadius: '16rpx', border: 'none', fontWeight: 600, fontSize: '26rpx',
                              opacity: actionLoading === b.id ? 0.5 : 1,
                            }}
                          >
                            {actionLoading === b.id ? '处理中...' : isBuyer(b) ? '接受还价并下单' : '接受砍价'}
                          </Button>
                          <Button
                            onClick={() => openOfferModal(b)}
                            disabled={actionLoading === b.id}
                            style={{
                              flex: 1, height: '76rpx', lineHeight: '76rpx',
                              border: '1px solid #2B8CFF', color: '#2B8CFF',
                              borderRadius: '16rpx', fontWeight: 600, fontSize: '26rpx', backgroundColor: '#ffffff',
                              opacity: actionLoading === b.id ? 0.5 : 1,
                            }}
                          >
                            {isBuyer(b) ? '继续砍' : '还价'}
                          </Button>
                          <Button
                            onClick={() => handleReject(b)}
                            disabled={actionLoading === b.id}
                            style={{
                              width: '76rpx', height: '76rpx', lineHeight: '76rpx',
                              border: '1px solid #FF4D4F', color: '#FF4D4F',
                              borderRadius: '16rpx', fontWeight: 600, backgroundColor: '#ffffff', padding: 0,
                              opacity: actionLoading === b.id ? 0.5 : 1,
                            }}
                          >
                            ✕
                          </Button>
                        </View>
                      ) : (
                        <View style={{
                          height: '76rpx', borderRadius: '16rpx', backgroundColor: '#F5F7FA',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Text style={{ fontSize: '26rpx', color: '#999999' }}>
                            {lastOffer ? `已${renderOfferText(b, lastOffer.userId)}出价 ¥${formatPrice(lastOffer.price)}，等待对方回应...` : '等待对方回应...'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {b.status === 'accepted' && isBuyer(b) && (
                    <View style={{ marginTop: '20rpx' }}>
                      <Button
                        onClick={() => Taro.navigateTo({ url: '/pages/me-orders/index' })}
                        style={{
                          width: '100%', height: '76rpx', lineHeight: '76rpx',
                          backgroundColor: '#52C41A', color: '#ffffff',
                          borderRadius: '16rpx', border: 'none', fontWeight: 600, fontSize: '26rpx',
                        }}
                      >
                        前往订单付款
                      </Button>
                    </View>
                  )}
                  {b.status === 'accepted' && isSeller(b) && (
                    <View style={{ marginTop: '16rpx' }}>
                      <Text style={{ fontSize: '24rpx', color: '#999999', textAlign: 'center', display: 'block' }}>
                        砍价已成交，等待买家付款
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* 还价弹窗 */}
      {showOfferModal && offerBargain && (
        <View style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => !actionLoading && setShowOfferModal(false)}
          />
          <View style={{
            position: 'relative', width: '100%', backgroundColor: '#ffffff',
            borderRadius: '24rpx 24rpx 0 0', padding: '32rpx',
            animation: 'slideInUp 0.3s ease',
          }}>
            <Text style={{ fontSize: '32rpx', fontWeight: 700, color: '#1A1A1A', marginBottom: '8rpx' }}>
              {isBuyer(offerBargain) ? '继续砍价' : '还价'}
            </Text>
            <Text style={{ fontSize: '24rpx', color: '#999999', marginBottom: '20rpx' }}>
              原价 ¥{formatPrice(offerBargain.originalPrice)} · 当前 ¥{formatPrice(offerBargain.currentPrice)}
            </Text>

            <View style={{ marginBottom: '16rpx' }}>
              <Text style={{ fontSize: '26rpx', color: '#666666', marginBottom: '8rpx' }}>
                {isBuyer(offerBargain) ? '你的出价（分，需低于当前价）' : '你的还价（分，需高于买家出价）'}
              </Text>
              <Input
                type="number"
                value={offerPrice}
                onInput={(e) => setOfferPrice(e.detail.value)}
                placeholder="输入价格（单位：分）"
                style={{
                  width: '100%', height: '88rpx', backgroundColor: '#F5F7FA',
                  borderRadius: '16rpx', paddingLeft: '24rpx', paddingRight: '24rpx',
                  fontSize: '32rpx', boxSizing: 'border-box',
                }}
              />
              <Text style={{ fontSize: '22rpx', color: '#999999', marginTop: '6rpx' }}>
                提示：1 元 = 100 分，例如输入 1500 表示 ¥15.00
              </Text>
            </View>

            <Textarea
              value={offerMessage}
              onInput={(e) => setOfferMessage(e.detail.value)}
              placeholder="给对方捎句话（选填）"
              maxlength={100}
              style={{
                width: '100%', height: '140rpx', backgroundColor: '#F5F7FA',
                borderRadius: '16rpx', padding: '16rpx', fontSize: '28rpx', boxSizing: 'border-box',
              }}
            />

            <View style={{ display: 'flex', gap: '16rpx', marginTop: '24rpx' }}>
              <Button
                onClick={() => setShowOfferModal(false)}
                disabled={!!actionLoading}
                style={{
                  flex: 1, height: '88rpx', lineHeight: '88rpx',
                  border: '1px solid #EEEEEE', borderRadius: '16rpx',
                  color: '#666666', backgroundColor: '#ffffff', fontSize: '28rpx',
                }}
              >
                取消
              </Button>
              <Button
                onClick={submitOffer}
                disabled={!!actionLoading || !offerPrice.trim()}
                style={{
                  flex: 1, height: '88rpx', lineHeight: '88rpx',
                  backgroundColor: '#2B8CFF', color: '#ffffff',
                  borderRadius: '16rpx', border: 'none', fontWeight: 600, fontSize: '28rpx',
                  opacity: actionLoading || !offerPrice.trim() ? 0.5 : 1,
                }}
              >
                {actionLoading ? '发送中...' : '确认发送'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
