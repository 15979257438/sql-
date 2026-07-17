import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Input, Button, Textarea } from '@tarojs/components';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { uploadService } from '@/services/uploadService';
import { goBack } from '@/utils/nav';
import NavBar from '@/components/layout/NavBar';

function getImageUrl(img: string) {
  if (!img) return '';
  if (img.startsWith('data:') || img.startsWith('http')) return img;
  return uploadService.getUrl(img) || img;
}

export default function ProfileEditPage() {
  const { user, updateProfile } = useAuthStore();
  const showToast = useUIStore(s => s.showToast);

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [school, setSchool] = useState(user?.school || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  // 交互状态
  const [avatarHover, setAvatarHover] = useState(false);
  const [avatarPressed, setAvatarPressed] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setSchool(user.school || '');
      setDepartment(user.department || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // 页面加载动画
  useEffect(() => {
    setTimeout(() => setPageLoaded(true), 50);
  }, []);

  const handleAvatarChange = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      const file = res.tempFiles[0];
      if (!file) return;
      if (file.size && file.size > 5 * 1024 * 1024) {
        showToast('图片不能超过5MB', 'error');
        return;
      }
      const id = await uploadService.upload(file.tempFilePath);
      const url = uploadService.getUrl(id) || id;
      setAvatar(url);
    } catch (err: any) {
      showToast(err.message || '选择图片失败', 'error');
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      showToast('请输入昵称', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        school: school.trim(),
        department: department.trim(),
        bio: bio.trim(),
        avatar,
      });
      showToast('保存成功', 'success');
      goBack();
    } catch {
      showToast('保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 输入框样式生成器
  const getInputStyle = (fieldName: string) => {
    const isFocused = focusedField === fieldName;
    return {
      width: '100%',
      height: '88rpx',
      paddingLeft: '24rpx',
      paddingRight: '24rpx',
      backgroundColor: '#ffffff',
      border: isFocused ? '2rpx solid' : '2rpx solid #EEEEEE',
      borderColor: isFocused ? '#2B8CFF' : '#EEEEEE',
      borderRadius: '16rpx',
      fontSize: '28rpx',
      boxSizing: 'border-box' as const,
      transition: 'all 0.3s ease',
      boxShadow: isFocused ? '0 4rpx 24rpx rgba(43, 140, 255, 0.15)' : 'none',
    };
  };

  // 标签样式生成器
  const getLabelStyle = (fieldName: string) => {
    const isFocused = focusedField === fieldName;
    return {
      fontSize: '28rpx',
      fontWeight: 500,
      color: isFocused ? '#2B8CFF' : '#1A1A1A',
      marginBottom: '16rpx',
      transition: 'all 0.3s ease',
      transform: isFocused ? 'translateX(8rpx)' : 'translateX(0)',
    };
  };

  // 动画容器样式
  const getAnimatedSectionStyle = (delay: number) => ({
    opacity: pageLoaded ? 1 : 0,
    transform: pageLoaded ? 'translateY(0)' : 'translateY(30rpx)',
    transition: `all 0.5s ease ${delay}s`,
  });

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="编辑资料" />

      <View style={{ padding: '32rpx', display: 'flex', flexDirection: 'column', gap: '40rpx' }}>
        {/* 头像区域 */}
        <View style={{ ...getAnimatedSectionStyle(0), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <View
            onClick={handleAvatarChange}
            onTouchStart={() => {
              setAvatarPressed(true);
              setAvatarHover(true);
            }}
            onTouchEnd={() => {
              setAvatarPressed(false);
              setTimeout(() => setAvatarHover(false), 200);
            }}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            style={{
              width: '144rpx',
              height: '144rpx',
              backgroundColor: 'rgba(43, 140, 255, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: avatarPressed ? 'scale(1.15)' : avatarHover ? 'scale(1.05)' : 'scale(1)',
              boxShadow: avatarPressed
                ? '0 8rpx 32rpx rgba(43, 140, 255, 0.4)'
                : avatarHover
                  ? '0 6rpx 24rpx rgba(43, 140, 255, 0.25)'
                  : '0 2rpx 8rpx rgba(0, 0, 0, 0.08)',
            }}
          >
            {avatar ? (
              <Image
                src={getImageUrl(avatar)}
                mode="aspectFill"
                style={{ width: '144rpx', height: '144rpx' }}
              />
            ) : (
              <Text style={{ color: '#2B8CFF', fontWeight: '600', fontSize: '60rpx' }}>
                {nickname[0] || '?'}
              </Text>
            )}
          </View>
          <Text style={{ fontSize: '24rpx', color: '#2B8CFF', marginTop: '16rpx' }}>
            点击更换头像
          </Text>
        </View>

        {/* 昵称输入 */}
        <View style={getAnimatedSectionStyle(0.1)}>
          <View style={getLabelStyle('nickname')}>昵称</View>
          <Input
            type="text"
            value={nickname}
            onInput={(e: any) => setNickname(e.detail.value)}
            onFocus={() => setFocusedField('nickname')}
            onBlur={() => setFocusedField(null)}
            style={getInputStyle('nickname')}
          />
        </View>

        {/* 学校输入 */}
        <View style={getAnimatedSectionStyle(0.2)}>
          <View style={getLabelStyle('school')}>学校</View>
          <Input
            type="text"
            value={school}
            onInput={(e: any) => setSchool(e.detail.value)}
            onFocus={() => setFocusedField('school')}
            onBlur={() => setFocusedField(null)}
            placeholder="如：清华大学"
            style={getInputStyle('school')}
          />
        </View>

        {/* 院系输入 */}
        <View style={getAnimatedSectionStyle(0.3)}>
          <View style={getLabelStyle('department')}>院系</View>
          <Input
            type="text"
            value={department}
            onInput={(e: any) => setDepartment(e.detail.value)}
            onFocus={() => setFocusedField('department')}
            onBlur={() => setFocusedField(null)}
            placeholder="如：计算机科学与技术系"
            style={getInputStyle('department')}
          />
        </View>

        {/* 个人简介 */}
        <View style={getAnimatedSectionStyle(0.4)}>
          <View style={getLabelStyle('bio')}>个人简介</View>
          <Textarea
            value={bio}
            onInput={(e: any) => setBio(e.detail.value)}
            onFocus={() => setFocusedField('bio')}
            onBlur={() => setFocusedField(null)}
            placeholder="介绍一下自己吧..."
            maxlength={200}
            style={{
              width: '100%',
              minHeight: '160rpx',
              padding: '24rpx',
              backgroundColor: '#ffffff',
              border: focusedField === 'bio' ? '2rpx solid #2B8CFF' : '2rpx solid #EEEEEE',
              borderRadius: '16rpx',
              fontSize: '28rpx',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
              boxShadow: focusedField === 'bio' ? '0 4rpx 24rpx rgba(43, 140, 255, 0.15)' : 'none',
            }}
          />
          <Text style={{ fontSize: '24rpx', color: '#999999', marginTop: '8rpx' }}>
            {bio.length}/200
          </Text>
        </View>

        {/* 保存按钮 */}
        <View style={getAnimatedSectionStyle(0.5)}>
          <Button
            onClick={handleSave}
            disabled={saving}
            onTouchStart={() => !saving && setButtonPressed(true)}
            onTouchEnd={() => setButtonPressed(false)}
            style={{
              width: '100%',
              height: '88rpx',
              background: saving
                ? '#CCCCCC'
                : buttonPressed
                  ? 'linear-gradient(135deg, #1E6FD9 0%, #247FE8 100%)'
                  : 'linear-gradient(135deg, #2B8CFF 0%, #4DA3FF 100%)',
              color: '#ffffff',
              borderRadius: '16rpx',
              border: 'none',
              fontSize: '32rpx',
              fontWeight: 500,
              marginTop: '32rpx',
              transform: buttonPressed ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.2s ease',
              opacity: saving ? 0.7 : 1,
              animation: saving ? 'pulse 1.5s ease-in-out infinite' : 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving
                ? 'none'
                : buttonPressed
                  ? '0 2rpx 12rpx rgba(43, 140, 255, 0.3)'
                  : '0 4rpx 20rpx rgba(43, 140, 255, 0.3)',
            }}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </View>
      </View>
    </View>
  );
}