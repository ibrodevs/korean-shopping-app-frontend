import { ActivityIndicator, View } from 'react-native';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export function OnboardingSplashScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'OnboardingSplash'>) {
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('WelcomeIntro');
    }, 1400);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 14 }}>
      <View
        style={{
          width: 74,
          height: 74,
          borderRadius: 37,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Ionicons name="sparkles-outline" size={30} color={theme.colors.primary} />
      </View>
      <ThemedText variant="title" style={{ fontSize: 24 }}>Korean App</ThemedText>
      <ThemedText variant="muted" style={{ textAlign: 'center' }}>
        Preparing your shopping experience...
      </ThemedText>
      <ActivityIndicator color={theme.colors.primary} />
    </ThemedView>
  );
}
