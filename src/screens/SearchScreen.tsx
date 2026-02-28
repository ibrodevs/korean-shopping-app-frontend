import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { ProductRow } from '../components/ProductRow';
import { SkeletonBlock } from '../components/SkeletonBlock';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { APP_STRINGS, TRENDING_SEARCHES } from '../constants/strings';
import { useAppState } from '../contexts/AppStateContext';
import { useToast } from '../contexts/ToastContext';
import { products } from '../data/mockData';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { hapticSelection } from '../utils/haptics';

export function SearchScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Search'>) {
  const theme = useTheme();
  const { showToast } = useToast();
  const { recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch } = useAppState();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const timeout = setTimeout(() => {
      addRecentSearch(trimmed);
    }, 300);
    return () => clearTimeout(timeout);
  }, [addRecentSearch, query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [query]);

  const suggestionChips = query.trim() ? [] : TRENDING_SEARCHES;

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 14 }}>
      <AppHeader
        title="Search"
        subtitle="Find products quickly"
        searchPlaceholder="Type product, brand or tag"
        searchValue={query}
        onChangeSearch={setQuery}
        editableSearch
        rightNode={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={async () => {
                await hapticSelection();
                showToast('Voice search is not available in demo');
              }}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Ionicons name="mic-outline" size={18} color={theme.colors.text} />
            </Pressable>
          </View>
        }
      />

      {!query ? (
        <View style={{ gap: 10 }}>
          <ThemedText variant="caption">Loading pattern (instant static UI)</ThemedText>
          <SkeletonBlock height={14} width="60%" />
          <SkeletonBlock height={72} />
        </View>
      ) : null}

      {!query ? (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText variant="subtitle" style={{ fontSize: 16 }}>Recent searches</ThemedText>
            {recentSearches.length ? (
              <Pressable onPress={clearRecentSearches}>
                <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                  Clear
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
          {recentSearches.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {recentSearches.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setQuery(term)}
                  onLongPress={() => removeRecentSearch(term)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <ThemedText variant="caption" style={{ color: theme.colors.text }}>{term}</ThemedText>
                </Pressable>
              ))}
            </View>
          ) : (
            <ThemedText variant="caption">No recent searches yet</ThemedText>
          )}

          <ThemedText variant="subtitle" style={{ fontSize: 16 }}>Trending</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {suggestionChips.map((term) => (
              <Pressable
                key={term}
                onPress={() => setQuery(term)}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.primarySoft,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <ThemedText variant="caption" style={{ color: theme.colors.text, fontWeight: '700' }}>
                  {term}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No matches"
            description="Try searching by brand, product type, or tags like serum, SPF, snack."
            ctaLabel="Use trending search"
            onPressCta={() => setQuery(TRENDING_SEARCHES[0] ?? 'serum')}
          />
        }
        ListHeaderComponent={
          query ? (
            <View style={{ marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText variant="caption">{results.length} results</ThemedText>
              <ThemedText variant="caption">{APP_STRINGS.currency}</ThemedText>
            </View>
          ) : (
            <View style={{ marginBottom: 4 }} />
          )
        }
      />
    </ThemedView>
  );
}
