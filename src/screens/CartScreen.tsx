import React, { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { CartItemRow } from '../components/CartItemRow';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useToast } from '../contexts/ToastContext';
import { products } from '../data/mockData';
import { useTheme } from '../theme/ThemeProvider';
import { CartScreenProps } from '../types/navigation';
import { formatSom } from '../utils/format';
import { hapticSelection } from '../utils/haptics';
import { calcDelivery, calcDiscount, calcSubtotal, calcTotal } from '../utils/pricing';

export function CartScreen({ navigation }: CartScreenProps) {
  const theme = useTheme();
  const {
    cartItems,
    updateCartItemQty,
    removeCartItem,
    saveForLater,
    checkoutDraft,
  } = useAppState();
  const { showToast } = useToast();

  const cartRows = useMemo(
    () =>
      cartItems.map((item) => ({
        item,
        product: products.find((p) => p.id === item.productId),
      })),
    [cartItems],
  );

  const subtotal = calcSubtotal(cartItems, products);
  const discount = calcDiscount(subtotal, checkoutDraft.couponCode);
  const delivery = calcDelivery(subtotal);
  const total = calcTotal(subtotal, discount, delivery);
  const hasOutOfStock = cartRows.some((row) => row.product?.stockStatus === 'out_of_stock');
  const canCheckout = cartItems.length > 0 && !hasOutOfStock;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
          <AppHeader title="Cart" subtitle="Review your items before checkout" />

          {cartRows.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
              <EmptyState
                icon="cart-outline"
                title="Your cart is empty"
                description="Add products from the catalog to start building your order."
                ctaLabel="Go to Catalog"
                onPressCta={() => navigation.getParent()?.navigate('CatalogTab')}
              />
            </View>
          ) : (
            <>
              <FlatList
                data={cartRows}
                keyExtractor={({ item }) => `${item.productId}:${item.selectedSize ?? ''}:${item.selectedColor ?? ''}`}
                contentContainerStyle={{ gap: 10, paddingTop: 14, paddingBottom: 210 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: row }) => (
                  <CartItemRow
                    item={row.item}
                    product={row.product}
                    onPressProduct={() =>
                      row.product &&
                      navigation.getParent()?.getParent()?.navigate('ProductDetails', {
                        productId: row.product.id,
                      })
                    }
                    onQtyChange={updateCartItemQty}
                    onRemove={removeCartItem}
                    onSaveForLater={async (lineKey) => {
                      await hapticSelection();
                      saveForLater(lineKey);
                      showToast('Saved to favorites', 'success');
                    }}
                  />
                )}
              />

              <View
                style={{
                  position: 'absolute',
                  left: 16,
                  right: 16,
                  bottom: 12,
                  borderRadius: theme.radii.xl,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  padding: 14,
                  gap: 10,
                  ...theme.shadows.card,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ThemedText variant="caption">Subtotal</ThemedText>
                  <ThemedText variant="caption" style={{ color: theme.colors.text }}>{formatSom(subtotal)}</ThemedText>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ThemedText variant="caption">Discount</ThemedText>
                  <ThemedText variant="caption" style={{ color: discount ? theme.colors.accent : theme.colors.textMuted, fontWeight: discount ? '700' : '400' }}>
                    {discount ? `- ${formatSom(discount)}` : formatSom(0)}
                  </ThemedText>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ThemedText variant="caption">Import to warehouse</ThemedText>
                  <ThemedText variant="caption" style={{ color: theme.colors.text }}>
                    {delivery === 0 ? 'Free' : formatSom(delivery)}
                  </ThemedText>
                </View>
                <View style={{ height: 1, backgroundColor: theme.colors.border }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ThemedText weight="semibold">Total</ThemedText>
                  <ThemedText weight="bold">{formatSom(total)}</ThemedText>
                </View>
                {hasOutOfStock ? (
                  <ThemedText variant="caption" style={{ color: theme.colors.danger }}>
                    Remove out-of-stock items to continue checkout.
                  </ThemedText>
                ) : null}
                <PrimaryButton
                  label="Checkout"
                  disabled={!canCheckout}
                  onPress={() => navigation.getParent()?.getParent()?.navigate('Checkout')}
                />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
