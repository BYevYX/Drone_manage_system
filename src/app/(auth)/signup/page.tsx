'use client';
import { User } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';

import {
  Step1,
  CustomerForm,
  StepFio,
  Step3,
  EmailVerification,
  Step2Data,
  StepFioData,
} from './steps';

// Константа с адресом бэкенда
const API_URL = 'https://droneagro.duckdns.org/v1/auth/register';

export default function MultiStepSignup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<
    'customer' | 'drone_supplier' | 'material_supplier' | 'manager' | ''
  >('');
  // Первый шаг: телефон и email
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // ФИО шаг
  const [fioData, setFioData] = useState<StepFioData>({
    lastName: '',
    firstName: '',
    middleName: '',
  });
  const [fioErrors, setFioErrors] = useState({ lastName: '', firstName: '' });

  // Основные юридические данные (одни и те же для всех ролей)
  const [customerData, setCustomerData] = useState<Step2Data>({
    type: 'COMPANY',
    nameCompany: '',
    inn: '',
    kpp: '',
    okpo: '',
    urAddres: '',
    factAddres: '',
    contactPerson: false,
    contact: {
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '',
      email: '',
    },
  });
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>(
    {},
  );

  // (оставим стейты поставщиков на случай, если UI использует их, но в логике
  // отправки/валидации мы теперь используем customerData)
  const [droneSupplierData, setDroneSupplierData] = useState({
    company: '',
    supplyType: '',
    phone: '',
    region: '',
    fleetSize: '',
    experience: '',
    equipment: '',
    notes: '',
  });
  const [droneErrors, setDroneErrors] = useState<Record<string, string>>({});

  const [materialSupplierData, setMaterialSupplierData] = useState({
    company: '',
    materialType: '',
    phone: '',
    region: '',
    experience: '',
    notes: '',
  });
  const [materialErrors, setMaterialErrors] = useState<Record<string, string>>(
    {},
  );

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- verification state ---
  const [serverMessage, setServerMessage] = useState<string | undefined>();
  const [serverData, setServerData] = useState<any>(undefined);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Helper: безопасный merge для setState (принимает Partial<T> или функцию)
  const mergeState =
    <T,>(setState: React.Dispatch<React.SetStateAction<T>>) =>
    (cbOrObj: Partial<T> | ((prev: T) => T)) =>
      setState((prev) =>
        typeof cbOrObj === 'function'
          ? (cbOrObj as (p: T) => T)(prev)
          : ({ ...prev, ...(cbOrObj as Partial<T>) } as T),
      );

  // --- Helpers for phone formatting ---
  const formatPhoneForDisplay = (raw: string) => {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    if (digits.length === 0) return '';
    const p = digits;
    const cc = p.slice(0, 1); // 7
    const code = p.slice(1, 4);
    const a = p.slice(4, 7);
    const b = p.slice(7, 9);
    const c = p.slice(9, 11);
    if (!code) return `+${cc}`;
    if (!a) return `+${cc} (${code}`;
    if (!b) return `+${cc} (${code}) ${a}`;
    if (!c) return `+${cc} (${code}) ${a}-${b}`;
    return `+${cc} (${code}) ${a}-${b}-${c}`;
  };

  const normalizePhoneForSend = (display: string) => {
    return display.replace(/\D/g, ''); // returns 7495... (11 digits)
  };

  const handlePhoneChange = (value: string, setState: (s: string) => void) => {
    const digits = value.replace(/\D/g, '');
    const display = formatPhoneForDisplay(digits);
    setState(display);
  };

  // --- Validation per step ---
  const validateStep = (s: number) => {
    if (s === 1) {
      let ok = true;
      if (!phone || normalizePhoneForSend(phone).length !== 11) {
        setPhoneError('Заполните корректный номер телефона');
        ok = false;
      } else setPhoneError('');
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        setEmailError('Введите корректный email');
        ok = false;
      } else setEmailError('');
      return ok;
    }

    // Шаг 2: теперь одинаковая валидация для всех ролей (используем customerData)
    if (s === 2) {
      const errs: Record<string, string> = {};
      let ok = true;
      if (!customerData.nameCompany) {
        errs.nameCompany = 'Обязательное поле';
        ok = false;
      }
      if (customerData.type === 'COMPANY' && !customerData.inn) {
        errs.inn = 'Укажите ИНН';
        ok = false;
      }
      // опционально проверим телефон в contact (если указан)
      if (
        customerData.contact?.phone &&
        normalizePhoneForSend(customerData.contact.phone).length !== 11
      ) {
        errs['contact.phone'] = 'Укажите корректный телефон';
        ok = false;
      }
      setCustomerErrors(errs);
      return ok;
    }

    // шаг 3: ФИО (одинаково для всех ролей)
    if (s === 3) {
      const errs = { lastName: '', firstName: '' };
      let ok = true;
      if (!fioData.lastName) {
        errs.lastName = 'Обязательное поле';
        ok = false;
      }
      if (!fioData.firstName) {
        errs.firstName = 'Обязательное поле';
        ok = false;
      }
      setFioErrors(errs);
      return ok;
    }

    // шаг 4: пароль (одинаково)
    if (s === 4) {
      if (!password || password.length < 6) {
        setPasswordError('Пароль минимум 6 символов');
        return false;
      } else setPasswordError('');
      if (password !== confirm) {
        setConfirmError('Пароли не совпадают');
        return false;
      } else setConfirmError('');
      return true;
    }

    // password step is second-to-last (we'll treat final step as verification)
    if (s === getTotalSteps() - 1) {
      if (!password || password.length < 6) {
        setPasswordError('Пароль минимум 6 символов');
        return false;
      } else setPasswordError('');
      if (password !== confirm) {
        setConfirmError('Пароли не совпадают');
        return false;
      } else setConfirmError('');
      return true;
    }

    return true;
  };

  // Теперь все роли — единый поток: 5 шагов (контакт -> роль-форма(юридич) -> ФИО -> пароль -> верификация)
  const getTotalSteps = () => {
    if (!role) return 1;
    return 5;
  };

  const handleNext = () => {
    const total = getTotalSteps();
    if (!validateStep(step)) return;
    if (step < total - 1) {
      setStep((p) => p + 1);
    } else if (step === total - 1) {
      // если следующий — верификация, отправляем регистрацию
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep((p) => (p > 1 ? p - 1 : p));
  };

  // Собираем все данные: теперь для ВСЕХ ролей (customer/manager/drone/material) отправляем payload как у заказчика
  const collectData = () => {
    const base = {
      email,
      phone: normalizePhoneForSend(phone),
      password,
      firstName: fioData.firstName,
      lastName: fioData.lastName,
      surname: fioData.middleName,
    };

    if (role === 'customer' || role === 'manager') {
      return {
        ...base,
        userRole: 'CONTRACTOR',
        contractor: {
          organization: customerData.type,
          organizationName: customerData.nameCompany,
          organizationType:
            customerData.type === 'COMPANY'
              ? 'LEGAL_ENTITY'
              : 'INDIVIDUAL_ENTITY',
          inn: customerData.inn,
          kpp: customerData.kpp,
          okpoCode: customerData.okpo,
          addressUr: customerData.urAddres,
          addressFact: customerData.factAddres,
        },
      };
    }

    if (role === 'drone_supplier') {
      return {
        ...base,
        userRole: 'DRONE_SUPPLIER',
        company: droneSupplierData.company,
        supplyType: droneSupplierData.supplyType,
        phoneSupplier: normalizePhoneForSend(droneSupplierData.phone || ''),
        region: droneSupplierData.region,
        fleetSize: droneSupplierData.fleetSize,
        experience: droneSupplierData.experience,
        equipment: droneSupplierData.equipment,
        notes: droneSupplierData.notes,
      };
    }

    if (role === 'material_supplier') {
      return {
        ...base,
        userRole: 'MATERIAL_SUPPLIER',
        company: materialSupplierData.company,
        materialType: materialSupplierData.materialType,
        phoneSupplier: normalizePhoneForSend(materialSupplierData.phone || ''),
        region: materialSupplierData.region,
        experience: materialSupplierData.experience,
        notes: materialSupplierData.notes,
      };
    }

    return base;
  };

  // регистрация -> после успеха переходим на шаг верификации
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const total = getTotalSteps();
    if (!validateStep(step)) return;

    setLoading(true);

    try {
      const dataToSend = collectData();

      // Отправляем на сервер
      const res = await axios.post(API_URL, dataToSend);

      // сохраняем сообщение/дату от бэка и переходим к верификации
      setServerMessage(res.data?.message || 'Код отправлен на почту');
      setServerData(res.data || null);

      // move to verification step (last)
      const totalSteps = getTotalSteps();
      setStep(totalSteps);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setServerMessage(err.response.data.message);
      } else {
        setServerMessage(
          'Ошибка при регистрации: ' + (err.message || 'unknown'),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // verification endpoints (assume auth base = API_URL.replace('/register',''))
  const AUTH_BASE = API_URL.replace('/register', '');

  const handleVerify = async () => {
    if (!verificationCode) {
      setVerificationError('Введите код');
      return;
    }
    setVerificationError('');
    setIsVerifying(true);
    try {
      // GET /v1/auth/verify?code=123
      const url = `https://droneagro.duckdns.org/v1/verification?code=${verificationCode}`;
      const res = await axios.get(url);
      alert(res.data?.message || 'Почта подтверждена!');
      window.location.href = '/login';
    } catch (err: any) {
      if (err.response?.data?.message)
        setVerificationError(err.response.data.message);
      else setVerificationError('Ошибка проверки кода');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      // POST /v1/auth/resend with email
      const url = `${AUTH_BASE}/resend`;
      const res = await axios.post(url, { email });
      setServerMessage(res.data?.message || 'Код повторно отправлен');
      setServerData(res.data || null);
    } catch (err: any) {
      setServerMessage(
        err?.response?.data?.message || 'Ошибка при повторной отправке',
      );
    } finally {
      setIsResending(false);
    }
  };

  // Render dynamic step
  const renderStep = () => {
    const total = getTotalSteps();

    // Step 1
    if (step === 1) {
      return (
        <Step1
          phone={phone}
          setPhone={(val: string) => handlePhoneChange(val, setPhone)}
          phoneError={phoneError}
          email={email}
          setEmail={setEmail}
          emailError={emailError}
          role={role}
          setRole={setRole}
        />
      );
    }

    // Step 2: теперь для всех ролей используем CustomerForm (одинаковые поля)
    if (
      step === 2 &&
      (role === 'customer' ||
        role === 'manager' ||
        role === 'drone_supplier' ||
        role === 'material_supplier')
    ) {
      return (
        <CustomerForm
          data={customerData}
          setData={mergeState(setCustomerData)}
          errors={customerErrors}
        />
      );
    }

    // Step 3: ФИО
    if (
      step === 3 &&
      (role === 'customer' ||
        role === 'manager' ||
        role === 'drone_supplier' ||
        role === 'material_supplier')
    ) {
      return <StepFio data={fioData} setData={setFioData} errors={fioErrors} />;
    }

    // Step 4: пароль
    if (
      step === 4 &&
      (role === 'customer' ||
        role === 'manager' ||
        role === 'drone_supplier' ||
        role === 'material_supplier')
    ) {
      return (
        <Step3
          password={password}
          setPassword={setPassword}
          confirm={confirm}
          setConfirm={setConfirm}
          passwordError={passwordError}
          confirmError={confirmError}
          serverMessage={serverMessage}
        />
      );
    }

    // Step 5: верификация
    if (
      step === 5 &&
      (role === 'customer' ||
        role === 'manager' ||
        role === 'drone_supplier' ||
        role === 'material_supplier')
    ) {
      return (
        <EmailVerification
          serverMessage={serverMessage}
          serverData={serverData}
          code={verificationCode}
          setCode={setVerificationCode}
          codeError={verificationError}
          onVerify={handleVerify}
          onResend={handleResend}
          isVerifying={isVerifying}
        />
      );
    }

    return null;
  };

  const totalSteps = getTotalSteps();

  // header text
  const headerText =
    step === totalSteps
      ? 'Подтверждение почты'
      : step === totalSteps - 1
        ? 'Пароль и подтверждение'
        : step === 3
          ? 'Личные данные'
          : 'Основная информация';

  return (
    <div className="w-full lg:w-1/2 rounded-2xl p-8">
      <h2 className="text-[28px] font-nekstmedium text-black mb-6 flex items-center gap-2">
        <User size={28} className="text-green-600" />
        {headerText}
      </h2>

      <form
        onSubmit={(e) => e.preventDefault()}
        noValidate
        className="space-y-6"
      >
        {renderStep()}

        {loading && (
          <div className="text-center text-green-700 font-nekstmedium">
            Отправка...
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          {/* Back button only when step > 1 */}
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-black font-nekstmedium hover:bg-gray-100 transition"
            >
              Назад
            </button>
          ) : (
            <div />
          )}

          {/* Right-side controls */}
          {step < totalSteps - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-700 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
            >
              Далее
            </button>
          )}

          {step === totalSteps - 1 && (
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-nekstmedium hover:from-indigo-600 hover:to-blue-700 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
            >
              Зарегистрироваться
            </button>
          )}

          {step === totalSteps && <div />}
        </div>
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
  );
}
