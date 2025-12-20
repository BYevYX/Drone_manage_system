'use client';
import {
  LogIn,
  Home,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  UserPlus2,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Forgot password flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset (code + new password)
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- API endpoints ---
  const LOGIN_API_URL = 'https://droneagro.duckdns.org/api/auth/login';
  const FORGOT_API_URL =
    'https://droneagro.duckdns.org/api/auth/forgot-password';
  const RESET_API_URL = 'https://droneagro.duckdns.org/api/auth/reset-password';

  const isEmailValid = (v: string) => v.length > 4 && v.includes('@');
  const isPasswordValid = (v: string) => v.length >= 8;

  // --- Login handler (unchanged behaviour, kept minimal) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setLoginError('');
    if (userId && !/^[a-zA-Z0-9_-]{3,20}$/.test(userId)) {
      setLoginError('ID должен быть от 3 до 20 символов (буквы, цифры, -, _).');
      return;
    }

    if (userId) {
      // Example: login by ID (kept as-is)
      try {
        setLoading(true);
        const res = await axios.post(LOGIN_API_URL, { user_id: userId });
        // handle res...
        alert('Вход по ID успешен (пример).');
      } catch (err: any) {
        setLoginError(err?.response?.data?.message || 'Ошибка входа по ID');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Email+password login
    if (!isEmailValid(email) || !isPasswordValid(password)) {
      setLoginError('Введите корректный email и пароль (>=8 символов).');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(LOGIN_API_URL, { email, password });
      // Save tokens & redirect (example)
      localStorage.setItem('accessToken', res.data.accessToken ?? '');
      localStorage.setItem('refreshToken', res.data.refreshToken ?? '');
      localStorage.setItem('userRole', res.data.userRole ?? '');
      localStorage.setItem('userId', String(res.data.id ?? ''));

      const { data } = await axios.get('https://droneagro.duckdns.org/api/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      });
      localStorage.setItem('email', data['email']);
      localStorage.setItem('phone', data['phone']);
      localStorage.setItem('firstName', data['firstName']);
      localStorage.setItem('lastName', data['lastName']);
      localStorage.setItem('surname', data['surname']);

      window.location.href = '/';
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || 'Ошибка входа по Email');
    } finally {
      setLoading(false);
    }
  };

  // --- Forgot password: send "email" to server ---
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSent(false);
    setShowResetForm(false);
    setResetError('');
    setResetSuccess(false);

    if (!isEmailValid(forgotEmail)) {
      setForgotError('Введите корректный email.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await axios.post(FORGOT_API_URL, { email: forgotEmail });
      // сервер возвращает { message: "..." }
      setForgotSent(true);
      // сразу показать форму ввода кода/нового пароля и подставить email
      setShowResetForm(true);
    } catch (err: any) {
      // не выдаём детальную информацию (security), показываем ошибку
      setForgotError(
        err?.response?.data?.message ||
          'Не удалось отправить письмо. Попробуйте позже.',
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // --- Reset password: send code + newPassword + email ---
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    if (!resetCode || resetCode.trim().length === 0) {
      setResetError('Введите код из письма.');
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setResetError('Новый пароль должен быть не менее 8 символов.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Пароли не совпадают.');
      return;
    }

    try {
      setResetLoading(true);
      const payload = {
        code: resetCode.trim(),
        newPassword: newPassword,
        email: forgotEmail,
      };
      await axios.post(RESET_API_URL, payload);
      setResetSuccess(true);
      // короткая пауза и редирект на логин
      setTimeout(() => {
        setShowForgot(false);
        setShowResetForm(false);
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setResetError(
        err?.response?.data?.message ||
          'Не удалось сбросить пароль. Проверьте код и повторите попытку.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-8">
      <h2 className="text-[28px] font-nekstmedium text-black mb-6 flex items-center gap-2">
        <LogIn size={28} className="text-blue-600" />
        Войти в аккаунт
      </h2>

      {/* main login form */}
      {!showForgot ? (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email"
            id="email"
            placeholder="you@example.com"
            type="email"
            icon={<Mail size={20} />}
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            error={
              submitted && !isEmailValid(email)
                ? 'Введите корректный email'
                : ''
            }
            required
          />
          <Input
            label="Пароль"
            id="password"
            placeholder="••••••••"
            type={showPassword ? 'text' : 'password'}
            icon={<Lock size={20} />}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            error={
              submitted && !isPasswordValid(password)
                ? 'Пароль должен быть не менее 8 символов'
                : ''
            }
            rightIcon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
          />

          {loginError && (
            <div className="text-red-600 text-sm">{loginError}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg mt-4 disabled:opacity-60"
          >
            <LogIn size={20} /> {loading ? 'Входим...' : 'Войти'}
          </button>

          <div className="mt-4 flex items-center justify-between">
            {/* <a
              href="/signup"
              className="flex items-center gap-2 text-blue-700 font-medium hover:underline"
            >
              <UserPlus2 size={16} /> Зарегистрироваться
            </a> */}
            <a
              href="/signup"
              className="flex items-center gap-2 text-blue-700 font-medium hover:underline hover:scale-105 transition font-nekstmedium text-[18px]"
            >
              Зарегистрироваться
            </a>

            <button
              type="button"
              onClick={() => {
                setShowForgot(true);
                setForgotEmail(email); // подставляем текущий email если есть
                setForgotError('');
                setForgotSent(false);
              }}
              className="flex items-center gap-2 text-blue-700 font-medium hover:underline hover:scale-105 transition font-nekstmedium text-[16px]"
            >
              Забыли пароль?
            </button>
          </div>
        </form>
      ) : (
        // Forgot / Reset flow UI
        <div className="space-y-6 w-full m-auto">
          {!showResetForm ? (
            // Step 1: send forgot-password
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-xl font-nekstmedium mb-2 text-center">
                Восстановление пароля
              </div>

              <Input
                label="Email для восстановления"
                id="forgotEmail"
                placeholder="Введите ваш email"
                type="email"
                icon={<Mail size={20} />}
                value={forgotEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForgotEmail(e.target.value)
                }
                error={forgotError}
                required
              />

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg"
              >
                {forgotLoading ? 'Отправляем...' : 'Отправить код на почту'}
              </button>

              {forgotSent && (
                <div className="text-green-600 text-center">
                  Если email найден — код отправлен на почту. Проверьте папку
                  «Спам».
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                {/* слева: Назад к входу (фиксированно внизу слева) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotEmail('');
                    setForgotError('');
                    setForgotSent(false);
                  }}
                  className="px-4 flex items-center justify-center py-2 text-sm font-nekstmedium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <ChevronLeft></ChevronLeft>
                  <p>Назад к входу</p>
                </button>

                {/* справа: опциональная вторичная кнопка — перейти к вводу кода (видна если письмо отправлено) */}
              </div>
            </form>
          ) : (
            // Step 2: submit code + new password
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="text-lg font-nekstmedium text-center">
                Введите код из письма и новый пароль
              </div>

              <Input
                label="Email (подтверждение)"
                id="resetEmail"
                placeholder="you@example.com"
                type="email"
                icon={<Mail size={18} />}
                value={forgotEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForgotEmail(e.target.value)
                }
                error={undefined}
                required
              />

              <Input
                label="Код из письма"
                id="resetCode"
                placeholder="Введите код (из письма)"
                type="text"
                icon={<Lock size={16} />}
                value={resetCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setResetCode(e.target.value)
                }
                error={undefined}
                required
              />

              <Input
                label="Новый пароль"
                id="newPassword"
                placeholder="••••••••"
                type="password"
                icon={<Lock size={16} />}
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
                error={undefined}
                required
              />

              <Input
                label="Подтвердите пароль"
                id="confirmNewPassword"
                placeholder="••••••••"
                type="password"
                icon={<Lock size={16} />}
                value={confirmNewPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmNewPassword(e.target.value)
                }
                error={undefined}
                required
              />

              {resetError && (
                <div className="text-red-600 text-sm">{resetError}</div>
              )}
              {resetSuccess && (
                <div className="text-green-600 text-sm">
                  Пароль успешно сброшен — перенаправление...
                </div>
              )}

              <div className="flex gap-2 justify-between">
                <button
                  type="button"
                  onClick={() => {
                    // назад к письму (возможность повторной отправки)
                    setShowResetForm(false);
                    setResetCode('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setResetError('');
                    setResetSuccess(false);
                  }}
                  className="px-4 flex items-center justify-center py-2 text-sm font-nekstmedium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <ChevronLeft></ChevronLeft>
                  <p>Назад</p>
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-700 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
                >
                  {resetLoading ? 'Сохраняем...' : 'Сбросить пароль'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  id,
  placeholder,
  type = 'text',
  icon,
  value,
  onChange,
  error,
  rightIcon,
  required = false,
}: any) {
  return (
    <div>
      <label htmlFor={id} className="block font-nekstlight text-black mb-1">
        {label}
      </label>
      <div
        className={`flex items-center border-b ${
          error ? 'border-red-400' : 'border-gray-500'
        } bg-transparent px-2 py-2`}
      >
        <span className="mr-2 text-gray-500">{icon}</span>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent outline-none text-[18px] text-black font-nekstmedium"
          required={required}
        />
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </div>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
