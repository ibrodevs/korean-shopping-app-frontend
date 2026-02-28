import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

type BadgeTone = 'primary' | 'accent' | 'warning' | 'neutral' | 'danger';

type Props = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'neutral' }: Props) {
  const theme = useTheme();

  const tones: Record<BadgeTone, { bg: string; text: string }> = {
    primary: { bg: theme.colors.primarySoft, text: theme.colors.primary },
    accent: { bg: 'rgba(255, 0, 132, 0.14)', text: theme.colors.accent },
    warning: { bg: 'rgba(245, 158, 11, 0.14)', text: theme.colors.warning },
    neutral: { bg: theme.colors.surfaceAlt, text: theme.colors.textMuted },
    danger: { bg: 'rgba(239, 68, 68, 0.14)', text: theme.colors.danger },
  };

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: tones[tone].bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <ThemedText variant="caption" style={{ color: tones[tone].text, fontWeight: '700' }}>
        {label}
      </ThemedText>
    </View>
  );
}
