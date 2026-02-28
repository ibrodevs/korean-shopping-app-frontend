import React, { useState } from 'react';
import { TextInput, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { hapticSelection } from '../utils/haptics';

export function ForgotPasswordScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>) {
  const theme = useTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  return (
    <ThemedView className="flex-1 justify-center gap-3.5 px-4">
      <ThemedText variant="title" className="text-2xl leading-8">Forgot Password</ThemedText>
      <ThemedText variant="muted">
        Enter your email and we will simulate sending a reset link (UI only, no real email delivery).
      </ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={theme.colors.textMuted}
        className="min-h-[46px] rounded-xl border px-3"
        style={{
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
        }}
      />
      <PrimaryButton
        label="Send Reset Link"
        onPress={async () => {
          await hapticSelection();
          showToast('Reset link sent (demo)', 'success');
          navigation.goBack();
        }}
      />
      <View
        className="rounded-xl border p-3"
        style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
      >
        <ThemedText variant="caption">Frontend-only demo: no real authentication backend is connected.</ThemedText>
      </View>
    </ThemedView>
  );
}
