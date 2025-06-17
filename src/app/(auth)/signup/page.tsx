'use client';
import { User } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';

import {
  Step1,
  Step2,
  StepFio,
  Step3,
  Step2Data,
  StepFioData,
  ManagerForm,
  CustomerForm,
  DroneSupplierForm,
  MaterialSupplierForm,
} from './steps';

// Константа с адресом бэкенда
const API_URL = 'https://d70kaz-185-42-163-77.ru.tuna.am/v1/auth/register';

export default function MultiStepSignup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [allOk, setAllOk] = useState(false);

  // Первый шаг: телефон и email
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // ФИО шаг
  const [fioData, setFioData] = useState<StepFioData>({
    lastName: '',
    firstName: '',
    middleName: '',
  });

  // Для менеджеров
  const [managerData, setManagerData] = useState({
    company: '',
    phone: '',
    region: '',
    about: '',
  });

  // Для заказчиков услуг
  const [customerData, setCustomerData] = useState<Step2Data>({
    type: 'COMPANY', // <--- ENUM (COMPANY | INDIVIDUAL) по OpenAPI!
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

  // Для поставщиков дронов и оборудования
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

  // Для поставщиков материалов
  const [materialSupplierData, setMaterialSupplierData] = useState({
    company: '',
    materialType: '',
    phone: '',
    region: '',
    experience: '',
    notes: '',
  });

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = (isValid: boolean) => {
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Собираем все данные для отправки
  const collectData = () => {
    let profileData = {};
    let user_role = '';
    switch (role) {
      case 'manager':
        user_role = 'MANAGER';
        profileData = {
          user_role,
          email,
          phone,
          password,
          first_name: fioData.firstName,
          last_name: fioData.lastName,
          surname: fioData.middleName,
          ...managerData,
        };
        break;
      case 'customer':
        user_role = 'CONTRACTOR';
        profileData = {
          user_role,
          email,
          phone,
          password,
          first_name: fioData.firstName,
          last_name: fioData.lastName,
          surname: fioData.middleName,
          contractor: {
            organization: customerData.type, // ENUM (COMPANY | INDIVIDUAL)
            organization_name: customerData.nameCompany,
            organization_type:
              customerData.type === 'COMPANY'
                ? 'LEGAL_ENTITY'
                : 'INDIVIDUAL_ENTITY', // ENUM (LEGAL_ENTITY | INDIVIDUAL_ENTITY)
            inn: customerData.inn,
            kpp: customerData.kpp,
            okpo_code: customerData.okpo,
            address_ur: customerData.urAddres,
            address_fact: customerData.factAddres,
          },
        };
        break;
      case 'drone_supplier':
        user_role = 'DRONE_SUPPLIER';
        profileData = {
          user_role,
          email,
          phone,
          password,
          first_name: fioData.firstName,
          last_name: fioData.lastName,
          surname: fioData.middleName,
          ...droneSupplierData,
        };
        break;
      case 'material_supplier':
        user_role = 'MATERIAL_SUPPLIER';
        profileData = {
          user_role,
          email,
          phone,
          password,
          first_name: fioData.firstName,
          last_name: fioData.lastName,
          surname: fioData.middleName,
          ...materialSupplierData,
        };
        break;
      default:
        user_role = '';
        profileData = {};
    }
    return profileData;
  };

  // Выбираем нужную форму
  let Step2Component = null;
  if (role === 'manager') {
    Step2Component = (
      <ManagerForm
        data={managerData}
        setData={setManagerData}
        handleNext={handleNext}
        handleBack={handleBack}
      />
    );
  } else if (role === 'customer') {
    Step2Component = (
      <CustomerForm
        data={customerData}
        setData={(cbOrObj) => {
          // поддержка как fn, так и object (для совместимости)
          setCustomerData((prev) =>
            typeof cbOrObj === 'function'
              ? cbOrObj(prev)
              : { ...prev, ...cbOrObj },
          );
        }}
        handleNext={handleNext}
        handleBack={handleBack}
      />
    );
  } else if (role === 'drone_supplier') {
    Step2Component = (
      <DroneSupplierForm
        data={droneSupplierData}
        setData={(cbOrObj) => {
          setDroneSupplierData((prev) =>
            typeof cbOrObj === 'function'
              ? cbOrObj(prev)
              : { ...prev, ...cbOrObj },
          );
        }}
        handleNext={handleNext}
        handleBack={handleBack}
      />
    );
  } else if (role === 'material_supplier') {
    Step2Component = (
      <MaterialSupplierForm
        data={materialSupplierData}
        setData={(cbOrObj) => {
          setMaterialSupplierData((prev) =>
            typeof cbOrObj === 'function'
              ? cbOrObj(prev)
              : { ...prev, ...cbOrObj },
          );
        }}
        handleNext={handleNext}
        handleBack={handleBack}
      />
    );
  }

  const steps = [
    <Step1
      handleNext={handleNext}
      role={role}
      setRole={setRole}
      phone={phone}
      setPhone={setPhone}
      email={email}
      setEmail={setEmail}
      key="step 1"
    />,
    Step2Component,
    <StepFio
      handleBack={handleBack}
      handleNext={handleNext}
      data={fioData}
      setData={setFioData}
      key="stepFio"
    />,
    <Step3
      handleBack={handleBack}
      password={password}
      setPassword={setPassword}
      confirm={confirm}
      setConfirm={setConfirm}
      setAllOk={setAllOk}
      key="step 3"
    />,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (allOk && step === steps.length) {
      setLoading(true);
      try {
        const dataToSend = collectData();
        const res = await axios.post(API_URL, dataToSend);
        alert(res.data.message || 'Регистрация успешна!');
        // TODO: перенаправить/очистить/что-то ещё
      } catch (err: any) {
        if (err.response?.data?.message) {
          alert('Ошибка при регистрации: ' + err.response.data.message);
        } else {
          alert('Ошибка при регистрации: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full lg:w-1/2 rounded-2xl p-8">
      <h2 className="text-[28px] font-nekstmedium text-black mb-6 flex items-center gap-2">
        <User size={28} className="text-green-600" />
        {step === steps.length
          ? 'Пароль и подтверждение'
          : step === 3
            ? 'Личные данные'
            : 'Основная информация'}
      </h2>
      <form
        onSubmit={step === 1 ? (e) => e.preventDefault() : handleSubmit}
        noValidate
        className="space-y-6"
      >
        {steps[step - 1]}
        {loading && (
          <div className="text-center text-green-700 font-nekstmedium">
            Отправка...
          </div>
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
  );
}
