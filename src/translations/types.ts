export type Language = 'en' | 'ru' | 'ky';

export type Dictionary = Record<string, string>;

export type Translations = Record<Language, Dictionary>;
