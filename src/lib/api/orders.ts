import { apiRequest, paginatedRequest } from './client';
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderFilters,
  PaginatedResponse,
  PaginationParams,
} from '@/src/types/api';

export const ordersApi = {
  /**
   * Get all orders with optional filtering and pagination
   */
  getOrders: async (
    filters?: OrderFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Order>> => {
    const params = { ...filters, ...pagination };
    return paginatedRequest<Order>('/api/orders', params);
  },

  /**
   * Get a specific order by ID
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    return apiRequest<Order>('GET', `/api/orders/${orderId}`);
  },

  /**
   * Create a new order
   */
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    return apiRequest<Order>('POST', '/api/orders', orderData);
  },

  /**
   * Update an existing order
   */
  updateOrder: async (
    orderId: string,
    orderData: UpdateOrderRequest,
  ): Promise<Order> => {
    return apiRequest<Order>('PUT', `/api/orders/${orderId}`, orderData);
  },

  /**
   * Delete an order
   */
  deleteOrder: async (orderId: string): Promise<void> => {
    return apiRequest<void>('DELETE', `/api/orders/${orderId}`);
  },

  /**
   * Activate an order
   */
  activateOrder: async (orderId: string): Promise<Order> => {
    return apiRequest<Order>('POST', `/api/orders/${orderId}/activate`);
  },

  /**
   * Deactivate an order
   */
  deactivateOrder: async (orderId: string): Promise<Order> => {
    return apiRequest<Order>('DELETE', `/api/orders/${orderId}/activate`);
  },

  /**
   * Get fields associated with an order
   */
  getOrderFields: async (orderId: string): Promise<any[]> => {
    return apiRequest<any[]>('GET', `/api/orders/${orderId}/fields`);
  },

  /**
   * Add a field to an order
   */
  addFieldToOrder: async (
    orderId: string,
    fieldId: string,
    fieldData: any,
  ): Promise<any> => {
    return apiRequest<any>(
      'POST',
      `/api/orders/${orderId}/fields/${fieldId}`,
      fieldData,
    );
  },

  /**
   * Remove a field from an order
   */
  removeFieldFromOrder: async (
    orderId: string,
    fieldId: string,
  ): Promise<void> => {
    return apiRequest<void>(
      'DELETE',
      `/api/orders/${orderId}/fields/${fieldId}`,
    );
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (
    filters?: OrderFilters,
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    totalRevenue: number;
    averageOrderValue: number;
  }> => {
    return apiRequest('GET', '/api/orders/stats', { params: filters });
  },

  /**
   * Export orders to CSV/Excel
   */
  exportOrders: async (
    filters?: OrderFilters,
    format: 'csv' | 'excel' = 'csv',
  ): Promise<Blob> => {
    const params = { ...filters, format };
    return apiRequest('GET', '/api/orders/export', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * Bulk update orders
   */
  bulkUpdateOrders: async (
    orderIds: string[],
    updateData: Partial<UpdateOrderRequest>,
  ): Promise<Order[]> => {
    return apiRequest<Order[]>('PUT', '/api/orders/bulk', {
      orderIds,
      updateData,
    });
  },

  /**
   * Get order history/timeline
   */
  getOrderHistory: async (orderId: string): Promise<any[]> => {
    return apiRequest<any[]>('GET', `/api/orders/${orderId}/history`);
  },
};

export default ordersApi;
