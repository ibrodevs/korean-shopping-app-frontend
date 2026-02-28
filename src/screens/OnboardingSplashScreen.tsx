import { ActivityIndicator, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

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
    <ThemedView className="flex-1 items-center justify-center gap-3.5 px-5">
      <View
        className="h-[74px] w-[74px] items-center justify-center rounded-full border"
        style={{ backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }}
      >
        <Ionicons name="sparkles-outline" size={30} color={theme.colors.primary} />
      </View>
      <Text className="text-center text-2xl font-bold" style={{ color: theme.colors.text }}>
        Korean App
      </Text>
      <Text className="text-center text-sm" style={{ color: theme.colors.textMuted }}>
        Preparing your shopping experience...
      </Text>
      <ActivityIndicator color={theme.colors.primary} />
    </ThemedView>
  );
}
