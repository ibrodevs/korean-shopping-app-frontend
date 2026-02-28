import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type Variant = 'body' | 'muted' | 'title' | 'subtitle' | 'caption' | 'button';

type Props = TextProps & {
  variant?: Variant;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: StyleProp<TextStyle>;
};

export function ThemedText({ variant = 'body', weight, style, ...props }: Props) {
  const theme = useTheme();
  const scale = theme.fontScale;

  const variantStyle: TextStyle = {
    body: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.md * scale,
      lineHeight: theme.typography.lineHeights.md * scale,
    },
    muted: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.fontSizes.sm * scale,
      lineHeight: theme.typography.lineHeights.sm * scale,
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.xxl * scale,
      lineHeight: theme.typography.lineHeights.xxl * scale,
      fontWeight: theme.typography.weights.bold,
    },
    subtitle: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.lg * scale,
      lineHeight: theme.typography.lineHeights.lg * scale,
      fontWeight: theme.typography.weights.semibold,
    },
    caption: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.fontSizes.xs * scale,
      lineHeight: theme.typography.lineHeights.xs * scale,
    },
    button: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.md * scale,
      lineHeight: theme.typography.lineHeights.md * scale,
      fontWeight: theme.typography.weights.semibold,
    },
  }[variant];

  return (
    <Text
      {...props}
      style={[
        variantStyle,
        weight ? { fontWeight: theme.typography.weights[weight] } : null,
        style,
      ]}
    />
  );
}
