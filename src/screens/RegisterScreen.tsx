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
import { extractApiErrorMessage } from '../api/auth';

export function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const theme = useTheme();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  } as const;

  return (
    <ThemedView className="flex-1 justify-center gap-3.5 px-4">
      <ThemedText variant="title" className="text-2xl leading-8">Create Account</ThemedText>
      <ThemedText variant="muted">Create your account to start shopping.</ThemedText>

      <View className="gap-2.5">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={theme.colors.textMuted}
          className="min-h-[46px] rounded-xl border px-3"
          style={inputStyle}
        />
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

      <PrimaryButton
        label="Register"
        loading={loading}
        onPress={async () => {
          try {
            setLoading(true);
            await register(name, email || 'guest@korean.app', password);
            await hapticSuccess();
            showToast('Account created', 'success');
          } catch (error) {
            showToast(extractApiErrorMessage(error), 'warning');
          } finally {
            setLoading(false);
          }
        }}
      />

      <Pressable onPress={() => navigation.navigate('Login')}>
        <ThemedText variant="caption" className="text-center font-bold" style={{ color: theme.colors.primary }}>
          Already have an account? Sign in
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
