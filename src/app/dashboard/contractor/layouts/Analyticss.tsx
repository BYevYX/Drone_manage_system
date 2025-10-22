'use client';
import React, { useState, useEffect } from 'react';
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
  RefreshCw,
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

import { apiClient } from '../../../services/api';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  rejectedTasks: number;
  monthlyData: Array<{
    month: string;
    completed: number;
    inProgress: number;
    rejected: number;
  }>;
  cropData: Array<{
    name: string;
    value: number;
  }>;
  areaData: Array<{
    month: string;
    area: number;
  }>;
}

// Для фильтрации
const yearOptions = ['2024', '2025'];
const cropOptions = [
  'Все культуры',
  'Пшеница озимая',
  'Кукуруза',
  'Подсолнечник',
];


const barOptions = {
  plugins: { legend: { display: true }, title: { display: false } },
  responsive: true,
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
  },
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    rejectedTasks: 0,
    monthlyData: [],
    cropData: [],
    areaData: [],
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [year, crop]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load orders for analytics
      const orders = await apiClient.getOrders();
      const fields = await apiClient.getFields();

      // Calculate statistics
      const totalTasks = orders.length;
      const completedTasks = orders.filter(
        (o) => o.status === 'completed',
      ).length;
      const inProgressTasks = orders.filter(
        (o) => o.status === 'in_progress',
      ).length;
      const rejectedTasks = orders.filter(
        (o) => o.status === 'rejected',
      ).length;

      // Generate monthly data (mock for now)
      const monthlyData = [
        { month: 'Янв', completed: Math.floor(completedTasks * 0.1), inProgress: Math.floor(inProgressTasks * 0.2), rejected: Math.floor(rejectedTasks * 0.1) },
        { month: 'Фев', completed: Math.floor(completedTasks * 0.15), inProgress: Math.floor(inProgressTasks * 0.3), rejected: Math.floor(rejectedTasks * 0.2) },
        { month: 'Мар', completed: Math.floor(completedTasks * 0.2), inProgress: Math.floor(inProgressTasks * 0.1), rejected: 0 },
        { month: 'Апр', completed: Math.floor(completedTasks * 0.25), inProgress: 0, rejected: Math.floor(rejectedTasks * 0.3) },
        { month: 'Май', completed: Math.floor(completedTasks * 0.2), inProgress: Math.floor(inProgressTasks * 0.2), rejected: Math.floor(rejectedTasks * 0.2) },
        { month: 'Июн', completed: Math.floor(completedTasks * 0.1), inProgress: Math.floor(inProgressTasks * 0.2), rejected: Math.floor(rejectedTasks * 0.2) },
      ];

      // Generate crop data from fields
      const cropStats: Record<string, number> = {};
      fields.forEach((field) => {
        const crop = field.crop || 'Неизвестно';
        cropStats[crop] = (cropStats[crop] || 0) + 1;
      });

      const cropData = Object.entries(cropStats).map(([name, value]) => ({
        name,
        value,
      }));

      // Generate area data
      const areaData = [
        { month: 'Янв', area: 30 },
        { month: 'Фев', area: 45 },
        { month: 'Мар', area: 67 },
        { month: 'Апр', area: 55 },
        { month: 'Май', area: 48 },
        { month: 'Июн', area: 60 },
      ];

      setAnalyticsData({
        totalTasks,
        completedTasks,
        inProgressTasks,
        rejectedTasks,
        monthlyData,
        cropData,
        areaData,
      });
    } catch (err) {
      setError('Ошибка загрузки аналитики: ' + (err as Error).message);
      // Use fallback data
      setAnalyticsData({
        totalTasks: 34,
        completedTasks: 27,
        inProgressTasks: 4,
        rejectedTasks: 3,
        monthlyData: [
          { month: 'Янв', completed: 3, inProgress: 1, rejected: 0 },
          { month: 'Фев', completed: 4, inProgress: 2, rejected: 1 },
          { month: 'Мар', completed: 7, inProgress: 1, rejected: 0 },
          { month: 'Апр', completed: 6, inProgress: 0, rejected: 2 },
          { month: 'Май', completed: 4, inProgress: 2, rejected: 1 },
          { month: 'Июн', completed: 3, inProgress: 1, rejected: 0 },
        ],
        cropData: [
          { name: 'Пшеница', value: 13 },
          { name: 'Кукуруза', value: 10 },
          { name: 'Подсолнечник', value: 11 },
        ],
        areaData: [
          { month: 'Янв', area: 30 },
          { month: 'Фев', area: 45 },
          { month: 'Мар', area: 67 },
          { month: 'Апр', area: 55 },
          { month: 'Май', area: 48 },
          { month: 'Июн', area: 60 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // Create dynamic stats array
  const stats = [
    {
      label: 'Всего заданий',
      value: analyticsData.totalTasks,
      icon: <ClipboardList className="text-emerald-500" size={28} />,
    },
    {
      label: 'Выполнено',
      value: analyticsData.completedTasks,
      icon: <CheckCircle2 className="text-emerald-500" size={28} />,
    },
    {
      label: 'В процессе',
      value: analyticsData.inProgressTasks,
      icon: <Timer className="text-blue-400" size={28} />,
    },
    {
      label: 'Отклонено',
      value: analyticsData.rejectedTasks,
      icon: <AlertCircle className="text-red-400" size={28} />,
    },
  ];

  // Update chart data
  const barData = {
    labels: analyticsData.monthlyData.map((d) => d.month),
    datasets: [
      {
        label: 'Выполнено',
        backgroundColor: '#10b981',
        data: analyticsData.monthlyData.map((d) => d.completed),
        borderRadius: 8,
        barThickness: 28,
      },
      {
        label: 'В процессе',
        backgroundColor: '#38bdf8',
        data: analyticsData.monthlyData.map((d) => d.inProgress),
        borderRadius: 8,
        barThickness: 28,
      },
      {
        label: 'Отклонено',
        backgroundColor: '#f87171',
        data: analyticsData.monthlyData.map((d) => d.rejected),
        borderRadius: 8,
        barThickness: 28,
      },
    ],
  };

  const pieData = {
    labels: analyticsData.cropData.map((d) => d.name),
    datasets: [
      {
        data: analyticsData.cropData.map((d) => d.value),
        backgroundColor: ['#10b981', '#fbbf24', '#38bdf8'],
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: analyticsData.areaData.map((d) => d.month),
    datasets: [
      {
        label: 'Площадь (га)',
        data: analyticsData.areaData.map((d) => d.area),
        fill: false,
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#6366f1',
      },
    ],
  };

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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <BarChart3 size={32} className="text-emerald-600" />
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Аналитика
              </h1>
            </div>
            <button
              onClick={loadAnalyticsData}
              className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              title="Обновить данные"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} text-gray-600`} />
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
              <button
                onClick={loadAnalyticsData}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Повторить
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64 mb-6">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Загрузка аналитики...</span>
            </div>
          )}
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
          {!loading && (
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
          )}
          {/* Диаграммы */}
          {!loading && (
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
          )}
          {/* Линейная динамика по площади */}
          {!loading && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-4 mt-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={20} className="text-indigo-500" />
              <span className="font-semibold text-gray-800">
                Динамика обработанной площади
              </span>
            </div>
            <Line data={lineData} options={lineOptions} height={110} />
          </div>
          )}
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
