import React, { useMemo, useState } from 'react';
import { Switch, TextInput, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { products } from '../data/mockData';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { CatalogFilters, defaultCatalogFilters } from '../types/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export function FiltersModalScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'FiltersModal'>) {
  const theme = useTheme();
  const { catalogFilters, setCatalogFilters, resetCatalogFilters } = useAppState();
  const [draft, setDraft] = useState<CatalogFilters>(catalogFilters);

  const allTags = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.tags))).slice(0, 16),
    [],
  );

  const Pill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <ThemedText
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.border,
        backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
        color: theme.colors.text,
        fontSize: theme.typography.fontSizes.xs * theme.fontScale,
        lineHeight: theme.typography.lineHeights.xs * theme.fontScale,
        fontWeight: '700',
      }}
    >
      {label}
    </ThemedText>
  );

  const inputStyle = {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: 12,
  } as const;

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16, gap: 20 }}>
        <View style={{ gap: 10 }}>
          <ThemedText variant="subtitle">Price range (сом)</ThemedText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={draft.minPrice}
              onChangeText={(minPrice) => setDraft((prev) => ({ ...prev, minPrice }))}
              keyboardType="number-pad"
              placeholder="Min"
              placeholderTextColor={theme.colors.textMuted}
              style={inputStyle}
            />
            <TextInput
              value={draft.maxPrice}
              onChangeText={(maxPrice) => setDraft((prev) => ({ ...prev, maxPrice }))}
              keyboardType="number-pad"
              placeholder="Max"
              placeholderTextColor={theme.colors.textMuted}
              style={inputStyle}
            />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <ThemedText variant="subtitle">Rating</ThemedText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 3, 4].map((value) => (
              <Pill
                key={value}
                label={value === 0 ? 'Any' : `${value}+`}
                active={draft.ratingMin === value}
                onPress={() => setDraft((prev) => ({ ...prev, ratingMin: value as 0 | 3 | 4 }))}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <ThemedText variant="subtitle">Tags</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {allTags.map((tag) => {
              const active = draft.tags.includes(tag);
              return (
                <Pill
                  key={tag}
                  label={tag}
                  active={active}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      tags: active ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
                    }))
                  }
                />
              );
            })}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <ThemedText>In stock only</ThemedText>
              <ThemedText variant="caption">Hide out-of-stock products</ThemedText>
            </View>
            <Switch
              value={draft.inStockOnly}
              onValueChange={(inStockOnly) => setDraft((prev) => ({ ...prev, inStockOnly }))}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <ThemedText>Sale only</ThemedText>
              <ThemedText variant="caption">Show discounted items only</ThemedText>
            </View>
            <Switch
              value={draft.saleOnly}
              onValueChange={(saleOnly) => setDraft((prev) => ({ ...prev, saleOnly }))}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        <View style={{ marginTop: 'auto', gap: 10 }}>
          <PrimaryButton
            label="Reset"
            variant="outline"
            onPress={() => {
              resetCatalogFilters();
              setDraft(defaultCatalogFilters);
            }}
          />
          <PrimaryButton
            label="Apply"
            onPress={() => {
              setCatalogFilters(draft);
              navigation.goBack();
            }}
          />
        </View>
      </View>
    </ThemedView>
  );
}
