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
import {
  validatePhone,
  validateEmail,
  validateINN,
  validateKPP,
  validateOKPO,
  validateName,
  validateCompanyName,
  validatePassword,
  validatePasswordConfirm,
  formatPhoneDisplay,
  normalizePhone,
} from '../utils/validation';

// Константа с адресом бэкенда
const API_URL = 'https://droneagro.duckdns.org/api/auth/register';

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

  const handlePhoneChange = (value: string, setState: (s: string) => void) => {
    const digits = value.replace(/\D/g, '');
    const display = formatPhoneDisplay(digits);
    setState(display);
  };

  // --- Validation per step ---
  const validateStep = (s: number) => {
    if (s === 1) {
      let ok = true;

      // Валидация телефона
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || 'Некорректный телефон');
        ok = false;
      } else {
        setPhoneError('');
      }

      // Валидация email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Некорректный email');
        ok = false;
      } else {
        setEmailError('');
      }

      return ok;
    }

    // Шаг 2: валидация юридических данных
    if (s === 2) {
      const errs: Record<string, string> = {};
      let ok = true;

      // Валидация названия компании
      const companyValidation = validateCompanyName(customerData.nameCompany);
      if (!companyValidation.isValid) {
        errs.nameCompany = companyValidation.error || 'Обязательное поле';
        ok = false;
      }

      // Валидация ИНН
      const innValidation = validateINN(customerData.inn, customerData.type);
      if (!innValidation.isValid) {
        errs.inn = innValidation.error || 'Некорректный ИНН';
        ok = false;
      }

      // Валидация КПП (если заполнено)
      if (customerData.kpp) {
        const kppValidation = validateKPP(customerData.kpp);
        if (!kppValidation.isValid) {
          errs.kpp = kppValidation.error || 'Некорректный КПП';
          ok = false;
        }
      }

      // Валидация ОКПО (если заполнено)
      if (customerData.okpo) {
        const okpoValidation = validateOKPO(customerData.okpo);
        if (!okpoValidation.isValid) {
          errs.okpo = okpoValidation.error || 'Некорректный ОКПО';
          ok = false;
        }
      }

      // Валидация контактного лица (если указан)
      if (customerData.contactPerson) {
        if (customerData.contact.phone) {
          const contactPhoneValidation = validatePhone(
            customerData.contact.phone,
          );
          if (!contactPhoneValidation.isValid) {
            errs['contact.phone'] =
              contactPhoneValidation.error || 'Некорректный телефон';
            ok = false;
          }
        }

        if (customerData.contact.email) {
          const contactEmailValidation = validateEmail(
            customerData.contact.email,
          );
          if (!contactEmailValidation.isValid) {
            errs['contact.email'] =
              contactEmailValidation.error || 'Некорректный email';
            ok = false;
          }
        }

        if (customerData.contact.lastName) {
          const lastNameValidation = validateName(
            customerData.contact.lastName,
            'Фамилия',
          );
          if (!lastNameValidation.isValid) {
            errs['contact.lastName'] =
              lastNameValidation.error || 'Некорректная фамилия';
            ok = false;
          }
        }

        if (customerData.contact.firstName) {
          const firstNameValidation = validateName(
            customerData.contact.firstName,
            'Имя',
          );
          if (!firstNameValidation.isValid) {
            errs['contact.firstName'] =
              firstNameValidation.error || 'Некорректное имя';
            ok = false;
          }
        }
      }

      setCustomerErrors(errs);
      return ok;
    }

    // шаг 3: ФИО
    if (s === 3) {
      const errs = { lastName: '', firstName: '' };
      let ok = true;

      const lastNameValidation = validateName(fioData.lastName, 'Фамилия');
      if (!lastNameValidation.isValid) {
        errs.lastName = lastNameValidation.error || 'Обязательное поле';
        ok = false;
      }

      const firstNameValidation = validateName(fioData.firstName, 'Имя');
      if (!firstNameValidation.isValid) {
        errs.firstName = firstNameValidation.error || 'Обязательное поле';
        ok = false;
      }

      setFioErrors(errs);
      return ok;
    }

    // шаг 4: пароль
    if (s === 4) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error || 'Некорректный пароль');
        return false;
      }
      setPasswordError('');

      const confirmValidation = validatePasswordConfirm(password, confirm);
      if (!confirmValidation.isValid) {
        setConfirmError(confirmValidation.error || 'Пароли не совпадают');
        return false;
      }
      setConfirmError('');

      return true;
    }

    // password step is second-to-last
    if (s === getTotalSteps() - 1) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error || 'Некорректный пароль');
        return false;
      }
      setPasswordError('');

      const confirmValidation = validatePasswordConfirm(password, confirm);
      if (!confirmValidation.isValid) {
        setConfirmError(confirmValidation.error || 'Пароли не совпадают');
        return false;
      }
      setConfirmError('');

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
      phone: normalizePhone(phone),
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
        phoneSupplier: normalizePhone(droneSupplierData.phone || ''),
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
        phoneSupplier: normalizePhone(materialSupplierData.phone || ''),
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
        const errorMessage = err.response.data.message;
        if (errorMessage === 'such phone or email is already registered') {
          setServerMessage('Такой телефон или email уже зарегистрирован');
        } else {
          setServerMessage(errorMessage);
        }
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
      // GET /api/auth/verify?code=123
      const url = `https://droneagro.duckdns.org/api/verification?code=${verificationCode}`;
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
      // POST /api/auth/resend with email
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
              className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-700 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
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
