import { en } from './en';
import { ky } from './ky';
import { ru } from './ru';
import type { Language, Translations } from './types';

export type { Dictionary, Language, Translations } from './types';

export const translations: Translations = {
  en,
  ru,
  ky,
};

export function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;

  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replaceAll(`{{${key}}}`, String(value));
  }, template);
}

export function translate(language: Language, key: string, params?: Record<string, string | number>) {
  const localized = translations[language][key] ?? translations.en[key] ?? key;
  return interpolate(localized, params);
}
