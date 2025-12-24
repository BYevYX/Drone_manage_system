'use client';

import { LogIn, Lock, Mail, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Snowfall from 'react-snowfall';

export default function LoginPage() {
  const router = useRouter();

  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Reset (two-step: enter code -> set new password)
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetStep, setResetStep] = useState<number>(1); // 1 = enter code, 2 = new password
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // state: whether newPassword input is focused
  const [newPwdFocused, setNewPwdFocused] = useState(false);

  // --- API endpoints ---
  const LOGIN_API_URL = 'https://droneagro.duckdns.org/api/auth/login';
  const FORGOT_API_URL =
    'https://droneagro.duckdns.org/api/auth/forgot-password';
  const RESET_API_URL = 'https://droneagro.duckdns.org/api/auth/reset-password';

  const isEmailValid = (v: string) => v.length > 4 && v.includes('@');
  const isPasswordValid = (v: string) => v.length >= 8;

  // password strength scoring (0..5)
  const passwordScore = (s: string) => {
    let score = 0;
    if (!s) return 0;
    if (s.length >= 8) score++;
    if (s.length >= 12) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[0-9]/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    return Math.min(score, 5);
  };

  const passwordLabel = (score: number) => {
    if (score <= 1) return 'Слабый';
    if (score <= 3) return 'Средний';
    return 'Сильный';
  };

  // --- Login handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setLoginError('');

    if (userId && !/^[a-zA-Z0-9_-]{3,20}$/.test(userId)) {
      setLoginError('ID должен быть от 3 до 20 символов (буквы, цифры, -, _).');
      return;
    }

    if (userId) {
      try {
        setLoading(true);
        const res = await axios.post(LOGIN_API_URL, { user_id: userId });
        alert('Вход по ID успешен (пример).');
      } catch (err: any) {
        setLoginError(err?.response?.data?.message || 'Ошибка входа по ID');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isEmailValid(email)) {
      setLoginError('Введите корректный email и пароль (>=8 символов).');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(LOGIN_API_URL, { email, password });
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
      setForgotSent(true);
      setShowResetForm(true);
      setResetStep(1);
    } catch (err: any) {
      setForgotError(
        err?.response?.data?.message ||
          'Не удалось отправить письмо. Попробуйте позже.',
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // Move from step 1 (code) to step 2 (new password)
  const handleProceedToNewPassword = () => {
    setResetError('');
    if (!resetCode || resetCode.trim().length === 0) {
      setResetError('Введите код из письма.');
      return;
    }
    setResetStep(2);
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

    const newScore = passwordScore(newPassword);
    if (newScore <= 1) {
      setResetError(
        'Новый пароль слишком слабый — используйте более сложный пароль.',
      );
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

  // handler for clicking "Забыли пароль?"
  const openForgot = () => {
    setShowForgot(true);
    setForgotEmail(email); // подставляем текущий email если есть
    setForgotError('');
    setForgotSent(false);
    setShowResetForm(false);
    setResetStep(1);
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // back to login (used when in forgot/reset)
  const backToLogin = () => {
    setShowForgot(false);
    setShowResetForm(false);
    setForgotEmail('');
    setForgotError('');
    setForgotSent(false);
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetStep(1);
    setResetError('');
    setResetSuccess(false);
  };

  // compute header title
  const headerTitle = showForgot
    ? showResetForm
      ? resetStep === 1
        ? 'Ввод кода'
        : 'Новый пароль'
      : 'Восстановление пароля'
    : 'Войти в аккаунт';

  const newPwdScore = passwordScore(newPassword);
  const newPwdLabel = passwordLabel(newPwdScore);

  return (
    <div className="w-full lg:w-1/2 p-8 relative flex flex-col items-center justify-center">
      <h2 className="text-[28px] font-nekstmedium text-black mb-6 flex items-center gap-2">
        <LogIn size={28} className="text-blue-600" />
        {headerTitle}
      </h2>

      {/* main login form */}
      {!showForgot ? (
        <form className="space-y-6 w-full" onSubmit={handleSubmit}>
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
            type={showPasswordLogin ? 'text' : 'password'}
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
                onClick={() => setShowPasswordLogin((v) => !v)}
                className="focus:outline-none"
              >
                {showPasswordLogin ? <EyeOff size={18} /> : <Eye size={18} />}
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
            <a
              href="/signup"
              className="flex items-center gap-2 text-blue-700 font-medium hover:underline hover:scale-105 transition font-nekstmedium text-[18px]"
            >
              Зарегистрироваться
            </a>

            <button
              type="button"
              onClick={openForgot}
              className="flex items-center gap-2 text-blue-700 font-medium hover:underline hover:scale-105 transition font-nekstmedium text-[16px]"
            >
              Забыли пароль?
            </button>
          </div>
        </form>
      ) : (
        // Forgot / Reset flow UI (two-step)
        <div className="space-y-6 w-full m-auto flex flex-col items-center justify-center ">
          {!showResetForm ? (
            // Step 1: send forgot-password (request code)
            <div className="flex items-center justify-center w-full h-full">
              <form
                onSubmit={handleForgotSubmit}
                className=" rounded-lg w-full flex flex-col gap-4"
              >
                <Input
                  label="Email для восстановления"
                  id="forgotEmail"
                  placeholder="Введите ваш email"
                  type="email"
                  icon={<Mail size={20} />}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  error={forgotError}
                  required
                />

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full mt-[15px] flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg"
                >
                  {forgotLoading ? 'Отправляем...' : 'Отправить код на почту'}
                </button>

                {forgotSent && (
                  <div className="text-green-600 text-center mt-2">
                    Если email найден — код отправлен на почту. Проверьте папку
                    «Спам».
                  </div>
                )}

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 py-3 text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg"
                >
                  Назад к входу
                </button>
              </form>
            </div>
          ) : (
            // Reset flow present: now split into two sub-steps
            <>
              {resetStep === 1 ? (
                // Step A: enter code only
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProceedToNewPassword();
                  }}
                  className="space-y-4 w-full flex flex-col items-center justify-center"
                >
                  <div className="w-full">
                    <Input
                      label="Код из письма"
                      id="resetCodeOnly"
                      placeholder="Введите код (из письма)"
                      type="text"
                      icon={<Lock size={16} />}
                      value={resetCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setResetCode(e.target.value)
                      }
                      error={resetError}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    {/* Next button */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 font-nekstmedium hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
                    >
                      Далее
                    </button>
                    <button
                      type="button"
                      onClick={backToLogin}
                      className="w-full flex items-center justify-center gap-2 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 py-3 text-[18px] transition-transform hover:scale-105 duration-300 shadow-lg"
                    >
                      Назад к входу
                    </button>
                  </div>
                </form>
              ) : (
                // Step B: enter new password(s) with strength check + eye toggles
                <form
                  onSubmit={handleResetSubmit}
                  className="space-y-4 w-full flex flex-col items-center justify-center"
                >
                  <div className="w-full">
                    <Input
                      label="Новый пароль"
                      id="newPassword"
                      placeholder="••••••••"
                      type={showNewPassword ? 'text' : 'password'}
                      icon={<Lock size={16} />}
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPassword(e.target.value)
                      }
                      onFocus={() => setNewPwdFocused(true)}
                      onBlur={() => setNewPwdFocused(false)}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          className="focus:outline-none"
                        >
                          {showNewPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      }
                      error={undefined}
                      required
                    />

                    {/* new password strength scale — плавное появление только при фокусе */}
                    <div
                      style={{
                        transform: newPwdFocused ? 'scaleY(1)' : 'scaleY(0)',
                        transformOrigin: 'top',
                        transition:
                          'transform 220ms ease, opacity 220ms ease, max-height 220ms ease',
                        opacity: newPwdFocused ? 1 : 0,
                        maxHeight: newPwdFocused ? '200px' : '0px',
                        overflow: 'hidden',
                      }}
                      className="mt-4 mb-[20px]"
                      aria-hidden={!newPwdFocused}
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((i) => {
                          const active = i < newPwdScore;
                          const bg =
                            newPwdScore <= 1
                              ? 'bg-red-500'
                              : newPwdScore <= 3
                                ? 'bg-yellow-400'
                                : 'bg-emerald-500';
                          return (
                            <div
                              key={i}
                              className={`h-2 rounded-sm transition-all ${
                                active ? bg : 'bg-slate-200'
                              }`}
                              style={{ flex: 1 }}
                            />
                          );
                        })}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Сила пароля:{' '}
                        <span className="font-medium">{newPwdLabel}</span>
                      </div>
                    </div>

                    <Input
                      label="Подтвердите пароль"
                      id="confirmNewPassword"
                      placeholder="••••••••"
                      type={showConfirmPassword ? 'text' : 'password'}
                      icon={<Lock size={16} />}
                      value={confirmNewPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmNewPassword(e.target.value)
                      }
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      }
                      error={undefined}
                      required
                    />
                  </div>

                  {resetError && (
                    <div className="text-red-600 text-sm">{resetError}</div>
                  )}
                  {resetSuccess && (
                    <div className="text-green-600 text-sm">
                      Пароль успешно сброшен — перенаправление...
                    </div>
                  )}

                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex items-center justify-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-nekstmedium hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px] w-full"
                    >
                      {resetLoading ? 'Сохраняем...' : 'Сбросить пароль'}
                    </button>
                    {/* Back to previous step */}
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep(1);
                        setResetError('');
                        setResetSuccess(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 py-3 text-[18px] transition-transform hover:scale-105 duration-300 shadow-lg"
                    >
                      Назад
                    </button>
                  </div>
                </form>
              )}
            </>
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
  onFocus,
  onBlur,
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
          onFocus={onFocus}
          onBlur={onBlur}
          className="flex-1 bg-transparent outline-none text-[18px] text-black font-nekstmedium"
          required={required}
        />
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </div>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
