import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

import { darkPalette, lightPalette, radii, shadowPresets, spacing, typography } from './tokens';

const THEME_PREFS_KEY = 'korean-app/theme-prefs';

export type ThemeMode = 'system' | 'light' | 'dark';
export type FontScaleMode = 'small' | 'default' | 'large';

type ThemePreferences = {
  mode: ThemeMode;
  fontScaleMode: FontScaleMode;
  reduceMotion: boolean;
};

const defaultPreferences: ThemePreferences = {
  mode: 'light',
  fontScaleMode: 'default',
  reduceMotion: false,
};

export type AppTheme = {
  scheme: NonNullable<ColorSchemeName>;
  isDark: boolean;
  colors: typeof lightPalette;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadowPresets;
  mode: ThemeMode;
  fontScaleMode: FontScaleMode;
  fontScale: number;
  reduceMotion: boolean;
  motion: {
    quick: number;
    normal: number;
  };
  setThemeMode: (mode: ThemeMode) => void;
  setFontScaleMode: (mode: FontScaleMode) => void;
  setReduceMotion: (value: boolean) => void;
};

const ThemeContext = createContext<AppTheme | null>(null);

const fontScaleMap: Record<FontScaleMode, number> = {
  small: 0.92,
  default: 1,
  large: 1.1,
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme() ?? 'light';
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultPreferences);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(THEME_PREFS_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
        setPreferences((prev) => ({
          mode: parsed.mode ?? prev.mode,
          fontScaleMode: parsed.fontScaleMode ?? prev.fontScaleMode,
          reduceMotion: parsed.reduceMotion ?? prev.reduceMotion,
        }));
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(THEME_PREFS_KEY, JSON.stringify(preferences)).catch(() => undefined);
  }, [preferences]);

  const scheme =
    preferences.mode === 'system' ? systemScheme : preferences.mode === 'dark' ? 'dark' : 'light';
  const isDark = scheme === 'dark';
  const fontScale = fontScaleMap[preferences.fontScaleMode];

  const value = useMemo<AppTheme>(
    () => ({
      scheme,
      isDark,
      colors: isDark ? darkPalette : lightPalette,
      spacing,
      radii,
      typography,
      shadows: shadowPresets,
      mode: preferences.mode,
      fontScaleMode: preferences.fontScaleMode,
      fontScale,
      reduceMotion: preferences.reduceMotion,
      motion: {
        quick: preferences.reduceMotion ? 0 : 120,
        normal: preferences.reduceMotion ? 0 : 220,
      },
      setThemeMode: (mode) => setPreferences((prev) => ({ ...prev, mode })),
      setFontScaleMode: (fontScaleMode) => setPreferences((prev) => ({ ...prev, fontScaleMode })),
      setReduceMotion: (reduceMotion) => setPreferences((prev) => ({ ...prev, reduceMotion })),
    }),
    [fontScale, isDark, preferences.fontScaleMode, preferences.mode, preferences.reduceMotion, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
