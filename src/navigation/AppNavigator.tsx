import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { useAppState } from '../contexts/AppStateContext';
import { useAuth } from '../contexts/AuthContext';
import { buildNavigationTheme } from '../theme/navigationTheme';
import { useTheme } from '../theme/ThemeProvider';
import {
  CartStackParamList,
  CatalogStackParamList,
  FavoritesStackParamList,
  HomeStackParamList,
  MainTabParamList,
  OrdersStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  SimpleStubStackParamList,
} from '../types/navigation';
import { AboutScreen } from '../screens/AboutScreen';
import { AddressBookScreen } from '../screens/AddressBookScreen';
import { ApplyCouponModalScreen } from '../screens/ApplyCouponModalScreen';
import { AuthWelcomeScreen } from '../screens/AuthWelcomeScreen';
import { CartScreen } from '../screens/CartScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { FAQScreen } from '../screens/FAQScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { FiltersModalScreen } from '../screens/FiltersModalScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { PaymentMethodScreen } from '../screens/PaymentMethodScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StubScreen } from '../screens/StubScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { OnboardingSplashScreen } from '../screens/OnboardingSplashScreen';
import { WelcomeIntroScreen } from '../screens/WelcomeIntroScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const StubStack = createNativeStackNavigator<SimpleStubStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function CatalogStackNavigator() {
  return (
    <CatalogStack.Navigator screenOptions={{ headerShown: false }}>
      <CatalogStack.Screen name="Catalog" component={CatalogScreen} />
    </CatalogStack.Navigator>
  );
}

function CartStackNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="Cart" component={CartScreen} />
    </CartStack.Navigator>
  );
}

function FavoritesStackNavigator() {
  return (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStack.Screen name="Favorites" component={FavoritesScreen} />
    </FavoritesStack.Navigator>
  );
}

function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} />
    </OrdersStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <ProfileStack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      <ProfileStack.Screen name="FAQ" component={FAQScreen} options={{ title: 'FAQ' }} />
      <ProfileStack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact' }} />
      <ProfileStack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms of Service' }} />
      <ProfileStack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy Policy' }} />
    </ProfileStack.Navigator>
  );
}

function StubStackNavigator({ title }: { title: string }) {
  return (
    <StubStack.Navigator screenOptions={{ headerShown: false }}>
      <StubStack.Screen name="Stub" component={StubScreen} initialParams={{ title }} />
    </StubStack.Navigator>
  );
}

function MainTabsNavigator() {
  const theme = useTheme();
  const { cartCount, favoriteIds } = useAppState();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            HomeTab: focused ? 'home' : 'home-outline',
            CatalogTab: focused ? 'grid' : 'grid-outline',
            CartTab: focused ? 'cart' : 'cart-outline',
            FavoritesTab: focused ? 'heart' : 'heart-outline',
            OrdersTab: focused ? 'receipt' : 'receipt-outline',
            ProfileTab: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tabs.Screen name="CatalogTab" component={CatalogStackNavigator} options={{ title: 'Catalog' }} />
      <Tabs.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{ title: 'Cart', tabBarBadge: cartCount > 0 ? cartCount : undefined }}
      />
      <Tabs.Screen
        name="FavoritesTab"
        component={FavoritesStackNavigator}
        options={{ title: 'Favorites', tabBarBadge: favoriteIds.length > 0 ? favoriteIds.length : undefined }}
      />
      <Tabs.Screen name="OrdersTab" component={OrdersStackNavigator} options={{ title: 'Orders' }} />
      <Tabs.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const theme = useTheme();
  const { isAuthenticated, isHydrated } = useAuth();

  return (
    <NavigationContainer theme={buildNavigationTheme(theme)}>
      {!isHydrated ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="OnboardingSplash" component={OnboardingSplashScreen} />
        </RootStack.Navigator>
      ) : isAuthenticated ? (
        <RootStack.Navigator>
          <RootStack.Screen name="MainTabs" component={MainTabsNavigator} options={{ headerShown: false }} />
          <RootStack.Screen
            name="Search"
            component={SearchScreen}
            options={{ title: 'Search', presentation: 'card', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
            options={{ title: 'Product', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ title: 'Checkout', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="OrderDetails"
            component={OrderDetailsScreen}
            options={{ title: 'Order details', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="AddressBook"
            component={AddressBookScreen}
            options={{ title: 'Address book', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="PaymentMethod"
            component={PaymentMethodScreen}
            options={{ title: 'Payment method', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="Success"
            component={SuccessScreen}
            options={{ title: 'Success', headerShadowVisible: false, gestureEnabled: false }}
          />
          <RootStack.Screen
            name="FiltersModal"
            component={FiltersModalScreen}
            options={{ title: 'Filters', presentation: 'modal', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="ApplyCouponModal"
            component={ApplyCouponModalScreen}
            options={{ title: 'Apply Coupon', presentation: 'modal', headerShadowVisible: false }}
          />
        </RootStack.Navigator>
      ) : (
        <RootStack.Navigator initialRouteName="OnboardingSplash">
          <RootStack.Screen
            name="OnboardingSplash"
            component={OnboardingSplashScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="WelcomeIntro"
            component={WelcomeIntroScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="AuthWelcome"
            component={AuthWelcomeScreen}
            options={{ title: 'Welcome', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Sign In', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Register', headerShadowVisible: false }}
          />
          <RootStack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: 'Forgot Password', headerShadowVisible: false }}
          />
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
}
