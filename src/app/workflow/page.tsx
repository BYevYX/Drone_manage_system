'use client';
import React from 'react';
import TypingEffect from 'react-typed.ts';

import {
  Rocket,
  MapPin,
  Calendar,
  Users,
  Zap,
  BarChart2,
  Globe,
  Shield,
  CheckCircle2,
  Layers,
  Eye,
  Database,
  Map,
  ClipboardList,
  Leaf,
  RefreshCcw,
  Cloud,
  Wifi,
  HelpCircle,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[470px] overflow-hidden flex items-center justify-center bg-[url(/pages/main/drone_11.jpg)] bg-cover bg-center ">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[12px] z-0"></div>

        {/* Затемнённый оверлей */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Текст с эффектом печатной машинки */}
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
            <TypingEffect
              strings={[
                'Умное управление агродронами',
                'Автоматизация сельскохозяйственных процессов',
                'Повышение урожайности и экономия ресурсов',
              ]}
              speed={100}
              pause={2000}
            />
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Платформа нового поколения для комплексного контроля и анализа
            работы дронов в агросекторе.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-nekstregular">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Как работает платформа
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            6 шагов — от заявки до отчёта. Всё онлайн, прозрачно и удобно.{' '}
            <span className="inline-flex items-center ml-2 text-green-600 font-semibold">
              <Leaf className="mr-1" size={18} />
              Экологично
            </span>
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-blue-100 transition group animate-fade-in-up">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Users className="text-blue-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Регистрация участников
            </h3>
            <p className="text-gray-600">
              Заказчики, операторы, менеджеры и поставщики проходят регистрацию
              и получают доступ к личному кабинету.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-green-100 transition group animate-fade-in-up delay-100">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <ClipboardList className="text-green-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Создание и планирование задания
            </h3>
            <p className="text-gray-600">
              Заказчик формирует заявку, выбирает участок на карте, задаёт
              параметры обработки и сроки.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-yellow-100 transition group animate-fade-in-up delay-200">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
              <Layers className="text-yellow-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Автоматизированное планирование полётов
            </h3>
            <p className="text-gray-600">
              Система рассчитывает оптимальные маршруты для группы дронов с
              учётом особенностей поля и требований процессов.
            </p>
          </div>
          {/* Step 4 */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-indigo-100 transition group animate-fade-in-up delay-300">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <Database className="text-indigo-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Распределение ресурсов
            </h3>
            <p className="text-gray-600">
              Платформа подбирает дроны и материалы из базы поставщиков,
              уведомляет участников о предстоящих задачах.
            </p>
          </div>
          {/* Step 5 */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-pink-100 transition group animate-fade-in-up delay-400">
            <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors">
              <Eye className="text-pink-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Мониторинг в реальном времени
            </h3>
            <p className="text-gray-600">
              Операторы отслеживают работу дронов онлайн: статус,
              местоположение, остаток материалов и автоматическую дозаправку.
            </p>
          </div>
          {/* Step 6 */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-purple-100 transition group animate-fade-in-up delay-500">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
              <BarChart2 className="text-purple-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Аналитика и отчётность
            </h3>
            <p className="text-gray-600">
              Заказчик получает подробный отчёт: карта обработанных участков,
              использованные материалы, время выполнения.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-green-50 border-t border-b border-gray-100 animate-fade-in font-nekstregular">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Интеграции и технологии
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Платформа поддерживает интеграцию с современными цифровыми
              сервисами и оборудованием.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            <div className="flex flex-col items-center">
              <Map className="text-blue-700" size={40} />
              <span className="mt-2 text-sm text-gray-700">
                Цифровая картография
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Cloud className="text-indigo-700" size={40} />
              <span className="mt-2 text-sm text-gray-700">
                Облачные сервисы
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Wifi className="text-green-700" size={40} />
              <span className="mt-2 text-sm text-gray-700">
                IoT и телеметрия
              </span>
            </div>
            <div className="flex flex-col items-center">
              <RefreshCcw className="text-yellow-700" size={40} />
              <span className="mt-2 text-sm text-gray-700">
                Интеграция с ERP
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="text-pink-700" size={40} />
              <span className="mt-2 text-sm text-gray-700">
                Безопасность данных
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 font-nekstregular">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Реальные сценарии использования
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-400 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Обработка полей и садов
            </h3>
            <p className="text-gray-600">
              Автоматизация опрыскивания и внесения удобрений на больших
              площадях. Снижение затрат, повышение урожайности.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-400 animate-fade-in-up delay-100">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              Мониторинг и анализ состояния культур
            </h3>
            <p className="text-gray-600">
              Использование дронов для сбора данных о состоянии растений,
              выявления проблемных зон и построения вегетационных индексов.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-400 animate-fade-in-up delay-200">
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">
              Экстренные задачи
            </h3>
            <p className="text-gray-600">
              Быстрое реагирование на погодные аномалии, локальные вредители или
              болезни. Оперативное планирование и запуск дронов.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white/90 border-t border-gray-100 font-nekstregular">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="text-blue-600" size={28} />
            <h2 className="text-xl font-bold text-gray-900">
              Вопросы и ответы
            </h2>
          </div>
          <div className="space-y-4">
            <details className="group rounded-lg border border-gray-200 p-4">
              <summary className="flex items-center cursor-pointer text-gray-800 font-semibold">
                <ChevronDown
                  className="mr-2 group-open:rotate-180 transition-transform"
                  size={18}
                />
                Какие дроны поддерживает платформа?
              </summary>
              <div className="mt-2 text-gray-600">
                Поддерживаются все современные модели промышленных агродронов с
                возможностью интеграции через API.
              </div>
            </details>
            <details className="group rounded-lg border border-gray-200 p-4">
              <summary className="flex items-center cursor-pointer text-gray-800 font-semibold">
                <ChevronDown
                  className="mr-2 group-open:rotate-180 transition-transform"
                  size={18}
                />
                Можно ли подключить свои карты и данные?
              </summary>
              <div className="mt-2 text-gray-600">
                Да, платформа поддерживает импорт пользовательских карт и работу
                с внешними геосервисами.
              </div>
            </details>
            <details className="group rounded-lg border border-gray-200 p-4">
              <summary className="flex items-center cursor-pointer text-gray-800 font-semibold">
                <ChevronDown
                  className="mr-2 group-open:rotate-180 transition-transform"
                  size={18}
                />
                Как обеспечивается безопасность данных?
              </summary>
              <div className="mt-2 text-gray-600">
                Все данные хранятся в защищённых облачных хранилищах с
                многоуровневой системой доступа и резервным копированием.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#868484] to-[#82a6a6] py-12 px-4 sm:px-6 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-nekstregular text-center">
          Готовы к цифровой трансформации вашего агробизнеса?
        </h2>
        <p className="text-white/90 mb-6 text-sm sm:text-base text-center max-w-xl font-nekstregular px-2">
          Присоединяйтесь к платформе, чтобы управлять парком дронов,
          автоматизировать процессы и повышать урожайность с заботой об
          экологии.
        </p>
        <a
          href="/signup"
          className="inline-block bg-white hover:bg-blue-50 text-blue-700 font-semibold px-8 py-3 rounded-full shadow transition font-nekstregular"
        >
          Начать работу
        </a>
      </section>

      <Footer className="mt-auto" />
    </div>
  );
}
