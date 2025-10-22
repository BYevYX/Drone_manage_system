'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { type Order, apiClient } from '../services/api';

interface UseRealTimeOrdersOptions {
  userId?: string;
  userRole?: 'manager' | 'operator' | 'contractor' | 'supplier';
  pollInterval?: number;
  enabled?: boolean;
}

interface OrderUpdate {
  type: 'created' | 'updated' | 'deleted' | 'assigned';
  order: Order;
  timestamp: string;
  updatedBy?: string;
}

export function useRealTimeOrders({
  userId,
  userRole,
  pollInterval = 5000, // 5 seconds
  enabled = true,
}: UseRealTimeOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousOrdersRef = useRef<Order[]>([]);

  const loadOrders = useCallback(async () => {
    try {
      setError(null);

      let ordersData: Order[] = [];

      if (userRole === 'operator' && userId) {
        // Load orders assigned to this operator
        ordersData = await apiClient.getOrders({
          assignedOperatorId: userId,
        });
      } else if (userRole === 'contractor' && userId) {
        // Load orders for this contractor (customer)
        ordersData = await apiClient.getOrders({
          customerId: userId,
        });
      } else {
        // Load all orders for managers and suppliers
        ordersData = await apiClient.getOrders();
      }

      // Detect changes and create updates
      const previousOrders = previousOrdersRef.current;
      const newUpdates: OrderUpdate[] = [];

      if (previousOrders.length > 0) {
        // Check for new orders
        ordersData.forEach((order) => {
          const existingOrder = previousOrders.find((o) => o.id === order.id);

          if (!existingOrder) {
            newUpdates.push({
              type: 'created',
              order,
              timestamp: new Date().toISOString(),
            });
          } else if (order.updatedAt !== existingOrder.updatedAt) {
            // Order was updated
            let updateType: OrderUpdate['type'] = 'updated';

            // Check if it's an assignment
            if (
              order.assignedOperatorId !== existingOrder.assignedOperatorId ||
              order.assignedSupplierId !== existingOrder.assignedSupplierId
            ) {
              updateType = 'assigned';
            }

            newUpdates.push({
              type: updateType,
              order,
              timestamp: new Date().toISOString(),
            });
          }
        });

        // Check for deleted orders
        previousOrders.forEach((order) => {
          const stillExists = ordersData.find((o) => o.id === order.id);
          if (!stillExists) {
            newUpdates.push({
              type: 'deleted',
              order,
              timestamp: new Date().toISOString(),
            });
          }
        });
      }

      setOrders(ordersData);
      previousOrdersRef.current = ordersData;

      if (newUpdates.length > 0) {
        setUpdates((prev) => [...newUpdates, ...prev].slice(0, 50)); // Keep last 50 updates
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки заказов: ' + (err as Error).message);
      setLoading(false);
    }
  }, [userId, userRole]);

  const startPolling = useCallback(() => {
    if (!enabled) return;

    // Initial load
    loadOrders();

    // Set up polling
    intervalRef.current = setInterval(loadOrders, pollInterval);
  }, [enabled, loadOrders, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshOrders = useCallback(() => {
    setLoading(true);
    loadOrders();
  }, [loadOrders]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  const markUpdateAsRead = useCallback((timestamp: string) => {
    setUpdates((prev) =>
      prev.filter((update) => update.timestamp !== timestamp),
    );
  }, []);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    orders,
    loading,
    error,
    lastUpdate,
    updates,
    refreshOrders,
    clearUpdates,
    markUpdateAsRead,
    startPolling,
    stopPolling,
  };
}

// Hook for getting real-time updates for a specific order
export function useRealTimeOrder(orderId: string, enabled = true) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setError(null);
      const orderData = await apiClient.getOrder(orderId);
      setOrder(orderData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки заказа: ' + (err as Error).message);
      setLoading(false);
    }
  }, [orderId]);

  const refreshOrder = useCallback(() => {
    setLoading(true);
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!enabled || !orderId) return;

    // Initial load
    loadOrder();

    // Set up polling every 3 seconds for individual order
    intervalRef.current = setInterval(loadOrder, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, orderId, loadOrder]);

  return {
    order,
    loading,
    error,
    lastUpdate,
    refreshOrder,
  };
}

// Utility function to get update message
export function getUpdateMessage(update: OrderUpdate): string {
  const orderNumber = `#${update.order.id.slice(-8)}`;

  switch (update.type) {
    case 'created':
      return `Создан новый заказ ${orderNumber}`;
    case 'updated':
      return `Заказ ${orderNumber} обновлен`;
    case 'assigned':
      return `Заказ ${orderNumber} назначен исполнителю`;
    case 'deleted':
      return `Заказ ${orderNumber} удален`;
    default:
      return `Заказ ${orderNumber} изменен`;
  }
}

// Utility function to get update color
export function getUpdateColor(update: OrderUpdate): string {
  switch (update.type) {
    case 'created':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'updated':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'assigned':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'deleted':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
