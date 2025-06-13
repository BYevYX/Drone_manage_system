'use client';
import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  FileText,
  MapPin,
  Clock,
  Check,
  X,
  ChevronRight,
  BookOpen,
  Award,
  HelpCircle,
} from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

export default function DronePermissionsInfo() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Анимация заполнения линии прогресса
    const timer = setTimeout(() => setProgress(100), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="wrapper">
      <Header />

      <div className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-white bg-[url(/pages/main/drone_15.jpg)] bg-cover bg-center ">
        <div
          className="absolute inset-0 bg-[url(/pages/main/drone_16.jpg)] bg-cover bg-center"
          style={{ filter: 'blur(8px)' }}
        ></div>
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[50px]"></div>

        <div className="z-5 relative">
          {/* Hero with gradient */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4 font-nekstregular">
              <ShieldCheck className="mr-2" size={16} />
              Юридическая поддержка
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 ">
              Легальные полёты агродронов
            </h1>
            <p className="text-xl text-gray-600 font-nekstregular">
              Полный цикл оформления документов и разрешений для сельхозработ
            </p>
          </div>

          {/* Key benefits */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 ">
            <BenefitCard
              icon={<FileText className="text-blue-500 " size={24} />}
              title="Документы"
              items={[
                'Регистрация в реестре БАС',
                'Страхование ответственности',
                'Программа контроля полётов',
              ]}
            />
            <BenefitCard
              icon={<Award className="text-green-500" size={24} />}
              title="Сертификаты"
              items={[
                'Эксплуатанта БАС',
                'Пилотские удостоверения',
                'На оборудование DJI/XAG',
              ]}
            />
            <BenefitCard
              icon={<HelpCircle className="text-purple-500" size={24} />}
              title="Поддержка"
              items={[
                'Консультации юристов',
                'Обновления законодательства',
                'Сопровождение проверок',
              ]}
            />
          </div>

          {/* Visual process flow */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Процесс получения разрешений
            </h2>
            <div className="relative">
              <div className="grid grid-cols-1  lg:grid-cols-3 gap-8 pt-[5px] lg:gap-16">
                <ProcessStep
                  number="1"
                  icon={<BookOpen className="text-blue-500" size={20} />}
                  title="Анализ"
                  description="Изучаем местоположение полей и зоны ограничений"
                  time="1-2 дня"
                />
                <ProcessStep
                  number="2"
                  icon={<FileText className="text-green-500" size={20} />}
                  title="Документы"
                  description="Подготавливаем заявку в ОРВД и NOTAM"
                  time="3-5 дней"
                />
                <ProcessStep
                  number="3"
                  icon={<Check className="text-purple-500" size={20} />}
                  title="Разрешение"
                  description="Получаем официальное разрешение на полёты"
                  time="до 10 дней"
                />
              </div>
            </div>
          </div>

          {/* Legal cards */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Check className="text-green-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Разрешённые параметры
                </h2>
              </div>
              <ul className="space-y-4">
                <LegalItem
                  text="Высота до 150 метров"
                  details="Без дополнительных согласований"
                  positive
                />
                <LegalItem
                  text="Вес до 30 кг"
                  details="Для большинства сельхоздронов"
                  positive
                />
                <LegalItem
                  text="Дневное время"
                  details="От восхода до заката"
                  positive
                />
                <LegalItem
                  text="Сельхозугодья"
                  details="Вне населённых пунктов"
                  positive
                />
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <X className="text-red-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Основные ограничения
                </h2>
              </div>
              <ul className="space-y-4">
                <LegalItem
                  text="30-км зона аэропортов"
                  details="Требуется спецразрешение"
                  positive={false}
                />
                <LegalItem
                  text="Ночные полёты"
                  details="Запрещены без исключения"
                  positive={false}
                />
                <LegalItem
                  text="Населённые пункты"
                  details="Ограничения для городов и сёл"
                  positive={false}
                />
                <LegalItem
                  text="Пограничные зоны"
                  details="Дополнительные требования"
                  positive={false}
                />
              </ul>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Частые вопросы
            </h2>
            <div className="space-y-4 ">
              <FAQItem
                question="Какие документы нужны для получения разрешения?"
                answer="Заявление в ОРВД, схема полётов, страховой полис, сертификаты на оборудование и удостоверения пилотов."
              />
              <FAQItem
                question="Как долго действует разрешение?"
                answer="Обычно 1 год, но для конкретных операций может выдаваться на срок от 1 дня до 1 месяца."
              />
              <FAQItem
                question="Можно ли летать вблизи ЛЭП?"
                answer="Да, но требуется дополнительное согласование с владельцами энергообъектов."
              />
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Нужна помощь с документами?
            </h2>
            <p className="text-gray-600 mb-8">
              Наши специалисты оформят все разрешения и будут сопровождать ваши
              полёты
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition">
              Получить консультацию
              <ChevronRight className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-lg bg-gray-50 mr-4">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 ">{title}</h3>
      </div>
      <ul className="space-y-2 ">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <Check
              className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
              size={16}
            />
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProcessStep({
  number,
  icon,
  title,
  description,
  time,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  time?: string;
}) {
  return (
    <div className="relative z-10">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center h-full">
        <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-green-100">
          <span className="text-lg font-bold text-gray-900">{number}</span>
        </div>
        <div className="flex justify-center mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-3">{description}</p>
        {time && (
          <div className="text-sm text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded">
            Срок: {time}
          </div>
        )}
      </div>
    </div>
  );
}

function LegalItem({
  text,
  details,
  positive,
}: {
  text: string;
  details?: string;
  positive: boolean;
}) {
  return (
    <li className="flex items-start">
      <div
        className={`mr-3 mt-0.5 flex-shrink-0 ${positive ? 'text-green-500' : 'text-red-500'}`}
      >
        {positive ? <Check size={18} /> : <X size={18} />}
      </div>
      <div>
        <span className="text-gray-700 font-medium">{text}</span>
        {details && <p className="text-gray-500 text-sm mt-1">{details}</p>}
      </div>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
