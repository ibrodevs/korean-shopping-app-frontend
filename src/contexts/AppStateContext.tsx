import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { CartItem, CheckoutPaymentMethod } from '../types/models';
import { CatalogFilters, CatalogSortOption, defaultCatalogFilters } from '../types/ui';
import { CouponCode, getCartLineKey } from '../utils/pricing';

const CART_KEY = 'korean-app/cart';
const FAVORITES_KEY = 'korean-app/favorites';
const UI_PREFS_KEY = 'korean-app/ui-prefs';

type AddToCartPayload = {
  productId: string;
  qty?: number;
  selectedSize?: string;
  selectedColor?: string;
};

type CheckoutDraft = {
  pickupLocationId: number | null;
  addressLabel: string;
  addressDetail: string;
  deliveryTime: string;
  paymentMethod: CheckoutPaymentMethod;
  couponCode: CouponCode;
};

type UiPrefs = {
  recentSearches: string[];
  catalogSort: CatalogSortOption;
  catalogFilters: CatalogFilters;
};

type AppStateContextValue = {
  cartItems: CartItem[];
  favoriteIds: string[];
  isHydrated: boolean;
  checkoutDraft: CheckoutDraft;
  recentSearches: string[];
  catalogSort: CatalogSortOption;
  catalogFilters: CatalogFilters;
  addToCart: (payload: AddToCartPayload) => void;
  addManyToCart: (items: CartItem[]) => void;
  updateCartQty: (productId: string, qty: number) => void;
  updateCartItemQty: (lineKey: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  removeCartItem: (lineKey: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  saveForLater: (lineKey: string) => void;
  cartCount: number;
  setCheckoutAddress: (label: string, detail: string, pickupLocationId: number | null) => void;
  setCheckoutDeliveryTime: (value: string) => void;
  setCheckoutPaymentMethod: (value: CheckoutPaymentMethod) => void;
  setCheckoutCoupon: (coupon: CouponCode) => void;
  resetCheckoutDraft: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
  setCatalogSort: (sort: CatalogSortOption) => void;
  setCatalogFilters: (filters: CatalogFilters) => void;
  resetCatalogFilters: () => void;
};

const defaultCheckoutDraft: CheckoutDraft = {
  pickupLocationId: null,
  addressLabel: 'Pickup location',
  addressDetail: 'Select an active pickup point before checkout.',
  deliveryTime: 'Next arrival: Tue, 18:00 - 21:00',
  paymentMethod: 'cash',
  couponCode: null,
};

const defaultUiPrefs: UiPrefs = {
  recentSearches: [],
  catalogSort: 'popular',
  catalogFilters: defaultCatalogFilters,
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>(defaultCheckoutDraft);
  const [uiPrefs, setUiPrefs] = useState<UiPrefs>(defaultUiPrefs);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const [cartRaw, favoritesRaw, uiPrefsRaw] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(UI_PREFS_KEY),
        ]);

        if (!mounted) return;

        if (cartRaw) setCartItems(JSON.parse(cartRaw) as CartItem[]);
        if (favoritesRaw) setFavoriteIds(JSON.parse(favoritesRaw) as string[]);
        if (uiPrefsRaw) {
          const parsed = JSON.parse(uiPrefsRaw) as Partial<UiPrefs>;
          setUiPrefs((prev) => ({
            recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : prev.recentSearches,
            catalogSort: parsed.catalogSort ?? prev.catalogSort,
            catalogFilters: parsed.catalogFilters
              ? { ...prev.catalogFilters, ...parsed.catalogFilters }
              : prev.catalogFilters,
          }));
        }
      } catch {
        // Keep defaults on storage parse/read failure.
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
    AsyncStorage.setItem(CART_KEY, JSON.stringify(cartItems)).catch(() => undefined);
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds)).catch(() => undefined);
  }, [favoriteIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify(uiPrefs)).catch(() => undefined);
  }, [isHydrated, uiPrefs]);

  const value = useMemo<AppStateContextValue>(() => {
    const addToCart = ({ productId, qty = 1, selectedColor, selectedSize }: AddToCartPayload) => {
      const lineKey = getCartLineKey({ productId, selectedColor, selectedSize });
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => getCartLineKey(item) === lineKey);

        if (existingIndex >= 0) {
          const next = [...prev];
          const existing = next[existingIndex];
          next[existingIndex] = { ...existing, qty: existing.qty + qty };
          return next;
        }

        return [...prev, { productId, qty, selectedColor, selectedSize }];
      });
    };

    const addManyToCart = (items: CartItem[]) => {
      items.forEach((item) => addToCart(item));
    };

    const updateCartQty = (productId: string, qty: number) => {
      setCartItems((prev) =>
        prev
          .map((item) => (item.productId === productId ? { ...item, qty } : item))
          .filter((item) => item.qty > 0),
      );
    };

    const updateCartItemQty = (lineKey: string, qty: number) => {
      setCartItems((prev) =>
        prev
          .map((item) => (getCartLineKey(item) === lineKey ? { ...item, qty } : item))
          .filter((item) => item.qty > 0),
      );
    };

    const removeFromCart = (productId: string) => {
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const removeCartItem = (lineKey: string) => {
      setCartItems((prev) => prev.filter((item) => getCartLineKey(item) !== lineKey));
    };

    const clearCart = () => setCartItems([]);

    const addFavorite = (productId: string) => {
      setFavoriteIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
    };

    const removeFavorite = (productId: string) => {
      setFavoriteIds((prev) => prev.filter((id) => id !== productId));
    };

    const toggleFavorite = (productId: string) => {
      setFavoriteIds((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
      );
    };

    const isFavorite = (productId: string) => favoriteIds.includes(productId);

    const saveForLater = (lineKey: string) => {
      const item = cartItems.find((cartItem) => getCartLineKey(cartItem) === lineKey);
      if (!item) return;
      addFavorite(item.productId);
      removeCartItem(lineKey);
    };

    const setCheckoutAddress = (label: string, detail: string, pickupLocationId: number | null) => {
      setCheckoutDraft((prev) => ({ ...prev, addressLabel: label, addressDetail: detail, pickupLocationId }));
    };

    const setCheckoutDeliveryTime = (deliveryTime: string) => {
      setCheckoutDraft((prev) => ({ ...prev, deliveryTime }));
    };

    const setCheckoutPaymentMethod = (paymentMethod: CheckoutPaymentMethod) => {
      setCheckoutDraft((prev) => ({ ...prev, paymentMethod }));
    };

    const setCheckoutCoupon = (couponCode: CouponCode) => {
      setCheckoutDraft((prev) => ({ ...prev, couponCode }));
    };

    const resetCheckoutDraft = () => setCheckoutDraft(defaultCheckoutDraft);

    const addRecentSearch = (query: string) => {
      const normalized = query.trim();
      if (!normalized) return;
      setUiPrefs((prev) => ({
        ...prev,
        recentSearches: [normalized, ...prev.recentSearches.filter((q) => q !== normalized)].slice(0, 8),
      }));
    };

    const clearRecentSearches = () => {
      setUiPrefs((prev) => ({ ...prev, recentSearches: [] }));
    };

    const removeRecentSearch = (query: string) => {
      setUiPrefs((prev) => ({
        ...prev,
        recentSearches: prev.recentSearches.filter((q) => q !== query),
      }));
    };

    const setCatalogSort = (catalogSort: CatalogSortOption) => {
      setUiPrefs((prev) => ({ ...prev, catalogSort }));
    };

    const setCatalogFilters = (catalogFilters: CatalogFilters) => {
      setUiPrefs((prev) => ({ ...prev, catalogFilters }));
    };

    const resetCatalogFilters = () => {
      setUiPrefs((prev) => ({ ...prev, catalogFilters: defaultCatalogFilters }));
    };

    return {
      cartItems,
      favoriteIds,
      isHydrated,
      checkoutDraft,
      recentSearches: uiPrefs.recentSearches,
      catalogSort: uiPrefs.catalogSort,
      catalogFilters: uiPrefs.catalogFilters,
      addToCart,
      addManyToCart,
      updateCartQty,
      updateCartItemQty,
      removeFromCart,
      removeCartItem,
      clearCart,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      isFavorite,
      saveForLater,
      cartCount: cartItems.reduce((sum, item) => sum + item.qty, 0),
      setCheckoutAddress,
      setCheckoutDeliveryTime,
      setCheckoutPaymentMethod,
      setCheckoutCoupon,
      resetCheckoutDraft,
      addRecentSearch,
      clearRecentSearches,
      removeRecentSearch,
      setCatalogSort,
      setCatalogFilters,
      resetCatalogFilters,
    };
  }, [cartItems, favoriteIds, isHydrated, checkoutDraft, uiPrefs]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
