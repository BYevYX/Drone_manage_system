import axios, { type AxiosError, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

import type {
  LoginCredentials,
  LoginByIdCredentials,
  RegisterCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
  ApiResponse,
  ApiError,
} from '@/src/types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://51.250.43.77:8080';

/**
 * Secure token storage utility
 * Uses cookies in production for security, localStorage for development
 */
const tokenStorage = {
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
        httpOnly: false, // Needed for client-side access
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
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for better reliability
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
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

    // Handle authentication errors
    if (error.response?.status === 401) {
      tokenStorage.clearTokens();

      // Only redirect if not already on auth pages
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(apiError);
  },
);

export const authApi = {
  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/v1/auth/login', credentials);
      const authResponse: AuthResponse = response.data;

      // Store tokens securely
      if (authResponse.tokens) {
        tokenStorage.setTokens(
          authResponse.tokens.accessToken,
          authResponse.tokens.refreshToken,
          authResponse.tokens.expiresIn,
        );
      }

      return authResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Login with user ID
  loginById: async (
    credentials: LoginByIdCredentials,
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/v1/auth/login', {
        user_id: credentials.userId,
      });
      const authResponse: AuthResponse = response.data;

      // Store tokens securely
      if (authResponse.tokens) {
        tokenStorage.setTokens(
          authResponse.tokens.accessToken,
          authResponse.tokens.refreshToken,
          authResponse.tokens.expiresIn,
        );
      }

      return authResponse;
    } catch (error) {
      console.error('Login by ID error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/v1/auth/register', credentials);
      const authResponse: AuthResponse = response.data;

      // Store tokens securely
      if (authResponse.tokens) {
        tokenStorage.setTokens(
          authResponse.tokens.accessToken,
          authResponse.tokens.refreshToken,
          authResponse.tokens.expiresIn,
        );
      }

      return authResponse;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (
    request: ForgotPasswordRequest,
  ): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post(
        '/v1/auth/forgot-password',
        request,
      );
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (
    request: ResetPasswordRequest,
  ): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/v1/auth/reset-password', request);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/v1/auth/refresh', {
        refreshToken,
      });
      const authResponse: AuthResponse = response.data;

      // Update stored tokens
      if (authResponse.tokens) {
        tokenStorage.setTokens(
          authResponse.tokens.accessToken,
          authResponse.tokens.refreshToken,
          authResponse.tokens.expiresIn,
        );
      }

      return authResponse;
    } catch (error) {
      console.error('Token refresh error:', error);
      tokenStorage.clearTokens();
      throw error;
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/v1/auth/profile');
      return response.data.user || response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      tokenStorage.clearTokens();
    }
  },

  // Verify token
  verifyToken: async (
    token?: string,
  ): Promise<{ valid: boolean; user?: User }> => {
    try {
      const tokenToVerify = token || tokenStorage.getAccessToken();
      if (!tokenToVerify) {
        return { valid: false };
      }

      const response = await apiClient.get('/v1/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  },
};

// Export token storage for use in stores
export { tokenStorage };
export default authApi;
