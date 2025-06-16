'use client';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { Input, RoleSelect, Step2Data } from './Components';

interface Step1Props {
  handleNext: (isValid: boolean) => void;
  role: string;
  email: string;
  name: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
}

export function Step1({
  setName,
  handleNext,
  setEmail,
  setRole,
  role,
  name,
  email,
}: Step1Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isNameValid = name.trim().length >= 2;
  const isEmailValid = email.includes('@') && email.length > 4;
  const isRoleValid = role !== '';

  return (
    <>
      <Input
        label="Имя"
        id="name"
        placeholder="Ваше имя"
        type="text"
        icon={<User size={20} />}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={isSubmitted && !isNameValid}
      />

      <Input
        label="Email"
        id="email"
        placeholder="you@example.com"
        type="email"
        icon={<Mail size={20} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={isSubmitted && !isEmailValid}
      />
      <RoleSelect
        value={role}
        onChange={setRole}
        error={isSubmitted && !isRoleValid}
      />
      <button
        type="button"
        onClick={() => {
          setIsSubmitted(true);
          handleNext(isEmailValid && isNameValid && isRoleValid);
          setTimeout(() => setIsSubmitted(false), 1000);
        }}
        className="w-full flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-10 font-nekstmedium text-[18px] hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg mt-4"
      >
        Далее
      </button>
    </>
  );
}

interface Step2Props {
  handleBack: () => void;
  handleNext: (valid: boolean) => void;
  data: Step2Data;
  role: string;
  setData: (data: Partial<Step2Data>) => void;
}

export function Step2({
  handleBack,
  handleNext,
  data,
  role,
  setData,
}: Step2Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (role !== 'customer_manager') handleNext(true);
  }, [role]);
  if (role !== 'customer_manager') return null;

  // Валидация: поля обязательны
  const isFieldValid = (value: string) => value.trim().length > 0;
  const mainFieldsValid = [
    data.inn,
    data.kpp,
    data.okpo,
    data.urAddres,
    data.factAddres,
  ].every(isFieldValid);
  const contactFieldsValid = data.contactPerson
    ? [
        data.contact.lastName,
        data.contact.firstName,
        data.contact.middleName,
        data.contact.phone,
        data.contact.email,
      ].every(isFieldValid)
    : true;
  const allOk = mainFieldsValid && contactFieldsValid;

  const handleSubmit = () => {
    setIsSubmitted(true);
    handleNext(allOk);
    setTimeout(() => setIsSubmitted(false), 1000);
  };

  return (
    <>
      {/* Тип контрагента */}
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { label: 'Компания', value: 'company' },
          { label: 'Инд. предприниматель', value: 'individual' },
          { label: 'Физ лицо', value: 'person' },
        ].map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setData({ type: value as Step2Data['type'] })}
            className={`px-4 py-2 rounded-full font-nekstmedium ${
              data.type === value
                ? 'bg-purple-600 text-white'
                : 'bg-transparent border border-gray-600 text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Основные поля */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ИНН"
          value={data.inn}
          onChange={(e) => setData({ inn: e.target.value })}
          error={isSubmitted && !isFieldValid(data.inn)}
          id="inn"
        />
        <Input
          label="КПП"
          value={data.kpp}
          onChange={(e) => setData({ kpp: e.target.value })}
          error={isSubmitted && !isFieldValid(data.kpp)}
          id="kpp"
        />
        <Input
          label="Код по ОКПО"
          value={data.okpo}
          onChange={(e) => setData({ okpo: e.target.value })}
          error={isSubmitted && !isFieldValid(data.okpo)}
          id="okpo"
        />
        <Input
          label="Юридический адрес"
          value={data.urAddres}
          onChange={(e) => setData({ urAddres: e.target.value })}
          error={isSubmitted && !isFieldValid(data.urAddres)}
          id="ur_addres"
        />
        <Input
          label="Фактический адрес"
          value={data.factAddres}
          onChange={(e) => setData({ factAddres: e.target.value })}
          error={isSubmitted && !isFieldValid(data.factAddres)}
          id="fact_addres"
        />
      </div>

      {/* Контактное лицо */}
      <div className="mt-6 border border-gray-700 rounded-lg p-4">
        <label className="flex items-center gap-2 font-nekstmedium text-sm mb-4">
          <input
            type="checkbox"
            checked={data.contactPerson}
            onChange={(e) => setData({ contactPerson: e.target.checked })}
            className="accent-purple-600 hover:cursor-pointer"
          />
          Указать данные контактного лица (будет создано контактное лицо
          контрагента)
        </label>

        <AnimatePresence>
          {data.contactPerson && (
            <motion.div
              key="contact-person"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Фамилия"
                  value={data.contact.lastName}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, lastName: e.target.value },
                    })
                  }
                  error={isSubmitted && !isFieldValid(data.contact.lastName)}
                  id="surname_agent"
                />
                <Input
                  label="Телефон"
                  value={data.contact.phone}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, phone: e.target.value },
                    })
                  }
                  error={isSubmitted && !isFieldValid(data.contact.phone)}
                  id="telephone_agent"
                />
                <Input
                  label="Имя"
                  value={data.contact.firstName}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, firstName: e.target.value },
                    })
                  }
                  error={isSubmitted && !isFieldValid(data.contact.firstName)}
                  id="name_agent"
                />
                <Input
                  label="E-mail"
                  value={data.contact.email}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, email: e.target.value },
                    })
                  }
                  error={isSubmitted && !isFieldValid(data.contact.email)}
                  id="email_agent"
                />
                <Input
                  label="Отчество"
                  value={data.contact.middleName}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, middleName: e.target.value },
                    })
                  }
                  error={isSubmitted && !isFieldValid(data.contact.middleName)}
                  id="patronumic_agent"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопки управления */}
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
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
        >
          Далее
        </button>
      </div>
    </>
  );
}

interface Step3Props {
  handleBack: () => void;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirm: React.Dispatch<React.SetStateAction<string>>;
  setAllOk: React.Dispatch<React.SetStateAction<boolean>>;
  confirm: string;
}

export function Step3({
  handleBack,
  password,
  setPassword,
  setConfirm,
  setAllOk,
  confirm,
}: Step3Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isPasswordValid = password.length >= 8;
  const isConfirmValid = confirm === password && confirm.length > 0;

  return (
    <>
      <Input
        label="Пароль"
        id="password"
        placeholder="••••••••"
        type={showPassword ? 'text' : 'password'}
        icon={<Lock size={20} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={isSubmitted && !isPasswordValid}
        rightIcon={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="focus:outline-none"
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
        error={isSubmitted && !isConfirmValid}
        rightIcon={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
            className="focus:outline-none"
            aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
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
          onClick={() => {
            setIsSubmitted(true);
            setAllOk(isConfirmValid && isPasswordValid);
            setTimeout(() => setIsSubmitted(false), 1000);
          }}
        >
          Зарегистрироваться
        </button>
      </div>
    </>
  );
}
