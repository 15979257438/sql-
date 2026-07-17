import { View, Text, Button } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { resetData } from '@/services/mockData';
import { goLogin } from '@/utils/nav';
import { showConfirm } from '@/utils/taro';
import NavBar from '@/components/layout/NavBar';

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const showToast = useUIStore(s => s.showToast);

  const handleClearCache = async () => {
    const confirmed = await showConfirm('清除缓存', '确定清除所有缓存数据？这将重置整个应用。');
    if (!confirmed) return;
    resetData();
    showToast('缓存已清除', 'success');
    goLogin();
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm('退出登录', '确定退出登录？');
    if (!confirmed) return;
    await logout();
    goLogin();
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="设置" />

      <View style={{ padding: '32rpx', display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '32rpx',
            overflow: 'hidden',
          }}
        >
          <Button
            onClick={handleClearCache}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '32rpx',
              paddingRight: '32rpx',
              paddingTop: '32rpx',
              paddingBottom: '32rpx',
              backgroundColor: '#ffffff',
              border: 'none',
              borderRadius: 0,
              borderBottom: '1px solid #EEEEEE',
            }}
          >
            <Text style={{ fontSize: '28rpx', fontWeight: '500', color: '#1A1A1A' }}>清除缓存</Text>
            <Text style={{ fontSize: '24rpx', color: '#666666' }}>重置所有数据</Text>
          </Button>

          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '32rpx',
              paddingRight: '32rpx',
              paddingTop: '32rpx',
              paddingBottom: '32rpx',
              borderBottom: '1px solid #EEEEEE',
            }}
          >
            <Text style={{ fontSize: '28rpx', fontWeight: '500', color: '#1A1A1A' }}>版本</Text>
            <Text style={{ fontSize: '24rpx', color: '#666666' }}>v1.0.0 MVP</Text>
          </View>

          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '32rpx',
              paddingRight: '32rpx',
              paddingTop: '32rpx',
              paddingBottom: '32rpx',
            }}
          >
            <Text style={{ fontSize: '28rpx', fontWeight: '500', color: '#1A1A1A' }}>关于</Text>
            <Text style={{ fontSize: '24rpx', color: '#666666' }}>校园二手交易平台</Text>
          </View>
        </View>

        <Button
          onClick={handleLogout}
          style={{
            width: '100%',
            paddingTop: '32rpx',
            paddingBottom: '32rpx',
            backgroundColor: '#ffffff',
            color: '#FF4D4F',
            fontWeight: '500',
            borderRadius: '32rpx',
            border: 'none',
          }}
        >
          退出登录
        </Button>
      </View>
    </View>
  );
}
