'use client';
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
  operator: 'Оператор процессов',
  guest: 'Гость',
};

export default function HeaderProfile({
  user: userProp,
  role: roleProp = 'CONTRACTOR',
  notifications: notificationsProp = 2,
  onLanguageChange, // optional callback from parent
}) {
  const { userInfo } = useGlobalContext();

  const [user] = useState(
    userProp ?? {
      name: 'Иван Петров',
      email: 'ivan.petrov@example.com',
      balance: 1243230.5,
      avatarUrl: null,
    },
  );

  // role — "рабочая" роль (используется в UI)
  const [role, setRole] = useState(userInfo.userRole);
  useEffect(
    () => setRole(userInfo.userRole?.toLowerCase()),
    [userInfo.userRole],
  );

  const onSignOut = () => {
    localStorage.setItem('userRole', 'guest');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('surname');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.setItem('userRole', 'guest');
    window.location.href = '/';
  };

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifications] = useState(notificationsProp);

  const [language, setLanguage] = useState('ru');

  const containerRef = useRef(null);
  const openTimer = useRef<any>(null);
  const closeTimer = useRef<any>(null);

  const initials =
    userInfo.firstName && userInfo.lastName
      ? `${userInfo.firstName[0]}${userInfo.lastName[0]}`.toUpperCase()
      : user?.name
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

  // detect mobile viewport to change menu behaviour
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Hover open/close (keeps hover behaviour on desktop but not on mobile)
  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setIsOpen(true), 100);
  };
  const handleMouseLeave = () => {
    if (isMobile) return;
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setIsOpen(false), 200);
  };

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return () => {
      if (isMobile) document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(userInfo.email || user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(n);

  const demoCounts: any = {
    manager: { pendingApprovals: 3, activeMissions: 7 },
    contractor: { activeOrders: 1, unreadReports: 0 },
    drone_supplier: { availableDrones: 8, assignedToOrders: 2 },
    material_supplier: { lowStockAlerts: 1, supplyRequests: 4 },
    guest: {},
  };

  const roleQuickActionsMap: any = {
    manager: [
      {
        label: 'Заявки',
        href: '/dashboard/manager/requests',
        icon: <Server size={16} />,
      },

      {
        label: 'Поля',
        href: '/dashboard/manager/fields',
        icon: <CreditCard size={16} />,
      },
    ],

    operator: [
      {
        label: 'Заказы',
        href: '/dashboard/operator/requests',
        icon: <Package size={16} />,
        badge: demoCounts.contractor.activeOrders,
      },
    ],
    contractor: [
      {
        label: 'Мои заказы',
        href: '/dashboard/contractor/requests',
        icon: <Package size={16} />,
        badge: demoCounts.contractor.activeOrders,
      },
      {
        label: 'Мои поля',
        href: '/dashboard/contractor/fields',
        icon: <Map size={16} />,
      },
    ],

    drone_supplier: [
      {
        label: 'Мой парк',
        href: '/drones',
        icon: <Truck size={16} />,
        badge: demoCounts.drone_supplier.availableDrones,
      },
      // {
      //   label: 'Добавить дрон',
      //   href: '/drones',
      //   icon: <Plus size={16} />,
      // },
      // {
      //   label: 'Доступность',
      //   href: '/drones',
      //   icon: <List size={16} />,
      // },
      // {
      //   label: 'Назначения',
      //   href: '/supplier/assignments',
      //   icon: <Package size={16} />,
      //   badge: demoCounts.drone_supplier.assignedToOrders,
      // },
    ],

    material_supplier: [
      {
        label: 'Каталог материалов',
        href: '/materials',
        icon: <List size={16} />,
      },
    ],

    guest: [
      { label: 'Регистрация', href: '/auth/signup', icon: <User size={16} /> },
      { label: 'О платформе', href: '/about', icon: <Map size={16} /> },
      { label: 'Контакты', href: '/contacts', icon: <List size={16} /> },
    ],
  };

  const normalizedRole = (role || '').toLowerCase();
  const quickActions =
    roleQuickActionsMap[normalizedRole] || roleQuickActionsMap.guest;

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    if (typeof onLanguageChange === 'function') onLanguageChange(lang);
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
            {userInfo.firstName} {userInfo.lastName}
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

      {/* Desktop / popup menu */}
      {!isMobile && (
        <div
          role="menu"
          className={`absolute right-0 z-1000 top-[115%] w-[420px] max-w-[96vw] rounded-2xl border border-gray-200 bg-white  shadow-2xl transition-all duration-200 ease-out origin-top-right ${
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
                      {userInfo.firstName} {userInfo.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userInfo.email}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-[11px] text-gray-600">
                    <Shield size={12} /> {roleLabels[role] ?? role}
                  </span>

                  <button
                    onClick={copyEmail}
                    className="ml-auto hidden items-center gap-1 px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition"
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
              <div className="grid grid-cols-2 gap-2 auto-rows-auto">
                {quickActions.map((a: any, idx: number) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 hover:shadow-sm transition text-sm text-gray-800
        ${quickActions.length % 2 !== 0 && idx === quickActions.length - 1 ? 'col-span-2' : ''}
      `}
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
              <div className="mb-3 mt-[10px] ">
                <div className="text-xs text-gray-500 mb-2">Аккаунт</div>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition text-sm text-gray-800"
                  >
                    <div className="p-2 bg-gray-50 rounded-md text-gray-600">
                      <User size={16} />
                    </div>
                    <div className="flex-1">
                      <div>Профиль</div>
                    </div>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition text-sm text-gray-800"
                  >
                    <div className="p-2 bg-gray-50 rounded-md text-gray-600">
                      <Settings size={16} />
                    </div>
                    <div className="flex-1">
                      <div>Настройки</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-end justify-end">
              <div className="flex items-center gap-2">
                <button
                  onClick={onSignOut}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white hover:bg-gray-50 transition text-sm"
                >
                  <LogOut size={16} /> Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <>
          {/* backdrop */}
          <div
            className={`fixed inset-0   bg-black/35 z-40 transition-opacity ${
              isOpen
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`fixed left-0  right-0 bottom-0 z-50  h-[70vh] bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ${
              isOpen ? 'translate-y-0' : 'translate-y-[110%]'
            }`}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 border-b border-black/30 flex items-center  justify-between">
              <div className="flex items-center gap-3 ">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{
                    background:
                      'linear-gradient(135deg,#6366F1 0%,#06B6D4 100%)',
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {userInfo.firstName} {userInfo.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{userInfo.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyEmail}
                  className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-gray-50 rounded-md"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Закрыть"
                  className="p-2 rounded-md text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto h-[calc(70vh-128px)]">
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">
                  Быстрые действия
                </div>
                <div className="space-y-2">
                  {quickActions.map((a: any) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition text-sm text-gray-800"
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

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Аккаунт</div>
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition text-sm text-gray-800"
                  >
                    <div className="p-2 bg-gray-50 rounded-md text-gray-600">
                      <User size={16} />
                    </div>
                    Профиль
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition text-sm text-gray-800"
                  >
                    <div className="p-2 bg-gray-50 rounded-md text-gray-600">
                      <Settings size={16} />
                    </div>
                    Настройки
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-black/30 flex items-center justify-between">
              <div>
                <button
                  onClick={onSignOut}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white hover:bg-gray-50 transition text-sm"
                >
                  <LogOut size={16} /> Выйти
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
