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

export function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const theme = useTheme();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
      <ThemedText variant="title" style={{ fontSize: 24, lineHeight: 30 }}>Create Account</ThemedText>
      <ThemedText variant="muted">Create a mock account to personalize the demo locally.</ThemedText>

      <View style={{ gap: 10 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={theme.colors.textMuted}
          style={inputStyle}
        />
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

      <PrimaryButton
        label="Register"
        loading={loading}
        onPress={async () => {
          setLoading(true);
          await register(name, email || 'guest@korean.app', password);
          await hapticSuccess();
          showToast('Account created', 'success');
          setLoading(false);
        }}
      />

      <Pressable onPress={() => navigation.navigate('Login')}>
        <ThemedText variant="caption" style={{ textAlign: 'center', color: theme.colors.primary, fontWeight: '700' }}>
          Already have an account? Sign in
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
