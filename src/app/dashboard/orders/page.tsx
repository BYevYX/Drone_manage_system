'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
  Calendar,
  User,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { useAuth } from '@/src/lib/hooks/useAuth';
import type { Order, OrderStatus, OrderCategory } from '@/src/types/orders';

// Mock data - в реальном приложении будет загружаться из API
const mockOrders: Order[] = [
  {
    id: '1',
    category: 'drone-services',
    status: 'completed',
    title: 'Опрыскивание пшеничного поля',
    description: 'Обработка поля площадью 45 га гербицидом',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    userId: 'user-1',
    isDraft: false,
    serviceType: 'spraying',
    droneModel: 'DJI Agras T40',
    location: {
      address: 'Краснодарский край, Кущевский район',
      coordinates: { lat: 46.123, lng: 39.456 },
      fieldType: 'Пшеничное поле',
      cropType: 'Пшеница озимая',
    },
    flightParameters: {
      area: 45,
      altitude: 3,
      speed: 15,
      overlap: 20,
      resolution: 5,
      weatherConditions: ['Ясно', 'Слабый ветер'],
      timeOfDay: 'morning',
      duration: 120,
    },
    scheduledDate: '2024-01-16T08:00:00Z',
    urgency: 'medium',
    estimatedCost: 15000,
  },
  {
    id: '2',
    category: 'equipment-info',
    status: 'pending',
    title: 'Информация о новом дроне DJI T50',
    description: 'Добавление технических характеристик',
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    userId: 'user-1',
    isDraft: false,
    equipmentType: 'drone',
    manufacturer: 'DJI',
    model: 'Agras T50',
    specifications: {
      weight: 25,
      dimensions: { length: 1.8, width: 1.8, height: 0.6 },
      batteryLife: 15,
      maxSpeed: 22,
      maxAltitude: 30,
      payloadCapacity: 40,
      operatingTemperature: { min: -10, max: 40 },
      connectivity: ['4G', 'WiFi'],
      sensors: ['GPS', 'Камера', 'Лидар'],
    },
    condition: 'new',
    availability: 'available',
    price: 850000,
    currency: 'RUB',
    images: [],
    documentation: [],
    certifications: [],
    warranty: {
      duration: 24,
      type: 'Полная гарантия',
      coverage: ['Ремонт', 'Замена'],
    },
  },
  {
    id: '3',
    category: 'feedback',
    status: 'draft',
    title: 'Предложение по улучшению интерфейса',
    description: 'Идеи по улучшению пользовательского опыта',
    createdAt: '2024-01-13T12:00:00Z',
    updatedAt: '2024-01-13T12:30:00Z',
    userId: 'user-1',
    isDraft: true,
    feedbackType: 'improvement',
    priority: 'medium',
    subject: 'Улучшение навигации в мобильной версии',
    details: 'Предлагаю добавить боковое меню для удобной навигации...',
    contactPreference: 'email',
    followUpRequired: true,
    category_tags: ['UI/UX', 'Мобильная версия'],
  },
];

const statusConfig = {
  draft: {
    label: 'Черновик',
    color: 'text-gray-600 bg-gray-100',
    icon: <FileText className="h-4 w-4" />,
  },
  pending: {
    label: 'В ожидании',
    color: 'text-yellow-600 bg-yellow-100',
    icon: <Clock className="h-4 w-4" />,
  },
  'in-progress': {
    label: 'В работе',
    color: 'text-blue-600 bg-blue-100',
    icon: <PlayCircle className="h-4 w-4" />,
  },
  completed: {
    label: 'Завершен',
    color: 'text-green-600 bg-green-100',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: 'Отменен',
    color: 'text-red-600 bg-red-100',
    icon: <XCircle className="h-4 w-4" />,
  },
};

const categoryConfig = {
  'drone-services': {
    label: 'Дрон-услуги',
    color: 'text-blue-600',
    icon: <Package className="h-4 w-4" />,
  },
  'equipment-info': {
    label: 'Оборудование',
    color: 'text-green-600',
    icon: <Package className="h-4 w-4" />,
  },
  'materials-data': {
    label: 'Материалы',
    color: 'text-purple-600',
    icon: <Package className="h-4 w-4" />,
  },
  feedback: {
    label: 'Обратная связь',
    color: 'text-orange-600',
    icon: <Package className="h-4 w-4" />,
  },
};

export default function OrdersPage() {
  const {} = useAuth();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<OrderCategory | 'all'>(
    'all',
  );
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDraftsNotification, setShowDraftsNotification] = useState(false);

  // Check for drafts on component mount
  useEffect(() => {
    const drafts = orders.filter((order) => order.isDraft);
    if (drafts.length > 0) {
      setShowDraftsNotification(true);
      toast.success(`У вас есть ${drafts.length} сохраненных черновиков`, {
        duration: 5000,
        icon: '📝',
      });
    }
  }, [orders]);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || order.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      setOrders(orders.filter((order) => order.id !== orderId));
      toast.success('Заказ успешно удален');
    }
  };

  const handleExportOrders = () => {
    const dataStr = JSON.stringify(filteredAndSortedOrders, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `orders_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('История заказов экспортирована');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const draftsCount = orders.filter((order) => order.isDraft).length;
  const completedCount = orders.filter(
    (order) => order.status === 'completed',
  ).length;
  const pendingCount = orders.filter(
    (order) => order.status === 'pending' || order.status === 'in-progress',
  ).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
                <p className="mt-2 text-gray-600">
                  Управляйте своими заказами и отслеживайте их статус
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExportOrders}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Экспорт
                </button>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Новый заказ
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Всего заказов
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Завершено</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">В работе</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Черновики</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {draftsCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Drafts Notification */}
          <AnimatePresence>
            {showDraftsNotification && draftsCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">
                        У вас есть {draftsCount} сохраненных черновиков
                      </h3>
                      <p className="text-sm text-blue-600">
                        Вы можете продолжить их оформление в любое время
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDraftsNotification(false)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Поиск заказов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as OrderStatus | 'all')
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все статусы</option>
                <option value="draft">Черновики</option>
                <option value="pending">В ожидании</option>
                <option value="in-progress">В работе</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as OrderCategory | 'all')
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все категории</option>
                <option value="drone-services">Дрон-услуги</option>
                <option value="equipment-info">Оборудование</option>
                <option value="materials-data">Материалы</option>
                <option value="feedback">Обратная связь</option>
              </select>

              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'date' | 'status' | 'title')
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">По дате</option>
                  <option value="status">По статусу</option>
                  <option value="title">По названию</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAndSortedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}
                          >
                            {statusConfig[order.status].icon}
                            {statusConfig[order.status].label}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryConfig[order.category].color} bg-gray-100`}
                          >
                            {categoryConfig[order.category].icon}
                            {categoryConfig[order.category].label}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">
                          {order.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Создан: {formatDate(order.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            ID: {order.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          Просмотр
                        </Link>

                        {order.isDraft && (
                          <Link
                            href={`/services/${order.category}?draft=${order.id}`}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Продолжить
                          </Link>
                        )}

                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredAndSortedOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Заказы не найдены
                </h3>
                <p className="text-gray-600 mb-4">
                  Попробуйте изменить фильтры или создайте новый заказ
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Создать заказ
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
