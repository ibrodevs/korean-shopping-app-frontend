import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';

import { Badge } from '../components/Badge';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusTimeline } from '../components/StatusTimeline';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useI18n } from '../contexts/I18nContext';
import { useOrders } from '../contexts/OrdersContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatDateTime, formatSom } from '../utils/format';

export function OrderDetailsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'OrderDetails'>) {
  const theme = useTheme();
  const { t } = useI18n();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { getOrderById, getOrderDetail } = useOrders();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cached = getOrderById(route.params.orderId);
  const [order, setOrder] = useState(cached);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const detail = await getOrderDetail(route.params.orderId);
        if (cancelled) return;
        setOrder(detail);
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : 'Failed to load order');
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getOrderDetail, route.params.orderId]);

  const orderItems = useMemo(() => order?.items ?? [], [order]);

  if (loading && !order) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ThemedText variant="subtitle">Loading order…</ThemedText>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ThemedText variant="subtitle">Order not found</ThemedText>
        {errorMessage ? (
          <ThemedText variant="caption" style={{ marginTop: 8, color: theme.colors.textMuted }}>
            {errorMessage}
          </ThemedText>
        ) : null}
      </ThemedView>
    );
  }

  const title = order.orderNumber ?? order.id;
  const subtotal = orderItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = order.discount ?? 0;
  const delivery = order.deliveryFee ?? 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }}>
        <View style={{ gap: 8, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <ThemedText weight="bold">{title}</ThemedText>
              <ThemedText variant="caption">{formatDateTime(order.createdAt)}</ThemedText>
            </View>
            <Badge
              label={order.status[0].toUpperCase() + order.status.slice(1)}
              tone={order.status === 'cancelled' ? 'danger' : order.status === 'delivered' ? 'accent' : order.status === 'processing' ? 'warning' : 'primary'}
            />
          </View>
          <StatusTimeline status={order.status} />
        </View>

        <View style={{ gap: 8, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <ThemedText variant="subtitle" style={{ fontSize: 16 }}>Pickup warehouse</ThemedText>
          <ThemedText weight="semibold">Bishkek Warehouse #1</ThemedText>
          <ThemedText variant="muted">115 Chui Ave, Bishkek • Main pickup desk • +996 555 102 030</ThemedText>
        </View>

        <View style={{ gap: 10 }}>
          <ThemedText variant="subtitle" style={{ fontSize: 16 }}>Items</ThemedText>
          {orderItems.map((line) => (
            <View key={`${order.id}-${line.id ?? line.sku ?? line.productName ?? ''}`} style={{ gap: 6, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText weight="semibold" numberOfLines={2}>
                    {line.productName ?? 'Item'}
                  </ThemedText>
                  {line.sku ? <ThemedText variant="caption">{line.sku}</ThemedText> : null}
                </View>
                <ThemedText variant="caption" style={{ fontWeight: '700' }}>
                  {formatSom((line.lineTotal ?? line.price * line.qty) || 0)}
                </ThemedText>
              </View>
              <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
                {t('Qty {{qty}}', { qty: line.qty })}
                {line.price ? ` • ${formatSom(line.price)} each` : ''}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={{ gap: 8, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <ThemedText variant="subtitle" style={{ fontSize: 16 }}>Pricing summary</ThemedText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText variant="caption">Subtotal</ThemedText>
            <ThemedText variant="caption">{formatSom(subtotal)}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText variant="caption">Discount</ThemedText>
            <ThemedText variant="caption" style={{ color: discount ? theme.colors.accent : undefined }}>
              {discount ? `- ${formatSom(discount)}` : formatSom(0)}
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText variant="caption">Import to warehouse</ThemedText>
            <ThemedText variant="caption">{delivery === 0 ? 'Free' : formatSom(delivery)}</ThemedText>
          </View>
          <View style={{ height: 1, backgroundColor: theme.colors.border }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText weight="semibold">Total</ThemedText>
            <ThemedText weight="bold">{formatSom(order.total)}</ThemedText>
          </View>
        </View>

        <PrimaryButton
          label="Reorder"
          onPress={() => {
            // Snapshot orders do not include product slugs; reorder requires an extra mapping layer.
            navigation.navigate('MainTabs', { screen: 'CartTab' });
          }}
        />

        {order.status === 'delivered' ? (
          <PrimaryButton label="Leave a review" variant="outline" onPress={() => setShowReviewModal(true)} />
        ) : null}
      </ScrollView>

      <Modal animationType="slide" transparent visible={showReviewModal} onRequestClose={() => setShowReviewModal(false)}>
        <View style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radii.xl, borderTopRightRadius: theme.radii.xl, padding: 16, gap: 10 }}>
            <ThemedText variant="subtitle">Leave a review</ThemedText>
            <ThemedText variant="muted">UI-only placeholder. Review submission is not connected in this frontend demo.</ThemedText>
            <PrimaryButton label="Close" onPress={() => setShowReviewModal(false)} />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
