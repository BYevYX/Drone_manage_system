'use client';
import React, {
  useMemo,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from 'react';
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
  Home,
  MapPin,
  Trash2,
  Edit,
  Eye,
  FileText,
  MessageSquare,
  CheckCircle2,
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
import { usePathname, useRouter } from 'next/navigation';
import { ActiveMenuContext } from '@/src/app/dashboard/ActiveMenuContext';

import { useGlobalContext } from '@/src/app/GlobalContext';
import HeaderProfile from './headerProfile';

export default function Header() {
  const { setActiveMenu } = useContext(ActiveMenuContext);
  const ctx = useGlobalContext();
  const { dronesList = [], user: globalUser } = ctx || ({} as any);

  const pathname = usePathname() || '/';
  const { userInfo } = useGlobalContext();
  const [role, setRole] = useState('');
  useEffect(() => {
    setRole(userInfo?.userRole ?? '');
  }, [userInfo?.userRole]);

  const router = useRouter();

  const headerStyles = {
    '/': 'bg-white text-black p-5',
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

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  // For services mega menu alignment fix on desktop
  const servicesButtonRef = useRef<HTMLDivElement | null>(null);
  const [servicesAlign, setServicesAlign] = useState<'left' | 'right'>('right');

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    // ensure body overflow reset
    document.body.style.overflow = '';
  }, [pathname]);

  // adjust services alignment to avoid overflow
  const adjustServicesAlignment = useCallback(() => {
    const btn = servicesButtonRef.current;
    if (!btn || typeof window === 'undefined') return;
    const rect = btn.getBoundingClientRect();
    // menu tries to be 900px, but constrained to 96vw on smaller screens
    const menuWidth = Math.min(900, window.innerWidth * 0.96);
    // if placing menu with left aligned at rect.left would overflow, then align to right
    if (rect.left + menuWidth > window.innerWidth - 8) {
      setServicesAlign('right');
    } else {
      setServicesAlign('left');
    }
  }, []);

  useEffect(() => {
    // adjust on mount and resize
    adjustServicesAlignment();
    window.addEventListener('resize', adjustServicesAlignment);
    return () => window.removeEventListener('resize', adjustServicesAlignment);
  }, [adjustServicesAlignment]);

  // mobile accordion state for services
  const [openServiceIndex, setOpenServiceIndex] = useState<number | null>(1);

  // Services rendering variant to keep menu fitting smaller viewports.
  const [servicesVariant, setServicesVariant] = useState<
    'full' | 'compact' | 'minimal'
  >('minimal'); // одинаково на сервере и клиенте
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setServicesVariant('full');
      else if (window.innerWidth >= 768) setServicesVariant('compact');
      else setServicesVariant('minimal');
    };
    handleResize(); // сразу вызвать на клиенте
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When clicking "Дроны" on small screens we want to immediately navigate to /drones
  const handleDronesClick = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      // on desktop/tablet prevent link navigation so hover submenu works
      e.preventDefault();
    } else {
      // mobile: let Link do navigation, but also close mobile menu if open
      setMobileOpen(false);
    }
  };

  // ---------- SERVICE CLICK HANDLER (uses localStorage userRole) ----------
  const handleServiceClick = (e?: React.MouseEvent, linkLabel?: string) => {
    if (e) e.preventDefault();
    // read role from localStorage at the moment of click (client-side only)
    const raw =
      typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    const normalized = (raw ?? '').toString().trim().toUpperCase();

    // Roles that are explicitly "not allowed" for services
    const blocked = new Set([
      'OPERATOR',
      'MANAGER',
      'DRONE_SUPPLIER',
      'MATERIAL_SUPPLIER',
    ]);

    if (!normalized || normalized === 'GUEST') {
      // guest or empty role -> signup
      setMobileOpen(false);
      router.push('/signup');
      return;
    }

    if (normalized === 'CONTRACTOR') {
      // contractor -> allow: go to dashboard/contractor/requests
      setMobileOpen(false);
      router.push('/dashboard/contractor/requests');
      return;
    }

    if (blocked.has(normalized)) {
      // blocked role -> show alert
      alert(`Недоступно для роли ${normalized}`);
      return;
    }

    // Fallback: if unknown role, route to signup
    setMobileOpen(false);
    router.push('/signup');
  };
  // ----------------------------------------------------------------------

  return (
    <header
      className={`sticky top-0  z-50 ${headerStyles[pathname!] || headerStyles.default} bg-gradient-to-r`}
    >
      <div className="container  mx-auto flex justify-between items-center font-nekstmedium z-10">
        <div className="flex items-center space-x-[20px]">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <button className="text-[32px] font-nekstmedium">ДронАгро</button>
          </Link>
        </div>

        {/* NAV */}
        <div className="flex items-center gap-0 ml-[30px] w-full justify-between">
          {/* Hamburger for small screens */}
          <div className="md:hidden flex items-center">
            <button
              aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen((s) => !s);
                // prevent background scroll when mobile menu open
                if (!mobileOpen) {
                  document.body.style.overflow = 'hidden';
                } else {
                  document.body.style.overflow = '';
                }
              }}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/90 shadow-md ring-1 ring-black/6 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {/* animated burger -> X */}
              <span
                className={`absolute block w-5 h-[2px] bg-black transition-transform duration-300 ${
                  mobileOpen ? 'rotate-45' : '-translate-y-2'
                }`}
              />
              <span
                className={`absolute block w-5 h-[2px] bg-black transition-opacity duration-200 ${
                  mobileOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute block w-5 h-[2px] bg-black transition-transform duration-300 ${
                  mobileOpen ? '-rotate-45' : 'translate-y-2'
                }`}
              />
            </button>
          </div>

          {/* Desktop nav */}
          <>
            <nav className="hidden md:flex items-center gap-4">
              {/* About */}
              <div className="relative group">
                <div className="flex items-center gap-1 px-2 hover:text-gray-300 cursor-pointer text-[22px]">
                  О платформе
                  <ChevronDown className="h-4 w-4" />
                </div>
                <div className="absolute left-0 top-full mt-0 w-60 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-out bg-white border-[#e5e5e5] border-[1px] rounded-lg shadow z-50">
                  <Link
                    href={`/workflow`}
                    className="block px-4 py-3 hover:bg-[#efefef]"
                  >
                    Как это работает?
                  </Link>
                  <Link
                    href={`/partnership`}
                    className="block px-4 py-3 hover:bg-[#efefef] rounded-b-[5px]"
                  >
                    Стать партнером
                  </Link>
                </div>
              </div>

              {/* Drones menu - on small screens we will simply navigate to /drones; on desktop keep hover submenu */}
              <div className="relative group">
                <div className="flex items-center gap-2 text-[20px] px-2 py-1 hover:text-gray-300 cursor-pointer">
                  <Link
                    href={'/drones'}
                    onClick={handleDronesClick}
                    className="flex items-center"
                  >
                    Дроны
                    <ChevronDown className="h-4 w-4 transition-transform transform group-hover:rotate-180" />
                  </Link>
                </div>

                {/* hide submenu on small screens (md:block only) */}
                <div className="absolute left-0 top-full mt-0 w-64 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-out bg-white border-[#e5e5e5] border-[1px] rounded-lg shadow z-50 md:block hidden">
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
                    className="block px-4 rounded-b-[5px] py-3 bg-[#f3f3f3] hover:bg-[#eaeaea]"
                  >
                    Каталог дронов →
                  </Link>
                </div>
              </div>

              {/* Services mega menu with alignment + responsive content */}
              <div
                className="relative group"
                ref={servicesButtonRef}
                onMouseEnter={adjustServicesAlignment}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-[20px] font-medium rounded-md hover:text-gray-300">
                  Услуги
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* container adapts content depending on servicesVariant; always constrained to viewport and scrollable */}
                <div
                  className={`absolute top-full pt-5 max-w-[96vw] opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 ease-out bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4 ${
                    servicesAlign === 'left'
                      ? 'left-0 origin-top-left'
                      : 'right-0 origin-top-right'
                  }`}
                  style={{
                    willChange: 'transform, opacity',
                    maxHeight: '80vh',
                    overflow: 'auto',
                  }}
                >
                  {/* FULL - desktop: original grid, full descriptions */}
                  {servicesVariant === 'full' && (
                    <div className="w-[900px] max-w-[96vw] grid lg:grid-cols-2 sm:grid-cols-2 gap-6 p-2">
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
                            {links.map(({ label, description, icon }) => (
                              <li key={label}>
                                {/* service links now use the handler that checks localStorage */}
                                <button
                                  onClick={(e) => handleServiceClick(e, label)}
                                  className="w-full text-left flex items-start p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
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
                                </button>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  )}

                  {/* COMPACT - medium screens: labels with short descriptions, narrower layout */}
                  {servicesVariant === 'compact' && (
                    <div className="w-[700px] max-w-[96vw] grid md:grid-cols-2 gap-4 p-2">
                      {menuSections.map(({ title, links, icon }) => (
                        <section key={title}>
                          <div className="flex items-center mb-2">
                            <div className="p-2 bg-gray-100 rounded-lg mr-2">
                              {icon}
                            </div>
                            <h3 className="text-[16px] font-semibold text-gray-900">
                              {title}
                            </h3>
                          </div>
                          <ul className="space-y-1">
                            {links.map(({ label, description, icon }) => (
                              <li key={label}>
                                <button
                                  onClick={(e) => handleServiceClick(e, label)}
                                  className="w-full text-left flex items-start p-2 rounded-lg hover:bg-gray-50 transition"
                                >
                                  <div className="mr-2 p-1 bg-gray-50 rounded text-gray-500">
                                    {icon}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {label}
                                    </p>
                                    <p className="mt-0.5 text-[12px] text-gray-600">
                                      {description}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                      <div className="col-span-full mt-2 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                              Спецпредложение
                            </h4>
                            <p className="text-xs text-gray-600">
                              При заказе 3+ услуг — скидка 15%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MINIMAL - small screens where megamenu should be tiny: just links */}
                  {servicesVariant === 'minimal' && (
                    <div className="w-[300px] max-w-[96vw] p-2 space-y-2">
                      {menuSections.map(({ title, links }) => (
                        <div key={title}>
                          <div className="font-semibold text-sm mb-1">
                            {title}
                          </div>
                          <ul>
                            {links.map((l) => (
                              <li key={l.label}>
                                <button
                                  onClick={(e) =>
                                    handleServiceClick(e, l.label)
                                  }
                                  className="block w-full text-left py-1 text-sm text-gray-700"
                                >
                                  {l.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <button
                          onClick={() => handleServiceClick()}
                          className="text-sm text-blue-700"
                        >
                          Все услуги →
                        </button>
                      </div>
                    </div>
                  )}
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
            {role === 'GUEST' ? (
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
              <HeaderProfile></HeaderProfile>
            )}
          </>
        </div>
      </div>

      {/* Mobile slide-over menu - visually improved */}
      <div
        className={`fixed inset-0 z-40 transition-transform duration-300 ${
          mobileOpen ? 'visible' : 'pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* backdrop */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-sm transition-opacity ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => {
            setMobileOpen(false);
            document.body.style.overflow = '';
          }}
        />

        <aside
          className={`absolute top-0 left-0 h-full w-[92vw] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Мобильное меню"
        >
          {/* header with avatar + close */}
          <div className="p-4 border-b border-gray-300 border-solid flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {/* if user has avatar use it, else icon */}
                {globalUser?.avatar ? (
                  <Image
                    src={globalUser.avatar}
                    alt="avatar"
                    width={40}
                    height={40}
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium">
                  {userInfo?.firstName || 'Гость'}
                </div>
                <div className="text-[12px] text-gray-500">
                  {role === 'GUEST' ? 'Войти' : role}
                </div>
              </div>
            </div>

            <button
              aria-label="Закрыть меню"
              onClick={() => {
                setMobileOpen(false);
                document.body.style.overflow = '';
              }}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-2 overflow-auto h-[calc(100%-84px)]">
            {/* сommon links (workflow, drones...) */}
            <Link
              href="/workflow"
              onClick={() => {
                setMobileOpen(false);
                document.body.style.overflow = '';
              }}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition"
            >
              <Home className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">О платформе</div>
                <div className="text-xs text-gray-500">Как это работает?</div>
              </div>
            </Link>

            <Link
              href="/drones"
              onClick={() => {
                setMobileOpen(false);
                document.body.style.overflow = '';
              }}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition"
            >
              <MapPin className="w-5 h-5 text-blue-500" />
              <div className="text-sm font-medium">Дроны</div>
            </Link>

            {/* Services accordion (mobile) */}
            <div className="border border-transparent rounded-lg">
              <button
                onClick={() => setOpenServiceIndex((i) => (i === 0 ? null : 0))}
                className="w-full text-left py-2 px-2 flex items-center justify-between rounded-lg hover:bg-gray-50 transition"
                aria-expanded={openServiceIndex === 0}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="text-sm font-medium">Услуги</div>
                    <div className="text-xs text-gray-500">
                      Наши предложения
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openServiceIndex === 0 ? 'rotate-180' : ''}`}
                />
              </button>

              {openServiceIndex === 0 && (
                <div className="mt-2 pl-2 pr-1 space-y-1">
                  {menuSections.map((section, sidx) => (
                    <div key={section.title} className="mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                        <div className="p-1 bg-gray-100 rounded">
                          {section.icon}
                        </div>
                        {section.title}
                      </div>

                      <ul className="space-y-1">
                        {section.links.map((link) => (
                          <li key={link.label}>
                            <button
                              onClick={(e) => {
                                handleServiceClick(e, link.label);
                              }}
                              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition w-full text-left"
                            >
                              <div className="w-8 h-8 p-1 bg-gray-50 rounded-md flex items-center justify-center">
                                {link.icon}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {link.label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {link.description}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="mt-1 py-2 px-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <div className="text-sm text-gray-700">
                        Спецпредложение: скидка при заказе 3+ услуг
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* остальные пункты меню (permissions, contacts...) оставлены без изменений */}
            <div className="h-px bg-gray-100 my-2" />

            <Link
              href="/permissions"
              onClick={() => {
                setMobileOpen(false);
                document.body.style.overflow = '';
              }}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-500" />
              <div className="text-sm font-medium">Разрешения</div>
            </Link>

            <Link
              href="/to-the-customer"
              onClick={() => {
                setMobileOpen(false);
                document.body.style.overflow = '';
              }}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition"
            >
              <ClipboardList className="w-5 h-5 text-orange-500" />
              <div className="text-sm font-medium">Заказчику</div>
            </Link>

            <Link
              href="/contacts"
              onClick={() => {
                setMobileOpen(false);
                document.body.style.overflow = '';
              }}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition"
            >
              <MessageSquare className="w-5 h-5 text-violet-500" />
              <div className="text-sm font-medium">Контакты</div>
            </Link>

            <div className="h-px bg-gray-100 my-2" />

            <div className="mt-2">
              {role === 'GUEST' ? (
                <Link
                  href="/login"
                  onClick={() => {
                    setMobileOpen(false);
                    document.body.style.overflow = '';
                  }}
                  className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white"
                >
                  <LogIn className="w-5 h-5" />
                  Вход
                </Link>
              ) : (
                <div className="space-y-2" />
              )}
            </div>

            {/* small footer actions */}
          </nav>
        </aside>
      </div>
    </header>
  );
}
