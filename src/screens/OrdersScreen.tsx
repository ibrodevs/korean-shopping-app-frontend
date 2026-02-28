import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { OrderCard } from '../components/OrderCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useOrders } from '../contexts/OrdersContext';
import { OrdersScreenProps } from '../types/navigation';

const statusLabels = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;

export function OrdersScreen({ navigation }: OrdersScreenProps) {
  const { orders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const grouped = useMemo(() => {
    const orderByStatus = ['processing', 'shipped', 'delivered', 'cancelled'] as const;
    return orderByStatus
      .map((status) => ({
        type: 'header' as const,
        key: `header-${status}`,
        title: statusLabels[status],
      }))
      .flatMap((header) => {
        const status = header.key.replace('header-', '') as keyof typeof statusLabels;
        const items = orders
          .filter((order) => order.status === status)
          .map((order) => ({ type: 'order' as const, key: order.id, order }));
        return items.length ? [header, ...items] : [];
      });
  }, [orders]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
          <AppHeader title="Orders" subtitle="Track recent purchases" />

          {orders.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
              <EmptyState
                icon="receipt-outline"
                title="No orders yet"
                description="Orders will appear here after checkout."
                ctaLabel="Start Shopping"
                onPressCta={() => navigation.getParent()?.navigate('CatalogTab')}
              />
            </View>
          ) : (
            <FlatList
              data={grouped}
              keyExtractor={(item) => item.key}
              contentContainerStyle={{ gap: 10, paddingTop: 14, paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    setTimeout(() => setRefreshing(false), 900);
                  }}
                />
              }
              renderItem={({ item }) =>
                item.type === 'header' ? (
                  <ThemedText variant="subtitle" style={{ fontSize: 16 }}>{item.title}</ThemedText>
                ) : (
                  <OrderCard
                    order={item.order}
                    onPress={() =>
                      navigation.getParent()?.getParent()?.navigate('OrderDetails', {
                        orderId: item.order.id,
                      })
                    }
                  />
                )
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
