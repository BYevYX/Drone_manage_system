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
import dynamic from 'next/dynamic';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);
import TasksMapPage from './contractor/layouts/TasksMapPage';
import Analytics from './contractor/layouts/Analyticss';
import Shifts from './contractor/layouts/Shifts';

import EditBid from './contractor/layouts/bids/EditBid';
import { useGlobalContext } from '../GlobalContext';
import Dashboard from './contractor/layouts/Dashboard';
import AddBid from './contractor/layouts/bids/AddBid';
import Link from 'next/link';
import Fields from './contractor/layouts/Fields';
import Support from './contractor/layouts/Support';
import Overview from './manager/Overview';

import Requests from './contractor/layouts/Requests';
import { useActiveMenu } from './ActiveMenuContext';
import Reports from './contractor/layouts/Reports';

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

// Remove the FieldMap component that uses Leaflet hooks to avoid SSR issues
// This can be re-implemented as a client-side only component if needed
interface ChildProps {
  activeMenu: string;
  setActiveMenu: React.Dispatch<React.SetStateAction<string>>;
}

export default function Page() {
  const { activeMenu, setActiveMenu } = useActiveMenu();

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-900">
      <main className="flex-1 flex flex-col overflow-hidden">
        <section className="flex-1 overflow-y-hidden p-6 space-y-6">
          {/* Подрядчик: BI и агрономия */}
          {userRole === 'contractor' && activeMenu === 'contractor/main' && (
            <Dashboard></Dashboard>
          )}
          {userRole === 'contractor' && activeMenu === 'contractor/requests' && (
            <Requests setActiveMenu={setActiveMenu}></Requests>
          )}
          {userRole === 'contractor' && activeMenu === 'editbid' && (
            <EditBid setActiveMenu={setActiveMenu}></EditBid>
          )}
          {userRole === 'contractor' && activeMenu === 'addbid' && (
            <AddBid setActiveMenu={setActiveMenu}></AddBid>
          )}
          {userRole === 'contractor' && activeMenu === 'fields' && (
            <Fields></Fields>
          )}
          {userRole === 'contractor' && activeMenu === 'reports' && (
            <Reports></Reports>
          )}
          {userRole === 'contractor' && activeMenu === 'support' && (
            <Support></Support>
          )}
          {activeMenu === 'tasksMap' && <TasksMapPage></TasksMapPage>}
          {activeMenu === 'analytics' && <Analytics></Analytics>}
          {activeMenu === 'shifts' && <Shifts></Shifts>}
          {activeMenu === 'overview' && <Overview></Overview>}

          {/* <EditBid></EditBid> */}

          {/* ///////////////////////////////////////////////////////////////////////////////// */}
          {/* Оператор: задачи, техника, смены, ГСМ */}
          {userRole === 'operator' && (
            <>
              {activeMenu === 'tasks' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Активные задачи</h3>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                          <RefreshCw size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                          <Filter size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-600 border-b">
                            <th className="pb-3 px-4">Дрон</th>
                            <th className="pb-3 px-4">Операция</th>
                            <th className="pb-3 px-4">Поле</th>
                            <th className="pb-3 px-4">Оператор</th>
                            <th className="pb-3 px-4">Батарея</th>
                            <th className="pb-3 px-4">Статус</th>
                            <th className="pb-3 px-4">Прогресс</th>
                          </tr>
                        </thead>
                        <tbody>
                          {droneTasks.map((task) => (
                            <motion.tr
                              key={task.id}
                              whileHover={{
                                backgroundColor: 'rgba(249, 250, 251, 0.8)',
                              }}
                              className="border-b last:border-b-0"
                            >
                              <td className="py-3 px-4 font-medium">
                                {task.drone}
                              </td>
                              <td className="px-4">{task.operation}</td>
                              <td className="px-4">{task.field}</td>
                              <td className="px-4">{task.operator}</td>
                              <td className="px-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      task.battery > 70
                                        ? 'bg-green-500'
                                        : task.battery > 30
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                    }`}
                                    style={{ width: `${task.battery}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">
                                  {task.battery}%
                                </span>
                              </td>
                              <td className="px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    task.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {task.status === 'active'
                                    ? 'В работе'
                                    : 'Завершено'}
                                </span>
                              </td>
                              <td className="px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-emerald-500 h-2 rounded-full"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {task.progress}%
                                  </span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                    >
                      <h3 className="text-lg font-semibold mb-4">
                        График смен
                      </h3>
                      <div className="space-y-3">
                        {shifts.map((shift) => (
                          <motion.div
                            key={shift.id}
                            whileHover={{ scale: 1.01 }}
                            className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full ${shift.avatar} flex items-center justify-center text-white`}
                              >
                                {shift.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{shift.name}</div>
                                <div className="text-sm text-gray-600">
                                  {shift.start} - {shift.end}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  shift.status === 'В работе'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {shift.status}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                    >
                      <h3 className="text-lg font-semibold mb-4">
                        Контроль ГСМ
                      </h3>
                      <div className="flex gap-4">
                        <PieChart width={160} height={160}>
                          <Pie
                            data={fuelStats}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={2}
                          >
                            {fuelStats.map((entry, index) => (
                              <Cell
                                key={`cell-fuel-${index}`}
                                fill={
                                  ['#10b981', '#f43f5e', '#f59e42'][index % 3]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} л`, 'Топливо']}
                          />
                        </PieChart>
                        <div className="flex-1">
                          <div className="space-y-2">
                            {fuelStats.map((stat, index) => (
                              <div
                                key={stat.name}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: [
                                      '#10b981',
                                      '#f43f5e',
                                      '#f59e42',
                                    ][index % 3],
                                  }}
                                />
                                <span className="text-sm flex-1">
                                  {stat.name}
                                </span>
                                <span className="text-sm font-medium">
                                  {stat.value} л
                                </span>
                              </div>
                            ))}
                            <div className="mt-4 text-sm text-gray-500">
                              Контроль расхода, сливов и остатка
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}

              {activeMenu === 'drones' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Парк дронов</h3>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Plus size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        id: 1,
                        model: 'DJI Agras T40',
                        status: 'active',
                        battery: 78,
                        lastService: '15.05.2025',
                        tasks: 3,
                      },
                      {
                        id: 2,
                        model: 'DJI Agras T20P',
                        status: 'maintenance',
                        battery: 0,
                        lastService: '22.05.2025',
                        tasks: 0,
                      },
                      {
                        id: 3,
                        model: 'XAG V40',
                        status: 'ready',
                        battery: 100,
                        lastService: '10.05.2025',
                        tasks: 1,
                      },
                    ].map((drone) => (
                      <motion.div
                        key={drone.id}
                        whileHover={{ y: -2 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            {/* <Drone size={24} className="text-emerald-600" /> */}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{drone.model}</div>
                            <div className="text-sm text-gray-600">
                              {drone.status === 'active'
                                ? 'В работе'
                                : drone.status === 'ready'
                                  ? 'Готов к работе'
                                  : 'На обслуживании'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {drone.tasks} задач
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Заряд:</span>
                            <span>{drone.battery}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                drone.battery > 70
                                  ? 'bg-green-500'
                                  : drone.battery > 30
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${drone.battery}%` }}
                            />
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            Последнее ТО: {drone.lastService}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeMenu === 'map' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Карта заданий</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                        <Plus size={16} /> Новый маршрут
                      </button>
                    </div>
                  </div>
                  <div className="h-96 rounded-lg overflow-hidden border border-gray-200 relative bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-500">Карта загружается...</div>
                  </div>
                </motion.div>
              )}

              {activeMenu === 'flight-planning' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-semibold mb-4">
                    Планирование полетов
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-1 space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Выбор поля</h4>
                        <select className="w-full p-2 border border-gray-300 rounded-lg">
                          <option>Поле 1 - Пшеница (12 га)</option>
                          <option>Поле 2 - Кукуруза (8 га)</option>
                          <option>Поле 3 - Подсолнечник (15 га)</option>
                        </select>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-3">
                          Параметры обработки
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Тип обработки
                            </label>
                            <select className="w-full p-2 border border-gray-300 rounded-lg">
                              <option>Опрыскивание</option>
                              <option>Внесение удобрений</option>
                              <option>Десикация</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Материал
                            </label>
                            <select className="w-full p-2 border border-gray-300 rounded-lg">
                              <option>Гербицид "Агрохим"</option>
                              <option>Удобрение NPK 10-10-10</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Норма внесения (л/га)
                            </label>
                            <input
                              type="number"
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              defaultValue="2.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <div className="h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <div className="text-gray-500">Карта планирования загружается...</div>
                      </div>
                      <div className="mt-4 flex justify-end gap-3">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Предпросмотр
                        </button>
                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                          Сохранить маршрут
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
          {/* Менеджер: финансы, команда, интеграции */}
          {userRole === 'manager' && (
            <>
              {activeMenu === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Финансовая аналитика
                      </h3>
                      <select className="text-sm border border-gray-200 rounded-lg px-2 py-1">
                        <option>Последние 30 дней</option>
                        <option>Последние 90 дней</option>
                        <option>Текущий год</option>
                      </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            border: '1px solid #eee',
                          }}
                        />
                        <Bar
                          dataKey="area"
                          name="Выручка (тыс. руб)"
                          fill="#4f46e5"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Ключевые показатели
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: 'Рентабельность',
                          value: '24%',
                          change: '+2%',
                          trend: 'up',
                        },
                        {
                          title: 'Средний чек',
                          value: '₽12,450',
                          change: '+₽1,200',
                          trend: 'up',
                        },
                        {
                          title: 'Конверсия',
                          value: '68%',
                          change: '-3%',
                          trend: 'down',
                        },
                        {
                          title: 'LTV',
                          value: '₽89,200',
                          change: '+₽4,500',
                          trend: 'up',
                        },
                      ].map((metric, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <div className="text-gray-600 text-sm">
                              {metric.title}
                            </div>
                            <div className="font-medium">{metric.value}</div>
                          </div>
                          <div
                            className={`text-sm ${
                              metric.trend === 'up'
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {metric.change}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {activeMenu === 'team' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Команда</h3>
                    <button className="px-3 py-1 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                      <Plus size={16} /> Добавить сотрудника
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-600 border-b">
                          <th className="pb-3 px-4">Сотрудник</th>
                          <th className="pb-3 px-4">Должность</th>
                          <th className="pb-3 px-4">Статус</th>
                          <th className="pb-3 px-4">Задачи</th>
                          <th className="pb-3 px-4">Последняя активность</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            id: 1,
                            name: 'Иванов Иван Иванович',
                            role: 'Оператор дронов',
                            status: 'Активен',
                            tasks: 3,
                            lastActive: '2 часа назад',
                          },
                          {
                            id: 2,
                            name: 'Петров Петр Петрович',
                            role: 'Агроном',
                            status: 'Активен',
                            tasks: 2,
                            lastActive: '5 часов назад',
                          },
                          {
                            id: 3,
                            name: 'Сидорова Мария Сергеевна',
                            role: 'Менеджер по клиентам',
                            status: 'В отпуске',
                            tasks: 0,
                            lastActive: '3 дня назад',
                          },
                        ].map((employee) => (
                          <motion.tr
                            key={employee.id}
                            whileHover={{
                              backgroundColor: 'rgba(249, 250, 251, 0.8)',
                            }}
                            className="border-b last:border-b-0"
                          >
                            <td className="py-3 px-4 font-medium">
                              {employee.name}
                            </td>
                            <td className="px-4">{employee.role}</td>
                            <td className="px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  employee.status === 'Активен'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {employee.status}
                              </span>
                            </td>
                            <td className="px-4">{employee.tasks}</td>
                            <td className="px-4 text-sm text-gray-500">
                              {employee.lastActive}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeMenu === 'integrations' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-semibold mb-4">Интеграции</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: 1,
                        name: '1С:ERP АГРО',
                        status: 'active',
                        description:
                          'Интеграция с системой управления сельхозпредприятием',
                        logo: '1c-logo.png',
                      },
                      {
                        id: 2,
                        name: 'ГЛОНАСС мониторинг',
                        status: 'pending',
                        description: 'Трекинг транспорта и техники',
                        logo: 'glonass-logo.png',
                      },
                      {
                        id: 3,
                        name: 'Погодные сервисы',
                        status: 'inactive',
                        description: 'Прогноз погоды для планирования работ',
                        logo: 'weather-logo.png',
                      },
                      {
                        id: 4,
                        name: 'Агроаналитика',
                        status: 'active',
                        description: 'Спутниковый мониторинг полей',
                        logo: 'agro-logo.png',
                      },
                    ].map((integration) => (
                      <motion.div
                        key={integration.id}
                        whileHover={{ y: -2 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <img
                              src={`/icons/${integration.logo}`}
                              alt={integration.name}
                              className="w-6 h-6 object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {integration.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {integration.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              integration.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : integration.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {integration.status === 'active'
                              ? 'Активна'
                              : integration.status === 'pending'
                                ? 'В процессе'
                                : 'Неактивна'}
                          </span>
                          <button className="text-sm text-emerald-600 hover:text-emerald-800">
                            Настроить
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
          {/* Поставщик: заказы, склад, поставки */}
          {userRole === 'supplier' && (
            <>
              {activeMenu === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Заказы</h3>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Download size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Filter size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-600 border-b">
                          <th className="pb-3 px-4">№ заказа</th>
                          <th className="pb-3 px-4">Клиент</th>
                          <th className="pb-3 px-4">Материал</th>
                          <th className="pb-3 px-4">Количество</th>
                          <th className="pb-3 px-4">Дата доставки</th>
                          <th className="pb-3 px-4">Статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            id: 2456,
                            client: 'Агрохолдинг "Поле"',
                            material: 'Гербицид "Агрохим"',
                            quantity: '20 л',
                            date: '15.06.2025',
                            status: 'В обработке',
                          },
                          {
                            id: 2455,
                            client: 'Фермерское хозяйство "Заря"',
                            material: 'Удобрение NPK',
                            quantity: '500 кг',
                            date: '12.06.2025',
                            status: 'Доставлено',
                          },
                          {
                            id: 2454,
                            client: 'Агрокомплекс "Нива"',
                            material: 'Семена пшеницы',
                            quantity: '2 т',
                            date: '10.06.2025',
                            status: 'В пути',
                          },
                        ].map((order) => (
                          <motion.tr
                            key={order.id}
                            whileHover={{
                              backgroundColor: 'rgba(249, 250, 251, 0.8)',
                            }}
                            className="border-b last:border-b-0"
                          >
                            <td className="py-3 px-4 font-medium">
                              #{order.id}
                            </td>
                            <td className="px-4">{order.client}</td>
                            <td className="px-4">{order.material}</td>
                            <td className="px-4">{order.quantity}</td>
                            <td className="px-4">{order.date}</td>
                            <td className="px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'Доставлено'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'В пути'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeMenu === 'inventory' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Остатки на складе
                      </h3>
                      <button className="px-3 py-1 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                        <Plus size={16} /> Новая поставка
                      </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { name: 'Гербициды', value: 120 },
                          { name: 'Удобрения', value: 450 },
                          { name: 'Семена', value: 320 },
                          { name: 'Запчасти', value: 85 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            border: '1px solid #eee',
                          }}
                        />
                        <Bar
                          dataKey="value"
                          name="Количество"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Срочные заказы
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          id: 1,
                          material: 'Гербицид "Экстра"',
                          quantity: '10 л',
                          client: 'Агрофирма "Рассвет"',
                          deadline: 'Сегодня',
                        },
                        {
                          id: 2,
                          material: 'Удобрение KNO3',
                          quantity: '100 кг',
                          client: 'КФХ "Поляна"',
                          deadline: 'Завтра',
                        },
                      ].map((order) => (
                        <motion.div
                          key={order.id}
                          whileHover={{ scale: 1.01 }}
                          className="p-3 border border-red-200 rounded-lg bg-red-50"
                        >
                          <div className="font-medium text-red-800">
                            {order.material}
                          </div>
                          <div className="text-sm text-red-600">
                            {order.quantity}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {order.client}
                          </div>
                          <div className="text-xs text-red-500 mt-2 font-medium">
                            Срок: {order.deadline}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
