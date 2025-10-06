'use client';

import {
  Star,
  MessageSquare,
  ThumbsUp,
  Flag,
  Eye,
  EyeOff,
  Reply,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { reviewsApi } from '@/src/lib/api/reviews';
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewFilters,
} from '@/src/types/api';

interface ReviewManagementProps {
  orderId?: string;
  userId?: string;
  showActions?: boolean;
  compact?: boolean;
}

interface LocalReviewFilters extends ReviewFilters {
  search: string;
  sortBy: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

const ReviewManagement: React.FC<ReviewManagementProps> = ({
  orderId,
  userId,
  showActions = true,
  compact = false,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);

  const [filters, setFilters] = useState<LocalReviewFilters>({
    search: '',
    sortBy: 'newest',
    orderId,
    reviewerId: userId,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: compact ? 5 : 20,
    total: 0,
  });

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, [pagination.page, pagination.limit, orderId, userId]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [reviews, filters]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await reviewsApi.getReviews({
        orderId,
        reviewerId: userId,
        isPublic: true,
        status: ['ACTIVE'],
      });

      setReviews(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total || response.data.length,
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка загрузки отзывов');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.title.toLowerCase().includes(searchLower) ||
          review.comment.toLowerCase().includes(searchLower) ||
          review.reviewer.firstName.toLowerCase().includes(searchLower) ||
          review.reviewer.lastName.toLowerCase().includes(searchLower) ||
          review.reviewee.firstName.toLowerCase().includes(searchLower) ||
          review.reviewee.lastName.toLowerCase().includes(searchLower),
      );
    }

    // Rating filter
    if (filters.rating && filters.rating.length > 0) {
      filtered = filtered.filter((review) =>
        filters.rating!.includes(review.rating),
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((review) =>
        filters.status!.includes(review.status),
      );
    }

    // Verified filter
    if (filters.isVerified !== undefined) {
      filtered = filtered.filter(
        (review) => review.isVerified === filters.isVerified,
      );
    }

    // Date range filters
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (review) => new Date(review.createdAt) >= new Date(filters.dateFrom!),
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (review) => new Date(review.createdAt) <= new Date(filters.dateTo!),
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case 'oldest':
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case 'rating_high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
        break;
    }

    setFilteredReviews(filtered);
  };

  const handleCreateReview = () => {
    setSelectedReview(null);
    setShowCreateModal(true);
  };

  const handleReplyToReview = (review: Review) => {
    setSelectedReview(review);
    setShowReplyModal(true);
  };

  const handleToggleVisibility = async (review: Review) => {
    try {
      setIsLoading(true);
      await reviewsApi.updateReview(review.id, {
        isPublic: !review.isPublic,
      });
      await loadReviews();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Ошибка изменения видимости отзыва',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkHelpful = async (review: Review) => {
    try {
      await reviewsApi.markReviewHelpful(review.id);
      await loadReviews();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Ошибка отметки отзыва как полезного',
      );
    }
  };

  const handleReportReview = async (review: Review) => {
    if (!confirm('Вы уверены, что хотите пожаловаться на этот отзыв?')) {
      return;
    }

    try {
      await reviewsApi.reportReview(review.id);
      setError('Жалоба отправлена. Спасибо за обратную связь.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка отправки жалобы');
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderAspectRatings = (review: Review) => {
    if (!review.aspects || review.aspects.length === 0) return null;

    const aspectLabels = {
      QUALITY: 'Качество',
      TIMELINESS: 'Своевременность',
      COMMUNICATION: 'Коммуникация',
      PROFESSIONALISM: 'Профессионализм',
      VALUE: 'Соотношение цена/качество',
    };

    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {review.aspects.map((aspect, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-600">
              {aspectLabels[aspect.aspect] || aspect.aspect}:
            </span>
            {renderStars(aspect.rating, 'sm')}
          </div>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'HIDDEN':
        return <EyeOff className="h-4 w-4 text-gray-600" />;
      case 'REPORTED':
        return <Flag className="h-4 w-4 text-red-600" />;
      case 'DELETED':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAverageRating = () => {
    if (filteredReviews.length === 0) return 0;
    const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / filteredReviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Отзывы ({filteredReviews.length})
          </h3>
          {filteredReviews.length > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Number(getAverageRating()), 'sm')}
              <span className="text-sm text-gray-600">
                {getAverageRating()}
              </span>
            </div>
          )}
        </div>

        {/* Compact Reviews List */}
        <div className="space-y-3">
          {filteredReviews.slice(0, pagination.limit).map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {renderStars(review.rating, 'sm')}
                  <span className="text-sm font-medium text-gray-900">
                    {review.reviewer.firstName} {review.reviewer.lastName}
                  </span>
                  {review.isVerified && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {review.comment}
              </p>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Отзывов пока нет</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Отзывы и рейтинги
          </h2>
          <p className="text-gray-600 mt-1">
            Управляйте отзывами и рейтингами клиентов
          </p>
        </div>
        {showActions && (
          <button
            onClick={handleCreateReview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <MessageSquare className="h-4 w-4" />
            Написать отзыв
          </button>
        )}
      </div>

      {/* Statistics */}
      {filteredReviews.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {getAverageRating()}
              </div>
              {renderStars(Number(getAverageRating()), 'lg')}
              <p className="text-sm text-gray-600 mt-2">
                Средний рейтинг из {filteredReviews.length} отзывов
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="col-span-2">
              <h4 className="font-medium text-gray-900 mb-3">
                Распределение оценок
              </h4>
              {Object.entries(getRatingDistribution())
                .reverse()
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600 w-8">
                      {rating} ★
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${filteredReviews.length > 0 ? (count / filteredReviews.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск отзывов..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={filters.rating?.[0] || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                rating: e.target.value ? [Number(e.target.value)] : undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все оценки</option>
            <option value="5">5 звёзд</option>
            <option value="4">4 звезды</option>
            <option value="3">3 звезды</option>
            <option value="2">2 звезды</option>
            <option value="1">1 звезда</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({
                ...filters,
                sortBy: e.target.value as any,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="rating_high">Высокий рейтинг</option>
            <option value="rating_low">Низкий рейтинг</option>
            <option value="helpful">Самые полезные</option>
          </select>

          {/* Verified Filter */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.isVerified || false}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isVerified: e.target.checked || undefined,
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Только проверенные</span>
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Загрузка отзывов...</span>
        </div>
      )}

      {/* Reviews List */}
      {!isLoading && (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-lg p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {review.reviewer.firstName} {review.reviewer.lastName}
                      </span>
                      {review.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {getStatusIcon(review.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.helpfulVotes > 0 && (
                    <span className="text-sm text-gray-500">
                      {review.helpfulVotes} полезных
                    </span>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Aspect Ratings */}
              {renderAspectRatings(review)}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {review.images.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                  {review.images.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600">
                      +{review.images.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Review Response */}
              {review.response && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      Ответ от {review.response.responder.firstName}{' '}
                      {review.response.responder.lastName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.response.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.response.message}</p>
                </div>
              )}

              {/* Actions */}
              {showActions && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkHelpful(review)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Полезно
                    </button>
                    {!review.response && (
                      <button
                        onClick={() => handleReplyToReview(review)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                      >
                        <Reply className="h-4 w-4" />
                        Ответить
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleVisibility(review)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                    >
                      {review.isPublic ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {review.isPublic ? 'Скрыть' : 'Показать'}
                    </button>
                    <button
                      onClick={() => handleReportReview(review)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Flag className="h-4 w-4" />
                      Пожаловаться
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Отзывов не найдено
          </h3>
          <p className="text-gray-600 mb-4">
            {reviews.length === 0
              ? 'Отзывов пока нет. Будьте первым, кто оставит отзыв!'
              : 'Попробуйте изменить фильтры поиска.'}
          </p>
          {showActions && reviews.length === 0 && (
            <button
              onClick={handleCreateReview}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <MessageSquare className="h-4 w-4" />
              Написать отзыв
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading &&
        filteredReviews.length > 0 &&
        pagination.total > pagination.limit && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Показано {Math.min(filteredReviews.length, pagination.limit)} из{' '}
              {pagination.total} отзывов
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Назад
              </button>
              <span className="px-3 py-2 text-gray-600">
                Страница {pagination.page} из{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(
                      Math.ceil(pagination.total / pagination.limit),
                      prev.page + 1,
                    ),
                  }))
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.limit)
                }
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Далее
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default ReviewManagement;
