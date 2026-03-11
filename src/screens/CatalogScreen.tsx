import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { CategoryChip } from '../components/CategoryChip';
import { IconButton } from '../components/IconButton';
import { ProductCard } from '../components/ProductCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { getAllBrands, getCategoryTree, getProducts } from '../api/catalog';
import {
  buildBrandIdToNameMap,
  buildCategoryIdToSlugMap,
  mapBackendCategoryToUiCategory,
  mapBackendProductListItemToUiProduct,
} from '../api/adapters';
import { useTheme } from '../theme/ThemeProvider';
import { CatalogScreenProps } from '../types/navigation';
import { CatalogSortOption } from '../types/ui';
import { Category, Product } from '../types/models';
import { extractApiErrorMessage } from '../api/client';

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

  const [uiCategories, setUiCategories] = useState<Category[]>([]);
  const [categoryIdToSlug, setCategoryIdToSlug] = useState<Map<number, string> | null>(null);
  const [brandIdToName, setBrandIdToName] = useState<Map<number, string> | null>(null);

  const [productsFromApi, setProductsFromApi] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErrorMessage(null);
        const tree = await getCategoryTree({ lang: 'ru' });
        // Show only top-level categories in the UI (parent categories).
        const ui = tree.map(mapBackendCategoryToUiCategory);
        const map = buildCategoryIdToSlugMap(tree);

        // Brands are optional; if backend doesn't include brand_name, this map helps.
        // We intentionally keep this lightweight and resilient.
        const brands = await getAllBrands({ lang: 'ru', limit: 100 });
        const brandMap = buildBrandIdToNameMap(brands);

        if (cancelled) return;
        setUiCategories(ui);
        setCategoryIdToSlug(map);
        setBrandIdToName(brandMap);
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(extractApiErrorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      (async () => {
        try {
          setLoading(true);
          setErrorMessage(null);

          const ordering =
            catalogSort === 'newest'
              ? '-created_at'
              : catalogSort === 'price_asc'
                ? 'min_price'
                : catalogSort === 'price_desc'
                  ? '-min_price'
                  : '-created_at';

          const page = await getProducts({
            lang: 'ru',
            limit: 100,
            offset: 0,
            search: query.trim() || undefined,
            category: selectedCategoryId || undefined,
            priceMin: catalogFilters.minPrice.trim() || undefined,
            priceMax: catalogFilters.maxPrice.trim() || undefined,
            ordering,
          });

          const mapped = page.results.map((item) =>
            mapBackendProductListItemToUiProduct({
              item,
              categoryIdToSlug: categoryIdToSlug ?? undefined,
              brandIdToName: brandIdToName ?? undefined,
            }),
          );

          if (cancelled) return;
          setProductsFromApi(mapped);
        } catch (e) {
          if (cancelled) return;
          setErrorMessage(extractApiErrorMessage(e));
        } finally {
          if (cancelled) return;
          setLoading(false);
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [brandIdToName, catalogFilters, catalogSort, categoryIdToSlug, query, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    let result = productsFromApi;

    // Category/search/price are already applied via API.

    // Keep UI-only filters (sale/stock/tags/rating) local.
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

    // Sorting is handled by API ordering.
    return result;
  }, [catalogFilters, productsFromApi]);

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
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: 12 }}>
          <AppHeader
            title="Catalog"
            subtitle="Browse curated Korean products"
            searchPlaceholder="Search in catalog"
            searchValue={query}
            onChangeSearch={setQuery}
            editableSearch
          />

          <FlatList
            data={[{ id: 'all', title: 'All', iconName: 'apps-outline' }, ...uiCategories]}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ maxHeight: 44 }}
            contentContainerStyle={{ gap: 8, alignItems: 'center', paddingVertical: 2 }}
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
              style={{ maxHeight: 40 }}
              contentContainerStyle={{ gap: 8, alignItems: 'center', paddingVertical: 2 }}
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

          {errorMessage ? (
            <View
              style={{
                padding: 12,
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <ThemedText variant="caption" style={{ color: theme.colors.text }}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : null}

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
                  {loading ? 'Loading products…' : 'End of list.'}
                </ThemedText>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
