'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Trash2,
  Edit,
  Eye,
  Plus,
  Search,
  RefreshCw,
  MapPin,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';

/** ---------------------------
 *  Типы
 *  --------------------------- */
interface Request {
  id: number;
  date: string; // желаемая дата выполнения (YYYY-MM-DD)
  field: string;
  crop?: string;
  type: string;
  area?: number;
  status: 'new' | 'in_progress' | 'completed' | 'rejected';
  coords?: [number, number][];
  contactPhone?: string;
  wavelengthMode?: 'auto' | 'manual';
  wavelengths?: string;
  details?: {
    chemicals?: string;
    dosage?: string;
    droneType?: string;
    operatorNotes?: string;
  };
  metadata?: {
    name?: string;
    area?: string;
    parcels?: string;
    crop?: string;
    notes?: string;
  };
  preview?: {
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  };
}

interface FieldModel {
  fieldId: number;
  cadastralNumber?: string | null;
  mapFile?: string | null;
}

interface UserModel {
  id: number;
  email: string;
  phone?: string;
  userRole?: string;
  firstName?: string;
  lastName?: string;
  surname?: string;
  contractorProfile?: any;
}

/** ---------------------------
 *  Статические опции
 *  --------------------------- */
const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'in_progress', label: 'В обработке' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'rejected', label: 'Отклонённые' },
];
const treatmentOptions = [
  { value: 'all', label: 'Все' },
  { value: 'spraying', label: 'Опрыскивание' },
  { value: 'fertilization', label: 'Внесение удобрений' },
  { value: 'mapping', label: 'Картографирование' },
];

/** ---------------------------
 *  ModernSelect (ваша версия)
 *  --------------------------- */
const ModernSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="space-y-2" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          onClick={() => setIsOpen((s) => !s)}
          className={`w-full px-4 py-3.5 text-left bg-white/90 rounded-xl border ${
            isOpen
              ? 'border-emerald-400 ring-2 ring-emerald-400/30'
              : 'border-gray-300/80'
          } text-gray-800 shadow-sm flex items-center justify-between`}
        >
          <span
            className={
              value === options[0] ? 'text-gray-400/90' : 'text-gray-700'
            }
          >
            {value}
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-500 ${isOpen ? 'text-emerald-500' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute z-30 w-full mt-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80"
            >
              {options.map((opt, idx) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between ${
                    value === opt ? 'bg-emerald-50' : 'hover:bg-gray-50'
                  } ${idx === 0 ? '' : 'border-t border-gray-100'}`}
                >
                  <span className="text-gray-700">{opt}</span>
                  {value === opt && (
                    <Check size={16} className="text-emerald-500" />
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/** ---------------------------
 *  FieldUploader — принимает JSON (файл) и вызывает callback на родителя
 *  --------------------------- */
function FieldUploaderInline({
  initialPreview,
  onChangePreview,
  onChangeMetadata,
  onUploadJson,
}: {
  initialPreview?: {
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  };
  onChangePreview: (p: {
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  }) => void;
  onChangeMetadata: (m: Request['metadata'] | null) => void;
  // callback: передаём разобранный json и получаем Promise — родитель может отправить на бэк
  onUploadJson?: (json: any) => Promise<void> | void;
}) {
  const [jsonPreview, setJsonPreview] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onChangePreview({ fieldPreview: null, segmentsPreview: null });
  }, [onChangePreview]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleFile = async (file?: File) => {
    if (!file) {
      fileRef.current?.click();
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // имитация прогресса
      for (let i = 1; i <= 8; i++) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(60);
        setProgress(Math.round((i / 8) * 100));
      }
      setJsonPreview(parsed);

      // автозаполнение метаданных если есть
      const meta: Request['metadata'] = {
        name:
          parsed.name ?? parsed.cadastralNumber ?? parsed.title ?? undefined,
        area: parsed.area
          ? String(parsed.area)
          : (parsed.areaString ?? undefined),
        parcels: parsed.parcels ? String(parsed.parcels) : undefined,
        crop: parsed.crop ?? undefined,
        notes: parsed.notes ?? undefined,
      };
      onChangeMetadata(meta);

      // вызываем callback для отправки на сервер (placeholder endpoint)
      if (onUploadJson) {
        await onUploadJson(parsed);
      }
    } catch (err) {
      console.error('FieldUploaderInline parse error', err);
      onChangeMetadata(null);
      setJsonPreview(null);
      alert('Не удалось распарсить JSON файла поля.');
    } finally {
      setIsUploading(false);
      setProgress(100);
      await sleep(200);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
      <div className="rounded-xl border border-gray-100 p-3 bg-white/90">
        {!jsonPreview && (
          <div className="flex flex-col items-stretch gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="py-2 rounded-lg bg-emerald-500 text-white"
            >
              Выбрать JSON характеристик поля
            </button>
            <div className="text-sm text-gray-500">
              Загрузите JSON с описанием поля (cadastralNumber, area, parcels и
              т.д.).
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-2">
            <div className="text-sm text-gray-600">Загрузка...</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                style={{ width: `${progress}%` }}
                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
              />
            </div>
          </div>
        )}

        {jsonPreview && (
          <div className="mt-3">
            <pre className="max-h-36 overflow-auto text-xs bg-gray-50 p-2 rounded-md">
              {JSON.stringify(jsonPreview, null, 2)}
            </pre>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setJsonPreview(null);
                  onChangeMetadata(null);
                }}
                className="px-3 py-1 rounded-lg border"
              >
                Убрать
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** ---------------------------
 *  Главный компонент: RequestsWithEditor
 *  --------------------------- */
export default function RequestsWithEditor({
  setActiveMenu,
}: {
  setActiveMenu?: (s: string) => void;
}) {
  const API_BASE = 'https://droneagro.duckdns.org';

  // универсальная обёртка, добавляет Bearer если есть
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      // Content-Type ставим ТОЛЬКО если есть body и body не FormData
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const body = options.body as any;
    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;
    if (body && !isFormData) headers['Content-Type'] = 'application/json';

    const mergedHeaders = {
      ...(options.headers as Record<string, string>),
      ...headers,
    };
    return fetch(url, { ...options, headers: mergedHeaders });
  };

  const [status, setStatus] = useState('all');
  const [treatmentType, setTreatmentType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [requests, setRequests] = useState<Request[]>([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Загруженные поля и текущий контрактор
  const [fieldsList, setFieldsList] = useState<FieldModel[]>([]);
  const [contractor, setContractor] = useState<UserModel | null>(null);

  const [form, setForm] = useState({
    id: 0,
    date: '', // YYYY-MM-DD
    field: 'Выберите поле',
    selectedFieldId: -1 as number,
    type: 'Выберите тип обработки',
    status: 'new' as Request['status'],
    materialsProvided: false,
  });

  const [preview, setPreview] = useState<{
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  } | null>(null);
  const [metadata, setMetadata] = useState<Request['metadata'] | null>(null);

  // ---------- helpers for mapping / linking ----------
  const mapStatus = (s?: string): Request['status'] => {
    if (!s) return 'new';
    const low = String(s).toLowerCase();
    if (low.includes('complete') || low.includes('done')) return 'completed';
    if (
      low.includes('in_progress') ||
      low.includes('in progress') ||
      low.includes('progress')
    )
      return 'in_progress';
    if (
      low.includes('reject') ||
      low.includes('rejected') ||
      low.includes('denied')
    )
      return 'rejected';
    if (low.includes('new')) return 'new';
    return 'new';
  };

  const typeProcessIdToLabel = (id?: number) => {
    if (!id && id !== 0) return 'Неизвестно';
    if (id === 1) return 'Опрыскивание';
    if (id === 2) return 'Внесение удобрений';
    if (id === 3) return 'Картографирование';
    return 'Неизвестно';
  };

  const getLatestOrderId = async (): Promise<number | null> => {
    try {
      // fallback -> GET /api/orders
      const resOrders = await authFetch(
        `${API_BASE}/api/orders?page=1&limit=200`,
      );
      if (!resOrders.ok) return null;
      const dataOrders = await resOrders.json();
      const arr = Array.isArray(dataOrders.orders) ? dataOrders.orders : [];
      if (arr.length === 0) return null;
      const maxId = arr.reduce((acc: number, cur: any) => {
        const id = Number(cur.orderId ?? cur.id ?? 0);
        return Number.isFinite(id) ? Math.max(acc, id) : acc;
      }, 0);
      return maxId > 0 ? maxId : null;
    } catch (err) {
      console.error('getLatestOrderId error', err);
      return null;
    }
  };

  const attachFieldToOrder = async (orderId: number, fieldId: number) => {
    try {
      const res = await authFetch(
        `${API_BASE}/api/orders/${orderId}/fields/${fieldId}`,
        {
          method: 'POST',
        },
      );
      if (!res.ok) {
        console.warn(`attachFieldToOrder failed ${res.status}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('attachFieldToOrder error', err);
      return false;
    }
  };

  const activateOrder = async (orderId: number) => {
    try {
      const res = await authFetch(
        `${API_BASE}/api/orders/${orderId}/activate`,
        {
          method: 'POST',
        },
      );
      if (!res.ok) {
        console.warn(`activateOrder failed ${res.status}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('activateOrder error', err);
      return false;
    }
  };

  // improved deleteField with logging + fallback
  const deleteField = async (fieldId: number) => {
    if (!confirm(`Удалить поле #${fieldId}?`)) return;
    try {
      const urlField = `${API_BASE}/api/fields/${fieldId}`;
      console.info('deleteField: DELETE', urlField);
      const res = await authFetch(urlField, { method: 'DELETE' });
      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch {}
      console.info('deleteField response', res.status, bodyText);

      if (res.ok) {
        setFieldsList((prev) => prev.filter((f) => f.fieldId !== fieldId));
        if ((form as any).selectedFieldId === fieldId) {
          setForm((s) => ({
            ...s,
            selectedFieldId: -1,
            field: 'Выберите поле',
          }));
          setMetadata(null);
        }
        alert('Поле удалено');
        return;
      }

      // fallback: maybe backend deletes via /api/orders/{id} (as you saw in Postman)
      if ([400, 404, 405, 501].includes(res.status)) {
        try {
          const urlOrder = `${API_BASE}/api/orders/${fieldId}`;
          console.info('deleteField: trying fallback DELETE', urlOrder);
          const res2 = await authFetch(urlOrder, { method: 'DELETE' });
          let txt2 = '';
          try {
            txt2 = await res2.text();
          } catch {}
          console.info('deleteField fallback', res2.status, txt2);
          if (res2.ok) {
            setFieldsList((prev) => prev.filter((f) => f.fieldId !== fieldId));
            if ((form as any).selectedFieldId === fieldId) {
              setForm((s) => ({
                ...s,
                selectedFieldId: -1,
                field: 'Выберите поле',
              }));
              setMetadata(null);
            }
            alert('Поле удалено (через fallback /api/orders/{id})');
            return;
          }
        } catch (e) {
          console.warn('deleteField fallback error', e);
        }
      }

      alert(
        `Не удалось удалить поле. Сервер вернул ${res.status}. Смотри консоль.`,
      );
    } catch (err: any) {
      console.error('deleteField error', err);
      alert(
        'Не удалось отправить запрос на удаление. Проверьте консоль (CORS / network).',
      );
    }
  };

  const fetchFields = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/fields?page=1&limit=100`);
      if (!res.ok) throw new Error(`Ошибка получения полей (${res.status})`);
      const data = await res.json();
      setFieldsList(Array.isArray(data.fields) ? data.fields : []);
    } catch (err) {
      console.error('fetchFields error', err);
    }
  };

  const fetchContractorFromLocalStorage = async () => {
    try {
      const res = await authFetch(`${API_BASE}/v1/me`);
      if (!res.ok) {
        throw new Error(`Ошибка получения профиля (${res.status})`);
      }
      const data = await res.json();
      setContractor(data);
    } catch (err) {
      console.error('fetchContractor error', err);
    }
  };

  // fetch orders + for each order load field ids via GET /api/orders/{orderId}/fields
  const fetchOrders = async (page = 1, limit = 100) => {
    try {
      const res = await authFetch(
        `${API_BASE}/api/orders?page=${page}&limit=${limit}`,
      );
      if (!res.ok) {
        console.warn(`Ошибка получения заявок (${res.status})`);
        setRequests([]);
        return;
      }
      const data = await res.json();
      const arr = Array.isArray(data.orders) ? data.orders : [];

      // ensure fields list present (we need it to resolve names)
      if (fieldsList.length === 0) await fetchFields();

      // параллельно получаем field ids для каждого заказа
      const fieldsPerOrder = await Promise.all(
        arr.map(async (o: any) => {
          const orderId = Number(o.orderId ?? o.id ?? 0);
          if (!orderId) return { orderId: null, fieldIds: [] };
          try {
            const r = await authFetch(
              `${API_BASE}/api/orders/${orderId}/fields`,
            );
            if (!r.ok) return { orderId, fieldIds: [] };
            const d = await r.json();
            const ids = Array.isArray(d.fieldIds)
              ? d.fieldIds.map((x: any) => Number(x))
              : [];
            return { orderId, fieldIds: ids };
          } catch (e) {
            console.warn(
              'fetchOrders: get fields for order failed',
              orderId,
              e,
            );
            return { orderId, fieldIds: [] };
          }
        }),
      );

      const fieldsMap = new Map<number, number[]>();
      for (const it of fieldsPerOrder)
        if (it.orderId) fieldsMap.set(it.orderId, it.fieldIds);

      const mapped: Request[] = arr.map((o: any) => {
        const id = Number(
          o.orderId ?? o.id ?? Math.floor(Math.random() * 1000000),
        );
        const rawDate = o.dataStart ?? o.dataEnd ?? o.createdAt;
        const dateIso = rawDate
          ? new Date(rawDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);

        // try to resolve field name from fieldsMap -> fieldsList
        const linkedFieldIds = fieldsMap.get(id) ?? [];
        let fieldName = `Поле #${id}`;
        if (linkedFieldIds.length > 0) {
          const f = fieldsList.find((ff) => ff.fieldId === linkedFieldIds[0]);
          if (f) fieldName = f.cadastralNumber ?? `Поле #${f.fieldId}`;
          else fieldName = `Поле #${linkedFieldIds[0]}`;
        } else {
          // fallback to possible properties
          fieldName =
            o.fieldName ??
            o.field ??
            (o.metadata && o.metadata.name) ??
            `Поле #${o.fieldId ?? id}`;
        }

        const typeLabel = o.typeProcessId
          ? typeProcessIdToLabel(Number(o.typeProcessId))
          : (o.type ?? 'Неизвестно');
        const stat = mapStatus(o.status);
        const previewObj =
          o.preview ??
          (o.fieldPreview || o.segmentsPreview
            ? {
                fieldPreview: o.fieldPreview ?? null,
                segmentsPreview: o.segmentsPreview ?? null,
              }
            : undefined);
        const metadataObj =
          o.metadata ?? (o.extraMetadata ? o.extraMetadata : undefined);
        const coords = Array.isArray(o.coords) ? o.coords : [];

        return {
          id,
          date: dateIso,
          field: fieldName,
          type: typeLabel,
          status: stat,
          coords,
          contactPhone: o.contactPhone ?? undefined,
          wavelengthMode: o.wavelengthMode ?? 'auto',
          wavelengths: o.wavelengths ?? undefined,
          details: o.details ?? undefined,
          metadata: metadataObj ?? undefined,
          preview: previewObj ?? undefined,
        } as Request;
      });

      setRequests(mapped);
    } catch (err) {
      console.error('fetchOrders error', err);
      setRequests([]);
    }
  };

  useEffect(() => {
    fetchFields();
    fetchContractorFromLocalStorage();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingRequest) {
      setForm({
        id: editingRequest.id,
        date: editingRequest.date,
        field: editingRequest.field,
        selectedFieldId: -1,
        type: editingRequest.type,
        status: editingRequest.status,
        materialsProvided: true,
      });
      setPreview(editingRequest.preview ?? null);
      setMetadata(editingRequest.metadata ?? null);
    } else {
      setForm((s) => ({
        ...s,
        id: 0,
        date: new Date().toISOString().slice(0, 10),
        field: 'Выберите поле',
        selectedFieldId: -1,
        type: 'Выберите тип обработки',
        status: 'new',
        materialsProvided: false,
      }));
      setPreview(null);
      setMetadata(null);
    }
  }, [editingRequest, editorOpen]);

  const filtered = requests.filter((r) => {
    if (status !== 'all' && r.status !== status) return false;
    if (treatmentType !== 'all') {
      if (treatmentType === 'spraying' && !/опрыс/i.test(r.type.toLowerCase()))
        return false;
      if (
        treatmentType === 'fertilization' &&
        !/внес/i.test(r.type.toLowerCase())
      )
        return false;
      if (
        treatmentType === 'mapping' &&
        !/картограф/i.test(r.type.toLowerCase())
      )
        return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!String(r.id).includes(q) && !r.field.toLowerCase().includes(q))
        return false;
    }
    if (dateFrom && new Date(r.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(r.date) > new Date(dateTo)) return false;
    return true;
  });

  const openNew = () => {
    setIsNew(true);
    setEditingRequest(null);
    setEditorOpen(true);
    fetchFields();
    fetchContractorFromLocalStorage();
  };

  const openEdit = (r: Request) => {
    setIsNew(false);
    setEditingRequest(r);
    setEditorOpen(true);
  };

  const typeToId = (typeLabel: string) => {
    const normalized = typeLabel.toLowerCase();
    if (/опрыс/i.test(normalized)) return 1;
    if (/внес/i.test(normalized)) return 2;
    if (/картограф/i.test(normalized)) return 3;
    return 0;
  };

  const saveForm = async () => {
    if (
      !form.field ||
      form.field === 'Выберите поле' ||
      !form.type ||
      form.type === 'Выберите тип обработки'
    ) {
      alert('Выберите поле и тип обработки');
      return;
    }

    const payloadRequest: Request = {
      id: isNew ? Math.max(0, ...requests.map((x) => x.id)) + 1 : form.id,
      date: form.date,
      field: form.field,
      type: form.type,
      status: form.status,
      metadata: metadata ?? undefined,
      preview: preview ?? undefined,
    };

    setRequests((prev) => {
      if (isNew) return [payloadRequest, ...prev];
      return prev.map((p) => (p.id === payloadRequest.id ? payloadRequest : p));
    });

    try {
      const body: any = {
        typeProcessId: typeToId(form.type),
        status: 'In progress',
        dataStart: new Date(form.date).toISOString(),
        dataEnd: new Date(form.date).toISOString(),
        materialsProvided: Boolean(form.materialsProvided),
      };

      if (contractor?.id) body.contractorId = contractor.id;

      const res = await authFetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Ошибка сервера: ${res.status} ${txt}`);
      }

      const data = await res.json();
      let createdOrderId: number | null = data?.orderId
        ? Number(data.orderId)
        : null;

      if (!createdOrderId) {
        const latest = await getLatestOrderId();
        if (latest) createdOrderId = latest;
        else
          console.warn('Не удалось определить orderId после создания заказа');
      }

      if (createdOrderId) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === payloadRequest.id
              ? { ...r, id: createdOrderId as number }
              : r,
          ),
        );
      }

      const selFieldId = (form as any).selectedFieldId;
      if (createdOrderId && typeof selFieldId === 'number' && selFieldId >= 0) {
        const attached = await attachFieldToOrder(createdOrderId, selFieldId);
        if (!attached) console.warn('attachFieldToOrder failed');
        else {
          const activated = await activateOrder(createdOrderId);
          if (!activated) console.warn('activateOrder failed');
        }
      }

      alert('Заявка успешно отправлена менеджеру.');
      setEditorOpen(false);
      setEditingRequest(null);
      setIsNew(false);
      fetchOrders();
    } catch (err: any) {
      console.error('saveForm error', err);
      alert('Не удалось отправить заявку: ' + (err?.message ?? err));
    }
  };

  const deleteRequest = (id: number) => {
    if (!confirm('Удалить заявку?')) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setEditorOpen(false);
    setEditingRequest(null);
  };

  // helper for upload JSON from FieldUploaderInline — placeholder endpoint; you can change to real one later
  const handleUploadFieldJson = async (json: any) => {
    try {
      // placeholder endpoint — поменяй на реальный, когда бэк сделает
      const url = `${API_BASE}/api/fields/upload-json`;
      console.info('Uploading field json to', url);
      const res = await authFetch(url, {
        method: 'POST',
        body: JSON.stringify(json),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn('upload json failed', res.status, txt);
      } else {
        console.info('upload json ok');
        // опционально обновим список полей
        fetchFields();
      }
    } catch (e) {
      console.error('handleUploadFieldJson error', e);
    }
  };

  const [viewRequest, setViewRequest] = useState<Request | null>(null);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Мои заявки</h2>
            <div className="text-sm text-gray-500 mt-1">
              Управление заказами: создавайте, редактируйте и просматривайте.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-gray-100">
              Активных:{' '}
              <span className="font-semibold text-gray-900 ml-2">
                {requests.filter((r) => r.status !== 'completed').length}
              </span>
            </div>
            <button
              onClick={openNew}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow"
            >
              <Plus size={16} /> Новая заявка
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                Статус
              </label>
              <ModernSelect
                options={statusOptions.map((o) => o.label)}
                value={
                  statusOptions.find((o) => o.value === status)?.label || 'Все'
                }
                onChange={(label) => {
                  const opt = statusOptions.find((o) => o.label === label);
                  if (opt) setStatus(opt.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                Тип обработки
              </label>
              <ModernSelect
                options={treatmentOptions.map((o) => o.label)}
                value={
                  treatmentOptions.find((o) => o.value === treatmentType)
                    ?.label || 'Все'
                }
                onChange={(label) => {
                  const opt = treatmentOptions.find((o) => o.label === label);
                  if (opt) setTreatmentType(opt.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                Дата с
              </label>
              <input
                type="date"
                className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                Дата по
              </label>
              <input
                type="date"
                className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-black pointer-events-none z-10">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по номеру заявки или полю..."
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              className="p-3 bg-white/90 rounded-xl border border-gray-200 shadow-sm"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setStatus('all');
                setTreatmentType('all');
                setSearchQuery('');
              }}
            >
              <RefreshCw size={18} />
            </motion.button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Поле
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.field}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${request.status === 'completed' ? 'bg-green-100 text-green-800' : request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : request.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {request.status === 'completed'
                          ? 'Завершено'
                          : request.status === 'in_progress'
                            ? 'В обработке'
                            : request.status === 'new'
                              ? 'Новая'
                              : 'Отклонена'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-emerald-600 hover:text-emerald-900"
                          onClick={() => setViewRequest(request)}
                          title="Просмотр"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => openEdit(request)}
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        {(request.status === 'new' ||
                          request.status === 'in_progress') && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => deleteRequest(request.id)}
                            title="Удалить"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Показано <span className="font-medium">1</span> -{' '}
              <span className="font-medium">{filtered.length}</span> из{' '}
              <span className="font-medium">{requests.length}</span>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Назад
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Вперед
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {viewRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    Заявка #{viewRequest.id} •{' '}
                    {new Date(viewRequest.date).toLocaleDateString()}
                  </div>
                  <div className="text-lg font-semibold mt-1">
                    {viewRequest.field}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openEdit(viewRequest);
                      setViewRequest(null);
                    }}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => setViewRequest(null)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg"
                  >
                    Закрыть
                  </button>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>
                      <strong>Тип обработки:</strong> {viewRequest.type}
                    </div>
                    <div className="mt-1">
                      <strong>Площадь/Культура:</strong> —
                    </div>
                    {viewRequest.details?.chemicals && (
                      <div className="mt-1">
                        <strong>Средство:</strong>{' '}
                        {viewRequest.details.chemicals} (
                        {viewRequest.details.dosage})
                      </div>
                    )}
                    {viewRequest.details?.droneType && (
                      <div className="mt-1">
                        <strong>Техника:</strong>{' '}
                        {viewRequest.details.droneType}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    {viewRequest.preview?.fieldPreview ? (
                      <img
                        src={viewRequest.preview.fieldPreview}
                        alt="preview"
                        className="w-full h-60 object-cover"
                      />
                    ) : viewRequest.coords && viewRequest.coords.length > 0 ? (
                      <div className="p-6 text-sm text-gray-700">
                        <div className="font-medium mb-2">
                          Координаты участка
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          {viewRequest.coords.map((c, i) => (
                            <div key={i}>
                              [{c[0].toFixed(6)}, {c[1].toFixed(6)}]
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <MapPin
                          size={36}
                          className="mx-auto mb-2 text-gray-400"
                        />
                        <div>Координаты не указаны</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Можно загрузить фото участка в редакторе заявки.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500">Статус</div>
                    <div className="mt-2">
                      <span
                        className={`px-3 py-2 rounded-full text-sm ${viewRequest.status === 'completed' ? 'bg-green-100 text-green-800' : viewRequest.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : viewRequest.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {viewRequest.status === 'completed'
                          ? 'Завершено'
                          : viewRequest.status === 'in_progress'
                            ? 'В обработке'
                            : viewRequest.status === 'new'
                              ? 'Новая'
                              : 'Отклонена'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-gray-100">
                    <div className="text-xs text-gray-500">Дополнительно</div>
                    <div className="mt-2 text-sm text-gray-700">
                      Режим длин волн:{' '}
                      <strong>
                        {viewRequest.wavelengthMode === 'manual'
                          ? 'Пользовательские длины волн'
                          : 'Вычислить за меня'}
                      </strong>
                      {viewRequest.wavelengths && (
                        <div className="mt-2 text-xs text-gray-500">
                          Длины волн: {viewRequest.wavelengths}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  ID:{' '}
                  <span className="font-medium text-gray-700">
                    #{viewRequest.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openEdit(viewRequest);
                      setViewRequest(null);
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Открыть в редакторе
                  </button>
                  <button
                    onClick={() => setViewRequest(null)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editorOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-full md:w-[880px] z-50 bg-white shadow-2xl overflow-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-40">
              <div>
                <div className="text-sm text-gray-500">
                  {isNew ? 'Новая заявка' : `Редактирование заявки #${form.id}`}
                </div>
                <div className="text-lg font-semibold mt-1">{form.field}</div>
              </div>
              <div className="flex items-center gap-2">
                {!isNew && (
                  <button
                    onClick={() => deleteRequest(form.id)}
                    className="px-4 py-2 bg-white text-red-600 rounded-xl border border-red-100 hover:bg-red-50"
                  >
                    Удалить
                  </button>
                )}
                <button
                  onClick={() => {
                    saveForm();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg flex items-center gap-2"
                >
                  <Save size={16} /> Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    setEditingRequest(null);
                  }}
                  className="p-2 rounded-full bg-gray-100 ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white/90 rounded-2xl border border-gray-100 p-4">
                    <div className="flex gap-4 border-b border-gray-100 pb-3 mb-4">
                      <button
                        className={`pb-2 px-1 font-medium ${'details' === 'details' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                      >
                        Данные
                      </button>
                      <button
                        className={`pb-2 px-1 font-medium ${'upload' === 'upload' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                      >
                        Загрузка поля
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Поле (выбор по id) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Поле
                        </label>
                        <div className="relative flex items-center gap-2">
                          <select
                            value={form.selectedFieldId}
                            onChange={(e) => {
                              const id = Number(e.target.value);
                              const f = fieldsList.find(
                                (x) => x.fieldId === id,
                              );
                              setForm((s) => ({
                                ...s,
                                selectedFieldId: id,
                                field: f
                                  ? (f.cadastralNumber ?? `Поле ${f.fieldId}`)
                                  : 'Выберите поле',
                              }));
                              if (f)
                                setMetadata((m) => ({
                                  ...(m ?? {}),
                                  name: f.cadastralNumber ?? undefined,
                                }));
                            }}
                            className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                          >
                            <option value={-1}>Выберите поле</option>
                            {fieldsList.map((f) => (
                              <option key={f.fieldId} value={f.fieldId}>
                                {f.cadastralNumber ?? `Поле #${f.fieldId}`}
                              </option>
                            ))}
                          </select>

                          {/* кнопка удаления выбранного поля */}
                          {(form as any).selectedFieldId >= 0 && (
                            <button
                              onClick={() =>
                                deleteField((form as any).selectedFieldId)
                              }
                              className="p-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-100"
                              title="Удалить поле"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Тип обработки
                        </label>
                        <select
                          value={form.type}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, type: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        >
                          <option>Выберите тип обработки</option>
                          <option>Опрыскивание</option>
                          <option>Внесение удобрений</option>
                          <option>Картографирование</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Желаемая дата выполнения
                        </label>
                        <input
                          type="date"
                          value={form.date}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, date: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>

                      {/* materialsProvided */}
                      <div className="md:col-span-2 flex items-center gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.materialsProvided}
                            onChange={(e) =>
                              setForm((s) => ({
                                ...s,
                                materialsProvided: e.target.checked,
                              }))
                            }
                            className="form-checkbox h-5 w-5"
                          />
                          <span className="text-sm">
                            Материалы предоставлены
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 rounded-2xl border border-gray-100 p-4">
                    <FieldUploaderInline
                      initialPreview={preview ?? undefined}
                      onChangePreview={(p) => setPreview(p)}
                      onChangeMetadata={(m) => setMetadata(m ?? null)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <h4 className="font-medium mb-3">Информация о поле</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Участков</span>
                        <span className="font-medium">
                          {metadata?.parcels ?? '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Примечание</span>
                        <span className="font-medium">
                          {metadata?.notes ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <h4 className="font-medium mb-3">История обработок</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">Опрыскивание</div>
                            <div className="text-xs text-gray-500">
                              15.02.2024
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-emerald-100 rounded-full text-emerald-800">
                            Завершено
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">Картографирование</div>
                            <div className="text-xs text-gray-500">
                              10.02.2024
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-800">
                            Анализ
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    setEditingRequest(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  Отмена
                </button>
                <button
                  onClick={() => saveForm()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                >
                  Сохранить заявку
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
