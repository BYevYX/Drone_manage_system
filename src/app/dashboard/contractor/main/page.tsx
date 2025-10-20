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
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { div } from 'framer-motion/client';
import EditBid from '../layouts/bids/EditBid';
import { useGlobalContext } from '@/src/app/GlobalContext';

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <span className="text-green-500">↑</span>;
  if (trend === 'down') return <span className="text-red-500">↓</span>;
  return <span className="text-gray-500">→</span>;
};

const pieData = [
  { name: 'Пшеница', value: 40 },
  { name: 'Кукуруза', value: 25 },
  { name: 'Подсолнечник', value: 20 },
  { name: 'Ячмень', value: 15 },
];
const COLORS = ['#10b981', '#f59e42', '#818cf8', '#f43f5e'];
const chartData = [
  { date: '01.06', area: 5, fuel: 22, plan: 25 },
  { date: '02.06', area: 8, fuel: 19, plan: 20 },
  { date: '03.06', area: 4, fuel: 20, plan: 18 },
  { date: '04.06', area: 10, fuel: 27, plan: 25 },
  { date: '05.06', area: 7, fuel: 24, plan: 22 },
  { date: '06.06', area: 12, fuel: 30, plan: 28 },
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

const FieldMap = ({ fieldId }: { fieldId: number }) => {
  const field = fieldCoordinates.find((f) => f.id === fieldId);
  const flightPath = flightPaths.find((fp) => fp.fieldId === fieldId);
  const map = useMap();

  useEffect(() => {
    if (field) {
      const bounds = L.latLngBounds(field.coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [field, map]);

  if (!field) return null;

  return (
    <>
      <Polyline
        positions={field.coordinates}
        color="#4f46e5"
        fillOpacity={0.2}
        fillColor="#4f46e5"
      />
      {flightPath && (
        <Polyline
          positions={flightPath.path}
          color={flightPath.status === 'completed' ? '#10b981' : '#f59e0b'}
          dashArray={flightPath.status === 'in-progress' ? '10, 10' : undefined}
        />
      )}
      <Marker position={field.coordinates[0]}>
        <Popup>
          {field.name} - {field.crop}, {field.area} га
        </Popup>
      </Marker>
    </>
  );
};

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

export default function Dashboard() {
  const { userRole } = useGlobalContext();
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-[20px]"
      >
        {[
          {
            title: 'Активные заявки',
            value: 3,
            color: 'bg-blue-100',
            trend: 'up',
          },
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
        ].map((stat, index) => (
          <div
            key={index}
            className={`p-5 rounded-xl shadow-sm ${stat.color} border border-gray-100 hover:shadow-md transition-shadow`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.title}</div>
              </div>
              <TrendIcon trend={stat.trend as 'up' | 'down' | 'stable'} />
            </div>
          </div>
        ))}
      </motion.div>

      <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-1"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart2 size={18} /> Аналитика культур
            </h3>
            <PieChart width={300} height={220}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} га`, 'Площадь']} />
            </PieChart>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChartBar size={18} /> Динамика обработки
              </h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Download size={16} />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Filter size={16} />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
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
                <Line
                  type="monotone"
                  dataKey="area"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Площадь (га)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="fuel"
                  stroke="#f59e42"
                  strokeWidth={2}
                  name="ГСМ (л)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold mb-4">
            Мониторинг состояния посевов
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Leaf size={18} /> NDVI индекс: <b>0.78</b>
              </div>
              <div className="text-gray-600 text-sm mt-2">
                <div>
                  Равномерность всходов: <b>95%</b>
                </div>
                <div className="mt-1">
                  Очаги болезней: <b>2 обнаружено</b>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <CalendarDays size={18} /> Погода: <b>+19°C, ясно</b>
              </div>
              <div className="text-gray-600 text-sm mt-2">
                <div>
                  Влажность: <b>58%</b>
                </div>
                <div className="mt-1">
                  Осадки: <b>нет</b>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2 text-yellow-600 font-medium">
                <AlertTriangle size={18} /> Вредители: <b>нет</b>
              </div>
              <div className="text-gray-600 text-sm mt-2">
                <div>
                  Последняя обработка: <b>5 дней назад</b>
                </div>
                <div className="mt-1">
                  Следующая обработка: <b>через 3 дня</b>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
        ></motion.div>
      </>
    </div>
  );
}
