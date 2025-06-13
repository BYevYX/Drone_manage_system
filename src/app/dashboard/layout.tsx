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
      { id: 'tasksMap', icon: <Map size={20} />, label: 'Карта заданий' },
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

const NotificationBadge = ({ count }: { count: number }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
  >
    {count}
  </motion.span>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userRole, setUserRole } = useGlobalContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(
    notifications.filter((n) => !n.read).length,
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Сохраняем состояние sidebar в localStorage
  useEffect(() => {
    const ls = localStorage.getItem('sidebarOpen');
    if (ls !== null) setSidebarOpen(ls === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);

  // Авто-закрытие уведомлений при клике вне окна
  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.notification-panel') &&
        !target.closest('.notification-btn')
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  const markNotificationsAsRead = () => {
    setUnreadNotifications(0);
    setShowNotifications(false);
  };

  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <ActiveMenuContext.Provider value={{ activeMenu, setActiveMenu }}>
      <div className="wrapper">
        <div className="flex min-h-[100vh] bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-900">
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{
              width: sidebarOpen ? 260 : 76,
              boxShadow: sidebarOpen
                ? '0 6px 32px 0 rgba(31,38,135,0.17), 0 1.5px 8px 0 rgba(31,38,135,0.06)'
                : '0 1px 2px 0 rgba(31,38,135,0.07)',
              borderRadius: sidebarOpen ? '0 2rem 2rem 0' : '0 2.3rem 2.3rem 0',
              margin: '0', // Убираем все внешние отступы
              background: 'white',
            }}
            className={`border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}
            style={{ minHeight: '100vh' }}
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
              {sidebarOpen ? (
                <Link href="/">
                  <motion.h1
                    initial={false}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-extrabold text-emerald-600 whitespace-nowrap transition-all duration-300"
                  >
                    DroneAgro
                  </motion.h1>
                </Link>
              ) : (
                <span className="w-8" />
              )}
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Скрыть/показать меню"
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
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center w-full px-3.5 py-3 rounded-2xl transition-all font-medium gap-2 ${
                    activeMenu === item.id
                      ? 'bg-emerald-500/90 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{
                    marginBottom: '0.15rem',
                    boxShadow:
                      activeMenu === item.id
                        ? '0 2px 8px 0 rgba(16,185,129,0.07)'
                        : undefined,
                  }}
                >
                  <span className="mr-1">{item.icon}</span>
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: sidebarOpen ? 1 : 0,
                      x: sidebarOpen ? 0 : -10,
                    }}
                    className="whitespace-nowrap transition-all duration-300"
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <motion.div
                initial={false}
                animate={{
                  opacity: sidebarOpen ? 1 : 0,
                  x: sidebarOpen ? 0 : -10,
                }}
                className="transition-all duration-300"
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
                    onClick={() => setShowNotifications((v) => !v)}
                    className="notification-btn relative p-2 text-gray-600 hover:text-emerald-600 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Уведомления"
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
                        className="notification-panel absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-30 border border-gray-200 overflow-hidden"
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
            <section className="min-h-[calc(100vh-70px)] bg-transparent">
              {children}
            </section>
          </main>
        </div>
        <Footer />
      </div>
    </ActiveMenuContext.Provider>
  );
}
