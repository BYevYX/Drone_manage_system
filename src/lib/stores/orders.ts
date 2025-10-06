import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ordersApi } from '@/src/lib/api/orders';
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderFilters,
  PaginationParams,
} from '@/src/types/api';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedOrders: string[];
  orderStats: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    totalRevenue: number;
    averageOrderValue: number;
  } | null;
}

interface OrdersActions {
  // Order CRUD operations
  createOrder: (request: CreateOrderRequest) => Promise<Order>;
  updateOrder: (orderId: string, request: UpdateOrderRequest) => Promise<Order>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrders: (
    filters?: OrderFilters,
    pagination?: PaginationParams,
  ) => Promise<void>;
  getOrderById: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;

  // Order management
  activateOrder: (orderId: string) => Promise<void>;
  deactivateOrder: (orderId: string) => Promise<void>;
  bulkUpdateOrders: (
    orderIds: string[],
    updateData: Partial<UpdateOrderRequest>,
  ) => Promise<void>;

  // Selection management
  selectOrder: (orderId: string) => void;
  deselectOrder: (orderId: string) => void;
  selectAllOrders: () => void;
  deselectAllOrders: () => void;
  toggleOrderSelection: (orderId: string) => void;

  // Statistics
  loadOrderStats: (filters?: OrderFilters) => Promise<void>;

  // Export/Import
  exportOrders: (
    filters?: OrderFilters,
    format?: 'csv' | 'excel',
  ) => Promise<void>;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: OrderFilters) => void;
  setPagination: (pagination: Partial<PaginationParams>) => void;
  clearError: () => void;
  clearCurrentOrder: () => void;
}

type OrdersStore = OrdersState & OrdersActions;

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      // State
      orders: [],
      currentOrder: null,
      isLoading: false,
      error: null,
      filters: {},
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      selectedOrders: [],
      orderStats: null,

      // Actions
      createOrder: async (request: CreateOrderRequest) => {
        set({ isLoading: true, error: null });
        try {
          const newOrder = await ordersApi.createOrder(request);

          set((state) => ({
            orders: [newOrder, ...state.orders],
            isLoading: false,
          }));

          toast.success('Заказ успешно создан');
          return newOrder;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при создании заказа';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateOrder: async (orderId: string, request: UpdateOrderRequest) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrder = await ordersApi.updateOrder(orderId, request);

          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? updatedOrder : order,
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? updatedOrder
                : state.currentOrder,
            isLoading: false,
          }));

          toast.success('Заказ успешно обновлен');
          return updatedOrder;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при обновлении заказа';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteOrder: async (orderId: string) => {
        set({ isLoading: true, error: null });
        try {
          await ordersApi.deleteOrder(orderId);

          set((state) => ({
            orders: state.orders.filter((order) => order.id !== orderId),
            currentOrder:
              state.currentOrder?.id === orderId ? null : state.currentOrder,
            selectedOrders: state.selectedOrders.filter((id) => id !== orderId),
            isLoading: false,
          }));

          toast.success('Заказ успешно удален');
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при удалении заказа';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getOrders: async (
        filters?: OrderFilters,
        pagination?: PaginationParams,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const currentPagination = get().pagination;
          const paginationParams = {
            page: pagination?.page || currentPagination.page,
            limit: pagination?.limit || currentPagination.limit,
            ...pagination,
          };

          const response = await ordersApi.getOrders(filters, paginationParams);

          set({
            orders: response.data,
            filters: filters || {},
            pagination: {
              page: response.page,
              limit: response.limit,
              total: response.total,
              totalPages: response.totalPages,
            },
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при загрузке заказов';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      getOrderById: async (orderId: string) => {
        set({ isLoading: true, error: null });
        try {
          const order = await ordersApi.getOrderById(orderId);
          set({
            currentOrder: order,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при загрузке заказа';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      refreshOrders: async () => {
        const { filters, pagination } = get();
        await get().getOrders(filters, pagination);
      },

      activateOrder: async (orderId: string) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrder = await ordersApi.activateOrder(orderId);

          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? updatedOrder : order,
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? updatedOrder
                : state.currentOrder,
            isLoading: false,
          }));

          toast.success('Заказ активирован');
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при активации заказа';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deactivateOrder: async (orderId: string) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrder = await ordersApi.deactivateOrder(orderId);

          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? updatedOrder : order,
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? updatedOrder
                : state.currentOrder,
            isLoading: false,
          }));

          toast.success('Заказ деактивирован');
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при деактивации заказа';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      bulkUpdateOrders: async (
        orderIds: string[],
        updateData: Partial<UpdateOrderRequest>,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrders = await ordersApi.bulkUpdateOrders(
            orderIds,
            updateData,
          );

          set((state) => ({
            orders: state.orders.map((order) => {
              const updatedOrder = updatedOrders.find(
                (updated) => updated.id === order.id,
              );
              return updatedOrder || order;
            }),
            isLoading: false,
          }));

          toast.success(`Обновлено заказов: ${updatedOrders.length}`);
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            'Ошибка при массовом обновлении заказов';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Selection management
      selectOrder: (orderId: string) => {
        set((state) => ({
          selectedOrders: [...new Set([...state.selectedOrders, orderId])],
        }));
      },

      deselectOrder: (orderId: string) => {
        set((state) => ({
          selectedOrders: state.selectedOrders.filter((id) => id !== orderId),
        }));
      },

      selectAllOrders: () => {
        set((state) => ({
          selectedOrders: state.orders.map((order) => order.id),
        }));
      },

      deselectAllOrders: () => {
        set({ selectedOrders: [] });
      },

      toggleOrderSelection: (orderId: string) => {
        set((state) => ({
          selectedOrders: state.selectedOrders.includes(orderId)
            ? state.selectedOrders.filter((id) => id !== orderId)
            : [...state.selectedOrders, orderId],
        }));
      },

      // Statistics
      loadOrderStats: async (filters?: OrderFilters) => {
        set({ isLoading: true, error: null });
        try {
          const stats = await ordersApi.getOrderStats(filters);
          set({
            orderStats: stats,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при загрузке статистики';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Export
      exportOrders: async (
        filters?: OrderFilters,
        format: 'csv' | 'excel' = 'csv',
      ) => {
        set({ isLoading: true, error: null });
        try {
          const blob = await ordersApi.exportOrders(filters, format);

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `orders_export.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          set({ isLoading: false });
          toast.success('Экспорт завершен');
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка при экспорте заказов';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Utility actions
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      setFilters: (filters: OrderFilters) => set({ filters }),
      setPagination: (pagination: Partial<PaginationParams>) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        }));
      },
      clearError: () => set({ error: null }),
      clearCurrentOrder: () => set({ currentOrder: null }),
    }),
    {
      name: 'orders-storage',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    },
  ),
);

export default useOrdersStore;
