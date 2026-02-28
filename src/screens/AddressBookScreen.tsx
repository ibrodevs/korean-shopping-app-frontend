import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const addresses = [
  {
    id: 'warehouse_1',
    label: 'Bishkek Warehouse #1',
    detail: '115 Chui Ave, Bishkek • Main pickup desk • +996 555 102 030',
  },
  {
    id: 'warehouse_2',
    label: 'Bishkek Warehouse #2',
    detail: '58 Aaly Tokombaev St, Bishkek • South hub counter • +996 555 208 144',
  },
  {
    id: 'warehouse_3',
    label: 'Bishkek Warehouse #3',
    detail: '23 Isanova St, Bishkek • City center pickup point • +996 555 315 266',
  },
];

export function AddressBookScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddressBook'>) {
  const theme = useTheme();
  const { checkoutDraft, setCheckoutAddress } = useAppState();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {addresses.map((address) => {
          const active = checkoutDraft.addressDetail === address.detail;
          return (
            <Pressable
              key={address.id}
              onPress={() => {
                setCheckoutAddress(address.label, address.detail);
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
              <ThemedText weight="semibold">{address.label}</ThemedText>
              <ThemedText variant="muted">{address.detail}</ThemedText>
            </Pressable>
          );
        })}
        <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          <ThemedText variant="caption">UI only: add/edit address actions will be added later.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
