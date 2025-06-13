'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Check,
  ChevronDown,
  MapPin,
  ChevronLeft,
  Save,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Типы данных для карты полей
interface Field {
  id: number;
  name: string;
  crop: string;
  area: number;
  coordinates: [number, number][];
  status: 'active' | 'inactive';
  color: string;
  segments?: FieldSegment[];
}
interface FieldSegment {
  id: number;
  name: string;
  coordinates: [number, number][];
  assignedDroneId?: number;
  taskType?: string;
}

// Примерные поля
const initialFields: Field[] = [
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
    status: 'active',
    color: '#34d399',
    segments: [
      {
        id: 1,
        name: 'Сегмент A',
        coordinates: [
          [55.7558, 37.6173],
          [55.7565, 37.619],
          [55.7547, 37.6192],
          [55.7541, 37.6177],
        ],
        assignedDroneId: 1,
        taskType: 'Опрыскивание',
      },
      {
        id: 2,
        name: 'Сегмент B',
        coordinates: [
          [55.7565, 37.619],
          [55.7565, 37.6205],
          [55.753, 37.622],
          [55.7547, 37.6192],
        ],
        assignedDroneId: 2,
        taskType: 'Внесение удобрений',
      },
    ],
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
    status: 'inactive',
    color: '#fbbf24',
  },
];

const GlassCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`backdrop-blur-lg bg-white/70 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.1)] border border-white/20 ${className}`}
  >
    {children}
  </div>
);

const ModernSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

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
      <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
        {label}
        <span className="text-emerald-500 ml-0.5">*</span>
      </label>
      <div className="relative">
        <motion.div whileHover={{ y: -1 }} className="relative z-20">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-3.5 text-left bg-white/90 backdrop-blur-sm rounded-xl border ${
              isOpen
                ? 'border-emerald-400 ring-2 ring-emerald-400/30'
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
                  isOpen ? 'text-emerald-500' : 'group-hover:text-emerald-500'
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
              className="absolute z-30 w-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80"
            >
              {options.map((option, index) => (
                <li
                  key={option}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between ${
                    value === option ? 'bg-emerald-50' : 'hover:bg-gray-50'
                  } ${index === 0 ? '' : 'border-t border-gray-100'}`}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-gray-700">{option}</span>
                  {value === option && (
                    <Check size={16} className="text-emerald-500" />
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

export default function AddBid({ setActiveMenu }) {
  const [formData, setFormData] = useState({
    field: 'Выберите поле',
    treatmentType: 'Выберите тип обработки',
    desiredDate: '',
    desiredTime: '',
    chemical: 'Выберите препарат',
    dosage: '',
    height: '',
    speed: '',
    comments: '',
  });

  const [activeTab, setActiveTab] = useState('details');
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  const fields = ['Выберите поле', ...initialFields.map((f) => f.name)];

  const treatmentTypes = [
    'Выберите тип обработки',
    'Опрыскивание',
    'Внесение удобрений',
    'Десикация',
    'Картографирование',
  ];

  const chemicals = [
    'Выберите препарат',
    'Гербицид "Агрохит"',
    'Фунгицид "Здоровье"',
    'Инсектицид "Щит"',
  ];

  // Для отображения информации о поле
  const selectedPoly = initialFields.find((f) => f.name === formData.field);

  // Центр карты
  const defaultCenter: [number, number] = [55.7558, 37.6173];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-8">
      {/* Хедер с навигацией */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-8 pt-0"
      >
        <button
          className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors"
          onClick={() => setActiveMenu('requests')}
        >
          <ChevronLeft size={20} className="mr-1" />
          Назад к заявкам
        </button>
        <ChevronRight size={16} className="mx-2 text-gray-400" />
        <span className="text-gray-800 font-medium">Новая заявка</span>
      </motion.div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Левая колонка - форма */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Создание новой заявки
              </h2>

              <div className="flex space-x-4 mb-6 border-b border-gray-100 pb-4">
                <button
                  className={`pb-2 px-1 font-medium ${activeTab === 'details' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Основные данные
                </button>
                <button
                  className={`pb-2 px-1 font-medium ${activeTab === 'map' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('map')}
                >
                  Карта полей
                </button>
              </div>

              {activeTab === 'details' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModernSelect
                    label="Поле"
                    options={fields}
                    value={formData.field}
                    onChange={(value) =>
                      setFormData({ ...formData, field: value })
                    }
                  />

                  <ModernSelect
                    label="Тип обработки"
                    options={treatmentTypes}
                    value={formData.treatmentType}
                    onChange={(value) =>
                      setFormData({ ...formData, treatmentType: value })
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                      Дата обработки
                      <span className="text-emerald-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
                      value={formData.desiredDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          desiredDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                      Время обработки
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
                      value={formData.desiredTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          desiredTime: e.target.value,
                        })
                      }
                    />
                  </div>

                  {formData.treatmentType.includes('Опрыскивание') && (
                    <>
                      <ModernSelect
                        label="Препарат"
                        options={chemicals}
                        value={formData.chemical}
                        onChange={(value) =>
                          setFormData({ ...formData, chemical: value })
                        }
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                          Доза (л/га)
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
                          value={formData.dosage}
                          onChange={(e) =>
                            setFormData({ ...formData, dosage: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                      Высота (м)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({ ...formData, height: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                      Скорость (м/с)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
                      value={formData.speed}
                      onChange={(e) =>
                        setFormData({ ...formData, speed: e.target.value })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                      Комментарии
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
                      placeholder="Особые требования..."
                      value={formData.comments}
                      onChange={(e) =>
                        setFormData({ ...formData, comments: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : (
                // Карта полей: только отображение (как на странице "Карта полей").
                <div className="h-96 relative">
                  <MapContainer
                    center={defaultCenter}
                    zoom={14}
                    style={{ height: '100%', borderRadius: '12px' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {initialFields.map((field) => (
                      <Polygon
                        key={field.id}
                        positions={field.coordinates}
                        pathOptions={{
                          color:
                            formData.field === field.name
                              ? '#059669'
                              : field.color,
                          fillOpacity:
                            formData.field === field.name ? 0.35 : 0.15,
                          weight: formData.field === field.name ? 4 : 2,
                        }}
                        eventHandlers={{
                          click: () => setSelectedFieldId(field.id),
                        }}
                      >
                        <Popup>
                          <div className="min-w-[180px]">
                            <div className="font-bold text-base mb-1">
                              {field.name}
                            </div>
                            <div className="text-gray-700 text-sm">
                              Культура:{' '}
                              <span className="font-medium">{field.crop}</span>
                            </div>
                            <div className="text-gray-700 text-sm">
                              Площадь:{' '}
                              <span className="font-medium">
                                {field.area} га
                              </span>
                            </div>
                            <div className="mt-1">
                              <span
                                className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  field.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {field.status === 'active'
                                  ? 'Активно'
                                  : 'Неактивно'}
                              </span>
                            </div>
                            {field.segments && (
                              <div className="mt-2">
                                <b>Сегменты:</b>
                                <ul className="text-xs ml-2 mt-1 space-y-1">
                                  {field.segments.map((seg) => (
                                    <li key={seg.id}>
                                      {seg.name}
                                      {seg.taskType && (
                                        <>
                                          {' '}
                                          –{' '}
                                          <span className="text-gray-500">
                                            {seg.taskType}
                                          </span>
                                        </>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Polygon>
                    ))}
                    {initialFields.map((field) => (
                      <Marker
                        key={field.id + '-marker'}
                        position={field.coordinates[0]}
                        icon={L.icon({
                          iconUrl:
                            'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                          iconSize: [30, 30],
                          iconAnchor: [15, 30],
                        })}
                      />
                    ))}
                  </MapContainer>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Правая колонка - информация */}
        <div className="space-y-6">
          <GlassCard>
            <div className="p-6">
              <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-600" /> Информация о
                поле
              </h3>

              {selectedPoly ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Культура:</span>
                    <span className="font-medium">{selectedPoly.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Площадь:</span>
                    <span className="font-medium">{selectedPoly.area} га</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Тип почвы:</span>
                    <span className="font-medium">{selectedPoly['soil']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Последняя обработка:</span>
                    <span className="font-medium">
                      {selectedPoly['lastTreatment']}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">
                  Выберите поле для просмотра информации
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <h3 className="font-medium text-lg mb-4">Рекомендации</h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="font-medium">Оптимальное время</div>
                  <div className="text-sm text-gray-500">Утро (6:00-10:00)</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="font-medium">Рекомендуемый препарат</div>
                  <div className="text-sm text-gray-500">
                    Гербицид "Агрохит"
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Кнопки действий внизу страницы */}
      <div className=" bottom-0 py-4 bg-gradient-to-t from-white to-white/0 -mx-8 px-8">
        <div className="flex justify-end space-x-4">
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium shadow-md">
            <Save size={18} /> Создать заявку
          </button>
        </div>
      </div>
    </div>
  );
}
