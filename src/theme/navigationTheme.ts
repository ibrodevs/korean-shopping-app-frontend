import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

import { AppTheme } from './ThemeProvider';

export const buildNavigationTheme = (theme: AppTheme): Theme => {
  const base = theme.isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.accent,
    },
  };
};
