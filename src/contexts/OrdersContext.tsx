import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { extractApiErrorMessage } from '../api/client';
import { cancelMyOrder, getMyOrderDetail, listMyOrders } from '../api/orders';
import { useAuth } from './AuthContext';
import { Order } from '../types/models';

const ORDERS_KEY = 'korean-app/orders';

type OrdersContextValue = {
  orders: Order[];
  isHydrated: boolean;
  getOrderById: (orderId: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
  getOrderDetail: (orderId: string) => Promise<Order>;
  cancelOrder: (orderId: string, reason?: string) => Promise<Order>;
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

function canCancelBackendStatus(status: string): boolean {
  const normalized = (status || '').toLowerCase();
  return normalized === 'pending' || normalized === 'confirmed';
}

function mapListOrderToUi(order: {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  total_amount: string;
  total_items: number;
  payment_status: string;
  payment_method: string;
  delivery_method: string;
}): Order {
  return {
    id: String(order.id),
    orderNumber: order.order_number,
    status: mapBackendStatusToUi(order.status),
    backendStatus: order.status,
    createdAt: order.created_at,
    total: toNumber(order.total_amount),
    totalItems: order.total_items,
    items: [],
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    deliveryMethod: order.delivery_method,
    canCancel: canCancelBackendStatus(order.status),
  };
}

function mapDetailOrderToUi(detail: {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  total_amount: string;
  total_items: number;
  items: Array<{
    id: number;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: string;
    line_total: string;
  }>;
  payment_status: string;
  payment_method: string;
  delivery_method: string;
  discount_amount: string;
  shipping_cost: string;
  customer_email: string;
  customer_phone: string;
  full_name: string;
  full_address: string;
  delivery_comment: string;
  pickup_location_name: string;
  pickup_city: string;
  pickup_address: string;
}): Order {
  return {
    id: String(detail.id),
    orderNumber: detail.order_number,
    status: mapBackendStatusToUi(detail.status),
    backendStatus: detail.status,
    createdAt: detail.created_at,
    total: toNumber(detail.total_amount),
    totalItems: detail.total_items,
    items: detail.items.map((item) => ({
      id: String(item.id),
      productName: item.product_name,
      sku: item.sku,
      qty: item.quantity,
      price: toNumber(item.unit_price),
      lineTotal: toNumber(item.line_total),
    })),
    paymentStatus: detail.payment_status,
    paymentMethod: detail.payment_method,
    deliveryMethod: detail.delivery_method,
    discount: toNumber(detail.discount_amount),
    deliveryFee: toNumber(detail.shipping_cost),
    customerEmail: detail.customer_email,
    customerPhone: detail.customer_phone,
    fullName: detail.full_name,
    fullAddress: detail.full_address,
    deliveryComment: detail.delivery_comment,
    pickupLocationName: detail.pickup_location_name,
    pickupCity: detail.pickup_city,
    pickupAddress: detail.pickup_address,
    canCancel: canCancelBackendStatus(detail.status),
  };
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

  const upsertOrder = useCallback((nextOrder: Order) => {
    setOrders((prev) => {
      const existingIndex = prev.findIndex((order) => order.id === nextOrder.id);
      if (existingIndex === -1) {
        return [nextOrder, ...prev];
      }

      const next = [...prev];
      next[existingIndex] = { ...next[existingIndex], ...nextOrder };
      return next;
    });
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setLastError(null);
      return;
    }

    try {
      setLastError(null);
      const page = await listMyOrders(requestAuthorizedJson);
      const mapped: Order[] = page.results.map(mapListOrderToUi);
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
    const mapped = mapDetailOrderToUi(detail);
    upsertOrder(mapped);
    return mapped;
  }, [requestAuthorizedJson, upsertOrder]);

  const cancelOrder = useCallback(async (orderId: string, reason?: string): Promise<Order> => {
    const numericId = Number(orderId);
    if (!Number.isFinite(numericId)) throw new Error('Invalid order id');

    const detail = await cancelMyOrder(requestAuthorizedJson, numericId, { reason });
    const mapped = mapDetailOrderToUi(detail);
    upsertOrder(mapped);
    return mapped;
  }, [requestAuthorizedJson, upsertOrder]);

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
      cancelOrder,
      setOrders,
      lastError,
    };
  }, [cancelOrder, getOrderDetail, isHydrated, lastError, orders, refreshOrders]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}
