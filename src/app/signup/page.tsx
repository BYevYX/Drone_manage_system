'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Home,
  ShieldCheck,
  UserPlus2,
  ChevronDown,
} from 'lucide-react';

// --- Новый компонент выбора роли ---
const roles = [
  { value: 'customer_manager', label: 'Заказчик' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'project_manager', label: 'Менеджер проектов' },
  { value: 'drone_supplier', label: 'Поставщик дронов' },
];

function RoleSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Закрытие меню при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel =
    roles.find((r) => r.value === value)?.label || 'Выберите роль';

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block font-nekstlight text-black mb-1">Роль</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-xl
          bg-gray-100 hover:bg-green-50 transition-all duration-200
          text-[18px] font-nekstmedium text-black shadow border
          ${error ? 'border-red-400' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-green-400
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error}
      >
        <span className={value ? '' : 'text-gray-400'}>{selectedLabel}</span>
        <ChevronDown
          size={20}
          className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
      {/* Выпадающее меню */}
      <div
        className={`
          absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-lg
          max-h-60 overflow-auto border-[1px] border-solid border-[#c9c9c9]
          transition-all duration-300 origin-top scale-y-0 opacity-0
          ${open ? 'scale-y-100 opacity-100' : ''}
          z-50
        `}
        style={{ transformOrigin: 'top' }}
        role="listbox"
      >
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => {
              onChange(role.value);
              setOpen(false);
            }}
            className={`
              w-full text-left px-4 py-3 hover:bg-green-100 transition-colors duration-150
              font-nekstregular
              ${value === role.value ? 'bg-green-200 font-semibold' : 'font-normal'}
            `}
            role="option"
            aria-selected={value === role.value}
          >
            {role.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="text-red-500 text-xs mt-1">
          Пожалуйста, выберите роль
        </div>
      )}
    </div>
  );
}

// --- Основная форма ---
export default function MultiStepSignup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');

  // Поля формы
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Видимость паролей
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Валидация
  const isNameValid = name.trim().length >= 2;
  const isEmailValid = email.includes('@') && email.length > 4;
  const isRoleValid = role !== '';
  const isPasswordValid = password.length >= 8;
  const isConfirmValid = confirm === password && confirm.length > 0;

  // Ошибки для показа
  const [submittedStep1, setSubmittedStep1] = useState(false);
  const [submittedStep2, setSubmittedStep2] = useState(false);

  const handleNext = () => {
    setSubmittedStep1(true);
    if (isNameValid && isEmailValid && isRoleValid) {
      setStep(2);
      setSubmittedStep1(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setSubmittedStep2(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedStep2(true);
    if (isPasswordValid && isConfirmValid) {
      alert('Регистрация успешна!');
      // TODO: отправить данные на сервер
    }
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
          Регистрация в DroneAgro
        </motion.h1>
        <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl">
          {/* Левая часть — форма */}
          <div className="w-full lg:w-1/2 rounded-2xl p-8">
            <h2 className="text-[28px] font-nekstmedium text-black mb-6 flex items-center gap-2">
              <User size={28} className="text-green-600" />
              {step === 1 ? 'Основная информация' : 'Пароль и подтверждение'}
            </h2>
            <form
              onSubmit={step === 1 ? (e) => e.preventDefault() : handleSubmit}
              noValidate
              className="space-y-6"
            >
              {step === 1 && (
                <>
                  <Input
                    label="Имя"
                    id="name"
                    placeholder="Ваше имя"
                    type="text"
                    icon={<User size={20} />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={submittedStep1 && !isNameValid}
                  />

                  <Input
                    label="Email"
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                    icon={<Mail size={20} />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={submittedStep1 && !isEmailValid}
                  />
                  {/* ВНЕДРЁННЫЙ ВЫБОР РОЛИ */}
                  <RoleSelect
                    value={role}
                    onChange={setRole}
                    error={submittedStep1 && !isRoleValid}
                  />
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg mt-4"
                  >
                    Далее
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <Input
                    label="Пароль"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    icon={<Lock size={20} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={submittedStep2 && !isPasswordValid}
                    rightIcon={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        className="focus:outline-none"
                        aria-label={
                          showPassword ? 'Скрыть пароль' : 'Показать пароль'
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                  />
                  <Input
                    label="Подтвердите пароль"
                    id="confirm"
                    placeholder="••••••••"
                    type={showConfirm ? 'text' : 'password'}
                    icon={<Lock size={20} />}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    error={submittedStep2 && !isConfirmValid}
                    rightIcon={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="focus:outline-none"
                        aria-label={
                          showConfirm ? 'Скрыть пароль' : 'Показать пароль'
                        }
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-nekstregular">
                    {isPasswordValid ? (
                      <CheckCircle className="text-green-600" size={18} />
                    ) : (
                      <CheckCircle className="text-gray-400" size={18} />
                    )}
                    Минимум 8 символов
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-gray-700 font-nekstmedium hover:bg-gray-100 transition"
                    >
                      <ArrowLeft size={18} />
                      Назад
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
                    >
                      Зарегистрироваться
                    </button>
                  </div>
                </>
              )}
            </form>
            <div className="mt-8 flex flex-col gap-3">
              {step === 1 && (
                <a
                  href="/login"
                  className="flex items-center gap-2 text-green-700 font-medium hover:underline hover:scale-105 transition font-nekstmedium text-[18px]"
                >
                  Уже есть аккаунт? Войти
                </a>
              )}
            </div>
          </div>
          {/* Правая часть — преимущества и безопасность */}
          <div className="hidden rounded-2xl lg:flex flex-col justify-center bg-gradient-to-br from-[#dceefc] to-[#e5d6d6] w-1/2 p-8 gap-6 font-nekstregular">
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

// --- Input и InfoCard оставьте как в вашем коде ---
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
}) {
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
          required
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </div>
      {error && (
        <div id={`${id}-error`} className="text-red-500 text-xs mt-1">
          Некорректное значение
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, title, description }) {
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
