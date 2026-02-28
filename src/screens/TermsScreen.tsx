import React from 'react';
import { ScrollView, View } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';

const paragraphs = [
  'These Terms of Service apply to the Korean App frontend demo experience. The application is provided for interface demonstration and local device testing only.',
  'Product prices, availability, order states, and payment methods shown in the app are mock or simulated values. No purchase contract is formed through this demo.',
  'Users may interact with local features such as cart, favorites, and orders, which are stored on-device using local storage and may be cleared by the user or app updates.',
  'The app does not provide user-generated product listing functionality. Products are uploaded by admins only within the demo dataset.',
  'By using this demo, you acknowledge that no real payment processing, shipment fulfillment, or customer account authentication is performed.',
];

export function TermsScreen(_: NativeStackScreenProps<ProfileStackParamList, 'Terms'>) {
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
