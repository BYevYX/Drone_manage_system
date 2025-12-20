'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
  Camera,
} from 'lucide-react';

import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';
import { AddDroneModal } from './components/addDroneModal';
import { EditDroneModal } from './components/editDroneModal';
import { Drone, DroneListResponse, CreateDroneRequest } from './types';

// предпочитаемый базовый URL через env, fallback для dev
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'https://droneagro.duckdns.org';

// Небольшой debounce hook — современно и просто
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 280);

  const [toast, setToast] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined')
      setUserRole(localStorage.getItem('userRole'));
  }, []);

  const isSupplier = useMemo(
    () => userRole === 'DRONE_SUPPLIER' || userRole === 'droneSupplier',
    [userRole],
  );

  const showToast = useCallback((kind: 'success' | 'error', text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  // fetch list with AbortController to avoid race conditions
  useEffect(() => {
    let isMounted = true;
    const ctrl = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken')
            : null;
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        const res = await fetch(`${API_BASE}/api/drones?${qs.toString()}`, {
          method: 'GET',
          signal: ctrl.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          if (res.status === 403) throw new Error('403 — проверьте токен');
          if (res.status === 404)
            throw new Error('404 — /api/drones не найден');
          const txt = await res.text();
          throw new Error(`Ошибка ${res.status}: ${txt}`);
        }
        const json: DroneListResponse = await res.json();
        if (!isMounted) return;
        setDrones(Array.isArray(json.drones) ? json.drones : []);
      } catch (err: unknown) {
        if ((err as any)?.name === 'AbortError') return;
        console.error('load drones error', err);
        if (isMounted)
          setError(
            err instanceof Error ? err.message : 'Ошибка получения дронов',
          );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
      ctrl.abort();
    };
  }, [page, limit]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return drones;
    return drones.filter((d) => {
      return (
        String(d.droneId).includes(q) ||
        (d.droneName || '').toLowerCase().includes(q)
      );
    });
  }, [drones, debouncedQuery]);

  const refresh = useCallback(() => setPage((p) => p), []); // trigger effect by setting same page (could be improved)

  async function createDrone(payload: CreateDroneRequest) {
    setSending(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/api/drones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403) throw new Error('403 — нет прав');
        if (res.status === 404) throw new Error('404 — endpoint не найден');
        throw new Error(body?.message || `Ошибка ${res.status}`);
      }
      const created = await res.json();
      showToast('success', 'Дрон успешно создан');
      if (created && typeof created.droneId !== 'undefined')
        setDrones((s) => [created, ...s]);
      else refresh();
    } catch (e: unknown) {
      console.error('create', e);
      showToast('error', e instanceof Error ? e.message : 'Ошибка создания');
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
      const res = await fetch(`${API_BASE}/api/drones/${droneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403) throw new Error('403 — нет прав');
        if (res.status === 404) throw new Error('404 — дрон не найден');
        throw new Error(body?.message || `Ошибка ${res.status}`);
      }
      const updated = await res.json();
      setDrones((prev) =>
        prev.map((d) => (d.droneId === droneId ? updated : d)),
      );
      showToast('success', 'Данные дрона обновлены');
    } catch (e: unknown) {
      console.error('update', e);
      showToast('error', e instanceof Error ? e.message : 'Ошибка обновления');
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
      const res = await fetch(`${API_BASE}/api/drones/${droneId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403) throw new Error('403 — нет прав');
        if (res.status === 404) throw new Error('404 — дрон не найден');
        throw new Error(body?.message || `Ошибка ${res.status}`);
      }
      setDrones((prev) => prev.filter((d) => d.droneId !== droneId));
      showToast('success', `Дрон #${droneId} удалён`);
    } catch (e: unknown) {
      console.error('delete', e);
      showToast('error', e instanceof Error ? e.message : 'Ошибка удаления');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-emerald-50">
      <Header />

      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-nekstmedium text-slate-900">
              Парк дронов
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Современная витрина техники
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="relative flex items-center w-full md:w-64">
              <input
                aria-label="Поиск дронов"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по имени, ID или характеристикам..."
                className="pl-4 pr-10 py-2 w-full font-nekstregular rounded-full border border-transparent bg-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 text-sm placeholder:text-slate-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {query ? (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Очистить поиск"
                    className="p-1"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <Search size={16} />
                )}
              </div>
            </label>

            <button
              onClick={() =>
                fetch(
                  `${API_BASE}/api/drones?page=${page}&limit=${limit}`,
                ).then(() => setPage((p) => p))
              }
              title="Обновить"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group font-nekstregular"
            >
              <RefreshCw
                size={16}
                className="transition-transform duration-500 group-hover:rotate-180 text-slate-700"
              />
              <span className="text-sm text-slate-700">Обновить</span>
            </button>

            {isSupplier && (
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white font-medium shadow-lg hover:scale-[1.04] transition-transform"
              >
                <Plus size={16} />
                <span className="text-sm font-nekstregular">Добавить</span>
              </button>
            )}
          </div>
        </div>

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${toast.kind === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}
          >
            {toast.text}
          </motion.div>
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
                    className="animate-pulse rounded-2xl bg-white/70 shadow-sm p-6 h-52"
                  />
                ))
              : filtered.map((d) => {
                  const id = d.droneId;
                  return (
                    <Link href={`/drones/${id}`} key={id} className="group">
                      <motion.article
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: '0 20px 60px rgba(16,24,40,0.12)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 22,
                        }}
                        className="rounded-2xl bg-white border border-transparent shadow-md p-6 flex flex-col justify-between cursor-pointer overflow-hidden"
                        aria-labelledby={`drone-${id}-title`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-xs text-slate-400">
                              ID #{id}
                            </div>
                            <h3
                              id={`drone-${id}-title`}
                              className="text-lg font-nekstmedium text-slate-900 mt-1 truncate"
                            >
                              {d.droneName || '—'}
                            </h3>
                            <div className="text-sm text-slate-600 mt-2 line-clamp-2">
                              Вес: {d.weight ?? '—'}кг · Грузоподъёмность:{' '}
                              {d.liftCapacity ?? '—'}кг
                            </div>
                          </div>

                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                            {d.imageKey ? (
                              // lazy load, graceful fallback
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={d.imageKey}
                                alt={d.droneName || 'drone image'}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) =>
                                  ((
                                    e.target as HTMLImageElement
                                  ).style.display = 'none')
                                }
                              />
                            ) : (
                              <Camera size={28} className="text-slate-300" />
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                          <StatCard
                            label="Время полёта"
                            value={d.flightTime ? `${d.flightTime} мин` : '—'}
                            accent
                          />
                          <StatCard
                            label="Время зарядки"
                            value={
                              d.batteryChargeTime
                                ? `${d.batteryChargeTime} мин`
                                : '—'
                            }
                          />

                          <StatCard
                            label="Ширина распыл."
                            value={
                              d.spraying?.width ? `${d.spraying?.width} м` : '—'
                            }
                          />
                          <StatCard
                            label="Макс ветер"
                            value={
                              d.maxWindSpeed ? `${d.maxWindSpeed} м/с` : '—'
                            }
                            accent
                          />

                          <StatCard
                            label="Макс скорость"
                            value={
                              d.maxFlightSpeed ? `${d.maxFlightSpeed} м/с` : '—'
                            }
                          />
                          <StatCard
                            label="Рабочая скорость"
                            value={
                              d.maxWorkingSpeed
                                ? `${d.maxWorkingSpeed} м/с`
                                : '—'
                            }
                          />

                          <StatCard
                            label="Ёмкость распыл."
                            value={
                              d.spraying?.capacity
                                ? `${d.spraying?.capacity} кг`
                                : '—'
                            }
                            green
                          />
                          <StatCard
                            label="Ёмкость разбрас."
                            value={
                              d.spreading?.capacity
                                ? `${d.spreading?.capacity} кг`
                                : '—'
                            }
                            green
                          />
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-3">
                          {isSupplier ? (
                            <>
                              {/* Кнопка Редактировать */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingDrone(d);
                                  setEditOpen(true);
                                }}
                                className="
      font-nekstregular
      w-10 h-10
      flex items-center justify-center
      rounded-full
      bg-emerald-50
      text-emerald-700
      shadow-sm
      hover:shadow-md
      hover:bg-emerald-100
      transition-all duration-300
      transform hover:-translate-y-0.5 hover:scale-105
      focus:outline-none focus:ring-2 focus:ring-emerald-200
    "
                                title="Редактировать"
                              >
                                <Edit size={16} />
                              </button>

                              {/* Кнопка Удалить */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteDrone(id);
                                }}
                                disabled={deletingId === id}
                                className={`
      font-nekstregular
      w-10 h-10
      flex items-center justify-center
      rounded-full
      bg-red-50
      text-red-600
      shadow-sm
      hover:shadow-md
      hover:bg-red-100
      transition-all duration-300
      transform hover:-translate-y-0.5 hover:scale-105
      focus:outline-none focus:ring-2 focus:ring-red-200
      ${deletingId === id ? 'cursor-not-allowed opacity-60' : ''}
    `}
                                title={
                                  deletingId === id ? 'Удаление...' : 'Удалить'
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="text-xs text-slate-400 italic">
                              Только просмотр
                            </div>
                          )}
                        </div>
                      </motion.article>
                    </Link>
                  );
                })}
          </div>

          {/* pagination */}
          <div className="mt-8 flex items-center justify-between font-nekstregular">
            <div className="text-sm text-slate-600">
              Показано <span className="">{filtered.length}</span> /{' '}
              <span className="font-medium">{drones.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Предыдущая"
                className="
      px-3 py-2 rounded-lg
      bg-white shadow-md
      hover:shadow-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200
      focus:outline-none focus:ring-2 focus:ring-emerald-200
      transition-all duration-300 transform active:scale-95
      flex items-center justify-center
    "
              >
                <ArrowLeft size={16} />
              </button>

              <div className="px-3 text-sm font-nekstregular select-none">
                Стр. {page}
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                aria-label="Следующая"
                className="
      px-3 py-2 rounded-lg
      bg-white shadow-md
      hover:shadow-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200
      focus:outline-none focus:ring-2 focus:ring-emerald-200
      transition-all duration-300 transform active:scale-95
      flex items-center justify-center
    "
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

function StatCard({
  label,
  value,
  accent,
  green,
}: {
  label: string;
  value: string;
  accent?: boolean;
  green?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${accent ? 'bg-emerald-50/60 border-emerald-100' : 'bg-white border-gray-100'} ${green ? 'bg-emerald-50/60' : ''}`}
    >
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="font-semibold text-slate-800 mt-1">{value}</div>
    </div>
  );
}
