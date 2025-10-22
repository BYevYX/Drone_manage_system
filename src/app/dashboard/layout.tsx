'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useGlobalContext, UserRole } from '../GlobalContext';
import { ActiveMenuContext } from './ActiveMenuContext';
import Footer from '@/src/shared/ui/Footer';
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

  const fullPathname = usePathname();

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

  const pathname = fullPathname ? fullPathname.replace('/dashboard/', '') : '';
  const [activeMenu, setActiveMenu] = useState(pathname || 'dashboard');

  return (
    <ActiveMenuContext.Provider value={{ activeMenu, setActiveMenu }}>
      <div className="wrapper">
        <div className="flex min-h-[100vh] bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-900">
          {/* Main */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shadow-sm py-[15px]">
              <Link href="/">
                <h1 className="text-2xl font-extrabold text-emerald-600">
                  DroneAgro
                </h1>
              </Link>
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
                <div className="ml-4">
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="contractor">Подрядчик</option>
                    <option value="operator">Оператор</option>
                    <option value="manager">Менеджер</option>
                    <option value="material_supplier">
                      Поставщик материалов
                    </option>
                    <option value="drone_supplier">Поставщик дронов</option>
                  </select>
                </div>
              </div>
            </header>
            <section className="min-h-[calc(100vh-70px)] p-[20px] bg-transparent">
              {children}
            </section>
          </main>
        </div>
        <Footer />
      </div>
    </ActiveMenuContext.Provider>
  );
}
