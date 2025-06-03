'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  const isEmailValid = email.length > 4 && email.includes('@');
  const isPasswordValid = password.length >= 8;
  const isUserIdValid = userId === '' || /^[a-zA-Z0-9_-]{3,20}$/.test(userId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (userId && isUserIdValid) {
      alert(`Авторизация по ID: ${userId}`);
      return;
    }
    if (!userId) {
      if (!isEmailValid || !isPasswordValid) return;
      alert(`Авторизация по Email: ${email}`);
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
    <div className="relative bg-[url(/pages/main/drone_15.jpg)] bg-cover min-h-[100vh] bg-gray-100">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[12px] z-0"></div>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-72px)] relative z-10 p-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-nekstsemibold text-white drop-shadow-xl mb-6 text-center"
        >
          Вход в DroneAgro
        </motion.h1>
        <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="w-full lg:w-1/2 p-8">
            <h2 className="text-[28px] font-nekstmedium text-black mb-6 flex items-center gap-2">
              <LogIn size={28} className="text-blue-600" />
              Войти в аккаунт
            </h2>

            {/* --- Основная форма --- */}
            {!showForgot ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="ID"
                  id="userId"
                  placeholder="Введите ваш ID или оставьте пустым"
                  type="text"
                  icon={<ShieldCheck size={20} />}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  error={
                    submitted && userId.length > 0 && !isUserIdValid
                      ? 'ID должен быть от 3 до 20 символов (буквы, цифры, -, _)'
                      : ''
                  }
                  required={false}
                />
                <Input
                  label="Email"
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  icon={<Mail size={20} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg mt-4"
                >
                  <LogIn size={20} /> Войти
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
                  onChange={(e) => setForgotEmail(e.target.value)}
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
                    Если email найден — на него отправлена ссылка для сброса
                    пароля.
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
          <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#dceefc] to-[#e5d6d6] w-1/2 p-8 gap-6 font-nekstregular">
            <a
              href="/"
              className="absolute top-4 right-4 flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-300 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Home size={18} className="text-blue-600" />
              На главную
            </a>
            <InfoCard
              icon={<ShieldCheck size={32} />}
              title="Защита данных"
              description="Ваши данные надёжно защищены и не передаются третьим лицам."
            />
            <InfoCard
              icon={<CheckCircle size={32} />}
              title="Быстрый вход"
              description="Входите в систему за считанные секунды."
            />
            <InfoCard
              icon={<UserPlus2 size={32} />}
              title="Новый пользователь?"
              description="Зарегистрируйтесь и получите доступ ко всем возможностям платформы."
            />
            <div className="relative p-6 bg-gradient-to-tr from-white via-[#f4f4f4] to-white border border-gray-200 rounded-2xl shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-2">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                    Безопасность данных
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Используем{' '}
                    <span className="font-medium text-black">
                      256-битное шифрование
                    </span>{' '}
                    и современные стандарты безопасности.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

function InfoCard({ icon, title, description }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-[#313131] bg-white rounded-full p-2 shadow">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-black">{title}</h4>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
    </div>
  );
}
