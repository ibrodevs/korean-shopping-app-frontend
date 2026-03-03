import React, { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../theme/ThemeProvider';
import type { ProfileStackParamList } from '../types/navigation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export function EditProfileScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>) {
  const theme = useTheme();
  const { user, updateProfile } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  } as const;

  const isInvalid = useMemo(() => {
    return !name.trim() || !email.trim();
  }, [email, name]);

  return (
    <ThemedView className="flex-1 px-4 py-6">
      <View className="gap-2.5">
        <ThemedText variant="title" className="text-2xl leading-8">Edit Profile</ThemedText>
        <ThemedText variant="muted">Update your name and email for this device.</ThemedText>
      </View>

      <View className="mt-5 gap-2.5">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('Full name')}
          placeholderTextColor={theme.colors.textMuted}
          className="min-h-[46px] rounded-xl border px-3"
          style={inputStyle}
        />
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
      </View>

      <PrimaryButton
        label="Save Changes"
        loading={loading}
        disabled={isInvalid}
        style={{ marginTop: 16 }}
        onPress={async () => {
          try {
            setLoading(true);
            await updateProfile(name, email);
            showToast('Profile updated', 'success');
            navigation.goBack();
          } finally {
            setLoading(false);
          }
        }}
      />
    </ThemedView>
  );
}
