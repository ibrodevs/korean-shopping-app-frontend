import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Category } from '../types/models';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

type Props = {
  category: Category;
  onPress?: () => void;
};

export function CategoryCard({ category, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 88,
        padding: 10,
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: pressed ? 0.9 : 1,
        ...theme.shadows.soft,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Ionicons
          name={category.iconName as keyof typeof Ionicons.glyphMap}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <ThemedText variant="caption" numberOfLines={2} style={{ color: theme.colors.text }}>
        {category.title}
      </ThemedText>
    </Pressable>
  );
}
