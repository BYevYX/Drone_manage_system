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

      <section className="container mx-auto max-w-6xl px-4 py-10">
        <div className="bg-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-nekstmedium text-black">
              Услуги платформы
            </h1>
            <p className="text-gray-600 mt-1">
              Выберите услугу. Переход ведёт в раздел заявок вашего кабинета —
              доступность зависит от роли.
            </p>
          </div>

          <div className="w-full max-w-md">
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
                          <div className="text-sm font-medium">Все разделы</div>
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
                            {s.links.length} услуг
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
                    e.key === 'Enter' && handleServiceClick(s.href)
                  }
                  onClick={() => handleServiceClick(s.href)}
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

      <Footer />
    </div>
  );
}
