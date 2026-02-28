import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AUTH_KEY = 'korean-app/auth-user';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(AUTH_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        setUser(JSON.parse(raw) as AuthUser);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setIsHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isHydrated,
      login: async (email) => {
        const mockUser = { name: 'New User', email: email.trim().toLowerCase() };
        setUser(mockUser);
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
      },
      register: async (name, email) => {
        const mockUser = {
          name: name.trim() || 'New User',
          email: email.trim().toLowerCase(),
        };
        setUser(mockUser);
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
      },
      logout: async () => {
        setUser(null);
        await AsyncStorage.removeItem(AUTH_KEY);
      },
    }),
    [isHydrated, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
