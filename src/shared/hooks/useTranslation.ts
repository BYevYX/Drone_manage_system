/**
 * Хук для работы с переводами
 */

import { useState, useEffect, useCallback } from 'react';
import { Locale, defaultLocale, dictionaries } from '../i18n/config';

type TranslationKey = string;
type TranslationParams = Record<string, string | number>;
type Dictionary = Record<string, any>;

export const useTranslation = (initialLocale: Locale = defaultLocale) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка словаря для текущей локали
  const loadDictionary = useCallback(async (targetLocale: Locale) => {
    try {
      setLoading(true);
      setError(null);
      
      const dict = await dictionaries[targetLocale]();
      setDictionary(dict);
      setLocale(targetLocale);
      
      // Сохраняем выбранную локаль в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', targetLocale);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dictionary');
      console.error('Failed to load dictionary for locale:', targetLocale, err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Инициализация при монтировании
  useEffect(() => {
    let targetLocale = initialLocale;
    
    // Проверяем сохраненную локаль в localStorage
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && Object.keys(dictionaries).includes(savedLocale)) {
        targetLocale = savedLocale;
      }
    }
    
    loadDictionary(targetLocale);
  }, [initialLocale, loadDictionary]);

  // Функция перевода
  const t = useCallback((key: TranslationKey, params?: TranslationParams): string => {
    if (!dictionary || Object.keys(dictionary).length === 0) {
      return key;
    }

    // Разбиваем ключ на части (например, "common.loading")
    const keys = key.split('.');
    let value: any = dictionary;

    // Проходим по вложенным объектам
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Если ключ не найден, возвращаем исходный ключ
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // Если значение не строка, возвращаем ключ
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Заменяем параметры в строке
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  }, [dictionary]);

  // Функция для смены языка
  const changeLanguage = useCallback((newLocale: Locale) => {
    if (newLocale !== locale) {
      loadDictionary(newLocale);
    }
  }, [locale, loadDictionary]);

  // Функция для получения переводов по префиксу
  const getTranslations = useCallback((prefix: string): Record<string, string> => {
    const keys = prefix.split('.');
    let value: any = dictionary;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return {};
      }
    }

    if (typeof value === 'object' && value !== null) {
      const result: Record<string, string> = {};
      
      const flatten = (obj: any, currentPrefix = '') => {
        Object.keys(obj).forEach(key => {
          const newKey = currentPrefix ? `${currentPrefix}.${key}` : key;
          
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            flatten(obj[key], newKey);
          } else if (typeof obj[key] === 'string') {
            result[newKey] = obj[key];
          }
        });
      };
      
      flatten(value);
      return result;
    }

    return {};
  }, [dictionary]);

  // Функция для проверки существования ключа
  const hasTranslation = useCallback((key: TranslationKey): boolean => {
    const keys = key.split('.');
    let value: any = dictionary;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return typeof value === 'string';
  }, [dictionary]);

  // Функция для форматирования даты согласно локали
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
  }, [locale]);

  // Функция для форматирования чисел согласно локали
  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(locale, options).format(number);
  }, [locale]);

  // Функция для форматирования валюты
  const formatCurrency = useCallback((amount: number, currency?: string): string => {
    const currencyCode = currency || (locale === 'ru' ? 'RUB' : 'USD');
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  }, [locale]);

  // Функция для получения направления текста
  const getTextDirection = useCallback((): 'ltr' | 'rtl' => {
    // Для русского и английского языков направление слева направо
    return 'ltr';
  }, []);

  return {
    // Основные функции
    t,
    locale,
    changeLanguage,
    
    // Состояние загрузки
    loading,
    error,
    
    // Дополнительные функции
    getTranslations,
    hasTranslation,
    
    // Форматирование
    formatDate,
    formatNumber,
    formatCurrency,
    getTextDirection,
    
    // Информация о локали
    isRTL: getTextDirection() === 'rtl',
  };
};

// Контекст для глобального управления переводами
import { createContext, useContext } from 'react';

interface TranslationContextType {
  t: (key: TranslationKey, params?: TranslationParams) => string;
  locale: Locale;
  changeLanguage: (locale: Locale) => void;
  loading: boolean;
  error: string | null;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const TranslationProvider: React.FC<{
  children: React.ReactNode;
  initialLocale?: Locale;
}> = ({ children, initialLocale = defaultLocale }) => {
  const translation = useTranslation(initialLocale);

  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslationContext must be used within TranslationProvider');
  }
  
  return context;
};

// Хук для быстрого доступа к функции перевода
export const useT = () => {
  const { t } = useTranslationContext();
  return t;
};