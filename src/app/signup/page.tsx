'use client';
import React, { useState } from 'react';
import Header from '@/src/shared/ui/Header';

export default function Page() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="wrapper">
      <div className="relative bg-[url(/pages/main/drone_7.jpg)] bg-cover h-[100vh] bg-gray-100">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[15px]"></div>
        <Header></Header>

        <div className="flex items-center justify-center h-[calc(100vh-64px)] relative z-10">
          <div className="w-full max-w-lg bg-[#686767]/60 backdrop-blur-[100px] rounded-2xl shadow-lg p-8">
            <h2 className="text-[36px] mb-6 font-nekstmedium text-start text-white">
              {step === 1 ? 'Основная информация' : 'Безопасность'}
            </h2>

            <form className="space-y-6">
              {step === 1 && (
                <>
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-nekstlight text-white"
                    >
                      Имя
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="mt-1 w-full bg-black/0 border-b border-gray-300 px-2 py-2 text-[18px] text-white font-nekstmedium focus:border-gray-500 focus:ring-0"
                      placeholder="Иван"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-nekstlight text-white"
                    >
                      Фамилия
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="mt-1 w-full bg-black/0 border-b border-gray-300 px-2 py-2 text-[18px] text-white font-nekstmedium focus:border-gray-500 focus:ring-0"
                      placeholder="Иванов"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-nekstlight text-white"
                    >
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="mt-1 w-full bg-black/0 border-b border-gray-300 px-2 py-2 text-[18px] text-white font-nekstmedium focus:border-gray-500 focus:ring-0"
                      placeholder="+7 999 999-99-99"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="rounded-[20px] bg-[#2c2c2c] text-white py-[8px] px-[40px] font-nekstmedium text-[18px] hover:bg-[#343434] transition hover:scale-[1.05] duration-[0.3s]"
                    >
                      Далее
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-nekstlight text-white"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 w-full bg-black/0 border-b border-gray-300 px-2 py-2 text-[18px] text-white font-nekstmedium focus:border-gray-500 focus:ring-0"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-nekstlight text-white"
                    >
                      Пароль
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="mt-1 w-full bg-black/0 border-b border-gray-300 px-2 py-2 text-[18px] text-white font-nekstmedium focus:border-gray-500 focus:ring-0"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-nekstlight text-white"
                    >
                      Подтвердите пароль
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="mt-1 w-full bg-black/0 border-b border-gray-300 px-2 py-2 text-[18px] text-white font-nekstmedium focus:border-gray-500 focus:ring-0"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="flex justify-between mt-6  h-[45px]">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="rounded-[20px] bg-transparent border border-white/40 text-white py-[0px] px-[40px] font-nekstmedium text-[18px] hover:bg-white/10 transition duration-[0.3s] hover:scale-[1.05]"
                    >
                      Назад
                    </button>

                    <button
                      type="submit"
                      className="rounded-[20px] bg-[#2c2c2c] text-white py-[0px] px-6 font-nekstmedium text-[18px] hover:bg-[#343434] transition duration-[0.3s] hover:scale-[1.05]"
                    >
                      Зарегистрироваться
                    </button>
                  </div>
                </>
              )}
            </form>

            {step === 1 && (
              <div className="mt-[16px]">
                <p className="font-nekstmedium text-white text-[16px] mb-3">
                  Уже есть аккаунт?
                </p>
                <button
                  type="button"
                  className="w-full rounded-[20px] bg-transparent border border-white/30 text-white py-[8px] text-[18px] font-nekstmedium hover:bg-white/10 transition duration-[0.3s] hover:scale-[1.05]"
                >
                  Войти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
