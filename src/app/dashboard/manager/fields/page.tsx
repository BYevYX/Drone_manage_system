'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  ImagePlus,
  X,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

/**
 * FieldsManager
 * - GET /api/fields?page=&limit=
 * - POST /api/fields  { cadastralNumber, mapFile }
 * - DELETE /api/fields/{fieldId}
 *
 * Uses access token from localStorage key 'access'
 */

const API_BASE = 'https://droneagro.duckdns.org';

type FieldItem = {
  fieldId: number;
  cadastralNumber: string;
  // mapFile here will be normalized for display as a data URL (or null)
  mapFile?: string | null;
};

export default function FieldsManager() {
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [cadastral, setCadastral] = useState('');
  // preview Data URL (for <img src=...>)
  const [mapFileDataUrl, setMapFileDataUrl] = useState<string | null>(null);
  // base64 without prefix — for sending to backend
  const [mapFileBase64, setMapFileBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notice, setNotice] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  // get token from localStorage 'access'
  const getAuthHeader = () => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('accessToken');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchList(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4200);
  };

  async function fetchList(p = 1, lim = 12) {
    setIsLoading(true);
    setFetchError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(p));
      qs.set('limit', String(lim));
      const res = await fetch(`${API_BASE}/api/fields?${qs.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        method: 'GET',
      });

      //   if (!res.ok) {
      //     if (res.status === 403)
      //       throw new Error('403 Forbidden — проверьте токен / права доступа.');
      //     if (res.status === 404)
      //       throw new Error('404 Not Found — проверьте URL API.');
      //     const txt = await res.text();
      //     throw new Error(`Ошибка: ${res.status} ${txt}`);
      //   }

      const json = await res.json();

      // API example: { fields: [ ... ] }
      let list: FieldItem[] = Array.isArray(json.fields) ? json.fields : [];

      // Normalize mapFile for display:
      // - if server returns data URL (startsWith 'data:'), keep it
      // - if server returns base64 only (no 'data:'), assume image/png and prefix
      list = list.map((f) => {
        const mf = f.mapFile;
        if (!mf) return { ...f, mapFile: null };
        if (typeof mf !== 'string') return { ...f, mapFile: null };
        const trimmed = mf.trim();
        if (trimmed.startsWith('data:')) {
          return { ...f, mapFile: trimmed };
        }
        // looks like raw base64 — add data URL prefix for preview
        return { ...f, mapFile: `data:image/png;base64,${trimmed}` };
      });

      setFields(list);

      // paging hints
      if (json.totalPages) {
        setTotalPages(json.totalPages);
      } else if (json.total) {
        setTotalPages(Math.max(1, Math.ceil(json.total / lim)));
      } else {
        setTotalPages(list.length < lim ? p : Math.max(1, p + 1));
      }
    } catch (e: any) {
      console.error('fetchList error', e);
      setFetchError(e.message || 'Неизвестная ошибка при получении полей');
    } finally {
      setIsLoading(false);
    }
  }

  // convert File -> dataURL
  const fileToDataUrl = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = (err) => rej(err);
      r.readAsDataURL(f);
    });

  const handleFilePick = async (file?: File | null) => {
    if (!file) {
      fileRef.current?.click();
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setMapFileDataUrl(dataUrl);

      // extract base64 part (after comma)
      const commaIndex = dataUrl.indexOf(',');
      const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
      setMapFileBase64(base64);
    } catch (err) {
      console.error(err);
      showNotice('err', 'Не удалось считать файл');
    }
  };

  async function handleAdd() {
    if (!cadastral.trim()) {
      showNotice('err', 'Укажите кадастровый номер');
      return;
    }
    if (!mapFileBase64) {
      showNotice('err', 'Загрузите карту (mapFile)');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        cadastralNumber: cadastral.trim(),
        // IMPORTANT: send raw base64 WITHOUT data: prefix
        mapFile: mapFileBase64,
      };

      const res = await fetch(`${API_BASE}/api/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403)
          throw new Error(
            '403 Forbidden — недостаточно прав или неверный токен',
          );
        if (res.status === 404)
          throw new Error('404 Not Found — проверьте путь POST /api/fields');
        const msg = body?.message || `Ошибка сервера: ${res.status}`;
        throw new Error(msg);
      }

      const created = await res.json();
      // server may return created.mapFile as base64 or data URL
      if (created && typeof created.fieldId !== 'undefined') {
        const mf = created.mapFile;
        let displayMap: string | null = null;
        if (mf && typeof mf === 'string') {
          displayMap = mf.startsWith('data:')
            ? mf
            : `data:image/png;base64,${mf}`;
        }

        const newItem: FieldItem = {
          fieldId: created.fieldId,
          cadastralNumber: created.cadastralNumber || cadastral.trim(),
          mapFile: displayMap,
        };

        setFields((s) => [newItem, ...s]);
        showNotice('ok', 'Поле добавлено');
        setAddOpen(false);
        setCadastral('');
        setMapFileDataUrl(null);
        setMapFileBase64(null);
      } else {
        await fetchList(page, limit);
        setAddOpen(false);
        showNotice(
          'ok',
          'Запрос отправлен — обновите страницу при необходимости',
        );
      }
    } catch (e: any) {
      console.error('add field error', e);
      showNotice('err', e.message || 'Ошибка добавления поля');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm(id: number) {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/fields/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!res.ok) {
        if (res.status === 403)
          throw new Error(
            '403 Forbidden — недостаточно прав или неверный токен',
          );
        if (res.status === 404)
          throw new Error('404 Not Found — поле не найдено');
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Ошибка удаления: ${res.status}`);
      }

      setFields((prev) => prev.filter((f) => f.fieldId !== id));
      setDeletingId(null);
      showNotice('ok', 'Поле удалено');
    } catch (e: any) {
      console.error('delete error', e);
      showNotice('err', e.message || 'Ошибка удаления');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Поля</h2>
          <div className="text-sm text-gray-500 mt-1">
            Управление реестром полей — загрузка карт, добавление и удаление.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchList(page, limit)}
            className="px-3 py-2 rounded-xl bg-white border shadow-sm hover:bg-gray-50 flex items-center gap-2"
            title="Обновить"
          >
            <RefreshCw size={16} /> Обновить
          </button>

          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow"
          >
            <Plus size={16} /> Добавить поле
          </button>
        </div>
      </div>

      {/* notice */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            className={`mb-4 inline-block px-4 py-2 rounded-lg text-sm ${
              notice.type === 'ok'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {notice.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* errors / loading */}
      {fetchError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white/60 border border-gray-100 p-4 h-36"
              />
            ))
          : fields.map((f) => (
              <div
                key={f.fieldId}
                className="relative rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs text-gray-400">ID #{f.fieldId}</div>
                  <div className="text-lg font-semibold mt-1">
                    {f.cadastralNumber || '—'}
                  </div>

                  <div className="text-sm text-gray-600 mt-3 line-clamp-3">
                    {f.mapFile ? (
                      <img
                        src={f.mapFile}
                        alt={`map-${f.fieldId}`}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="text-gray-400 italic">
                        Карта не загружена
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500">
                    {/* placeholder */}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDeletingId(f.fieldId);
                      }}
                      className="px-3 py-1 rounded-full bg-white border text-red-600 hover:bg-red-50"
                      title="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* footer pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Показано <span className="font-medium">{fields.length}</span> полей на
          странице
        </div>

        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border bg-white"
          >
            {[6, 12, 24, 48].map((l) => (
              <option key={l} value={l}>
                {l} / стр
              </option>
            ))}
          </select>

          <div className="inline-flex items-center gap-2 bg-white border rounded-lg px-2 py-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-md hover:bg-gray-50"
              title="Назад"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="px-3 text-sm font-medium">Стр. {page}</div>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-md hover:bg-gray-50"
              title="Вперед"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Добавить поле</h3>
                  <div className="text-sm text-gray-500">
                    Укажите кадастровый номер и загрузите карту участка.
                  </div>
                </div>
                <button
                  onClick={() => setAddOpen(false)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Кадастровый номер
                  </label>
                  <input
                    value={cadastral}
                    onChange={(e) => setCadastral(e.target.value)}
                    placeholder="Например: 50:04:012345:678"
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                  />

                  <div className="mt-4">
                    <label className="text-sm text-gray-600 block mb-1">
                      Карта участка
                    </label>
                    <div className="rounded-xl border border-dashed p-4 flex flex-col items-stretch gap-3">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFilePick(f);
                        }}
                      />

                      {!mapFileDataUrl ? (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="flex items-center gap-2 justify-center py-3 rounded-lg bg-indigo-50 border hover:bg-indigo-100"
                        >
                          <ImagePlus size={18} /> Загрузить изображение (jpg,
                          png)
                        </button>
                      ) : (
                        <div className="relative">
                          <img
                            src={mapFileDataUrl}
                            alt="preview"
                            className="w-full h-44 object-cover rounded-md border"
                          />
                          <button
                            onClick={() => {
                              setMapFileDataUrl(null);
                              setMapFileBase64(null);
                              if (fileRef.current) fileRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow"
                            title="Удалить"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Поддерживаются изображения. Файл будет отправлен как
                        base64 (без префикса).
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Параметры</div>

                    <div className="text-sm text-gray-700">
                      <div className="mb-3">
                        <div className="text-xs text-gray-500">
                          ID (будет создан автоматически)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setAddOpen(false)}
                      className="px-4 py-2 rounded-full border"
                    >
                      Отменить
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={handleAdd}
                      className={`px-4 py-2 rounded-full inline-flex items-center gap-2 ${isSubmitting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white'}`}
                    >
                      {isSubmitting ? (
                        'Отправка...'
                      ) : (
                        <>
                          <Plus size={14} /> Создать
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deletingId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              className="w-full max-w-md bg-white rounded-2xl border p-6"
            >
              <div className="text-lg font-semibold mb-2">Удалить поле?</div>
              <div className="text-sm text-gray-600 mb-4">
                Вы действительно хотите удалить поле #{deletingId}? Действие
                необратимо.
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-full border"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deletingId!)}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-full ${isDeleting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white'}`}
                >
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
