import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { authApi, tokenStorage } from '@/src/lib/api/auth';
import type {
  AuthStore,
  LoginCredentials,
  LoginByIdCredentials,
  RegisterCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthError,
  ApiError,
} from '@/src/types/auth';

const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { user, tokens } = response;

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(
            `Добро пожаловать, ${user.firstName} ${user.lastName}!`,
          );
        } catch (error: unknown) {
          const apiError = error as ApiError;
          const authError: AuthError = {
            message: apiError.response?.data?.message || 'Ошибка входа',
            code: apiError.response?.status?.toString(),
          };
          set({ error: authError, isLoading: false });
          toast.error(authError.message);
          throw error;
        }
      },

      loginById: async (credentials: LoginByIdCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginById(credentials);
          const { user, tokens } = response;

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(
            `Добро пожаловать, ${user.firstName} ${user.lastName}!`,
          );
        } catch (error: unknown) {
          const apiError = error as ApiError;
          const authError: AuthError = {
            message: apiError.response?.data?.message || 'Ошибка входа по ID',
            code: apiError.response?.status?.toString(),
          };
          set({ error: authError, isLoading: false });
          toast.error(authError.message);
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(credentials);
          const { user, tokens } = response;

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(
            `Регистрация успешна! Добро пожаловать, ${user.firstName} ${user.lastName}!`,
          );
        } catch (error: unknown) {
          const apiError = error as ApiError;
          const authError: AuthError = {
            message: apiError.response?.data?.message || 'Ошибка регистрации',
            code: apiError.response?.status?.toString(),
          };
          set({ error: authError, isLoading: false });
          toast.error(authError.message);
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state regardless of API call result
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: null,
          });

          toast.success('Вы успешно вышли из системы');
        }
      },

      forgotPassword: async (request: ForgotPasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.forgotPassword(request);
          set({ isLoading: false });
          toast.success('Ссылка для восстановления пароля отправлена на email');
        } catch (error: unknown) {
          const apiError = error as ApiError;
          const authError: AuthError = {
            message:
              apiError.response?.data?.message ||
              'Ошибка восстановления пароля',
            code: apiError.response?.status?.toString(),
          };
          set({ error: authError, isLoading: false });
          toast.error(authError.message);
          throw error;
        }
      },

      resetPassword: async (request: ResetPasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resetPassword(request);
          set({ isLoading: false });
          toast.success('Пароль успешно изменен');
        } catch (error: unknown) {
          const apiError = error as ApiError;
          const authError: AuthError = {
            message: apiError.response?.data?.message || 'Ошибка смены пароля',
            code: apiError.response?.status?.toString(),
          };
          set({ error: authError, isLoading: false });
          toast.error(authError.message);
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();
          const { user, tokens: newTokens } = response;

          set({
            user,
            tokens: newTokens,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          await get().logout();
        }
      },

      checkAuth: async () => {
        const accessToken = tokenStorage.getAccessToken();
        const refreshToken = tokenStorage.getRefreshToken();

        if (!accessToken || !refreshToken) {
          set({ isAuthenticated: false, user: null, tokens: null });
          return;
        }

        try {
          // Check if token is still valid
          const response = await authApi.verifyToken(accessToken);
          if (response.valid && response.user) {
            set({
              user: response.user,
              tokens: {
                accessToken,
                refreshToken,
                expiresIn: 0,
                tokenType: 'Bearer',
              },
              isAuthenticated: true,
            });
          } else {
            // Try to refresh token
            await get().refreshToken();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token is invalid, try to refresh
          await get().refreshToken();
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Auto-refresh token before expiry
let refreshTimer: NodeJS.Timeout | null = null;

/**
 * Starts automatic token refresh timer
 * Refreshes token 5 minutes before expiry
 */
export const startTokenRefreshTimer = () => {
  const { tokens, refreshToken } = useAuthStore.getState();
  if (!tokens?.accessToken || !tokens?.expiresIn) return;

  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // Calculate time until refresh (5 minutes before expiry)
  const expiryTime = tokens.expiresIn * 1000 - TOKEN_EXPIRY_BUFFER;
  const timeUntilRefresh = Math.max(0, expiryTime - Date.now());

  // Set new timer
  refreshTimer = setTimeout(async () => {
    try {
      await refreshToken();
      startTokenRefreshTimer(); // Restart timer after successful refresh
    } catch (error) {
      console.error('Auto token refresh failed:', error);
      // Timer will be cleared when logout is called
    }
  }, timeUntilRefresh);
};

/**
 * Stops the token refresh timer
 */
export const stopTokenRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};
