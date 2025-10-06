import { apiRequest, paginatedRequest, uploadFile } from './client';
import type {
  User,
  UpdateUserRequest,
  EmailVerificationRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/src/types/api';

export const usersApi = {
  /**
   * Get all users with optional filtering and pagination
   */
  getUsers: async (
    filters?: {
      userRole?: string[];
      status?: string[];
      search?: string;
      isEmailVerified?: boolean;
      isPhoneVerified?: boolean;
    },
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<User>> => {
    const params = { ...filters, ...pagination };
    return paginatedRequest<User>('/v1/users', params);
  },

  /**
   * Get a specific user by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    return apiRequest<User>('GET', `/v1/users/${userId}`);
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email: string): Promise<User> => {
    return apiRequest<User>('GET', `/v1/users/email/${email}`);
  },

  /**
   * Get user by phone
   */
  getUserByPhone: async (phone: string): Promise<User> => {
    return apiRequest<User>('GET', `/v1/users/phone/${phone}`);
  },

  /**
   * Update user profile
   */
  updateUser: async (
    userId: string,
    userData: UpdateUserRequest,
  ): Promise<User> => {
    return apiRequest<User>('PUT', `/v1/users/${userId}`, userData);
  },

  /**
   * Delete a user
   */
  deleteUser: async (userId: string): Promise<void> => {
    return apiRequest<void>('DELETE', `/v1/users/${userId}`);
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('GET', '/v1/users/me');
  },

  /**
   * Update current user profile
   */
  updateCurrentUser: async (userData: UpdateUserRequest): Promise<User> => {
    return apiRequest<User>('PUT', '/v1/users/me', userData);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (
    file: File,
  ): Promise<{ url: string; filename: string }> => {
    return uploadFile('/v1/users/me/avatar', file);
  },

  /**
   * Remove user avatar
   */
  removeAvatar: async (): Promise<void> => {
    return apiRequest<void>('DELETE', '/v1/users/me/avatar');
  },

  /**
   * Send email verification
   */
  sendEmailVerification: async (
    email?: string,
  ): Promise<{ message: string; verificationSent: boolean }> => {
    return apiRequest('POST', '/v1/email-verification', { email });
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (
    token: string,
  ): Promise<{ verified: boolean; user: User }> => {
    return apiRequest('POST', '/v1/email-verification/verify', { token });
  },

  /**
   * Send phone verification
   */
  sendPhoneVerification: async (
    phone?: string,
  ): Promise<{ message: string; verificationSent: boolean }> => {
    return apiRequest('POST', '/v1/phone-verification', { phone });
  },

  /**
   * Verify phone with code
   */
  verifyPhone: async (
    phone: string,
    code: string,
  ): Promise<{ verified: boolean; user: User }> => {
    return apiRequest('POST', '/v1/phone-verification/verify', { phone, code });
  },

  /**
   * Get user statistics
   */
  getUserStats: async (
    userId?: string,
  ): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    averageRating: number;
    totalReviews: number;
    joinDate: string;
    lastActivity: string;
    achievements: Array<{
      id: string;
      name: string;
      description: string;
      earnedAt: string;
      icon: string;
    }>;
  }> => {
    const endpoint = userId
      ? `/v1/users/${userId}/stats`
      : '/v1/users/me/stats';
    return apiRequest('GET', endpoint);
  },

  /**
   * Get user activity log
   */
  getUserActivity: async (
    userId?: string,
    pagination?: PaginationParams,
  ): Promise<
    PaginatedResponse<{
      id: string;
      action: string;
      description: string;
      timestamp: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: Record<string, any>;
    }>
  > => {
    const endpoint = userId
      ? `/v1/users/${userId}/activity`
      : '/v1/users/me/activity';
    return paginatedRequest(endpoint, pagination);
  },

  /**
   * Get user preferences
   */
  getUserPreferences: async (
    userId?: string,
  ): Promise<{
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      orderUpdates: boolean;
      promotions: boolean;
      newsletter: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'contacts';
      showEmail: boolean;
      showPhone: boolean;
      allowReviews: boolean;
    };
    language: string;
    timezone: string;
    currency: string;
    theme: 'light' | 'dark' | 'auto';
  }> => {
    const endpoint = userId
      ? `/v1/users/${userId}/preferences`
      : '/v1/users/me/preferences';
    return apiRequest('GET', endpoint);
  },

  /**
   * Update user preferences
   */
  updateUserPreferences: async (
    preferences: Partial<{
      notifications: Partial<{
        email: boolean;
        sms: boolean;
        push: boolean;
        orderUpdates: boolean;
        promotions: boolean;
        newsletter: boolean;
      }>;
      privacy: Partial<{
        profileVisibility: 'public' | 'private' | 'contacts';
        showEmail: boolean;
        showPhone: boolean;
        allowReviews: boolean;
      }>;
      language: string;
      timezone: string;
      currency: string;
      theme: 'light' | 'dark' | 'auto';
    }>,
    userId?: string,
  ): Promise<void> => {
    const endpoint = userId
      ? `/v1/users/${userId}/preferences`
      : '/v1/users/me/preferences';
    return apiRequest<void>('PUT', endpoint, preferences);
  },

  /**
   * Get user notifications
   */
  getUserNotifications: async (
    pagination?: PaginationParams,
    filters?: { isRead?: boolean; type?: string[] },
  ): Promise<
    PaginatedResponse<{
      id: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, any>;
      isRead: boolean;
      createdAt: string;
      expiresAt?: string;
    }>
  > => {
    const params = { ...pagination, ...filters };
    return paginatedRequest('/v1/users/me/notifications', params);
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId: string): Promise<void> => {
    return apiRequest<void>(
      'PUT',
      `/v1/users/me/notifications/${notificationId}/read`,
    );
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (): Promise<void> => {
    return apiRequest<void>('PUT', '/v1/users/me/notifications/read-all');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    return apiRequest<void>(
      'DELETE',
      `/v1/users/me/notifications/${notificationId}`,
    );
  },

  /**
   * Get user contacts/connections
   */
  getUserContacts: async (
    userId?: string,
    pagination?: PaginationParams,
  ): Promise<
    PaginatedResponse<{
      user: User;
      connectionType: 'client' | 'contractor' | 'operator';
      connectedAt: string;
      totalOrders: number;
      lastOrderAt?: string;
    }>
  > => {
    const endpoint = userId
      ? `/v1/users/${userId}/contacts`
      : '/v1/users/me/contacts';
    return paginatedRequest(endpoint, pagination);
  },

  /**
   * Add user to contacts
   */
  addContact: async (userId: string): Promise<void> => {
    return apiRequest<void>('POST', `/v1/users/me/contacts/${userId}`);
  },

  /**
   * Remove user from contacts
   */
  removeContact: async (userId: string): Promise<void> => {
    return apiRequest<void>('DELETE', `/v1/users/me/contacts/${userId}`);
  },

  /**
   * Search users
   */
  searchUsers: async (
    query: string,
    filters?: {
      userRole?: string[];
      location?: string;
      radius?: number;
      minRating?: number;
    },
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<User>> => {
    const params = { query, ...filters, ...pagination };
    return paginatedRequest<User>('/v1/users/search', params);
  },

  /**
   * Get user verification status
   */
  getVerificationStatus: async (
    userId?: string,
  ): Promise<{
    email: { verified: boolean; verifiedAt?: string };
    phone: { verified: boolean; verifiedAt?: string };
    identity: { verified: boolean; verifiedAt?: string; documents?: string[] };
    business: { verified: boolean; verifiedAt?: string; documents?: string[] };
    overall: { verified: boolean; completionPercentage: number };
  }> => {
    const endpoint = userId
      ? `/v1/users/${userId}/verification`
      : '/v1/verification';
    return apiRequest('GET', endpoint);
  },

  /**
   * Export user data (GDPR compliance)
   */
  exportUserData: async (format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    return apiRequest('GET', '/v1/users/me/export', {
      params: { format },
      responseType: 'blob',
    });
  },

  /**
   * Request account deletion (GDPR compliance)
   */
  requestAccountDeletion: async (
    reason?: string,
  ): Promise<{
    deletionRequestId: string;
    scheduledDeletionDate: string;
    cancellationDeadline: string;
  }> => {
    return apiRequest('POST', '/v1/users/me/delete-request', { reason });
  },

  /**
   * Cancel account deletion request
   */
  cancelAccountDeletion: async (deletionRequestId: string): Promise<void> => {
    return apiRequest<void>(
      'DELETE',
      `/v1/users/me/delete-request/${deletionRequestId}`,
    );
  },
};

export default usersApi;
