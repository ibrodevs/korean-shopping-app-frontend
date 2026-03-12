import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { extractApiErrorMessage } from '../api/client';
import { BackendPickupLocation, listPickupLocations } from '../api/orders';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppState } from '../contexts/AppStateContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

function formatPickupLocationDetail(location: BackendPickupLocation): string {
  return [location.address, location.address_line2, location.city, location.phone].filter(Boolean).join(' • ');
}

export function AddressBookScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddressBook'>) {
  const theme = useTheme();
  const { isAuthenticated, requestAuthorizedJson } = useAuth();
  const { checkoutDraft, setCheckoutAddress } = useAppState();
  const [pickupLocations, setPickupLocations] = useState<BackendPickupLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setPickupLocations([]);
      setErrorMessage('Sign in to load active pickup locations.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const locations = await listPickupLocations(requestAuthorizedJson);
        if (cancelled) return;
        setPickupLocations(locations);
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(extractApiErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, requestAuthorizedJson]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {Array.isArray(pickupLocations) &&
          pickupLocations.map((location) => {
          const detail = formatPickupLocationDetail(location);
          const active = checkoutDraft.pickupLocationId === location.id;

          return (
            <Pressable
              key={location.id}
              onPress={() => {
                setCheckoutAddress(location.name, detail, location.id);
                navigation.goBack();
              }}
              style={{
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                padding: 12,
                gap: 6,
              }}
            >
              <ThemedText weight="semibold">{location.name}</ThemedText>
              <ThemedText variant="muted">{detail}</ThemedText>

              {location.working_hours && (
                <ThemedText variant="caption">
                  {location.working_hours}
                </ThemedText>
              )}
            </Pressable>
          );
        })}
        <View style={{ borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12 }}>
          {loading ? <ThemedText variant="caption">Loading pickup locations…</ThemedText> : null}
          {!loading && errorMessage ? <ThemedText variant="caption">{errorMessage}</ThemedText> : null}
          {!loading && !errorMessage && pickupLocations.length === 0 ? (
            <ThemedText variant="caption">No active pickup locations are available.</ThemedText>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
