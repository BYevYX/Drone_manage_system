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

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
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
    try {
      if (typeof window !== 'undefined') {
        setUserRole(localStorage.getItem('userRole'));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchMaterials(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const isSupplier =
    userRole === 'MATERIAL_SUPPLIER' || userRole === 'materialSupplier';

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4200);
  };

  async function fetchMaterials(p = 1, lim = 12) {
    setIsLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const qs = new URLSearchParams({ page: String(p), limit: String(lim) });
      const res = await fetch(`${API_BASE}/api/materials?${qs.toString()}`, {
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
          throw new Error('404 Not Found — проверьте URL /api/materials');
        const body = await res.text();
        throw new Error(`Ошибка ${res.status}: ${body}`);
      }
      const json = await res.json();
      setMaterials(
        Array.isArray(json.materials)
          ? json.materials
          : Array.isArray(json)
            ? json
            : [],
      );
    } catch (e: any) {
      console.error('fetchMaterials error', e);
      setError(e.message || 'Ошибка получения материалов');
    } finally {
      setIsLoading(false);
    }
  }

  async function createMaterial(payload: any) {
    setSending(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/api/materials`, {
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
          throw new Error('404 Not Found — проверьте путь POST /api/materials');
        throw new Error(body?.message || `Ошибка сервера: ${res.status}`);
      }
      const created = await res.json();
      showNotice('ok', 'Материал добавлен');
      if (created && typeof created.materialId !== 'undefined') {
        setMaterials((s) => [created, ...s]);
      } else {
        await fetchMaterials(page, limit);
      }
    } catch (e: any) {
      console.error('createMaterial error', e);
      showNotice('err', e.message || 'Ошибка добавления материала');
    } finally {
      setSending(false);
      setAddOpen(false);
    }
  }

  async function deleteMaterial(materialId: number) {
    if (!confirm(`Удалить материал #${materialId}?`)) return;
    setDeletingId(materialId);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/api/materials/${materialId}`, {
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
          throw new Error('404 Not Found — материал не найден');
        throw new Error(body?.message || `Ошибка удаления: ${res.status}`);
      }
      setMaterials((prev) =>
        prev.filter((m) => (m.materialId ?? m.id) !== materialId),
      );
      showNotice('ok', `Материал #${materialId} удалён`);
    } catch (e: any) {
      console.error('deleteMaterial error', e);
      showNotice('err', e.message || 'Ошибка удаления материала');
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = materials.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      String(m.materialId ?? m.id)
        .toLowerCase()
        .includes(q) ||
      (m.materialName || '').toLowerCase().includes(q) ||
      (m.materialType || '').toLowerCase().includes(q) ||
      (m.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f7f9fc] to-[#f4f9f7]">
      <Header />
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-nekstmedium text-slate-900">
              Каталог материалов
            </h1>
            <div className="mt-1 text-sm text-slate-500">
              Управление материалами — добавление, удаление, поиск.
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative group">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию, типу или ID..."
                className="pl-4 pr-10 py-2 w-72 rounded-full bg-white shadow-sm
                 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400
                 focus:ring-2 focus:ring-emerald-100"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors">
                <Search size={18} />
              </div>
            </div>

            <button
              onClick={() => fetchMaterials(page, limit)}
              title="Обновить список"
              className="px-4 py-2 rounded-full bg-white shadow-sm text-slate-700 inline-flex items-center gap-2 transition-all hover:shadow-md"
            >
              <RefreshCw size={18} className="text-slate-500" />
              <span className="text-sm font-nekstregular">Обновить</span>
            </button>

            {isSupplier && (
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                 bg-gradient-to-r from-emerald-500 to-green-600 text-white
                 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <Plus size={16} />
                <span className="text-sm font-nekstmedium">
                  Добавить материал
                </span>
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
                    className="animate-pulse rounded-2xl bg-white/60 p-6 h-40"
                  />
                ))
              : filtered.map((m) => {
                  const id = m.materialId ?? m.id;
                  return (
                    <article
                      key={id}
                      className="rounded-2xl bg-white p-6 flex flex-col justify-between shadow-[0_6px_28px_rgba(30,60,40,0.06)]
                        hover:shadow-[0_12px_50px_rgba(30,60,40,0.10)] transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-xs text-slate-400">
                              ID #{id}
                            </div>
                            <h3 className="text-lg font-nekstmedium text-slate-900 mt-1 truncate">
                              {m.materialName || '—'}
                            </h3>
                            <div className="text-sm text-slate-500 mt-1 truncate">
                              {m.materialType || '—'}
                            </div>
                          </div>

                          <div className="text-sm text-slate-700">
                            {m.status || '—'}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                          <div className="bg-emerald-50/60 p-3 rounded-lg">
                            <div className="text-[11px] text-slate-500">
                              Кол-во
                            </div>
                            <div className="font-semibold text-slate-800 mt-1">
                              {typeof m.amount !== 'undefined'
                                ? String(m.amount)
                                : '—'}
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <div className="text-[11px] text-slate-500">
                              Добавлен
                            </div>
                            <div className="font-semibold text-slate-800 mt-1">
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleString()
                                : '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-end gap-3">
                        {isSupplier ? (
                          <button
                            onClick={() => deleteMaterial(id)}
                            disabled={deletingId === id}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-red-600 shadow-sm
                              bg-white hover:shadow-md transition-all ${deletingId === id ? 'opacity-60 cursor-not-allowed' : ''}
                            `}
                          >
                            <Trash2 size={14} />
                            <span className="text-sm font-nekstregular">
                              {deletingId === id ? 'Удаление...' : 'Удалить'}
                            </span>
                          </button>
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            Только просмотр
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
          </div>

          {/* pagination */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Показано <span className="font-medium">{filtered.length}</span> /{' '}
              <span className="font-medium">{materials.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg bg-white shadow-sm hover:shadow-md transition"
                aria-label="Предыдущая"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="px-3 text-sm font-nekstregular">Стр. {page}</div>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg bg-white shadow-sm hover:shadow-md transition"
                aria-label="Следующая"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {addOpen && isSupplier && (
          <AddMaterialModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onSubmit={createMaterial}
            sending={sending}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

/* -------------------- AddMaterialModal -------------------- */
function AddMaterialModal({ open, onClose, onSubmit, sending }: any) {
  const [materialType, setMaterialType] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!open) {
      setMaterialType('');
      setMaterialName('');
      setAmount('');
      setStatus('');
    }
  }, [open]);

  // ESC + block body scroll when modal open
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // lock scroll
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;

    const scrollY = window.scrollY || window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      // restore
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      window.scrollTo(0, scrollY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canSend = materialName.trim() && materialType.trim();

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 12, scale: 0.995 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 12, scale: 0.995 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-slate-500">Новый материал</div>
            <div className="text-lg font-nekstmedium text-slate-900">
              Добавление материала
            </div>
          </div>
          <div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/60 shadow-sm hover:shadow-md"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 block mb-1 font-nekstregular">
              Тип материала
            </label>
            <input
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              placeholder="Тип материала"
              className="w-full px-4 py-3 rounded-xl font-nekstregular bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1 font-nekstregular">
              Название
            </label>
            <input
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="Название материала"
              className="w-full px-4 py-3 rounded-xl font-nekstregular bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1 font-nekstregular">
              Количество
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Количество"
              className="w-full px-4 py-3 rounded-xl font-nekstregular bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1 font-nekstregular">
              Статус
            </label>
            <input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Статус (available / pending)"
              className="w-full px-4 py-3 font-nekstregular rounded-xl bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500 font-nekstregular">
          Заполните тип и название — остальное можно оставить по умолчанию.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white text-slate-700 shadow-sm hover:shadow-md transition"
          >
            Отмена
          </button>
          <button
            disabled={!canSend || sending}
            onClick={() => {
              const body: any = {
                materialType: materialType.trim(),
                materialName: materialName.trim(),
                amount: amount === '' ? 0 : Number(amount),
                status: status.trim() || 'available',
              };
              onSubmit(body);
            }}
            className={`px-4 py-2 rounded-full font-nekstregular text-white ${!canSend || sending ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all'} font-nekstmedium`}
          >
            {sending ? 'Отправка...' : 'Создать'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
