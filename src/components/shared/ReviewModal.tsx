import { useState, useEffect } from 'react';
import { View, Text, Textarea, Button } from '@tarojs/components';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  title?: string;
  loading?: boolean;
  initialRating?: number;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  title = '评价交易',
  loading,
  initialRating = 5,
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState('');
  const [visible, setVisible] = useState(false);
  const [starClick, setStarClick] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 延迟显示，触发动画
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      setComment('');
      setRating(initialRating);
    }
  }, [isOpen, initialRating]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating < 1) return;
    onSubmit(rating, comment.trim());
  };

  const handleStarClick = (star: number) => {
    if (loading) return;
    setRating(star);
    setStarClick(star);
    setTimeout(() => setStarClick(null), 600);
  };

  const labels = ['非常不满意', '不满意', '一般', '满意', '非常满意'];

  return (
    <View
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      {/* 背景遮罩 - 淡入效果 */}
      <View
        onClick={loading ? undefined : onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
      />

      {/* 弹窗内容 - 从下方滑入 */}
      <View
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '32rpx 32rpx 0 0',
          padding: '32rpx',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Text style={{ fontSize: '32rpx', fontWeight: 600, marginBottom: '32rpx', color: '#1A1A1A' }}>
          {title}
        </Text>

        {/* 星星评分 */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16rpx',
            marginBottom: '16rpx',
          }}
        >
          {[1, 2, 3, 4, 5].map(star => (
            <View
              key={star}
              onClick={() => handleStarClick(star)}
              style={{
                padding: '8rpx',
                opacity: loading ? 0.5 : 1,
                transition: 'transform 0.2s ease-out',
                transform: starClick === star ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              <Text
                style={{
                  fontSize: '80rpx',
                  lineHeight: '80rpx',
                  color: star <= rating ? '#FFB800' : '#E5E5E0',
                  transition: 'color 0.2s ease-out',
                  display: 'inline-block',
                  animation: starClick === star ? 'heartbeat 0.6s ease-in-out' : 'none',
                }}
              >
                ★
              </Text>
            </View>
          ))}
        </View>

        {/* 评分标签 */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: '24rpx',
            color: '#999999',
            marginBottom: '32rpx',
            height: '40rpx',
          }}
        >
          {labels[rating - 1] || ''}
        </Text>

        {/* 评论输入框 */}
        <Textarea
          value={comment}
          onInput={(e) => setComment(e.detail.value)}
          placeholder="说说这次交易体验吧（选填）"
          maxlength={200}
          disabled={loading}
          style={{
            width: '100%',
            height: '192rpx',
            backgroundColor: '#f5f5f5',
            borderRadius: '16rpx',
            padding: '24rpx',
            fontSize: '28rpx',
            boxSizing: 'border-box',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.2s ease-out',
          }}
        />
        <Text
          style={{
            textAlign: 'right',
            fontSize: '24rpx',
            color: '#999999',
            marginTop: '8rpx',
          }}
        >
          {comment.length}/200
        </Text>

        {/* 按钮区域 */}
        <View style={{ display: 'flex', gap: '24rpx', marginTop: '32rpx' }}>
          <Button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              height: '88rpx',
              lineHeight: '88rpx',
              border: '1px solid #EEEEEE',
              borderRadius: '16rpx',
              fontSize: '28rpx',
              color: '#666666',
              backgroundColor: '#ffffff',
              opacity: loading ? 0.5 : 1,
              transition: 'opacity 0.2s ease-out',
            }}
          >
            暂不评价
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || rating < 1}
            style={{
              flex: 1,
              height: '88rpx',
              lineHeight: '88rpx',
              borderRadius: '16rpx',
              fontSize: '28rpx',
              color: '#ffffff',
              background: loading
                ? 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)'
                : 'linear-gradient(135deg, #2B8CFF 0%, #1E6FD9 100%)',
              opacity: loading || rating < 1 ? 0.5 : 1,
              transition: 'all 0.3s ease-out',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {loading && (
              <View
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '40rpx',
                  height: '40rpx',
                  border: '4rpx solid rgba(255,255,255,0.3)',
                  borderTop: '4rpx solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            )}
            <Text style={{ opacity: loading ? 0 : 1 }}>
              {loading ? '' : '提交评价'}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}