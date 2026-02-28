import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

type Props = {
  rating: number;
  reviewCount?: number;
  compact?: boolean;
};

export function RatingStars({ rating, reviewCount, compact = false }: Props) {
  const theme = useTheme();
  const fullStars = Math.round(rating);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < fullStars ? 'star' : 'star-outline'}
            size={compact ? 12 : 14}
            color={theme.colors.warning}
          />
        ))}
      </View>
      <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
        {rating.toFixed(1)}{typeof reviewCount === 'number' ? ` (${reviewCount})` : ''}
      </ThemedText>
    </View>
  );
}
