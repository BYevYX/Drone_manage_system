/**
 * Утилиты валидации для форм регистрации
 * Обеспечивают проверку корректности ввода данных
 */

/**
 * Валидация телефона - только цифры, 11 символов (7XXXXXXXXXX)
 */
export const validatePhone = (
  phone: string,
): { isValid: boolean; error?: string } => {
  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    return { isValid: false, error: 'Телефон обязателен' };
  }

  if (digits.length !== 11) {
    return { isValid: false, error: 'Телефон должен содержать 11 цифр' };
  }

  if (!digits.startsWith('7')) {
    return { isValid: false, error: 'Телефон должен начинаться с +7' };
  }

  return { isValid: true };
};

/**
 * Валидация email
 */
export const validateEmail = (
  email: string,
): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email обязателен' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Введите корректный email' };
  }

  return { isValid: true };
};

/**
 * Валидация ИНН
 * Для юридических лиц: 10 цифр
 * Для ИП и физ. лиц: 12 цифр
 */
export const validateINN = (
  inn: string,
  type: 'COMPANY' | 'INDIVIDUAL' | 'PERSON',
): { isValid: boolean; error?: string } => {
  const digits = inn.replace(/\D/g, '');

  if (!digits) {
    if (type === 'COMPANY') {
      return { isValid: false, error: 'ИНН обязателен для компании' };
    }
    return { isValid: true }; // для ИП и физ. лиц необязательно
  }

  // Проверка на буквы и спецсимволы
  if (/[^\d]/.test(inn.trim())) {
    return { isValid: false, error: 'ИНН должен содержать только цифры' };
  }

  if (type === 'COMPANY' && digits.length !== 10) {
    return { isValid: false, error: 'ИНН компании должен содержать 10 цифр' };
  }

  if (
    (type === 'INDIVIDUAL' || type === 'PERSON') &&
    digits.length !== 12 &&
    digits.length !== 10
  ) {
    return { isValid: false, error: 'ИНН должен содержать 10 или 12 цифр' };
  }

  return { isValid: true };
};

/**
 * Валидация КПП - 9 цифр
 */
export const validateKPP = (
  kpp: string,
): { isValid: boolean; error?: string } => {
  if (!kpp) {
    return { isValid: true }; // КПП необязательно
  }

  const digits = kpp.replace(/\D/g, '');

  // Проверка на буквы и спецсимволы
  if (/[^\d]/.test(kpp.trim())) {
    return { isValid: false, error: 'КПП должен содержать только цифры' };
  }

  if (digits.length !== 9) {
    return { isValid: false, error: 'КПП должен содержать 9 цифр' };
  }

  return { isValid: true };
};

/**
 * Валидация ОКПО - 8 или 10 цифр
 */
export const validateOKPO = (
  okpo: string,
): { isValid: boolean; error?: string } => {
  if (!okpo) {
    return { isValid: true }; // ОКПО необязательно
  }

  const digits = okpo.replace(/\D/g, '');

  // Проверка на буквы и спецсимволы
  if (/[^\d]/.test(okpo.trim())) {
    return { isValid: false, error: 'ОКПО должен содержать только цифры' };
  }

  if (digits.length !== 8 && digits.length !== 10) {
    return { isValid: false, error: 'ОКПО должен содержать 8 или 10 цифр' };
  }

  return { isValid: true };
};

/**
 * Валидация ФИО - только буквы (кириллица и латиница), пробелы и дефисы
 */
export const validateName = (
  name: string,
  fieldName: string,
): { isValid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldName} обязательно` };
  }

  // Разрешаем кириллицу, латиницу, пробелы и дефисы
  const nameRegex = /^[а-яА-ЯёЁa-zA-Z\s\-]+$/;

  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      error: `${fieldName} должно содержать только буквы`,
    };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      error: `${fieldName} должно содержать минимум 2 символа`,
    };
  }

  return { isValid: true };
};

/**
 * Валидация пароля
 */
export const validatePassword = (
  password: string,
): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Пароль обязателен' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Пароль должен содержать минимум 8 символов',
    };
  }

  return { isValid: true };
};

/**
 * Валидация подтверждения пароля
 */
export const validatePasswordConfirm = (
  password: string,
  confirm: string,
): { isValid: boolean; error?: string } => {
  if (!confirm) {
    return { isValid: false, error: 'Подтвердите пароль' };
  }

  if (password !== confirm) {
    return { isValid: false, error: 'Пароли не совпадают' };
  }

  return { isValid: true };
};

/**
 * Валидация названия компании
 */
export const validateCompanyName = (
  name: string,
): { isValid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Название компании обязательно' };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Название должно содержать минимум 2 символа',
    };
  }

  return { isValid: true };
};

/**
 * Форматирование телефона для отображения
 */
export const formatPhoneDisplay = (raw: string): string => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (!digits.startsWith('7')) digits = '7' + digits;
  digits = digits.slice(0, 11);

  if (digits.length === 0) return '';
  const p = digits;
  const cc = p.slice(0, 1); // 7
  const code = p.slice(1, 4);
  const a = p.slice(4, 7);
  const b = p.slice(7, 9);
  const c = p.slice(9, 11);
  if (!code) return `+${cc}`;
  if (!a) return `+${cc} (${code}`;
  if (!b) return `+${cc} (${code}) ${a}`;
  if (!c) return `+${cc} (${code}) ${a}-${b}`;
  return `+${cc} (${code}) ${a}-${b}-${c}`;
};

/**
 * Нормализация телефона для отправки на сервер
 */
export const normalizePhone = (display: string): string => {
  return display.replace(/\D/g, '');
};

/**
 * Фильтр ввода - только цифры
 */
export const filterDigitsOnly = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Фильтр ввода - только буквы
 */
export const filterLettersOnly = (value: string): string => {
  return value.replace(/[^а-яА-ЯёЁa-zA-Z\s\-]/g, '');
};
