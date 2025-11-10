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

/** Types */
interface Request {
  id: number;
  date: string;
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
    analyticsResponse?: any;
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

/** Static options */
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

/** small helper */
const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

/** ModernSelect (compact) */
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
          className={cn(
            'w-full px-4 py-3.5 text-left bg-white/90 rounded-xl border text-gray-800 shadow-sm flex items-center justify-between',
            isOpen
              ? 'border-emerald-400 ring-2 ring-emerald-400/30'
              : 'border-gray-300/80',
          )}
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
            className={cn('text-gray-500', isOpen && 'text-emerald-500')}
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
                  className={cn(
                    'px-4 py-2.5 cursor-pointer flex items-center justify-between',
                    value === opt ? 'bg-emerald-50' : 'hover:bg-gray-50',
                    idx === 0 ? '' : 'border-t border-gray-100',
                  )}
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

function FieldUploaderInline({
  initialPreview,
  onChangePreview,
  onChangeMetadata,
  onParsedJson,
}: {
  initialPreview?:
    | { fieldPreview?: string | null; segmentsPreview?: string | null }
    | undefined;
  onChangePreview: (p: {
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  }) => void;
  onChangeMetadata: (m: Request['metadata'] | null) => void;
  onParsedJson?: (json: any | null) => void;
}) {
  const [jsonPreview, setJsonPreview] = useState<any | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(
    () => onChangePreview({ fieldPreview: null, segmentsPreview: null }),
    [onChangePreview],
  );

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleFile = async (file?: File) => {
    if (!file) {
      fileRef.current?.click();
      return;
    }
    setIsParsing(true);
    setProgress(0);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      for (let i = 1; i <= 6; i++) {
        // UX progress
        // eslint-disable-next-line no-await-in-loop
        await sleep(30);
        setProgress(Math.round((i / 6) * 100));
      }
      setJsonPreview(parsed);
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
      if (onParsedJson) onParsedJson(parsed);
    } catch (err) {
      console.error('FieldUploaderInline parse error', err);
      onChangeMetadata(null);
      setJsonPreview(null);
      if (onParsedJson) onParsedJson(null);
      alert('Не удалось распарсить JSON файла поля.');
    } finally {
      setIsParsing(false);
      setProgress(100);
      await sleep(120);
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
              Загрузите JSON с описанием поля (он будет отправлен в неизменном
              виде при сохранении заявки).
            </div>
          </div>
        )}

        {isParsing && (
          <div className="mt-2">
            <div className="text-sm text-gray-600">Парсинг файла...</div>
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
                  if (onParsedJson) onParsedJson(null);
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

/** Main component */
export default function RequestsWithEditor({
  setActiveMenu,
}: {
  setActiveMenu?: (s: string) => void;
}) {
  const API_BASE = 'https://droneagro.duckdns.org';

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const body = options.body as any;
    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;
    if (body && !isFormData) headers['Content-Type'] = 'application/json';
    const merged = {
      ...(options.headers as Record<string, string>),
      ...headers,
    };
    return fetch(url, { ...options, headers: merged });
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
  const [fieldsList, setFieldsList] = useState<FieldModel[]>([]);
  const [contractor, setContractor] = useState<UserModel | null>(null);

  const [form, setForm] = useState({
    id: 0,
    date: '',
    field: 'Выберите поле',
    selectedFieldId: -1 as number,
    type: 'Выберите тип обработки',
    status: 'new' as Request['status'],
    materialsProvided: false, // radio choice kept, but manual inputs removed
  });

  // pending parsed JSON from uploader (kept as-is, will be sent unchanged)
  const [pendingJson, setPendingJson] = useState<any | null>(null);
  const [preview, setPreview] = useState<{
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  } | null>(null);
  const [metadata, setMetadata] = useState<Request['metadata'] | null>(null);
  const [viewRequest, setViewRequest] = useState<Request | null>(null);

  // helpers
  const mapStatus = (s?: string): Request['status'] => {
    if (!s) return 'new';
    const low = String(s).toLowerCase();
    if (/complete|done/.test(low)) return 'completed';
    if (/in[_\s]?progress|progress/.test(low)) return 'in_progress';
    if (/reject|denied/.test(low)) return 'rejected';
    if (/new/.test(low)) return 'new';
    return 'new';
  };
  const typeProcessIdToLabel = (id?: number) =>
    id === 1
      ? 'Опрыскивание'
      : id === 2
        ? 'Внесение удобрений'
        : id === 3
          ? 'Картографирование'
          : 'Неизвестно';
  const typeToId = (typeLabel: string) => {
    const n = typeLabel.toLowerCase();
    if (/опрыс/i.test(n)) return 1;
    if (/внес/i.test(n)) return 2;
    if (/картограф/i.test(n)) return 3;
    return 0;
  };
  const renderStatusBadge = (st: Request['status']) =>
    st === 'completed'
      ? { text: 'Завершено', cls: 'bg-green-100 text-green-800' }
      : st === 'in_progress'
        ? { text: 'В обработке', cls: 'bg-blue-100 text-blue-800' }
        : st === 'new'
          ? { text: 'Новая', cls: 'bg-yellow-100 text-yellow-800' }
          : { text: 'Отклонена', cls: 'bg-red-100 text-red-800' };

  // API helpers
  const fetchFields = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await authFetch(
        `${API_BASE}/api/fields-by-user?userId=${userId}`,
      );
      if (!res.ok) throw new Error(`Ошибка получения полей (${res.status})`);
      const data = await res.json();
      setFieldsList(Array.isArray(data.fields) ? data.fields : []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchContractorFromLocalStorage = async () => {
    try {
      const res = await authFetch(`${API_BASE}/v1/me`);
      if (!res.ok) throw new Error(`Ошибка получения профиля (${res.status})`);
      const data = await res.json();
      setContractor(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrderFields = async (orderId: number): Promise<number[]> => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await authFetch(`${API_BASE}/api/orders/${orderId}/fields`);
      if (!res.ok) return [];
      const d = await res.json();
      if (Array.isArray(d.fieldIds))
        return d.fieldIds.map((n: any) => Number(n)).filter(Number.isFinite);
      if (Array.isArray(d.fields))
        return d.fields
          .map((f: any) => Number(f.fieldId ?? f.id ?? f))
          .filter(Number.isFinite);
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const fetchOrders = async (page = 1, limit = 100) => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await authFetch(`${API_BASE}/api/orders/${userId}`);
      if (!res.ok) {
        console.warn(`Ошибка получения заявок (${res.status})`);
        setRequests([]);
        return;
      }
      const data = await res.json();
      const arr = Array.isArray(data.orders) ? data.orders : [];
      const baseRequests: Request[] = arr.map((o: any) => {
        const id = Number(o.orderId ?? o.id ?? Math.floor(Math.random() * 1e6));
        const rawDate = o.dataStart ?? o.dataEnd ?? o.createdAt;
        const dateIso = rawDate
          ? new Date(rawDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);
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
        const initialFieldName =
          o.fieldName ??
          o.field ??
          (o.metadata && o.metadata.name) ??
          `ID:${o.fieldId ?? id}`;
        return {
          id,
          date: dateIso,
          field: initialFieldName,
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
      setRequests(baseRequests);

      const updates = await Promise.all(
        baseRequests.map(async (r) => {
          const fids = await fetchOrderFields(r.id);
          if (!fids.length) return null;
          const fid = fids[0];
          const f = fieldsList.find((x) => x.fieldId === fid);
          const name = f
            ? (f.cadastralNumber ?? `ID: #${f.fieldId}`)
            : `ID: #${fid}`;
          return { orderId: r.id, fieldId: fid, name };
        }),
      );

      const updated = baseRequests.map((r) => {
        const u = updates.find((x) => x && x.orderId === r.id) as any;
        if (!u) return r;
        return {
          ...r,
          field: u.name,
          metadata: { ...(r.metadata ?? {}), name: u.name },
        };
      });
      setRequests(updated);
    } catch (e) {
      console.error(e);
      setRequests([]);
    }
  };

  const getLatestOrderId = async (): Promise<number | null> => {
    try {
      const res = await authFetch(`${API_BASE}/api/orders?page=1&limit=200`);
      if (!res.ok) return null;
      const data = await res.json();
      const arr = Array.isArray(data.orders) ? data.orders : [];
      if (!arr.length) return null;
      const maxId = arr.reduce((acc: number, cur: any) => {
        const id = Number(cur.orderId ?? cur.id ?? 0);
        return Number.isFinite(id) ? Math.max(acc, id) : acc;
      }, 0);
      return maxId > 0 ? maxId : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const attachFieldToOrder = async (orderId: number, fieldId: number) => {
    try {
      const res = await authFetch(
        `${API_BASE}/api/orders/${orderId}/fields/${fieldId}`,
        { method: 'POST' },
      );
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  };
  const activateOrder = async (orderId: number) => {
    try {
      const res = await authFetch(
        `${API_BASE}/api/orders/${orderId}/activate`,
        { method: 'POST' },
      );
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteField = async (fieldId: number) => {
    if (!confirm(`Удалить поле #${fieldId}?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/orders/${fieldId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFieldsList((p) => p.filter((f) => f.fieldId !== fieldId));
        if ((form as any).selectedFieldId === fieldId)
          setForm((s) => ({
            ...s,
            selectedFieldId: -1,
            field: 'Выберите поле',
          }));
        setMetadata(null);
        alert('Поле удалено');
        return;
      }
      if ([400, 404, 405, 501].includes(res.status)) {
        try {
          const res2 = await authFetch(`${API_BASE}/api/orders/${fieldId}`, {
            method: 'DELETE',
          });
          if (res2.ok) {
            setFieldsList((p) => p.filter((f) => f.fieldId !== fieldId));
            if ((form as any).selectedFieldId === fieldId)
              setForm((s) => ({
                ...s,
                selectedFieldId: -1,
                field: 'Выберите поле',
              }));
            setMetadata(null);
            alert('Поле удалено (через fallback /api/orders/{id})');
            return;
          }
        } catch (e) {
          console.warn(e);
        }
      }
      alert(`Не удалось удалить поле. Сервер вернул ${res.status}.`);
    } catch (e) {
      console.error(e);
      alert('Ошибка запроса на удаление поля.');
    }
  };

  useEffect(() => {
    (async () => {
      await fetchFields();
      await fetchContractorFromLocalStorage();
      await fetchOrders();
    })();
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
      setPendingJson(null);
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

  /** sendPayload:
   *  - sends the raw parsed JSON from uploader (no modification)
   *  - now also accepts optional orderId as the second parameter and sends it alongside payload:
   *    body: { payload, order_id }
   */
  const sendPayload = async (payload: any, orderId?: number | null) => {
    try {
      console.info('[sendPayload] disabled — payload not sent', { orderId });
      // если хочешь — можно сохранить payload в metadata для отладки:
      // setMetadata((m) => ({ ...(m ?? {}), analyticsResponse: { note: 'disabled' } }));
      return true;
    } catch (e) {
      console.error('sendPayload noop error', e);
      return false;
    }
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

    // require uploaded JSON — regardless of radio choice we send pendingJson as-is
    if (!pendingJson) {
      alert(
        'Пожалуйста, загрузите JSON с характеристиками поля (тот JSON, который должен быть отправлен на бэк).',
      );
      return;
    }
    const payload = pendingJson;

    // send payload to analytics endpoint, include order id as second parameter:
    // use the temporary id we'll assign to payloadRequest so backend can link if needed
    const tempOrderId = isNew
      ? Math.max(0, ...requests.map((x) => x.id)) + 1
      : form.id;

    const ok = await sendPayload(payload, tempOrderId);
    if (!ok) {
      alert(
        'Не удалось отправить JSON на анализ. Проверьте соединение и попробуйте ещё раз.',
      );
      return;
    }

    // proceed to create order
    const payloadRequest: Request = {
      id: tempOrderId,
      date: form.date,
      field: form.field,
      type: form.type,
      status: form.status,
      metadata: metadata ?? undefined,
      preview: preview ?? undefined,
    };
    setRequests((prev) =>
      isNew
        ? [payloadRequest, ...prev]
        : prev.map((p) => (p.id === payloadRequest.id ? payloadRequest : p)),
    );

    let createdOrderId: number | null = null;
    const errors: string[] = [];

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
        const txt = await res.text().catch(() => '');
        throw new Error(
          `Ошибка сервера при создании заказа: ${res.status} ${txt}`,
        );
      }
      const data = await res.json().catch(() => ({}));
      createdOrderId = data?.orderId ? Number(data.orderId) : null;

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
        if (!attached)
          errors.push(
            `attachFieldToOrder failed for order ${createdOrderId}, field ${selFieldId}`,
          );
        else {
          const activated = await activateOrder(createdOrderId);
          if (!activated)
            errors.push(`activateOrder failed for order ${createdOrderId}`);
        }
      }

      if (!errors.length) {
        alert('Заявка успешно отправлена менеджеру.');
        setEditorOpen(false);
        setEditingRequest(null);
        setIsNew(false);
        await fetchOrders();
      } else {
        console.warn('saveForm completed with errors', errors);
        alert('Частично успешно: ' + errors.join('; '));
      }
    } catch (e: any) {
      console.error('saveForm error', e);
      alert('Не удалось отправить заявку: ' + (e?.message ?? e));
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Удалить заявку?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/orders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        let body = '';
        try {
          body = await res.text();
        } catch {}
        throw new Error(`Ошибка удаления заказа: ${res.status} ${body}`);
      }
      setRequests((p) => p.filter((r) => r.id !== id));
      setEditorOpen(false);
      setEditingRequest(null);
      setViewRequest((v) => (v && v.id === id ? null : v));
      alert(`Заказ #${id} удалён`);
    } catch (e: any) {
      console.error(e);
      alert('Не удалось удалить заявку: ' + (e?.message ?? e));
    }
  };

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

        {/* Filters */}
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

        {/* Table */}
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
                {filtered.map((request) => {
                  const badge = renderStatusBadge(request.status);
                  return (
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
                          className={cn(
                            'px-2 py-1 text-xs rounded-full',
                            badge.cls,
                          )}
                        >
                          {badge.text}
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
                  );
                })}
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

      {/* View modal */}
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
                        className={cn(
                          'px-3 py-2 rounded-full text-sm',
                          renderStatusBadge(viewRequest.status).cls,
                        )}
                      >
                        {renderStatusBadge(viewRequest.status).text}
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
                          Материалы: {viewRequest.wavelengths}
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

      {/* Editor aside */}
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
                  onClick={() => saveForm()}
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
                        className={cn(
                          'pb-2 px-1 font-medium',
                          'details' === 'details'
                            ? 'text-emerald-600 border-b-2 border-emerald-500'
                            : 'text-gray-500',
                        )}
                      >
                        Данные
                      </button>
                      <button
                        className={cn(
                          'pb-2 px-1 font-medium',
                          'upload' === 'upload'
                            ? 'text-emerald-600 border-b-2 border-emerald-500'
                            : 'text-gray-500',
                        )}
                      >
                        Загрузка поля
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="md:col-span-2 flex flex-col gap-2">
                        <div className="text-sm font-medium text-gray-700/90 mb-1.5">
                          Материалы
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="wavelengths"
                            checked={!form.materialsProvided}
                            onChange={() => {
                              setForm((s) => ({
                                ...s,
                                materialsProvided: false,
                              }));
                              setPendingJson(null);
                              setMetadata(null);
                            }}
                            className="form-radio h-4 w-4"
                          />
                          <span className="text-sm">
                            У меня нет длины материалов
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="wavelengths"
                            checked={form.materialsProvided}
                            onChange={() => {
                              setForm((s) => ({
                                ...s,
                                materialsProvided: true,
                              }));
                            }}
                            className="form-radio h-4 w-4"
                          />
                          <span className="text-sm">У меня есть материалы</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* uploader - always visible now (user must upload JSON) */}
                  <div className="bg-white/90 rounded-2xl border border-gray-100 p-4">
                    <FieldUploaderInline
                      initialPreview={preview ?? undefined}
                      onChangePreview={(p) => setPreview(p)}
                      onChangeMetadata={(m) => setMetadata(m ?? null)}
                      onParsedJson={(parsed) => setPendingJson(parsed)}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Загрузите JSON характеристик поля. JSON будет отправлен на
                      сервер в неизменном виде при сохранении заявки.
                    </div>
                  </div>
                </div>

                <div className="space-y-4" />
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
