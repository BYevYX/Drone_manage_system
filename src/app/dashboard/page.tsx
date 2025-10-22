'use client';
import { motion } from 'framer-motion';
import { RefreshCw, Filter, Plus, Download, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Динамические импорты компонентов
const TasksMapPage = dynamic(
  () => import('./contractor/layouts/TasksMapPage'),
  { ssr: false },
);
const Analytics = dynamic(() => import('./contractor/layouts/Analyticss'), {
  ssr: false,
});
const Shifts = dynamic(() => import('./contractor/layouts/Shifts'), {
  ssr: false,
});
const EditBid = dynamic(() => import('./contractor/layouts/bids/EditBid'), {
  ssr: false,
});
const Dashboard = dynamic(() => import('./contractor/layouts/Dashboard'), {
  ssr: false,
});
const AddBid = dynamic(() => import('./contractor/layouts/bids/AddBid'), {
  ssr: false,
});
const Fields = dynamic(() => import('./contractor/layouts/Fields'), {
  ssr: false,
});
const Support = dynamic(() => import('./contractor/layouts/Support'), {
  ssr: false,
});
const Overview = dynamic(() => import('./manager/Overview'), { ssr: false });
const Requests = dynamic(() => import('./contractor/layouts/Requests'), {
  ssr: false,
});
const Reports = dynamic(() => import('./contractor/layouts/Reports'), {
  ssr: false,
});

import { useGlobalContext } from '../GlobalContext';
import { useActiveMenu } from './ActiveMenuContext';
import DashboardSidebar from './components/DashboardSidebar';
import {
  useDashboardData,
  useRoleDashboardCards,
} from '../hooks/useDashboardData';
import ApiTestComponent from './components/ApiTestComponent';

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

const fuelStats = [
  { name: 'Израсходовано', value: 112 },
  { name: 'Слито', value: 5 },
  { name: 'Остаток', value: 33 },
];

export default function Page() {
  const { activeMenu, setActiveMenu } = useActiveMenu();
  const { userRole } = useGlobalContext();

  // Load dashboard data from backend
  const { stats, loading, error, refreshData } = useDashboardData({
    userRole,
    enabled: true,
  });

  // Get role-specific dashboard cards
  const getRoleCards = useRoleDashboardCards(userRole, stats);
  const dashboardCards = getRoleCards();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-900">
      {/* Navigation Sidebar */}
      <aside className="w-80 flex-shrink-0 p-6">
        <DashboardSidebar />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <section className="flex-1 overflow-y-hidden p-6 pl-0 space-y-6">
          {/* Default Dashboard Content */}
          {(activeMenu === '/dashboard' || activeMenu === 'dashboard' || activeMenu === '') && (
            <>
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="ml-2 text-gray-600">Загрузка данных...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                  </div>
                  <button
                    onClick={refreshData}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    Повторить
                  </button>
                </div>
              )}

              {/* Dashboard Cards */}
              {!loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-[20px]"
                >
                  {dashboardCards.map((stat, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-xl shadow-sm ${stat.color} border border-gray-100 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-3xl font-bold mb-1">{stat.value}</div>
                          <div className="text-gray-600 text-sm">{stat.title}</div>
                        </div>
                        <span className={`${
                          stat.trend === 'up' ? 'text-green-500' :
                          stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
              {userRole === 'operator' && (
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
                </>
              )}
              {userRole === 'manager' && <Overview />}
              {userRole === 'material_supplier' && (
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
            </>
          )}

          {/* Подрядчик: BI и агрономия */}
          {userRole === 'contractor' && activeMenu === 'contractor/main' && (
            <Dashboard />
          )}
          {userRole === 'contractor' && activeMenu === 'requests' && (
            <Requests setActiveMenu={setActiveMenu} />
          )}
          {userRole === 'contractor' && activeMenu === 'editbid' && (
            <EditBid setActiveMenu={setActiveMenu} />
          )}
          {userRole === 'contractor' && activeMenu === 'addbid' && (
            <AddBid setActiveMenu={setActiveMenu} />
          )}
          {userRole === 'contractor' && activeMenu === 'fields' && <Fields />}
          {userRole === 'contractor' && activeMenu === 'reports' && <Reports />}
          {userRole === 'contractor' && activeMenu === 'support' && <Support />}
          {activeMenu === 'tasksMap' && <TasksMapPage />}
          {activeMenu === 'analytics' && <Analytics />}
          {activeMenu === 'shifts' && <Shifts />}
          {activeMenu === 'overview' && <Overview />}
          {activeMenu === 'api-test' && <ApiTestComponent />}

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
                            {/* Drone icon placeholder */}
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
            </>
          )}

          {/* Поставщик: заказы, склад, поставки */}
          {userRole === 'material_supplier' && (
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
            </>
          )}

        </section>
      </main>
    </div>
  );
}
