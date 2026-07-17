import { useState } from 'react';
import { View, Text } from '@tarojs/components';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  size = 24,
  className = '',
  interactive = false,
  onChange
}: StarRatingProps) {
  const [clickedStar, setClickedStar] = useState<number | null>(null);

  const handleStarClick = (starIndex: number) => {
    if (!interactive || !onChange) return;

    setClickedStar(starIndex);
    setTimeout(() => setClickedStar(null), 400);
    onChange(starIndex + 1);
  };

  return (
    <View
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: '4rpx' }}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const isFilled = i < Math.round(rating);
        const isClicked = clickedStar === i;

        return (
          <View
            key={i}
            onClick={() => handleStarClick(i)}
            style={{
              transition: 'transform 0.2s ease-out',
              transform: isClicked ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <Text
              style={{
                fontSize: `${size}rpx`,
                lineHeight: `${size}rpx`,
                color: isFilled ? '#FFB800' : '#E5E5E0',
                transition: 'color 0.2s ease-out',
                display: 'inline-block',
                animation: isClicked ? 'scaleInBounce 0.4s ease-out' : 'none',
              }}
            >
              ★
            </Text>
          </View>
        );
      })}
    </View>
  );
}