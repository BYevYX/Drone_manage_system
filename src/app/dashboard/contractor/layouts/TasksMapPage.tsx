'use client';
import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  MapPin,
  ChevronDown,
  Filter,
  Check,
  Eye,
  Calendar,
  ListChecks,
  Loader2,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Типы данных для задания и поля
type TaskStatus = 'waiting' | 'in_progress' | 'completed' | 'rejected';

interface Task {
  id: number;
  fieldId: number;
  name: string;
  operation: string;
  crop: string;
  area: number;
  date: string;
  status: TaskStatus;
  drone: string;
  operator: string;
  chemical?: string;
  dosage?: string;
  zone?: string;
  polygon: [number, number][];
}

interface Field {
  id: number;
  name: string;
  crop: string;
  area: number;
  coordinates: [number, number][];
  color: string;
}

// Моки для полей и заданий
const fields: Field[] = [
  {
    id: 1,
    name: 'Поле №1 (Северное)',
    crop: 'Пшеница озимая',
    area: 45,
    coordinates: [
      [55.7558, 37.6173],
      [55.7565, 37.6205],
      [55.753, 37.622],
      [55.752, 37.618],
    ],
    color: '#34d399',
  },
  {
    id: 2,
    name: 'Поле №2 (Центральное)',
    crop: 'Кукуруза',
    area: 32,
    coordinates: [
      [55.7578, 37.6135],
      [55.7582, 37.616],
      [55.755, 37.6168],
      [55.7542, 37.6142],
    ],
    color: '#fbbf24',
  },
];

const tasks: Task[] = [
  {
    id: 101,
    fieldId: 1,
    name: 'Опрыскивание — Поле №1',
    operation: 'Опрыскивание',
    crop: 'Пшеница озимая',
    area: 15,
    date: '2025-06-09',
    status: 'waiting',
    drone: 'DJI Agras T40',
    operator: 'Петров И.И.',
    chemical: 'Гербицид Агрохит',
    dosage: '1.2 л/га',
    polygon: [
      [55.7559, 37.6175],
      [55.7563, 37.6189],
      [55.7552, 37.6192],
      [55.7547, 37.6177],
    ],
    zone: 'Северо-западная часть',
  },
  {
    id: 102,
    fieldId: 2,
    name: 'Внесение удобрений — Поле №2',
    operation: 'Внесение удобрений',
    crop: 'Кукуруза',
    area: 32,
    date: '2025-06-11',
    status: 'in_progress',
    drone: 'DJI Agras T30',
    operator: 'Иванова А.А.',
    chemical: 'NPK 15-15-15',
    dosage: '80 кг/га',
    polygon: [
      [55.7578, 37.6135],
      [55.7582, 37.616],
      [55.755, 37.6168],
      [55.7542, 37.6142],
    ],
  },
  {
    id: 103,
    fieldId: 1,
    name: 'Картографирование — Поле №1',
    operation: 'Картографирование',
    crop: 'Пшеница озимая',
    area: 30,
    date: '2025-06-10',
    status: 'completed',
    drone: 'DJI Phantom 4',
    operator: 'Петров И.И.',
    polygon: [
      [55.7558, 37.6173],
      [55.7563, 37.619],
      [55.7547, 37.6192],
      [55.7541, 37.6177],
    ],
  },
];

// Статусы для фильтра
const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'waiting', label: 'Ожидает' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'completed', label: 'Завершено' },
  { value: 'rejected', label: 'Отклонено' },
];
const statusLabels: Record<TaskStatus, string> = {
  waiting: 'Ожидает',
  in_progress: 'В работе',
  completed: 'Завершено',
  rejected: 'Отклонено',
};
const statusColors: Record<TaskStatus, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function TasksMapPage() {
  const [status, setStatus] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Фильтр заданий по статусу
  const filteredTasks = tasks.filter(
    (task) => status === 'all' || task.status === status,
  );
  // Центр для карты (по центру всех полей)
  const defaultCenter: [number, number] = [55.7558, 37.6173];

  // Для выделения выбранного задания
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="min-h-[100vh]  shadow-md bg-white rounded-[20px] border border-gray-100 py-0 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Заголовок */}
          <div className="flex items-center gap-3 mb-3">
            <ClipboardList size={32} className="text-emerald-600" />
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Карта заданий
            </h1>
          </div>
          {/* Фильтр по статусу */}
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-emerald-400" />
              <span className="font-medium text-gray-700">Статус:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-semibold transition-all ${
                    status === opt.value
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                      : 'bg-white text-gray-700 hover:bg-emerald-50'
                  }`}
                  onClick={() => setStatus(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Карта */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div style={{ width: '100%', height: 440 }}>
              <MapContainer
                center={defaultCenter}
                zoom={14}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
                className="rounded-xl"
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Полигоны полей (подложка) */}
                {fields.map((field) => (
                  <Polygon
                    key={field.id}
                    positions={field.coordinates}
                    pathOptions={{
                      color: '#d1d5db',
                      fillOpacity: 0.07,
                      weight: 2,
                    }}
                  />
                ))}
                {/* Полигоны заданий */}
                {filteredTasks.map((task) => (
                  <Polygon
                    key={task.id}
                    positions={task.polygon}
                    pathOptions={{
                      color:
                        task.status === 'completed'
                          ? '#22c55e'
                          : task.status === 'waiting'
                            ? '#fbbf24'
                            : task.status === 'in_progress'
                              ? '#3b82f6'
                              : '#ef4444',
                      fillOpacity: selectedTaskId === task.id ? 0.36 : 0.18,
                      weight: selectedTaskId === task.id ? 5 : 3,
                      dashArray: selectedTaskId === task.id ? '6' : '2 8',
                    }}
                    eventHandlers={{
                      click: () => setSelectedTaskId(task.id),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <div className="font-bold text-base mb-1">
                          {task.name}
                        </div>
                        <div className="text-gray-700 text-sm">
                          Операция:{' '}
                          <span className="font-medium">{task.operation}</span>
                        </div>
                        <div className="text-gray-700 text-sm">
                          Культура:{' '}
                          <span className="font-medium">{task.crop}</span>
                        </div>
                        <div className="text-gray-700 text-sm">
                          Площадь:{' '}
                          <span className="font-medium">{task.area} га</span>
                        </div>
                        <div className="text-gray-700 text-sm">
                          Дата: <span className="font-medium">{task.date}</span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}
                          >
                            {statusLabels[task.status]}
                          </span>
                        </div>
                        {task.chemical && (
                          <div className="text-xs mt-1 text-gray-600">
                            Препарат: {task.chemical}
                          </div>
                        )}
                        {task.dosage && (
                          <div className="text-xs text-gray-600">
                            Доза: {task.dosage}
                          </div>
                        )}
                        {task.zone && (
                          <div className="text-xs text-gray-500">
                            Зона: {task.zone}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Polygon>
                ))}
                {/* Маркеры заданий */}
                {filteredTasks.map((task) => (
                  <Marker
                    key={task.id + '-marker'}
                    position={task.polygon[0]}
                    icon={L.icon({
                      iconUrl:
                        'https://cdn-icons-png.flaticon.com/512/1379/1379088.png',
                      iconSize: [28, 28],
                      iconAnchor: [14, 28],
                    })}
                  />
                ))}
              </MapContainer>
            </div>
          </div>
          {/* Список заданий */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-0 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center gap-2">
              <ListChecks size={20} className="text-emerald-500" />
              <span className="text-lg font-semibold text-gray-800">
                Все задания на период
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
                  <Loader2 className="inline-block animate-spin" />
                  Нет заданий по выбранному фильтру
                </div>
              )}
              {filteredTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center px-6 py-4 cursor-pointer transition-all ${
                      isSelected ? 'bg-emerald-50/60' : 'hover:bg-emerald-50/40'
                    }`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
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
                        {isSelected && (
                          <Eye size={16} className="text-emerald-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar size={14} /> {task.date}
                        <span>•</span>
                        <span>{task.operation}</span>
                        <span>•</span>
                        <span>
                          Поле:{' '}
                          {fields.find((f) => f.id === task.fieldId)?.name}
                        </span>
                        <span>•</span>
                        <span>Дрон: {task.drone}</span>
                        <span>•</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}
                        >
                          {statusLabels[task.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
