import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';

import { Badge } from '../components/Badge';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProductRow } from '../components/ProductRow';
import { StatusTimeline } from '../components/StatusTimeline';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useOrders } from '../contexts/OrdersContext';
import { products } from '../data/mockData';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatDateTime, formatSom } from '../utils/format';

export function OrderDetailsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'OrderDetails'>) {
  const theme = useTheme();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { getOrderById } = useOrders();
  const { addManyToCart } = useAppState();
  const order = getOrderById(route.params.orderId);

  const orderProducts = useMemo(
    () =>
      order?.items.map((line) => ({
        line,
        product: products.find((p) => p.id === line.productId),
      })) ?? [],
    [order],
  );

  if (!order) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ThemedText variant="subtitle">Order not found</ThemedText>
      </ThemedView>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = order.discount ?? 0;
  const delivery = order.deliveryFee ?? 3000;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }}>
        <View style={{ gap: 8, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <ThemedText weight="bold">{order.id}</ThemedText>
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
          {orderProducts.map(({ line, product }) =>
            product ? (
              <View key={`${order.id}-${line.productId}-${line.selectedSize ?? ''}-${line.selectedColor ?? ''}`} style={{ gap: 6 }}>
                <ProductRow
                  product={product}
                  onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                  <ThemedText variant="caption">
                    Qty {line.qty}
                    {line.selectedSize ? ` • Size ${line.selectedSize}` : ''}
                    {line.selectedColor ? ` • ${line.selectedColor}` : ''}
                  </ThemedText>
                  <ThemedText variant="caption">{formatSom(line.price * line.qty)}</ThemedText>
                </View>
              </View>
            ) : null,
          )}
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
            addManyToCart(
              order.items.map((item) => ({
                productId: item.productId,
                qty: item.qty,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
              })),
            );
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
