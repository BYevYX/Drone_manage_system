/**
 * HTTP клиент для взаимодействия с API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://51.250.43.77:8080';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Интерцептор запросов
    this.client.interceptors.request.use(
      (config) => {
        // Добавляем токен авторизации
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Логирование запросов в development режиме
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Интерцептор ответов
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Логирование успешных ответов
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Обработка ошибки 401 (неавторизован)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              const newAccessToken = response.data.accessToken;
              
              localStorage.setItem('accessToken', newAccessToken);
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Если обновление токена не удалось, перенаправляем на логин
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Логирование ошибок
        console.error('❌ API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        });

        return Promise.reject(this.formatError(error));
      },
    );
  }

  private async refreshAccessToken(refreshToken: string): Promise<AxiosResponse> {
    return axios.post(`${this.baseURL}/v1/auth/refresh`, {
      refreshToken,
    });
  }

  private handleAuthError(): void {
    // Очищаем токены
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    
    // Перенаправляем на страницу входа
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private formatError(error: any): ApiError {
    return {
      message: error.response?.data?.message || error.message || 'Произошла ошибка',
      code: error.response?.data?.code,
      status: error.response?.status,
    };
  }

  // Методы HTTP запросов
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // Методы для работы с файлами
  async uploadFile<T = unknown>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<ApiResponse<T>>(url, formData, config);
    return response.data.data;
  }

  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Утилитарные методы
  setAuthToken(token: string): void {
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common.Authorization;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  // Метод для отмены запросов
  createCancelToken(): { token: any; cancel: (message?: string) => void } {
    const source = axios.CancelToken.source();
    return {
      token: source.token,
      cancel: source.cancel,
    };
  }
}

// Создаем единственный экземпляр клиента
export const apiClient = new ApiClient();

// Экспортируем типы для использования в других файлах
export type { AxiosRequestConfig, AxiosResponse };