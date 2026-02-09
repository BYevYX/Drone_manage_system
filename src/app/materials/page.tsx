'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import Footer from '@/src/shared/ui/Footer';
import Header from '@/src/shared/ui/Header';

const API_BASE = 'https://api.droneagro.xyz';

interface Material {
  materialId: number;
  id?: number;
  materialType: string;
  materialName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
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

  const isSupplier = useMemo(
    () =>
      userRole === 'MATERIAL_SUPPLIER' ||
      userRole === 'materialSupplier' ||
      userRole === 'MANAGER' ||
      userRole === 'manager',
    [userRole],
  );

  const showToast = useCallback((kind: 'success' | 'error', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4200);
  }, []);

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
      showToast('success', 'Материал добавлен');
      if (created && typeof created.materialId !== 'undefined') {
        setMaterials((s) => [created, ...s]);
      } else {
        await fetchMaterials(page, limit);
      }
    } catch (e: any) {
      console.error('createMaterial error', e);
      showToast('error', e.message || 'Ошибка добавления материала');
    } finally {
      setSending(false);
      setAddOpen(false);
    }
  }

  async function updateMaterial(materialId: number, payload: any) {
    setSending(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      const res = await fetch(`${API_BASE}/api/materials/${materialId}`, {
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
          throw new Error('404 Not Found — материал не найден');
        throw new Error(body?.message || `Ошибка обновления: ${res.status}`);
      }
      const updated = await res.json();
      setMaterials((prev) =>
        prev.map((m) => (m.materialId === materialId ? updated : m)),
      );
      showToast('success', 'Материал успешно обновлен');
    } catch (e: any) {
      console.error('updateMaterial error', e);
      showToast('error', e.message || 'Ошибка обновления материала');
    } finally {
      setSending(false);
      setEditOpen(false);
      setEditingMaterial(null);
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
      showToast('success', `Материал #${materialId} удалён`);
    } catch (e: any) {
      console.error('deleteMaterial error', e);
      showToast('error', e.message || 'Ошибка удаления материала');
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return materials;
    const q = query.toLowerCase();
    return materials.filter((m) => {
      return (
        String(m.materialId ?? m.id)
          .toLowerCase()
          .includes(q) ||
        (m.materialName || '').toLowerCase().includes(q) ||
        (m.materialType || '').toLowerCase().includes(q) ||
        (m.status || '').toLowerCase().includes(q)
      );
    });
  }, [materials, query]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-emerald-50">
      <Header />
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-nekstmedium text-slate-900">
              Каталог материалов
            </h1>
            <div className="mt-1 text-sm text-slate-500">
              Управление материалами — добавление, редактирование, удаление.
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative group">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию, типу или ID..."
                className="pl-4 pr-10 py-2 w-72 rounded-full bg-white shadow-sm font-nekstregular
                 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400
                 focus:ring-2 focus:ring-emerald-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors">
                {query ? (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Очистить поиск"
                    className="p-1"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <Search size={18} />
                )}
              </div>
            </div>

            <button
              onClick={() => fetchMaterials(page, limit)}
              title="Обновить список"
              className="px-4 py-2 rounded-full bg-white shadow-md text-slate-700 inline-flex items-center gap-2 transition-all hover:shadow-xl font-nekstregular"
            >
              <RefreshCw size={18} className="text-slate-500" />
              <span className="text-sm">Обновить</span>
            </button>

            {isSupplier && (
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                 bg-emerald-600 text-white font-medium shadow-lg hover:scale-[1.04] transition-transform"
              >
                <Plus size={16} />
                <span className="text-sm font-nekstregular">
                  Добавить материал
                </span>
              </button>
            )}
          </div>
        </div>

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${toast.kind === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
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
              : filtered.map((m) => {
                  const id = m.materialId;
                  return (
                    <motion.article
                      key={id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 24,
                      }}
                      className="
                        relative rounded-3xl bg-white border border-slate-200
                        overflow-hidden transition-all duration-300
                        hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]
                      "
                    >
                      {/* Top zone */}
                      <div className="relative p-6 pb-4 bg-gradient-to-b from-slate-50 to-white">
                        <div className="flex items-start gap-5">
                          {/* Icon — LEFT */}
                          <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 ring-1 ring-emerald-200 shadow-sm shrink-0 flex items-center justify-center">
                            <Package size={40} className="text-emerald-600" />
                          </div>

                          {/* Info — RIGHT */}
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-slate-400 font-nekstregular tracking-wide">
                              MATERIAL #{id}
                            </div>

                            <h3 className="mt-1 text-lg text-slate-900 font-nekstmedium truncate">
                              {m.materialName || '—'}
                            </h3>

                            <p className="mt-2 text-sm text-slate-600 font-nekstregular truncate">
                              {m.materialType || '—'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="px-6 pb-4 grid grid-cols-2 gap-3">
                        <SpecPill
                          label="Количество"
                          value={
                            typeof m.amount !== 'undefined'
                              ? String(m.amount)
                              : '—'
                          }
                        />
                        <SpecPill label="Статус" value={m.status || '—'} />
                        <div className="col-span-2">
                          <SpecPill
                            label="Дата создания"
                            value={
                              m.createdAt
                                ? new Date(m.createdAt).toLocaleDateString()
                                : '—'
                            }
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end">
                        {isSupplier ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingMaterial(m);
                                setEditOpen(true);
                              }}
                              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center leading-none hover:bg-slate-50 transition"
                              aria-label="Редактировать"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() => deleteMaterial(id)}
                              disabled={deletingId === id}
                              className="w-9 h-9 rounded-lg border border-slate-200 text-red-600 flex items-center justify-center leading-none hover:bg-red-50 transition disabled:opacity-60"
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
          <MaterialModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onSubmit={createMaterial}
            sending={sending}
            title="Добавление материала"
          />
        )}

        {editOpen && isSupplier && editingMaterial && (
          <MaterialModal
            open={editOpen}
            material={editingMaterial}
            onClose={() => {
              setEditOpen(false);
              setEditingMaterial(null);
            }}
            onSubmit={(payload) =>
              updateMaterial(editingMaterial.materialId, payload)
            }
            sending={sending}
            title="Редактирование материала"
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

const SpecPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-slate-50 px-3 py-2">
    <div className="text-[11px] text-slate-400 font-nekstregular">{label}</div>
    <div className="text-sm font-semibold text-slate-800 font-nekstregular mt-1">
      {value}
    </div>
  </div>
);

/* -------------------- MaterialModal -------------------- */
interface MaterialModalProps {
  open: boolean;
  material?: Material;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  sending: boolean;
  title: string;
}

function MaterialModal({
  open,
  material,
  onClose,
  onSubmit,
  sending,
  title,
}: MaterialModalProps) {
  const [materialType, setMaterialType] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (open && material) {
      setMaterialType(material.materialType || '');
      setMaterialName(material.materialName || '');
      setAmount(material.amount ?? '');
      setStatus(material.status || '');
    } else if (!open) {
      setMaterialType('');
      setMaterialName('');
      setAmount('');
      setStatus('');
    }
  }, [open, material]);

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
            <div className="text-sm text-slate-500">
              {material ? 'Редактирование' : 'Новый материал'}
            </div>
            <div className="text-lg font-nekstmedium text-slate-900">
              {title}
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
          {material
            ? 'Обновите информацию о материале.'
            : 'Заполните тип и название — остальное можно оставить по умолчанию.'}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white text-slate-700 shadow-sm hover:shadow-md transition font-nekstregular"
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
            className={`px-4 py-2 rounded-full font-nekstregular text-white ${!canSend || sending ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all'}`}
          >
            {sending ? 'Отправка...' : material ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
