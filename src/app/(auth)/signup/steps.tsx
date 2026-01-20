// app/components/steps.tsx
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import {
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
          onChange={(e: any) => setPhone(e.target.value)}
          error={Boolean(phoneError)}
          errorMessage={phoneError}
        />

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
          onChange={(e: any) => setEmail(e.target.value)}
          error={Boolean(emailError)}
          errorMessage={emailError}
        />
      </div>

      <RoleSelect value={role} onChange={setRole} />
    </div>
  );
}

/* ================= ManagerForm (переиспользует CustomerForm) ================= */
/* Теперь ManagerForm рисует те же поля, что и CustomerForm — одно место для верности */
export function ManagerForm({
  data,
  setData,
  errors = {},
}: {
  data: Step2Data;
  setData: React.Dispatch<React.SetStateAction<Step2Data>>;
  errors?: Record<string, string>;
}) {
  // просто переиспользуем CustomerForm JSX
  return <CustomerForm data={data} setData={setData} errors={errors} />;
}

/* ================= CustomerForm ================= */
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
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
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
            className={`px-3 sm:px-4 py-2 rounded-full font-nekstmedium text-sm sm:text-base flex-1 min-w-[90px] ${
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
        {data.type !== 'PERSON' && (
          <Input
            label={
              <>
                Название компании <span className="text-red-500">*</span>
              </>
            }
            value={data.nameCompany}
            onChange={(e: any) =>
              setData((prev) => ({ ...prev, nameCompany: e.target.value }))
            }
            id="name_company"
            icon={<Building size={20} />}
            error={Boolean(errors.nameCompany)}
            errorMessage={errors.nameCompany}
          />
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
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, inn: e.target.value }))
          }
          id="inn"
          filter="digits"
          maxLength={12}
          error={Boolean(errors.inn)}
          errorMessage={errors.inn}
        />

        <Input
          label="КПП"
          value={data.kpp}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, kpp: e.target.value }))
          }
          id="kpp"
          filter="digits"
          maxLength={9}
          error={Boolean(errors.kpp)}
          errorMessage={errors.kpp}
        />
        <Input
          label="Код по ОКПО"
          value={data.okpo}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, okpo: e.target.value }))
          }
          id="okpo"
          filter="digits"
          maxLength={10}
          error={Boolean(errors.okpo)}
          errorMessage={errors.okpo}
        />
        <Input
          label="Юридический адрес"
          value={data.urAddres}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, urAddres: e.target.value }))
          }
          id="ur_addres"
          error={Boolean(errors.urAddres)}
        />
        <Input
          label="Фактический адрес"
          value={data.factAddres}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, factAddres: e.target.value }))
          }
          id="fact_addres"
          error={Boolean(errors.factAddres)}
        />
      </div>
    </>
  );
}

/* ================= CustomerFormPart1 - Основные данные ================= */
export function CustomerFormPart1({
  data,
  setData,
  errors = {},
}: {
  data: Step2Data;
  setData: React.Dispatch<React.SetStateAction<Step2Data>>;
  errors?: Record<string, string>;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
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
            className={`px-3 sm:px-4 py-2 rounded-full font-nekstmedium text-sm sm:text-base flex-1 min-w-[90px] ${
              data.type === value
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
                : 'bg-transparent border text-gray-600 border-gray-600 '
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.type !== 'PERSON' && (
          <Input
            label={
              <>
                Название компании <span className="text-red-500">*</span>
              </>
            }
            value={data.nameCompany}
            onChange={(e: any) =>
              setData((prev) => ({ ...prev, nameCompany: e.target.value }))
            }
            id="name_company_p1"
            icon={<Building size={20} />}
            error={Boolean(errors.nameCompany)}
            errorMessage={errors.nameCompany}
          />
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
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, inn: e.target.value }))
          }
          id="inn_p1"
          filter="digits"
          maxLength={12}
          error={Boolean(errors.inn)}
          errorMessage={errors.inn}
        />

        <Input
          label="КПП"
          value={data.kpp}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, kpp: e.target.value }))
          }
          id="kpp_p1"
          filter="digits"
          maxLength={9}
          error={Boolean(errors.kpp)}
          errorMessage={errors.kpp}
        />
      </div>
    </>
  );
}

/* ================= CustomerFormPart2 - Дополнительные данные ================= */
export function CustomerFormPart2({
  data,
  setData,
  errors = {},
}: {
  data: Step2Data;
  setData: React.Dispatch<React.SetStateAction<Step2Data>>;
  errors?: Record<string, string>;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Код по ОКПО"
          value={data.okpo}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, okpo: e.target.value }))
          }
          id="okpo_p2"
          filter="digits"
          maxLength={10}
          error={Boolean(errors.okpo)}
          errorMessage={errors.okpo}
        />
        <Input
          label="Юридический адрес"
          value={data.urAddres}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, urAddres: e.target.value }))
          }
          id="ur_addres_p2"
          error={Boolean(errors.urAddres)}
        />
        <Input
          label="Фактический адрес"
          value={data.factAddres}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, factAddres: e.target.value }))
          }
          id="fact_addres_p2"
          error={Boolean(errors.factAddres)}
        />
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
        onChange={(e: any) =>
          setData((prev) => ({ ...prev, company: e.target.value }))
        }
        id="company_drone_supplier"
        icon={<Building size={20} />}
        error={Boolean(errors.company)}
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
        onChange={(e: any) =>
          setData((prev) => ({ ...prev, supplyType: e.target.value }))
        }
        id="supply_type_drone_supplier"
        icon={<Package size={20} />}
        error={Boolean(errors.supplyType)}
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
        onChange={(e: any) =>
          setData((prev) => ({ ...prev, phone: e.target.value }))
        }
        id="phone_drone_supplier"
        icon={<Phone size={20} />}
        placeholder="+7 (___) ___-__-__"
        error={Boolean(errors.phone)}
      />
      {errors.phone && (
        <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <Input
          label="Регион"
          value={data.region}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, region: e.target.value }))
          }
          id="region_drone_supplier"
          icon={<MapPin size={18} />}
          error={Boolean(errors.region)}
        />
        <Input
          label="Размер парка (необязательно)"
          value={data.fleetSize}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, fleetSize: e.target.value }))
          }
          id="fleet_size_drone_supplier"
          icon={<Info size={18} />}
          error={Boolean(errors.fleetSize)}
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
        onChange={(e: any) =>
          setData((prev) => ({ ...prev, experience: e.target.value }))
        }
        id="experience_drone_supplier"
        icon={<Info size={20} />}
        error={Boolean(errors.experience)}
      />
      {errors.experience && (
        <p className="text-red-600 text-sm mt-1">{errors.experience}</p>
      )}

      <Input
        label="Оборудование (необязательно)"
        value={data.equipment || ''}
        onChange={(e: any) =>
          setData((prev) => ({ ...prev, equipment: e.target.value }))
        }
        id="equipment_drone_supplier"
        icon={<Info size={20} />}
        error={Boolean(errors.equipment)}
      />

      <Input
        label="Комментарий (необязательно)"
        value={data.notes || ''}
        onChange={(e: any) =>
          setData((prev) => ({ ...prev, notes: e.target.value }))
        }
        id="notes_drone_supplier"
        icon={<Info size={20} />}
        error={Boolean(errors.notes)}
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
  const required = (v?: string) => (v ?? '').trim().length > 1;

  return (
    <>
      {/* Тип контрагента */}
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
              setData((prev) => ({
                ...prev,
                type: value as MaterialSupplierData['type'],
              }))
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

      {/* Основные поля */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={
            <>
              Название компании <span className="text-red-500">*</span>
            </>
          }
          value={data.nameCompany}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, nameCompany: e.target.value }))
          }
          id="ms_name_company"
          icon={<Building size={20} />}
          error={Boolean(errors.nameCompany)}
          errorMessage={errors.nameCompany}
        />
        <Input
          label={`ИНН ${data.type === 'COMPANY' ? '*' : ''}`}
          value={data.inn}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, inn: e.target.value }))
          }
          id="ms_inn"
          filter="digits"
          maxLength={12}
          error={
            data.type === 'COMPANY' && !required(data.inn)
              ? true
              : Boolean(errors.inn)
          }
          errorMessage={errors.inn}
        />
        <Input
          label="КПП"
          value={data.kpp}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, kpp: e.target.value }))
          }
          id="ms_kpp"
          filter="digits"
          maxLength={9}
          error={Boolean(errors.kpp)}
          errorMessage={errors.kpp}
        />
        <Input
          label="Код по ОКПО"
          value={data.okpo}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, okpo: e.target.value }))
          }
          id="ms_okpo"
          filter="digits"
          maxLength={10}
          error={Boolean(errors.okpo)}
          errorMessage={errors.okpo}
        />
        <Input
          label="Юридический адрес"
          value={data.urAddres}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, urAddres: e.target.value }))
          }
          id="ms_uraddr"
          error={Boolean(errors.urAddres)}
        />
        <Input
          label="Фактический адрес"
          value={data.factAddres}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, factAddres: e.target.value }))
          }
          id="ms_factaddr"
          error={Boolean(errors.factAddres)}
        />
      </div>

      {/* Контактное лицо */}
      <div className="mt-6 border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-2 font-nekstmedium text-sm mb-4">
          <input
            type="checkbox"
            checked={data.contactPerson}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                contactPerson: e.target.checked,
              }))
            }
            className="accent-emerald-600 hover:cursor-pointer"
          />
          Указать данные контактного лица (будет создано контактное лицо
          контрагента)
        </label>

        {data.contactPerson && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Фамилия"
              value={data.contact.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, lastName: e.target.value },
                }))
              }
              id="ms_contact_lastname"
              filter="letters"
              error={false}
            />
            <Input
              label="Имя"
              value={data.contact.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, firstName: e.target.value },
                }))
              }
              id="ms_contact_firstname"
              filter="letters"
              error={false}
            />
            <Input
              label="Отчество"
              value={data.contact.middleName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, middleName: e.target.value },
                }))
              }
              id="ms_contact_middlename"
              filter="letters"
              error={false}
            />
            <Input
              label="Телефон"
              value={data.contact.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value },
                }))
              }
              id="ms_contact_phone"
              icon={<Phone size={18} />}
              type="tel"
              error={false}
            />
            <Input
              label="E-mail"
              value={data.contact.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value },
                }))
              }
              id="ms_contact_email"
              icon={<Info size={18} />}
              type="email"
              error={false}
            />
          </div>
        )}
      </div>
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
            <>
              Фамилия <span className="text-red-500">*</span>
            </>
          }
          id="lastName"
          value={data.lastName || ''}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, lastName: e.target.value }))
          }
          icon={<User size={20} />}
          filter="letters"
          error={Boolean(errors?.lastName)}
          errorMessage={errors?.lastName}
        />

        <Input
          label={
            <>
              Имя <span className="text-red-500">*</span>
            </>
          }
          id="firstName"
          value={data.firstName || ''}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, firstName: e.target.value }))
          }
          icon={<User size={20} />}
          filter="letters"
          error={Boolean(errors?.firstName)}
          errorMessage={errors?.firstName}
        />

        <Input
          label="Отчество"
          id="middleName"
          value={data.middleName || ''}
          onChange={(e: any) =>
            setData((prev) => ({ ...prev, middleName: e.target.value }))
          }
          icon={<User size={20} />}
          filter="letters"
          error={Boolean(false)}
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
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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

  const passwordStrength = passwordScore(password);

  return (
    <>
      {serverMessage && (
        <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm mb-3">
          {serverMessage}
        </div>
      )}

      <Input
        label={
          <>
            Пароль <span className="text-red-500">*</span>
          </>
        }
        id="password"
        placeholder="••••••••"
        type={showPassword ? 'text' : 'password'}
        icon={<Lock size={20} />}
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={() => setIsPasswordFocused(false)}
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
        error={Boolean(passwordError)}
        errorMessage={passwordError}
      />

      <Input
        label={
          <>
            Подтвердите пароль <span className="text-red-500">*</span>
          </>
        }
        id="confirm-password"
        placeholder="••••••••"
        type={showConfirm ? 'text' : 'password'}
        icon={<Lock size={20} />}
        value={confirm}
        onChange={(e: any) => setConfirm(e.target.value)}
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={() => setIsPasswordFocused(false)}
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
        error={Boolean(confirmError)}
        errorMessage={confirmError}
      />

      {isPasswordFocused && (
        <div className="mt-2 transition-opacity duration-300 ease-in-out opacity-100">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => {
              const active = i < passwordStrength;
              const bg =
                passwordStrength <= 1
                  ? 'bg-red-500'
                  : passwordStrength <= 3
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
          <div className="text-sm mt-1 text-gray-600 font-nekstregular">
            {passwordLabel(passwordStrength)}
          </div>
        </div>
      )}
    </>
  );
}

/* ================= EmailVerification =================
   Теперь EmailVerification НЕ делает запросы самостоятельно —
   он вызывает onVerify/onResend, которые должны быть переданы извне.
*/
export function EmailVerification({
  serverMessage,
  serverData,
  code,
  setCode,
  codeError,
  onVerify,
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

  // локальная ошибка остаётся, но основная логика проверки происходит извне (в onVerify)
  return (
    <div className="space-y-4">
      {serverMessage && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 border border-blue-300 text-blue-900 text-sm shadow-sm animate-fade-in">
          <AlertCircle />
          <span className="font-nekstregular text-[16px]">
            Введите код, отправленный на почту
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-blue-50 border border-red-200 text-red-800 text-sm mb-3">
          {error}
        </div>
      )}

      <div>
        <label className="relative block font-medium mb-2">
          {codeError && (
            <span className="absolute right-0 top-0 text-red-600 text-sm font-nekstregular">
              {codeError}
            </span>
          )}
        </label>

        <Input
          label={
            <>
              Код подтверждения <span className="text-red-500">*</span>
            </>
          }
          id="email_code"
          placeholder="Введите код из письма"
          value={code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCode(e.target.value)
          }
          icon={<Mail size={18} />}
          filter="digits"
          maxLength={6}
          error={Boolean(codeError)}
          errorMessage={codeError}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setError('');
            try {
              onVerify();
            } catch (err) {
              setError('Ошибка при проверке кода');
            }
          }}
          disabled={isVerifying}
          className={`px-4 py-2 justify-end w-full rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg ${
            isVerifying ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {isVerifying ? 'Проверяю...' : 'Подтвердить'}
        </button>

        {/* {onResend && (
          <button
            type="button"
            onClick={onResend}
            className="px-4 py-2 rounded-[20px] border border-gray-300 text-gray-700 font-nekstmedium hover:bg-gray-100 transition"
          >
            Отправить код заново
          </button>
        )} */}
      </div>
    </div>
  );
}

/* Экспорт пустого default */
export default {};
