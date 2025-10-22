'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  ClipboardList,
  Clock,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
  type Order,
  type User as ApiUser,
  apiClient,
  formatOrderStatus,
  getStatusColor,
} from '../../../services/api';

interface OrderManagementProps {
  userRole: 'manager' | 'operator';
}

export default function OrderManagement({ userRole }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>(
    'all',
  );
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [query, setQuery] = useState('');

  // Modal states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isNewOrder, setIsNewOrder] = useState(false);

  // Assignment modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<
    'operator' | 'supplier' | null
  >(null);
  const [availableUsers, setAvailableUsers] = useState<ApiUser[]>([]);

  // Form state
  const [form, setForm] = useState<Partial<Order>>({});

  // Load initial data
  useEffect(() => {
    loadOrders();
    loadResources();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await apiClient.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError('Ошибка загрузки заказов: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const users = await apiClient.getUsers();
      setAvailableUsers(users);
    } catch (err) {
      console.error('Ошибка загрузки ресурсов:', err);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (filterType !== 'all' && order.type !== filterType) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !order.id.toLowerCase().includes(q) &&
        !order.description?.toLowerCase().includes(q) &&
        !order.type.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // Order actions
  const openNewOrder = () => {
    setIsNewOrder(true);
    setEditingOrder(null);
    setForm({
      status: 'new',
      type: '',
      description: '',
      customerId: '',
    });
    setDrawerOpen(true);
  };

  const openEditOrder = (order: Order) => {
    setIsNewOrder(false);
    setEditingOrder(order);
    setForm(order);
    setDrawerOpen(true);
  };

  const saveOrder = async () => {
    try {
      if (!form.type || !form.customerId) {
        alert('Заполните обязательные поля');
        return;
      }

      if (isNewOrder) {
        const newOrder = await apiClient.createOrder(form);
        setOrders((prev) => [newOrder, ...prev]);
      } else if (editingOrder) {
        const updatedOrder = await apiClient.updateOrder(editingOrder.id, form);
        setOrders((prev) =>
          prev.map((o) => (o.id === editingOrder.id ? updatedOrder : o)),
        );
      }

      setDrawerOpen(false);
      setEditingOrder(null);
      setIsNewOrder(false);
    } catch (err) {
      alert('Ошибка сохранения: ' + (err as Error).message);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
  ) => {
    try {
      const updatedOrder = await apiClient.updateOrder(orderId, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o)),
      );
    } catch (err) {
      alert('Ошибка обновления статуса: ' + (err as Error).message);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Удалить заказ?')) return;

    try {
      await apiClient.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      alert('Ошибка удаления: ' + (err as Error).message);
    }
  };

  const openAssignModal = (order: Order, target: 'operator' | 'supplier') => {
    setEditingOrder(order);
    setAssignTarget(target);
    setAssignModalOpen(true);
  };

  const assignUser = async (userId: string) => {
    if (!editingOrder || !assignTarget) return;

    try {
      const updateData =
        assignTarget === 'operator'
          ? { assignedOperatorId: userId }
          : { assignedSupplierId: userId };

      const updatedOrder = await apiClient.updateOrder(
        editingOrder.id,
        updateData,
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? updatedOrder : o)),
      );

      setAssignModalOpen(false);
      setAssignTarget(null);
      setEditingOrder(null);
    } catch (err) {
      alert('Ошибка назначения: ' + (err as Error).message);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4" />;
      case 'planned':
        return <Calendar className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'clarify':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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
          onClick={loadOrders}
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
          <h1 className="text-2xl font-bold">
            {userRole === 'manager' ? 'Управление заказами' : 'Мои задачи'}
          </h1>
          <div className="text-sm text-gray-500">
            {userRole === 'manager'
              ? 'Полный цикл управления заказами от создания до выполнения'
              : 'Назначенные вам задачи для выполнения'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 bg-white/90 px-3 py-2 rounded-lg border border-gray-100">
            Всего:{' '}
            <span className="font-semibold ml-2">{filteredOrders.length}</span>
          </div>
          <button
            onClick={loadOrders}
            className="px-3 py-2 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {userRole === 'manager' && (
            <button
              onClick={openNewOrder}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Новый заказ
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Статус</label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as 'all' | Order['status'])
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Все</option>
              <option value="new">Новые</option>
              <option value="in_progress">В обработке</option>
              <option value="planned">Запланированы</option>
              <option value="completed">Выполнены</option>
              <option value="clarify">Нужна доработка</option>
              <option value="rejected">Отклонены</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Тип</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Все</option>
              <option value="Опрыскивание">Опрыскивание</option>
              <option value="Внесение удобрений">Внесение удобрений</option>
              <option value="Картографирование">Картографирование</option>
              <option value="Мониторинг">Мониторинг</option>
            </select>
          </div>
          <div className="relative">
            <label className="block text-sm text-gray-700 mb-1">Поиск</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="ID, описание, тип..."
              />
            </div>
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterType('all');
                setQuery('');
              }}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID / Статус
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Тип / Описание
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Даты
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Назначения
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Стоимость
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(order.status)}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {order.type}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {order.description || 'Без описания'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>
                      Создан: {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      Обновлен: {new Date(order.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="text-xs text-gray-500">
                      Оператор:{' '}
                      <span className="font-medium">
                        {order.assignedOperatorId
                          ? availableUsers.find(
                              (u) => u.id === order.assignedOperatorId,
                            )?.name || 'Назначен'
                          : '—'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Поставщик:{' '}
                      <span className="font-medium">
                        {order.assignedSupplierId
                          ? availableUsers.find(
                              (u) => u.id === order.assignedSupplierId,
                            )?.name || 'Назначен'
                          : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>
                      План:{' '}
                      {order.estimatedCost ? `₽${order.estimatedCost}` : '—'}
                    </div>
                    <div>
                      Факт: {order.actualCost ? `₽${order.actualCost}` : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        title="Просмотр"
                        className="text-emerald-600 hover:text-emerald-800"
                        onClick={() => openEditOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {userRole === 'manager' && (
                        <>
                          <button
                            title="Утвердить"
                            className="text-green-600 hover:text-green-800"
                            onClick={() =>
                              updateOrderStatus(order.id, 'in_progress')
                            }
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            title="Назначить оператора"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => openAssignModal(order, 'operator')}
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            title="Назначить поставщика"
                            className="text-purple-600 hover:text-purple-800"
                            onClick={() => openAssignModal(order, 'supplier')}
                          >
                            <Package className="w-4 h-4" />
                          </button>
                          <button
                            title="Удалить"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => deleteOrder(order.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">Заказы не найдены</div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assignModalOpen && editingOrder && assignTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b">
                <div className="text-lg font-semibold">
                  Назначить{' '}
                  {assignTarget === 'operator' ? 'оператора' : 'поставщика'}
                </div>
                <div className="text-sm text-gray-500">
                  Заказ #{editingOrder.id.slice(-8)}
                </div>
              </div>
              <div className="p-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Выберите пользователя
                </label>
                <select
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  id="assign-select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Выберите...
                  </option>
                  {availableUsers
                    .filter((user) => user.role === assignTarget)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                </select>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    setAssignModalOpen(false);
                    setAssignTarget(null);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Отменить
                </button>
                <button
                  onClick={() => {
                    const select = document.getElementById(
                      'assign-select',
                    ) as HTMLSelectElement;
                    if (select.value) {
                      assignUser(select.value);
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Назначить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-full md:w-[800px] z-50 bg-white shadow-2xl overflow-auto"
          >
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-40">
              <div>
                <div className="text-sm text-gray-500">
                  {isNewOrder
                    ? 'Новый заказ'
                    : `Заказ #${editingOrder?.id.slice(-8)}`}
                </div>
                <div className="text-lg font-semibold">
                  {form.type || 'Без названия'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveOrder}
                  className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setEditingOrder(null);
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium mb-4">Основная информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Тип обработки *
                    </label>
                    <select
                      value={form.type || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, type: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Выберите тип</option>
                      <option value="Опрыскивание">Опрыскивание</option>
                      <option value="Внесение удобрений">
                        Внесение удобрений
                      </option>
                      <option value="Картографирование">
                        Картографирование
                      </option>
                      <option value="Мониторинг">Мониторинг</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Статус
                    </label>
                    <select
                      value={form.status || 'new'}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value as Order['status'],
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="new">Новый</option>
                      <option value="in_progress">В обработке</option>
                      <option value="planned">Запланирован</option>
                      <option value="completed">Выполнен</option>
                      <option value="clarify">Нужна доработка</option>
                      <option value="rejected">Отклонен</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      value={form.description || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={3}
                      placeholder="Подробное описание заказа..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Плановая стоимость
                    </label>
                    <input
                      type="number"
                      value={form.estimatedCost || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          estimatedCost: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Фактическая стоимость
                    </label>
                    <input
                      type="number"
                      value={form.actualCost || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          actualCost: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium mb-4">Заметки</h3>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={4}
                  placeholder="Дополнительные заметки и комментарии..."
                />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
