import React from 'react';
import { View } from 'react-native';

import { Order } from '../types/models';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './ThemedText';

const steps = ['Processing', 'Packed', 'Shipped', 'Delivered'] as const;

const statusIndexMap: Record<Order['status'], number> = {
  processing: 0,
  shipped: 2,
  delivered: 3,
  cancelled: 0,
};

type Props = {
  status: Order['status'];
};

export function StatusTimeline({ status }: Props) {
  const theme = useTheme();
  const activeIndex = statusIndexMap[status];

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor:
                  status === 'cancelled'
                    ? index === 0
                      ? theme.colors.danger
                      : theme.colors.border
                    : index <= activeIndex
                      ? (index === activeIndex && status === 'delivered' ? theme.colors.accent : theme.colors.primary)
                      : theme.colors.border,
              }}
            />
            {index < steps.length - 1 ? (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor:
                    status !== 'cancelled' && index < activeIndex ? theme.colors.primary : theme.colors.border,
                  marginHorizontal: 6,
                }}
              />
            ) : null}
          </React.Fragment>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
        {steps.map((step) => (
          <ThemedText key={step} variant="caption" style={{ flex: 1, textAlign: 'center' }}>
            {step}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}
