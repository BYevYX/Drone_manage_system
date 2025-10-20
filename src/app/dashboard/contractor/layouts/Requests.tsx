'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ClipboardList,
  ChevronDown,
  Check,
  MapPin,
  Trash2,
  Edit,
  Map,
  Eye,
  FileText,
  MessageSquare,
  LogOut,
  CheckCircle2,
  User,
  Settings,
  Package,
  Bell,
  ChartBar,
  Users,
  CalendarDays,
  Fuel,
  Leaf,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  BarChart2,
  Layers,
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { div } from 'framer-motion/client';
import EditBid from './bids/EditBid';
import { useGlobalContext } from '@/src/app/GlobalContext';
import Link from 'next/link';
interface Request {
  id: number;
  date: string;
  field: string;
  crop: string;
  type: string;
  area: number;
  status: 'new' | 'in_progress' | 'completed' | 'rejected';
  details?: {
    chemicals?: string;
    dosage?: string;
    droneType?: string;
    operatorNotes?: string;
  };
}
const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'in_progress', label: 'В обработке' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'rejected', label: 'Отклонённые' },
];

const treatmentOptions = [
  { value: 'all', label: 'Все' },
  { value: 'spraying', label: 'Опрыскивание' },
  { value: 'fertilization', label: 'Внесение удобрений' },
  { value: 'mapping', label: 'Картографирование' },
];

export default function Requests({ setActiveMenu }) {
  const [status, setStatus] = useState('all');
  const [treatmentType, setTreatmentType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      date: '2025-02-15',
      field: 'Поле №3 (Южное)',
      crop: 'Пшеница озимая',
      type: 'Опрыскивание',
      area: 45,
      status: 'completed',
      details: {
        chemicals: 'Гербицид "Агрохит"',
        dosage: '1.2 л/га',
        droneType: 'DJI Agras T40',
      },
    },
    {
      id: 2,
      date: '2025-02-10',
      field: 'Поле №1 (Северное)',
      crop: 'Кукуруза',
      type: 'Внесение удобрений',
      area: 32,
      status: 'in_progress',
      details: {
        chemicals: 'NPK 15-15-15',
        dosage: '80 кг/га',
        droneType: 'DJI Agras T30',
      },
    },
    {
      id: 3,
      date: '2025-02-05',
      field: 'Поле №2 (Центральное)',
      crop: 'Подсолнечник',
      type: 'Картографирование',
      area: 28,
      status: 'new',
    },
  ]);
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Заголовок и кнопка создания новой заявки */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Мои заявки</h2>
          <button
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
            onClick={() => setActiveMenu('addbid')}
          >
            <Plus size={18} /> Новая заявка
          </button>
        </div>

        {/* Фильтры и поиск */}
        {/* <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="all">Все</option>
                <option value="new">Новые</option>
                <option value="in_progress">В обработке</option>
                <option value="completed">Завершённые</option>
                <option value="rejected">Отклонённые</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип обработки
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="all">Все</option>
                <option value="spraying">Опрыскивание</option>
                <option value="fertilization">Внесение удобрений</option>
                <option value="mapping">Картографирование</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата с
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата по
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Поиск по номеру заявки или полю..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button className="ml-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <RefreshCw size={18} />
            </button>
          </div>
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {/* Тип обработки */}
          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
              Тип обработки
            </label>
            <ModernSelect
              options={treatmentOptions.map((opt) => opt.label)}
              value={
                treatmentOptions.find((opt) => opt.value === treatmentType)
                  ?.label || 'Все'
              }
              onChange={(selectedLabel) => {
                const selectedOption = treatmentOptions.find(
                  (opt) => opt.label === selectedLabel,
                );
                if (selectedOption) setTreatmentType(selectedOption.value);
              }}
            />
          </div>

          {/* Дата с */}
          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
              Дата с
            </label>
            <input
              type="date"
              className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Дата по */}
          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
              Дата по
            </label>
            <input
              type="date"
              className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Поиск и кнопка обновления */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-black pointer-events-none z-10">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск по номеру заявки или полю..."
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </motion.button>
        </div>

        {/* Таблица заявок */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Поле
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип обработки
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Площадь (га)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.field}
                      <div className="text-xs text-gray-500">
                        {request.crop}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : request.status === 'new'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status === 'completed'
                          ? 'Завершено'
                          : request.status === 'in_progress'
                            ? 'В обработке'
                            : request.status === 'new'
                              ? 'Новая'
                              : 'Отклонена'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-emerald-600 hover:text-emerald-900"
                          // onClick={() => viewRequestDetails(request.id)}
                        >
                          <Eye size={18} />
                        </button>
                        {(request.status === 'new' ||
                          request.status === 'in_progress') && (
                          <>
                            <Link href={`/dashboard/edit/${request.id}`}>
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                // onClick={() => cancelRequest(request.id)}
                              >
                                <Edit size={16} />
                              </button>
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-900"
                              // onClick={() => cancelRequest(request.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Пагинация */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Показано <span className="font-medium">1</span> -{' '}
              <span className="font-medium">5</span> из{' '}
              <span className="font-medium">12</span>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Назад
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Вперед
              </button>
            </div>
          </div>
        </div>

        {/* Модальное окно для просмотра деталей заявки */}
        {/* {selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )} */}

        {/* Модальное окно для создания новой заявки */}
        {/* {showRequestModal && (
          <NewRequestModal
            onClose={() => setShowRequestModal(false)}
            onSubmit={handleNewRequestSubmit}
          />
        )} */}
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
        {/* <span className="text-emerald-500 ml-0.5">*</span> */}
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
