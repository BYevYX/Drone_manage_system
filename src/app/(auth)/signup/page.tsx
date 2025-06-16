'use client';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Step2Data } from './Components';
import { Step1, Step2, Step3 } from './steps';

export default function MultiStepSignup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [allOk, setAllOk] = useState(false);

  // Поля формы
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [innData, setInnData] = useState<Step2Data>({
    type: 'company',
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

  const router = useRouter();

  useEffect(() => {
    router.push(`?signupStep=${step}`);
  }, [router, step]);

  const handleNext = (isValid: boolean) => {
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const steps = [
    <Step1
      handleNext={handleNext}
      role={role}
      setRole={setRole}
      email={email}
      setEmail={setEmail}
      name={name}
      setName={setName}
      key="step 1"
    />,
    <Step2
      data={innData}
      setData={(newData: Partial<Step2Data>) =>
        setInnData((prev) => ({ ...prev, ...newData }))
      }
      handleNext={handleNext}
      handleBack={handleBack}
      role={role}
      key="step 2"
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (allOk && step === steps.length) {
      alert('Регистрация успешна!');
      // TODO: отправить данные на сервер
    }
  };

  return (
    <>
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
          {steps[step - 1]}
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
    </>
  );
}
