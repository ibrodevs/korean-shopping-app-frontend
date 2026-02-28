import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkeletonBlock } from '../components/SkeletonBlock';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import { SimpleStubStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export function StubScreen({ route }: NativeStackScreenProps<SimpleStubStackParamList, 'Stub'>) {
  const theme = useTheme();
  const { title } = route.params;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 16 }}>
          <ThemedText variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
            {title}
          </ThemedText>
          <ThemedText variant="muted">
            Part 1 includes only navigation stubs for this tab.
          </ThemedText>
          {title === 'Profile' ? (
            <View
              style={{
                padding: 12,
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <ThemedText variant="caption">
                Products are uploaded by admins only. Customer uploads are disabled.
              </ThemedText>
            </View>
          ) : null}
          <SkeletonBlock height={52} />
          <SkeletonBlock height={84} />
          <SkeletonBlock height={84} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
