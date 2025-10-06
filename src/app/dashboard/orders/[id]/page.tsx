'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  Truck,
  Phone,
  Mail,
  Star,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import type { Order, OrderStatus } from '@/src/types/orders';

// Mock data - в реальном приложении будет загружаться из API
const mockOrder: Order = {
  id: '1',
  category: 'drone-services',
  status: 'in-progress',
  title: 'Опрыскивание пшеничного поля',
  description: 'Обработка поля площадью 45 га гербицидом против сорняков',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-16T14:20:00Z',
  userId: 'user-1',
  isDraft: false,
  serviceType: 'spraying',
  droneModel: 'DJI Agras T40',
  location: {
    address: 'Краснодарский край, Кущевский район, село Раздольное',
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
    weatherConditions: ['Ясно', 'Слабый ветер до 5 м/с'],
    timeOfDay: 'morning',
    duration: 120,
  },
  scheduledDate: '2024-01-16T08:00:00Z',
  urgency: 'medium',
  estimatedCost: 15000,
  assignedOperator: {
    id: 'op-1',
    name: 'Иван Петров',
    phone: '+7 (999) 123-45-67',
    email: 'ivan.petrov@example.com',
    rating: 4.8,
  },
  statusHistory: [
    {
      status: 'pending',
      timestamp: '2024-01-15T10:30:00Z',
      comment: 'Заказ создан и ожидает обработки',
    },
    {
      status: 'in-progress',
      timestamp: '2024-01-15T14:20:00Z',
      comment: 'Заказ принят в работу. Назначен оператор Иван Петров',
    },
  ],
};

const statusConfig = {
  draft: {
    label: 'Черновик',
    color: 'text-gray-600 bg-gray-100',
    icon: <FileText className="h-5 w-5" />,
    description: 'Заказ сохранен как черновик',
  },
  pending: {
    label: 'В ожидании',
    color: 'text-yellow-600 bg-yellow-100',
    icon: <Clock className="h-5 w-5" />,
    description: 'Заказ ожидает обработки',
  },
  'in-progress': {
    label: 'В работе',
    color: 'text-blue-600 bg-blue-100',
    icon: <PlayCircle className="h-5 w-5" />,
    description: 'Заказ выполняется',
  },
  completed: {
    label: 'Завершен',
    color: 'text-green-600 bg-green-100',
    icon: <CheckCircle className="h-5 w-5" />,
    description: 'Заказ успешно выполнен',
  },
  cancelled: {
    label: 'Отменен',
    color: 'text-red-600 bg-red-100',
    icon: <XCircle className="h-5 w-5" />,
    description: 'Заказ отменен',
  },
};

const statusSteps: OrderStatus[] = ['pending', 'in-progress', 'completed'];

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки данных
    const loadOrder = async () => {
      setLoading(true);
      // В реальном приложении здесь будет API запрос
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOrder(mockOrder);
      setLoading(false);
    };

    loadOrder();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  const getCurrentStepIndex = (status: OrderStatus) => {
    return statusSteps.indexOf(status);
  };

  const handleExportOrder = () => {
    if (!order) return;

    const dataStr = JSON.stringify(order, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `order_${order.id}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Данные заказа экспортированы');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка данных заказа...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Заказ не найден
            </h2>
            <p className="text-gray-600 mb-4">
              Заказ с ID {orderId} не существует или был удален
            </p>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться к заказам
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад к заказам
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {order.title}
                  </h1>
                  <p className="text-gray-600">Заказ #{order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportOrder}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Экспорт
                </button>
                {order.isDraft && (
                  <Link
                    href={`/services/${order.category}?draft=${order.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Продолжить редактирование
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Статус заказа
            </h2>
            <div className="flex items-center justify-between mb-6">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index <= currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {statusConfig[step].icon}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        index <= currentStepIndex
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {statusConfig[step].label}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-4 ${
                        index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg ${statusConfig[order.status].color}`}
                >
                  {statusConfig[order.status].icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    {statusConfig[order.status].label}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {statusConfig[order.status].description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Детали заказа
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Описание
                    </label>
                    <p className="text-gray-900">{order.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Категория
                      </label>
                      <p className="text-gray-900 capitalize">
                        {order.category.replace('-', ' ')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Приоритет
                      </label>
                      <p className="text-gray-900 capitalize">
                        {order.urgency || 'Не указан'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Создан
                      </label>
                      <p className="text-gray-900">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Обновлен
                      </label>
                      <p className="text-gray-900">
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Specific Details */}
              {order.category === 'drone-services' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Параметры полета
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Модель дрона
                      </label>
                      <p className="text-gray-900">{order.droneModel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Тип услуги
                      </label>
                      <p className="text-gray-900 capitalize">
                        {order.serviceType}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Площадь (га)
                      </label>
                      <p className="text-gray-900">
                        {order.flightParameters?.area}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Высота полета (м)
                      </label>
                      <p className="text-gray-900">
                        {order.flightParameters?.altitude}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Скорость (м/с)
                      </label>
                      <p className="text-gray-900">
                        {order.flightParameters?.speed}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Продолжительность (мин)
                      </label>
                      <p className="text-gray-900">
                        {order.flightParameters?.duration}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">
                      Погодные условия
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {order.flightParameters?.weatherConditions?.map(
                        (condition, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {condition}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {order.location && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Местоположение
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-900">
                          {order.location.address}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.location.fieldType} - {order.location.cropType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    История изменений
                  </h2>
                  <div className="space-y-4">
                    {order.statusHistory.map((history, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-lg ${statusConfig[history.status].color}`}
                        >
                          {statusConfig[history.status].icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {statusConfig[history.status].label}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {formatDate(history.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {history.comment}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Cost Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Стоимость
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Предварительная:</span>
                    <span className="font-medium">
                      {order.estimatedCost
                        ? formatCurrency(order.estimatedCost)
                        : 'Не указана'}
                    </span>
                  </div>
                  {order.actualCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Итоговая:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(order.actualCost)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Operator */}
              {order.assignedOperator && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Назначенный оператор
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.assignedOperator.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {order.assignedOperator.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${order.assignedOperator.phone}`}
                          className="hover:text-blue-600"
                        >
                          {order.assignedOperator.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${order.assignedOperator.email}`}
                          className="hover:text-blue-600"
                        >
                          {order.assignedOperator.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Действия
                </h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    Связаться с поддержкой
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <Truck className="h-4 w-4" />
                    Отследить выполнение
                  </button>
                  {order.status === 'completed' && (
                    <button className="w-full flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors">
                      <Star className="h-4 w-4" />
                      Оценить работу
                    </button>
                  )}
                </div>
              </div>

              {/* Scheduled Date */}
              {order.scheduledDate && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Запланированная дата
                  </h2>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(order.scheduledDate)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Время выполнения работ
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
