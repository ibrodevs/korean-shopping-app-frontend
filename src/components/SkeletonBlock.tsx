import React from 'react';
import { DimensionValue, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type Props = {
  width?: DimensionValue;
  height: number;
  radius?: number;
};

export function SkeletonBlock({ width = '100%', height, radius }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        width,
        height,
        borderRadius: radius ?? 12,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    />
  );
}
