import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useI18n } from '../contexts/I18nContext';
import { usePaymentCards } from '../contexts/PaymentCardsContext';
import { useTheme } from '../theme/ThemeProvider';
import type { ProfileStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddCard'>;

function onlyDigits(text: string) {
  return text.replace(/\D/g, '');
}

function formatCardNumber(input: string) {
  const digits = onlyDigits(input).slice(0, 19);
  const groups = digits.match(/.{1,4}/g) ?? [];
  return groups.join(' ');
}

function formatExpiry(input: string) {
  const digits = onlyDigits(input).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function AddCardScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const { addCard } = usePaymentCards();

  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [holder, setHolder] = useState('');

  const isValid = useMemo(() => {
    const digits = onlyDigits(cardNumber);
    return digits.length >= 12 && exp.trim().length > 0 && cvc.trim().length > 0 && holder.trim().length > 0;
  }, [cardNumber, cvc, exp, holder]);

  const inputStyle = {
    height: 48,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    color: theme.colors.text,
  } as const;

  const labelStyle = { marginBottom: 6 } as const;

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <View
            style={{
              borderRadius: theme.radii.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 14,
              gap: 12,
            }}
          >
            <View>
              <ThemedText variant="caption" style={labelStyle}>Card Number</ThemedText>
              <TextInput
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                autoCapitalize="none"
                style={inputStyle}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <ThemedText variant="caption" style={labelStyle}>Expiry</ThemedText>
                <TextInput
                  value={exp}
                  onChangeText={(t) => setExp(formatExpiry(t))}
                  placeholder={t('MM/YY')}
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  style={inputStyle}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="caption" style={labelStyle}>CVC</ThemedText>
                <TextInput
                  value={cvc}
                  onChangeText={(t) => setCvc(onlyDigits(t).slice(0, 4))}
                  placeholder="123"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  secureTextEntry
                  style={inputStyle}
                />
              </View>
            </View>

            <View>
              <ThemedText variant="caption" style={labelStyle}>Cardholder Name</ThemedText>
              <TextInput
                value={holder}
                onChangeText={setHolder}
                placeholder={t('John Doe')}
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="words"
                style={inputStyle}
              />
            </View>
          </View>

          <View style={{ gap: 10, paddingTop: 2 }}>
            <PrimaryButton
              label="Save card"
              disabled={!isValid}
              onPress={() => {
                addCard({ cardNumber, exp, holder });
                navigation.goBack();
              }}
            />
            <PrimaryButton label="Cancel" variant="outline" onPress={() => navigation.goBack()} />
            <ThemedText variant="caption" style={{ textAlign: 'center' }}>
              Demo only: card details are not processed.
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
