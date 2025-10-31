import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useGlobalContext } from '@/src/app/GlobalContext';
import {
  Settings,
  LogOut,
  User,
  Package,
  ChevronDown,
  Shield,
  Bell,
  Copy,
  Check,
  Map,
  Truck,
  List,
  Plus,
  CreditCard,
  Server,
  Globe,
} from 'lucide-react';

const roleLabels = {
  manager: 'Менеджер',
  contractor: 'Заказчик',
  drone_supplier: 'Поставщик дронов',
  material_supplier: 'Поставщик материалов',
  guest: 'Гость',
};

export default function HeaderProfile({
  user: userProp,
  role: roleProp = 'contractor',
  notifications: notificationsProp = 2,
  onLanguageChange, // optional callback from parent
}: {
  user?: any;
  role?: string;
  notifications?: number;
  onLanguageChange?: (lang: string) => void;
} = {}) {
  const globalContext = useGlobalContext();

  const [user] = useState(
    userProp ?? {
      name: 'Иван Петров',
      email: 'ivan.petrov@example.com',
      balance: 1240.5,
      avatarUrl: null,
    },
  );

  // role — "рабочая" роль (используется в UI)
  const [role, setRole] = useState('guest');
  
  useEffect(() => {
    // Check if we're on the client side and context is available
    if (typeof window !== 'undefined' && globalContext?.userRole) {
      setRole(globalContext.userRole);
    }
  }, [globalContext?.userRole]);

  const onSignOut = () => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', 'guest');
      window.location.href = '/';
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifications] = useState(notificationsProp);

  const [language, setLanguage] = useState('ru');

  const containerRef = useRef(null);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  // Hover open/close (keeps hover behaviour but also allows click)
  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setIsOpen(true), 100);
  };
  const handleMouseLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setIsOpen(false), 200);
  };

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;
    
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const fmt = (n) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(n);

  const demoCounts = {
    manager: { pendingApprovals: 3, activeMissions: 7 },
    contractor: { activeOrders: 1, unreadReports: 0 },
    drone_supplier: { availableDrones: 8, assignedToOrders: 2 },
    material_supplier: { lowStockAlerts: 1, supplyRequests: 4 },
    guest: {},
  };

  const roleQuickActionsMap = {
    manager: [
      {
        label: 'Панель управления',
        href: '/dashboard/manager/main',
        icon: <Server size={16} />,
      },
      {
        label: 'Управление пользователями',
        href: '/dashboard/manager/main',
        icon: <User size={16} />,
      },
      {
        label: 'Заявки на утверждение',
        href: '/dashboard/manager/main',
        icon: <List size={16} />,
        badge: demoCounts.manager.pendingApprovals,
      },
      {
        label: 'Управление парком',
        href: '/manager/fleet',
        icon: <Truck size={16} />,
        badge: demoCounts.manager.activeMissions,
      },
      {
        label: 'Интеграции',
        href: '/manager/integrations',
        icon: <Settings size={16} />,
      },
      {
        label: 'Отчёты',
        href: '/manager/reports',
        icon: <CreditCard size={16} />,
      },
    ],

    contractor: [
      {
        label: 'Создать заказ',
        href: '/dashboard/contractor/requests',
        icon: <Plus size={16} />,
      },
      {
        label: 'Мои заказы',
        href: '/dashboard/contractor/requests',
        icon: <Package size={16} />,
        badge: demoCounts.contractor.activeOrders,
      },
      {
        label: 'Загрузить карту поля',
        href: '/orders/new#upload',
        icon: <Map size={16} />,
      },
      {
        label: 'Отслеживание заказа',
        href: '/orders/track',
        icon: <List size={16} />,
      },
      {
        label: 'Получить отчёт',
        href: '/orders/reports',
        icon: <Package size={16} />,
        badge: demoCounts.contractor.unreadReports,
      },
    ],

    drone_supplier: [
      {
        label: 'Мой парк',
        href: '/supplier/drones',
        icon: <Truck size={16} />,
        badge: demoCounts.drone_supplier.availableDrones,
      },
      {
        label: 'Добавить дрон',
        href: '/supplier/drones/new',
        icon: <Plus size={16} />,
      },
      {
        label: 'Доступность',
        href: '/supplier/availability',
        icon: <List size={16} />,
      },
      {
        label: 'Назначения',
        href: '/supplier/assignments',
        icon: <Package size={16} />,
        badge: demoCounts.drone_supplier.assignedToOrders,
      },
    ],

    material_supplier: [
      {
        label: 'Каталог материалов',
        href: '/materials/catalog',
        icon: <List size={16} />,
      },
      {
        label: 'Склад',
        href: '/materials/stock',
        icon: <Server size={16} />,
        badge: demoCounts.material_supplier.lowStockAlerts,
      },
      {
        label: 'Заявки на поставку',
        href: '/materials/requests',
        icon: <Package size={16} />,
        badge: demoCounts.material_supplier.supplyRequests,
      },
      {
        label: 'Подтвердить поставку',
        href: '/materials/confirm',
        icon: <Check size={16} />,
      },
    ],

    guest: [
      { label: 'Регистрация', href: '/auth/signup', icon: <User size={16} /> },
      { label: 'О платформе', href: '/about', icon: <Map size={16} /> },
      { label: 'Контакты', href: '/contacts', icon: <List size={16} /> },
    ],
  };

  function FileIcon(props) {
    return <Package {...props} />;
  }

  const profileMenu = [
    { href: '/profile', label: 'Профиль', icon: <User size={16} /> },
    { href: '/orders', label: 'Мои заказы', icon: <Package size={16} /> },
    { href: '/notifications', label: 'Уведомления', icon: <Bell size={16} /> },
  ];

  const quickActions =
    roleQuickActionsMap[role] || roleQuickActionsMap.contractor;

  // Language switcher (stub): updates local state and notifies parent via callback.
  const changeLanguage = (lang) => {
    setLanguage(lang);
    if (typeof onLanguageChange === 'function') onLanguageChange(lang);
    // Note: we intentionally do NOT change the UI language here — parent/app will implement.
  };

  return (
    <div
      ref={containerRef}
      className="relative ml-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((s) => !s)}
        className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-50/60 transition-all focus:outline-none group"
      >
        <div
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-[0_6px_20px_rgba(99,102,241,0.12)]"
          style={{
            background:
              'linear-gradient(135deg,#7c3aed 0%, #3b82f6 40%, #06b6d4 100%)',
          }}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm">{initials}</span>
          )}
          <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </span>
        </div>

        <div className="hidden md:flex flex-col text-left leading-tight">
          <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {user.name || 'Пользователь'}
          </span>
          <span className="text-xs text-gray-500">
            {roleLabels[role] ?? role}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-[115%] w-[420px] max-w-[96vw] rounded-2xl border border-gray-200 bg-white  shadow-2xl transition-all duration-200 ease-out origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-100">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold"
              style={{
                background: 'linear-gradient(135deg,#6366F1 0%,#06B6D4 100%)',
              }}
            >
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {user.name || 'Пользователь'}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-400">Баланс</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {fmt(user.balance)}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-[11px] text-gray-600">
                  <Shield size={12} /> {roleLabels[role] ?? role}
                </span>

                <button
                  onClick={copyEmail}
                  className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2">Быстрые действия</div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 hover:shadow-sm transition text-sm text-gray-800"
                >
                  <div className="p-2 bg-gray-50 rounded-md text-gray-600">
                    {a.icon}
                  </div>
                  <div className="flex-1 text-left">{a.label}</div>
                  {a.badge ? (
                    <div className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500 text-white">
                      {a.badge}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {profileMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-800"
              >
                <div className="p-2 bg-gray-100 rounded-md text-gray-600">
                  {item.icon}
                </div>
                <span className="flex-1">{item.label}</span>
                {item.href === '/notifications' && notifications > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {notifications}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onSignOut}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white hover:bg-gray-50 transition text-sm"
              >
                <LogOut size={16} /> Выйти
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Language selector (stub) */}
              <div className="flex items-center gap-2">
                <Globe size={14} />
                <label htmlFor="header-lang" className="sr-only">
                  Язык
                </label>
                <select
                  id="header-lang"
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-white border border-gray-200 px-2 py-1 rounded-md text-xs text-gray-700"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
