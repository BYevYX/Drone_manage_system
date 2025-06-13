'use client';
import { useGlobalContext } from '@/src/app/GlobalContext';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Trash2,
  Plus,
  Check,
  X,
  ChevronDown,
  Sliders,
  MapPin,
  ChevronLeft,
  Save,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Стильные компоненты UI
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

export default function page({ params }: { params: { id: string } }) {
  const { requests } = useGlobalContext();

  const bid = requests.find((el) => Number(el.id) === Number(params.id));

  if (!bid) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 font-nekstmedium">
        Заявка не найдена
      </div>
    );
  }

  const [formData, setFormData] = useState({
    field: bid.field,
    treatmentType: bid.type,
    desiredDate: bid.date,
    desiredTime: '',
    chemical: bid.details?.chemicals,
    dosage: bid.details?.dosage,
    height: '',
    speed: '',
    comments: '',
  });

  const [activeTab, setActiveTab] = useState('details');
  const [showZoneModal, setShowZoneModal] = useState(false);

  const fields = [
    'Выберите поле',
    'Поле №1 (Пшеница, 45 га)',
    'Поле №2 (Кукуруза, 32 га)',
    'Поле №3 (Подсолнечник, 28 га)',
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br pt-[15px] pb-[70px] from-gray-50 to-gray-100 px-8">
      {/* Хедер с навигацией */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-8"
      >
        <Link href={'/dashboard'}>
          <button className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors">
            <ChevronLeft size={20} className="mr-1" />
            Назад к заявкам
          </button>
        </Link>
        <ChevronRight size={16} className="mx-2 text-gray-400" />
        <span className="text-gray-800 font-medium">
          Редактирование №{bid.id}
        </span>
      </motion.div>
      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Левая колонка - форма */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="p-6">
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
                  Карта обработки
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
                            setFormData({
                              ...formData,
                              dosage: e.target.value,
                            })
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
                <div className="h-96 relative">
                  <MapContainer
                    center={[51.505, -0.09]}
                    zoom={15}
                    style={{ height: '100%', borderRadius: '12px' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Polygon
                      positions={[
                        [51.509, -0.08],
                        [51.503, -0.06],
                        [51.51, -0.047],
                      ]}
                      pathOptions={{ color: '#10B981', fillOpacity: 0.4 }}
                    />
                  </MapContainer>

                  <div className="absolute bottom-4 right-4 z-[1000]">
                    <button
                      className="p-3 bg-white rounded-xl shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                      onClick={() => setShowZoneModal(true)}
                    >
                      <Plus size={20} className="text-emerald-600" />
                    </button>
                  </div>
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

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Культура:</span>
                  <span className="font-medium">{bid.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Площадь:</span>
                  <span className="font-medium">{bid.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Тип почвы:</span>
                  <span className="font-medium">Чернозём</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Последняя обработка:</span>
                  <span className="font-medium">{bid.date}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <h3 className="font-medium text-lg mb-4">История обработок</h3>

              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Опрыскивание</div>
                      <div className="text-sm text-gray-500">15.02.2024</div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                      Завершено
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Картографирование</div>
                      <div className="text-sm text-gray-500">10.02.2024</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Анализ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
      {/* Кнопки действий внизу страницы */}
      <div className="mt-8 flex justify-end space-x-4">
        <button className="px-6 py-3 bg-white text-red-600 rounded-xl border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium">
          <Trash2 size={18} /> Удалить заявку
        </button>
        <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium">
          <Save size={18} /> Сохранить изменения
        </button>
      </div>
      {/* Модальное окно добавления зоны */}
      <AnimatePresence>
        {showZoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">
                  Добавить зону обработки
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название зоны
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Площадь (га)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowZoneModal(false)}
                  >
                    Отменить
                  </button>
                  <button
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    onClick={() => setShowZoneModal(false)}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// export default function page({ params }: { params: { id: string } }) {
//   const { requests } = useGlobalContext();
//   params.id = String(requests[0].id);
//   return <div>{params.id}</div>;
// }
