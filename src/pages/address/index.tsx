import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { storage } from '@/services/storage';
import { showConfirm, showPrompt } from '@/utils/taro';
import NavBar from '@/components/layout/NavBar';
import type { Address } from '@/types';

export default function AddressPage() {
  const user = useAuthStore(s => s.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', province: '', city: '', district: '', detail: '',
  });

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  const loadAddresses = () => {
    const all = storage.get<Address[]>('addresses') || [];
    setAddresses(all.filter(a => a.userId === user?.id));
  };

  const openForm = (addr?: Address) => {
    if (addr) {
      setEditing(addr);
      setFormData({
        name: addr.name, phone: addr.phone, province: addr.province,
        city: addr.city, district: addr.district, detail: addr.detail,
      });
    } else {
      setEditing(null);
      setFormData({ name: '', phone: '', province: '', city: '', district: '', detail: '' });
    }
    setShowForm(true);
  };

  const handleSave = () => {
    const { name, phone, province, city, district, detail } = formData;
    if (!name.trim() || !phone.trim() || !province.trim() || !city.trim() || !district.trim() || !detail.trim()) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    const all = storage.get<Address[]>('addresses') || [];
    if (editing) {
      const updated = all.map(a => a.id === editing.id ? { ...a, ...formData } : a);
      storage.set('addresses', updated);
    } else {
      const newAddr: Address = {
        id: `addr_${Date.now()}`,
        userId: user!.id,
        ...formData,
        isDefault: addresses.length === 0,
      };
      storage.set('addresses', [...all, newAddr]);
    }
    setShowForm(false);
    loadAddresses();
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleDelete = async (addr: Address) => {
    const confirmed = await showConfirm('删除地址', `确定删除「${addr.name}」的地址？`);
    if (!confirmed) return;
    const all = storage.get<Address[]>('addresses') || [];
    storage.set('addresses', all.filter(a => a.id !== addr.id));
    loadAddresses();
    Taro.showToast({ title: '已删除', icon: 'success' });
  };

  const setDefault = (addr: Address) => {
    const all = storage.get<Address[]>('addresses') || [];
    const updated = all.map(a => ({
      ...a,
      isDefault: a.userId === user?.id ? a.id === addr.id : a.isDefault,
    }));
    storage.set('addresses', updated);
    loadAddresses();
    Taro.showToast({ title: '已设为默认', icon: 'success' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="收货地址" />

      <ScrollView scrollY style={{ height: 'calc(100vh - 48px - var(--safe-area-inset-top))' }}>
        {addresses.length === 0 ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', color: '#666666' }}>
            <Text style={{ fontSize: '96rpx', opacity: 0.3, marginBottom: '12px' }}>📍</Text>
            <Text style={{ fontSize: '28rpx' }}>暂无收货地址</Text>
            <Text style={{ fontSize: '24rpx', marginTop: '4px', color: '#999999' }}>点击下方按钮添加地址</Text>
          </View>
        ) : (
          <View style={{ padding: '24rpx', display: 'flex', flexDirection: 'column', gap: '20rpx' }}>
            {addresses.map(addr => (
              <View
                key={addr.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24rpx',
                  padding: '28rpx',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  border: addr.isDefault ? '2px solid #2B8CFF' : 'none',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12rpx' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                    <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#1A1A1A' }}>{addr.name}</Text>
                    <Text style={{ fontSize: '28rpx', color: '#666666' }}>{addr.phone}</Text>
                  </View>
                  {addr.isDefault && (
                    <View style={{
                      paddingLeft: '12rpx', paddingRight: '12rpx', paddingTop: '4rpx', paddingBottom: '4rpx',
                      backgroundColor: '#2B8CFF', borderRadius: '8rpx',
                    }}>
                      <Text style={{ fontSize: '20rpx', color: '#ffffff', fontWeight: 600 }}>默认</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: '26rpx', color: '#666666', lineHeight: '40rpx' }}>
                  {addr.province}{addr.city}{addr.district} {addr.detail}
                </Text>
                <View style={{ display: 'flex', gap: '16rpx', marginTop: '16rpx' }}>
                  <Button
                    onClick={() => openForm(addr)}
                    style={{
                      flex: 1, height: '64rpx', lineHeight: '64rpx',
                      border: '1px solid #2B8CFF', color: '#2B8CFF',
                      borderRadius: '12rpx', fontSize: '24rpx', backgroundColor: '#ffffff',
                    }}
                  >
                    编辑
                  </Button>
                  {!addr.isDefault && (
                    <Button
                      onClick={() => setDefault(addr)}
                      style={{
                        flex: 1, height: '64rpx', lineHeight: '64rpx',
                        border: '1px solid #52C41A', color: '#52C41A',
                        borderRadius: '12rpx', fontSize: '24rpx', backgroundColor: '#ffffff',
                      }}
                    >
                      设为默认
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(addr)}
                    style={{
                      width: '64rpx', height: '64rpx', lineHeight: '64rpx',
                      border: '1px solid #FF4D4F', color: '#FF4D4F',
                      borderRadius: '12rpx', fontSize: '24rpx', backgroundColor: '#ffffff', padding: 0,
                    }}
                  >
                    ✕
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 添加按钮 */}
      <View
        style={{
          position: 'fixed', bottom: 'calc(24rpx + env(safe-area-inset-bottom))',
          left: '50%', transform: 'translateX(-50%)',
        }}
      >
        <Button
          onClick={() => openForm()}
          style={{
            padding: '24rpx 64rpx',
            background: 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)',
            color: '#ffffff', borderRadius: '9999px',
            fontSize: '32rpx', fontWeight: 600, border: 'none',
            boxShadow: '0 4px 15px rgba(43, 140, 255, 0.4)',
          }}
        >
          + 添加地址
        </Button>
      </View>

      {/* 表单弹窗 */}
      {showForm && (
        <View style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowForm(false)}
          />
          <View style={{
            position: 'relative', width: '100%', backgroundColor: '#ffffff',
            borderRadius: '24rpx 24rpx 0 0', padding: '32rpx', maxHeight: '80vh',
          }}>
            <Text style={{ fontSize: '32rpx', fontWeight: 700, color: '#1A1A1A', marginBottom: '24rpx' }}>
              {editing ? '编辑地址' : '添加地址'}
            </Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '20rpx' }}>
              <View>
                <Text style={{ fontSize: '26rpx', color: '#666666', marginBottom: '8rpx' }}>收货人</Text>
                <Input
                  value={formData.name}
                  onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                  placeholder="请输入收货人姓名"
                  style={{
                    width: '100%', height: '80rpx', backgroundColor: '#F5F7FA',
                    borderRadius: '12rpx', paddingLeft: '20rpx', fontSize: '28rpx',
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: '26rpx', color: '#666666', marginBottom: '8rpx' }}>手机号</Text>
                <Input
                  type="number"
                  value={formData.phone}
                  onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
                  placeholder="请输入手机号"
                  maxlength={11}
                  style={{
                    width: '100%', height: '80rpx', backgroundColor: '#F5F7FA',
                    borderRadius: '12rpx', paddingLeft: '20rpx', fontSize: '28rpx',
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: '26rpx', color: '#666666', marginBottom: '8rpx' }}>省</Text>
                <Input
                  value={formData.province}
                  onInput={(e) => setFormData({ ...formData, province: e.detail.value })}
                  placeholder="例如：北京市"
                  style={{
                    width: '100%', height: '80rpx', backgroundColor: '#F5F7FA',
                    borderRadius: '12rpx', paddingLeft: '20rpx', fontSize: '28rpx',
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: '26rpx', color: '#666666', marginBottom: '8rpx' }}>市</Text>
                <Input
                  value={formData.city}
                  onInput={(e) => setFormData({ ...formData, city: e.detail.value })}
                  placeholder="例如：北京市"
                  style={{
                    width: '100%', height: '80rpx', backgroundColor: '#F5F7FA',
                    borderRadius: '12rpx', paddingLeft: '20rpx', fontSize: '28rpx',
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: '26rpx', color: '#666666', marginBottom: '8rpx' }}>区/县</Text>
                <Input
                  value={formData.district}
                  onInput={(e) => setFormData({ ...formData, district: e.detail.value })}
                  placeholder="例如：海淀区"
                  style={{
                    width: '100%', height: '80rpx', backgroundColor: '#F5F7FA',
                    borderRadius: '12rpx', paddingLeft: '20rpx', fontSize: '28rpx',
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: '26rpx', color: '#666666', marginBottom: '8rpx' }}>详细地址</Text>
                <Input
                  value={formData.detail}
                  onInput={(e) => setFormData({ ...formData, detail: e.detail.value })}
                  placeholder="街道、楼牌号等"
                  style={{
                    width: '100%', height: '80rpx', backgroundColor: '#F5F7FA',
                    borderRadius: '12rpx', paddingLeft: '20rpx', fontSize: '28rpx',
                  }}
                />
              </View>
            </View>

            <View style={{ display: 'flex', gap: '16rpx', marginTop: '32rpx' }}>
              <Button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1, height: '88rpx', lineHeight: '88rpx',
                  border: '1px solid #EEEEEE', borderRadius: '16rpx',
                  color: '#666666', backgroundColor: '#ffffff', fontSize: '28rpx',
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                style={{
                  flex: 1, height: '88rpx', lineHeight: '88rpx',
                  background: 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)',
                  color: '#ffffff', borderRadius: '16rpx',
                  border: 'none', fontWeight: 600, fontSize: '28rpx',
                }}
              >
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
