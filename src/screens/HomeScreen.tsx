import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { categories } from '../data/mockData';
import { hotDeals, newArrivals } from '../data/selectors';
import { useTheme } from '../theme/ThemeProvider';
import { HomeScreenProps } from '../types/navigation';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const theme = useTheme();

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
          <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.xl }}>
            <AppHeader
              title="Hello, Mina"
              subtitle="Find Korean goods you love"
              searchPlaceholder="Search products, brands, categories"
              onPressSearch={() => navigation.getParent()?.getParent()?.navigate('Search')}
            />

            <LinearGradient
              colors={[
                'rgba(37, 209, 228, 0.22)',
                'rgba(37, 209, 228, 0.08)',
                theme.colors.surface,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: theme.radii.xl,
                padding: theme.spacing.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
              }}
            >
              <View style={{ gap: 8 }}>
                <ThemedText variant="subtitle">Korean App Weekend Picks</ThemedText>
                <ThemedText variant="muted">
                  Products arrive from Korea to our warehouses in Bishkek. Prices shown in Kyrgyz som.
                </ThemedText>
                <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                  <ThemedText
                    variant="caption"
                    style={{ color: theme.colors.accent, fontWeight: '700' }}
                  >
                    Limited highlights today
                  </ThemedText>
                </View>
              </View>
            </LinearGradient>

            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText variant="subtitle">Categories</ThemedText>
                <Pressable
                  onPress={() => navigation.getParent()?.navigate('CatalogTab')}
                >
                  <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                    See all
                  </ThemedText>
                </Pressable>
              </View>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => (
                  <CategoryCard
                    category={item}
                    onPress={() => navigation.getParent()?.navigate('CatalogTab')}
                  />
                )}
              />
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText variant="subtitle">Hot Deals</ThemedText>
                <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
                  Updated by admins only
                </ThemedText>
              </View>
              <FlatList
                data={hotDeals}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 4 }}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    width={170}
                    onPress={() =>
                      navigation.getParent()?.getParent()?.navigate('ProductDetails', {
                        productId: item.id,
                      })
                    }
                  />
                )}
              />
            </View>

            <View style={{ gap: 12 }}>
              <ThemedText variant="subtitle">New Arrivals</ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {newArrivals.slice(0, 6).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() =>
                      navigation.getParent()?.getParent()?.navigate('ProductDetails', {
                        productId: product.id,
                      })
                    }
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
