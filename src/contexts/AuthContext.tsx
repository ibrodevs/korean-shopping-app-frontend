import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import {
  BackendUser,
  googleAuthRequest,
  loginRequest,
  logoutRequest,
  meRequest,
  refreshAccessToken,
  registerRequest,
} from '../api/auth';

type AuthUser = {
  id?: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  photo?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (params: { idToken?: string; accessToken?: string }) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
};

type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

const AUTH_KEY = 'korean-app/auth-session';
const AuthContext = createContext<AuthContextValue | null>(null);

function mapBackendUser(user: BackendUser): AuthUser {
  const firstName = (user.first_name ?? '').trim();
  const lastName = (user.last_name ?? '').trim();
  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || 'New User';

  return {
    id: user.id,
    firstName,
    lastName,
    name,
    email: user.email.trim().toLowerCase(),
    photo: user.photo ?? null,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_KEY);
        if (!mounted || !raw) return;

        const session = JSON.parse(raw) as AuthSession;
        if (!session.accessToken || !session.refreshToken) {
          await AsyncStorage.removeItem(AUTH_KEY);
          return;
        }

        try {
          const me = await meRequest(session.accessToken);
          if (!mounted) return;
          setUser(mapBackendUser(me));
          setAccessToken(session.accessToken);
          setRefreshToken(session.refreshToken);
        } catch {
          const nextAccessToken = await refreshAccessToken(session.refreshToken);
          if (!mounted) return;
          const me = await meRequest(nextAccessToken);
          if (!mounted) return;
          const nextUser = mapBackendUser(me);
          setUser(nextUser);
          setAccessToken(nextAccessToken);
          setRefreshToken(session.refreshToken);
          await AsyncStorage.setItem(
            AUTH_KEY,
            JSON.stringify({
              user: nextUser,
              accessToken: nextAccessToken,
              refreshToken: session.refreshToken,
            } satisfies AuthSession),
          );
        }
      } catch {
        if (mounted) {
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
        }
      } finally {
        if (mounted) setIsHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isHydrated,
      login: async (email, password) => {
        const response = await loginRequest(email, password);
        const nextUser = mapBackendUser(response.user);
        setUser(nextUser);
        setAccessToken(response.tokens.access);
        setRefreshToken(response.tokens.refresh);
        await AsyncStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            user: nextUser,
            accessToken: response.tokens.access,
            refreshToken: response.tokens.refresh,
          } satisfies AuthSession),
        );
      },
      loginWithGoogle: async ({ idToken, accessToken: googleAccessToken }) => {
        const response = await googleAuthRequest({
          idToken,
          accessToken: googleAccessToken,
        });
        const nextUser = mapBackendUser(response.user);
        setUser(nextUser);
        setAccessToken(response.tokens.access);
        setRefreshToken(response.tokens.refresh);
        await AsyncStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            user: nextUser,
            accessToken: response.tokens.access,
            refreshToken: response.tokens.refresh,
          } satisfies AuthSession),
        );
      },
      register: async (name, email, password) => {
        const [firstName = '', ...lastNameParts] = name.trim().split(/\s+/).filter(Boolean);
        const response = await registerRequest({
          firstName,
          lastName: lastNameParts.join(' '),
          email,
          password,
        });
        const nextUser = mapBackendUser(response.user);
        setUser(nextUser);
        setAccessToken(response.tokens.access);
        setRefreshToken(response.tokens.refresh);
        await AsyncStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            user: nextUser,
            accessToken: response.tokens.access,
            refreshToken: response.tokens.refresh,
          } satisfies AuthSession),
        );
      },
      logout: async () => {
        if (accessToken && refreshToken) {
          try {
            await logoutRequest(accessToken, refreshToken);
          } catch {
            // Best effort logout on backend; local session should still be cleared.
          }
        }

        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        await AsyncStorage.removeItem(AUTH_KEY);
      },
      updateProfile: async (name, email) => {
        const [firstName = '', ...lastNameParts] = name.trim().split(/\s+/).filter(Boolean);
        const nextUser = {
          id: user?.id,
          firstName,
          lastName: lastNameParts.join(' '),
          name: name.trim() || 'New User',
          email: email.trim().toLowerCase() || 'guest@korean.app',
          photo: user?.photo ?? null,
        };
        setUser(nextUser);
        if (accessToken && refreshToken) {
          await AsyncStorage.setItem(
            AUTH_KEY,
            JSON.stringify({
              user: nextUser,
              accessToken,
              refreshToken,
            } satisfies AuthSession),
          );
        }
      },
    }),
    [accessToken, isHydrated, refreshToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
