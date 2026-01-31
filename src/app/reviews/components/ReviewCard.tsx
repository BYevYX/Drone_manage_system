'use client';

import { Edit, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useGlobalContext } from '../../GlobalContext';
import { apiClient } from '@/src/shared/api/client';
import type { Review } from '../types';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  currentUserId?: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const { userRole } = useGlobalContext();

  const [authorName, setAuthorName] = useState<string | null>(null);

  const canEdit =
    userRole !== 'GUEST' &&
    currentUserId !== undefined &&
    currentUserId === review.userId;
  const canDelete =
    userRole !== 'GUEST' &&
    currentUserId !== undefined &&
    currentUserId === review.userId;

  const handleEdit = () => {
    if (onEdit && canEdit) {
      onEdit(review);
    }
  };

  const handleDelete = () => {
    if (onDelete && canDelete) {
      onDelete(review.reviewId);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        if (review.userId === undefined || review.userId === null) return;
        const data: any = await apiClient.get(`/api/users/${review.userId}`);
        const fn = (data?.firstName ?? '').trim();
        const ln = (data?.lastName ?? '').trim();
        const full = `${fn} ${ln}`.trim();
        if (mounted) setAuthorName(full || `Пользователь #${review.userId}`);
      } catch (e) {
        if (mounted) setAuthorName(`Пользователь #${review.userId}`);
      }
    };
    fetchUser();
    return () => {
      mounted = false;
    };
  }, [review.userId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p
              className={`text-m font-nekstmedium ${
                currentUserId !== undefined && currentUserId === review.userId
                  ? 'text-green-600 font-medium'
                  : 'text-gray-500'
              }`}
            >
              {currentUserId !== undefined && currentUserId === review.userId
                ? 'Я'
                : (authorName ?? `Пользователь #${review.userId}`)}
            </p>
            {review.createdAt && (
              <p className="text-xs font-nekstregular text-gray-400">
                {new Date(review.createdAt).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
        </div>

        {(canEdit || canDelete) && (
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Редактировать отзыв"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Удалить отзыв"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-gray-700  leading-relaxed">{review.text}</div>

      {review.updatedAt && review.updatedAt !== review.createdAt && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {'Отредактировано: '}
            {new Date(review.updatedAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
      )}
    </div>
  );
};
