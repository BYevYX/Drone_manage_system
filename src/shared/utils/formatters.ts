/**
 * Утилиты для форматирования данных
 */

export const formatCurrency = (amount: number, currency = 'RUB'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: format,
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dateObj);
};

export const formatArea = (area: number): string => {
  return `${area.toLocaleString('ru-RU')} га`;
};

export const formatWeight = (weight: number, unit = 'кг'): string => {
  return `${weight.toLocaleString('ru-RU')} ${unit}`;
};

export const formatDistance = (distance: number, unit = 'км'): string => {
  return `${distance.toLocaleString('ru-RU')} ${unit}`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
  if (bytes === 0) return '0 Байт';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Форматирование российского номера телефона
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
  
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }
  
  return phone;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м ${remainingSeconds}с`;
  } else if (minutes > 0) {
    return `${minutes}м ${remainingSeconds}с`;
  } else {
    return `${remainingSeconds}с`;
  }
};