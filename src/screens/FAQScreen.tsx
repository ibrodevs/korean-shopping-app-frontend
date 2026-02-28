import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';

const faqItems = [
  {
    q: 'Are products uploaded by users?',
    a: 'No. This marketplace demo is curated by admins only. Customer product uploads are disabled.',
  },
  {
    q: 'Can I pay inside the app?',
    a: 'This is a frontend-only demo, so payments are simulated and no real transaction is processed.',
  },
  {
    q: 'Do cart and favorites persist?',
    a: 'Yes, cart, favorites, and orders are stored locally on your device using AsyncStorage.',
  },
  {
    q: 'Can I switch themes?',
    a: 'Yes. Go to Settings and choose System, Light, or Dark mode.',
  },
];

export function FAQScreen(_: NativeStackScreenProps<ProfileStackParamList, 'FAQ'>) {
  const theme = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 28 }}>
        {faqItems.map((item, index) => {
          const open = openIndex === index;
          return (
            <View
              key={item.q}
              style={{
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                overflow: 'hidden',
              }}
            >
              <Pressable
                onPress={() => setOpenIndex((prev) => (prev === index ? null : index))}
                style={({ pressed }) => ({
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <ThemedText style={{ flex: 1 }} weight="semibold">{item.q}</ThemedText>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.colors.textMuted}
                />
              </Pressable>
              {open ? (
                <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                  <ThemedText variant="muted">{item.a}</ThemedText>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}
