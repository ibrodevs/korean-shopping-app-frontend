import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { hapticSuccess } from '../utils/haptics';
import { extractApiErrorMessage } from '../api/auth';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const theme = useTheme();
  const { login, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [email, setEmail] = useState('guest@korean.app');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRequest, googleResponse, promptGoogleAuth] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  const inputStyle = {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  } as const;

  React.useEffect(() => {
    if (!googleResponse) return;
    if (googleResponse.type !== 'success') {
      setGoogleLoading(false);
      if (googleResponse.type === 'error') {
        showToast('Google sign-in failed. Please try again.', 'warning');
      }
      return;
    }

    const idToken =
      googleResponse.authentication?.idToken ??
      (typeof googleResponse.params?.id_token === 'string' ? googleResponse.params.id_token : undefined);
    const accessToken =
      googleResponse.authentication?.accessToken ??
      (typeof googleResponse.params?.access_token === 'string' ? googleResponse.params.access_token : undefined);

    if (!idToken && !accessToken) {
      setGoogleLoading(false);
      showToast('Google token was not received. Please try again.', 'warning');
      return;
    }

    loginWithGoogle({ idToken, accessToken })
      .then(async () => {
        await hapticSuccess();
        showToast('Signed in with Google', 'success');
      })
      .catch((error) => {
        showToast(extractApiErrorMessage(error), 'warning');
      })
      .finally(() => {
        setGoogleLoading(false);
      });
  }, [googleResponse, loginWithGoogle, showToast]);

  return (
    <ThemedView className="flex-1 justify-center gap-3.5 px-4">
      <ThemedText variant="title" className="text-2xl leading-8">Sign In</ThemedText>
      <ThemedText variant="muted">Use your account credentials to sign in.</ThemedText>

      <View className="gap-2.5">
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={t('Email')}
          placeholderTextColor={theme.colors.textMuted}
          className="min-h-[46px] rounded-xl border px-3"
          style={inputStyle}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={t('Password')}
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
        disabled={googleLoading}
        onPress={async () => {
          try {
            setLoading(true);
            await login(email, password);
            await hapticSuccess();
            showToast('Signed in', 'success');
          } catch (error) {
            showToast(extractApiErrorMessage(error), 'warning');
          } finally {
            setLoading(false);
          }
        }}
      />

      <PrimaryButton
        label="Continue with Google"
        loading={googleLoading}
        variant="outline"
        disabled={!googleRequest || loading}
        onPress={async () => {
          try {
            setGoogleLoading(true);
            await promptGoogleAuth();
          } catch (error) {
            setGoogleLoading(false);
            showToast(extractApiErrorMessage(error), 'warning');
          }
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
