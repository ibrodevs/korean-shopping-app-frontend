import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';

import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useI18n } from '../contexts/I18nContext';
import { usePaymentCards } from '../contexts/PaymentCardsContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../theme/ThemeProvider';
import type { ProfileStackParamList } from '../types/navigation';
import type { Card } from '../types/payments';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Payments'>;

function brandLabel(brand: Card['brand']) {
  switch (brand) {
    case 'visa':
      return 'Visa';
    case 'mastercard':
      return 'Mastercard';
    case 'amex':
      return 'Amex';
    default:
      return 'Card';
  }
}

export function PaymentsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const { cards, removeCard, setDefaultCard } = usePaymentCards();
  const { showToast } = useToast();

  const [pendingRemove, setPendingRemove] = useState<Card | null>(null);

  const data = useMemo(() => cards, [cards]);

  const requestRemove = (card: Card) => setPendingRemove(card);

  if (data.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <View style={{ padding: 16, paddingTop: 20 }}>
          <EmptyState
            icon="card-outline"
            title="No payment methods yet"
            description="Add a card to make checkout faster."
            ctaLabel="Add payment method"
            onPressCta={() => navigation.navigate('AddCard')}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Modal
        visible={!!pendingRemove}
        transparent
        animationType={theme.reduceMotion ? 'none' : 'fade'}
        onRequestClose={() => setPendingRemove(null)}
      >
        <Pressable
          onPress={() => setPendingRemove(null)}
          style={{ flex: 1, backgroundColor: theme.colors.overlay, padding: 16, justifyContent: 'center' }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              borderRadius: theme.radii.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 14,
              gap: 10,
              ...theme.shadows.card,
            }}
          >
            <ThemedText variant="subtitle" style={{ fontSize: 18 }}>Remove card?</ThemedText>
            <ThemedText variant="muted">This card will be removed from your payment methods.</ThemedText>
            <View style={{ flexDirection: 'row', gap: 10, paddingTop: 6 }}>
              <PrimaryButton
                label="Cancel"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => setPendingRemove(null)}
              />
              <Pressable
                onPress={() => {
                  if (!pendingRemove) return;
                  removeCard(pendingRemove.id);
                  setPendingRemove(null);
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  height: 48,
                  borderRadius: theme.radii.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.danger,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <ThemedText variant="button" style={{ color: '#FFFFFF' }}>Remove</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        renderItem={({ item }) => {
          const deleteDisabled = data.length === 1;
          const isDefault = !!item.isDefault;

          return (
            <View
              style={{
                borderRadius: theme.radii.xl,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                padding: 14,
                gap: 10,
                ...theme.shadows.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.colors.primarySoft,
                      }}
                    >
                      <Ionicons name="card" size={18} color={theme.colors.primary} />
                    </View>
                    <ThemedText weight="semibold">
                      {brandLabel(item.brand)} •••• {item.last4}
                    </ThemedText>
                    {isDefault ? <Badge label="Default" tone="accent" /> : null}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {!isDefault ? (
                    <Pressable
                      onPress={() => {
                        setDefaultCard(item.id);
                        showToast('Default card updated.', 'success');
                      }}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.85 : 1,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: theme.colors.primarySoft,
                        borderWidth: 1,
                        borderColor: 'transparent',
                      })}
                    >
                      <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                        Set default
                      </ThemedText>
                    </Pressable>
                  ) : null}

                  <IconButton
                    icon="trash-outline"
                    accessibilityLabel={deleteDisabled ? t('Cannot remove the only card') : t('Remove card')}
                    style={{ opacity: deleteDisabled ? 0.45 : 1 }}
                    onPress={() => {
                      if (deleteDisabled) {
                        showToast("You can't remove the only card. Add another card first.", 'warning');
                        return;
                      }
                      requestRemove(item);
                    }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="caption">Exp</ThemedText>
                  <ThemedText>{item.exp}</ThemedText>
                </View>
                <View style={{ flex: 2 }}>
                  <ThemedText variant="caption">Holder</ThemedText>
                  <ThemedText numberOfLines={1}>{item.holder}</ThemedText>
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={{ paddingTop: 6, gap: 10 }}>
            <PrimaryButton label="+ Add another card" variant="soft" onPress={() => navigation.navigate('AddCard')} />
            <Pressable
              onPress={() => showToast('Demo only: cards are stored in memory.', 'info')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                alignSelf: 'center',
                paddingVertical: 6,
              })}
            >
              <ThemedText variant="caption">Cards are stored locally (demo).</ThemedText>
            </Pressable>
          </View>
        }
      />
    </ThemedView>
  );
}
