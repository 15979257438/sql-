import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { View, Image, Text } from '@tarojs/components';
import { colors, fontSize } from '@/styles/common';

const TABS = [
  { pagePath: 'pages/home/index', text: '首页', icon: '/assets/icons/tab-home.png', activeIcon: '/assets/icons/tab-home-active.png', emoji: '🏠' },
  { pagePath: 'pages/cart/index', text: '购物车', icon: '/assets/icons/tab-cart.png', activeIcon: '/assets/icons/tab-cart-active.png', emoji: '🛒' },
  { pagePath: 'pages/publish/index', text: '发布', icon: '/assets/icons/tab-publish.png', activeIcon: '/assets/icons/tab-publish-active.png', emoji: '➕' },
  { pagePath: 'pages/chat/index', text: '消息', icon: '/assets/icons/tab-chat.png', activeIcon: '/assets/icons/tab-chat-active.png', emoji: '💬' },
  { pagePath: 'pages/me/index', text: '我的', icon: '/assets/icons/tab-me.png', activeIcon: '/assets/icons/tab-me-active.png', emoji: '👤' },
];

export default function CustomTabBar() {
  const [selected, setSelected] = useState(0);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const updateSelected = () => {
    const pages = Taro.getCurrentPages();
    if (pages.length === 0) return;
    const currentPath = pages[pages.length - 1].route || '';
    const index = TABS.findIndex(tab => currentPath === tab.pagePath);
    if (index >= 0) setSelected(index);
  };

  useDidShow(() => {
    updateSelected();
  });

  const switchTab = (index: number) => {
    if (index === selected) return;
    const url = `/${TABS[index].pagePath}`;
    Taro.switchTab({ url });
    setSelected(index);
  };

  const renderIcon = (tab: typeof TABS[0], isSelected: boolean) => {
    const key = `${tab.pagePath}_${isSelected}`;
    if (imgError[key]) {
      return (
        <Text style={{ fontSize: '40rpx', marginBottom: '6rpx' }}>
          {tab.emoji}
        </Text>
      );
    }
    return (
      <Image
        src={isSelected ? tab.activeIcon : tab.icon}
        style={{ width: '44rpx', height: '44rpx', marginBottom: '6rpx' }}
        onError={() => setImgError(prev => ({ ...prev, [key]: true }))}
      />
    );
  };

  return (
    <View
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 'calc(120rpx + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: '#ffffff',
        borderTop: '1rpx solid #eeeeee',
        zIndex: 1000,
      }}
    >
      {TABS.map((tab, index) => {
        const isSelected = selected === index;
        const isPublish = tab.text === '发布';
        return (
          <View
            key={tab.pagePath}
            onClick={() => switchTab(index)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
            }}
          >
            {isPublish ? (
              <View
                style={{
                  width: '88rpx',
                  height: '88rpx',
                  borderRadius: '50%',
                  backgroundColor: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8rpx 24rpx rgba(43,140,255,0.32)',
                  marginBottom: '4rpx',
                }}
              >
                {renderIcon(tab, isSelected)}
              </View>
            ) : (
              renderIcon(tab, isSelected)
            )}
            <Text
              style={{
                fontSize: '26rpx',
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? colors.primary : colors.textHint,
              }}
            >
              {tab.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
