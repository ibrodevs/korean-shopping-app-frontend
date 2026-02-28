import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { APP_STRINGS } from '../constants/strings';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';

export function AboutScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'About'>) {
  const theme = useTheme();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }}>
        <View style={{ gap: 8 }}>
          <ThemedText variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
            {APP_STRINGS.appName}
          </ThemedText>
          <ThemedText variant="muted">
            Korean App is a frontend-only marketplace demo inspired by modern Korean shopping experiences.
          </ThemedText>
        </View>

        <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12, gap: 10 }}>
          <ThemedText variant="subtitle" style={{ fontSize: 16 }}>Brand colors</ThemedText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, padding: 10, backgroundColor: theme.colors.surfaceAlt }}>
              <View style={{ height: 28, borderRadius: 8, backgroundColor: theme.colors.primary, marginBottom: 6 }} />
              <ThemedText variant="caption">Primary Cyan</ThemedText>
            </View>
            <View style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, padding: 10, backgroundColor: theme.colors.surfaceAlt }}>
              <View style={{ height: 28, borderRadius: 8, backgroundColor: theme.colors.accent, marginBottom: 6 }} />
              <ThemedText variant="caption">Accent Pink</ThemedText>
            </View>
          </View>
        </View>

        <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <ThemedText variant="caption">{APP_STRINGS.adminUploadsOnly}</ThemedText>
        </View>

        <View style={{ gap: 10 }}>
          <PrimaryButton label="Open FAQ" onPress={() => navigation.navigate('FAQ')} />
          <PrimaryButton label="Contact Support" variant="outline" onPress={() => navigation.navigate('Contact')} />
          <Pressable onPress={() => navigation.navigate('Privacy')}>
            <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700', textAlign: 'center' }}>
              Read Privacy Policy
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
