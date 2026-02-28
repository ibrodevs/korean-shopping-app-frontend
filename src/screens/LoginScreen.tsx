import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { hapticSuccess } from '../utils/haptics';

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const theme = useTheme();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('guest@korean.app');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    minHeight: 46,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: 12,
  } as const;

  return (
    <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center', gap: 14 }}>
      <ThemedText variant="title" style={{ fontSize: 24, lineHeight: 30 }}>Sign In</ThemedText>
      <ThemedText variant="muted">Use any email/password to enter the frontend demo.</ThemedText>

      <View style={{ gap: 10 }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={theme.colors.textMuted}
          style={inputStyle}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={theme.colors.textMuted}
          style={inputStyle}
        />
      </View>

      <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
        <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
          Forgot password?
        </ThemedText>
      </Pressable>

      <PrimaryButton
        label="Sign In"
        loading={loading}
        onPress={async () => {
          setLoading(true);
          await login(email, password);
          await hapticSuccess();
          showToast('Signed in', 'success');
          setLoading(false);
        }}
      />

      <Pressable onPress={() => navigation.navigate('Register')}>
        <ThemedText variant="caption" style={{ textAlign: 'center' }}>
          New here? <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>Create account</ThemedText>
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
