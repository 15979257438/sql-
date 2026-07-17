import { View, Text } from '@tarojs/components';
import { goBack } from '@/utils/nav';
import { colors } from '@/styles/common';

interface NavBarProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  dark?: boolean;
  transparent?: boolean;
}

export default function NavBar({
  title,
  showBack = true,
  rightAction,
  onBack,
  dark = false,
  transparent = false,
}: NavBarProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const textColor = dark || transparent ? '#ffffff' : colors.textPrimary;

  return (
    <View
      className="safe-top"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: transparent ? 'transparent' : 'rgba(255,255,255,0.96)',
        borderBottom: transparent ? 'none' : `1px solid ${colors.border}`,
      }}
    >
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '92rpx',
          paddingLeft: '24rpx',
          paddingRight: '24rpx',
          position: 'relative',
        }}
      >
        <View style={{ width: '80rpx', display: 'flex', alignItems: 'center' }}>
          {showBack && (
            <View
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64rpx',
                height: '64rpx',
              }}
            >
              <Text
                style={{
                  fontSize: '44rpx',
                  color: textColor,
                  fontWeight: 'bold',
                  lineHeight: '44rpx',
                }}
              >
                ←
              </Text>
            </View>
          )}
        </View>

        {title && (
          <Text
            style={{
              fontSize: '34rpx',
              fontWeight: 600,
              color: textColor,
              maxWidth: '55vw',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              lineHeight: '44rpx',
            }}
          >
            {title}
          </Text>
        )}

        <View style={{ width: '80rpx', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {rightAction || null}
        </View>
      </View>
    </View>
  );
}
