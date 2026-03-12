import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { extractApiErrorMessage } from '../api/client';
import { getMyOrderDetail, listMyOrders } from '../api/orders';
import { useAuth } from './AuthContext';
import { Order } from '../types/models';

const ORDERS_KEY = 'korean-app/orders';

type OrdersContextValue = {
  orders: Order[];
  isHydrated: boolean;
  getOrderById: (orderId: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
  getOrderDetail: (orderId: string) => Promise<Order>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  lastError: string | null;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function mapBackendStatusToUi(status: string): Order['status'] {
  switch ((status || '').toLowerCase()) {
    case 'shipped':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'canceled':
    case 'cancelled':
    case 'refunded':
    case 'failed':
      return 'cancelled';
    case 'pending':
    case 'confirmed':
    case 'processing':
    default:
      return 'processing';
  }
}

export function OrdersProvider({ children }: PropsWithChildren) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { isAuthenticated, isHydrated: isAuthHydrated, requestAuthorizedJson } = useAuth();

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(ORDERS_KEY);
        if (!mounted) return;
        if (raw) {
          setOrders(JSON.parse(raw) as Order[]);
        }
      } catch {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setIsHydrated(true);
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders)).catch(() => undefined);
  }, [orders, isHydrated]);

  const refreshOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setLastError(null);
      return;
    }

    try {
      setLastError(null);
      const page = await listMyOrders(requestAuthorizedJson);
      const mapped: Order[] = page.results.map((o) => ({
        id: String(o.id),
        orderNumber: o.order_number,
        status: mapBackendStatusToUi(o.status),
        createdAt: o.created_at,
        total: toNumber(o.total_amount),
        totalItems: o.total_items,
        items: [],
        paymentStatus: o.payment_status,
        paymentMethod: o.payment_method,
        deliveryMethod: o.delivery_method,
      }));
      setOrders(mapped);
    } catch (e) {
      setLastError(extractApiErrorMessage(e));
      throw e;
    }
  }, [isAuthenticated, requestAuthorizedJson]);

  const getOrderDetail = useCallback(async (orderId: string): Promise<Order> => {
    const numericId = Number(orderId);
    if (!Number.isFinite(numericId)) throw new Error('Invalid order id');

    const detail = await getMyOrderDetail(requestAuthorizedJson, numericId);
    const mapped: Order = {
      id: String(detail.id),
      orderNumber: detail.order_number,
      status: mapBackendStatusToUi(detail.status),
      createdAt: detail.created_at,
      total: toNumber(detail.total_amount),
      totalItems: detail.total_items,
      items: detail.items.map((it) => ({
        id: String(it.id),
        productName: it.product_name,
        sku: it.sku,
        qty: it.quantity,
        price: toNumber(it.unit_price),
        lineTotal: toNumber(it.line_total),
      })),
      paymentStatus: detail.payment_status,
      paymentMethod: detail.payment_method,
      deliveryMethod: detail.delivery_method,
      discount: toNumber(detail.discount_amount),
      deliveryFee: toNumber(detail.shipping_cost),
    };

    // Keep list in sync if present.
    setOrders((prev) => prev.map((o) => (o.id === mapped.id ? { ...o, ...mapped } : o)));
    return mapped;
  }, [requestAuthorizedJson]);

  useEffect(() => {
    if (!isHydrated || !isAuthHydrated) return;
    if (!isAuthenticated) {
      setOrders([]);
      setLastError(null);
      return;
    }

    // Best-effort initial fetch after login/hydration
    refreshOrders().catch(() => undefined);
  }, [isAuthenticated, isAuthHydrated, isHydrated, refreshOrders]);

  const value = useMemo<OrdersContextValue>(() => {
    const getOrderById = (orderId: string) => orders.find((order) => order.id === orderId);

    return {
      orders,
      isHydrated,
      getOrderById,
      refreshOrders,
      getOrderDetail,
      setOrders,
      lastError,
    };
  }, [getOrderDetail, isHydrated, lastError, orders, refreshOrders]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}
