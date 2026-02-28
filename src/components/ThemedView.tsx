import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type Props = ViewProps & {
  surface?: 'background' | 'surface' | 'surfaceAlt';
  style?: StyleProp<ViewStyle>;
};

export function ThemedView({ surface = 'background', style, ...props }: Props) {
  const theme = useTheme();

  return <View {...props} style={[{ backgroundColor: theme.colors[surface] }, style]} />;
}
