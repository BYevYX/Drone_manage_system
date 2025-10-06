import { apiRequest, paginatedRequest, uploadFile } from './client';
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewFilters,
  PaginatedResponse,
  PaginationParams,
} from '@/src/types/api';

export const reviewsApi = {
  /**
   * Get all reviews with optional filtering and pagination
   */
  getReviews: async (
    filters?: ReviewFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Review>> => {
    const params = { ...filters, ...pagination };
    return paginatedRequest<Review>('/api/reviews', params);
  },

  /**
   * Get a specific review by ID
   */
  getReviewById: async (reviewId: string): Promise<Review> => {
    return apiRequest<Review>('GET', `/api/reviews/${reviewId}`);
  },

  /**
   * Create a new review
   */
  createReview: async (reviewData: CreateReviewRequest): Promise<Review> => {
    return apiRequest<Review>('POST', '/api/reviews', reviewData);
  },

  /**
   * Update an existing review
   */
  updateReview: async (
    reviewId: string,
    reviewData: UpdateReviewRequest,
  ): Promise<Review> => {
    return apiRequest<Review>('PUT', `/api/reviews/${reviewId}`, reviewData);
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    return apiRequest<void>('DELETE', `/api/reviews/${reviewId}`);
  },

  /**
   * Get reviews for a specific user (as reviewee)
   */
  getUserReviews: async (
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Review>> => {
    return paginatedRequest<Review>(`/api/reviews/user/${userId}`, pagination);
  },

  /**
   * Get reviews for a specific order
   */
  getOrderReviews: async (
    orderId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Review>> => {
    return paginatedRequest<Review>(
      `/api/reviews/order/${orderId}`,
      pagination,
    );
  },

  /**
   * Get review statistics for a user
   */
  getUserReviewStats: async (
    userId: string,
  ): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    aspectRatings: Record<string, number>;
    recentReviews: Review[];
    responseRate: number;
  }> => {
    return apiRequest('GET', `/api/reviews/user/${userId}/stats`);
  },

  /**
   * Get overall review statistics
   */
  getReviewStats: async (
    filters?: ReviewFilters,
  ): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    reviewsByMonth: Array<{
      month: string;
      count: number;
      averageRating: number;
    }>;
    topRatedUsers: Array<{
      userId: string;
      userName: string;
      averageRating: number;
      reviewCount: number;
    }>;
  }> => {
    return apiRequest('GET', '/api/reviews/stats', { params: filters });
  },

  /**
   * Mark review as helpful
   */
  markReviewHelpful: async (
    reviewId: string,
  ): Promise<{
    helpfulVotes: number;
    userVoted: boolean;
  }> => {
    return apiRequest('POST', `/api/reviews/${reviewId}/helpful`);
  },

  /**
   * Remove helpful vote from review
   */
  removeHelpfulVote: async (
    reviewId: string,
  ): Promise<{
    helpfulVotes: number;
    userVoted: boolean;
  }> => {
    return apiRequest('DELETE', `/api/reviews/${reviewId}/helpful`);
  },

  /**
   * Report a review
   */
  reportReview: async (
    reviewId: string,
    reason: string,
    description?: string,
  ): Promise<{
    reportId: string;
    status: string;
  }> => {
    return apiRequest('POST', `/api/reviews/${reviewId}/report`, {
      reason,
      description,
    });
  },

  /**
   * Respond to a review (for reviewees)
   */
  respondToReview: async (
    reviewId: string,
    message: string,
  ): Promise<{
    responseId: string;
    review: Review;
  }> => {
    return apiRequest('POST', `/api/reviews/${reviewId}/response`, { message });
  },

  /**
   * Update review response
   */
  updateReviewResponse: async (
    reviewId: string,
    responseId: string,
    message: string,
  ): Promise<{
    responseId: string;
    review: Review;
  }> => {
    return apiRequest(
      'PUT',
      `/api/reviews/${reviewId}/response/${responseId}`,
      {
        message,
      },
    );
  },

  /**
   * Delete review response
   */
  deleteReviewResponse: async (
    reviewId: string,
    responseId: string,
  ): Promise<void> => {
    return apiRequest<void>(
      'DELETE',
      `/api/reviews/${reviewId}/response/${responseId}`,
    );
  },

  /**
   * Upload review image
   */
  uploadReviewImage: async (
    reviewId: string,
    file: File,
  ): Promise<{ url: string; filename: string }> => {
    return uploadFile(`/api/reviews/${reviewId}/images`, file);
  },

  /**
   * Get trending reviews
   */
  getTrendingReviews: async (
    timeframe: 'day' | 'week' | 'month' = 'week',
    limit: number = 10,
  ): Promise<Review[]> => {
    return apiRequest<Review[]>('GET', '/api/reviews/trending', {
      params: { timeframe, limit },
    });
  },

  /**
   * Get review insights for business analytics
   */
  getReviewInsights: async (
    userId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    sentimentAnalysis: {
      positive: number;
      neutral: number;
      negative: number;
    };
    commonKeywords: Array<{
      word: string;
      frequency: number;
      sentiment: 'positive' | 'neutral' | 'negative';
    }>;
    improvementAreas: string[];
    strengths: string[];
    competitorComparison?: {
      averageRating: number;
      marketPosition: number;
      differentiators: string[];
    };
  }> => {
    return apiRequest('GET', '/api/reviews/insights', {
      params: { userId, startDate, endDate },
    });
  },

  /**
   * Export reviews data
   */
  exportReviews: async (
    filters?: ReviewFilters,
    format: 'csv' | 'excel' | 'pdf' = 'csv',
  ): Promise<Blob> => {
    const params = { ...filters, format };
    return apiRequest('GET', '/api/reviews/export', {
      params,
      responseType: 'blob',
    });
  },
};

export default reviewsApi;
