'use client';
import { motion } from 'framer-motion';
import {
  Home,
  ClipboardList,
  MapPin,
  Map,
  ChartBar,
  Users,
  CalendarDays,
  MessageSquare,
  Package,
  Settings,
  RefreshCw,
  Layers,
  Eye,
  FileText,
} from 'lucide-react';
import React from 'react';

import { useGlobalContext } from '../../GlobalContext';
import { useActiveMenu } from '../ActiveMenuContext';

// Конфигурация меню для каждой роли
const RoleMenuConfig = {
  contractor: [
    {
      id: 'contractor/main',
      icon: <Home size={18} />,
      label: 'Главная',
      description: 'Обзор активности и статистика',
    },
    {
      id: 'requests',
      icon: <ClipboardList size={18} />,
      label: 'Мои заявки',
      description: 'Управление заявками и предложениями',
    },
    {
      id: 'fields',
      icon: <Map size={18} />,
      label: 'Карта полей',
      description: 'Просмотр и управление полями',
    },
    {
      id: 'reports',
      icon: <ChartBar size={18} />,
      label: 'Отчёты',
      description: 'Аналитика и отчетность',
    },
    {
      id: 'support',
      icon: <MessageSquare size={18} />,
      label: 'Поддержка',
      description: 'Техническая поддержка',
    },
  ],
  operator: [
    {
      id: 'tasks',
      icon: <ClipboardList size={18} />,
      label: 'Задачи',
      description: 'Активные задачи и операции',
    },
    {
      id: 'tasksMap',
      icon: <Map size={18} />,
      label: 'Карта заданий',
      description: 'Географическое отображение задач',
    },
    {
      id: 'analytics',
      icon: <ChartBar size={18} />,
      label: 'Аналитика',
      description: 'Статистика и производительность',
    },
    {
      id: 'shifts',
      icon: <CalendarDays size={18} />,
      label: 'График смен',
      description: 'Планирование рабочего времени',
    },
    {
      id: 'flight-planning',
      icon: <Layers size={18} />,
      label: 'Планирование полетов',
      description: 'Маршруты и планы полетов',
    },
  ],
  manager: [
    {
      id: 'overview',
      icon: <Home size={18} />,
      label: 'Обзор',
      description: 'Общая панель управления',
    },
    {
      id: 'team',
      icon: <Users size={18} />,
      label: 'Команда',
      description: 'Управление персоналом',
    },
    {
      id: 'finance',
      icon: <ChartBar size={18} />,
      label: 'Финансы',
      description: 'Финансовая аналитика',
    },
    {
      id: 'settings',
      icon: <Settings size={18} />,
      label: 'Настройки',
      description: 'Конфигурация системы',
    },
    {
      id: 'cadastre',
      icon: <MapPin size={18} />,
      label: 'Кадастр',
      description: 'Кадастровые данные',
    },
    {
      id: 'integrations',
      icon: <RefreshCw size={18} />,
      label: 'Интеграции',
      description: 'Внешние системы',
    },
    {
      id: 'api-test',
      icon: <RefreshCw size={18} />,
      label: 'Тест API',
      description: 'Проверка подключения к бекенду',
    },
  ],
  material_supplier: [
    {
      id: 'orders',
      icon: <Package size={18} />,
      label: 'Заказы',
      description: 'Управление заказами материалов',
    },
    {
      id: 'inventory',
      icon: <ClipboardList size={18} />,
      label: 'Склад',
      description: 'Управление складскими запасами',
    },
    {
      id: 'deliveries',
      icon: <MapPin size={18} />,
      label: 'Поставки',
      description: 'Логистика и доставка',
    },
    {
      id: 'analytics',
      icon: <ChartBar size={18} />,
      label: 'Аналитика',
      description: 'Анализ продаж и поставок',
    },
    {
      id: 'support',
      icon: <MessageSquare size={18} />,
      label: 'Поддержка',
      description: 'Техническая поддержка',
    },
  ],
  drone_supplier: [
    {
      id: 'orders',
      icon: <Package size={18} />,
      label: 'Заказы',
      description: 'Управление заказами дронов',
    },
    {
      id: 'inventory',
      icon: <ClipboardList size={18} />,
      label: 'Склад',
      description: 'Управление складскими запасами',
    },
    {
      id: 'deliveries',
      icon: <MapPin size={18} />,
      label: 'Поставки',
      description: 'Логистика и доставка',
    },
    {
      id: 'analytics',
      icon: <ChartBar size={18} />,
      label: 'Аналитика',
      description: 'Анализ продаж и поставок',
    },
    {
      id: 'support',
      icon: <MessageSquare size={18} />,
      label: 'Поддержка',
      description: 'Техническая поддержка',
    },
  ],
  guest: [
    {
      id: 'overview',
      icon: <Eye size={18} />,
      label: 'Обзор',
      description: 'Общая информация',
    },
    {
      id: 'reports',
      icon: <FileText size={18} />,
      label: 'Отчёты',
      description: 'Доступные отчеты',
    },
  ],
};

interface DashboardSidebarProps {
  className?: string;
}

export default function DashboardSidebar({
  className = '',
}: DashboardSidebarProps) {
  const { activeMenu, setActiveMenu } = useActiveMenu();
  const { userRole } = useGlobalContext();

  // Получаем меню для текущей роли
  const menuItems =
    RoleMenuConfig[userRole as keyof typeof RoleMenuConfig] ||
    RoleMenuConfig.guest;

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const getRoleDescription = () => {
    switch (userRole) {
      case 'contractor':
        return 'Управление заявками и полями';
      case 'operator':
        return 'Операционное управление';
      case 'manager':
        return 'Административная панель';
      case 'material_supplier':
      case 'drone_supplier':
        return 'Управление поставками';
      default:
        return 'Ограниченный доступ';
    }
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'material_supplier':
        return 'Поставщик материалов';
      case 'drone_supplier':
        return 'Поставщик дронов';
      case 'contractor':
        return 'Подрядчик';
      case 'operator':
        return 'Оператор';
      case 'manager':
        return 'Менеджер';
      default:
        return 'Гость';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'manager':
        return 'bg-purple-400';
      case 'contractor':
        return 'bg-blue-400';
      case 'operator':
        return 'bg-green-400';
      case 'material_supplier':
      case 'drone_supplier':
        return 'bg-orange-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Навигация</h3>
        <p className="text-sm text-gray-500">{getRoleDescription()}</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive =
            activeMenu === item.id ||
            (activeMenu === 'dashboard' && item.id === 'overview') ||
            (activeMenu === '' && item.id === 'overview');

          return (
            <motion.button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'hover:bg-gray-50 text-gray-700 border border-transparent'
              }`}
            >
              <div
                className={`mt-0.5 ${
                  isActive ? 'text-emerald-600' : 'text-gray-500'
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-sm ${
                    isActive ? 'text-emerald-700' : 'text-gray-900'
                  }`}
                >
                  {item.label}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    isActive ? 'text-emerald-600' : 'text-gray-500'
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Индикатор роли */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${getRoleColor()}`} />
          <span className="capitalize">{getRoleDisplayName()}</span>
        </div>
      </div>
    </motion.div>
  );
}
