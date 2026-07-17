import { useState, useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Button, ScrollView, MovableArea, MovableView } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { orderService } from '@/services/orderService';
import { getUserById } from '@/services/mockData';
import { uploadService } from '@/services/uploadService';
import { storage } from '@/services/storage';
import { formatPrice } from '@/utils/format';
import { EmptyState } from '@/components/shared/Feedback';
import NavBar from '@/components/layout/NavBar';
import type { Product } from '@/types';

interface CartItemState {
  quantity: number;
  selected: boolean;
}

export default function CartPage() {
  const user = useAuthStore(s => s.user);
  const { items, remove } = useCartStore();
  const showToast = useUIStore(s => s.showToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itemStates, setItemStates] = useState<Record<string, CartItemState>>({});
  const [animatingQuantities, setAnimatingQuantities] = useState<Record<string, boolean>>({});
  const [selectAllAnimating, setSelectAllAnimating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const all = storage.get<Product[]>('products') || [];
      const cartProducts = all.filter(p => items.includes(p.id));
      setProducts(cartProducts);
      const states: Record<string, CartItemState> = {};
      cartProducts.forEach(p => { states[p.id] = { quantity: 1, selected: true }; });
      setItemStates(states);
      setLoading(false);
    };
    load();
  }, [items]);

  const total = useMemo(() => products.reduce((sum, p) => {
    const state = itemStates[p.id];
    return state?.selected ? sum + p.price * state.quantity : sum;
  }, 0), [products, itemStates]);

  const selectedCount = useMemo(() => products.filter(p => itemStates[p.id]?.selected).length, [products, itemStates]);
  const isAllSelected = useMemo(() => products.length > 0 && products.every(p => itemStates[p.id]?.selected), [products, itemStates]);

  const toggleSelect = (productId: string) => {
    setItemStates(prev => ({ ...prev, [productId]: { ...prev[productId], selected: !prev[productId]?.selected } }));
  };

  const toggleSelectAll = () => {
    setSelectAllAnimating(true);
    setTimeout(() => setSelectAllAnimating(false), 300);
    const newSelected = !isAllSelected;
    const newStates: Record<string, CartItemState> = {};
    products.forEach(p => { newStates[p.id] = { ...itemStates[p.id], selected: newSelected }; });
    setItemStates(newStates);
  };

  const animateQuantity = (productId: string) => {
    setAnimatingQuantities(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => setAnimatingQuantities(prev => ({ ...prev, [productId]: false })), 200);
  };

  const increaseQuantity = (productId: string) => {
    animateQuantity(productId);
    setItemStates(prev => ({ ...prev, [productId]: { ...prev[productId], quantity: (prev[productId]?.quantity || 1) + 1 } }));
  };

  const decreaseQuantity = (productId: string) => {
    const currentQty = itemStates[productId]?.quantity || 1;
    if (currentQty > 1) {
      animateQuantity(productId);
      setItemStates(prev => ({ ...prev, [productId]: { ...prev[productId], quantity: currentQty - 1 } }));
    }
  };

  const handleCheckout = async () => {
    if (!user) return;
    const selectedProducts = products.filter(p => itemStates[p.id]?.selected);
    if (selectedProducts.length === 0) { showToast('请选择要结算的商品', 'error'); return; }
    setSubmitting(true);
    try {
      for (const product of selectedProducts) {
        if (product.sellerId === user.id) continue;
        const quantity = itemStates[product.id]?.quantity || 1;
        await orderService.create({ productId: product.id, message: `购物车下单，数量：${quantity}`, price: product.price * quantity });
      }
      selectedProducts.forEach(p => remove(p.id));
      showToast('下单成功', 'success');
      Taro.navigateTo({ url: '/pages/me-orders/index' });
    } catch (e: any) { showToast(e.message || '下单失败', 'error'); }
    finally { setSubmitting(false); }
  };

  const getImageSrc = (img: string) => {
    if (!img) return '';
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    return uploadService.getUrl(img) || img;
  };

  const handleRemove = (productId: string) => {
    remove(productId);
    setItemStates(prev => { const n = { ...prev }; delete n[productId]; return n; });
    showToast('已移出购物车', 'info');
  };

  const goHome = () => Taro.switchTab({ url: '/pages/home/index' });
  const goProduct = (id: string) => Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` });

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', paddingBottom: products.length > 0 ? '220rpx' : '16px' }}>
      <NavBar title="购物车" />
      <ScrollView scrollY style={{ height: 'calc(100vh - 48px - var(--safe-area-inset-top))' }}>
        {loading ? (
          <View style={{ display: 'flex', justifyContent: 'center', paddingTop: '64px' }}>
            <View style={{ width: '24px', height: '24px', border: '2px solid #2B8CFF', borderTopColor: 'transparent', borderRadius: '50%' }} />
          </View>
        ) : products.length === 0 ? (
          <EmptyState title="购物车是空的" description="把心仪的商品加入购物车，一键下单更方便" action={
            <Button onClick={goHome} style={{ padding: '20rpx 48rpx', background: 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)', color: '#fff', borderRadius: '9999px', fontSize: '28rpx', fontWeight: 500, border: 'none' }}>去逛逛</Button>
          } />
        ) : (
          <View style={{ padding: '24rpx 32rpx', display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
            {products.map(product => {
              const seller = getUserById(product.sellerId);
              const itemState = itemStates[product.id] || { quantity: 1, selected: true };
              const isAnimating = animatingQuantities[product.id];
              return (
                <MovableArea key={product.id} style={{ width: '100%', height: '240rpx', overflow: 'hidden', borderRadius: '32rpx' }}>
                  <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '160rpx', background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '32rpx' }} onClick={() => handleRemove(product.id)}>
                    <Text style={{ color: '#ffffff', fontSize: '28rpx', fontWeight: 500 }}>删除</Text>
                  </View>
                  <MovableView direction="horizontal" x={0} damping={40} friction={10} style={{ width: 'calc(100% + 160rpx)', height: '100%', backgroundColor: '#ffffff', borderRadius: '32rpx', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <View style={{ display: 'flex', gap: '24rpx', padding: '24rpx', height: '100%' }}>
                      <View onClick={() => toggleSelect(product.id)} style={{ width: '48rpx', height: '48rpx', borderRadius: '50%', border: itemState.selected ? 'none' : '2px solid #CCCCCC', background: itemState.selected ? 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)' : 'transparent', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {itemState.selected && <Text style={{ color: '#ffffff', fontSize: '24rpx', fontWeight: 'bold' }}>✓</Text>}
                      </View>
                      <View style={{ width: '180rpx', height: '180rpx', backgroundColor: '#f5f5f5', borderRadius: '24rpx', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.images[0] ? <Image src={getImageSrc(product.images[0])} mode="aspectFill" style={{ width: '180rpx', height: '180rpx' }} /> : <Text style={{ fontSize: '12px', color: '#999999' }}>无图</Text>}
                      </View>
                      <View style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '2px', paddingBottom: '2px' }}>
                        <View>
                          <Text onClick={() => goProduct(product.id)} style={{ fontSize: '32rpx', fontWeight: 600, color: '#1A1A1A', lineHeight: '44rpx', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.title}</Text>
                          <Text style={{ fontSize: '24rpx', color: '#666666', marginTop: '4px' }}>卖家：{seller?.nickname || '未知'}</Text>
                        </View>
                        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: '36rpx', fontWeight: 'bold', color: '#2B8CFF' }}>¥{formatPrice(product.price)}</Text>
                          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <View onClick={(e) => { e.stopPropagation(); decreaseQuantity(product.id); }} style={{ width: '56rpx', height: '56rpx', borderRadius: '50%', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ fontSize: '32rpx', color: '#666666' }}>−</Text>
                            </View>
                            <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#1A1A1A', minWidth: '48rpx', textAlign: 'center', transition: 'transform 0.2s ease', transform: isAnimating ? 'scale(1.3)' : 'scale(1)' }}>{itemState.quantity}</Text>
                            <View onClick={(e) => { e.stopPropagation(); increaseQuantity(product.id); }} style={{ width: '56rpx', height: '56rpx', borderRadius: '50%', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ fontSize: '32rpx', color: '#666666' }}>+</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </MovableView>
                </MovableArea>
              );
            })}
          </View>
        )}
      </ScrollView>
      {products.length > 0 && (
        <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #EEEEEE', paddingLeft: '32rpx', paddingRight: '32rpx', paddingTop: '24rpx', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 40 }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
              <View onClick={toggleSelectAll} style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                <View style={{ width: '44rpx', height: '44rpx', borderRadius: '50%', border: isAllSelected ? 'none' : '2px solid #CCCCCC', background: isAllSelected ? 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)' : 'transparent', transition: 'all 0.3s ease', transform: selectAllAnimating ? 'scale(1.2)' : 'scale(1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isAllSelected && <Text style={{ color: '#ffffff', fontSize: '24rpx', fontWeight: 'bold' }}>✓</Text>}
                </View>
                <Text style={{ fontSize: '28rpx', color: '#666666' }}>全选</Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <Text style={{ fontSize: '28rpx', color: '#666666' }}>合计:</Text>
                <Text style={{ fontSize: '48rpx', fontWeight: 'bold', color: '#2B8CFF' }}>¥{formatPrice(total)}</Text>
              </View>
            </View>
            <Button onClick={handleCheckout} disabled={submitting || selectedCount === 0} style={{ padding: '24rpx 64rpx', background: submitting || selectedCount === 0 ? '#CCCCCC' : 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)', color: '#ffffff', borderRadius: '9999px', fontSize: '32rpx', fontWeight: 600, border: 'none', boxShadow: submitting || selectedCount === 0 ? 'none' : '0 4px 15px rgba(43, 140, 255, 0.4)', lineHeight: '1.5' }}>
              {submitting ? '下单中...' : `结算 (${selectedCount})`}
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}