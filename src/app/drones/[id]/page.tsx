'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Zap, Edit3, MoreVertical } from 'lucide-react';

import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';
import { Drone } from '../types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'https://droneagro.duckdns.org';

const DronePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const [drone, setDrone] = useState<Drone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const fetchDrone = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/api/drones/${resolvedParams.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error('Дрон не найден');
        if (res.status === 403) throw new Error('Нет доступа к данным дрона');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white font-nekstregular">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-slate-500" size={24} />
          <span className="text-lg text-slate-600">Загрузка данных дрона…</span>
        </div>
      </div>
    );
  }

  if (error || !drone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6 font-nekstregular">
        <div className="text-xl text-red-600 mb-4">
          {error || 'Дрон не найден'}
        </div>
        <Link
          href="/drones"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg hover:shadow transition"
        >
          <ArrowLeft size={18} /> Назад к списку дронов
        </Link>
      </div>
    );
  }

  const formatDimensions = (
    width?: number | null,
    height?: number | null,
    length?: number | null,
  ) => {
    const w = width ?? '—';
    const h = height ?? '—';
    const l = length ?? '—';
    return `${w} × ${h} × ${l}`;
  };

  const characteristics = [
    ['ID', drone.droneId],
    ['Название', drone.droneName ?? '—'],
    ['Время полёта', drone.flightTime ? `${drone.flightTime} мин` : '—'],
    [
      'Время зарядки',
      drone.batteryChargeTime ? `${drone.batteryChargeTime} мин` : '—',
    ],
    ['Вес', drone.weight ? `${drone.weight} кг` : '—'],
    ['Грузоподъёмность', drone.liftCapacity ? `${drone.liftCapacity} кг` : '—'],
    [
      'Габариты (Ш×В×Д)',
      formatDimensions(drone.width, drone.height, drone.length ?? null),
    ],
    [
      'Макс скорость',
      drone.maxFlightSpeed ? `${drone.maxFlightSpeed} м/с` : '—',
    ],
    [
      'Рабочая скорость',
      drone.maxWorkingSpeed ? `${drone.maxWorkingSpeed} м/с` : '—',
    ],
    ['Макс ветер', drone.maxWindSpeed ? `${drone.maxWindSpeed} м/с` : '—'],
    [
      'Температура',
      drone.operatingTemperature ? `${drone.operatingTemperature}°C` : '—',
    ],
    ['Макс высота', drone.maxFlightHeight ? `${drone.maxFlightHeight} м` : '—'],
  ];

  const sprayingCharacteristics = drone.spraying
    ? [
        [
          'Расход',
          drone.spraying.flowRate ? `${drone.spraying.flowRate} л/мин` : '—',
        ],
        [
          'Ёмкость',
          drone.spraying.capacity ? `${drone.spraying.capacity} кг` : '—',
        ],
        ['Ширина', drone.spraying.width ? `${drone.spraying.width} м` : '—'],
      ]
    : [['Статус', 'Не настроено']];

  const spreadingCharacteristics = drone.spreading
    ? [
        [
          'Расход',
          drone.spreading.flowRate ? `${drone.spreading.flowRate} кг/мин` : '—',
        ],
        [
          'Ёмкость',
          drone.spreading.capacity ? `${drone.spreading.capacity} кг` : '—',
        ],
        ['Ширина', drone.spreading.width ? `${drone.spreading.width} м` : '—'],
      ]
    : [['Статус', 'Не настроено']];

  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-slate-50 to-emerald-20 text-slate-900 font-nekstregular">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/drones"
              className="inline-flex items-center gap-2 p-3 rounded-lg bg-white/30 backdrop-blur-sm border border-slate-200 hover:translate-x-0.5 transition"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">
                Дрон
              </div>
              <h1 className="text-3xl lg:text-4xl font-nekstmedium leading-tight mt-1">
                {drone.droneName}
              </h1>
              <div className="mt-1 text-sm text-slate-600">
                ID #{drone.droneId}
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100">
            {drone.imageKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={drone.imageKey}
                alt={drone.droneName ?? 'drone'}
                className="w-full h-[420px] object-cover"
              />
            ) : (
              <div className="w-full h-[420px] flex items-center justify-center text-slate-400">
                Изображение недоступно
              </div>
            )}

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Макс скорость"
                  value={
                    drone.maxFlightSpeed ? `${drone.maxFlightSpeed} м/с` : '—'
                  }
                />
                <StatCard
                  label="Макс ветер"
                  value={drone.maxWindSpeed ? `${drone.maxWindSpeed} м/с` : '—'}
                />
                <StatCard
                  label="Ёмкость распыл."
                  value={
                    drone.spraying?.capacity
                      ? `${drone.spraying.capacity} кг`
                      : '—'
                  }
                  accent
                />
                <StatCard
                  label="Ёмкость разбрас."
                  value={
                    drone.spreading?.capacity
                      ? `${drone.spreading.capacity} кг`
                      : '—'
                  }
                  accent
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-lg font-nekstmedium mb-2">Описание</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {drone.description ||
                    `Сельскохозяйственный дрон ${drone.droneName} — надёжное решение для обработки полей: эффективный, стабильный и простой в эксплуатации.`}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <h4 className="text-sm text-slate-500 mb-3">Характеристики</h4>
              <div className="space-y-3 text-sm">
                {characteristics.map(([label, value], idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-nekstmedium text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <h4 className="text-sm text-slate-500 mb-3">
                Система распыления
              </h4>
              <div className="space-y-2 text-sm">
                {sprayingCharacteristics.map(([label, value], idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-nekstmedium text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <h4 className="text-sm text-slate-500 mb-3">
                Система разбрасывания
              </h4>
              <div className="space-y-2 text-sm">
                {spreadingCharacteristics.map(([label, value], idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-nekstmedium text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <h4 className="text-lg font-nekstmedium mb-3">
              Дополнительные функции
            </h4>
            <ul className="list-inside list-disc text-sm text-slate-700 space-y-2">
              <li>Режимы: ручной, точки А‑Б, автоматический</li>
              <li>Интеллектуальное распыление с регулировкой расхода</li>
              <li>Избегание препятствий и хранение истории полётов</li>
              <li>Работа с GPS/RTK, облачные обновления и телеметрия</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <h4 className="text-lg font-nekstmedium mb-3">
              Технические заметки
            </h4>
            <p className="text-sm text-slate-700">
              Условия эксплуатации: проверьте ограничения по ветру и температуре
              перед выполнением обширных задач. Соблюдайте инструкции по
              безопасности и калибровке расходомеров.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DronePage;

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-xl border ${accent ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-100'} shadow-sm`}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-nekstmedium text-slate-800">{value}</div>
    </div>
  );
}
