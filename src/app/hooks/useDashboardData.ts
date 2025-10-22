'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  apiClient,
  type Order,
  type Drone,
  type Material,
  type Field,
  type User,
} from '../services/api';

interface DashboardStats {
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  processedArea: number;
  activeDrones: number;
  availableDrones: number;
  totalFields: number;
  totalMaterials: number;
  activeOperators: number;
  totalUsers: number;
}

interface UseDashboardDataOptions {
  userRole?: string;
  userId?: string;
  enabled?: boolean;
}

export function useDashboardData({
  userRole,
  userId,
  enabled = true,
}: UseDashboardDataOptions = {}) {
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    processedArea: 0,
    activeDrones: 0,
    availableDrones: 0,
    totalFields: 0,
    totalMaterials: 0,
    activeOperators: 0,
    totalUsers: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Load data based on user role
      let ordersPromise: Promise<Order[]>;
      let dronesPromise: Promise<Drone[]>;
      let materialsPromise: Promise<Material[]>;
      let fieldsPromise: Promise<Field[]>;
      let usersPromise: Promise<User[]>;

      // Orders - always load for all roles
      if (userRole === 'operator' && userId) {
        ordersPromise = apiClient.getOrders({ assignedOperatorId: userId });
      } else if (userRole === 'contractor' && userId) {
        ordersPromise = apiClient.getOrders({ customerId: userId });
      } else {
        ordersPromise = apiClient.getOrders();
      }

      // Drones - load for operators and managers
      if (userRole === 'operator' || userRole === 'manager') {
        dronesPromise = apiClient.getDrones();
      } else {
        dronesPromise = Promise.resolve([]);
      }

      // Materials - load for suppliers and managers
      if (userRole === 'material_supplier' || userRole === 'manager') {
        materialsPromise = apiClient.getMaterials();
      } else {
        materialsPromise = Promise.resolve([]);
      }

      // Fields - load for contractors and managers
      if (userRole === 'contractor' || userRole === 'manager') {
        fieldsPromise = apiClient.getFields();
      } else {
        fieldsPromise = Promise.resolve([]);
      }

      // Users - load for managers only
      if (userRole === 'manager') {
        usersPromise = apiClient.getUsers();
      } else {
        usersPromise = Promise.resolve([]);
      }

      const [ordersData, dronesData, materialsData, fieldsData, usersData] =
        await Promise.all([
          ordersPromise,
          dronesPromise,
          materialsPromise,
          fieldsPromise,
          usersPromise,
        ]);

      setOrders(ordersData);
      setDrones(dronesData);
      setMaterials(materialsData);
      setFields(fieldsData);
      setUsers(usersData);

      // Calculate statistics
      const newStats: DashboardStats = {
        activeOrders: ordersData.filter((o: Order) =>
          ['new', 'in_progress', 'planned'].includes(o.status),
        ).length,
        completedOrders: ordersData.filter(
          (o: Order) => o.status === 'completed',
        ).length,
        totalRevenue: ordersData
          .filter((o: Order) => o.status === 'completed')
          .reduce(
            (sum: number, o: Order) =>
              sum + (o.actualCost || o.estimatedCost || 0),
            0,
          ),
        processedArea: fieldsData.reduce(
          (sum: number, f: Field) => sum + f.area,
          0,
        ),
        activeDrones: dronesData.filter((d: Drone) => d.status === 'in_use')
          .length,
        availableDrones: dronesData.filter(
          (d: Drone) => d.status === 'available',
        ).length,
        totalFields: fieldsData.length,
        totalMaterials: materialsData.length,
        activeOperators: usersData.filter((u: User) => u.role === 'operator')
          .length,
        totalUsers: usersData.length,
      };

      setStats(newStats);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки данных: ' + (err as Error).message);
      setLoading(false);
    }
  }, [enabled, userRole, userId]);

  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    orders,
    drones,
    materials,
    fields,
    users,
    loading,
    error,
    lastUpdate,
    refreshData,
  };
}

// Hook for getting role-specific dashboard cards
export function useRoleDashboardCards(userRole: string, stats: DashboardStats) {
  return useCallback(() => {
    switch (userRole) {
      case 'contractor':
        return [
          {
            title: 'Активные заявки',
            value: stats.activeOrders,
            color: 'bg-blue-100',
            trend: 'up' as const,
          },
          {
            title: 'Обработано (га)',
            value: stats.processedArea,
            color: 'bg-green-100',
            trend: 'up' as const,
          },
          {
            title: 'Поля',
            value: stats.totalFields,
            color: 'bg-emerald-100',
            trend: 'stable' as const,
          },
          {
            title: 'Выполнено заказов',
            value: stats.completedOrders,
            color: 'bg-yellow-100',
            trend: 'up' as const,
          },
        ];

      case 'operator':
        return [
          {
            title: 'Активные задачи',
            value: stats.activeOrders,
            color: 'bg-yellow-100',
            trend: 'up' as const,
          },
          {
            title: 'Дроны в работе',
            value: stats.activeDrones,
            color: 'bg-purple-100',
            trend: 'stable' as const,
          },
          {
            title: 'Доступно дронов',
            value: stats.availableDrones,
            color: 'bg-blue-100',
            trend: 'down' as const,
          },
          {
            title: 'Обработано (га)',
            value: stats.processedArea,
            color: 'bg-cyan-100',
            trend: 'up' as const,
          },
        ];

      case 'manager':
        return [
          {
            title: 'Общая выручка',
            value: `₽${Math.round(stats.totalRevenue / 1000)}k`,
            color: 'bg-emerald-100',
            trend: 'up' as const,
          },
          {
            title: 'Активные заказы',
            value: stats.activeOrders,
            color: 'bg-pink-100',
            trend: 'up' as const,
          },
          {
            title: 'Выполнено заказов',
            value: stats.completedOrders,
            color: 'bg-blue-100',
            trend: 'stable' as const,
          },
          {
            title: 'Активные операторы',
            value: stats.activeOperators,
            color: 'bg-orange-100',
            trend: 'stable' as const,
          },
        ];

      case 'material_supplier':
      case 'drone_supplier':
        return [
          {
            title: 'Активные заказы',
            value: stats.activeOrders,
            color: 'bg-orange-100',
            trend: 'up' as const,
          },
          {
            title: 'Завершено поставок',
            value: stats.completedOrders,
            color: 'bg-cyan-100',
            trend: 'stable' as const,
          },
          {
            title: userRole === 'material_supplier' ? 'Материалы' : 'Дроны',
            value:
              userRole === 'material_supplier'
                ? stats.totalMaterials
                : stats.activeDrones + stats.availableDrones,
            color: 'bg-green-100',
            trend: 'down' as const,
          },
          {
            title: 'Выручка',
            value: `₽${Math.round(stats.totalRevenue / 1000)}k`,
            color: 'bg-purple-100',
            trend: 'up' as const,
          },
        ];

      default:
        return [
          {
            title: 'Заказы',
            value: stats.activeOrders,
            color: 'bg-gray-100',
            trend: 'stable' as const,
          },
          {
            title: 'Выполнено',
            value: stats.completedOrders,
            color: 'bg-gray-100',
            trend: 'stable' as const,
          },
        ];
    }
  }, [userRole, stats]);
}
