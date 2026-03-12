import React from 'react';
import { Pressable } from 'react-native';

import { Category } from '../types/models';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

type Props = {
  category: Category;
  active?: boolean;
  onPress?: () => void;
};

export function CategoryChip({ category, active = false, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignSelf: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? 'transparent' : theme.colors.border,
        backgroundColor: active ? theme.colors.primary : theme.colors.surface,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <ThemedText variant="caption" style={{ color: active ? '#FFFFFF' : theme.colors.text, fontWeight: '600' }}>
        {category.title}
      </ThemedText>
    </Pressable>
  );
}
