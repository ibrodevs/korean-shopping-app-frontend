import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type MainTabParamList = {
  HomeTab: undefined;
  CatalogTab: undefined;
  CartTab: undefined;
  FavoritesTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type CatalogStackParamList = {
  Catalog: undefined;
};

export type CartStackParamList = {
  Cart: undefined;
};

export type FavoritesStackParamList = {
  Favorites: undefined;
};

export type OrdersStackParamList = {
  Orders: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  About: undefined;
  FAQ: undefined;
  Contact: undefined;
  Terms: undefined;
  Privacy: undefined;
};

export type SimpleStubStackParamList = {
  Stub: { title: string };
};

export type RootStackParamList = {
  OnboardingSplash: undefined;
  WelcomeIntro: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AuthWelcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Search: undefined;
  ProductDetails: { productId: string };
  FiltersModal: undefined;
  Checkout: undefined;
  OrderDetails: { orderId: string };
  AddressBook: undefined;
  PaymentMethod: undefined;
  ApplyCouponModal: undefined;
  Success: { orderId: string };
};

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type CatalogScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CatalogStackParamList, 'Catalog'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'CatalogTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type CartScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CartStackParamList, 'Cart'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'CartTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type FavoritesScreenProps = CompositeScreenProps<
  NativeStackScreenProps<FavoritesStackParamList, 'Favorites'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'FavoritesTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type OrdersScreenProps = CompositeScreenProps<
  NativeStackScreenProps<OrdersStackParamList, 'Orders'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'OrdersTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;
