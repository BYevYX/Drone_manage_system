'use client';
import React, { useState } from 'react';
import {
  BarChart3,
  ClipboardList,
  Users,
  UserCheck,
  Tractor,
  Timer,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  TrendingUp,
  PieChart,
  Calendar,
  ArrowRightLeft,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Примерные данные (можно заменить на реальные с бэка)
const stats = [
  {
    label: 'Активные задачи',
    value: 8,
    icon: <ClipboardList className="text-emerald-500" size={28} />,
    color: 'bg-emerald-50',
  },
  {
    label: 'В работе',
    value: 4,
    icon: <Timer className="text-blue-400" size={28} />,
    color: 'bg-blue-50',
  },
  {
    label: 'Завершено',
    value: 21,
    icon: <CheckCircle2 className="text-emerald-500" size={28} />,
    color: 'bg-green-50',
  },
  {
    label: 'Отклонено',
    value: 3,
    icon: <AlertCircle className="text-red-400" size={28} />,
    color: 'bg-red-50',
  },
];

const operatorStats = [
  {
    label: 'Операторов',
    value: 5,
    icon: <Users className="text-indigo-500" size={24} />,
  },
  {
    label: 'В смене',
    value: 2,
    icon: <UserCheck className="text-emerald-500" size={24} />,
  },
  {
    label: 'Всего смен',
    value: 20,
    icon: <Calendar className="text-blue-400" size={24} />,
  },
];

const droneStats = [
  {
    label: 'Дронов',
    value: 4,
    icon: <Tractor className="text-orange-500" size={24} />,
  },
  {
    label: 'В работе',
    value: 2,
    icon: <ArrowRightLeft className="text-sky-500" size={24} />,
  },
  {
    label: 'Оборудование',
    value: 6,
    icon: <Layers className="text-gray-400" size={24} />,
  },
];

const recentTasks = [
  {
    id: 201,
    name: 'Опрыскивание — Поле №1',
    status: 'in_progress',
    operator: 'Петров И.И.',
    date: '2025-06-09',
    field: 'Поле №1 (Северное)',
    area: 12,
  },
  {
    id: 202,
    name: 'Внесение удобрений — Поле №2',
    status: 'waiting',
    operator: 'Иванова А.А.',
    date: '2025-06-09',
    field: 'Поле №2 (Центральное)',
    area: 32,
  },
  {
    id: 203,
    name: 'Картографирование — Поле №1',
    status: 'completed',
    operator: 'Петров И.И.',
    date: '2025-06-08',
    field: 'Поле №1 (Северное)',
    area: 30,
  },
];

const statusLabels: Record<string, string> = {
  waiting: 'Ожидает',
  in_progress: 'В работе',
  completed: 'Завершено',
  rejected: 'Отклонено',
};
const statusColors: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

// Для фильтрации
const yearOptions = ['2024', '2025'];
const cropOptions = [
  'Все культуры',
  'Пшеница озимая',
  'Кукуруза',
  'Подсолнечник',
];

export default function Overview() {
  const [year, setYear] = useState(yearOptions[1]);
  const [crop, setCrop] = useState(cropOptions[0]);

  return (
    <div className="min-h-[100vh] bg-neutral-50 py-0 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Заголовок */}
          <div className="flex items-center gap-3 pt-4 pb-2">
            <BarChart3 size={34} className="text-emerald-600" />
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Обзор (Менеджер)
            </h1>
          </div>

          {/* Статистика (основная) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((st) => (
              <div
                key={st.label}
                className={`rounded-2xl shadow-sm flex flex-col items-center gap-3 py-7 px-4 border border-gray-100 ${st.color}`}
              >
                <div>{st.icon}</div>
                <div className="text-2xl font-bold">{st.value}</div>
                <div className="text-gray-500 text-sm">{st.label}</div>
              </div>
            ))}
          </div>

          {/* Операторы и дроны */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
            <div className="bg-white rounded-2xl shadow border border-gray-100 px-5 py-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1 text-gray-700 font-semibold">
                <Users size={20} className="text-indigo-500" />
                Операторы
              </div>
              <div className="grid grid-cols-2 gap-2">
                {operatorStats.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.icon}
                    <span className="font-bold text-lg">{item.value}</span>
                    <span className="text-gray-500 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-100 px-5 py-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1 text-gray-700 font-semibold">
                <Tractor size={20} className="text-orange-500" />
                Дроны и техника
              </div>
              <div className="grid grid-cols-2 gap-2">
                {droneStats.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.icon}
                    <span className="font-bold text-lg">{item.value}</span>
                    <span className="text-gray-500 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-100 px-5 py-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1 text-gray-700 font-semibold">
                <PieChart size={20} className="text-amber-500" />
                Фильтр/отбор
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500">Год:</span>
                <Dropdown
                  options={yearOptions}
                  value={year}
                  setValue={setYear}
                />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500">Культура:</span>
                <Dropdown
                  options={cropOptions}
                  value={crop}
                  setValue={setCrop}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">
                <span>Фильтрация применяется к аналитике и задачам.</span>
              </div>
            </div>
          </div>

          {/* Последние задачи */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-0 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center gap-2">
              <ClipboardList size={20} className="text-emerald-500" />
              <span className="text-lg font-semibold text-gray-800">
                Последние задачи
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {recentTasks.length === 0 && (
                <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
                  Нет задач за выбранный период
                </div>
              )}
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center px-6 py-4">
                  <span
                    className={`w-2 h-2 rounded-full mr-4 ${
                      task.status === 'completed'
                        ? 'bg-emerald-400'
                        : task.status === 'waiting'
                          ? 'bg-yellow-400'
                          : task.status === 'in_progress'
                            ? 'bg-blue-400'
                            : 'bg-red-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {task.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>
                        <Calendar size={13} className="inline" /> {task.date}
                      </span>
                      <span>•</span>
                      <span>{task.field}</span>
                      <span>•</span>
                      <span>Оператор: {task.operator}</span>
                      <span>•</span>
                      <span>Площадь: {task.area} га</span>
                      <span>•</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}
                      >
                        {statusLabels[task.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Аналитика по площадям и выполнению */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
            <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={20} className="text-blue-500" />
                <span className="font-semibold text-gray-800">
                  Выполнение задач по месяцам
                </span>
              </div>
              <img
                src="https://placehold.co/540x180/10b981/ffffff?text=Здесь+будет+график+Chart.js"
                alt="chart"
                className="rounded-xl my-4 border border-gray-100"
              />
              <div className="text-xs text-gray-400">
                * График подгружается из аналитики
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={20} className="text-indigo-500" />
                <span className="font-semibold text-gray-800">
                  Динамика обработанных площадей
                </span>
              </div>
              <img
                src="https://placehold.co/540x180/6366f1/ffffff?text=График+Chart.js"
                alt="chart"
                className="rounded-xl my-4 border border-gray-100"
              />
              <div className="text-xs text-gray-400">
                * Здесь будет динамика по гектарам
              </div>
            </div>
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
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
