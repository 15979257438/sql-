import Taro from '@tarojs/taro';

/** Show confirmation modal */
export async function showConfirm(title: string, content: string): Promise<boolean> {
  const res = await Taro.showModal({ title, content });
  return res.confirm;
}

/** Show prompt modal */
export async function showPrompt(title: string, content: string, placeholder?: string): Promise<{ confirm: boolean; value?: string }> {
  const res = await (Taro.showModal as any)({
    title,
    content,
    editable: true,
    placeholderText: placeholder || '',
  });
  return { confirm: res.confirm, value: res.content };
}

/** Get system safe area info */
export function getSafeArea() {
  const info = Taro.getSystemInfoSync();
  return {
    statusBarHeight: info.statusBarHeight || 0,
    screenWidth: info.screenWidth || 375,
    screenHeight: info.screenHeight || 667,
    safeArea: info.safeArea,
    windowHeight: info.windowHeight,
  };
}
