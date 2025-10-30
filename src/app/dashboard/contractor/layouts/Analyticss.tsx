'use client';
import React, { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  ClipboardList,
  ChevronDown,
  Filter,
  Calendar,
  Check,
  BarChart3,
  PieChart,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Timer,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { motion } from 'framer-motion';

// Chart.js registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

// Примерные данные (можно заменить на реальные с бэка)
const stats = [
  {
    label: 'Всего заданий',
    value: 34,
    icon: <ClipboardList className="text-emerald-500" size={28} />,
  },
  {
    label: 'Выполнено',
    value: 27,
    icon: <CheckCircle2 className="text-emerald-500" size={28} />,
  },
  {
    label: 'В процессе',
    value: 4,
    icon: <Timer className="text-blue-400" size={28} />,
  },
  {
    label: 'Отклонено',
    value: 3,
    icon: <AlertCircle className="text-red-400" size={28} />,
  },
];

// Для фильтрации
const yearOptions = ['2024', '2025'];
const cropOptions = [
  'Все культуры',
  'Пшеница озимая',
  'Кукуруза',
  'Подсолнечник',
];

const barData = {
  labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
  datasets: [
    {
      label: 'Выполнено',
      backgroundColor: '#10b981',
      data: [3, 4, 7, 6, 4, 3],
      borderRadius: 8,
      barThickness: 28,
    },
    {
      label: 'В процессе',
      backgroundColor: '#38bdf8',
      data: [1, 2, 1, 0, 2, 1],
      borderRadius: 8,
      barThickness: 28,
    },
    {
      label: 'Отклонено',
      backgroundColor: '#f87171',
      data: [0, 1, 0, 2, 1, 0],
      borderRadius: 8,
      barThickness: 28,
    },
  ],
};

const barOptions = {
  plugins: { legend: { display: true }, title: { display: false } },
  responsive: true,
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
  },
};

const pieData = {
  labels: ['Пшеница', 'Кукуруза', 'Подсолнечник'],
  datasets: [
    {
      data: [13, 10, 11],
      backgroundColor: ['#10b981', '#fbbf24', '#38bdf8'],
      borderColor: ['#fff', '#fff', '#fff'],
      borderWidth: 2,
    },
  ],
};

const lineData = {
  labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
  datasets: [
    {
      label: 'Площадь (га)',
      data: [30, 45, 67, 55, 48, 60],
      fill: false,
      borderColor: '#6366f1',
      backgroundColor: '#6366f1',
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: '#6366f1',
    },
  ],
};

const lineOptions = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
  },
  responsive: true,
};

export default function Analytics() {
  const [year, setYear] = useState(yearOptions[1]);
  const [crop, setCrop] = useState(cropOptions[0]);
  const [pieTab, setPieTab] = useState<'fields' | 'chemicals'>('fields');

  return (
    <div
      className="min-h-[100vh] bg-gradient-to-br  py-0 sm:py-8"
      style={{
        boxShadow:
          '0 4px 32px 0 rgba(31,38,135,0.09), 0 1.5px 8px 0 rgba(31,38,135,0.03)',
        borderRadius: '1.5rem',
        background: 'white',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Заголовок */}
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 size={32} className="text-emerald-600" />
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Аналитика
            </h1>
          </div>
          {/* Фильтры */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-emerald-400" />
              <span className="font-medium text-gray-700">Год:</span>
              <Dropdown options={yearOptions} value={year} setValue={setYear} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Культура:</span>
              <Dropdown options={cropOptions} value={crop} setValue={setCrop} />
            </div>
          </div>
          {/* Карточки суммарной статистики */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-3">
            {stats.map((st) => (
              <div
                key={st.label}
                className="bg-white rounded-2xl shadow border border-gray-100 flex flex-col items-center gap-3 py-7 px-4"
              >
                <div>{st.icon}</div>
                <div className="text-2xl font-bold">{st.value}</div>
                <div className="text-gray-500 text-sm">{st.label}</div>
              </div>
            ))}
          </div>
          {/* Диаграммы */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white rounded-2xl shadow border border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={20} className="text-blue-500" />
                <span className="font-semibold text-gray-800">
                  Динамика выполнения заданий по месяцам
                </span>
              </div>
              <Bar data={barData} options={barOptions} height={250} />
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <PieChart size={20} className="text-amber-500" />
                <span className="font-semibold text-gray-800">
                  Структура по культурам
                </span>
              </div>
              <Doughnut data={pieData} />
              <div className="mt-3 flex justify-center gap-2">
                <button
                  className={`px-3 py-1 text-xs rounded-xl border transition ${
                    pieTab === 'fields'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white border-gray-200 text-gray-800'
                  }`}
                  onClick={() => setPieTab('fields')}
                >
                  По полям
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-xl border transition ${
                    pieTab === 'chemicals'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white border-gray-200 text-gray-800'
                  }`}
                  onClick={() => setPieTab('chemicals')}
                >
                  По препаратам
                </button>
              </div>
            </div>
          </div>
          {/* Линейная динамика по площади */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-4 mt-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={20} className="text-indigo-500" />
              <span className="font-semibold text-gray-800">
                Динамика обработанной площади
              </span>
            </div>
            <Line data={lineData} options={lineOptions} height={110} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Выпадающий фильтр
function Dropdown({
  options,
  value,
  setValue,
}: {
  options: string[];
  value: string;
  setValue: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:border-emerald-300 transition"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {value}
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 bg-white rounded-xl shadow border border-gray-100 min-w-[120px]">
          {options.map((opt) => (
            <div
              key={opt}
              className={`px-4 py-2 cursor-pointer text-sm hover:bg-emerald-50 ${
                value === opt ? 'text-emerald-600 font-bold' : 'text-gray-700'
              }`}
              onClick={() => {
                setValue(opt);
                setOpen(false);
              }}
            >
              {value === opt && (
                <Check size={14} className="inline mr-1 text-emerald-500" />
              )}
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
