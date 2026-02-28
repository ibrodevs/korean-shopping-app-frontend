import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { CategoryChip } from '../components/CategoryChip';
import { IconButton } from '../components/IconButton';
import { ProductCard } from '../components/ProductCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { categories, products } from '../data/mockData';
import { useTheme } from '../theme/ThemeProvider';
import { CatalogScreenProps } from '../types/navigation';
import { CatalogSortOption } from '../types/ui';

const sortLabels: Record<CatalogSortOption, string> = {
  popular: 'Popularity',
  newest: 'Newest',
  price_asc: 'Price ↑',
  price_desc: 'Price ↓',
};

const sortCycle: CatalogSortOption[] = ['popular', 'newest', 'price_asc', 'price_desc'];

export function CatalogScreen({ navigation }: CatalogScreenProps) {
  const theme = useTheme();
  const {
    catalogSort,
    setCatalogSort,
    catalogFilters,
  } = useAppState();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategoryId) {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    const minPrice = Number(catalogFilters.minPrice || 0);
    const maxPrice = Number(catalogFilters.maxPrice || 0);
    if (catalogFilters.minPrice.trim()) result = result.filter((p) => p.price >= minPrice);
    if (catalogFilters.maxPrice.trim()) result = result.filter((p) => p.price <= maxPrice);
    if (catalogFilters.ratingMin > 0) result = result.filter((p) => p.rating >= catalogFilters.ratingMin);
    if (catalogFilters.tags.length) {
      result = result.filter((p) => catalogFilters.tags.every((tag) => p.tags.includes(tag)));
    }
    if (catalogFilters.inStockOnly) {
      result = result.filter((p) => p.stockStatus !== 'out_of_stock');
    }
    if (catalogFilters.saleOnly) {
      result = result.filter((p) => p.isSale);
    }

    if (catalogSort === 'price_asc') return [...result].sort((a, b) => a.price - b.price);
    if (catalogSort === 'price_desc') return [...result].sort((a, b) => b.price - a.price);
    if (catalogSort === 'newest') return [...result].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return [...result].sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
  }, [catalogFilters, catalogSort, query, selectedCategoryId]);

  const appliedFilterPills = useMemo(() => {
    const pills: string[] = [];
    if (catalogFilters.minPrice.trim() || catalogFilters.maxPrice.trim()) {
      const min = catalogFilters.minPrice || '0';
      const max = catalogFilters.maxPrice ? `${catalogFilters.maxPrice} сом` : 'Any';
      pills.push(`${min} сом - ${max}`);
    }
    if (catalogFilters.ratingMin) pills.push(`${catalogFilters.ratingMin}+ stars`);
    if (catalogFilters.inStockOnly) pills.push('In stock');
    if (catalogFilters.saleOnly) pills.push('On sale');
    if (catalogFilters.tags.length) pills.push(...catalogFilters.tags.slice(0, 3));
    return pills;
  }, [catalogFilters]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: 14 }}>
          <AppHeader
            title="Catalog"
            subtitle="Browse curated Korean products"
            searchPlaceholder="Search in catalog"
            searchValue={query}
            onChangeSearch={setQuery}
            editableSearch
          />

          <FlatList
            data={[{ id: 'all', title: 'All', iconName: 'apps-outline' }, ...categories]}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <CategoryChip
                category={item}
                active={(item.id === 'all' && !selectedCategoryId) || item.id === selectedCategoryId}
                onPress={() => setSelectedCategoryId(item.id === 'all' ? null : item.id)}
              />
            )}
          />

          {appliedFilterPills.length > 0 ? (
            <FlatList
              data={appliedFilterPills}
              keyExtractor={(item, index) => `${item}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <View style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.border }}>
                  <ThemedText variant="caption" style={{ color: theme.colors.text, fontWeight: '700' }}>{item}</ThemedText>
                </View>
              )}
            />
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={() => {
                const currentIndex = sortCycle.indexOf(catalogSort);
                const nextSort = sortCycle[(currentIndex + 1) % sortCycle.length];
                setCatalogSort(nextSort);
              }}
              style={{
                flex: 1,
                minHeight: 42,
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
                Sort
              </ThemedText>
              <ThemedText variant="caption" style={{ color: theme.colors.text, fontWeight: '700' }}>
                {sortLabels[catalogSort]}
              </ThemedText>
            </Pressable>
            <IconButton
              icon="options-outline"
              onPress={() => navigation.getParent()?.getParent()?.navigate('FiltersModal')}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <ThemedText variant="subtitle">Products</ThemedText>
            <ThemedText variant="caption">{filteredProducts.length} items</ThemedText>
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
            columnWrapperStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.getParent()?.getParent()?.navigate('ProductDetails', {
                    productId: item.id,
                  })
                }
              />
            )}
            ListFooterComponent={
              <View
                style={{
                  marginTop: 4,
                  padding: 14,
                  borderRadius: theme.radii.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  alignItems: 'center',
                }}
              >
                <ThemedText variant="caption" style={{ textAlign: 'center' }}>
                  End of demo list. In production, this area would load more items.
                </ThemedText>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
