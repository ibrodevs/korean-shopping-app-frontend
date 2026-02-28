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
    <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center', gap: 14 }}>
      <ThemedText variant="title" style={{ fontSize: 24, lineHeight: 30 }}>Forgot Password</ThemedText>
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
        style={{
          minHeight: 46,
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          paddingHorizontal: 12,
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
      <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
        <ThemedText variant="caption">Frontend-only demo: no real authentication backend is connected.</ThemedText>
      </View>
    </ThemedView>
  );
}
