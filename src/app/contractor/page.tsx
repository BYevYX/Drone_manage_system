'use client';
import React, { useState, useEffect } from 'react';
import {
  Home,
  Package,
  Users,
  Settings,
  LogOut,
  BarChart2,
  Calendar,
  MapPin,
  CheckCircle2,
  Map,
  CloudRain,
  Thermometer,
  Wind,
  Sun,
  Droplets,
  Clock,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Fix for default marker icons in Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function CustomerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [droneStatus, setDroneStatus] = useState([
    {
      id: 1,
      name: 'DJI Agras T40',
      status: 'active',
      battery: 78,
      location: [51.505, -0.09],
    },
    {
      id: 2,
      name: 'DJI Agras T20P',
      status: 'inactive',
      battery: 45,
      location: [51.51, -0.1],
    },
    {
      id: 3,
      name: 'XAG V40',
      status: 'maintenance',
      battery: 100,
      location: [51.515, -0.1],
    },
  ]);

  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Панель' },
    { id: 'orders', icon: <Package size={20} />, label: 'Заказы' },
    { id: 'clients', icon: <Users size={20} />, label: 'Клиенты' },
    // { id: 'drones', icon: <Drone size={20} />, label: 'Парк дронов' },
    { id: 'maps', icon: <Map size={20} />, label: 'Карты полей' },
    { id: 'weather', icon: <CloudRain size={20} />, label: 'Метеоданные' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Настройки' },
  ];

  // Simulate drone battery drain
  useEffect(() => {
    const interval = setInterval(() => {
      setDroneStatus((prev) =>
        prev.map((drone) => ({
          ...drone,
          battery:
            drone.status === 'active'
              ? Math.max(0, drone.battery - 1)
              : drone.battery,
        })),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      {/* Сайдбар */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-gray-200 transition-width duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <a href="/">
            <h1
              className={`text-xl font-bold text-green-600 transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              ДронАгро
            </h1>
          </a>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {sidebarOpen ? (
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveMenu(id)}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-green-100 transition-colors ${
                activeMenu === id
                  ? 'bg-green-200 text-green-700'
                  : 'text-gray-700'
              }`}
            >
              <span className="mr-3">{icon}</span>
              {sidebarOpen && label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-200">
          <button
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-100 transition-colors"
            onClick={() => alert('Выход из системы')}
          >
            <LogOut size={20} className="mr-3" />
            {sidebarOpen && 'Выйти'}
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Хедер */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {activeMenu === 'dashboard' && 'Панель управления'}
            {activeMenu === 'orders' && 'Мои заказы'}
            {activeMenu === 'clients' && 'Клиенты'}
            {activeMenu === 'drones' && 'Управление парком дронов'}
            {activeMenu === 'maps' && 'Карты полей'}
            {activeMenu === 'weather' && 'Метеоданные'}
            {activeMenu === 'settings' && 'Настройки'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Онлайн
            </button>
            <button
              aria-label="Профиль"
              className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold"
              title="Профиль"
            >
              А
            </button>
          </div>
        </header>

        {/* Контент страницы */}
        <section className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeMenu === 'dashboard' && (
            <DashboardContent droneStatus={droneStatus} />
          )}
          {activeMenu === 'orders' && <OrdersContent />}
          {activeMenu === 'clients' && <ClientsContent />}
          {activeMenu === 'drones' && (
            <DronesContent droneStatus={droneStatus} />
          )}
          {activeMenu === 'maps' && <MapsContent droneStatus={droneStatus} />}
          {activeMenu === 'weather' && <WeatherContent />}
          {activeMenu === 'settings' && <SettingsContent />}
        </section>
      </main>
    </div>
  );
}

// Контент панели управления
function DashboardContent({ droneStatus }: { droneStatus: any[] }) {
  const productivityData = [
    { name: 'Пн', value: 20 },
    { name: 'Вт', value: 35 },
    { name: 'Ср', value: 28 },
    { name: 'Чт', value: 45 },
    { name: 'Пт', value: 32 },
    { name: 'Сб', value: 18 },
    { name: 'Вс', value: 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<BarChart2 size={28} />}
        title="Активные заказы"
        value="12"
      />
      <StatCard
        icon={<Calendar size={28} />}
        title="Ближайшие задачи"
        value="3"
      />
      <StatCard
        icon={<MapPin size={28} />}
        title="Обработано гектаров"
        value="150"
      />

      <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Продуктивность за неделю</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2}
                name="Гектары"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Статус дронов</h3>
        <div className="space-y-3">
          {droneStatus.map((drone) => (
            <div
              key={drone.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex items-center">
                <span>{drone.name}</span>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    drone.battery > 50
                      ? 'bg-green-100 text-green-800'
                      : drone.battery > 20
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {drone.battery}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} /> Последние операции с дронами
        </h3>
        <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
          <li className="py-2 flex justify-between">
            <span>Опрыскивание полей пшеницы (15 га)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">DJI Agras T40</span>
              <CheckCircle2 className="text-green-500" />
            </div>
          </li>
          <li className="py-2 flex justify-between">
            <span>Внесение удобрений (сады, 8 га)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">XAG V40</span>
              <CheckCircle2 className="text-green-500" />
            </div>
          </li>
          <li className="py-2 flex justify-between">
            <span>Мониторинг состояния культур (22 га)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">DJI Agras T20P</span>
              <CheckCircle2 className="text-green-500" />
            </div>
          </li>
          <li className="py-2 flex justify-between">
            <span>Десикация подсолнечника (30 га)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">DJI Agras T40</span>
              <span className="text-yellow-500 text-sm">В процессе</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

function OrdersContent() {
  const orders = [
    {
      id: 1,
      client: 'ООО "АгроПром"',
      date: '2023-06-15',
      area: 45,
      status: 'Выполнен',
      type: 'Опрыскивание',
    },
    {
      id: 2,
      client: 'Фермерское хозяйство "Нива"',
      date: '2023-06-18',
      area: 22,
      status: 'В процессе',
      type: 'Внесение удобрений',
    },
    {
      id: 3,
      client: 'СХП "Заря"',
      date: '2023-06-20',
      area: 30,
      status: 'Запланирован',
      type: 'Десикация',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Мои заказы</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Площадь (га)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип работ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Выполнен'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'В процессе'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClientsContent() {
  const clients = [
    {
      id: 1,
      name: 'ООО "АгроПром"',
      contact: 'Иванов И.И.',
      phone: '+7 (123) 456-7890',
      fields: 5,
    },
    {
      id: 2,
      name: 'Фермерское хозяйство "Нива"',
      contact: 'Петров П.П.',
      phone: '+7 (987) 654-3210',
      fields: 2,
    },
    {
      id: 3,
      name: 'СХП "Заря"',
      contact: 'Сидоров С.С.',
      phone: '+7 (555) 123-4567',
      fields: 3,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Клиенты</h3>
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Поиск клиентов..."
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow transition">
            Добавить клиента
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакт
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Телефон
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Поля
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.contact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.fields}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-green-600 hover:text-green-800 mr-3">
                      Редактировать
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DronesContent({ droneStatus }: { droneStatus: any[] }) {
  const [selectedDrone, setSelectedDrone] = useState(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Парк дронов</h3>
        <div className="space-y-3">
          {droneStatus.map((drone) => (
            <div
              key={drone.id}
              className={`flex items-center justify-between p-3 border rounded cursor-pointer transition ${
                selectedDrone?.id === drone.id
                  ? 'border-green-500 bg-green-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedDrone(drone)}
            >
              <div className="flex items-center">
                <div>
                  <p className="font-medium">{drone.name}</p>
                  <p className="text-xs text-gray-500">ID: {drone.id}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    drone.battery > 50
                      ? 'bg-green-100 text-green-800'
                      : drone.battery > 20
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {drone.battery}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded shadow transition">
          Добавить дрон
        </button>
      </div>

      <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        {selectedDrone ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedDrone.name}</h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  selectedDrone.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : selectedDrone.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {selectedDrone.status === 'active'
                  ? 'Активен'
                  : selectedDrone.status === 'inactive'
                    ? 'Неактивен'
                    : 'На обслуживании'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border rounded p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Технические характеристики
                </h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Модель:</span>
                    <span className="font-medium">{selectedDrone.name}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Год выпуска:</span>
                    <span className="font-medium">2022</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Грузоподъемность:</span>
                    <span className="font-medium">40 кг</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Макс. скорость:</span>
                    <span className="font-medium">10 м/с</span>
                  </li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Текущее состояние
                </h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Батарея:</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          selectedDrone.battery > 50
                            ? 'bg-green-500'
                            : selectedDrone.battery > 20
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedDrone.battery}%` }}
                      ></div>
                    </div>
                    <span className="font-medium ml-2">
                      {selectedDrone.battery}%
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Последний полет:</span>
                    <span className="font-medium">2 часа назад</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Наработка:</span>
                    <span className="font-medium">120 часов</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">След. обслуживание:</span>
                    <span className="font-medium">через 30 часов</span>
                  </li>
                </ul>
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-500 mb-2">
              История полетов
            </h4>
            <div className="border rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тип работ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Площадь
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Длительность
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      2023-06-15
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      Опрыскивание
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      15 га
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      2 ч 15 мин
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Завершен
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      2023-06-12
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      Внесение удобрений
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      8 га
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      1 ч 30 мин
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Завершен
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>Выберите дрон для просмотра деталей</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MapsContent({ droneStatus }: { droneStatus: any[] }) {
  const [mapCenter] = useState([51.505, -0.09]);
  const [zoom] = useState(13);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Карты полей и маршруты дронов
        </h3>
        <div className="h-96 rounded-lg overflow-hidden relative">
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {droneStatus.map((drone) => (
              <Marker key={drone.id} position={drone.location}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-medium">{drone.name}</p>
                    <p>Батарея: {drone.battery}%</p>
                    <p>
                      Статус:{' '}
                      {drone.status === 'active' ? 'Активен' : 'Неактивен'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow z-[1000]">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs">Активен</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span className="text-xs">Неактивен</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs">Обслуживание</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Добавить новое поле
            </h4>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded shadow transition">
              Создать карту поля
            </button>
          </div>
          <div className="border rounded p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Импорт данных
            </h4>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded shadow transition">
              Загрузить геоданные
            </button>
          </div>
          <div className="border rounded p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Экспорт маршрутов
            </h4>
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded shadow transition">
              Скачать маршруты
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherContent() {
  const weatherData = [
    { time: '06:00', temp: 15, wind: 5, humidity: 80, precip: 0 },
    { time: '09:00', temp: 18, wind: 7, humidity: 70, precip: 0 },
    { time: '12:00', temp: 22, wind: 10, humidity: 60, precip: 0 },
    { time: '15:00', temp: 25, wind: 12, humidity: 55, precip: 10 },
    { time: '18:00', temp: 20, wind: 8, humidity: 65, precip: 20 },
    { time: '21:00', temp: 17, wind: 5, humidity: 75, precip: 0 },
  ];

  const currentWeather = {
    temp: 22,
    wind: 10,
    humidity: 60,
    precip: 10,
    condition: 'Частично облачно',
    icon: <CloudRain size={48} className="text-blue-500" />,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Текущие условия</h3>
        <div className="flex flex-col items-center">
          {currentWeather.icon}
          <p className="text-4xl font-bold mt-2">{currentWeather.temp}°C</p>
          <p className="text-gray-600 mt-1">{currentWeather.condition}</p>

          <div className="grid grid-cols-2 gap-4 mt-6 w-full">
            <div className="flex items-center">
              <Wind size={20} className="text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Ветер</p>
                <p className="font-medium">{currentWeather.wind} км/ч</p>
              </div>
            </div>
            <div className="flex items-center">
              <Droplets size={20} className="text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Влажность</p>
                <p className="font-medium">{currentWeather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <CloudRain size={20} className="text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Осадки</p>
                <p className="font-medium">{currentWeather.precip}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <Thermometer size={20} className="text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Давление</p>
                <p className="font-medium">1015 hPa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Прогноз на сегодня</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                stroke="#3B82F6"
                name="Температура (°C)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="wind"
                stroke="#10B981"
                name="Ветер (км/ч)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Рекомендации для полетов
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Оптимальные условия для полетов до 15:00. После 15:00 возможны
                  осадки (вероятность 10-20%), что может повлиять на качество
                  опрыскивания.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Настройки профиля</h3>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Имя
            </label>
            <input
              type="text"
              id="name"
              defaultValue="Александр"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              defaultValue="alex@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="company">
            Компания
          </label>
          <input
            type="text"
            id="company"
            defaultValue="АгроДронСервис"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            defaultValue="+7 (123) 456-7890"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-md font-medium mb-3">Настройки уведомлений</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify-email"
                defaultChecked
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="notify-email"
                className="ml-2 block text-sm text-gray-700"
              >
                Email-уведомления
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify-sms"
                defaultChecked
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="notify-sms"
                className="ml-2 block text-sm text-gray-700"
              >
                SMS-уведомления
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify-drone-status"
                defaultChecked
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="notify-drone-status"
                className="ml-2 block text-sm text-gray-700"
              >
                Уведомления о статусе дронов
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded shadow transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow transition"
          >
            Сохранить изменения
          </button>
        </div>
      </form>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
      <div className="p-3 bg-green-100 rounded-full text-green-600">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
