import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { APP_STRINGS } from '../constants/strings';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export function AuthWelcomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>) {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center', gap: 18 }}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.primarySoft,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Ionicons name="storefront-outline" size={30} color={theme.colors.primary} />
        </View>
        <ThemedText variant="title" style={{ fontSize: 26, lineHeight: 32, textAlign: 'center' }}>
          {t('Join {{appName}}', { appName: APP_STRINGS.appName })}
        </ThemedText>
        <ThemedText variant="muted" style={{ textAlign: 'center' }}>
          Sign in or create an account to continue to the catalog and complete checkout.
        </ThemedText>
      </View>

      <PrimaryButton label="Sign In" onPress={() => navigation.navigate('Login')} />
      <PrimaryButton label="Create Account" variant="outline" onPress={() => navigation.navigate('Register')} />
    </ThemedView>
  );
}
