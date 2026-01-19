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
  Edit2,
  XCircle,
} from 'lucide-react';

/**
 * FieldsManager — final polish
 * - edit modal: only cadastral + map
 * - cancel buttons borderless (no visible border)
 * - cadastral input auto-formats to pattern: ХХ:ХХ:ХХХХХХХ:ХХХХ (2:2:7:4)
 */

const API_BASE = 'https://api.droneagro.xyz';

type FieldItem = {
  fieldId: number;
  cadastralNumber: string;
  mapFile?: string | null;
};

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
  const digits = input.replace(/\D/g, '').slice(0, CAD_MAX_DIGITS);
  return formatCadastralDigits(digits);
}

export default function FieldsManager() {
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [cadastral, setCadastral] = useState('');
  const [mapFileDataUrl, setMapFileDataUrl] = useState<string | null>(null);
  const [mapFileBase64, setMapFileBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notice, setNotice] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  const [selectedField, setSelectedField] = useState<FieldItem | null>(null);

  const [editOpen, setEditOpen] = useState(false);
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

  // ESC handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isUpdating) return;
        if (editOpen) {
          setEditOpen(false);
          setEditingField(null);
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
  }, [editOpen, selectedField, addOpen, deletingId, isUpdating]);

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
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        method: 'GET',
      });

      const json = await res.json();
      let list: FieldItem[] = Array.isArray(json.fields) ? json.fields : [];
      list = list.map((f) => {
        const mf = f.mapFile;
        if (!mf) return { ...f, mapFile: null };
        if (typeof mf !== 'string') return { ...f, mapFile: null };
        const trimmed = mf.trim();
        if (trimmed.startsWith('data:')) return { ...f, mapFile: trimmed };
        return { ...f, mapFile: `data:image/png;base64,${trimmed}` };
      });

      setFields(list);
    } catch (e: any) {
      console.error('fetchList error', e);
      setFetchError(e.message || 'Неизвестная ошибка при получении полей');
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

  const handleFilePick = async (file?: File | null) => {
    if (!file) {
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
        mapFile: mapFileBase64,
      };
      const res = await fetch(`${API_BASE}/api/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Ошибка при добавлении: ${res.status}`);
      const created = await res.json();
      const mf = created?.mapFile;
      const displayMap =
        mf && typeof mf === 'string'
          ? mf.startsWith('data:')
            ? mf
            : `data:image/png;base64,${mf}`
          : null;
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
    } catch (e: any) {
      console.error(e);
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
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      if (!res.ok) throw new Error(`Ошибка при удалении: ${res.status}`);
      setFields((prev) => prev.filter((f) => f.fieldId !== id));
      setDeletingId(null);
      showNotice('ok', 'Поле удалено');
    } catch (e: any) {
      console.error(e);
      showNotice('err', e.message || 'Ошибка удаления');
    } finally {
      setIsDeleting(false);
    }
  }

  function openEdit(field: FieldItem) {
    setEditingField(field);
    setEditCadastral(
      field.cadastralNumber ? sanitizeAndFormat(field.cadastralNumber) : '',
    );
    setEditMapFileDataUrl(field.mapFile || null);
    setEditMapFileBase64(null);
    setEditOpen(true);
  }

  async function handleUpdate(fieldId: number) {
    if (!editCadastral.trim()) {
      showNotice('err', 'Кадастровый номер не может быть пустым');
      return;
    }
    setIsUpdating(true);
    try {
      const payload: any = { cadastralNumber: editCadastral.trim() };
      if (editMapFileBase64) payload.mapFile = editMapFileBase64;
      const res = await fetch(`${API_BASE}/api/fields/${fieldId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Ошибка при обновлении: ${res.status}`);
      const updated = await res.json();
      setFields((prev) =>
        prev.map((f) => {
          if (f.fieldId !== fieldId) return f;
          const mf = updated.mapFile;
          const displayMap = mf
            ? mf.startsWith('data:')
              ? mf
              : `data:image/png;base64,${mf}`
            : null;
          return {
            ...f,
            cadastralNumber: updated.cadastralNumber ?? editCadastral.trim(),
            mapFile: displayMap ?? f.mapFile,
          };
        }),
      );
      showNotice('ok', 'Поле обновлено');
      setEditOpen(false);
      setEditingField(null);
    } catch (e: any) {
      console.error(e);
      showNotice('err', e.message || 'Ошибка обновления');
    } finally {
      setIsUpdating(false);
    }
  }

  const iconBtn =
    'w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50';

  // masked handlers
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
            onClick={() => fetchList(page, limit)}
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

      {fetchError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {isLoading
          ? Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl md:rounded-3xl bg-white/60 p-4 h-64 md:h-72"
              />
            ))
          : fields.map((f) => (
              <div
                key={f.fieldId}
                onClick={() => setSelectedField(f)}
                role="button"
                tabIndex={0}
                className="relative rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-lg flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
              >
                <div>
                  <div className="text-xs text-gray-400">ID #{f.fieldId}</div>
                  <div className="text-base md:text-lg font-nekstmedium mt-1 break-all">
                    {f.cadastralNumber || '—'}
                  </div>

                  <div className="text-sm text-gray-600 mt-3">
                    {f.mapFile ? (
                      <img
                        src={f.mapFile}
                        alt={`map-${f.fieldId}`}
                        className="w-full h-40 sm:h-48 md:h-60 object-cover rounded-xl shadow-sm"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-48 md:h-60 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <XCircle size={32} className="md:w-12 md:h-12" />
                        <div className="font-medium text-sm md:text-base text-center px-2">
                          Карта не загружена
                        </div>
                        <div className="text-xs text-gray-400 text-center px-4">
                          Загрузите карту
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500">&nbsp;</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(f);
                      }}
                      className={iconBtn}
                      title="Редактировать"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(f.fieldId);
                      }}
                      className={iconBtn}
                      title="Удалить"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* pagination simplified */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Показано <span className="font-medium">{fields.length}</span> полей
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
          <div className="inline-flex items-center gap-2 bg-white rounded-lg px-2 py-1 shadow-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="px-3 text-sm font-medium">Стр. {page}</div>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-md hover:bg-gray-50"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.25)] p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-nekstmedium">Добавить поле</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Укажите кадастровый номер и загрузите карту участка
                  </div>
                </div>
                <button
                  onClick={() => setAddOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:scale-105 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Кадастровый номер */}
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
                      className="
                  w-full px-5 py-4 rounded-2xl
                  bg-white
                  font-nekstmedium
                  text-gray-900
                  placeholder:text-gray-400

                  shadow-[0_10px_28px_rgba(0,0,0,0.08)]
                  focus:shadow-[0_16px_40px_rgba(16,185,129,0.28)]
                  focus:outline-none

                  transition-all duration-300
                "
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
                  </div>
                </div>

                {/* Карта */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-500 font-nekstmedium">
                    Карта участка
                  </label>

                  <div
                    className="
                rounded-3xl
                bg-gradient-to-br from-gray-50 to-white
                shadow-[0_12px_34px_rgba(0,0,0,0.08)]
                p-4
              "
                  >
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
                        className="
                    w-full h-56
                    rounded-2xl
                    flex flex-col items-center justify-center gap-3

                    bg-white
                    shadow-inner
                    hover:shadow-[0_14px_36px_rgba(0,0,0,0.1)]

                    transition
                  "
                      >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <ImagePlus size={26} className="text-emerald-600" />
                        </div>
                        <div className="font-nekstmedium text-gray-700">
                          Загрузить изображение
                        </div>
                        <div className="text-xs text-gray-400">JPG / PNG</div>
                      </button>
                    ) : (
                      <div className="relative">
                        <img
                          src={mapFileDataUrl}
                          alt="preview"
                          className="
                      w-full h-72
                      object-cover
                      rounded-2xl
                      shadow-[0_18px_46px_rgba(0,0,0,0.18)]
                    "
                        />
                        <button
                          onClick={() => {
                            setMapFileDataUrl(null);
                            setMapFileBase64(null);
                            if (fileRef.current) fileRef.current.value = '';
                          }}
                          className="
                      absolute top-4 right-4
                      w-11 h-11
                      rounded-full
                      bg-white
                      shadow-lg
                      flex items-center justify-center
                      hover:scale-105
                      transition
                    "
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
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
                    className={`
                px-5 py-2.5 rounded-full inline-flex items-center gap-2
                transition
                ${
                  isSubmitting
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_12px_30px_rgba(16,185,129,0.45)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.6)]'
                }
              `}
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

      {/* Detail modal */}
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

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-6">
                {/* Map */}
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

                {/* Actions */}
                <div className="flex flex-col gap-3 justify-start">
                  <button
                    onClick={() => {
                      openEdit(selectedField);
                      setSelectedField(null);
                    }}
                    className="w-full h-11 rounded-full bg-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Edit2 size={18} />
                    <span className="text-sm font-medium">Редактировать</span>
                  </button>

                  <button
                    onClick={() => setDeletingId(selectedField.fieldId)}
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

      {/* Edit modal (simplified) */}
      {/* Edit modal */}
      <AnimatePresence>
        {editOpen && editingField && (
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
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-xs text-gray-400">
                    ID #{editingField.fieldId}
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
                    setEditOpen(false);
                    setEditingField(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 gap-5">
                {/* Cadastral */}
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
                    placeholder="Например: 12:34:1234567:8901"
                    className="w-full px-4 py-3 rounded-xl font-nekstmedium bg-gray-50 outline-none focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition"
                  />
                </div>

                {/* Map */}
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Карта участка
                  </label>

                  <div className="rounded-2xl p-4 flex flex-col gap-3 bg-gray-50">
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
                      <button
                        onClick={() => editFileRef.current?.click()}
                        className="flex items-center gap-2 justify-center py-6 rounded-xl bg-white shadow-sm hover:shadow-md transition"
                      >
                        <ImagePlus size={18} />
                        <span className="text-sm font-medium">
                          Загрузить новую карту
                        </span>
                      </button>
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
                      Если не загружать — текущая карта останется без изменений
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditOpen(false);
                      setEditingField(null);
                    }}
                    className="px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md transition"
                  >
                    Отменить
                  </button>

                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdate(editingField.fieldId)}
                    className={`px-5 py-2 rounded-full inline-flex items-center gap-2 transition ${
                      isUpdating
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow hover:shadow-lg'
                    }`}
                  >
                    {isUpdating ? (
                      'Обновление...'
                    ) : (
                      <>
                        <Edit2 size={14} />
                        Сохранить
                      </>
                    )}
                  </button>
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
                  className="px-4 py-2 rounded-full shadow-sm bg-white"
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
