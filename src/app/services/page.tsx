'use client';
import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Map,
  Monitor,
  BarChart,
  Leaf,
  Droplets,
  Sun,
  Trees,
  Mountain,
  ChevronRight,
  X,
  Star,
  StarOff,
  Search,
} from 'lucide-react';
// Example: npm install react-icons
import {
  MdOutlineAutoAwesome,
  MdFavoriteBorder,
  MdFavorite,
  MdOutlineDashboard,
} from 'react-icons/md';
import { PiSparkleFill } from 'react-icons/pi';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

// Минималистичная светлая гамма
const categories = [
  {
    key: 'planning',
    label: 'Планирование и управление',
    color: 'from-[#f6f6ff] to-[#ebf3fa]',
    icon: <Map className="text-indigo-400" size={22} />,
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f6f6ff] to-[#ebf3fa] shadow-[0_2px_18px_0_rgba(120,80,200,0.08)]">
        <MdOutlineDashboard className="text-indigo-500" size={28} />
      </div>
    ),
  },
  {
    key: 'treatment',
    label: 'Обработка культур',
    color: 'from-[#f9f9f4] to-[#fff7ed]',
    icon: <Leaf className="text-emerald-400" size={22} />,
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_2px_18px_0_rgba(100,180,80,0.10)]">
        <PiSparkleFill className="text-emerald-400" size={28} />
      </div>
    ),
  },
];

const allServices = [
  {
    id: 1,
    category: 'planning',
    label: 'Планирование маршрутов дронов',
    description:
      'Оптимизация полётов и автоматизация заданий для экономии времени и ресурсов.',
    modal: {
      icon: (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f6f6ff] to-[#ebf3fa] shadow-[0_4px_24px_0_rgba(120,80,200,0.13)]">
          <MdOutlineDashboard className="text-indigo-500" size={38} />
        </div>
      ),
      title: 'Планирование маршрутов дронов',
      tags: ['Оптимизация', 'Безопасность', 'Экономия'],
      bullets: [
        'Учитываем границы полей, рельеф, погодные условия.',
        'Автоматическая генерация оптимальных маршрутов.',
        'Минимизация времени и затрат на обработку.',
        'Визуализация движения на карте и актуальный статус.',
      ],
      highlight:
        'Дроны работают по самым эффективным схемам, а вы всегда видите результат в реальном времени.',
    },
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f6f6ff] to-[#ebf3fa] shadow-[0_2px_18px_0_rgba(120,80,200,0.08)]">
        <MdOutlineDashboard className="text-indigo-500" size={28} />
      </div>
    ),
  },
  {
    id: 2,
    category: 'planning',
    label: 'Мониторинг в реальном времени',
    description:
      'Онлайн-карта, статусы дронов, алерты и отчёты. Всё под контролем 24/7.',
    modal: {
      icon: (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f6f6ff] to-[#ebf3fa] shadow-[0_4px_24px_0_rgba(120,80,200,0.13)]">
          <Monitor className="text-sky-400" size={34} />
        </div>
      ),
      title: 'Мониторинг в реальном времени',
      tags: ['Live', 'Контроль', 'Мобильность'],
      bullets: [
        'Веб и мобильный интерфейс для наблюдения за флотом дронов.',
        'Уведомления о событиях и изменениях статуса.',
        'Контроль расхода материалов, заряда, маршрутов.',
        'Интеграция с Telegram и email для важных алертов.',
      ],
      highlight:
        'Ваша агрооперация — как на ладони: быстро, прозрачно, с любого устройства.',
    },
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f6f6ff] to-[#ebf3fa] shadow-[0_2px_18px_0_rgba(120,80,200,0.08)]">
        <Monitor className="text-sky-400" size={28} />
      </div>
    ),
  },
  {
    id: 3,
    category: 'planning',
    label: 'Анализ и отчетность',
    description: 'Вся статистика, карты покрытия, экспорт в PDF и BI-дашборды.',
    modal: {
      icon: (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f6f6ff] to-[#ebf3fa] shadow-[0_4px_24px_0_rgba(120,80,200,0.13)]">
          <BarChart className="text-purple-400" size={34} />
        </div>
      ),
      title: 'Анализ и отчетность',
      tags: ['BI', 'Отчёты', 'Аналитика'],
      bullets: [
        'Интерактивные карты покрытия и эффективности.',
        'Выгрузка данных в PDF, Excel, GeoJSON.',
        'Выявление неохваченных зон, экономия ресурсов.',
        'Дашборды для агронома, руководителя, службы контроля.',
      ],
      highlight:
        'Вы всегда знаете, где и как был результат — в цифрах, графиках и отчётах.',
    },
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f6f6ff] to-[#ebf3fa] shadow-[0_2px_18px_0_rgba(120,80,200,0.08)]">
        <BarChart className="text-purple-400" size={28} />
      </div>
    ),
  },
  {
    id: 4,
    category: 'treatment',
    label: 'Химическая защита растений',
    description:
      'Точное опрыскивание, минимальный расход, максимальный эффект.',
    modal: {
      icon: (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_4px_24px_0_rgba(100,180,80,0.13)]">
          <Droplets className="text-emerald-400" size={34} />
        </div>
      ),
      title: 'Химическая защита растений',
      tags: ['Опрыскивание', 'Точность', 'Экология'],
      bullets: [
        'Равномерное нанесение препаратов, микродозирование.',
        'Умные маршруты для обхода препятствий и зон защиты.',
        'Снижение затрат на средства защиты растений до 30%.',
        'Документирование каждой обработки с геометкой.',
      ],
      highlight:
        'Только нужная доза, только нужное место — по-настоящему умная защита.',
    },
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_2px_18px_0_rgba(100,180,80,0.10)]">
        <Droplets className="text-emerald-400" size={28} />
      </div>
    ),
  },
  {
    id: 5,
    category: 'treatment',
    label: 'Внесение удобрений',
    description:
      'Дроны для жидких и твёрдых удобрений. Индивидуальные карты питания.',
    modal: {
      icon: (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_4px_24px_0_rgba(100,180,80,0.13)]">
          <Leaf className="text-yellow-400" size={34} />
        </div>
      ),
      title: 'Внесение удобрений',
      tags: ['Питание', 'Технологичность', 'Равномерность'],
      bullets: [
        'Внесение жидких/гранулированных удобрений по цифровым картам.',
        'Автоматическая настройка дозировки для каждого участка.',
        'Возможность обработки ночью и при высокой влажности.',
        'Контроль расхода и протоколирование в отчётах.',
      ],
      highlight: 'Больше урожая — меньше потерь. Вся агрохимия под контролем.',
    },
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_2px_18px_0_rgba(100,180,80,0.10)]">
        <Leaf className="text-yellow-400" size={28} />
      </div>
    ),
  },
  {
    id: 6,
    category: 'treatment',
    label: 'Десикация',
    description: 'Быстрое и равномерное дозревание, готовность к уборке.',
    modal: {
      icon: (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_4px_24px_0_rgba(100,180,80,0.13)]">
          <Sun className="text-orange-300" size={34} />
        </div>
      ),
      title: 'Десикация',
      tags: ['Созревание', 'Уборка', 'Планирование'],
      bullets: [
        'Ускорение созревания культур без потерь качества.',
        'Планирование обработки для синхронизации уборки.',
        'Минимизация потерь при жатве.',
        'Контроль и отчётность по каждому участку.',
      ],
      highlight:
        'Ваша уборка — без сюрпризов: всё по плану и с подтверждением.',
    },
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_2px_18px_0_rgba(100,180,80,0.10)]">
        <Sun className="text-orange-300" size={28} />
      </div>
    ),
  },
  {
    id: 7,
    category: 'treatment',
    label: 'Обработка садов и ягодников',
    description: 'Дроны для садов и ягодников: аккуратно, точно, безопасно.',
    modal: {
      icon: (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_4px_24px_0_rgba(100,180,80,0.13)]">
          <Trees className="text-emerald-400" size={34} />
        </div>
      ),
      title: 'Обработка садов и ягодников',
      tags: ['Сады', 'Ягодники', 'Безопасность'],
      bullets: [
        'Опрыскивание деревьев и кустарников по рядам.',
        'Микродозирование и минимальное повреждение растений.',
        'Работа на склонах и в труднодоступных местах.',
        'Вся обработка — с отчётом и фотоотчётом.',
      ],
      highlight:
        'Деликатная забота о каждом растении — даже в сложном рельефе.',
    },
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_2px_18px_0_rgba(100,180,80,0.10)]">
        <Trees className="text-emerald-400" size={28} />
      </div>
    ),
  },
  {
    id: 8,
    category: 'treatment',
    label: 'Обработка лесов и курортных зон',
    description:
      'Мониторинг, уход и защита больших территорий без ущерба экосистеме.',
    modal: {
      icon: (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_4px_24px_0_rgba(100,180,80,0.13)]">
          <Mountain className="text-orange-300" size={34} />
        </div>
      ),
      title: 'Обработка лесов и курортных зон',
      tags: ['Лес', 'Экология', 'Масштаб'],
      bullets: [
        'Мониторинг состояния леса, выявление проблем.',
        'Опрыскивание, высадка, профилактика пожаров.',
        'Сохранение биоразнообразия и минимальный след.',
        'Поддержка нацпарков, курортов, охотничьих хозяйств.',
      ],
      highlight:
        'Большая территория? Для нас — не проблема. Всё под контролем.',
    },
    avatar: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f9f9f4] to-[#fff7ed] shadow-[0_2px_18px_0_rgba(100,180,80,0.10)]">
        <Mountain className="text-orange-300" size={28} />
      </div>
    ),
  },
];

function ServiceModal({
  open,
  onClose,
  icon,
  title,
  tags,
  bullets,
  highlight,
}: {
  open: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  tags: string[];
  bullets: string[];
  highlight: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-3xl bg-white/95 border border-gray-100 shadow-[0_6px_64px_0_rgba(90,110,180,0.12)] animate-fade-in-up overflow-hidden"
            initial={{ scale: 0.97, opacity: 0.5, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.36 }}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#f6f6ff] via-[#f9f9f4] to-[#fff7ed] opacity-80" />
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition z-10"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X size={30} />
            </button>
            <div className="px-7 pt-10 pb-7 flex flex-col items-center">
              <div className="mb-4">{icon}</div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
                {title}
              </h2>
              <div className="flex flex-wrap gap-2 mb-5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gradient-to-r from-[#f6f6ff] to-[#fff7ed] text-indigo-700 rounded-full text-xs font-semibold shadow border border-indigo-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <ul className="text-gray-700 mb-6 flex flex-col gap-3 w-full max-w-[90%]">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight
                      className="flex-shrink-0 text-indigo-200 mt-1"
                      size={18}
                    />
                    <span className="text-base leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="w-full max-w-[94%] rounded-xl bg-indigo-50/70 px-5 py-3 text-center text-indigo-900 font-medium shadow border border-indigo-100 mb-4">
                {highlight}
              </div>
              <Link
                href="/dashboard"
                className="inline-block bg-gradient-to-r from-indigo-200 to-emerald-100 hover:to-orange-100 text-indigo-900 px-7 py-3 rounded-[1.5rem] font-semibold shadow-lg transition text-base mt-2"
              >
                Перейти в личный кабинет
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ServicesPage() {
  const [modal, setModal] = useState<null | (typeof allServices)[0]['modal']>(
    null,
  );
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'az' | 'za' | 'fav'>('az');
  const searchRef = useRef<HTMLInputElement>(null);

  // фокус не теряется при вводе в поиск
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setTimeout(() => {
      searchRef.current?.focus();
    }, 0);
  }

  const filtered = useMemo(() => {
    let data = allServices;
    if (category !== 'all') data = data.filter((s) => s.category === category);
    if (search.trim())
      data = data.filter(
        (s) =>
          s.label.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase()),
      );
    if (sort === 'az')
      data = [...data].sort((a, b) => a.label.localeCompare(b.label));
    if (sort === 'za')
      data = [...data].sort((a, b) => b.label.localeCompare(a.label));
    if (sort === 'fav') data = data.filter((s) => favorites.has(s.id));
    return data;
  }, [category, search, sort, favorites]);

  function CategoryFilter() {
    return (
      <div className="flex flex-wrap gap-3 items-center">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className={`px-5 py-2 rounded-full border text-[16px] font-medium flex items-center gap-2 transition shadow-[0_1px_8px_0_rgba(120,80,200,0.04)]
            ${
              category === 'all'
                ? 'bg-gradient-to-r from-[#f6f6ff] to-[#f9f9f4] border-indigo-100 text-indigo-700 shadow-[0_4px_18px_0_rgba(120,80,200,0.10)]'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-[#f6f6ff] hover:to-[#f9f9f4] hover:border-indigo-100'
            }
          `}
          onClick={() => setCategory('all')}
        >
          <MdOutlineAutoAwesome className="text-indigo-300" size={18} />
          Все категории
        </motion.button>
        {categories.map((cat) => (
          <motion.button
            whileTap={{ scale: 0.97 }}
            key={cat.key}
            className={`px-5 py-2 rounded-full border text-[16px] font-medium flex items-center gap-2 transition shadow-[0_1px_8px_0_rgba(120,80,200,0.04)]
              ${
                category === cat.key
                  ? 'bg-gradient-to-r from-[#fff7ed] to-[#f6f6ff] border-emerald-100 text-emerald-700 shadow-[0_4px_18px_0_rgba(100,180,80,0.09)]'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-[#fff7ed] hover:to-[#f6f6ff] hover:border-emerald-100'
              }
            `}
            onClick={() => setCategory(cat.key)}
          >
            {cat.icon}
            {cat.label}
          </motion.button>
        ))}
      </div>
    );
  }

  function SearchBar() {
    return (
      <motion.div
        className="relative w-full md:w-96"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-200">
          <Search size={20} />
        </span>
        <input
          ref={searchRef}
          className="pl-10 pr-3 py-2 w-full rounded-full border border-gray-200 bg-white shadow focus:ring-2 focus:ring-indigo-100 outline-none text-gray-800 transition-all duration-200"
          placeholder="Поиск по услугам…"
          value={search}
          onChange={handleSearchChange}
          autoComplete="off"
        />
      </motion.div>
    );
  }

  function ServiceCard({
    service,
    onFavorite,
    openModal,
    isFav,
  }: {
    service: (typeof allServices)[0];
    onFavorite: () => void;
    openModal: () => void;
    isFav: boolean;
  }) {
    return (
      <motion.div
        className={`
          group relative rounded-2xl border border-gray-100
          bg-white shadow-[0_4px_32px_0_rgba(120,80,200,0.07)]
          hover:shadow-[0_12px_48px_0_rgba(120,80,200,0.14)]
          hover:border-indigo-200
          transition-all duration-300 overflow-hidden
          hover:scale-[1.025] cursor-pointer select-none
        `}
        tabIndex={0}
        whileHover={{
          y: -4,
          scale: 1.025,
          boxShadow: '0 16px 56px 0 rgba(120,80,200,0.13)',
        }}
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter') openModal();
        }}
        layout
      >
        <motion.button
          whileTap={{ scale: 0.94, rotate: -8 }}
          className={`absolute top-5 right-5 z-10 rounded-full p-2 bg-white shadow border border-gray-100 hover:bg-indigo-50 transition`}
          tabIndex={-1}
          title={isFav ? 'Убрать из избранного' : 'В избранное'}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
        >
          {isFav ? (
            <MdFavorite className="text-rose-400" size={22} />
          ) : (
            <MdFavoriteBorder className="text-gray-300" size={22} />
          )}
        </motion.button>
        <div className="flex items-center gap-3 px-7 pt-7 pb-2 z-10 relative">
          {service.avatar}
          <div className="flex flex-col gap-0.5">
            <span className="uppercase tracking-widest text-xs text-indigo-300 font-semibold">
              {categories.find((c) => c.key === service.category)?.label || ''}
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              {service.label}
            </span>
          </div>
        </div>
        <div className="px-7 pb-8 pt-2 min-h-[54px] flex items-end">
          <span className="text-gray-600 text-base leading-relaxed font-light block">
            {service.description}
          </span>
        </div>
        <span className="absolute right-5 bottom-5 rounded-full bg-indigo-50 text-indigo-400 p-2 shadow hover:bg-indigo-100 transition pointer-events-none">
          <ChevronRight size={22} />
        </span>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-[#f7f7fa] via-white to-[#f9f9f4]">
      <Header />

      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-6 w-full mt-[30px] mb-[26px] rounded-[18px] py-[18px]">
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 ">
              Услуги платформы
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl">
              Всё для цифрового управления вашим агробизнесом —{' '}
              <span className="text-indigo-600 font-semibold">
                эффективно, прозрачно, технологично
              </span>
              .
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#f6f6ff] to-[#f9f9f4] text-indigo-900 font-semibold shadow-[0_2px_18px_0_rgba(120,80,200,0.10)] border border-indigo-100 transition
      hover:from-[#ebf3fa] hover:to-[#fff7ed] hover:scale-105 hover:shadow-lg"
            >
              <MdOutlineAutoAwesome className="text-indigo-300" size={22} />
              <span>Оставить заявку</span>
            </Link>
          </motion.div>
        </motion.div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-10">
          <CategoryFilter />
          <div className="flex-1" />
          <SearchBar />
        </div>
      </section>

      <main className="flex-1 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center min-h-[30vh] text-gray-500 text-lg pt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
            >
              Нет услуг по вашему фильтру.
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
              layout
            >
              {filtered.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  openModal={() => setModal(service.modal)}
                  isFav={favorites.has(service.id)}
                  onFavorite={() => {
                    setFavorites((favs) => {
                      const copy = new Set(favs);
                      copy.has(service.id)
                        ? copy.delete(service.id)
                        : copy.add(service.id);
                      return copy;
                    });
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <section className="py-16">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#f9f9f4] via-white to-[#f6f6ff] shadow-[0_6px_48px_0_rgba(120,80,200,0.09)] px-8 py-14 text-center relative overflow-hidden">
          <span className="absolute -top-5 -left-6 w-44 h-44 bg-indigo-300/10 blur-3xl rounded-full" />
          <span className="absolute -bottom-8 right-0 w-44 h-44 bg-emerald-300/10 blur-3xl rounded-full" />
          <h3 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">
            Не нашли нужную услугу?
          </h3>
          <p className="text-gray-700 mb-7 max-w-xl mx-auto">
            Оставьте заявку — подберём индивидуальное решение, интеграцию или
            пакет сервисов для вашей задачи.
          </p>
          <Link
            href="/contacts"
            className="inline-block bg-gradient-to-r from-[#f6f6ff] to-[#fff7ed] hover:to-[#ebf3fa] text-indigo-900 px-8 py-3 rounded-full font-semibold shadow-lg transition text-lg border border-indigo-100"
          >
            Связаться с нами
          </Link>
        </div>
      </section>

      <Footer className="mt-auto" />

      <ServiceModal
        open={!!modal}
        onClose={() => setModal(null)}
        icon={modal?.icon || null}
        title={modal?.title || ''}
        tags={modal?.tags || []}
        bullets={modal?.bullets || []}
        highlight={modal?.highlight || ''}
      />
    </div>
  );
}
