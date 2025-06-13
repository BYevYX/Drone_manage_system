'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Battery,
  Camera,
  Wifi,
  Wrench,
  Cpu,
  ChevronRight,
  X,
  Star,
  StarOff,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

// Категории
const categories = [
  {
    key: 'drone',
    label: 'Агродроны',
    icon: <TrendingUp className="text-indigo-400" size={22} />,
  },
  {
    key: 'battery',
    label: 'Аккумуляторы',
    icon: <Battery className="text-emerald-400" size={22} />,
  },
  {
    key: 'camera',
    label: 'Камеры и сенсоры',
    icon: <Camera className="text-orange-400" size={22} />,
  },
  {
    key: 'comms',
    label: 'Связь и системы',
    icon: <Wifi className="text-sky-400" size={22} />,
  },
  {
    key: 'controller',
    label: 'Электроника',
    icon: <Cpu className="text-fuchsia-400" size={22} />,
  },
  {
    key: 'other',
    label: 'Аксессуары и сервис',
    icon: <Wrench className="text-gray-400" size={22} />,
  },
];

// Фильтруемые поля
const manufacturerOptions = ['ADGY', 'DJL Agras', 'JOYANCE', 'Topxgun'];
const statusOptions = ['В наличии', 'Под заказ', 'Нет в наличии'];
const priceOptions = [
  { label: 'до 1 млн ₽', min: 0, max: 1000000 },
  { label: '1 — 1.5 млн ₽', min: 1000000, max: 1500000 },
  { label: '1.5 млн ₽ и выше', min: 1500000, max: Infinity },
];

const sortOptions = [
  { key: 'az', label: 'A-Z' },
  { key: 'za', label: 'Z-A' },
  { key: 'expensive', label: 'Дорогие' },
  { key: 'cheap', label: 'Дешёвые' },
  { key: 'fav', label: 'Избранное' },
];

// Дроны пользователя
const allDevices = [
  {
    id: 1,
    category: 'drone',
    label: 'ADGY X5',
    description: 'Многофункциональный агродрон с поддержкой RTK.',
    price: 1200000,
    status: 'В наличии',
    manufacturer: 'ADGY',
    img: '/header/drones/drone_1.png',
    features: ['RTK', 'Автоматизация', '30 л бак'],
    modal: {
      title: 'ADGY X5',
      tags: ['RTK', 'Точность', '30 л бак'],
      features: [
        'RTK позиционирование, автоматизация полётов',
        'Ёмкость бака 30 л',
        'Поддержка интеграции с ПО',
      ],
      highlight: 'Идеален для точного земледелия.',
      img: '/img/drones/adgy-x5.png',
      price: 1200000,
    },
  },
  {
    id: 2,
    category: 'drone',
    label: 'DJL Agras T30',
    description: 'Лидер по ёмкости бака и площади обработки.',
    price: 1850000,
    status: 'Под заказ',
    manufacturer: 'DJL Agras',
    img: '/header/drones/drone_2.png',
    features: ['40 л бак', 'Автоматизация', 'Геозоны'],
    modal: {
      title: 'DJL Agras T30',
      tags: ['Геозоны', 'Автоматизация', '40 л бак'],
      features: [
        'Ёмкость бака 40 л',
        'Интеллектуальное управление',
        'Поддержка ночных работ',
      ],
      highlight: 'Промышленный дрон для больших хозяйств.',
      img: '/img/drones/agras-t30.png',
      price: 1850000,
    },
  },
  {
    id: 3,
    category: 'drone',
    label: 'JOYANCE JT10L-606',
    description: 'Компактный дрон для небольших и средних хозяйств.',
    price: 540000,
    status: 'В наличии',
    manufacturer: 'JOYANCE',
    img: '/header/drones/drone_3.png',
    features: ['10 л бак', 'Компактный', 'RTK'],
    modal: {
      title: 'JOYANCE JT10L-606',
      tags: ['Компакт', 'RTK', '10 л бак'],
      features: [
        'Компактная конструкция',
        'RTK для точных маршрутов',
        'Ёмкость бака 10 л',
      ],
      highlight: 'Лучший выбор для малых хозяйств.',
      img: '/img/drones/joyance-10l.png',
      price: 540000,
    },
  },
  {
    id: 4,
    category: 'drone',
    label: 'Topxgun A22',
    description: 'Универсальная платформа, поддержка камер и датчиков.',
    price: 870000,
    status: 'Нет в наличии',
    manufacturer: 'Topxgun',
    img: '/header/drones/drone_4.png',
    features: ['Поддержка камер', 'Гибкая настройка'],
    modal: {
      title: 'Topxgun A22',
      tags: ['Универсальность', 'Поддержка', 'Гибкая настройка'],
      features: [
        'Поддержка различных сенсоров и камер',
        'Гибкая интеграция',
        'Платформа для кастомных решений',
      ],
      highlight: 'Платформа для уникальных задач.',
      img: '/img/drones/topxgun-a22.png',
      price: 870000,
    },
  },
];

// Категории dropdown
function CategoryDropdown({
  category,
  setCategory,
}: {
  category: string;
  setCategory: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const selected =
    category === 'all'
      ? {
          label: 'Все устройства',
          icon: <TrendingUp className="text-indigo-400" size={22} />,
        }
      : categories.find((c) => c.key === category) || { label: '', icon: null };

  return (
    <div className="mb-4 w-full relative select-none" ref={ref}>
      <span className="block text-xs font-semibold text-gray-500 mb-1 font-nekstmedium">
        Категория
      </span>
      <button
        type="button"
        className={`
          w-full flex items-center justify-between px-5 py-2 rounded-2xl border border-indigo-100
          bg-gradient-to-r from-[#f6f6ff] to-[#f9f9f4] text-indigo-800 font-semibold text-[16px] shadow-md
          transition hover:shadow-lg hover:from-[#f0f4fb] hover:to-[#f9f9f4] focus:outline-none font-nekstregular
        `}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {selected.icon}
          {selected.label}
        </span>
        {open ? (
          <ChevronUp className="ml-2 text-indigo-300" size={18} />
        ) : (
          <ChevronDown className="ml-2 text-indigo-300" size={18} />
        )}
      </button>
      {open && (
        <div className="absolute z-20 mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden py-1 animate-fade-in-up">
          <button
            type="button"
            className={`w-full text-left px-5 py-2.5 flex items-center gap-2 text-[15px] font-medium rounded-none transition
              ${
                category === 'all'
                  ? 'bg-gradient-to-r from-[#f6f6ff] to-[#f9f9f4] text-indigo-700'
                  : 'hover:bg-indigo-50 text-gray-700'
              }
            `}
            onClick={() => {
              setCategory('all');
              setOpen(false);
            }}
          >
            <TrendingUp className="text-indigo-400" size={20} />
            Все устройства
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`w-full text-left px-5 py-2.5 flex items-center gap-2 text-[15px] font-medium transition
                ${
                  category === cat.key
                    ? 'bg-gradient-to-r from-[#fff7ed] to-[#f6f6ff] text-emerald-700'
                    : 'hover:bg-indigo-50 text-gray-700'
                }
              `}
              onClick={() => {
                setCategory(cat.key);
                setOpen(false);
              }}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Универсальный dropdown
function DropdownFilter<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Все',
}: {
  label?: string;
  options: T[];
  value: T | '';
  onChange: (v: T | '') => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="mb-4 w-full relative select-none" ref={ref}>
      {label && (
        <span className="block text-xs font-semibold text-gray-500 mb-1 font-nekstmedium">
          {label}
        </span>
      )}
      <button
        type="button"
        className={`
          w-full flex items-center justify-between px-4 py-2 rounded-2xl border border-gray-200
          bg-gradient-to-r from-white to-[#f7f8fa] text-gray-800 text-sm shadow transition
          hover:shadow-md hover:bg-[#f6faff] focus:outline-none font-nekstregular
        `}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? 'font-semibold' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        {open ? (
          <ChevronUp className="text-gray-400" size={18} />
        ) : (
          <ChevronDown className="text-gray-400" size={18} />
        )}
      </button>
      {open && (
        <div
          className="absolute z-20 mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-1 animate-fade-in-up"
          role="listbox"
        >
          <button
            type="button"
            className={`w-full text-left px-4 py-2 text-[15px] font-medium transition
              ${!value ? 'bg-gradient-to-r from-[#f6f6ff] to-[#f9f9f4] text-indigo-700' : 'hover:bg-indigo-50 text-gray-700'}
            `}
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
          >
            {placeholder}
          </button>
          {options.map((o) => (
            <button
              type="button"
              key={o}
              className={`w-full text-left px-4 py-2 text-[15px] font-medium transition
                ${
                  value === o
                    ? 'bg-gradient-to-r from-[#e8f4ff] to-[#f6faff] text-indigo-700'
                    : 'hover:bg-indigo-50 text-gray-700'
                }
              `}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder = 'Поиск по каталогу...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={20} />
      </span>
      <input
        className="pl-10 pr-3 py-2 w-full rounded-full border border-gray-200 bg-white shadow focus:ring-2 focus:ring-indigo-100 outline-none text-gray-800 font-nekstregular"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function DeviceCard({
  device,
  onFavorite,
  openModal,
  isFav,
}: {
  device: (typeof allDevices)[0];
  onFavorite: () => void;
  openModal: () => void;
  isFav: boolean;
}) {
  return (
    <div
      className={`
        group relative rounded-3xl border border-[#ecedf3] bg-white
        shadow-[0_4px_32px_0_rgba(40,60,100,0.12)]
        hover:shadow-[0_8px_40px_0_rgba(40,60,100,0.17)]
        hover:border-indigo-200
        transition-all duration-200 overflow-hidden
        cursor-pointer select-none flex flex-col
        min-h-[360px] font-nekstregular
      `}
      tabIndex={0}
      onClick={openModal}
      onKeyDown={(e) => e.key === 'Enter' && openModal()}
    >
      <button
        className="absolute top-5 right-5 z-10 rounded-full p-2 bg-white shadow border border-gray-100 hover:bg-indigo-50 transition"
        tabIndex={-1}
        title={isFav ? 'Убрать из избранного' : 'В избранное'}
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
      >
        {isFav ? (
          <Star className="text-yellow-400 fill-yellow-300" size={20} />
        ) : (
          <StarOff className="text-gray-300" size={20} />
        )}
      </button>
      <div className="flex items-center justify-center ">
        <img
          src={device.img}
          alt={device.label}
          className="h-[220px] w-auto object-contain rounded-2xl transition-transform duration-200 group-hover:scale-105"
          style={{ maxWidth: '90%' }}
        />
      </div>
      <div className="p-5 pt-3 flex flex-col gap-2 min-h-[88px]">
        <div className="flex items-center justify-between mb-1">
          <span className="uppercase tracking-wide text-xs text-indigo-400 font-bold font-nekstmedium">
            {categories.find((c) => c.key === device.category)?.label || ''}
          </span>
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full border font-semibold ${
              device.status === 'В наличии'
                ? 'bg-[#eafff1] text-[#219869] border-[#c7f6da]'
                : device.status === 'Под заказ'
                  ? 'bg-[#fffbee] text-[#b89b37] border-[#f5e1b6]'
                  : 'bg-[#fff4f4] text-[#df465c] border-[#f3c1c1]'
            }`}
          >
            {device.status}
          </span>
        </div>
        <div className="text-base font-bold text-gray-900 truncate font-nekstmedium">
          {device.label}
        </div>
        <div className="text-xs text-gray-500 truncate font-nekstregular">
          {device.manufacturer}
        </div>
        <div className="text-xs text-gray-500 line-clamp-1 font-nekstregular">
          {device.description}
        </div>
        <div className="flex flex-wrap gap-1 mt-1 mb-0.5">
          {device.features?.map((f) => (
            <span
              key={f}
              className="inline-block px-2 py-0.5 rounded-full bg-[#f7f8fa] text-indigo-700 text-[11px] font-normal border border-indigo-100"
            >
              {f}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-lg font-extrabold text-indigo-800 font-nekstmedium">
            {device.price.toLocaleString()} ₽
          </span>
          <span className="absolute right-6 bottom-5 rounded-full bg-indigo-50 text-indigo-400 p-2 shadow hover:bg-indigo-100 transition pointer-events-none">
            <ChevronRight size={22} />
          </span>
        </div>
      </div>
    </div>
  );
}

function DeviceModal({
  open,
  onClose,
  img,
  title,
  tags,
  features,
  highlight,
  price,
}: {
  open: boolean;
  onClose: () => void;
  img: string;
  title: string;
  tags: string[];
  features: string[];
  highlight: string;
  price?: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white/95 border border-gray-100 shadow-[0_8px_64px_0_rgba(60,80,140,0.18)] animate-fade-in-up overflow-hidden">
        <button
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition z-10"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <X size={32} />
        </button>
        <div className="px-6 pt-12 pb-8 flex flex-col md:flex-row items-center gap-7">
          <div className="bg-gradient-to-br from-[#f6f6ff] to-[#e0ecf7] rounded-2xl p-4 shadow-md flex items-center justify-center min-w-[124px] min-h-[124px]">
            <img
              src={img}
              alt={title}
              className="max-h-[80px] object-contain"
            />
          </div>
          <div className="flex-1 flex flex-col items-start">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 font-nekstmedium">
              {title}
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gradient-to-r from-[#f6f6ff] to-[#f9f9f4] text-indigo-700 rounded-full text-xs font-semibold shadow border border-indigo-100"
                >
                  {tag}
                </span>
              ))}
            </div>
            <ul className="text-gray-700 mb-4 flex flex-col gap-2 w-full font-nekstregular">
              {features.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle
                    className="flex-shrink-0 text-emerald-300 mt-1"
                    size={17}
                  />
                  <span className="text-base leading-snug">{b}</span>
                </li>
              ))}
            </ul>
            <div className="w-full rounded-xl bg-indigo-50/70 px-5 py-3 text-indigo-900 font-medium shadow border border-indigo-100 mb-4">
              {highlight}
            </div>
            {price && (
              <div className="text-xl font-bold text-indigo-700 mb-2 font-nekstmedium">
                {price.toLocaleString()} ₽
              </div>
            )}
            <Link
              href="/contacts"
              className="inline-block bg-gradient-to-r from-indigo-200 to-emerald-100 hover:to-orange-100 text-indigo-900 px-7 py-3 rounded-[1.5rem] font-semibold shadow-lg transition text-base mt-2 font-nekstmedium"
            >
              Оформить запрос
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DronesCatalogPage() {
  const [modal, setModal] = useState<null | (typeof allDevices)[0]['modal']>(
    null,
  );
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [category, setCategory] = useState<string>('all');
  const [manufacturer, setManufacturer] = useState('');
  const [status, setStatus] = useState('');
  const [price, setPrice] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'az' | 'za' | 'fav' | 'expensive' | 'cheap'>(
    'az',
  );

  const filtered = useMemo(() => {
    let data = allDevices;
    if (category !== 'all') data = data.filter((s) => s.category === category);
    if (manufacturer)
      data = data.filter((s) => s.manufacturer === manufacturer);
    if (status) data = data.filter((s) => s.status === status);
    if (price) {
      const pr = priceOptions.find((p) => p.label === price);
      if (pr) data = data.filter((s) => s.price >= pr.min && s.price < pr.max);
    }
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
    if (sort === 'expensive')
      data = [...data].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === 'cheap')
      data = [...data].sort((a, b) => (a.price || 0) - (b.price || 0));
    return data;
  }, [category, manufacturer, status, price, search, sort, favorites]);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#f0f0f0] to-[#f1fefc]">
      <Header />
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-10 mb-4 ">
        <h1 className="text-[2.7rem] md:text-5xl font-nekstmedium text-gray-900 drop-shadow-xl mb-2 tracking-tight">
          Каталог дронов
        </h1>
        <div className="text-base md:text-lg text-indigo-800 font-nekstregular">
          Современные дроны для агробизнеса, промышленности и инновационных
          задач
        </div>
      </section>
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-10 pt-2 pb-20 px-4 md:px-8">
        <aside className="w-full md:w-72 shrink-0 mb-8 md:mb-0">
          <div className="bg-white rounded-2xl shadow-[0_2px_18px_0_rgba(60,80,140,0.10)] p-6 sticky top-8 font-nekstregular">
            <h2 className="text-lg font-bold mb-6 font-nekstmedium">Фильтр</h2>
            <CategoryDropdown category={category} setCategory={setCategory} />
            <DropdownFilter
              label="Производитель"
              options={manufacturerOptions}
              value={manufacturer}
              onChange={setManufacturer}
            />
            <DropdownFilter
              label="Статус"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
            <DropdownFilter
              label="Цена"
              options={priceOptions.map((x) => x.label)}
              value={price}
              onChange={setPrice}
            />
            <button
              onClick={() => {
                setCategory('all');
                setManufacturer('');
                setStatus('');
                setPrice('');
                setSearch('');
              }}
              className="mt-8 w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Сбросить фильтры
            </button>
          </div>
        </aside>
        <main className="flex-1">
          {/* Поиск и сортировка над гридом */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-[350px]">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Поиск по дронам..."
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-gray-500 font-nekstregular hidden md:inline-block">
                Сортировка:
              </span>
              <div className="w-[180px]">
                <DropdownFilter
                  options={sortOptions.map((x) => x.label)}
                  value={
                    (
                      {
                        az: 'A-Z',
                        za: 'Z-A',
                        expensive: 'Дорогие',
                        cheap: 'Дешёвые',
                        fav: 'Избранное',
                      } as any
                    )[sort]
                  }
                  onChange={(val) => {
                    const map: any = {
                      'A-Z': 'az',
                      'Z-A': 'za',
                      Дорогие: 'expensive',
                      Дешёвые: 'cheap',
                      Избранное: 'fav',
                    };
                    setSort(map[val as string] || 'az');
                  }}
                  placeholder="Сортировка"
                />
              </div>
              <span className="text-xs text-gray-400 font-nekstregular ml-2 hidden md:inline-block">
                Найдено:{' '}
                <span className="text-indigo-700 font-nekstmedium">
                  {filtered.length}
                </span>
              </span>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] text-gray-500 text-lg pt-12 font-nekstmedium">
              Нет устройств по вашему фильтру.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {filtered.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  openModal={() => setModal(device.modal)}
                  isFav={favorites.has(device.id)}
                  onFavorite={() => {
                    setFavorites((favs) => {
                      const copy = new Set(favs);
                      copy.has(device.id)
                        ? copy.delete(device.id)
                        : copy.add(device.id);
                      return copy;
                    });
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
      <DeviceModal
        open={!!modal}
        onClose={() => setModal(null)}
        img={modal?.img || ''}
        title={modal?.title || ''}
        tags={modal?.tags || []}
        features={modal?.features || []}
        highlight={modal?.highlight || ''}
        price={modal?.price}
      />
    </div>
  );
}
