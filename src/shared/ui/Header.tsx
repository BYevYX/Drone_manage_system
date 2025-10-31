'use client';
import React, { useMemo, useState, useContext, useEffect } from 'react';
import {
  ChevronDown,
  Map,
  Monitor,
  ArrowRight,
  BarChart,
  Droplets,
  Sun,
  Trees,
  Mountain,
  Zap,
  User as UserIcon,
  LogOut,
  Settings,
  Layers,
  Truck,
  ClipboardList,
  LogIn,
} from 'lucide-react';
import {
  Home,
  MapPin,
  Trash2,
  Edit,
  Eye,
  FileText,
  MessageSquare,
  CheckCircle2,
  User,
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
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ActiveMenuContext } from '@/src/app/dashboard/ActiveMenuContext';

import { useGlobalContext } from '@/src/app/GlobalContext';
import HeaderProfile from './headerProfile';

export default function Header() {
  const { setActiveMenu } = useContext(ActiveMenuContext);
  const ctx = useGlobalContext?.();
  const { dronesList = [], user: globalUser } = ctx || ({} as any);

  const pathname = usePathname?.() || '/';
  const globalContext = useGlobalContext();
  const [role, setRole] = useState('guest');
  
  useEffect(() => {
    // Check if we're on the client side and context is available
    if (typeof window !== 'undefined' && globalContext?.userRole) {
      setRole(globalContext.userRole);
    }
  }, [globalContext?.userRole]);

  const headerStyles = {
    '/': 'bg-white text-black p-6',
    '/drones': 'bg-white text-black p-3',
    '/signup':
      'backdrop-blur-[0px] from-[white]/0   to-[#a9cdd5]/50  shadow-[#dfdfdf] bg-white/25 p-2 z-10 relative text-black',
    default: 'bg-white text-black shadow-[0_0_15px_1px] shadow-[#dfdfdf] p-3',
  };

  const menuSections = [
    {
      title: 'Планирование и управление',
      icon: <Map className="text-blue-500" size={18} />,
      links: [
        {
          label: 'Планирование маршрутов дронов',
          href: '/services/flight-planning',
          description:
            'Оптимизация маршрутов для эффективного выполнения задач',
          icon: <Map className="text-blue-400" size={16} />,
        },
        {
          label: 'Мониторинг в реальном времени',
          href: '/services/live-tracking',
          description: 'Отслеживайте дроны и статус работ онлайн',
          icon: <Monitor className="text-green-400" size={16} />,
        },
        {
          label: 'Анализ и отчетность',
          href: '/services/flight-analysis',
          description: 'Детальная аналитика и отчеты по выполненным полетам',
          icon: <BarChart className="text-purple-400" size={16} />,
        },
      ],
    },
    {
      title: 'Обработка культур',
      icon: <Leaf className="text-green-500" size={18} />,
      links: [
        {
          label: 'Химическая защита растений',
          href: '/services/chemical-protection',
          description:
            'Точное опрыскивание с использованием современных технологий',
          icon: <Droplets className="text-red-400" size={16} />,
        },
        {
          label: 'Внесение удобрений',
          href: '/services/fertilization',
          description: 'Равномерное и эффективное внесение удобрений',
          icon: <Leaf className="text-yellow-400" size={16} />,
        },
        {
          label: 'Десикация',
          href: '/services/desiccation',
          description: 'Ускорение созревания и подготовка к уборке урожая',
          icon: <Sun className="text-orange-400" size={16} />,
        },
      ],
    },
  ];

  return (
    <header
      className={`sticky top-0  z-50 ${headerStyles[pathname!] || headerStyles.default} bg-gradient-to-r`}
    >
      <div className="container  mx-auto flex justify-between items-center font-nekstmedium z-10">
        <div className="flex items-center space-x-[20px]">
          <Link href="/">
            <button className="text-[32px] font-nekstmedium">ДронАгро</button>
          </Link>

          {/* Language selector (kept) */}
          <div className="flex items-center">
            <div className="relative group">
              <div className="flex items-center gap-1 px-4 text-[20px] hover:text-gray-300 cursor-pointer">
                RU
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="absolute opacity-0 group-hover:opacity-100 bg-[#54545456] min-w-[150px] rounded-lg shadow-lg backdrop-blur-[10px] duration-[0.3s] scale-y-[0.5] origin-top group-hover:scale-y-[100%] pointer-events-none group-hover:pointer-events-auto">
                <button className="rounded-[5px] w-full h-[40px] text-[20px] hover:bg-[#858585] duration-[0.3s]">
                  RU
                </button>
                <button className="rounded-[5px] w-full h-[40px] text-[20px] hover:bg-[#858585] duration-[0.3s]">
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NAV */}
        <div className="flex items-center gap-0 w-full justify-between">
          {/* If guest -> show only Login button (with icon on the left) */}

          <>
            <nav className="flex items-center gap-4">
              {/* About */}
              <div className="relative group">
                <div className="flex items-center gap-1 px-2 hover:text-gray-300 cursor-pointer text-[22px]">
                  О платформе
                  <ChevronDown className="h-4 w-4" />
                </div>
                <div className="absolute left-0 top-full mt-0 w-44 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-out bg-white border-[#e5e5e5] border-[1px] rounded-lg shadow z-50">
                  <Link
                    href={`/workflow`}
                    className="block px-4 py-3 hover:bg-[#efefef]"
                  >
                    Как это работает?
                  </Link>
                  <Link
                    href={`/partnership`}
                    className="block px-4 py-3 hover:bg-[#efefef]"
                  >
                    Стать партнером
                  </Link>
                </div>
              </div>
              {/* Drones menu */}
              <div className="relative group">
                <div className="flex items-center gap-2 text-[20px] px-2 py-1 hover:text-gray-300 cursor-pointer">
                  <Link href={'/drones'} className="flex items-center">
                    Дроны
                    <ChevronDown className="h-4 w-4 transition-transform transform group-hover:rotate-180" />
                  </Link>
                </div>

                <div className="absolute left-0 top-full mt-0 w-64 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-out bg-white border-[#e5e5e5] border-[1px] rounded-lg shadow z-50">
                  {dronesList.map((drone: any, index: number) => (
                    <div key={index} className="relative group/drone">
                      <Link
                        href={`/drones/${drone.id}`}
                        className="block px-4 py-3 hover:bg-[#efefef]"
                      >
                        {drone.name}
                      </Link>
                      <div className="absolute top-0 left-full ml-[6px] opacity-0 scale-95 group-hover/drone:opacity-100 group-hover/drone:scale-100 transition-all duration-300 ease-out bg-white p-4 rounded-xl shadow-xl min-w-[28vw] z-50 pointer-events-none group-hover/drone:pointer-events-auto">
                        <h4 className="font-semibold text-[18px] mb-2">
                          {drone.name}
                        </h4>
                        <p className="text-sm text-neutral-500 mb-2">
                          {drone.description}
                        </p>
                        <div className="w-full h-[150px] rounded-md overflow-hidden mb-2 flex items-center justify-center">
                          <Image
                            src={drone.photo_url || '/img/placeholder.jpg'}
                            alt={drone.name}
                            width={200}
                            height={140}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <Link href={`/drones/${drone.id}`} className="block">
                          <button className="w-full py-2 bg-green-500 text-white rounded-md">
                            Подробнее
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <Link
                    href={`/drones`}
                    className="block px-4 py-3 bg-[#f3f3f3] hover:bg-[#eaeaea]"
                  >
                    Каталог дронов →
                  </Link>
                </div>
              </div>

              {/* Services mega menu */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 text-[20px] font-medium rounded-md hover:text-gray-300">
                  Услуги
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                <div className="absolute right-0 top-full pt-5 w-[900px] max-w-[96vw] opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 ease-out bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 origin-top-right p-6 grid lg:grid-cols-2 sm:grid-cols-2 gap-6">
                  {menuSections.map(({ title, links, icon }) => (
                    <section key={title}>
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-gray-100 rounded-lg mr-2">
                          {icon}
                        </div>
                        <h3 className="text-[18px] font-semibold text-gray-900">
                          {title}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {links.map(({ label, href, description, icon }) => (
                          <li key={href}>
                            <Link
                              href={href}
                              className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                            >
                              <div className="mt-0.5 mr-3 p-2 bg-gray-50 rounded-lg text-gray-500">
                                {icon}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-[16px] flex items-center">
                                  {label}
                                </p>
                                <p className="mt-1 text-[12px] text-gray-600 leading-snug">
                                  {description}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}

                  <div className="col-span-full mt-4 p-5 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                          Специальное предложение
                        </h4>
                        <p className="text-sm text-gray-600">
                          При заказе 3+ услуг — скидка 15% на все работы
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href="/permissions"
                className="px-2 text-[20px] hover:text-gray-300"
              >
                Разрешения
              </Link>
              <Link
                href="/to-the-customer"
                className="px-2 text-[20px] hover:text-gray-300"
              >
                Заказчику
              </Link>
              <Link
                href="/contacts"
                className="px-2 text-[20px] hover:text-gray-300"
              >
                Контакты
              </Link>
            </nav>

            {/* Profile avatar popover (for logged-in roles) */}
            {role === 'guest' ? (
              <div className="flex items-center gap-3 ml-[15px]">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-8 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:opacity-95 transition"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Вход</span>
                </Link>
              </div>
            ) : (
              <HeaderProfile
                user={{
                  name: 'Пользователь',
                  email: 'user@example.com',
                  balance: 0,
                  avatarUrl: null,
                }}
                onLanguageChange={() => {}}
              />
            )}
          </>
        </div>
      </div>
    </header>
  );
}
