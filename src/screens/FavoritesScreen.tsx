import React, { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { useAppState } from '../contexts/AppStateContext';
import { useToast } from '../contexts/ToastContext';
import { products } from '../data/mockData';
import { useTheme } from '../theme/ThemeProvider';
import { FavoritesScreenProps } from '../types/navigation';
import { ThemedView } from '../components/ThemedView';
import { hapticSelection } from '../utils/haptics';

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const theme = useTheme();
  const { favoriteIds, addToCart } = useAppState();
  const { showToast } = useToast();

  const items = useMemo(
    () => products.filter((product) => favoriteIds.includes(product.id)),
    [favoriteIds],
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
          <AppHeader title="Favorites" subtitle="Saved products for later" />

          {items.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
              <EmptyState
                icon="heart-outline"
                title="No favorites yet"
                description="Tap the heart on any product to save it here."
                ctaLabel="Explore Catalog"
                onPressCta={() => navigation.getParent()?.navigate('CatalogTab')}
              />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={{ gap: 12, paddingTop: 14, paddingBottom: 100 }}
              columnWrapperStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() =>
                    navigation.getParent()?.getParent()?.navigate('ProductDetails', { productId: item.id })
                  }
                  quickActionLabel={item.stockStatus === 'out_of_stock' ? 'Unavailable' : 'Add to cart'}
                  onQuickActionPress={
                    item.stockStatus === 'out_of_stock'
                      ? undefined
                      : async () => {
                          await hapticSelection();
                          addToCart({ productId: item.id, qty: 1 });
                          showToast('Added to cart', 'success');
                        }
                  }
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
