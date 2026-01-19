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
  XCircle,
  Edit2,
} from 'lucide-react';
import {
  syncFieldMappings,
  getLocalId,
  addFieldMapping,
  removeFieldMapping,
  getDisplayId,
} from '../utils/fieldIdMapper';

/**
 * FieldsManager — customer variant with premium styles
 *
 * Fixes included:
 * - ESC closes modals (add / detail / edit / delete) unless an update is in progress
 * - clicking on a card opens a styled detail modal (like manager)
 * - edit icon is Edit2 (same as manager)
 * - AUTOFILL / AUTOFORMAT for cadastral number: 2:2:7:4 parts -> XX:XX:XXXXXXX:XXXX
 *
 * Fixes by assistant:
 * - remove duplicate file input inside visual uploadbtn (prevents multiple dialogs)
 * - reuse uploadbtn in edit modal
 * - stopPropagation on uploadbtn clicks to avoid accidental modal close / card click
 */

const API_BASE = 'https://api.droneagro.xyz';

type FieldItem = {
  fieldId: number;
  localId?: number;
  cadastralNumber: string;
  mapFile?: string | null;
};

// cadastral mask parts: 2:2:7:4 (example 12:34:1234567:8901)
const CAD_PARTS = [2, 2, 7, 4];
const CAD_MAX_DIGITS = CAD_PARTS.reduce((a, b) => a + b, 0);

function formatCadastralDigits(digits: string) {
  const parts: string[] = [];
  let idx = 0;
  for (const len of CAD_PARTS) {
    if (idx >= digits.length) break;
    parts.push(digits.slice(idx, idx + len));
    idx += len;
  }
  return parts.join(':');
}

function sanitizeAndFormat(input = '') {
  // remove non-digits, limit length, then format into parts with colons
  const digits = input.replace(/\D/g, '').slice(0, CAD_MAX_DIGITS);
  return formatCadastralDigits(digits);
}

export default function FieldsManager() {
  const [allFields, setAllFields] = useState<FieldItem[]>([]);
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [cadastral, setCadastral] = useState('');
  const [mapFileDataUrl, setMapFileDataUrl] = useState<string | null>(null);
  const [mapFileBase64, setMapFileBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // detail modal selected field
  const [selectedField, setSelectedField] = useState<FieldItem | null>(null);

  const [editingField, setEditingField] = useState<FieldItem | null>(null);
  const [editCadastral, setEditCadastral] = useState('');
  const [editMapFileDataUrl, setEditMapFileDataUrl] = useState<string | null>(
    null,
  );
  const [editMapFileBase64, setEditMapFileBase64] = useState<string | null>(
    null,
  );
  const editFileRef = useRef<HTMLInputElement | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notice, setNotice] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  const getAuthHeader = () => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('accessToken');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const start = (page - 1) * limit;
    const pageItems = allFields.slice(start, start + limit);
    setFields(pageItems);
    setTotalPages(Math.max(1, Math.ceil(allFields.length / limit)));
  }, [allFields, page, limit]);

  // ESC handler: close edit -> detail -> add -> delete (unless updating)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isUpdating) return; // don't interrupt active update
        if (editingField) {
          setEditingField(null);
          setEditCadastral('');
          setEditMapFileDataUrl(null);
          setEditMapFileBase64(null);
          return;
        }
        if (selectedField) {
          setSelectedField(null);
          return;
        }
        if (addOpen) {
          setAddOpen(false);
          return;
        }
        if (deletingId !== null) {
          setDeletingId(null);
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editingField, selectedField, addOpen, deletingId, isUpdating]);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4200);
  };

  async function fetchList() {
    setIsLoading(true);
    setFetchError(null);

    try {
      if (typeof window === 'undefined') {
        setAllFields([]);
        setIsLoading(false);
        return;
      }

      const rawUserId = localStorage.getItem('userId');
      if (!rawUserId) {
        setAllFields([]);
        setFetchError('userId отсутствует в localStorage');
        setIsLoading(false);
        return;
      }

      const userId = Number(rawUserId);
      if (!Number.isFinite(userId)) {
        setAllFields([]);
        setFetchError('Некорректный userId в localStorage');
        setIsLoading(false);
        return;
      }

      const qs = new URLSearchParams();
      qs.set('userId', String(userId));

      const res = await fetch(
        `${API_BASE}/api/fields-by-user?${qs.toString()}`,
        {
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          method: 'GET',
        },
      );

      if (!res.ok) {
        if (res.status === 403)
          throw new Error('403 Forbidden — проверьте токен / права доступа.');
        if (res.status === 404)
          throw new Error('404 Not Found — проверьте URL API.');
        const txt = await res.text().catch(() => null);
        throw new Error(`Ошибка: ${res.status} ${txt ?? ''}`);
      }

      const json = await res.json();
      let list: FieldItem[] = Array.isArray(json.fields) ? json.fields : [];

      const globalIds = list.map((f) => f.fieldId);
      syncFieldMappings(globalIds);

      list = list.map((f) => {
        const mf = (f as any).mapFile;
        const localId = getLocalId(f.fieldId);
        if (!mf) return { ...f, mapFile: null, localId: localId ?? undefined };
        if (typeof mf !== 'string')
          return { ...f, mapFile: null, localId: localId ?? undefined };
        const trimmed = mf.trim();
        if (trimmed.startsWith('data:'))
          return { ...f, mapFile: trimmed, localId: localId ?? undefined };
        return {
          ...f,
          mapFile: `data:image/png;base64,${trimmed}`,
          localId: localId ?? undefined,
        };
      });

      setAllFields(list);
      setPage(1);
    } catch (e: any) {
      console.error('fetchList error', e);
      setFetchError(e.message || 'Неизвестная ошибка при получении полей');
      setAllFields([]);
    } finally {
      setIsLoading(false);
    }
  }

  const fileToDataUrl = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = (err) => rej(err);
      r.readAsDataURL(f);
    });

  // HANDLE FILES
  const handleFilePick = async (file?: File | null) => {
    if (!file) {
      // open hidden input for add
      fileRef.current?.click();
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setMapFileDataUrl(dataUrl);
      const commaIndex = dataUrl.indexOf(',');
      const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
      setMapFileBase64(base64);
    } catch (err) {
      console.error(err);
      showNotice('err', 'Не удалось считать файл');
    }
  };

  const handleEditFilePick = async (file?: File | null) => {
    if (!file) {
      // open hidden input for edit
      editFileRef.current?.click();
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setEditMapFileDataUrl(dataUrl);
      const commaIndex = dataUrl.indexOf(',');
      const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
      setEditMapFileBase64(base64);
    } catch (err) {
      console.error(err);
      showNotice('err', 'Не удалось считать файл');
    }
  };

  const handleAdd = async () => {
    if (!cadastral.trim()) {
      showNotice('err', 'Укажите кадастровый номер');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        cadastralNumber: cadastral.trim(),
        mapFile: mapFileBase64,
      };
      const res = await fetch(`${API_BASE}/api/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      if (created && typeof created.fieldId !== 'undefined') {
        const mf = (created as any).mapFile;
        let displayMap: string | null = null;
        if (mf && typeof mf === 'string')
          displayMap = mf.startsWith('data:')
            ? mf
            : `data:image/png;base64,${mf}`;

        const localId = addFieldMapping(created.fieldId);

        const newItem: FieldItem = {
          fieldId: created.fieldId,
          localId,
          cadastralNumber: created.cadastralNumber || cadastral.trim(),
          mapFile: displayMap,
        };

        setAllFields((s) => [newItem, ...s]);
        showNotice('ok', 'Поле добавлено');
        setAddOpen(false);
        setCadastral('');
        setMapFileDataUrl(null);
        setMapFileBase64(null);
        if (fileRef.current) fileRef.current.value = '';
      } else {
        await fetchList();
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
  };

  const handleEditOpen = (field: FieldItem) => {
    setEditingField(field);
    // pre-format when opening editor
    setEditCadastral(sanitizeAndFormat(field.cadastralNumber || ''));
    setEditMapFileDataUrl(field.mapFile || null);
    setEditMapFileBase64(null);
  };

  const handleUpdate = async () => {
    if (!editingField) return;
    if (!editCadastral.trim()) {
      showNotice('err', 'Укажите кадастровый номер');
      return;
    }
    setIsUpdating(true);
    try {
      const payload: any = { cadastralNumber: editCadastral.trim() };
      if (editMapFileBase64) payload.mapFile = editMapFileBase64;

      const res = await fetch(
        `${API_BASE}/api/fields/${editingField.fieldId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403)
          throw new Error(
            '403 Forbidden — недостаточно прав или неверный токен',
          );
        if (res.status === 404)
          throw new Error('404 Not Found — поле не найдено');
        const msg = body?.message || `Ошибка сервера: ${res.status}`;
        throw new Error(msg);
      }

      setAllFields((prev) =>
        prev.map((f) =>
          f.fieldId === editingField.fieldId
            ? {
                ...f,
                cadastralNumber: editCadastral.trim(),
                mapFile: editMapFileBase64
                  ? editMapFileDataUrl || f.mapFile
                  : f.mapFile,
              }
            : f,
        ),
      );

      showNotice('ok', 'Поле обновлено');
      setEditingField(null);
      setEditCadastral('');
      setEditMapFileDataUrl(null);
      setEditMapFileBase64(null);
      if (editFileRef.current) editFileRef.current.value = '';
    } catch (e: any) {
      console.error('update field error', e);
      showNotice('err', e.message || 'Ошибка обновления поля');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/fields/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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

      removeFieldMapping(id);
      setAllFields((prev) => prev.filter((f) => f.fieldId !== id));
      setDeletingId(null);
      showNotice('ok', 'Поле удалено');
    } catch (e: any) {
      console.error('delete error', e);
      showNotice('err', e.message || 'Ошибка удаления');
    } finally {
      setIsDeleting(false);
    }
  };

  // uniform icon button class (small icon buttons)
  const iconBtn =
    'w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50';

  // ---------- cadastral input handlers ----------
  const onCadastralChange = (val: string) =>
    setCadastral(sanitizeAndFormat(val));
  const onEditCadastralChange = (val: string) =>
    setEditCadastral(sanitizeAndFormat(val));

  const onPasteDigitsOnly = (
    e: React.ClipboardEvent<HTMLInputElement>,
    setter: (v: string) => void,
  ) => {
    const text = e.clipboardData.getData('text');
    const sanitized = sanitizeAndFormat(text);
    e.preventDefault();
    setter(sanitized);
  };
  // ------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 font-nekstregular">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-nekstmedium">Поля</h2>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            Управление реестром полей — загрузка карт, добавление и удаление.
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => fetchList()}
            className="px-3 py-2 rounded-xl bg-white shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm md:text-base"
            title="Обновить"
          >
            <RefreshCw size={16} />{' '}
            <span className="hidden sm:inline">Обновить</span>
          </button>

          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow text-sm md:text-base"
          >
            <Plus size={16} />{' '}
            <span className="hidden sm:inline">Добавить поле</span>
            <span className="sm:hidden">Добавить</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            className={`mb-4 inline-block px-4 py-2 rounded-lg text-sm ${notice.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}
          >
            {notice.text}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl bg-white/60 p-4 md:p-6 h-64 md:h-72"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {fields.map((f) => (
            <div
              key={f.fieldId}
              onClick={() => setSelectedField(f)}
              role="button"
              tabIndex={0}
              className="relative rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-lg flex flex-col justify-between cursor-pointer hover:shadow-2xl transition-all duration-300"
            >
              <div>
                <div className="text-xs text-gray-400">
                  ID {f.localId ? `#${f.localId}` : getDisplayId(f.fieldId)}
                </div>
                <div className="text-base md:text-xl font-nekstmedium mt-2 break-all">
                  {f.cadastralNumber || '—'}
                </div>

                <div className="text-sm text-gray-600 mt-3 md:mt-4">
                  {f.mapFile ? (
                    <img
                      src={f.mapFile}
                      alt={`map-${f.fieldId}`}
                      className="w-full h-40 sm:h-48 md:h-60 object-cover rounded-2xl md:rounded-3xl shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-40 sm:h-48 md:h-60 rounded-2xl md:rounded-3xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2">
                      <XCircle size={32} className="md:w-12 md:h-12" />
                      <div className="font-medium text-sm md:text-base">
                        Изображение не загружено
                      </div>
                      <div className="text-xs text-gray-400 text-center px-4">
                        Нажмите "Редактировать", чтобы загрузить
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 md:mt-5">
                <div className="text-xs text-gray-500">&nbsp;</div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOpen(f);
                    }}
                    className={`${iconBtn}`}
                    title="Редактировать"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(f.fieldId);
                    }}
                    className={`${iconBtn}`}
                    title="Удалить"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
            className="px-3 py-2 rounded-lg bg-white shadow-inner"
          >
            {[6, 12, 24, 48].map((l) => (
              <option key={l} value={l}>
                {l} / стр
              </option>
            ))}
          </select>

          <div className="inline-flex items-center gap-2 bg-white rounded-lg px-2 py-1 shadow-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-md hover:bg-gray-50"
              title="Назад"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="px-3 text-sm font-medium">Стр. {page}</div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-md hover:bg-gray-50"
              title="Вперед"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add modal (styled) */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.25)] p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-nekstmedium">Добавить поле</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Укажите кадастровый номер и (опционально) загрузите карту
                    участка
                  </div>
                </div>
                <button
                  onClick={() => setAddOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:scale-105 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-sm text-gray-500 font-nekstmedium">
                    Кадастровый номер
                  </label>
                  <div className="relative">
                    <input
                      value={cadastral}
                      onChange={(e) => onCadastralChange(e.target.value)}
                      onPaste={(e) =>
                        onPasteDigitsOnly(e, (v) => setCadastral(v))
                      }
                      placeholder="12:34:1234567:8901"
                      className="w-full px-5 py-4 rounded-2xl bg-white font-nekstmedium text-gray-900 placeholder:text-gray-400 shadow-[0_10px_28px_rgba(0,0,0,0.08)] focus:shadow-[0_16px_40px_rgba(16,185,129,0.18)] focus:outline-none transition-all duration-300"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-500 font-nekstmedium">
                    Карта участка
                  </label>
                  <div className="rounded-3xl bg-gradient-to-br shadow-[0_12px_34px_rgba(0,0,0,0.00)] p-4">
                    {/* SINGLE HIDDEN INPUT for ADD */}
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
                      // visual uploadbtn (no nested file input)
                      <div
                        className="uploadbtn cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileRef.current?.click();
                        }}
                        role="button"
                        aria-label="Выбрать файл"
                      >
                        <div className="folder">
                          <div className="front-side">
                            <div className="tip"></div>
                            <div className="cover"></div>
                          </div>
                          <div className="back-side cover"></div>
                        </div>

                        <div className="custom-file-upload">
                          Выберите файл (PNG, JPG)
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={mapFileDataUrl}
                          alt="preview"
                          className="w-full h-72 object-cover rounded-2xl shadow-[0_18px_46px_rgba(0,0,0,0.18)]"
                        />
                        <button
                          onClick={() => {
                            setMapFileDataUrl(null);
                            setMapFileBase64(null);
                            if (fileRef.current) fileRef.current.value = '';
                          }}
                          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition"
                          aria-label="Удалить файл"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setAddOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-white shadow-sm hover:shadow transition"
                  >
                    Отменить
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleAdd}
                    className={`px-5 py-2.5 rounded-full inline-flex items-center gap-2 transition ${isSubmitting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_12px_30px_rgba(16,185,129,0.45)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.6)]'}`}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal (opens on card click) */}
      <AnimatePresence>
        {selectedField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-400">
                    ID #{selectedField.fieldId}
                  </div>
                  <h3 className="text-xl font-nekstmedium mt-1">
                    {selectedField.cadastralNumber || '—'}
                  </h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Просмотр карты и данных участка
                  </div>
                </div>

                <button
                  onClick={() => setSelectedField(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-6">
                <div>
                  {selectedField.mapFile ? (
                    <img
                      src={selectedField.mapFile}
                      alt={`map-large-${selectedField.fieldId}`}
                      className="w-full max-h-[520px] object-contain rounded-2xl shadow-sm bg-gray-50"
                    />
                  ) : (
                    <div className="w-full h-72 rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-3 text-gray-400">
                      <XCircle size={56} />
                      <div className="font-medium">Карта не загружена</div>
                      <div className="text-sm text-gray-400">
                        Добавьте карту, чтобы увидеть участок
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 justify-start">
                  <button
                    onClick={() => {
                      handleEditOpen(selectedField);
                      setSelectedField(null);
                    }}
                    className="w-full h-11 rounded-full bg-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Edit2 size={18} />
                    <span className="text-sm font-medium">Редактировать</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeletingId(selectedField.fieldId);
                      setSelectedField(null);
                    }}
                    className="w-full h-11 rounded-full bg-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-red-600"
                  >
                    <Trash2 size={18} />
                    <span className="text-sm font-medium">Удалить</span>
                  </button>

                  <button
                    onClick={() => setSelectedField(null)}
                    className="w-full h-11 rounded-full bg-gray-50 hover:bg-gray-100 transition text-sm font-medium"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal (styled) */}
      <AnimatePresence>
        {editingField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-xs text-gray-400">
                    ID{' '}
                    {editingField.localId
                      ? `#${editingField.localId}`
                      : getDisplayId(editingField.fieldId)}
                  </div>
                  <h3 className="text-lg font-nekstmedium mt-1">
                    Редактировать поле
                  </h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Измените кадастровый номер или загрузите новую карту участка
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingField(null);
                    setEditCadastral('');
                    setEditMapFileDataUrl(null);
                    setEditMapFileBase64(null);
                    if (editFileRef.current) editFileRef.current.value = '';
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Кадастровый номер
                  </label>
                  <input
                    value={editCadastral}
                    onChange={(e) => onEditCadastralChange(e.target.value)}
                    onPaste={(e) =>
                      onPasteDigitsOnly(e, (v) => setEditCadastral(v))
                    }
                    placeholder="12:34:1234567:8901"
                    className="w-full px-4 py-3 rounded-2xl font-nekstmedium bg-gray-50 outline-none focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] transition"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Карта участка
                  </label>
                  <div className="rounded-2xl p-4 flex flex-col gap-3 bg-gray-50">
                    {/* SINGLE HIDDEN INPUT for EDIT */}
                    <input
                      ref={editFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleEditFilePick(f);
                      }}
                    />

                    {!editMapFileDataUrl ? (
                      // visual uploadbtn for edit (reuse same markup)
                      <div
                        className="uploadbtn cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          editFileRef.current?.click();
                        }}
                        role="button"
                        aria-label="Загрузить новую карту"
                      >
                        <div className="folder">
                          <div className="front-side">
                            <div className="tip"></div>
                            <div className="cover"></div>
                          </div>
                          <div className="back-side cover"></div>
                        </div>

                        <div className="custom-file-upload">
                          Загрузить новую карту
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={editMapFileDataUrl}
                          alt="preview-edit"
                          className="w-full h-60 object-cover rounded-xl shadow-sm"
                        />
                        <button
                          onClick={() => {
                            setEditMapFileDataUrl(null);
                            setEditMapFileBase64(null);
                            if (editFileRef.current)
                              editFileRef.current.value = '';
                          }}
                          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {editMapFileBase64
                        ? 'Новое изображение будет загружено при сохранении'
                        : 'Загрузите новое изображение или оставьте текущее'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditingField(null);
                      setEditCadastral('');
                      setEditMapFileDataUrl(null);
                      setEditMapFileBase64(null);
                      if (editFileRef.current) editFileRef.current.value = '';
                    }}
                    className="px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md transition"
                  >
                    Отменить
                  </button>

                  <button
                    disabled={isUpdating}
                    onClick={handleUpdate}
                    className={`px-5 py-2 rounded-full inline-flex items-center gap-2 transition ${isUpdating ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow hover:shadow-lg'}`}
                  >
                    {isUpdating ? (
                      'Сохранение...'
                    ) : (
                      <>
                        <Edit2 size={14} /> Сохранить
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm (styled) */}
      <AnimatePresence>
        {deletingId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
            >
              <div className="text-lg font-nekstmedium mb-2">Удалить поле?</div>
              <div className="text-sm text-gray-600 mb-4">
                Вы действительно хотите удалить поле #{deletingId}? Действие
                необратимо.
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md transition"
                >
                  Отменить
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deletingId!)}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-full ${isDeleting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white shadow'}`}
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
