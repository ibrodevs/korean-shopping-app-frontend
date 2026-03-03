import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { CartItem, Product } from '../types/models';
import { getCartLineKey } from '../utils/pricing';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeProvider';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { PriceView } from './PriceView';
import { QuantityStepper } from './QuantityStepper';
import { ThemedText } from './ThemedText';

type Props = {
  item: CartItem;
  product?: Product;
  onPressProduct?: () => void;
  onQtyChange: (lineKey: string, qty: number) => void;
  onRemove: (lineKey: string) => void;
  onSaveForLater?: (lineKey: string) => void;
};

export function CartItemRow({ item, product, onPressProduct, onQtyChange, onRemove, onSaveForLater }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const lineKey = getCartLineKey(item);
  const outOfStock = product?.stockStatus === 'out_of_stock';

  return (
    <View
      style={{
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: 10,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={onPressProduct}>
          <Image
            source={{ uri: product?.images[0] }}
            style={{ width: 78, height: 78, borderRadius: 14, backgroundColor: theme.colors.surfaceAlt }}
          />
        </Pressable>
        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText variant="caption">{product?.brand ?? 'Unknown brand'}</ThemedText>
          <Pressable onPress={onPressProduct}>
            <ThemedText numberOfLines={2} weight="medium">{product?.title ?? 'Product unavailable'}</ThemedText>
          </Pressable>
          <PriceView price={product?.price ?? 0} oldPrice={product?.oldPrice} size="sm" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {item.selectedSize ? <Badge label={t('Size {{value}}', { value: item.selectedSize })} tone="neutral" /> : null}
            {item.selectedColor ? <Badge label={item.selectedColor} tone="neutral" /> : null}
            {outOfStock ? <Badge label="Out of stock" tone="danger" /> : null}
          </View>
        </View>
        <IconButton icon="trash-outline" size={18} onPress={() => onRemove(lineKey)} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <QuantityStepper value={item.qty} onChange={(qty) => onQtyChange(lineKey, qty)} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {onSaveForLater ? (
            <Pressable
              onPress={() => onSaveForLater(lineKey)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, flexDirection: 'row', gap: 4, alignItems: 'center' })}
            >
              <Ionicons name="heart-outline" size={14} color={theme.colors.accent} />
              <ThemedText variant="caption" style={{ color: theme.colors.accent, fontWeight: '700' }}>
                Save for later
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
