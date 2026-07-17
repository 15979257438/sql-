import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { walletService } from '@/services/walletService';
import { formatPrice } from '@/utils/format';
import { showPrompt } from '@/utils/taro';
import NavBar from '@/components/layout/NavBar';
import type { Transaction } from '@/types';

const TYPE_LABEL: Record<string, string> = {
  recharge: '充值',
  pay: '支付',
  refund: '退款',
  withdraw: '提现',
};

export default function WalletPage() {
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await walletService.getWallet();
      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch (e: any) {
      showToast(e.message || '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleRecharge = async () => {
    const res = await showPrompt('充值', '请输入充值金额（分）');
    if (!res.confirm) return;
    const amount = Number(res.value);
    if (!amount || amount <= 0) {
      showToast('金额无效', 'error');
      return;
    }
    try {
      const data = await walletService.recharge(amount);
      setBalance(data.balance);
      showToast('充值成功', 'success');
      loadWallet();
    } catch (e: any) {
      showToast(e.message || '充值失败', 'error');
    }
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="我的钱包" />

      <View
        style={{
          margin: '32rpx',
          padding: '48rpx',
          backgroundColor: '#2B8CFF',
          borderRadius: '32rpx',
          color: '#ffffff',
        }}
      >
        <Text style={{ fontSize: '28rpx', opacity: 0.9 }}>当前余额</Text>
        <Text style={{ fontSize: '72rpx', fontWeight: 700, marginTop: '16rpx' }}>¥{formatPrice(balance)}</Text>
        <Button
          onClick={handleRecharge}
          style={{
            marginTop: '32rpx',
            backgroundColor: '#ffffff',
            color: '#2B8CFF',
            borderRadius: '9999px',
            border: 'none',
            fontWeight: 600,
          }}
        >
          充值
        </Button>
      </View>

      <View style={{ padding: '0 32rpx' }}>
        <Text style={{ fontSize: '32rpx', fontWeight: 700, color: '#1A1A1A', marginBottom: '24rpx' }}>账单明细</Text>
        <ScrollView scrollY style={{ height: 'calc(100vh - 520rpx - var(--safe-area-inset-top))' }}>
          {loading && transactions.length === 0 ? (
            <View style={{ display: 'flex', justifyContent: 'center', paddingTop: '64rpx' }}>
              <View
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #2B8CFF',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                }}
              />
            </View>
          ) : transactions.length === 0 ? (
            <View style={{ textAlign: 'center', paddingTop: '64rpx', color: '#999999' }}>
              <Text>暂无账单</Text>
            </View>
          ) : (
            transactions.map(t => (
              <View
                key={t.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '28rpx',
                  backgroundColor: '#ffffff',
                  borderRadius: '24rpx',
                  marginBottom: '16rpx',
                }}
              >
                <View>
                  <Text style={{ fontSize: '28rpx', color: '#1A1A1A', fontWeight: 500 }}>
                    {TYPE_LABEL[t.type] || t.type}
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: '#999999', marginTop: '8rpx' }}>
                    {t.description || ''}
                  </Text>
                  <Text style={{ fontSize: '22rpx', color: '#999999', marginTop: '4rpx' }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: '32rpx',
                    fontWeight: 700,
                    color: t.amount > 0 ? '#52C41A' : '#1A1A1A',
                  }}
                >
                  {t.amount > 0 ? '+' : ''}¥{formatPrice(Math.abs(t.amount))}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
