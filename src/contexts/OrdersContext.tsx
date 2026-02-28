import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { mockOrders, products } from '../data/mockData';
import { CartItem, Order } from '../types/models';

const ORDERS_KEY = 'korean-app/orders';

type CreateOrderPayload = {
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string | null;
};

type OrdersContextValue = {
  orders: Order[];
  isHydrated: boolean;
  createOrderFromCart: (payload: CreateOrderPayload) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  reorderOrderToCartItems: (orderId: string) => CartItem[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

function buildOrderId() {
  const now = new Date();
  return `ord-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function OrdersProvider({ children }: PropsWithChildren) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(ORDERS_KEY);
        if (!mounted) return;
        if (raw) {
          setOrders(JSON.parse(raw) as Order[]);
        } else {
          setOrders(mockOrders);
        }
      } catch {
        if (mounted) setOrders(mockOrders);
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

  const value = useMemo<OrdersContextValue>(() => {
    const createOrderFromCart = ({ cartItems, subtotal, discount, deliveryFee, total, couponCode }: CreateOrderPayload) => {
      const order: Order = {
        id: buildOrderId(),
        items: cartItems.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          price: products.find((p) => p.id === item.productId)?.price ?? 0,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
        total,
        status: 'processing',
        createdAt: new Date().toISOString(),
        discount,
        deliveryFee,
        couponCode: couponCode ?? undefined,
      };

      setOrders((prev) => [order, ...prev]);
      return order;
    };

    const getOrderById = (orderId: string) => orders.find((order) => order.id === orderId);

    const reorderOrderToCartItems = (orderId: string) => {
      const order = orders.find((item) => item.id === orderId);
      if (!order) return [];
      return order.items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      }));
    };

    return {
      orders,
      isHydrated,
      createOrderFromCart,
      getOrderById,
      reorderOrderToCartItems,
      setOrders,
    };
  }, [orders, isHydrated]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}
