import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { PrimaryButton } from './PrimaryButton';
import { ThemedText } from './ThemedText';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  ctaLabel?: string;
  onPressCta?: () => void;
};

export function EmptyState({ icon, title, description, ctaLabel, onPressCta }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 20,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primarySoft,
        }}
      >
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <ThemedText variant="subtitle" style={{ fontSize: 18 }}>{title}</ThemedText>
      <ThemedText variant="muted" style={{ textAlign: 'center' }}>{description}</ThemedText>
      {ctaLabel ? <PrimaryButton label={ctaLabel} onPress={onPressCta} style={{ alignSelf: 'stretch' }} /> : null}
    </View>
  );
}
