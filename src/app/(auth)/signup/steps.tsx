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
} from 'lucide-react';
import { useState } from 'react';

import { Input, RoleSelect } from './Components';

export interface Step2Data {
  type: 'company' | 'individual' | 'person';
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

// ФИО шаг — теперь до пароля!
export interface StepFioData {
  firstName: string;
  lastName: string;
  middleName: string;
}

interface Step1Props {
  handleNext: (isValid: boolean) => void;
  role: string;
  phone: string;
  email: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
}

export function Step1({
  handleNext,
  setEmail,
  setPhone,
  setRole,
  role,
  phone,
  email,
}: Step1Props) {
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const isFormValid = () => {
    return phone.trim() !== '' &&
           email.trim() !== '' &&
           isValidEmail(email) &&
           isValidPhone(phone) &&
           role !== '';
  };

  const handleNextClick = () => {
    if (isFormValid()) {
      handleNext(true);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-4">
        <Input
          label="Телефон"
          id="phone"
          placeholder="+7 (___) ___-__-__"
          type="tel"
          icon={<Phone size={20} />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={phone.trim() !== '' && !isValidPhone(phone)}
        />
        <Input
          label="E-mail"
          id="email"
          placeholder="you@example.com"
          type="email"
          icon={<Mail size={20} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={email.trim() !== '' && !isValidEmail(email)}
        />
      </div>
      <RoleSelect value={role} onChange={setRole} error={role === ''} />
      <button
        type="button"
        onClick={handleNextClick}
        disabled={!isFormValid()}
        className={`w-full flex items-center justify-center gap-2 rounded-[20px] py-3 px-10 font-nekstmedium text-[18px] transition-all duration-300 shadow-lg mt-6 ${
          isFormValid()
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-700 hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Далее
      </button>
    </div>
  );
}

interface Step2Props {
  handleBack: () => void;
  handleNext: (valid: boolean) => void;
  data: Step2Data;
  setData: (data: Partial<Step2Data>) => void;
  role: string;
}
export function Step2({
  handleBack,
  handleNext,
  data,
  setData,
  role,
}: Step2Props) {
  // убрана валидация!
  return (
    <>
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
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                : 'bg-transparent border text-black border-gray-600 '
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Название компании"
          value={data.nameCompany}
          onChange={(e) => setData({ nameCompany: e.target.value })}
          id="company_name"
          error={false}
        />
        <Input
          label="ИНН"
          value={data.inn}
          onChange={(e) => setData({ inn: e.target.value })}
          id="inn"
          error={false}
        />
        <Input
          label="КПП"
          value={data.kpp}
          onChange={(e) => setData({ kpp: e.target.value })}
          id="kpp"
          error={false}
        />
        <Input
          label="Код по ОКПО"
          value={data.okpo}
          onChange={(e) => setData({ okpo: e.target.value })}
          id="okpo"
          error={false}
        />
        <Input
          label="Юридический адрес"
          value={data.urAddres}
          onChange={(e) => setData({ urAddres: e.target.value })}
          id="ur_addres"
          error={false}
        />
        <Input
          label="Фактический адрес"
          value={data.factAddres}
          onChange={(e) => setData({ factAddres: e.target.value })}
          id="fact_addres"
          error={false}
        />
      </div>

      <div className="mt-6 border border-gray-700 rounded-lg p-4">
        <label className="flex items-center gap-2 font-nekstmedium text-sm mb-4 text-black">
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
                  id="surname_agent"
                  error={false}
                />
                <Input
                  label="Телефон"
                  value={data.contact.phone}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, phone: e.target.value },
                    })
                  }
                  id="telephone_agent"
                  error={false}
                />
                <Input
                  label="Имя"
                  value={data.contact.firstName}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, firstName: e.target.value },
                    })
                  }
                  id="name_agent"
                  error={false}
                />
                <Input
                  label="E-mail"
                  value={data.contact.email}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, email: e.target.value },
                    })
                  }
                  id="email_agent"
                  error={false}
                />
                <Input
                  label="Отчество"
                  value={data.contact.middleName}
                  onChange={(e) =>
                    setData({
                      contact: { ...data.contact, middleName: e.target.value },
                    })
                  }
                  id="patronumic_agent"
                  error={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        <button
          type="button"
          onClick={() => handleNext(true)}
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-nekstmedium hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
        >
          Далее
        </button>
      </div>
    </>
  );
}

// Новый шаг ФИО (до пароля)
interface StepFioProps {
  handleBack: () => void;
  handleNext: (valid: boolean) => void;
  data: StepFioData;
  setData: (data: Partial<StepFioData>) => void;
}
export function StepFio({
  handleBack,
  handleNext,
  data,
  setData,
}: StepFioProps) {
  const isFormValid = () => {
    return data.lastName.trim() !== '' &&
           data.firstName.trim() !== '' &&
           data.middleName.trim() !== '';
  };

  const handleNextClick = () => {
    if (isFormValid()) {
      handleNext(true);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-4">
        <Input
          label="Фамилия"
          id="lastName"
          value={data.lastName}
          onChange={(e) => setData({ lastName: e.target.value })}
          icon={<User size={20} />}
          error={false}
        />
        <Input
          label="Имя"
          id="firstName"
          value={data.firstName}
          onChange={(e) => setData({ firstName: e.target.value })}
          icon={<User size={20} />}
          error={false}
        />
        <Input
          label="Отчество"
          id="middleName"
          value={data.middleName}
          onChange={(e) => setData({ middleName: e.target.value })}
          icon={<User size={20} />}
          error={false}
        />
      </div>
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isFormValid()}
          className={`flex items-center gap-2 px-10 py-3 rounded-[20px] font-nekstmedium transition-all duration-300 shadow-lg text-[18px] ${
            isFormValid()
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-700 hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Далее
        </button>
      </div>
    </div>
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

  const isValidPassword = (password: string) => {
    return password.length >= 8 &&
           /[a-z]/.test(password) &&
           /[A-Z]/.test(password) &&
           /\d/.test(password);
  };

  const isFormValid = () => {
    return password.trim() !== '' &&
           confirm.trim() !== '' &&
           isValidPassword(password) &&
           password === confirm;
  };

  const handleSubmitClick = () => {
    if (isFormValid()) {
      setAllOk(true);
    }
  };

  // Clear errors when user starts typing
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirm(e.target.value);
  };

  return (
    <>
      <Input
        label="Пароль"
        id="password"
        placeholder="••••••••"
        type={showPassword ? 'text' : 'password'}
        icon={<Lock size={20} />}
        value={password}
        onChange={handlePasswordChange}
        error={password.trim() !== '' && !isValidPassword(password)}
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
        onChange={handleConfirmChange}
        error={confirm.trim() !== '' && password !== confirm}
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
      
      {/* Password strength indicator */}
      {password && password.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 mb-2 font-nekstmedium">
            Требования к паролю:
          </p>
          <ul className="text-xs text-blue-600 space-y-1 font-nekstregular">
            <li className={password.length >= 8 ? 'text-green-600' : 'text-blue-600'}>
              ✓ Минимум 8 символов
            </li>
            <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-blue-600'}>
              ✓ Строчная буква
            </li>
            <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-blue-600'}>
              ✓ Заглавная буква
            </li>
            <li className={/\d/.test(password) ? 'text-green-600' : 'text-blue-600'}>
              ✓ Цифра
            </li>
          </ul>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        <button
          type="submit"
          onClick={handleSubmitClick}
          disabled={!isFormValid()}
          className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-nekstmedium transition-all duration-300 shadow-lg text-[18px] ${
            isFormValid()
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-700 hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Зарегистрироваться
        </button>
      </div>
    </>
  );
}

// ФОРМЫ РОЛЕЙ
export function ManagerForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: {
    company: string;
    phone: string;
    region: string;
    about: string;
  };
  setData: (data: any) => void;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const isFormValid = () => {
    return data.company.trim() !== '' &&
           data.phone.trim() !== '' &&
           data.region.trim() !== '';
  };

  const handleNextClick = () => {
    if (isFormValid()) {
      handleNext(true);
    }
  };

  return (
    <>
      <Input
        label="Компания"
        value={data.company}
        onChange={(e) => setData({ ...data, company: e.target.value })}
        id="company_manager"
        icon={<Building size={20} />}
        error={false}
      />
      <Input
        label="Телефон"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        id="phone_manager"
        icon={<Phone size={20} />}
        error={false}
      />
      <Input
        label="Регион"
        value={data.region}
        onChange={(e) => setData({ ...data, region: e.target.value })}
        id="region_manager"
        icon={<MapPin size={20} />}
        error={false}
      />
      <Input
        label="О себе (необязательно)"
        value={data.about}
        onChange={(e) => setData({ ...data, about: e.target.value })}
        id="about_manager"
        icon={<Info size={20} />}
        error={false}
      />
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isFormValid()}
          className={`flex items-center gap-2 px-10 py-3 rounded-[20px] font-nekstmedium transition-all duration-300 shadow-lg text-[18px] ${
            isFormValid()
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-700 hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Далее
        </button>
      </div>
    </>
  );
}

export function CustomerForm(props: {
  data: Step2Data;
  setData: (data: Partial<Step2Data>) => void;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  return <Step2 {...props} role="customer" />;
}

export function DroneSupplierForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: {
    company: string;
    supplyType: string;
    phone: string;
    region: string;
    fleetSize: string;
    experience: string;
    equipment: string;
    notes: string;
  };
  setData: (data: any) => void;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const isFormValid = () => {
    return data.company.trim() !== '' &&
           data.supplyType.trim() !== '' &&
           data.phone.trim() !== '' &&
           data.region.trim() !== '';
  };

  const handleNextClick = () => {
    if (isFormValid()) {
      handleNext(true);
    }
  };

  return (
    <>
      <Input
        label="Компания"
        value={data.company}
        onChange={(e) => setData({ ...data, company: e.target.value })}
        id="company_drone_supplier"
        icon={<Building size={20} />}
        error={false}
      />
      <Input
        label="Телефон"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        id="phone_drone_supplier"
        icon={<Phone size={20} />}
        error={false}
      />
      <Input
        label="Регион"
        value={data.region}
        onChange={(e) => setData({ ...data, region: e.target.value })}
        id="region_drone_supplier"
        icon={<MapPin size={20} />}
        error={false}
      />
      <Input
        label="Тип деятельности (дроны, оборудование, сервис и др.)"
        value={data.supplyType}
        onChange={(e) => setData({ ...data, supplyType: e.target.value })}
        id="supply_type_drone_supplier"
        icon={<Package size={20} />}
        error={false}
      />
      <Input
        label="Размер парка дронов (необязательно)"
        value={data.fleetSize}
        onChange={(e) => setData({ ...data, fleetSize: e.target.value })}
        id="fleet_size_drone_supplier"
        icon={<Info size={20} />}
        error={false}
      />
      <Input
        label="Опыт работы (необязательно)"
        value={data.experience}
        onChange={(e) => setData({ ...data, experience: e.target.value })}
        id="experience_drone_supplier"
        icon={<Info size={20} />}
        error={false}
      />
      <Input
        label="Оборудование (необязательно)"
        value={data.equipment}
        onChange={(e) => setData({ ...data, equipment: e.target.value })}
        id="equipment_drone_supplier"
        icon={<Info size={20} />}
        error={false}
      />
      <Input
        label="Комментарий (необязательно)"
        value={data.notes}
        onChange={(e) => setData({ ...data, notes: e.target.value })}
        id="notes_drone_supplier"
        icon={<Info size={20} />}
        error={false}
      />
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isFormValid()}
          className={`flex items-center gap-2 px-10 py-3 rounded-[20px] font-nekstmedium transition-all duration-300 shadow-lg text-[18px] ${
            isFormValid()
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-700 hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Далее
        </button>
      </div>
    </>
  );
}

export function MaterialSupplierForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: {
    company: string;
    materialType: string;
    phone: string;
    region: string;
    experience: string;
    notes: string;
  };
  setData: (data: any) => void;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const isFormValid = () => {
    return data.company.trim() !== '' &&
           data.materialType.trim() !== '' &&
           data.phone.trim() !== '' &&
           data.region.trim() !== '';
  };

  const handleNextClick = () => {
    if (isFormValid()) {
      handleNext(true);
    }
  };

  return (
    <>
      <Input
        label="Компания"
        value={data.company}
        onChange={(e) => setData({ ...data, company: e.target.value })}
        id="company_material_supplier"
        icon={<Building size={20} />}
        error={false}
      />
      <Input
        label="Телефон"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        id="phone_material_supplier"
        icon={<Phone size={20} />}
        error={false}
      />
      <Input
        label="Регион"
        value={data.region}
        onChange={(e) => setData({ ...data, region: e.target.value })}
        id="region_material_supplier"
        icon={<MapPin size={20} />}
        error={false}
      />
      <Input
        label="Тип материалов"
        value={data.materialType}
        onChange={(e) => setData({ ...data, materialType: e.target.value })}
        id="material_type_material_supplier"
        icon={<Package size={20} />}
        error={false}
      />
      <Input
        label="Опыт работы (необязательно)"
        value={data.experience}
        onChange={(e) => setData({ ...data, experience: e.target.value })}
        id="experience_material_supplier"
        icon={<Info size={20} />}
        error={false}
      />
      <Input
        label="Комментарий (необязательно)"
        value={data.notes}
        onChange={(e) => setData({ ...data, notes: e.target.value })}
        id="notes_material_supplier"
        icon={<Info size={20} />}
        error={false}
      />
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isFormValid()}
          className={`flex items-center gap-2 px-10 py-3 rounded-[20px] font-nekstmedium transition-all duration-300 shadow-lg text-[18px] ${
            isFormValid()
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-700 hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Далее
        </button>
      </div>
    </>
  );
}
