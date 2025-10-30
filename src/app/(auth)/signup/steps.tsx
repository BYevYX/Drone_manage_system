// app/components/steps.tsx
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  MapPin,
  Info,
  Package,
  AlertCircle,
} from 'lucide-react';
import React, { useState } from 'react';

import { Input, RoleSelect } from './Components';
import axios from 'axios';

/**
 * Типы и интерфейсы
 */
export interface Step2Data {
  type: 'COMPANY' | 'INDIVIDUAL' | 'PERSON';
  nameCompany: string;
  inn: string;
  kpp: string;
  okpo: string;
  urAddres: string;
  factAddres: string;
  contactPerson: boolean;
  contact: {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
  };
}

export interface StepFioData {
  firstName: string;
  lastName: string;
  middleName?: string;
}

export interface DroneSupplierData {
  company: string;
  supplyType: string;
  phone: string;
  region: string;
  fleetSize: string;
  experience?: string;
  equipment?: string;
  notes?: string;
}

export interface MaterialSupplierData {
  company: string;
  materialType: string;
  phone: string;
  region: string;
  experience?: string;
  notes?: string;
}

/* ================= Step1 ================= */
interface Step1Props {
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  phoneError?: string;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  emailError?: string;
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
}

export function Step1({
  phone,
  setPhone,
  phoneError,
  email,
  setEmail,
  emailError,
  role,
  setRole,
}: Step1Props) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-4">
        <Input
          label={
            <>
              Телефон <span className="text-red-500">*</span>
            </>
          }
          id="phone"
          placeholder="+7 (___) ___-__-__"
          type="tel"
          icon={<Phone size={20} />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {phoneError && (
          <p className="text-red-600 text-sm mt-1">{phoneError}</p>
        )}

        <Input
          label={
            <>
              E-mail <span className="text-red-500">*</span>
            </>
          }
          id="email"
          placeholder="you@example.com"
          type="email"
          icon={<Mail size={20} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && (
          <p className="text-red-600 text-sm mt-1">{emailError}</p>
        )}
      </div>

      <RoleSelect value={role} onChange={setRole} />
    </div>
  );
}

/* ================= CustomerForm (Step2) ================= */
export function CustomerForm({
  data,
  setData,
  errors = {},
}: {
  data: Step2Data;
  // теперь ожидаем настоящий React setState, чтобы безопасно делать prev => ({...prev})
  setData: React.Dispatch<React.SetStateAction<Step2Data>>;
  errors?: Record<string, string>;
}) {
  return (
    <>
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { label: 'Компания', value: 'COMPANY' },
          { label: 'ИП', value: 'INDIVIDUAL' },
          { label: 'Физ лицо', value: 'PERSON' },
        ].map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setData((prev) => ({ ...prev, type: value as Step2Data['type'] }))
            }
            className={`px-4 py-2 rounded-full font-nekstmedium ${
              data.type === value
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
                : 'bg-transparent border text-gray-600 border-gray-600 '
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={
            <>
              Название компании <span className="text-red-500">*</span>
            </>
          }
          value={data.nameCompany}
          onChange={(e) =>
            setData((prev) => ({ ...prev, nameCompany: e.target.value }))
          }
          id="name_company"
          icon={<Building size={20} />}
        />
        {errors.nameCompany && (
          <p className="text-red-600 text-sm mt-1">{errors.nameCompany}</p>
        )}

        <Input
          label={
            <>
              ИНН{' '}
              {data.type === 'COMPANY' && (
                <span className="text-red-500">*</span>
              )}
            </>
          }
          value={data.inn}
          onChange={(e) =>
            setData((prev) => ({ ...prev, inn: e.target.value }))
          }
          id="inn"
        />
        {errors.inn && (
          <p className="text-red-600 text-sm mt-1">{errors.inn}</p>
        )}

        <Input
          label="КПП"
          value={data.kpp}
          onChange={(e) =>
            setData((prev) => ({ ...prev, kpp: e.target.value }))
          }
          id="kpp"
        />
        <Input
          label="Код по ОКПО"
          value={data.okpo}
          onChange={(e) =>
            setData((prev) => ({ ...prev, okpo: e.target.value }))
          }
          id="okpo"
        />
        <Input
          label="Юридический адрес"
          value={data.urAddres}
          onChange={(e) =>
            setData((prev) => ({ ...prev, urAddres: e.target.value }))
          }
          id="ur_addres"
        />
        <Input
          label="Фактический адрес"
          value={data.factAddres}
          onChange={(e) =>
            setData((prev) => ({ ...prev, factAddres: e.target.value }))
          }
          id="fact_addres"
        />
      </div>

      <div className="mt-6 border border-gray-700 rounded-lg p-4">
        <label className="flex items-center gap-2 font-nekstmedium text-sm mb-4">
          <input
            type="checkbox"
            checked={data.contactPerson}
            onChange={(e) =>
              setData((prev) => ({ ...prev, contactPerson: e.target.checked }))
            }
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
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Фамилия"
                  value={data.contact.lastName}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, lastName: e.target.value },
                    }))
                  }
                  id="surname_agent"
                  icon={<User size={18} />}
                />
                <Input
                  label="Телефон"
                  value={data.contact.phone}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value },
                    }))
                  }
                  id="telephone_agent"
                  icon={<Phone size={18} />}
                />
                <Input
                  label="Имя"
                  value={data.contact.firstName}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, firstName: e.target.value },
                    }))
                  }
                  id="name_agent"
                  icon={<User size={18} />}
                />
                <Input
                  label="E-mail"
                  value={data.contact.email}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value },
                    }))
                  }
                  id="email_agent"
                  icon={<Mail size={18} />}
                />
                <Input
                  label="Отчество"
                  value={data.contact.middleName}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, middleName: e.target.value },
                    }))
                  }
                  id="patronumic_agent"
                  icon={<User size={18} />}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ================= DroneSupplierPart1 ================= */
export function DroneSupplierPart1({
  data,
  setData,
  errors = {},
}: {
  data: DroneSupplierData;
  setData: React.Dispatch<React.SetStateAction<DroneSupplierData>>;
  errors?: Record<string, string>;
}) {
  return (
    <>
      <Input
        label={
          <>
            Компания <span className="text-red-500">*</span>
          </>
        }
        value={data.company}
        onChange={(e) =>
          setData((prev) => ({ ...prev, company: e.target.value }))
        }
        id="company_drone_supplier"
        icon={<Building size={20} />}
      />
      {errors.company && (
        <p className="text-red-600 text-sm mt-1">{errors.company}</p>
      )}

      <Input
        label={
          <>
            Тип деятельности <span className="text-red-500">*</span>
          </>
        }
        value={data.supplyType}
        onChange={(e) =>
          setData((prev) => ({ ...prev, supplyType: e.target.value }))
        }
        id="supply_type_drone_supplier"
        icon={<Package size={20} />}
      />
      {errors.supplyType && (
        <p className="text-red-600 text-sm mt-1">{errors.supplyType}</p>
      )}

      <Input
        label={
          <>
            Телефон поставщика <span className="text-red-500">*</span>
          </>
        }
        value={data.phone}
        onChange={(e) =>
          setData((prev) => ({ ...prev, phone: e.target.value }))
        }
        id="phone_drone_supplier"
        icon={<Phone size={20} />}
        placeholder="+7 (___) ___-__-__"
      />
      {errors.phone && (
        <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <Input
          label="Регион"
          value={data.region}
          onChange={(e) =>
            setData((prev) => ({ ...prev, region: e.target.value }))
          }
          id="region_drone_supplier"
          icon={<MapPin size={18} />}
        />
        <Input
          label="Размер парка (необязательно)"
          value={data.fleetSize}
          onChange={(e) =>
            setData((prev) => ({ ...prev, fleetSize: e.target.value }))
          }
          id="fleet_size_drone_supplier"
          icon={<Info size={18} />}
        />
      </div>
    </>
  );
}

/* ================= DroneSupplierPart2 ================= */
export function DroneSupplierPart2({
  data,
  setData,
  errors = {},
}: {
  data: DroneSupplierData;
  setData: React.Dispatch<React.SetStateAction<DroneSupplierData>>;
  errors?: Record<string, string>;
}) {
  return (
    <>
      <Input
        label={
          <>
            Опыт работы <span className="text-red-500">*</span>
          </>
        }
        value={data.experience || ''}
        onChange={(e) =>
          setData((prev) => ({ ...prev, experience: e.target.value }))
        }
        id="experience_drone_supplier"
        icon={<Info size={20} />}
      />
      {errors.experience && (
        <p className="text-red-600 text-sm mt-1">{errors.experience}</p>
      )}

      <Input
        label="Оборудование (необязательно)"
        value={data.equipment || ''}
        onChange={(e) =>
          setData((prev) => ({ ...prev, equipment: e.target.value }))
        }
        id="equipment_drone_supplier"
        icon={<Info size={20} />}
      />

      <Input
        label="Комментарий (необязательно)"
        value={data.notes || ''}
        onChange={(e) =>
          setData((prev) => ({ ...prev, notes: e.target.value }))
        }
        id="notes_drone_supplier"
        icon={<Info size={20} />}
      />
    </>
  );
}

/* ================= MaterialSupplierForm ================= */
export function MaterialSupplierForm({
  data,
  setData,
  errors = {},
}: {
  data: MaterialSupplierData;
  setData: React.Dispatch<React.SetStateAction<MaterialSupplierData>>;
  errors?: Record<string, string>;
}) {
  return (
    <>
      <Input
        label={
          <>
            Компания <span className="text-red-500">*</span>
          </>
        }
        value={data.company}
        onChange={(e) =>
          setData((prev) => ({ ...prev, company: e.target.value }))
        }
        id="company_material_supplier"
        icon={<Building size={20} />}
      />
      {errors.company && (
        <p className="text-red-600 text-sm mt-1">{errors.company}</p>
      )}

      <Input
        label={
          <>
            Тип материалов <span className="text-red-500">*</span>
          </>
        }
        value={data.materialType}
        onChange={(e) =>
          setData((prev) => ({ ...prev, materialType: e.target.value }))
        }
        id="material_type_material_supplier"
        icon={<Package size={20} />}
      />
      {errors.materialType && (
        <p className="text-red-600 text-sm mt-1">{errors.materialType}</p>
      )}

      <Input
        label="Телефон"
        value={data.phone}
        onChange={(e) =>
          setData((prev) => ({ ...prev, phone: e.target.value }))
        }
        id="phone_material_supplier"
        icon={<Phone size={20} />}
        placeholder="+7 (___) ___-__-__"
      />
      <Input
        label="Регион"
        value={data.region}
        onChange={(e) =>
          setData((prev) => ({ ...prev, region: e.target.value }))
        }
        id="region_material_supplier"
        icon={<MapPin size={20} />}
      />
      <Input
        label="Опыт работы (необязательно)"
        value={data.experience || ''}
        onChange={(e) =>
          setData((prev) => ({ ...prev, experience: e.target.value }))
        }
        id="experience_material_supplier"
        icon={<Info size={20} />}
      />
      <Input
        label="Комментарий (необязательно)"
        value={data.notes || ''}
        onChange={(e) =>
          setData((prev) => ({ ...prev, notes: e.target.value }))
        }
        id="notes_material_supplier"
        icon={<Info size={20} />}
      />
    </>
  );
}

/* ================= StepFio ================= */
export function StepFio({
  data,
  setData,
  errors = {},
}: {
  data: StepFioData;
  setData: React.Dispatch<React.SetStateAction<StepFioData>>;
  errors?: { lastName?: string; firstName?: string };
}) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-4">
        <Input
          label={
            <div className="relative">
              Фамилия <span className="text-red-500">*</span>
              {errors?.lastName && (
                <span className="absolute right-0 top-0 text-red-600 text-sm">
                  {errors.lastName}
                </span>
              )}
            </div>
          }
          id="lastName"
          value={data.lastName || ''}
          onChange={(e) =>
            setData((prev) => ({ ...prev, lastName: e.target.value }))
          }
          icon={<User size={20} />}
        />

        <Input
          label={
            <div className="relative">
              Имя <span className="text-red-500">*</span>
              {errors?.firstName && (
                <span className="absolute right-0 top-0 text-red-600 text-sm">
                  {errors.firstName}
                </span>
              )}
            </div>
          }
          id="firstName"
          value={data.firstName || ''}
          onChange={(e) =>
            setData((prev) => ({ ...prev, firstName: e.target.value }))
          }
          icon={<User size={20} />}
        />

        <Input
          label="Отчество"
          id="middleName"
          value={data.middleName || ''}
          onChange={(e) =>
            setData((prev) => ({ ...prev, middleName: e.target.value }))
          }
          icon={<User size={20} />}
        />
      </div>
    </div>
  );
}

/* ================= Step3 (Пароль) =================
   Теперь Step3 умеет показывать сверху сообщение от бэка (serverMessage).
*/
export function Step3({
  password,
  setPassword,
  confirm,
  setConfirm,
  passwordError,
  confirmError,
  serverMessage,
}: {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirm: string;
  setConfirm: React.Dispatch<React.SetStateAction<string>>;
  passwordError?: string;
  confirmError?: string;
  serverMessage?: string; // сообщение от бэка, показываем сверху если есть
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      {serverMessage && (
        <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm mb-3">
          {serverMessage}
        </div>
      )}

      <Input
        label={
          <div className="relative">
            Пароль <span className="text-red-500">*</span>
            {passwordError && (
              <span className="absolute right-0 top-0 text-red-600 text-sm">
                {passwordError}
              </span>
            )}
          </div>
        }
        id="password"
        placeholder="••••••••"
        type={showPassword ? 'text' : 'password'}
        icon={<Lock size={20} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
        label={
          <div className="relative">
            Подтвердите пароль <span className="text-red-500">*</span>
            {confirmError && (
              <span className="absolute right-0 top-0 text-red-600 text-sm">
                {confirmError}
              </span>
            )}
          </div>
        }
        id="confirm"
        placeholder="••••••••"
        type={showConfirm ? 'text' : 'password'}
        icon={<Lock size={20} />}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
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

      <div className="flex items-center gap-2 text-sm text-gray-800 font-nekstregular mt-2">
        <CheckCircle className="text-gray-400" size={18} />
        Минимум 8 символов
      </div>
    </>
  );
}

/* ================= EmailVerification =================
   Новый шаг — подтверждение почты после пароля.
   Показывает сверху данные/сообщение от бэка (serverMessage, serverData).
   Ошибки возле звездочки (не двигают поле).
*/
export function EmailVerification({
  serverMessage,
  serverData,
  code,
  setCode,
  codeError,
  onResend,
  isVerifying,
}: {
  serverMessage?: string; // краткое сообщение от бэка (например: "На почту отправлен код")
  serverData?: any; // дополнительно показать что приходит с бэка (будет строкой JSON)
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  codeError?: string;
  onVerify: () => void;
  onResend?: () => void;
  isVerifying?: boolean;
}) {
  const [error, setError] = useState('');
  const onVerify = async () => {
    try {
      const res = await axios.get(
        `http://51.250.43.77:8080/v1/verification`,
        { params: { code } }, // безопасный способ передать query
      );

      if (Object.keys(res.data).length === 0) {
        // код верный
        window.location.href = '/login';
      } else {
        // код неверный
        setError('Неверный код');
      }
    } catch (err) {
      console.error(err);
      setError('Неверный код');
      setError('Ошибка при проверке кода');
    }
  };
  return (
    <div className="space-y-4">
      {serverMessage && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 border border-blue-300 text-blue-900 text-sm shadow-sm animate-fade-in">
          <AlertCircle></AlertCircle>
          <span>Введите код, отправленный на почту</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-md bg-blue-50 border border-red-200 text-red-800 text-sm mb-3">
          Неверный код
        </div>
      )}

      <div>
        <label className="relative block font-medium mb-2">
          <span>
            Код подтверждения <span className="text-red-500">*</span>
          </span>
          {codeError && (
            <span className="absolute right-0 top-0 text-red-600 text-sm">
              {codeError}
            </span>
          )}
        </label>

        <Input
          id="email_code"
          placeholder="Введите код из письма"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          icon={<Mail size={18} />}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onVerify}
          disabled={isVerifying}
          className={`px-4 py-2 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg ${
            isVerifying ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {isVerifying ? 'Проверяю...' : 'Подтвердить'}
        </button>

        {onResend && (
          <button
            type="button"
            onClick={onResend}
            className="px-4 py-2 rounded-[20px] border border-gray-300 text-gray-700 font-nekstmedium hover:bg-gray-100 transition"
          >
            Отправить код заново
          </button>
        )}
      </div>
    </div>
  );
}

/* Экспорт пустого default */
export default {};
