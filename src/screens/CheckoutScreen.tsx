import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useOrders } from '../contexts/OrdersContext';
import { useToast } from '../contexts/ToastContext';
import { products } from '../data/mockData';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatSom } from '../utils/format';
import { hapticSuccess, hapticWarning } from '../utils/haptics';
import { calcDelivery, calcDiscount, calcSubtotal, calcTotal } from '../utils/pricing';

const arrivalSlots = [
  'Next arrival: Mon, 18:00 - 21:00',
  'Next arrival: Tue, 18:00 - 21:00',
  'Next arrival: Wed, 18:00 - 21:00',
];

export function CheckoutScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Checkout'>) {
  const theme = useTheme();
  const [placingOrder, setPlacingOrder] = useState(false);
  const {
    cartItems,
    checkoutDraft,
    setCheckoutDeliveryTime,
    clearCart,
    resetCheckoutDraft,
  } = useAppState();
  const { createOrderFromCart } = useOrders();
  const { showToast } = useToast();

  const resolvedRows = useMemo(
    () => cartItems.map((item) => ({ item, product: products.find((p) => p.id === item.productId) })),
    [cartItems],
  );

  const subtotal = calcSubtotal(cartItems, products);
  const discount = calcDiscount(subtotal, checkoutDraft.couponCode);
  const delivery = calcDelivery(subtotal);
  const total = calcTotal(subtotal, discount, delivery);
  const hasOutOfStock = resolvedRows.some((row) => row.product?.stockStatus === 'out_of_stock');
  const canPlace = cartItems.length > 0 && !hasOutOfStock && !placingOrder;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View
      style={{
        gap: 10,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: 12,
      }}
    >
      <ThemedText variant="subtitle" style={{ fontSize: 16 }}>{title}</ThemedText>
      {children}
    </View>
  );

  const NavRow = ({ label, value, onPress }: { label: string; value: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        paddingVertical: 2,
      })}
    >
      <ThemedText variant="caption">{label}</ThemedText>
      <ThemedText weight="semibold">{value}</ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }}>
        <Section title="Pickup warehouse">
          <NavRow
            label={checkoutDraft.addressLabel}
            value={checkoutDraft.addressDetail}
            onPress={() => navigation.navigate('AddressBook')}
          />
        </Section>

        <Section title="Expected arrival window">
          <View style={{ gap: 8 }}>
            {arrivalSlots.map((slot) => {
              const active = checkoutDraft.deliveryTime === slot;
              return (
                <Pressable
                  key={slot}
                  onPress={() => setCheckoutDeliveryTime(slot)}
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                    padding: 10,
                  }}
                >
                  <ThemedText variant="caption" style={{ fontWeight: '700', color: theme.colors.text }}>
                    {slot}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Payment method">
          <NavRow label="Selected" value={checkoutDraft.paymentMethod} onPress={() => navigation.navigate('PaymentMethod')} />
        </Section>

        <Section title="Items preview">
          <View style={{ gap: 8 }}>
            {resolvedRows.slice(0, 3).map(({ item, product }) => (
              <View key={`${item.productId}:${item.selectedColor ?? ''}:${item.selectedSize ?? ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="caption">{product?.brand}</ThemedText>
                  <ThemedText numberOfLines={1}>{product?.title ?? 'Unavailable product'}</ThemedText>
                </View>
                <ThemedText variant="caption">x{item.qty}</ThemedText>
              </View>
            ))}
            {resolvedRows.length > 3 ? (
              <ThemedText variant="caption">+{resolvedRows.length - 3} more items</ThemedText>
            ) : null}
          </View>
        </Section>

        <Section title="Coupon">
          <NavRow
            label="Applied coupon"
            value={checkoutDraft.couponCode ?? 'None'}
            onPress={() => navigation.navigate('ApplyCouponModal')}
          />
          {checkoutDraft.couponCode ? (
            <ThemedText variant="caption" style={{ color: theme.colors.accent, fontWeight: '700' }}>
              Coupon applied
            </ThemedText>
          ) : null}
        </Section>

        <Section title="Summary">
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText variant="caption">Subtotal</ThemedText>
              <ThemedText variant="caption">{formatSom(subtotal)}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText variant="caption">Discount</ThemedText>
              <ThemedText variant="caption" style={{ color: discount ? theme.colors.accent : theme.colors.textMuted }}>
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
              <ThemedText weight="bold">{formatSom(total)}</ThemedText>
            </View>
          </View>
          {hasOutOfStock ? (
            <ThemedText variant="caption" style={{ color: theme.colors.danger }}>
              Remove out-of-stock items from cart before placing an order.
            </ThemedText>
          ) : null}
          <PrimaryButton
            label={cartItems.length === 0 ? 'Cart is empty' : 'Place Order'}
            disabled={!canPlace}
            loading={placingOrder}
            onPress={() => {
              if (hasOutOfStock || cartItems.length === 0) {
                hapticWarning();
                return;
              }
              setPlacingOrder(true);
              const order = createOrderFromCart({
                cartItems,
                subtotal,
                discount,
                deliveryFee: delivery,
                total,
                couponCode: checkoutDraft.couponCode,
              });
              clearCart();
              resetCheckoutDraft();
              setTimeout(() => {
                hapticSuccess();
                showToast('Order placed', 'success');
                setPlacingOrder(false);
                navigation.replace('Success', { orderId: order.id });
              }, 500);
            }}
          />
        </Section>
      </ScrollView>
    </ThemedView>
  );
}
