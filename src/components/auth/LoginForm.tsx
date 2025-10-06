'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/src/lib/hooks/useAuth';
import { useModalStore } from '@/src/lib/stores/modal';
import { loginSchema, type LoginFormData } from '@/src/lib/validations/auth';

/**
 * Login form component with email/ID authentication modes
 * Optimized for performance with proper error handling
 */
export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'id'>('email');
  const { login, loginById, isLoading, error } = useAuth();
  const { switchMode, closeModal } = useModalStore();

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

        if (loginMode === 'id' && data.userId?.trim()) {
          await loginById({ userId: data.userId.trim() });
        } else if (loginMode === 'email' && data.email && data.password) {
          await login({
            email: data.email.toLowerCase().trim(),
            password: data.password,
          });
        } else {
          throw new Error('Заполните все обязательные поля');
        }

        closeModal();
        reset();
      } catch (error) {
        console.error('Login submission error:', error);
        // Error is handled in the auth store with toast notifications
      }
    },
    [loginMode, login, loginById, closeModal, reset, clearErrors],
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
      reset();
    },
    [clearErrors, reset],
  );

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Войти в аккаунт</h2>
        <p className="mt-2 text-sm text-gray-600">
          Добро пожаловать в ДронАгро
        </p>
      </div>

      {/* Login mode toggle */}
      <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => handleModeChange('email')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            loginMode === 'email'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          aria-pressed={loginMode === 'email'}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('id')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            loginMode === 'id'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          aria-pressed={loginMode === 'id'}
        >
          ID пользователя
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {loginMode === 'id' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID пользователя <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('userId')}
                type="text"
                placeholder="Введите ваш ID"
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.userId.message}
              </p>
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Пароль <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600 transition-colors"
                  aria-label={
                    showPassword ? 'Скрыть пароль' : 'Показать пароль'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* Display global auth error if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn className="h-4 w-4" />
          {isLoading || isSubmitting ? 'Входим...' : 'Войти'}
        </button>
      </form>

      {loginMode === 'email' && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => switchMode('forgot-password')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Забыли пароль?
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Нет аккаунта?{' '}
          <button
            type="button"
            onClick={() => switchMode('register')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
