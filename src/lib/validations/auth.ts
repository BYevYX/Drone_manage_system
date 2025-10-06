import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  userId: z.string().optional(),
});

export const loginByIdSchema = z.object({
  userId: z
    .string()
    .min(3, 'ID должен содержать минимум 3 символа')
    .max(20, 'ID должен содержать максимум 20 символов')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'ID может содержать только буквы, цифры, дефисы и подчеркивания',
    ),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Имя должно содержать минимум 2 символа')
      .max(50, 'Имя должно содержать максимум 50 символов'),
    email: z
      .string()
      .min(1, 'Email обязателен')
      .email('Введите корректный email'),
    password: z
      .string()
      .min(8, 'Пароль должен содержать минимум 8 символов')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру',
      ),
    confirmPassword: z.string(),
    role: z.enum(['client', 'supplier']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Пароль должен содержать минимум 8 символов')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginByIdFormData = z.infer<typeof loginByIdSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
