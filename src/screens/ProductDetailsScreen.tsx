import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '../components/Badge';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { PriceView } from '../components/PriceView';
import { ProductRow } from '../components/ProductRow';
import { RatingStars } from '../components/RatingStars';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useToast } from '../contexts/ToastContext';
import { products } from '../data/mockData';
import { getProductById } from '../data/selectors';
import { getProductDetail } from '../api/catalog';
import { mapBackendProductDetailToUiProduct } from '../api/adapters';
import { extractApiErrorMessage } from '../api/client';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { hapticSelection } from '../utils/haptics';
import { Product } from '../types/models';

const SIZES = ['S', 'M', 'L'];
const COLORS = ['Ivory', 'Mint', 'Black'];

export function ProductDetailsScreen({ route }: NativeStackScreenProps<RootStackParamList, 'ProductDetails'>) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { addToCart, isFavorite, toggleFavorite } = useAppState();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Ivory');
  const [imageIndex, setImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const detail = await getProductDetail(route.params.productId, { lang: 'ru' });
        const ui = mapBackendProductDetailToUiProduct({ item: detail });
        if (cancelled) return;
        setProduct(ui);
      } catch (e) {
        const fallback = getProductById(route.params.productId);
        if (cancelled) return;
        if (fallback) {
          setProduct(fallback);
          setErrorMessage(null);
        } else {
          setErrorMessage(extractApiErrorMessage(e));
          setProduct(null);
        }
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [route.params.productId]);

  const recommendations = useMemo(
    () => products.filter((p) => p.id !== route.params.productId).slice(0, 4),
    [route.params.productId],
  );

  if (loading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView>
          <View style={{ padding: 16, gap: 8 }}>
            <ThemedText variant="subtitle">Loading product…</ThemedText>
            <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
              Please wait
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView>
          <View style={{ padding: 16 }}>
            <ThemedText variant="subtitle">Product not found</ThemedText>
            {errorMessage ? (
              <ThemedText variant="caption" style={{ color: theme.colors.textMuted, marginTop: 8 }}>
                {errorMessage}
              </ThemedText>
            ) : null}
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const stockTone =
    product.stockStatus === 'out_of_stock'
      ? 'danger'
      : product.stockStatus === 'low_stock'
        ? 'warning'
        : 'primary';

  const stockLabel =
    product.stockStatus === 'out_of_stock'
      ? 'Out of stock'
      : product.stockStatus === 'low_stock'
        ? 'Low stock'
        : 'In stock';

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={{ gap: 16 }}>
            <View>
              <FlatList
                data={product.images}
                keyExtractor={(item) => item}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const nextIndex = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                  setImageIndex(nextIndex);
                }}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width, height: width, backgroundColor: theme.colors.surfaceAlt }}
                    resizeMode="cover"
                  />
                )}
              />

              <View style={{ position: 'absolute', top: 14, right: 14 }}>
                <IconButton
                  icon={isFavorite(product.id) ? 'heart' : 'heart-outline'}
                  active={isFavorite(product.id)}
                  onPress={async () => {
                    await hapticSelection();
                    const willFavorite = !isFavorite(product.id);
                    toggleFavorite(product.id);
                    showToast(willFavorite ? 'Saved to favorites' : 'Removed from favorites');
                  }}
                />
              </View>

              <View style={{ position: 'absolute', left: 14, top: 14, gap: 6 }}>
                {product.isSale ? <Badge label="Sale" tone="accent" /> : null}
                {product.isNew ? <Badge label="New" tone="primary" /> : null}
              </View>

              <View
                style={{
                  position: 'absolute', bottom: 12, width: '100%', alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', gap: 6, backgroundColor: theme.colors.cardGlass, padding: 6, borderRadius: 999 }}>
                  {product.images.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: i === imageIndex ? theme.colors.accent : theme.colors.border,
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={{ paddingHorizontal: 16, gap: 14 }}>
              <View style={{ gap: 6 }}>
                <ThemedText variant="caption">{product.brand}</ThemedText>
                <ThemedText variant="subtitle" style={{ fontSize: 22, lineHeight: 28 }}>
                  {product.title}
                </ThemedText>
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
                <PriceView price={product.price} oldPrice={product.oldPrice} size="lg" />
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {product.tags.map((tag) => (
                  <Badge key={tag} label={tag} tone="neutral" />
                ))}
                <Badge label={stockLabel} tone={stockTone} />
              </View>

              <View style={{ gap: 10 }}>
                <ThemedText variant="body" weight="semibold">Size</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {SIZES.map((size) => {
                    const active = selectedSize === size;
                    return (
                      <Pressable
                        key={size}
                        onPress={() => setSelectedSize(size)}
                        style={{
                          minWidth: 48,
                          height: 40,
                          paddingHorizontal: 14,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: active ? theme.colors.primary : theme.colors.border,
                          backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ThemedText variant="caption" style={{ color: theme.colors.text, fontWeight: '700' }}>
                          {size}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={{ gap: 10 }}>
                <ThemedText variant="body" weight="semibold">Color</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                  {COLORS.map((color) => {
                    const active = selectedColor === color;
                    return (
                      <Pressable
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={{
                          height: 40,
                          paddingHorizontal: 14,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: active ? theme.colors.primary : theme.colors.border,
                          backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 6,
                        }}
                      >
                        {active ? <Ionicons name="ellipse" color={theme.colors.accent} size={8} /> : null}
                        <ThemedText variant="caption" style={{ color: theme.colors.text, fontWeight: '700' }}>
                          {color}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View
                style={{
                  padding: 12,
                  borderRadius: theme.radii.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <ThemedText variant="caption">
                  Static demo: checkout and inventory sync are not connected in Part 1.
                </ThemedText>
              </View>
            </View>

            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <PrimaryButton
                  label={justAdded ? 'Added to Cart' : 'Add to Cart'}
                  style={{ flex: 1 }}
                  onPress={() => {
                    hapticSelection();
                    addToCart({
                      productId: product.id,
                      qty: 1,
                      selectedSize,
                      selectedColor,
                    });
                    showToast('Added to cart', 'success');
                    setJustAdded(true);
                    setTimeout(() => setJustAdded(false), 1200);
                  }}
                  disabled={product.stockStatus === 'out_of_stock'}
                />
                <IconButton
                  icon={isFavorite(product.id) ? 'heart' : 'heart-outline'}
                  active={isFavorite(product.id)}
                  onPress={async () => {
                    await hapticSelection();
                    const willFavorite = !isFavorite(product.id);
                    toggleFavorite(product.id);
                    showToast(willFavorite ? 'Saved to favorites' : 'Removed from favorites');
                  }}
                />
              </View>
              {product.stockStatus === 'out_of_stock' ? (
                <ThemedText variant="caption" style={{ color: theme.colors.danger }}>
                  This item is currently unavailable.
                </ThemedText>
              ) : null}
            </View>

            <View style={{ paddingHorizontal: 16, gap: 12 }}>
              <ThemedText variant="subtitle">You may also like</ThemedText>
              {recommendations.map((item) => (
                <ProductRow key={item.id} product={item} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
