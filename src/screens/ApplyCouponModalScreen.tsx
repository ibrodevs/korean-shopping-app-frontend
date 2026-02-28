import React from 'react';
import { Pressable, View } from 'react-native';

import { Badge } from '../components/Badge';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CouponCode } from '../utils/pricing';

const coupons: Array<{ code: Exclude<CouponCode, null>; title: string; note: string }> = [
  { code: 'SAVE5', title: 'Save 5%', note: 'Up to 5,000 сом on any order' },
  { code: 'BEAUTY10', title: 'Beauty 10%', note: 'Up to 10,000 сом discount' },
];

export function ApplyCouponModalScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ApplyCouponModal'>) {
  const theme = useTheme();
  const { checkoutDraft, setCheckoutCoupon } = useAppState();

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 14 }}>
      <ThemedText variant="muted">Apply a coupon to your current checkout.</ThemedText>
      {coupons.map((coupon) => {
        const active = checkoutDraft.couponCode === coupon.code;
        return (
          <Pressable
            key={coupon.code}
            onPress={() => setCheckoutCoupon(coupon.code)}
            style={{
              borderRadius: theme.radii.lg,
              borderWidth: 1,
              borderColor: active ? theme.colors.primary : theme.colors.border,
              backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
              padding: 12,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText weight="semibold">{coupon.code}</ThemedText>
              {active ? <Badge label="Applied" tone="accent" /> : null}
            </View>
            <ThemedText>{coupon.title}</ThemedText>
            <ThemedText variant="caption">{coupon.note}</ThemedText>
          </Pressable>
        );
      })}

      <PrimaryButton label="Remove Coupon" variant="outline" onPress={() => setCheckoutCoupon(null)} />
      <PrimaryButton label="Done" onPress={() => navigation.goBack()} />
    </ThemedView>
  );
}
