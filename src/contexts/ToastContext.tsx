import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from '../components/ThemedText';

type ToastTone = 'info' | 'success' | 'warning';

type ToastState = {
  visible: boolean;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', tone: 'info' });

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const showToast: ToastContextValue['showToast'] = (message, tone = 'info') => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast({ visible: true, message, tone });
    anim.stopAnimation();
    Animated.timing(anim, {
      toValue: 1,
      duration: theme.motion.normal,
      useNativeDriver: true,
    }).start();

    hideTimer.current = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: theme.motion.quick,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setToast((prev) => ({ ...prev, visible: false }));
      });
    }, theme.reduceMotion ? 1000 : 1800);
  };

  const toneStyles = {
    info: { border: theme.colors.primary, bg: theme.colors.surface, dot: theme.colors.primary },
    success: { border: theme.colors.primary, bg: theme.colors.surface, dot: theme.colors.primary },
    warning: { border: theme.colors.accent, bg: theme.colors.surface, dot: theme.colors.accent },
  }[toast.tone];

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, bottom: 24 }}>
          <Animated.View
            style={{
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
                },
                {
                  scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }),
                },
              ],
              borderRadius: theme.radii.lg,
              borderWidth: 1,
              borderColor: toneStyles.border,
              backgroundColor: toneStyles.bg,
              paddingHorizontal: 12,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              ...theme.shadows.card,
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: toneStyles.dot }} />
            <ThemedText variant="caption" style={{ color: theme.colors.text, fontWeight: '700' }}>
              {toast.message}
            </ThemedText>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
