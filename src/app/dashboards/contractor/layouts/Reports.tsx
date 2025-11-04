'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  BarChart2,
  CalendarDays,
  Filter,
  Download,
  Eye,
  ChevronDown,
  Check,
  Search,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const mockReports = [
  {
    id: 1,
    date: '2025-06-01',
    field: 'Поле №1 (Северное)',
    crop: 'Пшеница озимая',
    area: 45,
    operation: 'Опрыскивание',
    drone: 'DJI Agras T40',
    operator: 'Петров И.И.',
    status: 'completed',
    result: 'Обработка завершена. Замечаний нет.',
    ndviChange: +0.12,
    chemical: 'Гербицид Агрохит',
    weather: 'Ясно, 20°C',
    consumption: '1.2 л/га',
    duration: 1.5,
  },
  {
    id: 2,
    date: '2025-05-21',
    field: 'Поле №2 (Центральное)',
    crop: 'Кукуруза',
    area: 32,
    operation: 'Внесение удобрений',
    drone: 'DJI Agras T30',
    operator: 'Сидорова А.А.',
    status: 'completed',
    result: 'Внесено 80 кг/га NPK. Замечаний нет.',
    ndviChange: +0.05,
    chemical: 'NPK 15-15-15',
    weather: 'Пасмурно, 18°C',
    consumption: '80 кг/га',
    duration: 2.0,
  },
  {
    id: 3,
    date: '2025-05-15',
    field: 'Поле №3 (Южное)',
    crop: 'Подсолнечник',
    area: 28,
    operation: 'Картографирование',
    drone: 'DJI Phantom 4',
    operator: 'Иванов Д.Д.',
    status: 'completed',
    result: 'Выполнена фотосъёмка, расчёт NDVI.',
    ndviChange: +0.02,
    chemical: '',
    weather: 'Ясно, 23°C',
    consumption: '-',
    duration: 1.0,
  },
  {
    id: 4,
    date: '2025-05-10',
    field: 'Поле №1 (Северное)',
    crop: 'Пшеница озимая',
    area: 45,
    operation: 'Опрыскивание',
    drone: 'DJI Agras T40',
    operator: 'Петров И.И.',
    status: 'completed',
    result: 'Обработка выполнена. Замечаний нет.',
    ndviChange: +0.1,
    chemical: 'Гербицид Агрохит',
    weather: 'Пасмурно, 21°C',
    consumption: '1.1 л/га',
    duration: 1.4,
  },
];

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  new: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
};

const cropColors: Record<string, string> = {
  'Пшеница озимая': '#34d399',
  Кукуруза: '#fbbf24',
  Подсолнечник: '#3b82f6',
  default: '#a1a1aa',
};

const operationOptions = [
  'Все операции',
  'Опрыскивание',
  'Внесение удобрений',
  'Картографирование',
];
const cropOptions = [
  'Все культуры',
  ...Array.from(new Set(mockReports.map((r) => r.crop))),
];

// Для универсального и эффективного поиска
const searchFields = [
  'id',
  'date',
  'field',
  'crop',
  'operation',
  'area',
  'drone',
  'operator',
  'ndviChange',
  'result',
  'status',
];

const statusMap: Record<string, string> = {
  completed: 'завершено',
  in_progress: 'в обработке',
  new: 'новая',
  rejected: 'отклонена',
};

export default function Reports() {
  // Фильтры
  const [operation, setOperation] = useState('Все операции');
  const [crop, setCrop] = useState('Все культуры');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  // ЭФФЕКТИВНЫЙ универсальный поиск
  const filteredReports = useMemo(() => {
    const searchStr = search.trim().toLowerCase();
    return mockReports.filter((r) => {
      if (operation !== 'Все операции' && r.operation !== operation)
        return false;
      if (crop !== 'Все культуры' && r.crop !== crop) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (!searchStr) return true;
      return searchFields.some((field) => {
        let value: any = r[field as keyof typeof r];
        if (typeof value === 'number')
          value = value.toString().replace('.', ',');
        if (field === 'date' && value)
          value = new Date(value).toLocaleDateString('ru-RU');
        if (field === 'status' && value)
          value = (statusMap[value] || value).toLowerCase();
        return String(value ?? '')
          .toLowerCase()
          .includes(searchStr);
      });
    });
  }, [operation, crop, dateFrom, dateTo, search]);

  // Данные для графиков
  const ndviChartData = useMemo(
    () =>
      filteredReports
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({
          date: r.date,
          field: r.field,
          ndvi: r.ndviChange,
        })),
    [filteredReports],
  );

  const cropPieData = useMemo(() => {
    const stat: Record<string, number> = {};
    filteredReports.forEach((r) => {
      stat[r.crop] = (stat[r.crop] || 0) + 1;
    });
    return Object.entries(stat).map(([name, value]) => ({
      name,
      value,
      color: cropColors[name] || cropColors.default,
    }));
  }, [filteredReports]);

  // Экспорт отчёта (заглушка)
  const handleDownload = (reportId: number) => {
    alert(`Экспорт отчёта №${reportId} в PDF/Excel`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-7"
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={28} className="text-blue-500" />
          <h2 className="text-2xl font-bold">Мои отчёты</h2>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <ModernSelect
              label="Операция"
              options={operationOptions}
              value={operation}
              onChange={setOperation}
            />
          </div>
          <div>
            <ModernSelect
              label="Культура"
              options={cropOptions}
              value={crop}
              onChange={setCrop}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
              Дата с
            </label>
            <input
              type="date"
              className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
              Дата по
            </label>
            <input
              type="date"
              className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
              Поиск
            </label>
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none z-10">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по всем столбцам..."
                className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Дашборды и графики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-gray-700 text-sm mb-1 flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-500" />
            NDVI (прирост, последние обработки)
          </div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={ndviChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ndvi"
                  stroke="#22d3ee"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-gray-700 text-sm mb-1 flex items-center gap-2">
            <PieChart size={18} className="text-blue-500" />
            Распределение по культурам
          </div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={cropPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  {cropPieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
          <div>
            <div className="text-gray-700 text-sm mb-1 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-500" />
              Сводка по отчётам
            </div>
            <div className="flex flex-col gap-1 mt-2 text-base">
              <div>
                <span className="font-semibold">{filteredReports.length}</span>{' '}
                отчётов в списке
              </div>
              <div>
                <span className="font-semibold">
                  {filteredReports.reduce((sum, r) => sum + r.area, 0)}
                </span>{' '}
                га обработано
              </div>
              <div>
                Средний NDVI:{' '}
                <span className="font-semibold">
                  {filteredReports.length
                    ? (
                        filteredReports.reduce(
                          (sum, r) => sum + r.ndviChange,
                          0,
                        ) / filteredReports.length
                      ).toFixed(2)
                    : '—'}
                </span>
              </div>
              <div>
                <span className="font-semibold">
                  {filteredReports
                    .reduce((sum, r) => sum + r.duration, 0)
                    .toFixed(1)}
                </span>{' '}
                ч работы дронов
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица отчётов */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                №
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Поле
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Культура
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Операция
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Площадь (га)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дрон
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Оператор
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NDVI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Итого
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{report.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(report.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {report.field}
                </td>
                <td
                  className="px-4 py-3 whitespace-nowrap text-sm"
                  style={{
                    color: cropColors[report.crop] || cropColors.default,
                  }}
                >
                  {report.crop}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {report.operation}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {report.area}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {report.drone}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {report.operator}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-emerald-600">
                  {report.ndviChange > 0 ? '+' : ''}
                  {report.ndviChange.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {report.result}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${statusColors[report.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {report.status === 'completed'
                      ? 'Завершено'
                      : report.status === 'in_progress'
                        ? 'В обработке'
                        : report.status === 'new'
                          ? 'Новая'
                          : 'Отклонена'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <button
                    className="text-blue-600 hover:text-blue-900 px-2"
                    title="Экспорт PDF/Excel"
                    onClick={() => handleDownload(report.id)}
                  >
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  <Loader2 className="inline-block animate-spin mr-2" />
                  Нет данных для отображения — измените фильтры или период
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// Селект с поиском
const ModernSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <motion.div whileHover={{ y: -1 }} className="relative z-20">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-3.5 text-left bg-white/90 backdrop-blur-sm rounded-xl border ${
              isOpen
                ? 'border-blue-400 ring-2 ring-blue-400/30'
                : 'border-gray-300/80'
            } text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer outline-none flex items-center justify-between`}
          >
            <span
              className={
                value === options[0] ? 'text-gray-400/90' : 'text-gray-700'
              }
            >
              {value}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown
                size={18}
                className={`text-gray-500/90 transition-colors duration-200 ${
                  isOpen ? 'text-blue-500' : 'group-hover:text-blue-500'
                }`}
              />
            </motion.div>
          </button>
        </motion.div>
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-30 w-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80 max-h-56 overflow-y-auto"
            >
              {options.map((option, index) => (
                <li
                  key={option}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between ${
                    value === option ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } ${index === 0 ? '' : 'border-t border-gray-100'}`}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-gray-700">{option}</span>
                  {value === option && (
                    <Check size={16} className="text-blue-500" />
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
