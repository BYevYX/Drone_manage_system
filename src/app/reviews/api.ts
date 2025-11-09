/**
 * API service functions for reviews
 */

import type {
  Review,
  ReviewsResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewsListParams,
} from './types';
import { apiClient } from '../../shared/api/client';

/**
 * Get reviews with pagination
 */
export const getReviews = async (
  params: ReviewsListParams = {},
): Promise<ReviewsResponse> => {
  const { page = 1, limit = 10 } = params;
  return await apiClient.get<ReviewsResponse>(
    `/api/reviews?page=${page}&limit=${limit}`,
  );
};

/**
 * Get a specific review by ID
 */
export const getReview = async (reviewId: number): Promise<Review> => {
  return await apiClient.get<Review>(`/api/reviews/${reviewId}`);
};

/**
 * Create a new review
 */
export const createReview = async (
  data: CreateReviewRequest,
): Promise<Review> => {
  return await apiClient.post<Review>('/api/reviews', data);
};

/**
 * Update an existing review
 */
export const updateReview = async (
  reviewId: number,
  data: UpdateReviewRequest,
): Promise<Review> => {
  return await apiClient.put<Review>(`/api/reviews/${reviewId}`, data);
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  return await apiClient.delete<void>(`/api/reviews/${reviewId}`);
};
