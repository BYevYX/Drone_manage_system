'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@/src/lib/hooks/useAuth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Введите корректный email адрес'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      try {
        clearErrors();
        clearError();
        await forgotPassword({ email: data.email.toLowerCase().trim() });
        setIsSuccess(true);
        reset();
      } catch (error) {
        console.error('Forgot password submission error:', error);
        // Error is handled in the auth store with toast notifications
      }
    },
    [forgotPassword, reset, clearErrors, clearError],
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

  if (isSuccess) {
    return (
      <div className="w-full lg:w-1/2 p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-[28px] font-nekstmedium text-black mb-4">
              Письмо отправлено
            </h2>
            <p className="text-black font-nekstregular mb-6">
              Если указанный email зарегистрирован в системе, на него будет
              отправлена ссылка для восстановления пароля.
            </p>
            <p className="text-sm text-gray-600 font-nekstregular">
              Проверьте папку &ldquo;Спам&rdquo;, если письмо не пришло в течение нескольких
              минут.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg"
            >
              <ArrowLeft className="h-5 w-5" />
              Вернуться к входу
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
            <Mail size={28} className="text-blue-600" />
            Восстановление пароля
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
          Введите ваш email адрес, и мы отправим ссылку для восстановления
          пароля
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-black font-nekstmedium mb-2">
            Email адрес <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-black" />
            </div>
            <input
              {...register('email', {
                onChange: (e) => {
                  register('email').onChange(e);
                  handleInputChange(e);
                },
              })}
              type="email"
              placeholder="you@example.com"
              className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-3 text-sm placeholder-gray-500 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-nekstregular"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 font-nekstregular">
              {errors.email.message}
            </p>
          )}
        </div>

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
          <Mail className="h-5 w-5" />
          {isLoading || isSubmitting
            ? 'Отправляем...'
            : 'Отправить ссылку для восстановления'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-8 space-y-4">
        <div className="text-center">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-500 font-nekstmedium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться к входу
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-black font-nekstregular">
            Нет аккаунта?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 font-nekstmedium hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}