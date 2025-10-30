'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  ChevronDown,
  Filter,
  User,
  Users,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

// Примерные данные графика смен
const operators = [
  { id: 1, name: 'Петров И.И.' },
  { id: 2, name: 'Иванова А.А.' },
  { id: 3, name: 'Сидоров В.В.' },
  { id: 4, name: 'Морозова Е.Г.' },
];

const shifts = [
  {
    id: 1,
    operatorId: 1,
    date: '2025-06-09',
    start: '08:00',
    end: '20:00',
    type: 'Дневная',
    status: 'completed',
  },
  {
    id: 2,
    operatorId: 2,
    date: '2025-06-09',
    start: '20:00',
    end: '08:00',
    type: 'Ночная',
    status: 'in_progress',
  },
  {
    id: 3,
    operatorId: 3,
    date: '2025-06-10',
    start: '08:00',
    end: '20:00',
    type: 'Дневная',
    status: 'waiting',
  },
  {
    id: 4,
    operatorId: 4,
    date: '2025-06-10',
    start: '20:00',
    end: '08:00',
    type: 'Ночная',
    status: 'waiting',
  },
  {
    id: 5,
    operatorId: 1,
    date: '2025-06-11',
    start: '08:00',
    end: '20:00',
    type: 'Дневная',
    status: 'waiting',
  },
  {
    id: 6,
    operatorId: 2,
    date: '2025-06-11',
    start: '20:00',
    end: '08:00',
    type: 'Ночная',
    status: 'waiting',
  },
];

const statusLabels: Record<string, string> = {
  waiting: 'Ожидает',
  in_progress: 'В работе',
  completed: 'Завершена',
  absent: 'Пропуск',
};
const statusColors: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
};

const shiftTypes = [
  { value: 'all', label: 'Все' },
  { value: 'Дневная', label: 'Дневные' },
  { value: 'Ночная', label: 'Ночные' },
];

const operatorOptions = [
  { value: 'all', label: 'Все операторы' },
  ...operators.map((o) => ({ value: o.id, label: o.name })),
];

export default function Shifts() {
  const [type, setType] = useState('all');
  const [operator, setOperator] = useState('all');

  // Фильтрация смен по оператору и типу
  const filteredShifts = shifts.filter(
    (shift) =>
      (type === 'all' || shift.type === type) &&
      (operator === 'all' || shift.operatorId === operator),
  );

  // Даты для группировки по дням
  const allDates = Array.from(new Set(shifts.map((s) => s.date))).sort();

  return (
    <div className="min-h-[100vh]">
      <div
        className="w-full px-8"
        style={{
          boxShadow:
            '0 4px 32px 0 rgba(31,38,135,0.09), 0 1.5px 8px 0 rgba(31,38,135,0.03)',
          borderRadius: '1.5rem',
          background: 'white',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Заголовок */}
          <div className="flex items-center gap-3 pt-7 pb-1">
            <CalendarClock size={32} className="text-emerald-600" />
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              График смен
            </h1>
          </div>
          {/* Фильтры */}
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-emerald-400" />
              <span className="font-medium text-gray-700">Тип смены:</span>
              <Dropdown options={shiftTypes} value={type} setValue={setType} />
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              <span className="font-medium text-gray-700">Оператор:</span>
              <Dropdown
                options={operatorOptions}
                value={operator}
                setValue={setOperator}
              />
            </div>
          </div>
          {/* Список смен по дням */}
          <div className="divide-y divide-gray-100 mb-10">
            {allDates.map((date) => (
              <div key={date} className="py-5">
                <div className="flex items-center gap-2 mb-2 text-gray-700 pl-1">
                  <Calendar size={18} className="text-emerald-400" />
                  <span className="font-semibold text-lg">
                    {formatDate(date)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredShifts.filter((s) => s.date === date).length ===
                    0 && (
                    <div className="col-span-2 text-gray-400 italic px-2 pb-3">
                      Нет смен
                    </div>
                  )}
                  {filteredShifts
                    .filter((s) => s.date === date)
                    .map((shift) => {
                      const op = operators.find(
                        (o) => o.id === shift.operatorId,
                      );
                      return (
                        <div
                          key={shift.id}
                          className="bg-emerald-50/30 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm"
                        >
                          <div className="flex flex-col items-center justify-center gap-1 w-12">
                            <User className="text-emerald-500" size={26} />
                            <span className="text-xs text-gray-500">
                              {shift.type}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 mb-0.5">
                              {op?.name}
                            </div>
                            <div className="text-sm text-gray-600 flex flex-wrap items-center gap-4">
                              <span>
                                <Clock3 className="inline mr-1" size={16} />
                                {shift.start} — {shift.end}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[shift.status]}`}
                              >
                                {statusLabels[shift.status] || shift.status}
                              </span>
                            </div>
                          </div>
                          {shift.status === 'completed' && (
                            <CheckCircle2
                              size={22}
                              className="text-emerald-500"
                            />
                          )}
                          {shift.status === 'absent' && (
                            <AlertCircle size={22} className="text-red-400" />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
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
  options: { value: any; label: string }[];
  value: any;
  setValue: (val: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:border-emerald-300 transition"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {selected?.label}
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 bg-white rounded-xl shadow border border-gray-100 min-w-[120px]">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-4 py-2 cursor-pointer text-sm hover:bg-emerald-50 ${
                value === opt.value
                  ? 'text-emerald-600 font-bold'
                  : 'text-gray-700'
              }`}
              onClick={() => {
                setValue(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Форматирование даты (YYYY-MM-DD → 9 июня 2025)
function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
