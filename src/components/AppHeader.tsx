import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

type Props = {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onPressSearch?: () => void;
  rightNode?: React.ReactNode;
  searchValue?: string;
  onChangeSearch?: (value: string) => void;
  editableSearch?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  searchPlaceholder,
  onPressSearch,
  rightNode,
  searchValue,
  onChangeSearch,
  editableSearch = false,
}: Props) {
  const theme = useTheme();

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <ThemedText variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
            {title}
          </ThemedText>
          {subtitle ? <ThemedText variant="muted">{subtitle}</ThemedText> : null}
        </View>
        {rightNode}
      </View>

      {searchPlaceholder ? (
        <Pressable
          onPress={editableSearch ? undefined : onPressSearch}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            minHeight: 46,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingHorizontal: 14,
            opacity: !editableSearch && pressed ? 0.9 : 1,
          })}
        >
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
          {editableSearch ? (
            <TextInput
              value={searchValue}
              onChangeText={onChangeSearch}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.colors.textMuted}
              style={{ flex: 1, color: theme.colors.text, fontSize: 15, paddingVertical: 0 }}
            />
          ) : (
            <ThemedText variant="muted" style={{ flex: 1 }}>
              {searchPlaceholder}
            </ThemedText>
          )}
          {!editableSearch ? (
            <Ionicons name="options-outline" size={18} color={theme.colors.textMuted} />
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}
