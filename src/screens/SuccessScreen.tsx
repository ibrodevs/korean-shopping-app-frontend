import React from 'react';
import { View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export function SuccessScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Success'>) {
  const { orderId } = route.params;

  return (
    <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center', gap: 14 }}>
      <EmptyState
        icon="checkmark-circle-outline"
        title="Order placed"
        description={`Your order ${orderId} has been created successfully.`}
      />
      <ThemedText variant="caption" style={{ textAlign: 'center' }}>
        This is a frontend-only demo. Payment and Korea-to-Bishkek warehouse tracking are simulated.
      </ThemedText>
      <PrimaryButton label="View Order" onPress={() => navigation.replace('OrderDetails', { orderId })} />
      <PrimaryButton
        label="Continue Shopping"
        variant="outline"
        onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
      />
    </ThemedView>
  );
}
