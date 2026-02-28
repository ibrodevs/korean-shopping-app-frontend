import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { APP_STRINGS } from '../constants/strings';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export function WelcomeIntroScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'WelcomeIntro'>) {
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('AuthWelcome');
    }, 1600);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center', gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.primarySoft,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Ionicons name="storefront-outline" size={32} color={theme.colors.primary} />
        </View>
        <ThemedText variant="title" style={{ fontSize: 28, lineHeight: 34, textAlign: 'center' }}>
          Welcome to {APP_STRINGS.appName}
        </ThemedText>
        <ThemedText variant="muted" style={{ textAlign: 'center' }}>
          Discover curated Korean products shipped from Korea to warehouse pickup points in Bishkek.
        </ThemedText>
      </View>
    </ThemedView>
  );
}
