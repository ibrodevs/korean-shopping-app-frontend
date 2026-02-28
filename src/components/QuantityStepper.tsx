import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
};

export function QuantityStepper({ value, min = 1, max = 99, onChange }: Props) {
  const theme = useTheme();

  const Btn = ({ icon, disabled, onPress }: { icon: 'add' | 'remove'; disabled?: boolean; onPress: () => void }) => (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
      })}
    >
      <Ionicons name={icon} size={14} color={theme.colors.text} />
    </Pressable>
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Btn icon="remove" disabled={value <= min} onPress={() => onChange(Math.max(min, value - 1))} />
      <ThemedText variant="caption" style={{ minWidth: 22, textAlign: 'center', fontWeight: '700' }}>
        {value}
      </ThemedText>
      <Btn icon="add" disabled={value >= max} onPress={() => onChange(Math.min(max, value + 1))} />
    </View>
  );
}
