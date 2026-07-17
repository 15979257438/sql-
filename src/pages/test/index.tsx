// 测试页面 - 用于诊断
import { View, Text } from '@tarojs/components';
import './index.scss';

export default function TestPage() {
  return (
    <View style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Text style={{
        fontSize: '48rpx',
        color: '#ffffff',
        fontWeight: 'bold'
      }}>
        ✅ 页面加载成功！
      </Text>
      <Text style={{
        fontSize: '28rpx',
        color: 'rgba(255,255,255,0.8)',
        marginTop: '20rpx'
      }}>
        如果你能看到这个页面，说明编译正常
      </Text>
    </View>
  );
}