import React from 'react';
import { View } from 'react-native';

import { formatSom } from '../utils/format';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

type Props = {
  price: number;
  oldPrice?: number;
  size?: 'sm' | 'md' | 'lg';
};

export function PriceView({ price, oldPrice, size = 'md' }: Props) {
  const theme = useTheme();
  const fontSize = size === 'lg' ? 22 : size === 'sm' ? 14 : 16;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <ThemedText
        weight="bold"
        style={{ color: theme.colors.text, fontSize, lineHeight: fontSize + 4 }}
      >
        {formatSom(price)}
      </ThemedText>
      {typeof oldPrice === 'number' ? (
        <ThemedText
          variant="caption"
          style={{ textDecorationLine: 'line-through', color: theme.colors.textMuted }}
        >
          {formatSom(oldPrice)}
        </ThemedText>
      ) : null}
    </View>
  );
}
