import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Product } from '../types/models';
import { useTheme } from '../theme/ThemeProvider';
import { PriceView } from './PriceView';
import { RatingStars } from './RatingStars';
import { ThemedText } from './ThemedText';

type Props = {
  product: Product;
  onPress?: () => void;
};

export function ProductRow({ product, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 10,
        opacity: pressed ? 0.94 : 1,
      })}
    >
      <Image source={{ uri: product.images[0] }} style={{ width: 76, height: 76, borderRadius: 14 }} />
      <View style={{ flex: 1, gap: 4 }}>
        <ThemedText variant="caption">{product.brand}</ThemedText>
        <ThemedText weight="medium" numberOfLines={2}>{product.title}</ThemedText>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} compact />
        <PriceView price={product.price} oldPrice={product.oldPrice} size="sm" />
      </View>
    </Pressable>
  );
}
