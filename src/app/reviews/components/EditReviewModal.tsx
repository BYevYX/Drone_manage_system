'use client';

import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import type { Review } from '../types';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewId: number, text: string) => Promise<void>;
  review: Review | null;
  isLoading?: boolean;
}

export const EditReviewModal: React.FC<EditReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  review,
  isLoading = false,
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (review) {
      setText(review.text);
    }
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!review) return;

    if (!text.trim()) {
      setError('Пожалуйста, введите текст отзыва');
      return;
    }

    if (text.trim().length < 10) {
      setError('Отзыв должен содержать минимум 10 символов');
      return;
    }

    if (text.trim().length > 1000) {
      setError('Отзыв не должен превышать 1000 символов');
      return;
    }

    try {
      await onSubmit(review.reviewId, text.trim());
      setError('');
      onClose();
    } catch {
      setError('Произошла ошибка при обновлении отзыва');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !review) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-nekstmedium text-gray-900">
            Редактировать отзыв
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="editReviewText"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ваш отзыв
            </label>
            <textarea
              id="editReviewText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={5}
              placeholder="Поделитесь своим мнением о наших услугах..."
              disabled={isLoading}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">Минимум 10 символов</span>
              <span className="text-xs text-gray-500">{text.length}/1000</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
