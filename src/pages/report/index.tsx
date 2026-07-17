import { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Button, Textarea } from '@tarojs/components';
import { productService } from '@/services/productService';
import { getUserById } from '@/services/mockData';
import { reportService } from '@/services/reportService';
import { uploadService } from '@/services/uploadService';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { formatPrice } from '@/utils/format';
import { goBack, getPageParams } from '@/utils/nav';
import { REPORT_REASONS_MAP } from '@/constants/reportReasons';
import NavBar from '@/components/layout/NavBar';
import type { Product, User, TargetType } from '@/types';

export default function ReportPage() {
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);

  const params = getPageParams();
  const targetType = (params.targetType as TargetType) || null;
  const targetId = params.targetId || '';

  const [product, setProduct] = useState<Product | null>(null);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = useMemo(() => {
    if (!targetType) return [];
    return REPORT_REASONS_MAP[targetType] || [];
  }, [targetType]);

  useEffect(() => {
    if (!targetType || !targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      if (targetType === 'product') {
        const p = await productService.getById(targetId);
        setProduct(p);
        if (p) {
          const u = getUserById(p.sellerId);
          setTargetUser(u || null);
        }
      } else if (targetType === 'user' || targetType === 'message') {
        const u = getUserById(targetId);
        setTargetUser(u || null);
      }
      setLoading(false);
    })();
  }, [targetType, targetId]);

  const getImageUrl = (imageId: string) => {
    if (!imageId) return '';
    if (imageId.startsWith('data:')) return imageId;
    if (imageId.startsWith('http')) return imageId;
    return uploadService.getUrl(imageId);
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast('请先登录', 'error');
      return;
    }
    if (!targetType || !targetId) {
      showToast('举报参数不完整', 'error');
      return;
    }
    if (!selectedReason) {
      showToast('请选择举报原因', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await reportService.create({
        reporterId: user.id,
        targetType,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });
      showToast('举报已提交，我们会尽快处理', 'success');
      goBack();
    } catch (e) {
      showToast('举报提交失败，请稍后重试', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isValidType = targetType === 'product' || targetType === 'user' || targetType === 'message';

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <NavBar title="举报" />
        <View style={{ padding: '32rpx', display: 'flex', flexDirection: 'column', gap: '32rpx' }}>
          <View style={{ width: '100%', height: '96px', borderRadius: '32rpx', backgroundColor: '#e0e0e0' }} />
          <View style={{ width: '100%', height: '48px', borderRadius: '24rpx', backgroundColor: '#e0e0e0' }} />
          <View style={{ width: '100%', height: '160px', borderRadius: '24rpx', backgroundColor: '#e0e0e0' }} />
        </View>
      </View>
    );
  }

  if (!isValidType || !targetId) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <NavBar title="举报" />
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '80px',
            paddingBottom: '80px',
            color: '#666666',
          }}
        >
          <Text style={{ fontSize: '28rpx' }}>举报参数不正确</Text>
          <Button
            onClick={() => goBack()}
            style={{
              marginTop: '32rpx',
              color: '#2B8CFF',
              fontSize: '28rpx',
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              lineHeight: 'normal',
              height: 'auto',
            }}
          >
            返回
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', paddingBottom: '224rpx' }}>
      <NavBar title="举报" />

      <View style={{ padding: '32rpx', display: 'flex', flexDirection: 'column', gap: '32rpx' }}>
        {/* Target info card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '32rpx',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            padding: '28rpx',
          }}
        >
          <Text style={{ fontSize: '24rpx', color: '#666666', marginBottom: '24rpx' }}>
            举报对象：{targetType === 'product' ? '商品' : targetType === 'user' ? '用户' : '消息'}
          </Text>

          {targetType === 'product' && product ? (
            <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx' }}>
              <View
                style={{
                  width: '128rpx',
                  height: '128rpx',
                  borderRadius: '24rpx',
                  backgroundColor: '#f5f5f5',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {product.images[0] ? (
                  <Image
                    src={getImageUrl(product.images[0])}
                    mode="aspectFill"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999999',
                    }}
                  >
                    <Text style={{ fontSize: '48rpx' }}>🖼️</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: '28rpx',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.title}
                </Text>
                <Text style={{ fontSize: '32rpx', fontWeight: 700, color: '#2B8CFF', marginTop: '8rpx' }}>
                  ¥{formatPrice(product.price)}
                </Text>
                {targetUser && (
                  <Text style={{ fontSize: '24rpx', color: '#666666', marginTop: '8rpx' }}>
                    卖家：{targetUser.nickname}
                  </Text>
                )}
              </View>
            </View>
          ) : targetUser ? (
            <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx' }}>
              <View
                style={{
                  width: '112rpx',
                  height: '112rpx',
                  borderRadius: '50%',
                  backgroundColor: '#E8F4FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {targetUser.avatar ? (
                  <Image
                    src={targetUser.avatar}
                    mode="aspectFill"
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                  />
                ) : (
                  <Text style={{ color: '#2B8CFF', fontWeight: 'bold', fontSize: '40rpx' }}>
                    {targetUser.nickname?.[0] || '?'}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1A1A1A' }}>
                  {targetUser.nickname}
                </Text>
                <Text style={{ fontSize: '24rpx', color: '#666666', marginTop: '8rpx' }}>
                  {targetUser.school} · {targetUser.department}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ paddingTop: '16rpx', paddingBottom: '16rpx' }}>
              <Text style={{ fontSize: '28rpx', color: '#666666' }}>目标对象不存在或已删除</Text>
            </View>
          )}
        </View>

        {/* Reason selector */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '32rpx',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            padding: '28rpx',
          }}
        >
          <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#1A1A1A', marginBottom: '24rpx' }}>
            选择举报原因
          </Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
            {reasons.map(reason => (
              <Button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
                style={{
                  paddingLeft: '32rpx',
                  paddingRight: '32rpx',
                  paddingTop: '16rpx',
                  paddingBottom: '16rpx',
                  borderRadius: '9999px',
                  fontSize: '28rpx',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: selectedReason === reason.value ? '#2B8CFF' : '#EEEEEE',
                  backgroundColor: selectedReason === reason.value ? '#2B8CFF' : '#FFFFFF',
                  color: selectedReason === reason.value ? '#FFFFFF' : '#1A1A1A',
                  lineHeight: 'normal',
                  height: 'auto',
                }}
              >
                {reason.label}
              </Button>
            ))}
          </View>
        </View>

        {/* Description textarea */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '32rpx',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            padding: '28rpx',
          }}
        >
          <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#1A1A1A', marginBottom: '24rpx' }}>
            补充说明（选填）
          </Text>
          <Textarea
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            placeholder="请详细描述问题，帮助我们更快处理（选填）"
            maxlength={500}
            placeholderStyle="color: #999999"
            style={{
              width: '100%',
              height: '256rpx',
              backgroundColor: '#fafafa',
              borderRadius: '24rpx',
              padding: '32rpx',
              fontSize: '28rpx',
              color: '#1A1A1A',
              border: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <Text style={{ textAlign: 'right', fontSize: '24rpx', color: '#999999', marginTop: '16rpx' }}>
            {description.length}/500
          </Text>
        </View>
      </View>

      {/* Submit button */}
      <View
        className="safe-bottom"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #EEEEEE',
          padding: '24rpx 32rpx',
          zIndex: 40,
        }}
      >
        <View style={{ maxWidth: '512px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedReason}
            style={{
              width: '100%',
              height: '96rpx',
              backgroundColor: '#2B8CFF',
              color: '#FFFFFF',
              borderRadius: '32rpx',
              fontWeight: 600,
              fontSize: '32rpx',
              border: 'none',
              opacity: submitting || !selectedReason ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {submitting ? '提交中...' : '提交举报'}
          </Button>
        </View>
      </View>
    </View>
  );
}
