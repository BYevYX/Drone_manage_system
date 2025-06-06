'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ClipboardList,
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
import { ActiveMenuContext } from './ActiveMenuContext';

import EditBid from './client/layouts/bids/EditBid';
import { useGlobalContext } from '../GlobalContext';
import Dashboard from './client/layouts/Dashboard';
import AddBid from './client/layouts/bids/AddBid';
import Link from 'next/link';

import Requests from './client/layouts/Requests';
import Footer from '@/src/shared/ui/Footer';

const RoleConfig = {
  client: {
    menu: [
      { id: 'dashboard', icon: <Home size={20} />, label: 'Главная' },
      {
        id: 'requests',
        icon: <ClipboardList size={20} />,
        label: 'Мои заявки',
      },
      { id: 'fields', icon: <Map size={20} />, label: 'Карта полей' },
      { id: 'reports', icon: <ChartBar size={20} />, label: 'Отчёты' },
      { id: 'support', icon: <MessageSquare size={20} />, label: 'Поддержка' },
    ],
    stats: [
      { title: 'Активные заявки', value: 3, color: 'bg-blue-100', trend: 'up' },
      {
        title: 'Обработано (га)',
        value: 45,
        color: 'bg-green-100',
        trend: 'up',
      },
      { title: 'Поля', value: 7, color: 'bg-emerald-100', trend: 'stable' },
      {
        title: 'Внесено удобрений (т)',
        value: 12,
        color: 'bg-yellow-100',
        trend: 'down',
      },
    ],
  },
  operator: {
    menu: [
      { id: 'tasks', icon: <ClipboardList size={20} />, label: 'Задачи' },
      //   { id: 'drones', icon: <Drone size={20} />, label: 'Дроны' },
      { id: 'map', icon: <Map size={20} />, label: 'Карта заданий' },
      { id: 'analytics', icon: <ChartBar size={20} />, label: 'Аналитика' },
      { id: 'shifts', icon: <CalendarDays size={20} />, label: 'График смен' },
      {
        id: 'flight-planning',
        icon: <Layers size={20} />,
        label: 'Планирование полетов',
      },
    ],
    stats: [
      {
        title: 'Активные задачи',
        value: 5,
        color: 'bg-yellow-100',
        trend: 'up',
      },
      {
        title: 'Дроны в работе',
        value: 3,
        color: 'bg-purple-100',
        trend: 'stable',
      },
      { title: 'Смен сегодня', value: 2, color: 'bg-blue-100', trend: 'down' },
      { title: 'Пройдено (км)', value: 120, color: 'bg-cyan-100', trend: 'up' },
    ],
  },
  manager: {
    menu: [
      { id: 'overview', icon: <Home size={20} />, label: 'Обзор' },
      { id: 'team', icon: <Users size={20} />, label: 'Команда' },
      { id: 'finance', icon: <ChartBar size={20} />, label: 'Финансы' },
      { id: 'settings', icon: <Settings size={20} />, label: 'Настройки' },
      { id: 'cadastre', icon: <MapPin size={20} />, label: 'Кадастр' },
      {
        id: 'integrations',
        icon: <RefreshCw size={20} />,
        label: 'Интеграции',
      },
    ],
    stats: [
      {
        title: 'Общая выручка',
        value: '₽245k',
        color: 'bg-emerald-100',
        trend: 'up',
      },
      { title: 'Новых клиентов', value: 8, color: 'bg-pink-100', trend: 'up' },
      {
        title: 'План/Факт работ',
        value: '92%',
        color: 'bg-blue-100',
        trend: 'stable',
      },
      {
        title: 'Активные сотрудники',
        value: 14,
        color: 'bg-orange-100',
        trend: 'down',
      },
    ],
  },
  supplier: {
    menu: [
      { id: 'orders', icon: <Package size={20} />, label: 'Заказы' },
      { id: 'inventory', icon: <ClipboardList size={20} />, label: 'Склад' },
      { id: 'deliveries', icon: <MapPin size={20} />, label: 'Поставки' },
      { id: 'analytics', icon: <ChartBar size={20} />, label: 'Аналитика' },
      { id: 'support', icon: <MessageSquare size={20} />, label: 'Поддержка' },
    ],
    stats: [
      {
        title: 'Активные заказы',
        value: 12,
        color: 'bg-orange-100',
        trend: 'up',
      },
      {
        title: 'Завершено поставок',
        value: 23,
        color: 'bg-cyan-100',
        trend: 'stable',
      },
      {
        title: 'Склад (ед.)',
        value: 340,
        color: 'bg-green-100',
        trend: 'down',
      },
      { title: 'Просрочено', value: 1, color: 'bg-red-100', trend: 'down' },
    ],
  },
};

const chartData = [
  { date: '01.06', area: 5, fuel: 22, plan: 25 },
  { date: '02.06', area: 8, fuel: 19, plan: 20 },
  { date: '03.06', area: 4, fuel: 20, plan: 18 },
  { date: '04.06', area: 10, fuel: 27, plan: 25 },
  { date: '05.06', area: 7, fuel: 24, plan: 22 },
  { date: '06.06', area: 12, fuel: 30, plan: 28 },
];

const droneTasks = [
  {
    id: 1,
    drone: 'DJI Agras T40',
    status: 'active',
    progress: 80,
    field: 'Поле 1',
    operation: 'Опрыскивание',
    operator: 'Иванов И.И.',
    battery: 65,
  },
  {
    id: 2,
    drone: 'DJI Agras T20P',
    status: 'active',
    progress: 60,
    field: 'Поле 2',
    operation: 'Внесение удобрений',
    operator: 'Петров П.П.',
    battery: 45,
  },
  {
    id: 3,
    drone: 'XAG V40',
    status: 'done',
    progress: 100,
    field: 'Поле 3',
    operation: 'Посев',
    operator: 'Сидоров С.С.',
    battery: 100,
  },
];

const shifts = [
  {
    id: 1,
    name: 'Иванов И.И.',
    start: '08:00',
    end: '16:00',
    status: 'В работе',
    avatar: 'bg-blue-500',
  },
  {
    id: 2,
    name: 'Петров П.П.',
    start: '14:00',
    end: '22:00',
    status: 'Ожидание',
    avatar: 'bg-green-500',
  },
];

const notifications = [
  {
    id: 1,
    text: 'Новая заявка #2456',
    time: '10 мин назад',
    read: false,
    type: 'new-order',
  },
  {
    id: 2,
    text: 'Дрон T40: низкий уровень топлива',
    time: '30 мин назад',
    read: false,
    type: 'warning',
  },
  {
    id: 3,
    text: 'Отклонение от маршрута: Поле 2',
    time: '2 часа назад',
    read: true,
    type: 'alert',
  },
  {
    id: 4,
    text: 'Синхронизация с 1С:ERP завершена',
    time: '5 часов назад',
    read: true,
    type: 'success',
  },
];

const fuelStats = [
  { name: 'Израсходовано', value: 112 },
  { name: 'Слито', value: 5 },
  { name: 'Остаток', value: 33 },
];

const fieldCoordinates = [
  {
    id: 1,
    name: 'Поле 1',
    crop: 'Пшеница',
    area: 12,
    coordinates: [
      [51.505, -0.09],
      [51.505, -0.08],
      [51.51, -0.08],
      [51.51, -0.09],
    ],
  },
  {
    id: 2,
    name: 'Поле 2',
    crop: 'Кукуруза',
    area: 8,
    coordinates: [
      [51.51, -0.1],
      [51.51, -0.09],
      [51.515, -0.09],
      [51.515, -0.1],
    ],
  },
];

const flightPaths = [
  {
    id: 1,
    fieldId: 1,
    path: [
      [51.505, -0.09],
      [51.505, -0.085],
      [51.508, -0.085],
      [51.508, -0.09],
    ],
    status: 'completed',
  },
  {
    id: 2,
    fieldId: 2,
    path: [
      [51.51, -0.1],
      [51.51, -0.095],
      [51.513, -0.095],
      [51.513, -0.1],
    ],
    status: 'in-progress',
  },
];

const NotificationBadge = ({ count }: { count: number }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
  >
    {count}
  </motion.span>
);

const FieldMap = ({ fieldId }: { fieldId: number }) => {
  const field = fieldCoordinates.find((f) => f.id === fieldId);
  const flightPath = flightPaths.find((fp) => fp.fieldId === fieldId);
  const map = useMap();

  useEffect(() => {
    if (field) {
      const bounds = L.latLngBounds(field.coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [field, map]);

  if (!field) return null;

  return (
    <>
      <Polyline
        positions={field.coordinates}
        color="#4f46e5"
        fillOpacity={0.2}
        fillColor="#4f46e5"
      />
      {flightPath && (
        <Polyline
          positions={flightPath.path}
          color={flightPath.status === 'completed' ? '#10b981' : '#f59e0b'}
          dashArray={flightPath.status === 'in-progress' ? '10, 10' : undefined}
        />
      )}
      <Marker position={field.coordinates[0]}>
        <Popup>
          {field.name} - {field.crop}, {field.area} га
        </Popup>
      </Marker>
    </>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userRole, setUserRole } = useGlobalContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(
    notifications.filter((n) => !n.read).length,
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const markNotificationsAsRead = () => {
    setUnreadNotifications(0);
    setShowNotifications(false);
  };

  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <ActiveMenuContext.Provider value={{ activeMenu, setActiveMenu }}>
      <div className="wrapper">
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-900">
          {/* Sidebar */}
          <motion.aside
            initial={{ width: 288 }}
            animate={{ width: sidebarOpen ? 288 : 80 }}
            className="bg-white border-r border-gray-200 flex flex-col shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
              <Link href="/">
                <motion.h1
                  initial={{ opacity: 1 }}
                  animate={{ opacity: sidebarOpen ? 1 : 0 }}
                  className="text-2xl font-bold text-emerald-600 whitespace-nowrap"
                >
                  DroneAgro
                </motion.h1>
              </Link>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <ChevronLeft size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {RoleConfig[userRole].menu.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${
                    activeMenu === item.id
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="mr-3"></span>
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: sidebarOpen ? 1 : 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: sidebarOpen ? 1 : 0 }}
              >
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="client">Клиент</option>
                  <option value="operator">Оператор</option>
                  <option value="manager">Менеджер</option>
                  <option value="supplier">Поставщик</option>
                </select>
              </motion.div>
            </div>
          </motion.aside>

          {/* Main */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shadow-sm py-[15px]">
              <h2 className="text-xl font-semibold capitalize">
                {
                  RoleConfig[userRole].menu.find((m) => m.id === activeMenu)
                    ?.label
                }
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-emerald-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Bell size={20} />
                    {unreadNotifications > 0 && (
                      <NotificationBadge count={unreadNotifications} />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-10 border border-gray-200 overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-medium">Уведомления</h3>
                          <button
                            onClick={markNotificationsAsRead}
                            className="text-xs text-emerald-600 hover:text-emerald-800"
                          >
                            Прочитать все
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                                notification.read ? 'bg-gray-50' : 'bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`mt-1 w-2 h-2 rounded-full ${
                                    notification.type === 'alert'
                                      ? 'bg-red-500'
                                      : notification.type === 'warning'
                                        ? 'bg-yellow-500'
                                        : notification.type === 'success'
                                          ? 'bg-green-500'
                                          : 'bg-blue-500'
                                  }`}
                                ></div>
                                <div>
                                  <p className="text-sm">{notification.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                    <User size={20} className="text-emerald-600" />
                  </div>
                  <span className="hidden md:inline font-medium">
                    Алексей Петров
                  </span>
                </div>
              </div>
            </header>
            <section>{children}</section>
          </main>
        </div>
        <Footer></Footer>
      </div>
    </ActiveMenuContext.Provider>
  );
}
