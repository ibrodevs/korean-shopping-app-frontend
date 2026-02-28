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
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  } as const;

  return (
    <ThemedView className="flex-1 justify-center gap-3.5 px-4">
      <ThemedText variant="title" className="text-2xl leading-8">Sign In</ThemedText>
      <ThemedText variant="muted">Use any email/password to enter the frontend demo.</ThemedText>

      <View className="gap-2.5">
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={theme.colors.textMuted}
          className="min-h-[46px] rounded-xl border px-3"
          style={inputStyle}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={theme.colors.textMuted}
          className="min-h-[46px] rounded-xl border px-3"
          style={inputStyle}
        />
      </View>

      <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
        <ThemedText variant="caption" className="font-bold" style={{ color: theme.colors.primary }}>
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
        <ThemedText variant="caption" className="text-center">
          New here? <ThemedText variant="caption" className="font-bold" style={{ color: theme.colors.primary }}>Create account</ThemedText>
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
