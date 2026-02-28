import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

type Props = Omit<PressableProps, 'style'> & {
  label: string;
  loading?: boolean;
  variant?: 'filled' | 'outline' | 'soft';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, loading, variant = 'filled', style, disabled, ...props }: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: 48,
          borderRadius: theme.radii.lg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: theme.colors.border,
          backgroundColor:
            variant === 'filled'
              ? theme.colors.primary
              : variant === 'soft'
                ? theme.colors.primarySoft
                : 'transparent',
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          paddingHorizontal: theme.spacing.lg,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? '#FFFFFF' : theme.colors.primary} />
      ) : (
        <ThemedText
          variant="button"
          style={{ color: variant === 'filled' ? '#FFFFFF' : theme.colors.text }}
        >
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}
