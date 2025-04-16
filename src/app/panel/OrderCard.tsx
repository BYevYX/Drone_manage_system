'use client';
import { useState } from 'react';

export const OrderCard = ({ order, isExpanded, onToggle }: any) => {
  return (
    <div
      className="bg-[#1A1A1A] p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-800 cursor-pointer transition-shadow"
      onClick={onToggle}
    >
      <div className="flex justify-between items-center">
        <div className="w-full">
          <div>
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">{order.title}</h2>
              <p className="text-lg font-bold">{order.price} ₽</p>
            </div>
          </div>

          <div className="flex justify-between w-full  pt-[2px]   ">
            <p className="text-gray-400 text-sm">Статус: {order.status}</p>
            <p className="text-gray-400 text-sm">{order.date}</p>
          </div>
        </div>
      </div>

      {/* Анимированное раскрытие блока */}
      <div
        style={{
          maxHeight: isExpanded ? '1000px' : '0', // maxHeight для плавного раскрытия
          opacity: isExpanded ? 1 : 0, // Применение прозрачности для плавного появления
        }}
        className={`overflow-hidden transition-all duration-500 ease-in-out`}
      >
        <div className="mt-4 border-t border-gray-700 pt-4 opacity-80">
          {/* Дополнительная информация о заказе */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300">Описание:</h3>
            <p className="text-gray-400 text-sm">
              {order.description || 'Нет описания'}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300">
              Контактная информация:
            </h3>
            <p className="text-gray-400 text-sm">
              {order.contact || 'Не указано'}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300">
              Срок выполнения:
            </h3>
            <p className="text-gray-400 text-sm">
              {order.deadline || 'Не указан'}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300">
              Дополнительные примечания:
            </h3>
            <p className="text-gray-400 text-sm">
              {order.notes || 'Нет примечаний'}
            </p>
          </div>

          <button
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/orders/${order.id}`;
            }}
          >
            Перейти к заказу
          </button>
        </div>
      </div>
    </div>
  );
};
