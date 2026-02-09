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
  process.env.NEXT_PUBLIC_API_BASE || 'https://api.droneagro.xyz';

// Небольшой debounce hook — современно и просто
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// Try several possible keys in localStorage to resolve userId
function getUserIdFromLocalStorage(): number | null {
  if (typeof window === 'undefined') return null;
  const candidates = [
    'userId',
    'userID',
    'user_id',
    'id',
    'uid',
    'user', // could be JSON like { id: ... }
  ];
  for (const k of candidates) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    // try parse as number
    const asNum = Number(raw);
    if (!Number.isNaN(asNum) && Number.isFinite(asNum))
      return Math.trunc(asNum);
    // try parse JSON
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.id === 'number') return Math.trunc(parsed.id);
        if (typeof parsed.userId === 'number') return Math.trunc(parsed.userId);
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [myDrones, setMyDrones] = useState<Drone[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [myLoading, setMyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myError, setMyError] = useState<string | null>(null);

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
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('userRole'));
    }
  }, []);

  const isSupplier = useMemo(
    () => userRole === 'DRONE_SUPPLIER' || userRole === 'droneSupplier',
    [userRole],
  );

  const canEdit = useMemo(
    () => isSupplier || userRole === 'MANAGER',
    [isSupplier, userRole],
  );

  const showToast = useCallback((kind: 'success' | 'error', text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  // fetch list (all drones) with AbortController to avoid race conditions
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

  // fetch "my drones" when user is supplier
  useEffect(() => {
    if (!isSupplier) return;
    let isMounted = true;
    const ctrl = new AbortController();

    async function loadMy() {
      setMyLoading(true);
      setMyError(null);
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken')
            : null;

        // try to resolve userId from localStorage (best-effort)
        const uid = getUserIdFromLocalStorage();
        let url = `${API_BASE}/api/drones-by-user`;
        if (uid) url += `?userId=${uid}`;

        const res = await fetch(url, {
          method: 'GET',
          signal: ctrl.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          if (res.status === 403)
            throw new Error('403 — проверьте токен/права');
          if (res.status === 404)
            throw new Error('404 — /api/drones-by-user не найден');
          const txt = await res.text();
          throw new Error(`Ошибка ${res.status}: ${txt}`);
        }

        const json: DroneListResponse = await res.json();
        if (!isMounted) return;
        setMyDrones(Array.isArray(json.drones) ? json.drones : []);
      } catch (err: unknown) {
        if ((err as any)?.name === 'AbortError') return;
        console.error('load my drones error', err);
        if (isMounted)
          setMyError(
            err instanceof Error ? err.message : 'Ошибка получения моих дронов',
          );
      } finally {
        if (isMounted) setMyLoading(false);
      }
    }

    loadMy();

    return () => {
      isMounted = false;
      ctrl.abort();
    };
  }, [isSupplier]); // run when role is determined

  const refresh = useCallback(() => setPage((p) => p), []);

  // Universal image upload function
  async function uploadImage(
    droneId: number,
    file: File,
    token: string | null,
  ) {
    // Step 1: Get upload URL
    const uploadUrlRes = await fetch(
      `${API_BASE}/api/drones-upload?droneId=${droneId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!uploadUrlRes.ok) {
      const errorText = await uploadUrlRes.text().catch(() => 'Unknown error');
      throw new Error(
        `Не удалось получить URL загрузки (${uploadUrlRes.status}): ${errorText}`,
      );
    }

    const uploadUrlData = await uploadUrlRes.json();
    const uploadUrl = uploadUrlData.url;

    if (!uploadUrl) {
      throw new Error('URL для загрузки не найден');
    }

    // Step 2: Upload file to presigned URL
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
    });

    if (!uploadRes.ok) {
      throw new Error(`Не удалось загрузить файл (${uploadRes.status})`);
    }

    // Step 3: Confirm upload
    const confirmRes = await fetch(
      `${API_BASE}/api/drones-confirm-upload?droneId=${droneId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!confirmRes.ok) {
      const errorText = await confirmRes.text().catch(() => 'Unknown error');
      throw new Error(
        `Не удалось подтвердить загрузку (${confirmRes.status}): ${errorText}`,
      );
    }
  }

  async function createDrone(
    payload: CreateDroneRequest,
    imageFile?: File | null,
  ) {
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

      // Upload image if provided
      if (imageFile && created && created.droneId) {
        try {
          await uploadImage(created.droneId, imageFile, token);
          showToast('success', 'Дрон и изображение успешно загружены');
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showToast(
            'error',
            'Дрон создан, но изображение не загружено: ' +
              (uploadError instanceof Error
                ? uploadError.message
                : 'Неизвестная ошибка'),
          );
        }
      } else {
        showToast('success', 'Дрон успешно создан');
      }

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
      // also update myDrones if present
      setMyDrones((prev) =>
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
      setMyDrones((prev) => prev.filter((d) => d.droneId !== droneId));
      showToast('success', `Дрон #${droneId} удалён`);
    } catch (e: unknown) {
      console.error('delete', e);
      showToast('error', e instanceof Error ? e.message : 'Ошибка удаления');
    } finally {
      setDeletingId(null);
    }
  }

  // which list to filter based on active tab
  const displayedBase = useMemo(() => {
    return activeTab === 'my' ? myDrones : drones;
  }, [activeTab, drones, myDrones]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return displayedBase;
    return displayedBase.filter((d) => {
      return (
        String(d.droneId).includes(q) ||
        (d.droneName || '').toLowerCase().includes(q)
      );
    });
  }, [displayedBase, debouncedQuery]);

  // hide pagination when on "my" tab (assume my list is small / full)
  const showPagination = activeTab === 'all';

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

            {canEdit && (
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

        {/* Tabs */}
        {isSupplier && (
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-nekstregular transition ${
                activeTab === 'all'
                  ? 'bg-white shadow-md text-slate-900'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              Все дроны
            </button>

            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-full text-sm font-nekstregular transition ${
                activeTab === 'my'
                  ? 'bg-white shadow-md text-slate-900'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              Мои дроны
              {myLoading ? (
                <span className="ml-2 text-xs text-slate-400">…</span>
              ) : (
                <span className="ml-2 text-xs text-slate-400">
                  ({myDrones.length})
                </span>
              )}
            </button>
          </div>
        )}

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${
              toast.kind === 'success'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {toast.text}
          </motion.div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {myError && activeTab === 'my' && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
            {myError}
          </div>
        )}

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {(activeTab === 'all' ? isLoading : myLoading)
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl bg-white/70 shadow-sm p-6 h-52"
                  />
                ))
              : filtered.map((d) => {
                  const id = d.droneId;
                  return (
                    <Link
                      href={`/drones/${id}`}
                      key={id}
                      className="group block"
                    >
                      <motion.article
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 24,
                        }}
                        className="
      relative
      rounded-3xl
      bg-white
      border border-slate-200
      overflow-hidden
      transition-all duration-300
      hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]
    "
                      >
                        {/* Top object zone */}
                        <div className="relative p-6 pb-4 bg-gradient-to-b from-slate-50 to-white">
                          <div className="flex items-start gap-5">
                            {/* Image — LEFT */}
                            <div
                              className="
        relative
        w-28 h-28
        rounded-2xl
        bg-white
        ring-1 ring-slate-200
        shadow-sm
        overflow-hidden
        shrink-0
        transition-transform
        group-hover:scale-[1.03]
      "
                            >
                              {d.imageKey ? (
                                <img
                                  src={`${d.imageKey}?t=${Date.now()}`}
                                  alt={d.droneName || 'drone'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Если изображение не загрузилось, показываем иконку
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.nextSibling) {
                                      (
                                        target.nextSibling as HTMLElement
                                      ).style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                  display: d.imageKey ? 'none' : 'flex',
                                }}
                              >
                                <Camera size={28} className="text-slate-300" />
                              </div>
                            </div>

                            {/* Info — RIGHT */}
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] text-slate-400 font-nekstregular tracking-wide">
                                DRONE #{id}
                              </div>

                              <h3 className="mt-1 text-lg text-slate-900 font-nekstmedium truncate">
                                {d.droneName || '—'}
                              </h3>

                              <p className="mt-2 text-sm text-slate-600 font-nekstregular">
                                Вес {d.weight ?? '—'} кг · Груз{' '}
                                {d.liftCapacity ?? '—'} кг
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
                          <SpecPill
                            label="Полёт"
                            value={d.flightTime ? `${d.flightTime} мин` : '—'}
                          />
                          <SpecPill
                            label="Зарядка"
                            value={
                              d.batteryChargeTime
                                ? `${d.batteryChargeTime} мин`
                                : '—'
                            }
                          />

                          <SpecPill
                            label="Распыл."
                            value={
                              d.spraying?.width ? `${d.spraying.width} м` : '—'
                            }
                          />
                          <SpecPill
                            label="Ветер"
                            value={
                              d.maxWindSpeed ? `${d.maxWindSpeed} м/с` : '—'
                            }
                          />

                          <SpecPill
                            label="Макс. скорость"
                            value={
                              d.maxFlightSpeed ? `${d.maxFlightSpeed} м/с` : '—'
                            }
                          />
                          <SpecPill
                            label="Рабочая"
                            value={
                              d.maxWorkingSpeed
                                ? `${d.maxWorkingSpeed} м/с`
                                : '—'
                            }
                          />
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                          {/* Capacities */}
                          <div className="flex items-center gap-2 text-xs font-nekstregular text-slate-600">
                            <span>
                              Распыл:{' '}
                              {d.spraying?.capacity
                                ? `${d.spraying.capacity} кг`
                                : '—'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>
                              Разброс:{' '}
                              {d.spreading?.capacity
                                ? `${d.spreading.capacity} кг`
                                : '—'}
                            </span>
                          </div>

                          {/* Actions */}
                          {canEdit ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingDrone(d);
                                  setEditOpen(true);
                                }}
                                className="
          w-9 h-9
          rounded-lg
          border border-slate-200
          text-slate-700
          flex items-center justify-center
          leading-none
          hover:bg-slate-50
          transition
        "
                                aria-label="Редактировать"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteDrone(id);
                                }}
                                disabled={deletingId === id}
                                className="
          w-9 h-9
          rounded-lg
          border border-slate-200
          text-red-600
          flex items-center justify-center
          leading-none
          hover:bg-red-50
          transition
          disabled:opacity-60
        "
                                aria-label="Удалить"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs italic text-slate-400 font-nekstregular">
                              Только просмотр
                            </span>
                          )}
                        </div>
                      </motion.article>
                    </Link>
                  );
                })}
          </div>

          {/* pagination */}
          {showPagination && (
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
          )}
        </section>
      </main>

      <AnimatePresence>
        {addOpen && canEdit && (
          <AddDroneModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onSubmit={createDrone}
            sending={sending}
          />
        )}

        {editOpen && canEdit && editingDrone && (
          <EditDroneModal
            open={editOpen}
            drone={editingDrone}
            onClose={() => {
              setEditOpen(false);
              setEditingDrone(null);
            }}
            onSubmit={(payload) => updateDrone(editingDrone.droneId, payload)}
            onImageUploaded={async () => {
              // Перезагружаем дрона из API после загрузки изображения
              try {
                const token =
                  typeof window !== 'undefined'
                    ? localStorage.getItem('accessToken')
                    : null;
                const res = await fetch(
                  `${API_BASE}/api/drones/${editingDrone.droneId}`,
                  {
                    headers: {
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                  },
                );
                if (res.ok) {
                  const updated = await res.json();
                  setDrones((prev) =>
                    prev.map((d) =>
                      d.droneId === editingDrone.droneId ? updated : d,
                    ),
                  );
                  setMyDrones((prev) =>
                    prev.map((d) =>
                      d.droneId === editingDrone.droneId ? updated : d,
                    ),
                  );
                }
              } catch (error) {
                console.error(
                  'Failed to reload drone after image upload:',
                  error,
                );
              }
            }}
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

const SpecPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-slate-50 px-3 py-2">
    <div className="text-[11px] text-slate-400 font-nekstregular">{label}</div>
    <div className="text-sm text-slate-900 font-nekstmedium">{value}</div>
  </div>
);
