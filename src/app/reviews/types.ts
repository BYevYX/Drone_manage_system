/**
 * Types and interfaces for reviews functionality
 */

export interface Review {
  reviewId: number;
  userId: number;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
}

export interface CreateReviewRequest {
  text: string;
}

export interface UpdateReviewRequest {
  text: string;
}

export interface ReviewsListParams {
  page?: number;
  limit?: number;
}
