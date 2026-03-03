import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { Language, translate } from '../translations';

const LANGUAGE_KEY = 'app_language';

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored === 'en' || stored === 'ru' || stored === 'ky') {
          setLanguageState(stored);
        }
      })
      .catch(() => {
        // no-op
      });

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage).catch(() => {
      // no-op
    });
  };

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: (key, params) => translate(language, key, params),
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
