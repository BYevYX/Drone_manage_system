'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  Layers,
  Plus,
  X,
  Save,
  MousePointerClick,
  ChevronDown,
  Check,
  Divide,
  Route,
  Eye,
  Undo,
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Типы данных
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
interface DroneRoute {
  droneId: number;
  waypoints: [number, number][];
  color: string;
}

const cropOptions = [
  'Пшеница озимая',
  'Кукуруза',
  'Подсолнечник',
  'Ячмень',
  'Соя',
  'Картофель',
  'Сахарная свекла',
  'Рапс',
  'Другое',
];
const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'inactive', label: 'Неактивные' },
];
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

const droneRoutes: DroneRoute[] = [
  {
    droneId: 1,
    waypoints: [
      [55.7559, 37.6175],
      [55.7555, 37.6185],
      [55.755, 37.619],
    ],
    color: '#10b981',
  },
  {
    droneId: 2,
    waypoints: [
      [55.756, 37.62],
      [55.7555, 37.621],
      [55.7545, 37.6215],
    ],
    color: '#3b82f6',
  },
];

export default function FieldsMapPage() {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [addingMode, setAddingMode] = useState(false);
  const [newPolygon, setNewPolygon] = useState<[number, number][]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    name: '',
    crop: cropOptions[0],
    status: 'active' as 'active' | 'inactive',
    color: '#10b981',
  });
  const [viewSegments, setViewSegments] = useState(true);
  const [viewRoutes, setViewRoutes] = useState(true);

  // ОТМЕНА: после добавления поля — сбросить всё
  const resetNewField = () => {
    setNewPolygon([]);
    setShowAddModal(false);
    setAddingMode(false);
    setNewFieldData({
      name: '',
      crop: cropOptions[0],
      status: 'active',
      color: '#10b981',
    });
  };

  // Удаление автоматического открытия модалки при >= 3 точках:
  // Теперь открываем модалку только вручную (кнопкой "Добавить"), можно ставить сколько угодно точек
  // Добавление точек
  function FieldDrawingEvents() {
    useMapEvents({
      click(e) {
        if (addingMode && !showAddModal) {
          setNewPolygon((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
        }
      },
    });
    return null;
  }

  // Удалить последнюю точку
  const removeLastPoint = () => setNewPolygon((prev) => prev.slice(0, -1));

  // Сохранить новое поле
  const handleSaveNewField = () => {
    if (newPolygon.length < 3 || !newFieldData.name.trim()) return;
    const area = Math.abs(polygonArea(newPolygon));
    setFields((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        name: newFieldData.name,
        crop: newFieldData.crop,
        area: Number(area.toFixed(1)),
        coordinates: newPolygon,
        status: newFieldData.status,
        color: newFieldData.color,
      },
    ]);
    resetNewField();
  };

  // Фильтрация
  const filteredFields = fields.filter((f) => {
    const statusMatch = status === 'all' || f.status === status;
    const searchMatch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.crop.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Центр карты
  const defaultCenter: [number, number] = [55.7558, 37.6173];

  // Площадь полигона (примерно)
  function polygonArea(coords: [number, number][]) {
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[(i + 1) % coords.length];
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area / 2) * 100;
  }

  // ==================== UI ======================
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Заголовок */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Map size={28} className="text-emerald-500" />
            Карта полей
          </h2>
          <button
            className={`px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 ${
              addingMode ? 'opacity-60 pointer-events-none' : ''
            }`}
            onClick={() => {
              setAddingMode(true);
              setNewPolygon([]);
            }}
            disabled={addingMode}
            title="Создать новое поле"
          >
            <Plus size={18} /> Новое поле
          </button>
        </div>

        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 z-100">
          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
              Статус
            </label>
            <ModernSelect
              options={statusOptions.map((opt) => opt.label)}
              value={
                statusOptions.find((opt) => opt.value === status)?.label ||
                'Все'
              }
              onChange={(selectedLabel) => {
                const selectedOption = statusOptions.find(
                  (opt) => opt.label === selectedLabel,
                );
                if (selectedOption) setStatus(selectedOption.value);
              }}
            />
          </div>
          {/* Поиск */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
              Поиск по названию или культуре
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black pointer-events-none z-10">
                <svg
                  width={18}
                  height={18}
                  className="text-gray-400"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M10 2a8 8 0 0 1 8 8c0 1.657-.504 3.19-1.364 4.46l4.451 4.45a1 1 0 1 1-1.414 1.415l-4.45-4.45A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Введите название поля или культуру..."
                className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end gap-2 mt-1">
            <button
              className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-1 ${
                viewSegments
                  ? 'bg-emerald-500/90 text-white border-emerald-500'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
              onClick={() => setViewSegments((v) => !v)}
              title="Показать/скрыть сегменты"
            >
              <Divide size={16} /> Сегменты
            </button>
            <button
              className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-1 ${
                viewRoutes
                  ? 'bg-blue-500/90 text-white border-blue-500'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
              onClick={() => setViewRoutes((v) => !v)}
              title="Показать/скрыть маршруты"
            >
              <Route size={16} /> Маршруты
            </button>
          </div>
        </div>

        {/* Инструкция по добавлению */}
        {addingMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-lg text-emerald-900 my-2"
          >
            <MousePointerClick size={20} />
            Кликните по карте, чтобы отметить контур поля (минимум 3 точки,
            можно больше). При ошибке можно удалить последнюю точку. Для
            завершения нажмите "Добавить".
            <button
              className="ml-auto px-2 py-1 text-red-600 hover:text-red-800"
              onClick={resetNewField}
              title="Отмена"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}

        {/* Кнопки управления полигоном */}
        {addingMode && (
          <div className="flex gap-2 mt-2">
            <button
              className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-70"
              disabled={newPolygon.length < 3 || showAddModal}
              onClick={() => setShowAddModal(true)}
              title="Добавить поле"
            >
              <Save size={16} /> Добавить
            </button>
            <button
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-70"
              disabled={newPolygon.length === 0}
              onClick={removeLastPoint}
              title="Удалить последнюю точку"
            >
              <Undo size={16} /> Отменить точку
            </button>
            <div className="text-gray-500 flex items-center ml-4">
              Точек: <span className="font-bold ml-1">{newPolygon.length}</span>
            </div>
          </div>
        )}

        {/* Карта */}
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden z-0"
          style={{
            position: 'relative',
            transition: 'z-index 0.2s',
          }}
        >
          <div style={{ width: '100%', height: '520px' }}>
            <MapContainer
              center={defaultCenter}
              zoom={14}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
              className="rounded-xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Существующие поля */}
              {filteredFields.map((field) => (
                <Polygon
                  key={field.id}
                  positions={field.coordinates as [number, number][]}
                  pathOptions={{
                    color: field.color,
                    fillOpacity: 0.4,
                    weight: selectedFieldId === field.id ? 4 : 2,
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
                        <span className="font-medium">{field.area} га</span>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            field.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {field.status === 'active' ? 'Активно' : 'Неактивно'}
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
              {/* Сегменты полей */}
              {viewSegments &&
                filteredFields
                  .filter((f) => f.segments && f.segments.length)
                  .flatMap((f) =>
                    f.segments!.map((seg) => (
                      <Polygon
                        key={'seg-' + seg.id}
                        positions={seg.coordinates}
                        pathOptions={{
                          color: '#6366f1',
                          fillOpacity: 0.15,
                          dashArray: '2, 8',
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div>
                            <b>{seg.name}</b>
                            {seg.taskType && (
                              <div className="text-xs mt-1 text-gray-600">
                                {seg.taskType}
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Polygon>
                    )),
                  )}

              {/* Маршруты дронов */}
              {viewRoutes &&
                droneRoutes.map((route) => (
                  <Polyline
                    key={'route-' + route.droneId}
                    positions={route.waypoints}
                    pathOptions={{
                      color: route.color,
                      dashArray: '6, 10',
                      weight: 4,
                    }}
                  />
                ))}

              {/* Маркеры для полей */}
              {filteredFields.map((field) => (
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

              {/* Добавление нового поля */}
              {addingMode && (
                <>
                  <FieldDrawingEvents />
                  {newPolygon.length > 0 && (
                    <Polygon
                      positions={newPolygon}
                      pathOptions={{
                        color: '#10b981',
                        fillOpacity: 0.2,
                        dashArray: '5, 10',
                        weight: 3,
                      }}
                    />
                  )}
                  {newPolygon.map((pos, idx) => (
                    <Marker
                      key={idx}
                      position={pos}
                      icon={L.icon({
                        iconUrl:
                          'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                        iconSize: [20, 20],
                        iconAnchor: [10, 20],
                        className: 'opacity-70',
                      })}
                    />
                  ))}
                </>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Модальное окно добавления нового поля */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm "
            >
              <motion.div
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.92 }}
                className="bg-white rounded-xl shadow-2xl p-6 min-w-[340px] max-w-full"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-lg font-bold flex items-center gap-2 text-emerald-700">
                    <Layers size={20} />
                    Новое поле
                  </div>
                  <button
                    onClick={resetNewField}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название поля
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                      value={newFieldData.name}
                      onChange={(e) =>
                        setNewFieldData((f) => ({
                          ...f,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Например, Поле №4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Культура
                    </label>
                    <ModernSelect
                      options={cropOptions}
                      value={newFieldData.crop}
                      onChange={(val) =>
                        setNewFieldData((f) => ({
                          ...f,
                          crop: val,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Статус
                    </label>
                    <ModernSelect
                      options={['Активно', 'Неактивно']}
                      value={
                        newFieldData.status === 'active'
                          ? 'Активно'
                          : 'Неактивно'
                      }
                      onChange={(val) =>
                        setNewFieldData((f) => ({
                          ...f,
                          status: val === 'Активно' ? 'active' : 'inactive',
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    onClick={() => {
                      handleSaveNewField();
                    }}
                    disabled={
                      !newFieldData.name.trim() || newPolygon.length < 3
                    }
                  >
                    <Save size={18} />
                    Сохранить
                  </button>
                  <button
                    className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 flex items-center justify-center gap-2"
                    onClick={resetNewField}
                  >
                    <X size={18} /> Отмена
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

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
    <div className="space-y-2 " ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
          {label}
        </label>
      )}
      <div className="relative ">
        <motion.div whileHover={{ y: -1 }} className="relative z-20 ">
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
              className="absolute z-30 w-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80 "
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
