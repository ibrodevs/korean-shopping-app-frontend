import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../theme/ThemeProvider';
import { CheckoutPaymentMethod } from '../types/models';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const methods: Array<{ value: CheckoutPaymentMethod; label: string; note: string }> = [
  { value: 'cash', label: 'Cash on pickup', note: 'Pay in cash when collecting the order.' },
  { value: 'card', label: 'Bank card', note: 'Use a standard bank card payment.' },
  { value: 'mbank', label: 'MBank', note: 'Mobile payment through MBank.' },
  { value: 'elqr', label: 'ELQR', note: 'Scan and pay with ELQR.' },
];

export function PaymentMethodScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'PaymentMethod'>) {
  const theme = useTheme();
  const { checkoutDraft, setCheckoutPaymentMethod } = useAppState();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {methods.map((method) => {
          const active = checkoutDraft.paymentMethod === method.value;
          return (
            <Pressable
              key={method.value}
              onPress={() => {
                setCheckoutPaymentMethod(method.value);
                navigation.goBack();
              }}
              style={{
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                padding: 12,
                gap: 6,
              }}
            >
              <ThemedText weight="semibold">{method.label}</ThemedText>
              <ThemedText variant="muted">{method.note}</ThemedText>
            </Pressable>
          );
        })}
        <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <ThemedText variant="caption">These options are aligned with the backend order checkout API.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
