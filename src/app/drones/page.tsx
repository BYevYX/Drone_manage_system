'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  Trash2,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

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
  const [drones, setDrones] = useState<any[]>([]);
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
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // read role once on mount
    try {
      if (typeof window !== 'undefined') {
        setUserRole(localStorage.getItem('userRole'));
      }
    } catch (e) {
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
      const json = await res.json();
      setDrones(Array.isArray(json.drones) ? json.drones : []);
    } catch (e: any) {
      console.error('fetchList error', e);
      setError(e.message || 'Ошибка получения дронов');
    } finally {
      setIsLoading(false);
    }
  }

  async function createDrone(payload: any) {
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
    } catch (e: any) {
      console.error('create error', e);
      showNotice('err', e.message || 'Ошибка создания дрона');
    } finally {
      setSending(false);
      setAddOpen(false);
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
      setDrones((prev) => prev.filter((d) => (d.droneId ?? d.id) !== droneId));
      showNotice('ok', `Дрон #${droneId} удалён`);
    } catch (e: any) {
      console.error('delete error', e);
      showNotice('err', e.message || 'Ошибка удаления');
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = drones.filter((d) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      String(d.droneId ?? d.id).includes(q) ||
      (d.droneName || '').toLowerCase().includes(q) ||
      (d.manufacturer || '').toLowerCase().includes(q)
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
                  const id = d.droneId ?? d.id;
                  return (
                    <article
                      key={id}
                      className="rounded-2xl bg-white border border-indigo-50 shadow-[0_6px_28px_rgba(40,60,100,0.06)] p-6 flex flex-col justify-between hover:shadow-[0_10px_40px_rgba(40,60,100,0.10)] transition"
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
                              {d.description || '—'}
                            </div>
                          </div>
                          {/* optional small badge if supplier */}
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
                              {d.batteryChargeTime ?? '—'} мин
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <div className="text-[11px] text-gray-500">
                              Ширина распыл.
                            </div>
                            <div className="font-semibold text-gray-800 mt-1">
                              {d.sprayingWidth ?? '—'} м
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
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-end gap-3">
                        {isSupplier ? (
                          <button
                            onClick={() => deleteDrone(id)}
                            disabled={deletingId === id}
                            className="px-3 py-1 rounded-full bg-white border text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                          >
                            <Trash2 size={14} />{' '}
                            {deletingId === id ? 'Удаление...' : 'Удалить'}
                          </button>
                        ) : (
                          <div className="text-xs text-gray-400 italic">
                            Доступно только для просмотра
                          </div>
                        )}
                      </div>
                    </article>
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
      </AnimatePresence>

      <Footer />
    </div>
  );
}

/* -------------------- AddDroneModal -------------------- */
function AddDroneModal({ open, onClose, onSubmit, sending }: any) {
  const [droneName, setDroneName] = useState('');
  const [batteryChargeTime, setBatteryChargeTime] = useState<number | ''>('');
  const [flightTime, setFlightTime] = useState<number | ''>('');
  const [sprayingWidth, setSprayingWidth] = useState<number | ''>('');
  const [maxWindSpeed, setMaxWindSpeed] = useState<number | ''>('');
  const [maxFlightSpeed, setMaxFlightSpeed] = useState<number | ''>('');
  const [maxWorkingSpeed, setMaxWorkingSpeed] = useState<number | ''>('');

  useEffect(() => {
    if (!open) {
      setDroneName('');
      setBatteryChargeTime('');
      setFlightTime('');
      setSprayingWidth('');
      setMaxWindSpeed('');
      setMaxFlightSpeed('');
      setMaxWorkingSpeed('');
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
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Название
              </label>
              <input
                value={droneName}
                onChange={(e) => setDroneName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Например: AGRI X5"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Время полёта (мин)
              </label>
              <input
                type="number"
                value={flightTime}
                onChange={(e) =>
                  setFlightTime(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Время зарядки (мин)
              </label>
              <input
                type="number"
                value={batteryChargeTime}
                onChange={(e) =>
                  setBatteryChargeTime(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Ширина распыла (м)
              </label>
              <input
                type="number"
                value={sprayingWidth}
                onChange={(e) =>
                  setSprayingWidth(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="space-y-3">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="text-sm text-gray-500 mt-2">
              Заполните минимум название и время полёта.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-full border">
            Отменить
          </button>
          <button
            disabled={!canSend || sending}
            onClick={() => {
              const body: any = {
                droneName: droneName.trim(),
                batteryChargeTime:
                  batteryChargeTime === '' ? 0 : Number(batteryChargeTime),
                flightTime: flightTime === '' ? 0 : Number(flightTime),
                sprayingWidth: sprayingWidth === '' ? 0 : Number(sprayingWidth),
                maxWindSpeed: maxWindSpeed === '' ? 0 : Number(maxWindSpeed),
                maxFlightSpeed:
                  maxFlightSpeed === '' ? 0 : Number(maxFlightSpeed),
                maxWorkingSpeed:
                  maxWorkingSpeed === '' ? 0 : Number(maxWorkingSpeed),
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
