'use client';

import { MessageSquare, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useGlobalContext } from '../../GlobalContext';
import { createReview, deleteReview, getReviews, updateReview } from '../api';
import type { Review } from '../types';
import { AddReviewModal } from './AddReviewModal';
import { EditReviewModal } from './EditReviewModal';
import { ReviewCard } from './ReviewCard';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { userRole, userInfo } = useGlobalContext();

  // Get current user ID from GlobalContext
  const currentUserId = userInfo.userId;

  const loadReviews = useCallback(async (page = 1, append = false) => {
    try {
      setLoading(true);
      const response = await getReviews({ page, limit: 10 });

      if (append) {
        setReviews((prev) => [...prev, ...response.reviews]);
      } else {
        setReviews(response.reviews);
      }

      setHasMore(response.reviews.length === 10);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить отзывы');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleAddReview = async (text: string) => {
    setIsSubmitting(true);
    try {
      const newReview = await createReview({ text });
      setReviews((prev) => [newReview, ...prev]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error creating review:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = async (reviewId: number, text: string) => {
    setIsSubmitting(true);
    try {
      const updatedReview = await updateReview(reviewId, { text });
      setReviews((prev) =>
        prev.map((review) =>
          review.reviewId === reviewId ? updatedReview : review,
        ),
      );
      setIsEditModalOpen(false);
      setEditingReview(null);
    } catch (err) {
      console.error('Error updating review:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      setReviews((prev) =>
        prev.filter((review) => review.reviewId !== reviewId),
      );
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Не удалось удалить отзыв');
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setIsEditModalOpen(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadReviews(nextPage, true);
    }
  };

  console.log(userRole);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl md:text-4xl font-nekstmedium text-gray-900">
              Отзывы клиентов
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Узнайте, что говорят о нас наши клиенты
          </p>

          {userRole !== 'GUEST' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Оставить отзыв
            </button>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
            <button
              onClick={() => loadReviews()}
              className="mt-2 mx-auto block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {loading && reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка отзывов...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Пока нет отзывов
            </h3>
            <p className="text-gray-600 mb-6">
              Станьте первым, кто поделится своим мнением о наших услугах
            </p>
            {userRole !== 'GUEST' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Оставить первый отзыв
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.reviewId}
                  review={review}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteReview}
                  currentUserId={currentUserId}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Загрузка...' : 'Показать еще'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AddReviewModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddReview}
        isLoading={isSubmitting}
      />

      <EditReviewModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleEditReview}
        review={editingReview}
        isLoading={isSubmitting}
      />
    </section>
  );
};
