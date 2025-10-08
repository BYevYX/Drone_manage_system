'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@/src/lib/hooks/useAuth';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Пароль должен содержать минимум 8 символов')
      .regex(/[a-z]/, 'Пароль должен содержать строчную букву')
      .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
      .regex(/\d/, 'Пароль должен содержать цифру'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  /**
   * Handle form submission
   */
  const onSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      if (!token) {
        return;
      }

      try {
        clearErrors();
        clearError();
        await resetPassword({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
        setIsSuccess(true);
        reset();
      } catch (error) {
        console.error('Reset password submission error:', error);
        // Error is handled in the auth store with toast notifications
      }
    },
    [resetPassword, token, reset, clearErrors, clearError],
  );

  /**
   * Clear errors when user starts typing
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (error) {
        clearError();
      }
    },
    [error, clearError],
  );

  if (!token) {
    return (
      <div className="w-full lg:w-1/2 p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-[28px] font-nekstmedium text-black mb-4">
              Недействительная ссылка
            </h2>
            <p className="text-black font-nekstregular mb-6">
              Ссылка для сброса пароля недействительна или истекла. Пожалуйста,
              запросите новую ссылку.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/forgot-password"
              className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg"
            >
              Запросить новую ссылку
            </Link>

            <Link
              href="/login"
              className="block text-center text-black hover:text-gray-700 font-nekstregular hover:underline"
            >
              Вернуться к входу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full lg:w-1/2 p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-[28px] font-nekstmedium text-black mb-4">
              Пароль успешно изменен
            </h2>
            <p className="text-black font-nekstregular mb-6">
              Ваш пароль был успешно изменен. Теперь вы можете войти в систему с
              новым паролем.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg"
            >
              Войти в систему
            </Link>

            <Link
              href="/"
              className="block text-center text-black hover:text-gray-700 font-nekstregular hover:underline"
            >
              На главную страницу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[28px] font-nekstmedium text-black flex items-center gap-2">
            <Lock size={28} className="text-blue-600" />
            Новый пароль
          </h2>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-300 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Home size={18} className="text-blue-600" />
            На главную
          </Link>
        </div>
        <p className="text-black font-nekstregular">
          Введите новый пароль для вашего аккаунта
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-black font-nekstmedium mb-2">
            Новый пароль <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-black" />
            </div>
            <input
              {...register('password', {
                onChange: (e) => {
                  register('password').onChange(e);
                  handleInputChange(e);
                },
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-3 text-sm placeholder-gray-500 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-nekstregular"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-800 transition-colors"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-black" />
              ) : (
                <Eye className="h-5 w-5 text-black" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 font-nekstregular">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black font-nekstmedium mb-2">
            Подтвердите пароль <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-black" />
            </div>
            <input
              {...register('confirmPassword', {
                onChange: (e) => {
                  register('confirmPassword').onChange(e);
                  handleInputChange(e);
                },
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-3 text-sm placeholder-gray-500 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-nekstregular"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-800 transition-colors"
              aria-label={
                showConfirmPassword
                  ? 'Скрыть подтверждение пароля'
                  : 'Показать подтверждение пароля'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-black" />
              ) : (
                <Eye className="h-5 w-5 text-black" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 font-nekstregular">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Password strength indicator */}
        {password && password.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-600 mb-2 font-nekstmedium">
              Требования к паролю:
            </p>
            <ul className="text-xs text-blue-600 space-y-1 font-nekstregular">
              <li
                className={
                  password.length >= 8 ? 'text-green-600' : 'text-blue-600'
                }
              >
                ✓ Минимум 8 символов
              </li>
              <li
                className={
                  /[a-z]/.test(password) ? 'text-green-600' : 'text-blue-600'
                }
              >
                ✓ Строчная буква
              </li>
              <li
                className={
                  /[A-Z]/.test(password) ? 'text-green-600' : 'text-blue-600'
                }
              >
                ✓ Заглавная буква
              </li>
              <li
                className={
                  /\d/.test(password) ? 'text-green-600' : 'text-blue-600'
                }
              >
                ✓ Цифра
              </li>
            </ul>
          </div>
        )}

        {/* Display global auth error if any */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-nekstregular">
              {error.message}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Lock className="h-5 w-5" />
          {isLoading || isSubmitting ? 'Сохраняем...' : 'Сохранить пароль'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-8 space-y-4">
        <div className="text-center">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-nekstmedium hover:underline"
          >
            Вернуться к входу
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}