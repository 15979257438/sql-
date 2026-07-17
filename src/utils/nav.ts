import Taro from '@tarojs/taro';

// tabBar 页面集合，这些页面只能用 switchTab 跳转
const TAB_PAGES = new Set([
  '/pages/home/index',
  '/pages/cart/index',
  '/pages/publish/index',
  '/pages/chat/index',
  '/pages/me/index',
]);

// 安全跳转：自动判断目标是否为 tabBar 页面，并防止页面栈超过 10 层
function safeNavigateTo(url: string) {
  if (TAB_PAGES.has(url.split('?')[0])) {
    Taro.switchTab({ url: url.split('?')[0] });
    return;
  }
  const pages = Taro.getCurrentPages();
  if (pages.length >= 10) {
    // 页面栈即将溢出，用 redirectTo 替换当前页
    Taro.redirectTo({ url });
    return;
  }
  Taro.navigateTo({ url });
}

export function goHome() {
  Taro.switchTab({ url: '/pages/home/index' });
}

export function goCategory(cat?: string) {
  if (cat) {
    safeNavigateTo(`/pages/category/index?cat=${encodeURIComponent(cat)}`);
  } else {
    safeNavigateTo('/pages/category/index');
  }
}

export function goSearch() {
  safeNavigateTo('/pages/search/index');
}

export function goProduct(id: string) {
  safeNavigateTo(`/pages/product-detail/index?id=${id}`);
}

export function goPublish() {
  Taro.switchTab({ url: '/pages/publish/index' });
}

export function goPublishEdit(id: string) {
  safeNavigateTo(`/pages/publish-edit/index?id=${id}`);
}

export function goChat() {
  Taro.switchTab({ url: '/pages/chat/index' });
}

export function goChatDetail(conversationId: string) {
  safeNavigateTo(`/pages/chat-detail/index?conversationId=${conversationId}`);
}

export function goMe() {
  Taro.switchTab({ url: '/pages/me/index' });
}

export function goMeProfile() {
  safeNavigateTo('/pages/me-profile/index');
}

export function goMeProducts() {
  safeNavigateTo('/pages/me-products/index');
}

export function goMeFavorites() {
  safeNavigateTo('/pages/me-favorites/index');
}

export function goMeHistory() {
  safeNavigateTo('/pages/me-history/index');
}

export function goMeOrders() {
  safeNavigateTo('/pages/me-orders/index');
}

export function goMeSettings() {
  safeNavigateTo('/pages/me-settings/index');
}

export function goNotifications() {
  safeNavigateTo('/pages/notifications/index');
}

export function goCart() {
  Taro.switchTab({ url: '/pages/cart/index' });
}

export function goReport(targetType: string, targetId: string) {
  safeNavigateTo(`/pages/report/index?targetType=${targetType}&targetId=${targetId}`);
}

export function goLogin() {
  Taro.redirectTo({ url: '/pages/login/index' });
}

export function goBack(delta: number = 1) {
  Taro.navigateBack({ delta });
}

export function getPageParams(): Record<string, string | undefined> {
  const instance = Taro.getCurrentInstance();
  return (instance?.router?.params as Record<string, string | undefined>) || {};
}
