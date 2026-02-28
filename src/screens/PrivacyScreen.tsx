import React from 'react';
import { ScrollView, View } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';

const paragraphs = [
  'Korean App is a frontend-only demo and does not connect to a backend service in this build.',
  'Cart, favorites, orders, and settings may be stored locally on your device using AsyncStorage to preserve the demo experience between launches.',
  'No real payment credentials are transmitted. Payment method screens display placeholder values only.',
  'Search history is stored locally on-device for recent search suggestions and can be cleared from the app UI.',
  'Because this build is a demo, support channels and legal links are informational placeholders and do not transmit personal data by themselves.',
];

export function PrivacyScreen(_: NativeStackScreenProps<ProfileStackParamList, 'Privacy'>) {
  const theme = useTheme();
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 28 }}>
        <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12, gap: 10 }}>
          {paragraphs.map((p, i) => (
            <ThemedText key={i} variant="muted">{p}</ThemedText>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
