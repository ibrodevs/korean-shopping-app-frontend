export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
  },
  lineHeights: {
    xs: 16,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadowPresets = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
};

export type ThemePalette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
  cardGlass: string;
};

export const lightPalette: ThemePalette = {
  background: '#F6FBFD',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF8FB',
  text: '#07131A',
  textMuted: '#60717B',
  border: '#D9E8EE',
  primary: '#25D1E4',
  primarySoft: 'rgba(37, 209, 228, 0.14)',
  accent: '#FF0084',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  overlay: 'rgba(7, 19, 26, 0.45)',
  cardGlass: 'rgba(255,255,255,0.72)',
};

export const darkPalette: ThemePalette = {
  background: '#07131A',
  surface: '#0F1E27',
  surfaceAlt: '#122632',
  text: '#F3FBFF',
  textMuted: '#A4BBC5',
  border: '#203845',
  primary: '#25D1E4',
  primarySoft: 'rgba(37, 209, 228, 0.16)',
  accent: '#FF0084',
  success: '#22C55E',
  warning: '#FBBF24',
  danger: '#FB7185',
  overlay: 'rgba(0,0,0,0.55)',
  cardGlass: 'rgba(18,38,50,0.66)',
};
