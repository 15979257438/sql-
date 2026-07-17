import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/authService';
import { goHome } from '@/utils/nav';

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'sms'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const login = useAuthStore(s => s.login);
  const loginWithSms = useAuthStore(s => s.loginWithSms);
  const loginWithWechat = useAuthStore(s => s.loginWithWechat);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);
  const showToast = useUIStore(s => s.showToast);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(c => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (isLoading) {
    return (
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#F5F7FA',
        }}
      >
        <Text style={{ color: '#2B8CFF', fontSize: '14px' }}>加载中...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    goHome();
    return null;
  }

  const isPhoneValid = /^1[3-9]\d{9}$/.test(phone.trim());

  const handlePasswordLogin = async () => {
    if (!phone.trim()) {
      showToast('请输入账号', 'error');
      return;
    }
    if (!password.trim()) {
      showToast('请输入密码', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(phone.trim(), password);
      showToast('登录成功', 'success');
      goHome();
    } catch {
      showToast('账号或密码错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSmsLogin = async () => {
    if (!isPhoneValid) {
      showToast('请输入正确的手机号', 'error');
      return;
    }
    if (!smsCode.trim()) {
      showToast('请输入验证码', 'error');
      return;
    }

    setLoading(true);
    try {
      await loginWithSms(phone.trim(), smsCode);
      showToast('登录成功', 'success');
      goHome();
    } catch {
      showToast('验证码错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!isPhoneValid) {
      showToast('请输入正确的手机号', 'error');
      return;
    }

    setSending(true);
    try {
      await authService.sendSmsCode(phone.trim());
      showToast('验证码已发送', 'success');
      setCountdown(60);
    } catch {
      showToast('验证码发送失败', 'error');
    } finally {
      setSending(false);
    }
  };

  const quickLogin = async (account: string) => {
    setLoading(true);
    try {
      await login(account, '123456');
      showToast('登录成功', 'success');
      goHome();
    } catch {
      showToast('登录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWechatLogin = async () => {
    setLoading(true);
    try {
      await loginWithWechat();
      showToast('微信登录成功', 'success');
      goHome();
    } catch (e: any) {
      showToast(e.message || '微信登录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputBaseStyle: CSSProperties = {
    width: '100%',
    height: '88rpx',
    paddingLeft: '32rpx',
    paddingRight: '32rpx',
    backgroundColor: '#ffffff',
    border: '1px solid #EEEEEE',
    borderRadius: '16rpx',
    fontSize: '32rpx',
    boxSizing: 'border-box',
  };

  return (
    <View
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7FA',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <View
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '64rpx',
          paddingRight: '64rpx',
        }}
      >
        <View
          style={{
            width: '144rpx',
            height: '144rpx',
            backgroundColor: '#2B8CFF',
            borderRadius: '32rpx',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <Text style={{ fontSize: '80rpx', color: '#ffffff', fontWeight: 'bold' }}>校</Text>
        </View>
        <Text style={{ fontSize: '48rpx', fontWeight: '600', color: '#1A1A1A', marginBottom: '4px' }}>
          校园二手交易
        </Text>
        <Text style={{ fontSize: '28rpx', color: '#999999', marginBottom: '32px' }}>
          校园闲置好物，淘你所想
        </Text>

        <View style={{ width: '100%', maxWidth: '400px' }}>
          <View
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16rpx',
              padding: '8rpx',
              backgroundColor: '#E5E7EB',
              borderRadius: '16rpx',
              marginBottom: '16px',
            }}
          >
            <Button
              onClick={() => setMode('password')}
              style={{
                padding: '16rpx 0',
                fontSize: '28rpx',
                fontWeight: '500',
                borderRadius: '6px',
                backgroundColor: mode === 'password' ? '#2B8CFF' : 'transparent',
                color: mode === 'password' ? '#ffffff' : '#666666',
                border: 'none',
                lineHeight: '1.5',
              }}
            >
              密码登录
            </Button>
            <Button
              onClick={() => setMode('sms')}
              style={{
                padding: '16rpx 0',
                fontSize: '28rpx',
                fontWeight: '500',
                borderRadius: '6px',
                backgroundColor: mode === 'sms' ? '#2B8CFF' : 'transparent',
                color: mode === 'sms' ? '#ffffff' : '#666666',
                border: 'none',
                lineHeight: '1.5',
              }}
            >
              验证码登录
            </Button>
          </View>

          {mode === 'password' ? (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <View>
                <Text style={{ display: 'block', fontSize: '28rpx', color: '#666666', marginBottom: '6px' }}>
                  账号
                </Text>
                <Input
                  type="text"
                  value={phone}
                  onInput={(e) => setPhone(e.detail.value)}
                  placeholder="输入测试账号 (1 / 2 / 3)"
                  style={inputBaseStyle}
                />
              </View>
              <View>
                <Text style={{ display: 'block', fontSize: '28rpx', color: '#666666', marginBottom: '6px' }}>
                  密码
                </Text>
                <Input
                  type="text"
                  password
                  value={password}
                  onInput={(e) => setPassword(e.detail.value)}
                  placeholder="输入密码 (123456)"
                  style={inputBaseStyle}
                />
              </View>
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <View>
                <Text style={{ display: 'block', fontSize: '28rpx', color: '#666666', marginBottom: '6px' }}>
                  手机号
                </Text>
                <Input
                  type="number"
                  value={phone}
                  onInput={(e) => setPhone(e.detail.value)}
                  placeholder="输入手机号"
                  style={inputBaseStyle}
                />
              </View>
              <View>
                <Text style={{ display: 'block', fontSize: '28rpx', color: '#666666', marginBottom: '6px' }}>
                  验证码
                </Text>
                <View style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    type="number"
                    value={smsCode}
                    onInput={(e) => setSmsCode(e.detail.value)}
                    placeholder="输入验证码"
                    style={{ ...inputBaseStyle, flex: 1 }}
                  />
                  <Button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || sending || loading}
                    style={{
                      flexShrink: 0,
                      height: '88rpx',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      backgroundColor: '#2B8CFF',
                      color: '#ffffff',
                      fontSize: '28rpx',
                      fontWeight: '500',
                      borderRadius: '16rpx',
                      border: 'none',
                      whiteSpace: 'nowrap',
                      opacity: countdown > 0 || sending || loading ? 0.5 : 1,
                    }}
                  >
                    {countdown > 0 ? `${countdown}s后重发` : sending ? '发送中...' : '获取验证码'}
                  </Button>
                </View>
              </View>
            </View>
          )}

          <Button
            onClick={mode === 'password' ? handlePasswordLogin : handleSmsLogin}
            disabled={loading}
            style={{
              width: '100%',
              height: '88rpx',
              marginTop: '16px',
              backgroundColor: '#2B8CFF',
              color: '#ffffff',
              fontWeight: '500',
              borderRadius: '16rpx',
              border: 'none',
              opacity: loading ? 0.5 : 1,
              minHeight: '44px',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <Button
            onClick={handleWechatLogin}
            disabled={loading}
            style={{
              width: '100%',
              height: '88rpx',
              marginTop: '16px',
              backgroundColor: '#07C160',
              color: '#ffffff',
              fontWeight: '500',
              borderRadius: '16rpx',
              border: 'none',
              opacity: loading ? 0.5 : 1,
              minHeight: '44px',
            }}
          >
            微信一键登录
          </Button>
        </View>

        <View style={{ marginTop: '32px', width: '100%', maxWidth: '400px' }}>
          <Text style={{ display: 'block', fontSize: '24rpx', color: '#999999', textAlign: 'center', marginBottom: '12px' }}>
            测试账号（点击快速登录）
          </Text>
          <View
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {[
              { account: '1', name: '小明', dept: '计算机系' },
              { account: '2', name: '小红', dept: '经管学院' },
              { account: '3', name: '小刚', dept: '机械系' },
            ].map(user => (
              <Button
                key={user.account}
                onClick={() => quickLogin(user.account)}
                disabled={loading}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24rpx 16rpx',
                  backgroundColor: '#ffffff',
                  border: '1px solid #EEEEEE',
                  borderRadius: '16rpx',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <View
                  style={{
                    width: '80rpx',
                    height: '80rpx',
                    backgroundColor: 'rgba(43, 140, 255, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <Text style={{ color: '#2B8CFF', fontWeight: '600', fontSize: '28rpx' }}>
                    {user.name[0]}
                  </Text>
                </View>
                <Text style={{ fontSize: '24rpx', fontWeight: '500', color: '#1A1A1A' }}>{user.name}</Text>
                <Text style={{ fontSize: '20rpx', color: '#999999', marginTop: '2px' }}>{user.dept}</Text>
                <Text style={{ fontSize: '20rpx', color: '#999999' }}>账号: {user.account}</Text>
              </Button>
            ))}
          </View>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#999999', textAlign: 'center', marginTop: '12px' }}>
            密码均为：123456
          </Text>
        </View>
      </View>

      <Text style={{ textAlign: 'center', fontSize: '24rpx', color: '#999999', paddingTop: '24px', paddingBottom: '24px' }}>
        仅限校园测试环境使用
      </Text>
    </View>
  );
}
