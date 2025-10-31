/**
 * Конфигурация интернационализации
 */

export const locales = ['ru', 'en'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'ru';

export const dictionaries = {
  ru: () => import('./dictionaries/ru.json').then(module => module.default),
  en: () => import('./dictionaries/en.json').then(module => module.default),
};

export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  ru: '🇷🇺',
  en: '🇺🇸',
};

export const dateFormats: Record<Locale, Intl.DateTimeFormatOptions> = {
  ru: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  en: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
};

export const numberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  ru: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  en: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
};

export const currencyFormats: Record<Locale, Intl.NumberFormatOptions> = {
  ru: {
    style: 'currency',
    currency: 'RUB',
  },
  en: {
    style: 'currency',
    currency: 'USD',
  },
};