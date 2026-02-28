import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';

import { APP_STRINGS } from '../constants/strings';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../theme/ThemeProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';

export function SettingsScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'Settings'>) {
  const theme = useTheme();
  const appVersion = Constants.expoConfig?.version ?? APP_STRINGS.version;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View
      style={{
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: 12,
        gap: 10,
      }}
    >
      <ThemedText variant="subtitle" style={{ fontSize: 16 }}>{title}</ThemedText>
      {children}
    </View>
  );

  const Segmented = <T extends string>({
    value,
    options,
    onChange,
  }: {
    value: T;
    options: Array<{ label: string; value: T }>;
    onChange: (value: T) => void;
  }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? theme.colors.primary : theme.colors.border,
              backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
            }}
          >
            <ThemedText variant="caption" style={{ fontWeight: '700', color: theme.colors.text }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );

  const NavRow = ({ label, route }: { label: string; route: keyof ProfileStackParamList }) => (
    <Pressable
      onPress={() => navigation.navigate(route)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
      })}
    >
      <ThemedText>{label}</ThemedText>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
    </Pressable>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }}>
        <Section title="Theme">
          <ThemedText variant="caption">Theme mode</ThemedText>
          <Segmented
            value={theme.mode}
            onChange={theme.setThemeMode}
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
          />
        </Section>

        <Section title="Accessibility">
          <ThemedText variant="caption">Font scale</ThemedText>
          <Segmented
            value={theme.fontScaleMode}
            onChange={theme.setFontScaleMode}
            options={[
              { label: 'Small', value: 'small' },
              { label: 'Default', value: 'default' },
              { label: 'Large', value: 'large' },
            ]}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <ThemedText>Reduce motion</ThemedText>
              <ThemedText variant="caption">Shortens or disables subtle UI animations.</ThemedText>
            </View>
            <Switch
              value={theme.reduceMotion}
              onValueChange={theme.setReduceMotion}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </Section>

        <Section title="App">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText>Currency</ThemedText>
            <ThemedText variant="caption">{APP_STRINGS.currency}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText>Version</ThemedText>
            <ThemedText variant="caption">{appVersion}</ThemedText>
          </View>
        </Section>

        <Section title="Support & Legal">
          <NavRow label="About" route="About" />
          <NavRow label="FAQ" route="FAQ" />
          <NavRow label="Contact" route="Contact" />
          <NavRow label="Terms of Service" route="Terms" />
          <NavRow label="Privacy Policy" route="Privacy" />
        </Section>
      </ScrollView>
    </ThemedView>
  );
}
