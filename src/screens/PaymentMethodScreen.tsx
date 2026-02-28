import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const methods = ['Visa •••• 4821', 'KakaoPay', 'Naver Pay', 'Cash on Pickup'];

export function PaymentMethodScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'PaymentMethod'>) {
  const theme = useTheme();
  const { checkoutDraft, setCheckoutPaymentMethod } = useAppState();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {methods.map((method) => {
          const active = checkoutDraft.paymentMethod === method;
          return (
            <Pressable
              key={method}
              onPress={() => {
                setCheckoutPaymentMethod(method);
                navigation.goBack();
              }}
              style={{
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                padding: 12,
              }}
            >
              <ThemedText weight="semibold">{method}</ThemedText>
            </Pressable>
          );
        })}
        <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <ThemedText variant="caption">UI only: card management is not connected in Part 2.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
