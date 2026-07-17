import { useState, useEffect, useRef, useCallback } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text, Image, Button, Input, ScrollView } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { formatTime, formatPrice } from '@/utils/format';
import { uploadService } from '@/services/uploadService';
import { getAssetUrl } from '@/services/api';
import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socketService';
import { getPageParams } from '@/utils/nav';
import NavBar from '@/components/layout/NavBar';
import type { Conversation, Message, User } from '@/types';
import './index.scss';

export default function ChatDetailPage() {
  const { conversationId } = getPageParams();
  const user = useAuthStore(s => s.user);
  const userId = user?.id;
  const {
    currentMessages, currentConversationId, loadingMessages,
    fetchMessages, sendMessage, markRead, setCurrentConversation,
    appendMessage, updateConversation,
  } = useChatStore();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [scrollIntoViewId, setScrollIntoViewId] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [messageAnimations, setMessageAnimations] = useState<Set<string>>(new Set());
  const mountedRef = useRef(false);

  const currentConversationIdRef = useRef(currentConversationId);
  useEffect(() => {
    currentConversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  const loadConversation = useCallback(async () => {
    if (!conversationId || !userId) return;
    mountedRef.current = true;
    try {
      const conv = await chatService.getConversation(conversationId);
      setConversation(conv);
      await fetchMessages(conversationId);
      await markRead(conversationId);
      setTimeout(() => setScrollIntoViewId('bottom'), 100);
    } catch (e) {
      console.error(e);
    }
  }, [conversationId, userId, fetchMessages, markRead]);

  useEffect(() => {
    if (!conversationId || !userId) return;
    socketService.connect();
    socketService.joinConversation(conversationId);

    const handleMessage = ({ message }: { message: Message }) => {
      if (message.conversationId === currentConversationIdRef.current) {
        appendMessage(message);
        setMessageAnimations(prev => new Set(prev).add(message.id));
        setTimeout(() => setScrollIntoViewId('bottom'), 50);
      }
    };

    const handleConvUpdate = (conv: Conversation) => {
      updateConversation(conv);
    };

    socketService.on('message', handleMessage);
    socketService.on('conversation_updated', handleConvUpdate);

    loadConversation();

    return () => {
      socketService.off('message', handleMessage);
      socketService.off('conversation_updated', handleConvUpdate);
      socketService.leaveConversation(conversationId);
      setCurrentConversation(null);
    };
  }, [conversationId, userId]);

  // 会话信息补全
  useEffect(() => {
    if (!conversation || !userId) return;
    const other = conversation.buyerId === userId ? conversation.seller : conversation.buyer;
    setOtherUser(other || null);
  }, [conversation, userId]);

  useDidShow(() => {
    if (currentConversationId && userId) {
      fetchMessages(currentConversationId);
      markRead(currentConversationId);
      setTimeout(() => setScrollIntoViewId('bottom'), 100);
    }
  });

  useEffect(() => {
    if (!loadingMessages && currentMessages.length > 0) {
      setTimeout(() => setScrollIntoViewId('bottom'), 100);
    }
  }, [currentMessages, loadingMessages]);

  const handleSendText = useCallback(async () => {
    if (!inputText.trim() || !userId || !currentConversationId || sending) return;
    setSending(true);
    try {
      const content = inputText.trim();
      socketService.sendMessage({ conversationId: currentConversationId, type: 'text', content });
      await sendMessage(currentConversationId, 'text', content);
      setInputText('');
      setTimeout(() => setScrollIntoViewId('bottom'), 50);
    } catch { /* ignore */ }
    setSending(false);
  }, [inputText, userId, currentConversationId, sending, sendMessage]);

  const handleSendImage = async () => {
    if (!userId || !currentConversationId) return;
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      const tempFilePath = res.tempFiles[0]?.tempFilePath;
      if (!tempFilePath) return;

      const imgId = await uploadService.upload(tempFilePath);
      const imageUrl = getAssetUrl(imgId);
      socketService.sendMessage({ conversationId: currentConversationId, type: 'image', content: '[图片]', imageUrl });
      await sendMessage(currentConversationId, 'image', '[图片]', imageUrl);
      setTimeout(() => setScrollIntoViewId('bottom'), 50);
    } catch (e) {
      console.error('Send image failed:', e);
    }
  };

  const goProduct = () => {
    if (conversation?.productId) {
      Taro.navigateTo({ url: `/pages/product-detail/index?id=${conversation.productId}` });
    }
  };

  const productImage = conversation?.product?.images?.[0];

  return (
    <View style={{ height: '100vh', backgroundColor: '#F5F7FA', display: 'flex', flexDirection: 'column' }}>
      <NavBar title={otherUser?.nickname || '聊天'} />

      {conversation?.product && (
        <Button
          onClick={goProduct}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24rpx',
            padding: '24rpx',
            backgroundColor: '#ffffff',
            borderBottom: '1rpx solid #EEEEEE',
            textAlign: 'left',
            border: 'none',
            borderRadius: 0,
            transition: 'background-color 0.2s',
          }}
          hoverClass="product-hover"
        >
          <Image
            src={productImage ? getAssetUrl(productImage) : ''}
            mode="aspectFill"
            style={{ width: '100rpx', height: '100rpx', borderRadius: '16rpx', backgroundColor: '#F5F7FA' }}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: '28rpx', color: '#1A1A1A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conversation.product.title}
            </Text>
            <Text style={{ fontSize: '32rpx', fontWeight: 700, color: '#2B8CFF', marginTop: '8rpx' }}>
              ¥{formatPrice(conversation.product.price)}
            </Text>
          </View>
          <Text style={{ fontSize: '28rpx', color: '#999999' }}>›</Text>
        </Button>
      )}

      <ScrollView
        scrollY
        scrollIntoView={scrollIntoViewId}
        scrollWithAnimation
        style={{ flex: 1 }}
      >
        {loadingMessages ? (
          <View style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
            <View
              style={{
                width: '24px',
                height: '24px',
                border: '2px solid #2B8CFF',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </View>
        ) : currentMessages.length === 0 ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '80px',
            }}
          >
            <Text style={{ fontSize: '28rpx', color: '#666666' }}>发送第一条消息吧</Text>
          </View>
        ) : (
          <View style={{ padding: '24rpx 32rpx', display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
            {currentMessages.map((msg, index) => {
              const isMine = msg.senderId === userId;
              const isNew = messageAnimations.has(msg.id);
              return (
                <View
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    opacity: isNew ? 0 : 1,
                    transform: isNew
                      ? `translateX(${isMine ? '30px' : '-30px'})`
                      : 'translateX(0)',
                    animation: isNew
                      ? `slideIn${isMine ? 'Right' : 'Left'} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
                      : 'none',
                  }}
                >
                  <View
                    style={{
                      maxWidth: '75%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {msg.type === 'image' ? (
                      <Image
                        src={msg.imageUrl || msg.content}
                        mode="aspectFit"
                        style={{ maxWidth: '100%', maxHeight: '400rpx', borderRadius: '32rpx' }}
                        lazyLoad
                      />
                    ) : (
                      <View
                        style={{
                          padding: '20rpx 28rpx',
                          backgroundColor: isMine ? '#2B8CFF' : '#ffffff',
                          borderRadius: '32rpx',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '28rpx',
                            lineHeight: '40rpx',
                            color: isMine ? '#ffffff' : '#1A1A1A',
                          }}
                        >
                          {msg.content}
                        </Text>
                      </View>
                    )}
                    {/* 消息时间戳淡入显示 */}
                    <Text
                      style={{
                        fontSize: '20rpx',
                        color: '#999999',
                        marginTop: '4px',
                        opacity: 0,
                        animation: 'fadeInUp 0.6s ease-out 0.2s forwards',
                      }}
                    >
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
            <View id="bottom" style={{ height: '1px' }} />
          </View>
        )}
      </ScrollView>

      <View
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #EEEEEE',
          paddingLeft: '32rpx',
          paddingRight: '32rpx',
          paddingTop: '24rpx',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          transition: 'all 0.3s ease',
        }}
      >
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F5F7FA',
            borderRadius: '9999px',
            padding: `${inputFocused ? '20rpx' : '16rpx'} 24rpx`,
            transition: 'padding 0.3s ease',
          }}
        >
          <Button
            onClick={handleSendImage}
            style={{
              width: '72rpx',
              height: '72rpx',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666666',
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: '36rpx',
              flexShrink: 0,
              transition: 'transform 0.15s ease',
            }}
          >
            🖼️
          </Button>
          <Input
            type="text"
            value={inputText}
            onInput={(e) => setInputText(e.detail.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="输入消息..."
            style={{
              flex: 1,
              height: inputFocused ? '80rpx' : '72rpx',
              backgroundColor: 'transparent',
              padding: '0 8px',
              fontSize: '28rpx',
              color: '#1A1A1A',
              transition: 'height 0.3s ease',
            }}
          />
          <Button
            onClick={handleSendText}
            disabled={!inputText.trim() || sending}
            hoverClass="send-btn-ripple"
            style={{
              width: '72rpx',
              height: '72rpx',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2B8CFF',
              borderRadius: '50%',
              color: '#ffffff',
              border: 'none',
              padding: 0,
              fontSize: '32rpx',
              flexShrink: 0,
              opacity: !inputText.trim() || sending ? 0.4 : 1,
              transition: 'all 0.2s ease',
              position: 'relative' as any,
              overflow: 'hidden' as any,
            }}
          >
            ➤
          </Button>
        </View>
      </View>
    </View>
  );
}