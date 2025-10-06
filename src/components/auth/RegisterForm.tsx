'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, Mail, Lock, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/src/lib/hooks/useAuth';
import { useModalStore } from '@/src/lib/stores/modal';
import {
  registerSchema,
  type RegisterFormData,
} from '@/src/lib/validations/auth';

/**
 * Registration form component with enhanced validation and UX
 * Optimized for performance and accessibility
 */
export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading, error } = useAuth();
  const { switchMode, closeModal } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'client', // Set default role
    },
  });

  // Watch password to validate confirm password in real-time
  const password = watch('password');

  /**
   * Handle form submission with proper validation and error handling
   */
  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        clearErrors();

        // Validate passwords match
        if (data.password !== data.confirmPassword) {
          throw new Error('Пароли не совпадают');
        }

        // Prepare registration data with sanitized inputs
        const registrationData = {
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: data.role || 'client',
        };

        const enhancedData = {
          ...registrationData,
          firstName:
            registrationData.name.split(' ')[0] || registrationData.name,
          lastName: registrationData.name.split(' ').slice(1).join(' ') || '',
          phone: '+7' + Math.random().toString().slice(2, 12), // Temporary phone
          userRole:
            registrationData.role === 'client'
              ? ('CLIENT' as const)
              : ('CONTRACTOR' as const),
        };
        await registerUser(enhancedData);
        closeModal();
        reset();
      } catch (error) {
        console.error('Registration submission error:', error);
        // Error is handled in the auth store with toast notifications
      }
    },
    [registerUser, closeModal, reset, clearErrors],
  );

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * Toggle confirm password visibility
   */
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Создать аккаунт</h2>
        <p className="mt-2 text-sm text-gray-600">Присоединяйтесь к ДронАгро</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Полное имя <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('name')}
              type="text"
              placeholder="Иван Иванов"
              className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Роль (необязательно)
          </label>
          <select
            {...register('role')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" className="text-gray-500">
              Выберите роль (по умолчанию: Клиент)
            </option>
            <option value="client" className="text-gray-900">
              Клиент
            </option>
            <option value="supplier" className="text-gray-900">
              Поставщик
            </option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
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
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Подтвердите пароль <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600 transition-colors"
              aria-label={
                showConfirmPassword
                  ? 'Скрыть подтверждение пароля'
                  : 'Показать подтверждение пароля'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Display global auth error if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        {/* Password strength indicator */}
        {password && password.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-600 mb-2">Требования к паролю:</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li className={password.length >= 8 ? 'text-green-600' : ''}>
                ✓ Минимум 8 символов
              </li>
              <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                ✓ Строчная буква
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                ✓ Заглавная буква
              </li>
              <li className={/\d/.test(password) ? 'text-green-600' : ''}>
                ✓ Цифра
              </li>
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="h-4 w-4" />
          {isLoading || isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
