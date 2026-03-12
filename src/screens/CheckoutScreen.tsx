import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useI18n } from '../contexts/I18nContext';
import { useOrders } from '../contexts/OrdersContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatSom } from '../utils/format';
import { hapticSuccess, hapticWarning } from '../utils/haptics';
import { calcDelivery, calcDiscount, calcSubtotal, calcTotal } from '../utils/pricing';
import { extractApiErrorMessage } from '../api/client';
import { bulkAddToCart, clearCart as clearBackendCart } from '../api/cart';
import { BackendPickupLocation, checkoutOrderFromCart, listPickupLocations } from '../api/orders';
import { useUiProductsBySlugs } from '../hooks/useUiProductsBySlugs';
import { getBackendProductDetailCached } from '../api/productDetailsCache';
import { CheckoutPaymentMethod } from '../types/models';

const arrivalSlots = [
  'Next arrival: Mon, 18:00 - 21:00',
  'Next arrival: Tue, 18:00 - 21:00',
  'Next arrival: Wed, 18:00 - 21:00',
];

function formatPickupLocationDetail(location: BackendPickupLocation): string {
  return [location.address, location.address_line2, location.city, location.phone].filter(Boolean).join(' • ');
}

function formatPaymentMethodLabel(method: CheckoutPaymentMethod): string {
  switch (method) {
    case 'card':
      return 'Bank card';
    case 'mbank':
      return 'MBank';
    case 'elqr':
      return 'ELQR';
    case 'cash':
    default:
      return 'Cash on pickup';
  }
}

export function CheckoutScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Checkout'>) {
  const theme = useTheme();
  const { t } = useI18n();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [pickupLocationsLoading, setPickupLocationsLoading] = useState(false);
  const [pickupLocationsError, setPickupLocationsError] = useState<string | null>(null);
  const {
    cartItems,
    checkoutDraft,
    setCheckoutAddress,
    setCheckoutDeliveryTime,
    clearCart,
    resetCheckoutDraft,
  } = useAppState();
  const { refreshOrders } = useOrders();
  const { isAuthenticated, user, requestAuthorizedJson } = useAuth();
  const { showToast } = useToast();

  const { products: backendProducts, productsById: backendProductsById } = useUiProductsBySlugs(
    cartItems.map((x) => x.productId),
    { lang: 'ru' },
  );
  const resolvedRows = useMemo(
    () => cartItems.map((item) => ({ item, product: backendProductsById[item.productId] })),
    [backendProductsById, cartItems],
  );

  const subtotal = calcSubtotal(cartItems, backendProducts);
  const discount = calcDiscount(subtotal, checkoutDraft.couponCode);
  const delivery = calcDelivery(subtotal);
  const total = calcTotal(subtotal, discount, delivery);
  const hasOutOfStock = resolvedRows.some((row) => row.product?.stockStatus === 'out_of_stock');
  const hasPickupSelection = checkoutDraft.pickupLocationId !== null;
  const canPlace = cartItems.length > 0 && !hasOutOfStock && !placingOrder && hasPickupSelection && !pickupLocationsLoading;

  useEffect(() => {
    if (!isAuthenticated) {
      setPickupLocationsError(null);
      setPickupLocationsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setPickupLocationsLoading(true);
        setPickupLocationsError(null);

        const locations = await listPickupLocations(requestAuthorizedJson);
        if (cancelled) return;

        if (!locations.length) {
          setPickupLocationsError('No active pickup locations are available right now.');
          return;
        }

        const selected = checkoutDraft.pickupLocationId
          ? locations.find((location) => location.id === checkoutDraft.pickupLocationId)
          : null;
        const nextLocation = selected ?? locations[0];
        const nextDetail = formatPickupLocationDetail(nextLocation);

        if (
          checkoutDraft.pickupLocationId !== nextLocation.id ||
          checkoutDraft.addressLabel !== nextLocation.name ||
          checkoutDraft.addressDetail !== nextDetail
        ) {
          setCheckoutAddress(nextLocation.name, nextDetail, nextLocation.id);
        }
      } catch (error) {
        if (cancelled) return;
        setPickupLocationsError(extractApiErrorMessage(error));
      } finally {
        if (!cancelled) setPickupLocationsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    checkoutDraft.addressDetail,
    checkoutDraft.addressLabel,
    checkoutDraft.pickupLocationId,
    isAuthenticated,
    requestAuthorizedJson,
    setCheckoutAddress,
  ]);

  const resolveDefaultVariantIds = async () => {
    const uniqueSlugs = Array.from(new Set(cartItems.map((x) => x.productId)));
    const details = await Promise.all(uniqueSlugs.map((slug) => getBackendProductDetailCached(slug, { lang: 'ru' })));
    const slugToVariantId = new Map<string, number>();

    for (const detail of details) {
      const defaultVariant = detail.variants.find((v) => v.is_default) ?? detail.variants[0];
      if (!defaultVariant?.id) {
        throw new Error(`No active variant found for ${detail.slug}`);
      }
      slugToVariantId.set(detail.slug, defaultVariant.id);
    }

    const variantIdToQty = new Map<number, number>();
    for (const item of cartItems) {
      const variantId = slugToVariantId.get(item.productId);
      if (!variantId) throw new Error(`Missing variant mapping for ${item.productId}`);
      variantIdToQty.set(variantId, (variantIdToQty.get(variantId) ?? 0) + item.qty);
    }

    return Array.from(variantIdToQty.entries()).map(([variant_id, quantity]) => ({ variant_id, quantity }));
  };

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
            value={pickupLocationsLoading ? 'Loading active pickup locations...' : checkoutDraft.addressDetail}
            onPress={() => navigation.navigate('AddressBook')}
          />
          {pickupLocationsError ? (
            <ThemedText variant="caption" style={{ color: theme.colors.danger }}>
              {pickupLocationsError}
            </ThemedText>
          ) : null}
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
          <NavRow
            label="Selected"
            value={formatPaymentMethodLabel(checkoutDraft.paymentMethod)}
            onPress={() => navigation.navigate('PaymentMethod')}
          />
        </Section>

        <Section title="Items preview">
          <View style={{ gap: 8 }}>
            {resolvedRows.slice(0, 3).map(({ item, product }) => (
              <View key={`${item.productId}:${item.selectedColor ?? ''}:${item.selectedSize ?? ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="caption">{product?.brand}</ThemedText>
                  <ThemedText numberOfLines={1}>{product?.title ?? 'Unavailable product'}</ThemedText>
                </View>
                <ThemedText variant="caption">{t('x{{qty}}', { qty: item.qty })}</ThemedText>
              </View>
            ))}
            {resolvedRows.length > 3 ? (
              <ThemedText variant="caption">{t('+{{count}} more items', { count: resolvedRows.length - 3 })}</ThemedText>
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
          {!pickupLocationsLoading && !hasPickupSelection ? (
            <ThemedText variant="caption" style={{ color: theme.colors.danger }}>
              Select an active pickup location before placing an order.
            </ThemedText>
          ) : null}
          <PrimaryButton
            label={cartItems.length === 0 ? 'Cart is empty' : 'Place Order'}
            disabled={!canPlace}
            loading={placingOrder}
            onPress={async () => {
              if (hasOutOfStock || cartItems.length === 0 || !checkoutDraft.pickupLocationId) {
                hapticWarning();
                if (!checkoutDraft.pickupLocationId) {
                  showToast('Select a pickup location before checkout', 'warning');
                }
                return;
              }
              if (!isAuthenticated) {
                hapticWarning();
                showToast('Please sign in to place an order', 'warning');
                navigation.navigate('AuthWelcome');
                return;
              }

              setPlacingOrder(true);
              try {
                const bulkItems = await resolveDefaultVariantIds();

                // Keep backend cart in sync with local cart for checkout.
                await clearBackendCart(requestAuthorizedJson);
                await bulkAddToCart(requestAuthorizedJson, bulkItems);

                const placed = await checkoutOrderFromCart(requestAuthorizedJson, {
                  customer_phone: '+996700000000',
                  first_name: user?.firstName || 'Customer',
                  last_name: user?.lastName || '',
                  address_line2: checkoutDraft.addressDetail || '',
                  postal_code: '',
                  delivery_comment: checkoutDraft.deliveryTime || '',
                  delivery_method: 'pickup',
                  pickup_location_id: checkoutDraft.pickupLocationId,
                  payment_method: checkoutDraft.paymentMethod,
                });

                clearCart();
                resetCheckoutDraft();
                await refreshOrders();

                hapticSuccess();
                showToast('Order placed', 'success');
                navigation.replace('Success', { orderId: String(placed.id) });
              } catch (e) {
                hapticWarning();
                showToast(extractApiErrorMessage(e), 'warning');
              } finally {
                setPlacingOrder(false);
              }
            }}
          />
        </Section>
      </ScrollView>
    </ThemedView>
  );
}
