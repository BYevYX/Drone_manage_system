/**
 * API сервисы для работы с бэкендом
 */

import { apiClient } from '@/src/shared/api/client';

// Типы данных
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export interface Drone {
  id: number;
  name: string;
  manufacturer: string;
  description: string;
  photo_url: string;
  specifications?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Request {
  id: number;
  userId: number;
  fieldId: number;
  type: string;
  status: 'new' | 'in_progress' | 'completed' | 'rejected';
  area: number;
  scheduledDate: string;
  completedDate?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  id: number;
  userId: number;
  name: string;
  crop: string;
  area: number;
  coordinates: [number, number][];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// API сервисы
export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/v1/auth/login', data),

  register: (data: RegisterRequest): Promise<User> =>
    apiClient.post('/v1/auth/register', data),

  logout: (): Promise<void> => apiClient.post('/v1/auth/logout'),

  refreshToken: (refreshToken: string): Promise<{ accessToken: string }> =>
    apiClient.post('/v1/auth/refresh', { refreshToken }),

  getProfile: (): Promise<User> => apiClient.get('/v1/auth/profile'),

  updateProfile: (data: Partial<User>): Promise<User> =>
    apiClient.put('/v1/auth/profile', data),
};

export const dronesApi = {
  getAll: (): Promise<Drone[]> => apiClient.get('/v1/drones'),

  getById: (id: number): Promise<Drone> => apiClient.get(`/v1/drones/${id}`),

  create: (
    data: Omit<Drone, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Drone> => apiClient.post('/v1/drones', data),

  update: (id: number, data: Partial<Drone>): Promise<Drone> =>
    apiClient.put(`/v1/drones/${id}`, data),

  delete: (id: number): Promise<void> => apiClient.delete(`/v1/drones/${id}`),
};

export const requestsApi = {
  getAll: (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<Request[]> => apiClient.get('/v1/requests', { params }),

  getById: (id: number): Promise<Request> =>
    apiClient.get(`/v1/requests/${id}`),

  create: (
    data: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Request> => apiClient.post('/v1/requests', data),

  update: (id: number, data: Partial<Request>): Promise<Request> =>
    apiClient.put(`/v1/requests/${id}`, data),

  delete: (id: number): Promise<void> => apiClient.delete(`/v1/requests/${id}`),

  updateStatus: (id: number, status: Request['status']): Promise<Request> =>
    apiClient.patch(`/v1/requests/${id}/status`, { status }),
};

export const fieldsApi = {
  getAll: (): Promise<Field[]> => apiClient.get('/v1/fields'),

  getById: (id: number): Promise<Field> => apiClient.get(`/v1/fields/${id}`),

  create: (
    data: Omit<Field, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Field> => apiClient.post('/v1/fields', data),

  update: (id: number, data: Partial<Field>): Promise<Field> =>
    apiClient.put(`/v1/fields/${id}`, data),

  delete: (id: number): Promise<void> => apiClient.delete(`/v1/fields/${id}`),
};

export const analyticsApi = {
  getDashboardStats: (role: string): Promise<Record<string, unknown>> =>
    apiClient.get(`/v1/analytics/dashboard/${role}`),

  getFieldsAnalytics: (): Promise<Record<string, unknown>> =>
    apiClient.get('/v1/analytics/fields'),

  getRequestsAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<Record<string, unknown>> =>
    apiClient.get('/v1/analytics/requests', { params }),

  getCropsDistribution: (): Promise<Array<{ name: string; value: number }>> =>
    apiClient.get('/v1/analytics/crops'),
};

export const uploadsApi = {
  uploadImage: (file: File): Promise<{ url: string }> =>
    apiClient.uploadFile('/v1/uploads/image', file),

  uploadDocument: (file: File): Promise<{ url: string }> =>
    apiClient.uploadFile('/v1/uploads/document', file),
};

// Утилитарные функции
export const setAuthToken = (token: string): void => {
  apiClient.setAuthToken(token);
};

export const removeAuthToken = (): void => {
  apiClient.removeAuthToken();
};

// Экспорт клиента для прямого использования
export { apiClient };
