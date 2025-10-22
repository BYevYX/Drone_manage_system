'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Battery,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Play,
  RefreshCw,
  Settings,
  Truck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
  type Drone,
  type Order,
  apiClient,
  formatOrderStatus,
  getDroneStatusColor,
  getStatusColor,
} from '../../services/api';
import OrderManagement from '../manager/components/OrderManagement';

interface TaskStats {
  assigned: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

interface DroneStatus {
  id: string;
  name: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  batteryLevel: number;
  location: string;
  currentTask?: string;
}

export default function OperatorDashboard() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'drones' | 'schedule'>(
    'tasks',
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [availableDrones, setAvailableDrones] = useState<Drone[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  // Mock drone statuses for demo
  const [droneStatuses] = useState<DroneStatus[]>([
    {
      id: '1',
      name: 'DJI Agras T40',
      status: 'available',
      batteryLevel: 85,
      location: 'База',
      currentTask: undefined,
    },
    {
      id: '2',
      name: 'DJI Agras T30',
      status: 'in_use',
      batteryLevel: 45,
      location: 'Поле №3',
      currentTask: 'Опрыскивание пшеницы',
    },
    {
      id: '3',
      name: 'DJI Agras T20',
      status: 'maintenance',
      batteryLevel: 0,
      location: 'Сервис',
      currentTask: undefined,
    },
  ]);

  useEffect(() => {
    loadOperatorData();
  }, []);

  const loadOperatorData = async () => {
    try {
      setLoading(true);

      // Get current user to find their assigned orders
      const currentUser = await apiClient.getCurrentUser();

      // Load orders assigned to this operator
      const orders = await apiClient.getOrders({
        assignedOperatorId: currentUser.id,
      });

      setAssignedOrders(orders);

      // Calculate stats
      const stats: TaskStats = {
        assigned: orders.filter(
          (o) => o.status === 'new' || o.status === 'planned',
        ).length,
        inProgress: orders.filter((o) => o.status === 'in_progress').length,
        completed: orders.filter((o) => o.status === 'completed').length,
        overdue: orders.filter((o) => {
          // Simple overdue logic - orders older than 7 days that aren't completed
          const orderDate = new Date(o.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate < weekAgo && o.status !== 'completed';
        }).length,
      };

      setTaskStats(stats);

      // Load available drones
      const drones = await apiClient.getDrones();
      setAvailableDrones(drones);
    } catch (err) {
      setError('Ошибка загрузки данных: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const startTask = async (orderId: string) => {
    try {
      await apiClient.updateOrder(orderId, { status: 'in_progress' });
      await loadOperatorData();
    } catch (err) {
      alert('Ошибка запуска задачи: ' + (err as Error).message);
    }
  };

  const completeTask = async (orderId: string) => {
    try {
      await apiClient.updateOrder(orderId, { status: 'completed' });
      await loadOperatorData();
    } catch (err) {
      alert('Ошибка завершения задачи: ' + (err as Error).message);
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryIcon = (level: number) => {
    return <Battery className={`w-4 h-4 ${getBatteryColor(level)}`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
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
          onClick={loadOperatorData}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Панель оператора</h1>
          <p className="mt-1 text-gray-600">
            Управление задачами и мониторинг дронов
          </p>
        </div>
        <button
          onClick={loadOperatorData}
          className="px-3 py-2 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Назначенные задачи
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {taskStats.assigned}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Play className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    В работе
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {taskStats.inProgress}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Выполнено
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {taskStats.completed}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Просрочено
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {taskStats.overdue}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'tasks', label: 'Мои задачи', icon: Clock },
              { id: 'drones', label: 'Дроны', icon: Settings },
              { id: 'schedule', label: 'Расписание', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'tasks' | 'drones' | 'schedule')
                }
                className={`${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <OrderManagement userRole="operator" />
              </motion.div>
            )}

            {activeTab === 'drones' && (
              <motion.div
                key="drones"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Статус дронов
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {droneStatuses.map((drone) => (
                    <div
                      key={drone.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {drone.name}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getDroneStatusColor(drone.status)}`}
                        >
                          {drone.status === 'available'
                            ? 'Доступен'
                            : drone.status === 'in_use'
                              ? 'В работе'
                              : drone.status === 'maintenance'
                                ? 'Обслуживание'
                                : 'Не в сети'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Батарея:</span>
                          <div className="flex items-center gap-1">
                            {getBatteryIcon(drone.batteryLevel)}
                            <span
                              className={getBatteryColor(drone.batteryLevel)}
                            >
                              {drone.batteryLevel}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span>Местоположение:</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{drone.location}</span>
                          </div>
                        </div>

                        {drone.currentTask && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <div className="flex items-center gap-1">
                              <Truck className="w-3 h-3 text-blue-600" />
                              <span className="text-blue-800">
                                {drone.currentTask}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Расписание задач
                </h3>
                <div className="space-y-3">
                  {assignedOrders
                    .filter((order) => order.status !== 'completed')
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                    )
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                order.status === 'in_progress'
                                  ? 'bg-yellow-400'
                                  : order.status === 'planned'
                                    ? 'bg-blue-400'
                                    : 'bg-gray-400'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.type}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.description || 'Без описания'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Создан:{' '}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                          >
                            {formatOrderStatus(order.status)}
                          </span>
                          {order.status === 'planned' && (
                            <button
                              onClick={() => startTask(order.id)}
                              className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              Начать
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button
                              onClick={() => completeTask(order.id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Завершить
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                  {assignedOrders.filter(
                    (order) => order.status !== 'completed',
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Нет активных задач</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
