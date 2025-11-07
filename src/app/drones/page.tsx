'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  Trash2,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Drone, DroneListResponse, CreateDroneRequest } from './types';
import Footer from '@/src/shared/ui/Footer';
import Header from '@/src/shared/ui/Header';

const API_BASE = 'https://droneagro.duckdns.org';

/**
 * DronesPage — только дроны
 * - GET /v1/drones?page=&limit=
 * - POST /v1/drones
 * - DELETE /v1/drones/{droneId}
 * - Authorization: Bearer <accessToken> (localStorage['accessToken'])
 * - role from localStorage['userRole'] -> show add/delete only for DRONE_SUPPLIER
 */

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // read role once on mount
    try {
      if (typeof window !== 'undefined') {
        setUserRole(localStorage.getItem('userRole'));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchList(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const isSupplier =
    userRole === 'DRONE_SUPPLIER' || userRole === 'droneSupplier';

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4200);
  };

  async function fetchList(p = 1, lim = 12) {
    setIsLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const qs = new URLSearchParams({ page: String(p), limit: String(lim) });
      const res = await fetch(`${API_BASE}/v1/drones?${qs.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        if (res.status === 403)
          throw new Error(
            '403 Forbidden — проверьте токен (localStorage.accessToken)',
          );
        if (res.status === 404)
          throw new Error('404 Not Found — проверьте URL /v1/drones');
        const body = await res.text();
        throw new Error(`Ошибка ${res.status}: ${body}`);
      }
      const json: DroneListResponse = await res.json();
      setDrones(Array.isArray(json.drones) ? json.drones : []);
    } catch (e: unknown) {
      console.error('fetchList error', e);
      setError(e instanceof Error ? e.message : 'Ошибка получения дронов');
    } finally {
      setIsLoading(false);
    }
  }

  async function createDrone(payload: CreateDroneRequest) {
    setSending(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/v1/drones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403)
          throw new Error('403 Forbidden — токен недействителен или нет прав.');
        if (res.status === 404)
          throw new Error('404 Not Found — проверьте путь POST /v1/drones');
        throw new Error(body?.message || `Ошибка сервера: ${res.status}`);
      }
      const created = await res.json();
      showNotice('ok', 'Дрон создан успешно');
      if (created && typeof created.droneId !== 'undefined')
        setDrones((s) => [created, ...s]);
      else await fetchList(page, limit);
    } catch (e: unknown) {
      console.error('create error', e);
      showNotice(
        'err',
        e instanceof Error ? e.message : 'Ошибка создания дрона',
      );
    } finally {
      setSending(false);
      setAddOpen(false);
    }
  }

  async function updateDrone(droneId: number, payload: CreateDroneRequest) {
    setSending(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/v1/drones/${droneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403)
          throw new Error('403 Forbidden — токен недействителен или нет прав.');
        if (res.status === 404)
          throw new Error('404 Not Found — дрон не найден');
        throw new Error(body?.message || `Ошибка сервера: ${res.status}`);
      }
      const updated = await res.json();
      showNotice('ok', 'Дрон обновлён успешно');
      // Update the drone in the list
      setDrones((prev) =>
        prev.map((d) => (d.droneId === droneId ? updated : d)),
      );
    } catch (e: unknown) {
      console.error('update error', e);
      showNotice(
        'err',
        e instanceof Error ? e.message : 'Ошибка обновления дрона',
      );
    } finally {
      setSending(false);
      setEditOpen(false);
      setEditingDrone(null);
    }
  }

  async function deleteDrone(droneId: number) {
    if (!confirm(`Удалить дрон #${droneId}? Это действие необратимо.`)) return;
    setDeletingId(droneId);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/v1/drones/${droneId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403)
          throw new Error('403 Forbidden — токен недействителен или нет прав.');
        if (res.status === 404)
          throw new Error('404 Not Found — дрон не найден');
        throw new Error(body?.message || `Ошибка удаления: ${res.status}`);
      }
      setDrones((prev) => prev.filter((d) => d.droneId !== droneId));
      showNotice('ok', `Дрон #${droneId} удалён`);
    } catch (e: unknown) {
      console.error('delete error', e);
      showNotice('err', e instanceof Error ? e.message : 'Ошибка удаления');
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = drones.filter((d) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      String(d.droneId).includes(q) ||
      (d.droneName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f7f9fc] to-[#f4f9f7]">
      <Header />
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-nekstmedium text-gray-900">
              Парк дронов
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по имени или ID..."
                className="pl-4 pr-10 py-2 w-64 rounded-full border border-gray-200 bg-white shadow-sm
               focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
               outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
               group-hover:text-gray-600 transition-colors"
              >
                <Search size={18} />
              </div>
            </div>

            <button
              onClick={() => fetchList(page, limit)}
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm 
             hover:bg-gray-50 hover:shadow-md transition-all text-gray-600 font-medium"
              title="Обновить список"
            >
              <RefreshCw
                size={18}
                className="text-gray-500 group-hover:text-gray-700 transition-transform group-hover:rotate-180 duration-300"
              />
              <span className="text-sm">Обновить</span>
            </button>

            {isSupplier && (
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
               bg-green-600
               text-white font-medium shadow-md hover:shadow-lg
               hover:scale-[1.04] active:scale-[0.98]
               transition-all duration-200 ease-out
               focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <Plus size={18} className="text-white drop-shadow-sm" />
                <span className="text-sm tracking-wide">Добавить дрон</span>
              </button>
            )}
          </div>
        </div>

        {notice && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${notice.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
          >
            {notice.text}
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl bg-white/60 border p-6 h-48"
                  />
                ))
              : filtered.map((d) => {
                  const id = d.droneId;
                  return (
                    <Link href={`/drones/${id}`} key={id}>
                      <motion.article
                        className="rounded-2xl bg-white border border-indigo-50 shadow-[0_6px_28px_rgba(40,60,100,0.06)] p-6 flex flex-col justify-between cursor-pointer"
                        whileHover={{
                          scale: 1.02,
                          rotateY: 2,
                          rotateX: 1,
                          boxShadow: "0 20px 60px rgba(40,60,100,0.15)",
                          borderColor: "rgba(99, 102, 241, 0.2)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          duration: 0.3
                        }}
                        style={{
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-400">
                                ID #{id}
                              </div>
                              <h3 className="text-lg font-nekstmedium text-gray-900 mt-1">
                                {d.droneName}
                              </h3>
                              <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                                Вес: {d.weight}кг {' | '} Грузоподъёмность:{' '}
                                {d.liftCapacity}кг
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
                            <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
                              <div className="text-[11px] text-gray-500">
                                Время полёта
                              </div>
                              <div className="font-semibold text-gray-800 mt-1">
                                {d.flightTime ?? '—'} мин
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                              <div className="text-[11px] text-gray-500">
                                Время зарядки
                              </div>
                              <div className="font-semibold text-gray-800 mt-1">
                                {d.batteryChargeTime ?? '—'} ч
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                              <div className="text-[11px] text-gray-500">
                                Ширина распыл.
                              </div>
                              <div className="font-semibold text-gray-800 mt-1">
                                {d.spraying?.width ?? '—'} м
                              </div>
                            </div>
                            <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
                              <div className="text-[11px] text-gray-500">
                                Макс ветер
                              </div>
                              <div className="font-semibold text-gray-800 mt-1">
                                {d.maxWindSpeed ?? '—'} м/с
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                              <div className="text-[11px] text-gray-500">
                                Макс скорость
                              </div>
                              <div className="font-semibold text-gray-800 mt-1">
                                {d.maxFlightSpeed ?? '—'} м/с
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                              <div className="text-[11px] text-gray-500">
                                Рабочая скорость
                              </div>
                              <div className="font-semibold text-gray-800 mt-1">
                                {d.maxWorkingSpeed ?? '—'} м/с
                              </div>
                            </div>

                            <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                              <div className="text-[11px] text-gray-500">
                                Ёмкость распыл.
                              </div>
                              <div className="font-semibold text-gray-800 mt-1">
                                {d.spraying?.capacity ?? '—'} л
                              </div>
                            </div>
                            <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                              <div className="text-[11px] text-gray-500">
                                Ёмкость разбрас.
                              </div>
                              <div className="font-semibold text-gray-800 mt-1">
                                {d.spreading?.capacity ?? '—'} л
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-3">
                          {isSupplier ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingDrone(d);
                                  setEditOpen(true);
                                }}
                                className="px-3 py-1 rounded-full bg-white border text-blue-600 hover:bg-blue-50 inline-flex items-center gap-2"
                              >
                                <Edit size={14} /> Редактировать
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteDrone(id);
                                }}
                                disabled={deletingId === id}
                                className="px-3 py-1 rounded-full bg-white border text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                              >
                                <Trash2 size={14} />{' '}
                                {deletingId === id ? 'Удаление...' : 'Удалить'}
                              </button>
                            </>
                          ) : (
                            <div className="text-xs text-gray-400 italic">
                              Доступно только для просмотра
                            </div>
                          )}
                        </div>
                      </motion.article>
                    </Link>
                  );
                })}
          </div>

          {/* pagination */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Показано <span className="font-medium">{filtered.length}</span> /{' '}
              <span className="font-medium">{drones.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="px-3 text-sm">Стр. {page}</div>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {addOpen && isSupplier && (
          <AddDroneModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onSubmit={createDrone}
            sending={sending}
          />
        )}
        {editOpen && isSupplier && editingDrone && (
          <EditDroneModal
            open={editOpen}
            drone={editingDrone}
            onClose={() => {
              setEditOpen(false);
              setEditingDrone(null);
            }}
            onSubmit={(payload) => updateDrone(editingDrone.droneId, payload)}
            sending={sending}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

/* -------------------- AddDroneModal -------------------- */
interface AddDroneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDroneRequest) => void;
  sending: boolean;
}

function AddDroneModal({
  open,
  onClose,
  onSubmit,
  sending,
}: AddDroneModalProps) {
  const [droneName, setDroneName] = useState('');
  const [batteryChargeTime, setBatteryChargeTime] = useState<number | ''>('');
  const [flightTime, setFlightTime] = useState<number | ''>('');
  const [maxWindSpeed, setMaxWindSpeed] = useState<number | ''>('');
  const [maxFlightSpeed, setMaxFlightSpeed] = useState<number | ''>('');
  const [maxWorkingSpeed, setMaxWorkingSpeed] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [liftCapacity, setLiftCapacity] = useState<number | ''>('');
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [operatingTemperature, setOperatingTemperature] = useState<number | ''>(
    '',
  );
  const [maxFlightHeight, setMaxFlightHeight] = useState<number | ''>('');
  const [rotationSpeed, setRotationSpeed] = useState<number | ''>('');

  // Spraying system
  const [sprayingFlowRate, setSprayingFlowRate] = useState<number | ''>('');
  const [sprayingCapacity, setSprayingCapacity] = useState<number | ''>('');
  const [sprayingWidth, setSprayingWidth] = useState<number | ''>('');

  // Spreading system
  const [spreadingFlowRate, setSpreadingFlowRate] = useState<number | ''>('');
  const [spreadingCapacity, setSpreadingCapacity] = useState<number | ''>('');
  const [spreadingWidth, setSpreadingWidth] = useState<number | ''>('');

  useEffect(() => {
    if (!open) {
      setDroneName('');
      setBatteryChargeTime('');
      setFlightTime('');
      setMaxWindSpeed('');
      setMaxFlightSpeed('');
      setMaxWorkingSpeed('');
      setWeight('');
      setLiftCapacity('');
      setWidth('');
      setHeight('');
      setOperatingTemperature('');
      setMaxFlightHeight('');
      setRotationSpeed('');
      setSprayingFlowRate('');
      setSprayingCapacity('');
      setSprayingWidth('');
      setSpreadingFlowRate('');
      setSpreadingCapacity('');
      setSpreadingWidth('');
    }
  }, [open]);

  const canSend = droneName.trim() && flightTime !== '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
    >
      <motion.div
        initial={{ y: 16, scale: 0.995 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.995 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Новый дрон</div>
            <div className="text-lg font-nekstmedium text-gray-900">
              Добавление платформы
            </div>
          </div>
          <div>
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 mb-2">
                Основные характеристики
              </h4>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Название *
                </label>
                <input
                  value={droneName}
                  onChange={(e) => setDroneName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black placeholder:text-gray-400"
                  placeholder="Например: DJI Agras T40"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Время полёта (мин) *
                </label>
                <input
                  type="number"
                  value={flightTime}
                  onChange={(e) =>
                    setFlightTime(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Время зарядки (ч)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={batteryChargeTime}
                  onChange={(e) =>
                    setBatteryChargeTime(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Вес (кг)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) =>
                    setWeight(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Грузоподъёмность (кг)
                </label>
                <input
                  type="number"
                  value={liftCapacity}
                  onChange={(e) =>
                    setLiftCapacity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>

            {/* Performance & Physical */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 mb-2">
                Характеристики производительности
              </h4>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Макс скорость полёта (м/с)
                </label>
                <input
                  type="number"
                  value={maxFlightSpeed}
                  onChange={(e) =>
                    setMaxFlightSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Рабочая скорость (м/с)
                </label>
                <input
                  type="number"
                  value={maxWorkingSpeed}
                  onChange={(e) =>
                    setMaxWorkingSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Макс скорость ветра (м/с)
                </label>
                <input
                  type="number"
                  value={maxWindSpeed}
                  onChange={(e) =>
                    setMaxWindSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ширина дрона (м)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={width}
                  onChange={(e) =>
                    setWidth(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Высота дрона (м)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) =>
                    setHeight(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>
          </div>

          {/* Spraying System */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">
              Система распыления *
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Расход (л/мин) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sprayingFlowRate}
                  onChange={(e) =>
                    setSprayingFlowRate(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ёмкость (л) *
                </label>
                <input
                  type="number"
                  value={sprayingCapacity}
                  onChange={(e) =>
                    setSprayingCapacity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ширина (м) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sprayingWidth}
                  onChange={(e) =>
                    setSprayingWidth(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>
          </div>

          {/* Spreading System */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">
              Система разбрасывания *
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Расход (кг/мин) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={spreadingFlowRate}
                  onChange={(e) =>
                    setSpreadingFlowRate(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ёмкость (кг) *
                </label>
                <input
                  type="number"
                  value={spreadingCapacity}
                  onChange={(e) =>
                    setSpreadingCapacity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ширина (м) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={spreadingWidth}
                  onChange={(e) =>
                    setSpreadingWidth(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>
          </div>

          {/* Additional Parameters */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">
              Дополнительные параметры
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Рабочая температура (°C)
                </label>
                <input
                  type="number"
                  value={operatingTemperature}
                  onChange={(e) =>
                    setOperatingTemperature(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Макс высота полёта (м)
                </label>
                <input
                  type="number"
                  value={maxFlightHeight}
                  onChange={(e) =>
                    setMaxFlightHeight(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Скорость вращения (об/мин)
                </label>
                <input
                  type="number"
                  value={rotationSpeed}
                  onChange={(e) =>
                    setRotationSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 mt-4">
            * - обязательные поля
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Отменить
          </button>
          <button
            disabled={!canSend || sending}
            onClick={() => {
              const body: CreateDroneRequest = {
                droneName: droneName.trim(),
                batteryChargeTime:
                  batteryChargeTime === '' ? 0 : Number(batteryChargeTime),
                flightTime: flightTime === '' ? 0 : Number(flightTime),
                maxWindSpeed: maxWindSpeed === '' ? 0 : Number(maxWindSpeed),
                maxFlightSpeed:
                  maxFlightSpeed === '' ? 0 : Number(maxFlightSpeed),
                maxWorkingSpeed:
                  maxWorkingSpeed === '' ? 0 : Number(maxWorkingSpeed),
                weight: weight === '' ? 0 : Number(weight),
                liftCapacity: liftCapacity === '' ? 0 : Number(liftCapacity),
                width: width === '' ? 0 : Number(width),
                height: height === '' ? 0 : Number(height),
                operatingTemperature:
                  operatingTemperature === ''
                    ? 0
                    : Number(operatingTemperature),
                maxFlightHeight:
                  maxFlightHeight === '' ? 0 : Number(maxFlightHeight),
                rotationSpeed: rotationSpeed === '' ? 0 : Number(rotationSpeed),
                spraying: {
                  flowRate:
                    sprayingFlowRate === '' ? 0 : Number(sprayingFlowRate),
                  capacity:
                    sprayingCapacity === '' ? 0 : Number(sprayingCapacity),
                  width: sprayingWidth === '' ? 0 : Number(sprayingWidth),
                },
                spreading: {
                  flowRate:
                    spreadingFlowRate === '' ? 0 : Number(spreadingFlowRate),
                  capacity:
                    spreadingCapacity === '' ? 0 : Number(spreadingCapacity),
                  width: spreadingWidth === '' ? 0 : Number(spreadingWidth),
                },
              };
              onSubmit(body);
            }}
            className={`px-4 py-2 rounded-full text-white ${!canSend || sending ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-emerald-500'}`}
          >
            {sending ? 'Отправка...' : 'Создать'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------- EditDroneModal -------------------- */
interface EditDroneModalProps {
  open: boolean;
  drone: Drone;
  onClose: () => void;
  onSubmit: (data: CreateDroneRequest) => void;
  sending: boolean;
}

function EditDroneModal({
  open,
  drone,
  onClose,
  onSubmit,
  sending,
}: EditDroneModalProps) {
  const [droneName, setDroneName] = useState(drone.droneName);
  const [batteryChargeTime, setBatteryChargeTime] = useState<number | ''>(
    drone.batteryChargeTime,
  );
  const [flightTime, setFlightTime] = useState<number | ''>(drone.flightTime);
  const [maxWindSpeed, setMaxWindSpeed] = useState<number | ''>(
    drone.maxWindSpeed,
  );
  const [maxFlightSpeed, setMaxFlightSpeed] = useState<number | ''>(
    drone.maxFlightSpeed,
  );
  const [maxWorkingSpeed, setMaxWorkingSpeed] = useState<number | ''>(
    drone.maxWorkingSpeed,
  );
  const [weight, setWeight] = useState<number | ''>(drone.weight);
  const [liftCapacity, setLiftCapacity] = useState<number | ''>(
    drone.liftCapacity,
  );
  const [width, setWidth] = useState<number | ''>(drone.width);
  const [height, setHeight] = useState<number | ''>(drone.height);
  const [operatingTemperature, setOperatingTemperature] = useState<number | ''>(
    drone.operatingTemperature,
  );
  const [maxFlightHeight, setMaxFlightHeight] = useState<number | ''>(
    drone.maxFlightHeight,
  );
  const [rotationSpeed, setRotationSpeed] = useState<number | ''>(
    drone.rotationSpeed,
  );

  // Spraying system
  const [sprayingFlowRate, setSprayingFlowRate] = useState<number | ''>(
    drone.spraying?.flowRate ?? '',
  );
  const [sprayingCapacity, setSprayingCapacity] = useState<number | ''>(
    drone.spraying?.capacity ?? '',
  );
  const [sprayingWidth, setSprayingWidth] = useState<number | ''>(
    drone.spraying?.width ?? '',
  );

  // Spreading system
  const [spreadingFlowRate, setSpreadingFlowRate] = useState<number | ''>(
    drone.spreading?.flowRate ?? '',
  );
  const [spreadingCapacity, setSpreadingCapacity] = useState<number | ''>(
    drone.spreading?.capacity ?? '',
  );
  const [spreadingWidth, setSpreadingWidth] = useState<number | ''>(
    drone.spreading?.width ?? '',
  );

  const canSend = droneName.trim() && flightTime !== '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
    >
      <motion.div
        initial={{ y: 16, scale: 0.995 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.995 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Редактирование дрона</div>
            <div className="text-lg font-nekstmedium text-gray-900">
              {drone.droneName} (ID: {drone.droneId})
            </div>
          </div>
          <div>
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 mb-2">
                Основные характеристики
              </h4>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Название *
                </label>
                <input
                  value={droneName}
                  onChange={(e) => setDroneName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black placeholder:text-gray-400"
                  placeholder="Например: DJI Agras T40"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Время полёта (мин) *
                </label>
                <input
                  type="number"
                  value={flightTime}
                  onChange={(e) =>
                    setFlightTime(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Время зарядки (ч)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={batteryChargeTime}
                  onChange={(e) =>
                    setBatteryChargeTime(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Вес (кг)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) =>
                    setWeight(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Грузоподъёмность (кг)
                </label>
                <input
                  type="number"
                  value={liftCapacity}
                  onChange={(e) =>
                    setLiftCapacity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>

            {/* Performance & Physical */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 mb-2">
                Характеристики производительности
              </h4>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Макс скорость полёта (м/с)
                </label>
                <input
                  type="number"
                  value={maxFlightSpeed}
                  onChange={(e) =>
                    setMaxFlightSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Рабочая скорость (м/с)
                </label>
                <input
                  type="number"
                  value={maxWorkingSpeed}
                  onChange={(e) =>
                    setMaxWorkingSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Макс скорость ветра (м/с)
                </label>
                <input
                  type="number"
                  value={maxWindSpeed}
                  onChange={(e) =>
                    setMaxWindSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ширина дрона (м)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={width}
                  onChange={(e) =>
                    setWidth(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Высота дрона (м)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) =>
                    setHeight(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>
          </div>

          {/* Spraying System */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">
              Система распыления *
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Расход (л/мин) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sprayingFlowRate}
                  onChange={(e) =>
                    setSprayingFlowRate(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ёмкость (л) *
                </label>
                <input
                  type="number"
                  value={sprayingCapacity}
                  onChange={(e) =>
                    setSprayingCapacity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ширина (м) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sprayingWidth}
                  onChange={(e) =>
                    setSprayingWidth(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>
          </div>

          {/* Spreading System */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">
              Система разбрасывания *
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Расход (кг/мин) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={spreadingFlowRate}
                  onChange={(e) =>
                    setSpreadingFlowRate(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ёмкость (кг) *
                </label>
                <input
                  type="number"
                  value={spreadingCapacity}
                  onChange={(e) =>
                    setSpreadingCapacity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Ширина (м) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={spreadingWidth}
                  onChange={(e) =>
                    setSpreadingWidth(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>
          </div>

          {/* Additional Parameters */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">
              Дополнительные параметры
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Рабочая температура (°C)
                </label>
                <input
                  type="number"
                  value={operatingTemperature}
                  onChange={(e) =>
                    setOperatingTemperature(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Макс высота полёта (м)
                </label>
                <input
                  type="number"
                  value={maxFlightHeight}
                  onChange={(e) =>
                    setMaxFlightHeight(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Скорость вращения (об/мин)
                </label>
                <input
                  type="number"
                  value={rotationSpeed}
                  onChange={(e) =>
                    setRotationSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-black"
                />
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 mt-4">
            * - обязательные поля
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Отменить
          </button>
          <button
            disabled={!canSend || sending}
            onClick={() => {
              const body: CreateDroneRequest = {
                droneName: droneName.trim(),
                batteryChargeTime:
                  batteryChargeTime === '' ? 0 : Number(batteryChargeTime),
                flightTime: flightTime === '' ? 0 : Number(flightTime),
                maxWindSpeed: maxWindSpeed === '' ? 0 : Number(maxWindSpeed),
                maxFlightSpeed:
                  maxFlightSpeed === '' ? 0 : Number(maxFlightSpeed),
                maxWorkingSpeed:
                  maxWorkingSpeed === '' ? 0 : Number(maxWorkingSpeed),
                weight: weight === '' ? 0 : Number(weight),
                liftCapacity: liftCapacity === '' ? 0 : Number(liftCapacity),
                width: width === '' ? 0 : Number(width),
                height: height === '' ? 0 : Number(height),
                operatingTemperature:
                  operatingTemperature === ''
                    ? 0
                    : Number(operatingTemperature),
                maxFlightHeight:
                  maxFlightHeight === '' ? 0 : Number(maxFlightHeight),
                rotationSpeed: rotationSpeed === '' ? 0 : Number(rotationSpeed),
                spraying:
                  sprayingFlowRate !== '' &&
                  sprayingCapacity !== '' &&
                  sprayingWidth !== ''
                    ? {
                        flowRate: Number(sprayingFlowRate),
                        capacity: Number(sprayingCapacity),
                        width: Number(sprayingWidth),
                      }
                    : null,
                spreading:
                  spreadingFlowRate !== '' &&
                  spreadingCapacity !== '' &&
                  spreadingWidth !== ''
                    ? {
                        flowRate: Number(spreadingFlowRate),
                        capacity: Number(spreadingCapacity),
                        width: Number(spreadingWidth),
                      }
                    : null,
              };
              onSubmit(body);
            }}
            className={`px-4 py-2 rounded-full text-white ${!canSend || sending ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-emerald-500'}`}
          >
            {sending ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
