'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Map,
  Monitor,
  BarChart,
  Leaf,
  Droplets,
  Sun,
  ChevronRight,
  Search,
  Layers,
} from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

// Modern Services page adapted to the visual language from ProfileModernPage
// - same gradients, card shapes, input styles and shadows
// - preserves role-based navigation rules from Header.handleServiceClick
// Changes made per request:
// - filters now work (filter by section)
// - removed "избранное" functionality
// - removed "Доступно для" label and ID from cards

const menuSections = [
  {
    title: 'Планирование и управление',
    icon: <Map className="text-blue-500" size={18} />,
    links: [
      {
        label: 'Планирование маршрутов дронов',
        href: '/services/flight-planning',
        description: 'Оптимизация маршрутов для эффективного выполнения задач',
        icon: <Map className="text-blue-400" size={18} />,
      },
      {
        label: 'Мониторинг в реальном времени',
        href: '/services/live-tracking',
        description: 'Отслеживайте дроны и статус работ онлайн',
        icon: <Monitor className="text-sky-400" size={18} />,
      },
      {
        label: 'Анализ и отчетность',
        href: '/services/flight-analysis',
        description: 'Детальная аналитика и отчеты по выполненным полетам',
        icon: <BarChart className="text-purple-400" size={18} />,
      },
    ],
  },
  {
    title: 'Обработка культур',
    icon: <Leaf className="text-green-500" size={18} />,
    links: [
      {
        label: 'Химическая защита растений',
        href: '/services/chemical-protection',
        description:
          'Точное опрыскивание с использованием современных технологий',
        icon: <Droplets className="text-emerald-400" size={18} />,
      },
      {
        label: 'Внесение удобрений',
        href: '/services/fertilization',
        description: 'Равномерное и эффективное внесение удобрений',
        icon: <Leaf className="text-yellow-400" size={18} />,
      },
      {
        label: 'Десикация',
        href: '/services/desiccation',
        description: 'Ускорение созревания и подготовка к уборке урожая',
        icon: <Sun className="text-orange-400" size={18} />,
      },
    ],
  },
];

export default function ServicesModernPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{
    label: string;
    href?: string;
    description: string;
    icon: React.ReactNode;
    group: string;
  } | null>(null);

  const flatServices = useMemo(() => {
    return menuSections.flatMap((s) =>
      s.links.map((l) => ({ ...l, group: s.title })),
    );
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    let items = flatServices.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.group.toLowerCase().includes(q),
    );
    if (selectedSection)
      items = items.filter((i) => i.group === selectedSection);
    return items;
  }, [flatServices, q, selectedSection]);

  const INPUT_CLASS =
    'w-full h-12 rounded-lg border border-gray-200 px-3 text-sm placeholder-gray-400 bg-white';

  const handleServiceClick = (href?: string) => {
    const raw =
      typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    const normalized = (raw ?? '').toString().trim().toUpperCase();

    const blocked = new Set([
      'OPERATOR',
      'MANAGER',
      'DRONE_SUPPLIER',
      'MATERIAL_SUPPLIER',
    ]);

    if (!normalized || normalized === 'GUEST') {
      router.push('/signup');
      return;
    }

    if (normalized === 'CONTRACTOR') {
      // keep behaviour from original: go to contractor requests area
      router.push(`/dashboard/contractor/requests`);
      return;
    }

    if (blocked.has(normalized)) {
      alert(`Недоступно для роли ${normalized}`);
      return;
    }

    router.push('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-[#eefaf5] to-[#e6f3ff] font-nekstregular text-black">
      <Header />

      {/* Если выбрана услуга - показываем детальную информацию */}
      {selectedService ? (
        <section className="container mx-auto max-w-4xl px-4 py-10">
          <button
            onClick={() => setSelectedService(null)}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition text-sm font-nekstregular"
          >
            <ChevronRight size={16} className="rotate-180" />
            Назад к услугам
          </button>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header блок */}
            <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8 border-b border-gray-100">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 shadow-lg flex-shrink-0">
                  <div className="p-3 rounded-xl bg-white/50">
                    {selectedService.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-nekstmedium mb-3">
                    {selectedService.group}
                  </div>
                  <h1 className="text-3xl font-nekstmedium text-gray-900 mb-2">
                    {selectedService.label}
                  </h1>
                  <p className="text-gray-600 font-nekstregular">
                    {selectedService.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Основной контент */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Описание услуги */}
                <div>
                  <h2 className="text-xl font-nekstmedium text-gray-900 mb-4">
                    О услуге
                  </h2>
                  <div className="prose prose-sm max-w-none text-gray-700 font-nekstregular space-y-3">
                    {selectedService.group === 'Планирование и управление' && (
                      <>
                        {selectedService.label.includes('Планирование') && (
                          <>
                            <p>
                              Планирование маршрутов дронов — это ключевой этап
                              подготовки к любой операции. Наша система
                              позволяет создавать оптимальные траектории полета
                              с учетом рельефа местности, погодных условий и
                              специфики задачи.
                            </p>
                            <p>
                              Вы сможете визуализировать маршруты на карте,
                              рассчитать время выполнения задания и расход
                              ресурсов. Система автоматически определяет точки
                              взлета и посадки, зоны разворота и оптимальную
                              высоту полета.
                            </p>
                          </>
                        )}
                        {selectedService.label.includes('Мониторинг') && (
                          <>
                            <p>
                              Мониторинг в реальном времени обеспечивает полный
                              контроль над всеми операциями. Отслеживайте
                              местоположение дронов, статус выполнения задач и
                              получайте мгновенные уведомления о важных
                              событиях.
                            </p>
                            <p>
                              Система предоставляет детальную телеметрию:
                              скорость, высоту, уровень заряда батареи, расход
                              материалов. Все данные сохраняются и доступны для
                              последующего анализа.
                            </p>
                          </>
                        )}
                        {selectedService.label.includes('Анализ') && (
                          <>
                            <p>
                              Подробная аналитика помогает оценить эффективность
                              проведенных работ и оптимизировать будущие
                              операции. Формируйте отчеты по любым параметрам:
                              площадь обработки, расход материалов, время
                              работы.
                            </p>
                            <p>
                              Система автоматически генерирует визуализации,
                              графики и диаграммы. Экспортируйте данные в
                              удобных форматах для дальнейшего использования.
                            </p>
                          </>
                        )}
                      </>
                    )}

                    {selectedService.group === 'Обработка культур' && (
                      <>
                        {selectedService.label.includes('Химическая') && (
                          <>
                            <p>
                              Химическая защита растений с использованием дронов
                              обеспечивает точное и равномерное нанесение
                              препаратов. Это позволяет снизить расход химикатов
                              на 30-40% по сравнению с традиционными методами.
                            </p>
                            <p>
                              Дроны работают в любых условиях рельефа и не
                              повреждают посевы. Высокая скорость обработки и
                              возможность работы в труднодоступных местах делают
                              эту технологию незаменимой для современного
                              сельского хозяйства.
                            </p>
                          </>
                        )}
                        {selectedService.label.includes('удобрений') && (
                          <>
                            <p>
                              Внесение удобрений с помощью дронов обеспечивает
                              равномерное распределение питательных веществ по
                              всей площади поля. Система точно контролирует
                              дозировку и исключает пропуски или перекрытия.
                            </p>
                            <p>
                              Возможность дифференцированного внесения позволяет
                              учитывать особенности почвы в разных участках
                              поля, что повышает эффективность использования
                              удобрений и улучшает урожайность.
                            </p>
                          </>
                        )}
                        {selectedService.label.includes('Десикация') && (
                          <>
                            <p>
                              Десикация — это подсушивание растений перед
                              уборкой урожая. Дроны обеспечивают равномерную
                              обработку десикантами, что ускоряет созревание и
                              упрощает сбор урожая.
                            </p>
                            <p>
                              Правильно проведенная десикация снижает влажность
                              зерна, предотвращает развитие грибковых
                              заболеваний и улучшает качество урожая. Дроны
                              позволяют провести обработку в оптимальные сроки
                              независимо от состояния поля.
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Преимущества */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div className="text-sm font-nekstmedium text-emerald-900 mb-1">
                      Эффективность
                    </div>
                    <div className="text-xs text-emerald-700 font-nekstregular">
                      Высокая скорость выполнения работ и оптимальное
                      использование ресурсов
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="text-sm font-nekstmedium text-blue-900 mb-1">
                      Точность
                    </div>
                    <div className="text-xs text-blue-700 font-nekstregular">
                      Современные технологии обеспечивают высокую точность
                      выполнения задач
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                    <div className="text-sm font-nekstmedium text-purple-900 mb-1">
                      Безопасность
                    </div>
                    <div className="text-xs text-purple-700 font-nekstregular">
                      Минимизация рисков для персонала и окружающей среды
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                    <div className="text-sm font-nekstmedium text-orange-900 mb-1">
                      Доступность
                    </div>
                    <div className="text-xs text-orange-700 font-nekstregular">
                      Работа в любых погодных условиях и на сложном рельефе
                    </div>
                  </div>
                </div>

                {/* Кнопка действия */}
                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleServiceClick(selectedService.href)}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-nekstmedium text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Оформить заявку
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Каталог услуг
        <section className="container mx-auto max-w-6xl px-4 py-10">
          <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="w-full">
              <h1 className="text-3xl font-nekstmedium text-black">
                Услуги платформы
              </h1>
              <p className="text-gray-600 mt-1">
                {' '}
                Ознакомьтесь с доступными услугами и выберите подходящую для
                вашей задачи.
              </p>
            </div>

            <div className="w-full   mt-4 md:mt-0">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-200">
                  <Search size={16} />
                </span>
                <input
                  className={`${INPUT_CLASS} pl-10 pr-3 shadow-sm`}
                  placeholder="Поиск услуг…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <main className="flex flex-col lg:flex-row gap-8">
            {/* Left: filters / quick actions */}
            <aside className="lg:w-1/3 bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="text-lg font-nekstmedium">Фильтры</div>
                  <div className="text-sm text-gray-600">
                    Фильтруйте услуги по разделам
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-sm font-medium mb-2">Разделы</div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSection(null)}
                      className={`w-full text-left p-3 rounded-lg ${selectedSection === null ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-50">
                            Все
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Все разделы
                            </div>
                            <div className="text-xs text-gray-500">
                              Показать все услуги
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {flatServices.length}
                        </div>
                      </div>
                    </button>

                    {menuSections.map((s) => (
                      <button
                        key={s.title}
                        onClick={() => setSelectedSection(s.title)}
                        className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${selectedSection === s.title ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-50">
                            {s.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{s.title}</div>
                            <div className="text-xs text-gray-500">
                              {s.links.length} услуги
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">&nbsp;</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right: service cards */}
            <section className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filtered.map((s) => (
                  <article
                    key={s.label}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && setSelectedService(s)
                    }
                    onClick={() => setSelectedService(s)}
                    className="cursor-pointer rounded-2xl bg-white border border-gray-100 shadow-md p-5 flex flex-col hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-white to-gray-50 shadow-sm">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-emerald-50">
                          {s.icon}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm text-indigo-500 font-semibold">
                              {s.group}
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              {s.label}
                            </div>
                          </div>
                          <div className="text-indigo-400">
                            <ChevronRight size={20} />
                          </div>
                        </div>

                        <p className="mt-3 text-gray-600 text-sm">
                          {s.description}
                        </p>

                        {/* removed favorites / availability / id per request */}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="mt-12 text-center text-gray-500">
                  Нет услуг по запросу
                </div>
              )}
            </section>
          </main>
        </section>
      )}

      <Footer />
    </div>
  );
}
