/**
 * Утилиты для валидации данных
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
  custom?: (value: any) => boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  phone: (value: string): boolean => {
    const phoneRegex =
      /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(value);
  },

  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  pattern: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
  },

  number: (value: any): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value));
  },

  positiveNumber: (value: any): boolean => {
    return validators.number(value) && Number(value) > 0;
  },

  integer: (value: any): boolean => {
    return validators.number(value) && Number.isInteger(Number(value));
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  date: (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  futureDate: (value: string): boolean => {
    const date = new Date(value);
    return validators.date(value) && date > new Date();
  },

  pastDate: (value: string): boolean => {
    const date = new Date(value);
    return validators.date(value) && date < new Date();
  },

  coordinates: (lat: number, lng: number): boolean => {
    return (
      validators.number(lat) &&
      validators.number(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  },

  password: (value: string): boolean => {
    // Минимум 8 символов, содержит буквы и цифры
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(value);
  },

  strongPassword: (value: string): boolean => {
    // Минимум 8 символов, содержит заглавные, строчные буквы, цифры и спецсимволы
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(value);
  },
};

export const validateField = (
  value: any,
  rule: ValidationRule,
): { isValid: boolean; error?: string } => {
  // Проверка обязательности поля
  if (rule.required && !validators.required(value)) {
    return {
      isValid: false,
      error: rule.message || 'Поле обязательно для заполнения',
    };
  }

  // Если поле не обязательное и пустое, считаем валидным
  if (!rule.required && !validators.required(value)) {
    return { isValid: true };
  }

  // Проверка минимальной длины
  if (rule.minLength && !validators.minLength(value, rule.minLength)) {
    return {
      isValid: false,
      error:
        rule.message || `Минимальная длина: ${rule.minLength} символов`,
    };
  }

  // Проверка максимальной длины
  if (rule.maxLength && !validators.maxLength(value, rule.maxLength)) {
    return {
      isValid: false,
      error:
        rule.message || `Максимальная длина: ${rule.maxLength} символов`,
    };
  }

  // Проверка по регулярному выражению
  if (rule.pattern && !validators.pattern(value, rule.pattern)) {
    return {
      isValid: false,
      error: rule.message || 'Неверный формат данных',
    };
  }

  // Кастомная валидация
  if (rule.custom && !rule.custom(value)) {
    return {
      isValid: false,
      error: rule.message || 'Значение не прошло валидацию',
    };
  }

  return { isValid: true };
};

export const validateForm = (
  data: { [key: string]: any },
  schema: ValidationSchema,
): ValidationResult => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  Object.keys(schema).forEach((fieldName) => {
    const fieldValue = data[fieldName];
    const fieldRule = schema[fieldName];
    const result = validateField(fieldValue, fieldRule);

    if (!result.isValid) {
      errors[fieldName] = result.error!;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Предопределенные схемы валидации
export const validationSchemas = {
  login: {
    email: {
      required: true,
      custom: validators.email,
      message: 'Введите корректный email',
    },
    password: {
      required: true,
      minLength: 8,
      message: 'Пароль должен быть не менее 8 символов',
    },
  },

  registration: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'Имя должно содержать от 2 до 50 символов',
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'Фамилия должна содержать от 2 до 50 символов',
    },
    email: {
      required: true,
      custom: validators.email,
      message: 'Введите корректный email',
    },
    phone: {
      required: true,
      custom: validators.phone,
      message: 'Введите корректный номер телефона',
    },
    password: {
      required: true,
      custom: validators.password,
      message:
        'Пароль должен содержать минимум 8 символов, включая буквы и цифры',
    },
  },

  droneRequest: {
    fieldId: {
      required: true,
      message: 'Выберите поле для обработки',
    },
    serviceType: {
      required: true,
      message: 'Выберите тип услуги',
    },
    scheduledDate: {
      required: true,
      custom: validators.futureDate,
      message: 'Выберите дату в будущем',
    },
    area: {
      required: true,
      custom: validators.positiveNumber,
      message: 'Укажите корректную площадь',
    },
  },
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
};

export const sanitizeObject = (obj: { [key: string]: any }): {
  [key: string]: any;
} => {
  const sanitized: { [key: string]: any } = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};