'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/src/lib/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/src/lib/validations/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'id'>('email');
  const { login, loginById, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      userId: '',
    },
  });

  /**
   * Handle form submission with proper error handling
   */
  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        clearErrors();
        clearError();

        if (loginMode === 'id' && data.userId?.trim()) {
          await loginById({ userId: data.userId.trim() });
          // Redirect to dashboard or home page after successful login
          router.push('/dashboard');
          reset();
        } else if (loginMode === 'email' && data.email && data.password) {
          await login({
            email: data.email.toLowerCase().trim(),
            password: data.password,
          });
          // Redirect to dashboard or home page after successful login
          router.push('/dashboard');
          reset();
        } else {
          throw new Error('Заполните все обязательные поля');
        }
      } catch (error) {
        console.error('Login submission error:', error);
        // Error is handled in the auth store with toast notifications
      }
    },
    [loginMode, login, loginById, router, reset, clearErrors, clearError],
  );

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * Switch between email and ID login modes
   */
  const handleModeChange = useCallback(
    (mode: 'email' | 'id') => {
      setLoginMode(mode);
      clearErrors();
      clearError();
      reset();
    },
    [clearErrors, clearError, reset],
  );

  /**
   * Clear errors when user starts typing
   */
  const handleInputChange = useCallback(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  return (
    <div className="w-full lg:w-1/2 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-[28px] font-nekstmedium text-black flex items-center gap-2">
            <LogIn size={28} className="text-blue-600" />
            Войти в аккаунт
          </h2>
        </div>
        <p className="text-black font-nekstregular">
          Добро пожаловать в ДронАгро
        </p>
      </div>

      {/* Login mode toggle */}
      <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => handleModeChange('email')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors font-nekstmedium ${
            loginMode === 'email'
              ? 'bg-white text-black shadow-sm'
              : 'text-black hover:text-gray-700'
          }`}
          aria-pressed={loginMode === 'email'}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('id')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors font-nekstmedium ${
            loginMode === 'id'
              ? 'bg-white text-black shadow-sm'
              : 'text-black hover:text-gray-700'
          }`}
          aria-pressed={loginMode === 'id'}
        >
          ID пользователя
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {loginMode === 'id' ? (
          <div>
            <label className="block text-sm font-medium text-black font-nekstmedium mb-2">
              ID пользователя <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <ShieldCheck className="h-5 w-5 text-black" />
              </div>
              <input
                {...register('userId')}
                onChange={handleInputChange}
                type="text"
                placeholder="Введите ваш ID"
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-3 text-sm placeholder-gray-500 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-nekstregular"
              />
            </div>
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600 font-nekstregular">
                {errors.userId.message}
              </p>
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-black font-nekstmedium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                <input
                  {...register('email')}
                  onChange={handleInputChange}
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

            <div>
              <label className="block text-sm font-medium text-black font-nekstmedium mb-2">
                Пароль <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-black" />
                </div>
                <input
                  {...register('password')}
                  onChange={handleInputChange}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-3 text-sm placeholder-gray-500 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-nekstregular"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-800 transition-colors"
                  aria-label={
                    showPassword ? 'Скрыть пароль' : 'Показать пароль'
                  }
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
          </>
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
          <LogIn className="h-5 w-5" />
          {isLoading || isSubmitting ? 'Входим...' : 'Войти'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-8 space-y-4">
        {loginMode === 'email' && (
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 font-nekstmedium hover:underline"
            >
              Забыли пароль?
            </Link>
          </div>
        )}

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
