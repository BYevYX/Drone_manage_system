'use client';

import Header from '@/src/shared/ui/Header';
import Image from 'next/image';
import React, { useState } from 'react';

export default function Page() {
  const items = ['Компания', 'Инд. предприниматель', 'Физ лицо'];
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState(1); // Шаг формы
  const [activeTab, setActiveTab] = useState(0);
  const [inputFields, setInputFields] = useState({
    agentType: '',
    relationshipType: '',
    inn: '',
    kpp: '',
    OKPO: '',
    secretName: '',
    email: '',
    phoneNumber: '',
    error: '',
    mainManager: 'Мальцева Светлана Валентиновна',
    contactFace: {
      firstName: '',
      lastName: '',
      surname: '',
      phoneNumber: '',
      email: '',
      telegram: '',
    },
  });

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  return (
    <div className="wrapper bg-[#0D0D0D]">
      <Header></Header>
      <div className="min-h-[calc(100vh-64px)] flex  text-white">
        {/* Sidebar */}
        <aside className="w-1/5 bg-[#1e1e1e]  rounded-r-2xl shadow-lg">
          <h2 className="text-xl font-semibold font-nekstlight p-5">Меню</h2>
          <div className="w-full min-h-[50px]  flex flex-wrap space-y-[10px]  mt-[10px]">
            <button
              className={`w-[95%] h-[45px] ${activeTab === 0 ? 'bg-purple-600 hover:bg-purple-700 ' : 'bg-[#2b2b2b] hover:bg-[#3a3a3a]'}  rounded-r-[15px] font-nekstmedium text-[18px] flex items-center justify-center duration-[0.3s] `}
              onClick={() => setActiveTab(0)}
            >
              Регистрация контрагента
            </button>
            <button
              className={`w-[95%] h-[45px] ${activeTab === 1 ? 'bg-purple-500 hover:bg-purple-700 ' : 'bg-[#2b2b2b] hover:bg-[#3a3a3a]'}  rounded-r-[15px] font-nekstmedium text-[18px] flex items-center justify-center duration-[0.3s] `}
              onClick={() => setActiveTab(1)}
            >
              Дроны
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10  ">
          <h1 className="text-2xl font-bold">
            Помощник регистрации контрагента
          </h1>
          <p className="text-gray-400 mt-2">
            Укажите доступную информацию о контрагенте
          </p>

          <form className="mt-6 bg-[#3838386c] p-6 rounded-2xl shadow-md backdrop-blur-[1px]">
            {inputFields.error && (
              <p className={`text-[14px] pl-[10px] text-red-500 mb-[5px]`}>
                {inputFields.error}
              </p>
            )}
            {/* Step 1: First Fields */}
            {step === 1 && (
              <div>
                <div className="flex gap-4">
                  {items.map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="item"
                        value={item}
                        checked={inputFields.agentType === item}
                        onChange={() =>
                          setInputFields((prev) => ({
                            ...prev,
                            agentType: item,
                          }))
                        }
                        className="hidden"
                      />
                      <span
                        className={`px-4 py-2 rounded-full border transition-all ${inputFields.agentType === item ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}
                      >
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <input
                    type="text"
                    placeholder="ИНН"
                    className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                    value={inputFields.inn}
                    onChange={(e) =>
                      setInputFields((prev) => ({
                        ...prev,
                        inn: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="КПП"
                    className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                    value={inputFields.kpp}
                    onChange={(e) =>
                      setInputFields((prev) => ({
                        ...prev,
                        kpp: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Код по ОКПО"
                    className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                    value={inputFields.OKPO}
                    onChange={(e) =>
                      setInputFields((prev) => ({
                        ...prev,
                        OKPO: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Секретное наименование"
                    className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                    value={inputFields.secretName}
                    onChange={(e) =>
                      setInputFields((prev) => ({
                        ...prev,
                        secretName: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="email"
                    placeholder="E-mail"
                    className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                    value={inputFields.email}
                    onChange={(e) =>
                      setInputFields((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Телефон"
                    className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                    value={inputFields.phoneNumber}
                    onChange={(e) =>
                      setInputFields((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mt-6 p-4 border border-gray-700 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => setEnabled(!enabled)}
                    />
                    <span className="text-[14px]">
                      Указать данные контактного лица (будет создано контактное
                      лицо контрагента)
                    </span>
                  </label>

                  {enabled && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <input
                        type="text"
                        placeholder="Фамилия"
                        value={inputFields.contactFace.lastName}
                        onChange={(e) =>
                          setInputFields((prev) => ({
                            ...prev,
                            contactFace: {
                              ...prev.contactFace,
                              lastName: e.target.value,
                            },
                          }))
                        }
                        className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                      />
                      <input
                        type="number"
                        placeholder="Телефон"
                        value={inputFields.contactFace.phoneNumber}
                        onChange={(e) =>
                          setInputFields((prev) => ({
                            ...prev,
                            contactFace: {
                              ...prev.contactFace,
                              phoneNumber: e.target.value,
                            },
                          }))
                        }
                        className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                      />
                      <input
                        type="text"
                        placeholder="Имя"
                        value={inputFields.contactFace.firstName}
                        onChange={(e) =>
                          setInputFields((prev) => ({
                            ...prev,
                            contactFace: {
                              ...prev.contactFace,
                              firstName: e.target.value,
                            },
                          }))
                        }
                        className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                      />
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={inputFields.contactFace.email}
                        onChange={(e) =>
                          setInputFields((prev) => ({
                            ...prev,
                            contactFace: {
                              ...prev.contactFace,
                              email: e.target.value,
                            },
                          }))
                        }
                        className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                      />
                      <input
                        type="text"
                        placeholder="Отчество"
                        value={inputFields.contactFace.surname}
                        onChange={(e) =>
                          setInputFields((prev) => ({
                            ...prev,
                            contactFace: {
                              ...prev.contactFace,
                              surname: e.target.value,
                            },
                          }))
                        }
                        className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                      />
                      <input
                        type="number"
                        placeholder="Телеграм"
                        value={inputFields.contactFace.telegram}
                        onChange={(e) =>
                          setInputFields((prev) => ({
                            ...prev,
                            contactFace: {
                              ...prev.contactFace,
                              telegram: e.target.value,
                            },
                          }))
                        }
                        className="input-field border-[1px] border-solid border-[#414141] h-[35px] rounded-[20px] focus:border-[#959595] duration-[0.3s] px-[10px] "
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="p-4  rounded-lg ">
                <p className="text-[20px] mb-[10px]">
                  Укажите прочие доступные сведения о контрагенте{' '}
                  {inputFields.secretName}
                </p>
                <div className="w-full h-full border border-gray-700 rounded-lg p-[20px]">
                  <div className="flex w-full items-center">
                    <p className="pl-[0px] text-[14px] w-[200px]">
                      Основной менеджер
                    </p>
                    <div className="flex flex-wrap w-full">
                      <div className="w-[35%] h-[35px] border-[1px] border-solid border-[#414141] rounded-[15px] flex items-center group relative">
                        <div className="w-[90%] pl-[10px] text-[14px]">
                          {inputFields.mainManager}
                        </div>
                        <div className="w-[10%]">
                          <Image
                            alt="arrow"
                            width={20}
                            height={20}
                            src="/pages/registration/arrow.svg"
                            className="invert duration-[0.3s] group-hover:rotate-[180deg] "
                          ></Image>
                        </div>
                        <div className="absolute bg-[#3b3b3b] w-full min-h-[50px] p-[5px] top-[35px] left-0 rounded-[10px] opacity-0 flex-wrap items-center group-hover:opacity-100 scale-y-[50%] group-hover:scale-[100%] origin-top duration-[0.3s] pointer-events-none group-hover:pointer-events-auto">
                          <button
                            type="button"
                            className="w-full flex items-center h-[50px] hover:bg-[#626262] rounded-[5px]"
                          >
                            Мальцева Светлана Валентиновна
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-[20px]">
                    <div className="flex items-center">
                      {' '}
                      <p className="text-[16px] mr-[20px]">Тип отношений:</p>
                      <div className="flex gap-4">
                        {[
                          'Клиент',
                          'Поставщик',
                          'Прочие отношения',
                          'Перевозчик',
                        ].map((item, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="item"
                              value={item}
                              checked={inputFields.relationshipType === item}
                              onChange={() =>
                                setInputFields((prev) => ({
                                  ...prev,
                                  relationshipType: item,
                                }))
                              }
                              className="hidden"
                            />
                            <span
                              className={`px-4 py-2 rounded-full border transition-all ${inputFields.relationshipType === item ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}
                            >
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* {<div className="w-full mt-[20px]">
              <p>Контактное лицо:</p>
              <div className="w-full flex space-x-[10px]">
                <p>Имя:</p>
                <div>{inputFields.contactFace.firstName}</div>
              </div>
            </div>} */}
            {step === 3 && (
              <div className="p-4  rounded-lg ">
                <p className="text-[20px] mb-[10px]">Проверьте все данные:</p>
                <div className="w-full h-full border border-gray-700 rounded-lg p-[20px]">
                  <div className="flex items-center w-full h-full">
                    <div className="flex-1">
                      <div className="w-full flex space-x-[10px]">
                        <p>Основной менеджер:</p>
                        <div>{inputFields.mainManager}</div>
                      </div>
                      <div className="w-full flex space-x-[10px]">
                        <p>Тип контрагента:</p>
                        <div>{inputFields.agentType}</div>
                      </div>
                      <div className="w-full flex space-x-[10px]">
                        <p>Тип отношений:</p>
                        <div>{inputFields.relationshipType}</div>
                      </div>
                      <div className="w-full flex space-x-[10px]">
                        <p>ИНН:</p>
                        <div>{inputFields.inn}</div>
                      </div>
                      <div className="w-full flex space-x-[10px]">
                        <p>КПП:</p>
                        <div>{inputFields.kpp}</div>
                      </div>
                      <div className="w-full flex space-x-[10px]">
                        <p>Секретное наименование</p>
                        <div>{inputFields.secretName}</div>
                      </div>
                      <div className="w-full flex space-x-[10px]">
                        <p>Код по ОКПО:</p>
                        <div>{inputFields.OKPO}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full flex space-x-[10px]">
                        <p>E-mail:</p>
                        <div>{inputFields.email}</div>
                      </div>
                      <div className="w-full flex space-x-[10px]">
                        <p>Phone number:</p>
                        <div>{inputFields.phoneNumber}</div>
                      </div>
                    </div>
                  </div>
                  {enabled && (
                    <div className="w-full mt-[20px]">
                      <p className="text-[20px] mb-[7px]">Контактное лицо:</p>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="w-full flex space-x-[10px]">
                            <p>Имя:</p>
                            <div>{inputFields.contactFace.firstName}</div>
                          </div>
                          <div className="w-full flex space-x-[10px]">
                            <p>Фамилия:</p>
                            <div>{inputFields.contactFace.lastName}</div>
                          </div>
                          <div className="w-full flex space-x-[10px]">
                            <p>Отчество:</p>
                            <div>{inputFields.contactFace.surname}</div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="w-full flex space-x-[10px]">
                            <p>Телефон:</p>
                            <div>{inputFields.contactFace.phoneNumber}</div>
                          </div>
                          <div className="w-full flex space-x-[10px]">
                            <p>E-mail:</p>
                            <div>{inputFields.contactFace.email}</div>
                          </div>
                          <div className="w-full flex space-x-[10px]">
                            <p>Telegram:</p>
                            <div>{inputFields.contactFace.telegram}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              {step >= 2 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-3 px-8 rounded-xl bg-gray-600 hover:bg-gray-500 transition"
                >
                  Назад
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (step === 3) {
                    return;
                  }
                  if (!inputFields.agentType) {
                    setInputFields((prev) => ({
                      ...prev,
                      error: 'Укажите тип контрагента',
                    }));
                  } else if (
                    !inputFields.inn ||
                    !inputFields.kpp ||
                    !inputFields.secretName ||
                    !inputFields.OKPO ||
                    !inputFields.phoneNumber ||
                    !inputFields.email
                  ) {
                    setInputFields((prev) => ({
                      ...prev,
                      error: 'Заполните все поля',
                    }));
                  } else if (
                    enabled &&
                    (!inputFields.contactFace.lastName ||
                      !inputFields.contactFace.firstName ||
                      !inputFields.contactFace.email ||
                      !inputFields.contactFace.phoneNumber ||
                      !inputFields.contactFace.surname ||
                      !inputFields.contactFace.telegram)
                  ) {
                    setInputFields((prev) => ({
                      ...prev,
                      error: 'Заполните все поля контактного лица',
                    }));
                  } else {
                    setInputFields((prev) => ({
                      ...prev,
                      error: '',
                    }));
                    nextStep();
                  }
                }}
                className="py-[10px] px-8 rounded-xl bg-purple-500 hover:bg-purple-400 transition"
              >
                {step === 3 ? 'Завершить' : 'Далее'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
