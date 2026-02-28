import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Product } from '../types/models';
import { useTheme } from '../theme/ThemeProvider';
import { Badge } from './Badge';
import { PriceView } from './PriceView';
import { RatingStars } from './RatingStars';
import { ThemedText } from './ThemedText';

type Props = {
  product: Product;
  onPress?: () => void;
  width?: number;
  quickActionLabel?: string;
  onQuickActionPress?: () => void;
};

export function ProductCard({ product, onPress, width, quickActionLabel, onQuickActionPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: width ?? '48%',
        borderRadius: theme.radii.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        opacity: pressed ? 0.93 : 1,
        ...theme.shadows.card,
      })}
    >
      <View>
        <Image source={{ uri: product.images[0] }} style={{ width: '100%', aspectRatio: 1 }} />
        <View style={{ position: 'absolute', top: 8, left: 8, gap: 6 }}>
          {product.isSale ? <Badge label="Sale" tone="accent" /> : null}
          {product.isNew ? <Badge label="New" tone="primary" /> : null}
        </View>
      </View>

      <View style={{ padding: 10, gap: 6 }}>
        <ThemedText variant="caption" style={{ color: theme.colors.textMuted }} numberOfLines={1}>
          {product.brand}
        </ThemedText>
        <ThemedText variant="body" weight="medium" numberOfLines={2} style={{ minHeight: 42 }}>
          {product.title}
        </ThemedText>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} compact />
        <PriceView price={product.price} oldPrice={product.oldPrice} size="sm" />
        {quickActionLabel ? (
          <Pressable
            onPress={onQuickActionPress}
            style={({ pressed }) => ({
              marginTop: 2,
              minHeight: 30,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.primarySoft,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {quickActionLabel}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
