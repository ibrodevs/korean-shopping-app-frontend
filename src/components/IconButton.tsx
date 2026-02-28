import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, PressableProps } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type Props = PressableProps & {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  active?: boolean;
};

export function IconButton({ icon, size = 20, active = false, style, ...props }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? theme.colors.primarySoft : theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: active ? 'transparent' : theme.colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        typeof style === 'function' ? undefined : style,
      ]}
    >
      <Ionicons
        name={icon}
        size={size}
        color={active ? theme.colors.accent : theme.colors.text}
      />
    </Pressable>
  );
}
