import axios, { type AxiosError, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

import type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
} from '@/src/types/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://51.250.43.77:8080';

/**
 * Secure token storage utility
 * Uses cookies in production for security, localStorage for development
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return process.env.NODE_ENV === 'production'
      ? Cookies.get('accessToken') || null
      : localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return process.env.NODE_ENV === 'production'
      ? Cookies.get('refreshToken') || null
      : localStorage.getItem('refreshToken');
  },

  setTokens: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): void => {
    if (typeof window === 'undefined') return;

    const expiryDate = new Date(Date.now() + expiresIn * 1000);

    if (process.env.NODE_ENV === 'production') {
      Cookies.set('accessToken', accessToken, {
        expires: expiryDate,
        secure: true,
        sameSite: 'strict',
        httpOnly: false,
      });
      Cookies.set('refreshToken', refreshToken, {
        expires: 7, // 7 days
        secure: true,
        sameSite: 'strict',
        httpOnly: false,
      });
    } else {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;

    if (process.env.NODE_ENV === 'production') {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
};

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
            refreshToken,
          });

          const {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
          } = response.data;
          tokenStorage.setTokens(accessToken, newRefreshToken, expiresIn);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // Clear tokens and redirect to login
      tokenStorage.clearTokens();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')
      ) {
        window.location.href = '/login';
      }
    }

    const apiError: ApiError = {
      response: {
        data: error.response?.data as {
          message?: string;
          error?: string;
          errors?: Record<string, string[]>;
        },
        status: error.response?.status,
      },
      message: error.message,
    };

    return Promise.reject(apiError);
  },
);

/**
 * Generic API request wrapper with error handling
 */
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: unknown,
  config?: any,
): Promise<T> => {
  try {
    const response = await apiClient.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error(`API ${method} ${url} error:`, error);
    throw error;
  }
};

/**
 * Generic paginated request wrapper
 */
export const paginatedRequest = async <T>(
  url: string,
  params?: PaginationParams & Record<string, any>,
): Promise<PaginatedResponse<T>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  } catch (error) {
    console.error(`Paginated request ${url} error:`, error);
    throw error;
  }
};

/**
 * File upload wrapper
 */
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{ url: string; filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error(`File upload ${url} error:`, error);
    throw error;
  }
};

/**
 * Multiple file upload wrapper
 */
export const uploadFiles = async (
  url: string,
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<Array<{ url: string; filename: string }>> => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });

  try {
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Multiple file upload ${url} error:`, error);
    throw error;
  }
};

/**
 * Download file wrapper
 */
export const downloadFile = async (
  url: string,
  filename?: string,
): Promise<void> => {
  try {
    const response = await apiClient.get(url, {
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
  } catch (error) {
    console.error(`File download ${url} error:`, error);
    throw error;
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<{
  status: string;
  timestamp: string;
}> => {
  return apiRequest('GET', '/health');
};

export default apiClient;
