'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/src/lib/hooks/useAuth';
import { useModalStore } from '@/src/lib/stores/modal';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/src/lib/validations/auth';

export const ForgotPasswordForm = () => {
  const { forgotPassword, isLoading } = useAuth();
  const { switchMode } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data);
      reset();
    } catch {
      // Error is handled in the store
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Забыли пароль?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Введите ваш email для восстановления пароля
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          {isLoading ? 'Отправляем...' : 'Отправить ссылку'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться к входу
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
