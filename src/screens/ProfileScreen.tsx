import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_STRINGS } from '../constants/strings';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../theme/ThemeProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList, RootStackParamList } from '../types/navigation';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Profile'>,
  CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'ProfileTab'>, NativeStackScreenProps<RootStackParamList>>
>;

const quickActions = [
  { key: 'orders', label: 'Orders', icon: 'receipt-outline', action: 'orders' },
  { key: 'favorites', label: 'Favorites', icon: 'heart-outline', action: 'favorites' },
  { key: 'addresses', label: 'Addresses', icon: 'location-outline', action: 'addresses' },
  { key: 'payments', label: 'Payments', icon: 'card-outline', action: 'payments' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', action: 'settings' },
] as const;

export function ProfileScreen({ navigation }: Props) {
  const theme = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const ActionCard = ({ item }: { item: (typeof quickActions)[number] }) => (
    <Pressable
      onPress={() => {
        if (item.action === 'orders') return navigation.getParent()?.navigate('OrdersTab');
        if (item.action === 'favorites') return navigation.getParent()?.navigate('FavoritesTab');
        if (item.action === 'addresses') return navigation.getParent()?.getParent()?.navigate('AddressBook');
        if (item.action === 'payments') return navigation.navigate('Payments');
        return navigation.navigate('Settings');
      }}
      style={({ pressed }) => ({
        width: '31%',
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: 12,
        gap: 8,
        opacity: pressed ? 0.9 : 1,
        ...theme.shadows.soft,
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primarySoft,
        }}
      >
        <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
      </View>
      <ThemedText variant="caption" style={{ color: theme.colors.text, fontWeight: '700' }}>
        {item.label}
      </ThemedText>
    </Pressable>
  );

  const SupportLink = ({ label, route }: { label: string; route: keyof ProfileStackParamList }) => (
    <Pressable
      onPress={() => navigation.navigate(route as never)}
      style={({ pressed }) => ({
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <ThemedText>{label}</ThemedText>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
    </Pressable>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }}>
          <View
            style={{
              borderRadius: theme.radii.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 14,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: theme.colors.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="subtitle">{user?.name ?? APP_STRINGS.guestName}</ThemedText>
                <ThemedText variant="muted">{user?.email ?? APP_STRINGS.guestEmail}</ThemedText>
              </View>
            </View>
            {isAuthenticated ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <PrimaryButton
                  label="Edit Profile"
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('EditProfile')}
                />
                <PrimaryButton
                  label="Sign Out"
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={async () => {
                    await logout();
                    showToast('Signed out');
                  }}
                />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <PrimaryButton
                  label="Sign In"
                  style={{ flex: 1 }}
                  onPress={() => navigation.getParent()?.getParent()?.navigate('Login')}
                />
                <PrimaryButton
                  label="Register"
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => navigation.getParent()?.getParent()?.navigate('Register')}
                />
              </View>
            )}
          </View>

          <View style={{ gap: 10 }}>
            <ThemedText variant="subtitle" style={{ fontSize: 16 }}>Quick actions</ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {quickActions.map((item) => (
                <ActionCard key={item.key} item={item} />
              ))}
            </View>
          </View>

          <View
            style={{
              borderRadius: theme.radii.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 12,
              gap: 6,
            }}
          >
            <ThemedText variant="caption" style={{ color: theme.colors.accent, fontWeight: '700' }}>
              Marketplace policy
            </ThemedText>
            <ThemedText variant="caption">{APP_STRINGS.adminUploadsOnly}</ThemedText>
          </View>

          <View
            style={{
              borderRadius: theme.radii.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 12,
            }}
          >
            <ThemedText variant="subtitle" style={{ fontSize: 16, paddingTop: 12 }}>
              Support
            </ThemedText>
            <SupportLink label="FAQ" route="FAQ" />
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <SupportLink label="Contact" route="Contact" />
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <SupportLink label="About" route="About" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
