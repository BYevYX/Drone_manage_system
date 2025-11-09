'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, use } from 'react';

import { Drone } from '../types';
import Footer from '@/src/shared/ui/Footer';
import Header from '@/src/shared/ui/Header';

const API_BASE = 'https://droneagro.duckdns.org';

const DronePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const [drone, setDrone] = useState<Drone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrone();
  }, [resolvedParams.id]);

  const fetchDrone = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/v1/drones/${resolvedParams.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Дрон не найден');
        }
        if (res.status === 403) {
          throw new Error('Нет доступа к данным дрона');
        }
        const body = await res.text();
        throw new Error(`Ошибка ${res.status}: ${body}`);
      }
      const droneData: Drone = await res.json();
      setDrone(droneData);
    } catch (e: unknown) {
      console.error('fetchDrone error', e);
      setError(
        e instanceof Error ? e.message : 'Ошибка получения данных дрона',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg text-gray-600">
            Загрузка данных дрона...
          </span>
        </div>
      </div>
    );
  }

  if (error || !drone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-red-600 mb-4">
          {error || 'Дрон не найден'}
        </div>
        <Link
          href="/drones"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <ArrowLeft size={20} />
          Назад к списку дронов
        </Link>
      </div>
    );
  }

  // Функция для форматирования габаритов
  const formatDimensions = (width: number, height: number, length?: number) => {
    const w = width || width === 0 ? width : '—';
    const h = height || height === 0 ? height : '—';
    const l = length || length === 0 ? length : '—';
    return `${w} x ${h} x ${l}`;
  };

  const characteristics = [
    ['ID дрона', drone.droneId],
    ['Название', drone.droneName],
    ['Время полёта', `${drone.flightTime} мин`],
    ['Время зарядки', `${drone.batteryChargeTime} мин`],
    ['Вес дрона', `${drone.weight} кг`],
    ['Грузоподъёмность', `${drone.liftCapacity} кг`],
    ['Габариты (Ш x В x Д)', formatDimensions(drone.width, drone.height)],
    ['Максимальная скорость полёта', `${drone.maxFlightSpeed} м/с`],
    ['Рабочая скорость', `${drone.maxWorkingSpeed} м/с`],
    ['Максимальная скорость ветра', `${drone.maxWindSpeed} м/с`],
    ['Рабочая температура', `${drone.operatingTemperature}°C`],
    ['Максимальная высота полёта', `${drone.maxFlightHeight} м`],
    ['Скорость разворота на 180 градусов', `${drone.rotationSpeed} об/мин`],
  ];

  const sprayingCharacteristics = drone.spraying
    ? [
        ['Расход', `${drone.spraying.flowRate} л/мин`],
        ['Ёмкость', `${drone.spraying.capacity} кг`],
        ['Ширина распыления', `${drone.spraying.width} м`],
      ]
    : [['Статус', 'Система распыления не настроена']];

  const spreadingCharacteristics = drone.spreading
    ? [
        ['Расход', `${drone.spreading.flowRate} кг/мин`],
        ['Ёмкость', `${drone.spreading.capacity} кг`],
        ['Ширина разбрасывания', `${drone.spreading.width} м`],
      ]
    : [['Статус', 'Система разбрасывания не настроена']];

  return (
    <div className="min-h-[100vh] bg-[#f5f6f8]">
      <Header />
      <div className="w-full mx-auto px-[50px] py-10">
        {/* Header Section */}
        <div className="mb-8">
          <Link
            href="/drones"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition border"
          >
            <ArrowLeft size={20} />
            Назад к списку дронов
          </Link>
        </div>

        {/* Main Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <div className="flex items-start justify-between mb-6 gap-8">
            <div className="flex-1">
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                ID: {drone.droneId}
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {drone.droneName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-blue-700 font-medium">
                    Вес: {drone.weight} кг
                  </span>
                </div>
                <div className="bg-green-50 px-3 py-1 rounded-full">
                  <span className="text-green-700 font-medium">
                    Грузоподъёмность: {drone.liftCapacity} кг
                  </span>
                </div>
                <div className="bg-purple-50 px-3 py-1 rounded-full">
                  <span className="text-purple-700 font-medium">
                    Время полёта: {drone.flightTime} мин
                  </span>
                </div>
              </div>
            </div>
            {drone.imageKey && (
              <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-lg">
                <img
                  src={drone.imageKey}
                  alt={drone.droneName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-gray-400">
                        <div class="text-center">
                          <div class="text-2xl mb-2">📷</div>
                          <div class="text-sm">Изображение недоступно</div>
                        </div>
                      </div>
                    `;
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">
                {drone.maxFlightSpeed}
              </div>
              <div className="text-sm text-blue-600">Макс скорость (м/с)</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-700">
                {drone.spraying?.capacity ?? 'N/A'}
              </div>
              <div className="text-sm text-green-600">Ёмкость распыл. (кг)</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-700">
                {drone.spreading?.capacity ?? 'N/A'}
              </div>
              <div className="text-sm text-purple-600">
                Ёмкость разбрас. (кг)
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-orange-700">
                {drone.maxWindSpeed}
              </div>
              <div className="text-sm text-orange-600">Макс ветер (м/с)</div>
            </div>
          </div>
        </div>

        {/* Detailed Characteristics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* General Characteristics */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Основные характеристики
            </h2>
            <div className="space-y-3">
              {characteristics.map(([label, value], index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Spraying System */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Система распыления
            </h2>
            <div className="space-y-3">
              {sprayingCharacteristics.map(([label, value], index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-green-600 uppercase tracking-wide mb-1">
                ID системы
              </div>
              <div className="text-lg font-bold text-green-700">
                #{drone.spraying?.id}
              </div>
            </div>
          </div>

          {/* Spreading System */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Система разбрасывания
            </h2>
            <div className="space-y-3">
              {spreadingCharacteristics.map(([label, value], index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <div className="text-xs text-purple-600 uppercase tracking-wide mb-1">
                ID системы
              </div>
              <div className="text-lg font-bold text-purple-700">
                #{drone.spreading?.id}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">Описание</h2>
          <p className="text-gray-700 text-base leading-relaxed">
            Сельскохозяйственный агродрон {drone.droneName} — это современное
            мультироторное устройство, которое совмещает в себе высокие
            технологии и многофункциональность с простотой управления. Дрон
            оснащен системой распыления с ёмкостью{' '}
            {drone.spraying?.capacity ?? 'N/A'} кг и системой разбрасывания с
            ёмкостью {drone.spreading?.capacity ?? 'N/A'} кг.
            <br />
            <br />
            Максимальное время полёта составляет {drone.flightTime} минут, а
            время зарядки — {drone.batteryChargeTime} минут. Дрон способен
            работать при скорости ветра до {drone.maxWindSpeed} м/с и
            температуре до {drone.operatingTemperature}°C.
            <br />
            <br />
            Благодаря грузоподъёмности {drone.liftCapacity} кг и весу{' '}
            {drone.weight} кг, дрон обеспечивает оптимальное соотношение
            производительности и эффективности для сельскохозяйственных работ.
          </p>
        </div>

        {/* Additional Features */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Дополнительные функции и возможности
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Три основных режима работы: ручной режим, режим точек А-Б, автоматический режим.',
              'Интеллектуальное распыление с регулируемым расходом.',
              'Избегание препятствий в ходе обработки участков.',
              `Противостояние порывам ветра до ${drone.maxWindSpeed} м/с.`,
              'Запоминание точки прерывания.',
              'Хранение данных в облаке.',
              'Регулярные обновления ПО.',
              'Динамическая калибровка расходомера.',
              'Отображение данных о зарядке в режиме реального времени.',
              'Работа с GPS и RTK позиционированием.',
              'Отметка точек на карте с помощью дрона.',
              'Сохранение истории полётов.',
              'Командное управление заданиями.',
              `Работа на высоте до ${drone.maxFlightHeight} м.`,
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DronePage;
