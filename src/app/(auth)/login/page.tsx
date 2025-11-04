'use client';
import {
  LogIn,
  Home,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldCheck,
  UserPlus2,
} from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Состояния для "Забыл пароль"
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailValid = email.length > 4 && email.includes('@');
  const isPasswordValid = password.length >= 8;
  const isUserIdValid = userId === '' || /^[a-zA-Z0-9_-]{3,20}$/.test(userId);

  // --- ВСТАВЛЯЕМ API URL ---
  const LOGIN_API_URL = 'https://droneagro.duckdns.org/v1/auth/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setLoginError('');
    if (userId && isUserIdValid) {
      // Если надо отправлять запрос по ID
      try {
        setLoading(true);
        // Пример: если сервер поддерживает вход по userId
        const res = await axios.post(LOGIN_API_URL, { user_id: userId });
        // Успешно — делаем что-то (например, сохраняем токен/делаем редирект)

        alert('Вход по ID успешен!');
        // window.location.href = "/"; // или router.push
      } catch (err: any) {
        setLoginError(err?.response?.data?.message || 'Ошибка входа по ID');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!userId) {
      if (!isEmailValid || !isPasswordValid) return;
      try {
        setLoading(true);
        const res = await axios.post(LOGIN_API_URL, {
          email,
          password,
        });
        // const test = res.data['accessToken'];
        const userRole = res.data['userRole'];
        const userId = res.data['id'];
        console.log(res.data);
        // Успешно — делаем что-то (например, сохраняем токен/делаем редирект)
        // alert(test);

        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userId', userId);
        const { data } = await axios.get(
          'https://droneagro.duckdns.org/v1/me',
          {
            headers: { Authorization: `Bearer ${res.data.accessToken}` },
          },
        );
        console.log(data['email']);
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
      return;
    }
    if (userId && !isUserIdValid) return;
  };

  // Обработка "Забыл пароль"
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSent(false);

    // Простейшая валидация
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Введите корректный email');
      return;
    }

    // Здесь должен быть реальный запрос на сервер для отправки письма
    // await api.sendResetPasswordEmail(forgotEmail)
    setTimeout(() => {
      setForgotSent(true);
      setForgotError('');
    }, 1000);
  };

  return (
    <>
      <div className="w-full lg:w-1/2 p-8">
        <h2 className="text-[28px] font-nekstmedium text-black mb-6 flex items-center gap-2">
          <LogIn size={28} className="text-blue-600" />
          Войти в аккаунт
        </h2>

        {/* --- Основная форма --- */}
        {!showForgot ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* <Input
              label="ID"
              id="userId"
              placeholder="Введите ваш ID или оставьте пустым"
              type="text"
              icon={<ShieldCheck size={20} />}
              value={userId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserId(e.target.value)
              }
              error={
                submitted && userId.length > 0 && !isUserIdValid
                  ? 'ID должен быть от 3 до 20 символов (буквы, цифры, -, _)'
                  : ''
              }
              required={false}
            /> */}
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
                submitted && !userId && !isEmailValid
                  ? 'Введите корректный email'
                  : ''
              }
              required={!userId}
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
                submitted && !userId && !isPasswordValid
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
              required={!userId}
            />
            <div className="flex items-center gap-2 text-sm text-gray-800 font-nekstregular text-[14px]">
              {isPasswordValid ? (
                <CheckCircle className="text-green-600" size={18} />
              ) : (
                <CheckCircle className="text-gray-400" size={18} />
              )}
              Минимум 8 символов
            </div>
            {loginError && (
              <div className="text-red-600 text-sm font-nekstmedium">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg mt-4 disabled:opacity-60"
            >
              <LogIn size={20} /> {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        ) : (
          // --- Форма восстановления пароля ---

          <form
            className="space-y-6 w-full m-auto"
            onSubmit={handleForgotSubmit}
          >
            <div className="text-xl font-nekstmedium mb-4 text-center">
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
              required={true}
            />

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg"
            >
              Отправить ссылку для сброса
            </button>

            {forgotSent && (
              <div className="text-green-600 text-center mt-2">
                Если email найден — на него отправлена ссылка для сброса пароля.
              </div>
            )}

            <button
              type="button"
              className="block mx-auto mt-4 text-blue-700 font-nekstmedium hover:text-blue-900 transition-colors hover:underline"
              onClick={() => {
                setShowForgot(false);
                setForgotEmail('');
                setForgotError('');
                setForgotSent(false);
              }}
            >
              Назад к входу
            </button>
          </form>
        )}

        {/* --- Ссылки под формой --- */}
        {!showForgot && (
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center justify-between ">
              <a
                href="/signup"
                className="flex items-center  gap-2 text-blue-700 font-medium hover:underline hover:scale-105 transition font-nekstmedium text-[18px]  "
              >
                <UserPlus2 size={18} /> Зарегистрироваться
              </a>
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-blue-700 hover:underline transition font-nekstmedium text-[16px]"
                onClick={() => setShowForgot(true)}
              >
                Забыли пароль?
              </button>
            </div>
          </div>
        )}
      </div>
    </>
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
