'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Truck,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
  type Order,
  type User as ApiUser,
  apiClient,
  formatOrderStatus,
  getStatusColor,
} from '../../services/api';

interface OrderStatusTrackerProps {
  orderId?: string;
  showAllOrders?: boolean;
  userRole?: 'manager' | 'operator' | 'contractor';
}

interface OrderWithDetails extends Order {
  assignedOperator?: ApiUser;
  assignedSupplier?: ApiUser;
  statusHistory?: StatusHistoryItem[];
}

interface StatusHistoryItem {
  status: Order['status'];
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

const statusSteps: Array<{
  status: Order['status'];
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    status: 'new',
    label: 'Создан',
    icon: <Clock className="w-4 h-4" />,
    description: 'Заказ создан и ожидает обработки',
  },
  {
    status: 'in_progress',
    label: 'В обработке',
    icon: <RefreshCw className="w-4 h-4" />,
    description: 'Заказ принят в работу менеджером',
  },
  {
    status: 'planned',
    label: 'Запланирован',
    icon: <MapPin className="w-4 h-4" />,
    description: 'Назначены ресурсы и составлен план выполнения',
  },
  {
    status: 'completed',
    label: 'Выполнен',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Заказ успешно выполнен',
  },
];

export default function OrderStatusTracker({
  orderId,
  showAllOrders = false,
  userRole = 'manager',
}: OrderStatusTrackerProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setUsers] = useState<ApiUser[]>([]);

  useEffect(() => {
    loadData();
  }, [orderId, showAllOrders]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load users for assignment details
      const usersData = await apiClient.getUsers();
      setUsers(usersData);

      let ordersData: Order[] = [];

      if (orderId) {
        // Load specific order
        const order = await apiClient.getOrder(orderId);
        ordersData = [order];
      } else if (showAllOrders) {
        // Load all orders
        ordersData = await apiClient.getOrders();
      } else {
        // Load orders based on user role
        const currentUser = await apiClient.getCurrentUser();
        if (userRole === 'operator') {
          ordersData = await apiClient.getOrders({
            assignedOperatorId: currentUser.id,
          });
        } else {
          ordersData = await apiClient.getOrders();
        }
      }

      // Enhance orders with user details and mock status history
      const enhancedOrders: OrderWithDetails[] = ordersData.map((order) => ({
        ...order,
        assignedOperator: order.assignedOperatorId
          ? usersData.find((u) => u.id === order.assignedOperatorId)
          : undefined,
        assignedSupplier: order.assignedSupplierId
          ? usersData.find((u) => u.id === order.assignedSupplierId)
          : undefined,
        statusHistory: generateMockStatusHistory(order),
      }));

      setOrders(enhancedOrders);

      if (orderId && enhancedOrders.length > 0) {
        setSelectedOrder(enhancedOrders[0]);
      }
    } catch (err) {
      setError('Ошибка загрузки данных: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock status history for demonstration
  const generateMockStatusHistory = (order: Order): StatusHistoryItem[] => {
    const history: StatusHistoryItem[] = [];
    const now = new Date();

    // Always start with 'new'
    history.push({
      status: 'new',
      timestamp: order.createdAt,
      updatedBy: 'Система',
      notes: 'Заказ создан',
    });

    // Add intermediate statuses based on current status
    if (
      order.status === 'in_progress' ||
      order.status === 'planned' ||
      order.status === 'completed'
    ) {
      const inProgressTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      history.push({
        status: 'in_progress',
        timestamp: inProgressTime.toISOString(),
        updatedBy: 'Менеджер',
        notes: 'Заказ принят в обработку',
      });
    }

    if (order.status === 'planned' || order.status === 'completed') {
      const plannedTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
      history.push({
        status: 'planned',
        timestamp: plannedTime.toISOString(),
        updatedBy: 'Менеджер',
        notes: 'Назначены ресурсы и составлен план',
      });
    }

    if (order.status === 'completed') {
      history.push({
        status: 'completed',
        timestamp: order.updatedAt,
        updatedBy: 'Оператор',
        notes: 'Заказ выполнен успешно',
      });
    }

    if (order.status === 'clarify') {
      history.push({
        status: 'clarify',
        timestamp: order.updatedAt,
        updatedBy: 'Менеджер',
        notes: 'Требуется уточнение деталей заказа',
      });
    }

    if (order.status === 'rejected') {
      history.push({
        status: 'rejected',
        timestamp: order.updatedAt,
        updatedBy: 'Менеджер',
        notes: 'Заказ отклонен',
      });
    }

    return history.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  };

  const getStepStatus = (
    stepStatus: Order['status'],
    currentStatus: Order['status'],
  ) => {
    const stepIndex = statusSteps.findIndex((s) => s.status === stepStatus);
    const currentIndex = statusSteps.findIndex(
      (s) => s.status === currentStatus,
    );

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepColor = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500 text-white';
      case 'current':
        return 'bg-blue-500 border-blue-500 text-white animate-pulse';
      case 'pending':
        return 'bg-gray-200 border-gray-300 text-gray-500';
    }
  };

  const getConnectorColor = (status: 'completed' | 'current' | 'pending') => {
    return status === 'completed' ? 'bg-green-500' : 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
        <button
          onClick={loadData}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Selection */}
      {showAllOrders && orders.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Выберите заказ для отслеживания
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedOrder?.id === order.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">#{order.id.slice(-8)}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                  >
                    {formatOrderStatus(order.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>{order.type}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Tracker */}
      {(selectedOrder || (!showAllOrders && orders.length > 0)) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {(() => {
            const order = selectedOrder || orders[0];
            return (
              <>
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Заказ #{order.id.slice(-8)}
                    </h2>
                    <p className="text-gray-600">{order.type}</p>
                    {order.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {order.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                    >
                      {formatOrderStatus(order.status)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Обновлен: {new Date(order.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Оператор:</span>
                    <span className="text-sm font-medium">
                      {order.assignedOperator?.name ||
                        order.assignedOperator?.email ||
                        'Не назначен'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Поставщик:</span>
                    <span className="text-sm font-medium">
                      {order.assignedSupplier?.name ||
                        order.assignedSupplier?.email ||
                        'Не назначен'}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Статус выполнения
                  </h3>
                  <div className="relative">
                    {statusSteps.map((step, index) => {
                      const stepStatus = getStepStatus(
                        step.status,
                        order.status,
                      );
                      const isLast = index === statusSteps.length - 1;

                      return (
                        <div key={step.status} className="relative">
                          <div className="flex items-center">
                            {/* Step Circle */}
                            <div
                              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStepColor(stepStatus)}`}
                            >
                              {step.icon}
                            </div>

                            {/* Step Content */}
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {step.label}
                                </h4>
                                {stepStatus === 'current' && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    Текущий этап
                                  </span>
                                )}
                                {stepStatus === 'completed' && (
                                  <span className="text-xs text-green-600 font-medium">
                                    Завершено
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {step.description}
                              </p>
                            </div>
                          </div>

                          {/* Connector Line */}
                          {!isLast && (
                            <div
                              className={`absolute left-5 top-10 w-0.5 h-8 ${getConnectorColor(stepStatus)}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status History */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      История изменений
                    </h3>
                    <div className="space-y-3">
                      {order.statusHistory
                        .slice()
                        .reverse()
                        .map((historyItem, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(historyItem.status).split(' ')[0]}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {formatOrderStatus(historyItem.status)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    historyItem.timestamp,
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Изменил: {historyItem.updatedBy}
                              </div>
                              {historyItem.notes && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {historyItem.notes}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500">Заказы не найдены</div>
        </div>
      )}
    </div>
  );
}
