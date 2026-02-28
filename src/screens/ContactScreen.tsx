import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { APP_STRINGS } from '../constants/strings';
import { useToast } from '../contexts/ToastContext';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import { hapticSelection } from '../utils/haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';

export function ContactScreen(_: NativeStackScreenProps<ProfileStackParamList, 'Contact'>) {
  const theme = useTheme();
  const { showToast } = useToast();

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={{ gap: 8, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
      <ThemedText variant="caption">{label}</ThemedText>
      <ThemedText weight="semibold">{value}</ThemedText>
      <Pressable
        onPress={async () => {
          await hapticSelection();
          showToast('Copied', 'success');
        }}
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceAlt,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
          Copy
        </ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 28 }}>
        <Row label="Email" value={APP_STRINGS.supportEmail} />
        <Row label="Telegram" value={APP_STRINGS.supportTelegram} />
        <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <ThemedText variant="caption">
            Support channels are UI placeholders in this frontend demo. No outbound messaging is configured.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
