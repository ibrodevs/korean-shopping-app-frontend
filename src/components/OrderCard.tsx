import React from 'react';
import { Pressable, View } from 'react-native';

import { Order } from '../types/models';
import { formatDateTime, formatSom } from '../utils/format';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeProvider';
import { Badge } from './Badge';
import { ThemedText } from './ThemedText';

const statusToneMap = {
  processing: 'warning',
  shipped: 'primary',
  delivered: 'accent',
  cancelled: 'danger',
} as const;

type Props = {
  order: Order;
  onPress?: () => void;
};

export function OrderCard({ order, onPress }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const title = order.orderNumber ?? order.id;
  const itemCount = order.totalItems ?? order.items.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: 12,
        gap: 8,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <ThemedText weight="semibold">{title}</ThemedText>
          <ThemedText variant="caption">{formatDateTime(order.createdAt)}</ThemedText>
        </View>
        <Badge label={order.status[0].toUpperCase() + order.status.slice(1)} tone={statusToneMap[order.status]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText variant="caption">{t('{{count}} items', { count: itemCount })}</ThemedText>
        <ThemedText variant="caption" style={{ color: theme.colors.text, fontWeight: '700' }}>
          {formatSom(order.total)}
        </ThemedText>
      </View>
    </Pressable>
  );
}
