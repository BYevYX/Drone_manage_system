import { useEffect } from 'react';

import { useAuthStore } from '@/src/lib/stores/auth';
import {
  startTokenRefreshTimer,
  stopTokenRefreshTimer,
} from '@/src/lib/stores/auth';

export const useAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginById,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    clearError,
    setLoading,
    checkAuth,
  } = useAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Start token refresh timer when authenticated
  useEffect(() => {
    if (isAuthenticated && tokens) {
      startTokenRefreshTimer();
    } else {
      stopTokenRefreshTimer();
    }

    return () => {
      stopTokenRefreshTimer();
    };
  }, [isAuthenticated, tokens]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    loginById,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    clearError,
    setLoading,
    checkAuth,
  };
};

export default useAuth;
