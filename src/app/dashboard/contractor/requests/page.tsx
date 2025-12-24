'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '../../operator/requests/spinner';
import {
  CheckCircle,
  Loader2,
  Circle,
  XCircle,
  Info,
  CheckCheck,
  Clock,
} from 'lucide-react';
// Состояние загрузки для кнопки сохранения

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
import {
  syncFieldMappings,
  getLocalId,
  getDisplayId,
} from '../utils/fieldIdMapper';
import { ModernSelect } from '../../modernSelect';

/** Types */
interface Request {
  id: number;
  date: string;
  dateFrom?: string;
  dateTo?: string;
  field: string;
  fieldLocalId?: number;
  crop?: string;
  type: string;
  area?: number;
  status: 'in_progress' | 'processed' | 'completed' | 'cancelled';
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
  fieldId: number; // глобальный ID из БД
  localId?: number; // локальный ID для отображения
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
  { value: 'in_progress', label: 'В работе' },
  { value: 'processed', label: 'Обработана' },
  { value: 'completed', label: 'Завершена' },
  { value: 'cancelled', label: 'Отменена' },
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
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [fieldsList, setFieldsList] = useState<FieldModel[]>([]);
  const [contractor, setContractor] = useState<UserModel | null>(null);
  const [dropdownFieldOpen, setDropdownFieldOpen] = useState(false);
  const [dropdownTypeOpen, setDropdownTypeOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingFieldNames, setLoadingFieldNames] = useState<Set<number>>(
    new Set(),
  );

  const [form, setForm] = useState({
    id: 0,
    date: '',
    dateFrom: '',
    dateTo: '',
    field: 'Выберите поле',
    selectedFieldId: -1 as number,
    type: 'Выберите тип обработки',
    status: 'in_progress' as Request['status'],
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
  // Toast уведомление
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };
  // Сбросить lightbox при закрытии viewModal
  useEffect(() => {
    if (!viewRequest) {
      setLightboxOpen(false);
      setLightboxSrc(null);
    }
  }, [viewRequest]);

  // Для отслеживания изменений формы (редактирование)
  const initialFormRef = useRef<any>(null);
  useEffect(() => {
    if (editorOpen && editingRequest) {
      initialFormRef.current = {
        id: editingRequest.id,
        date: editingRequest.date,
        dateFrom: editingRequest.dateFrom || editingRequest.date,
        dateTo: editingRequest.dateTo || editingRequest.date,
        field: editingRequest.field,
        selectedFieldId: -1,
        type: editingRequest.type,
        status: editingRequest.status,
        materialsProvided: true,
      };
    }
    if (editorOpen && !editingRequest) {
      initialFormRef.current = null;
    }
  }, [editorOpen, editingRequest]);

  // Проверка, изменена ли форма (для "Сохранить изменения")
  const isFormChanged = editingRequest
    ? Object.keys(form).some(
        (key) => (form as any)[key] !== initialFormRef.current?.[key],
      )
    : true;

  // Проверка, все ли обязательные поля заполнены (для "Создать заявку")
  const isFormValid =
    form.field &&
    form.field !== 'Выберите поле' &&
    form.type &&
    form.type !== 'Выберите тип обработки' &&
    form.dateFrom &&
    form.dateTo;

  // helpers
  const mapStatus = (s?: string): Request['status'] => {
    if (!s) {
      console.log(
        '[mapStatus] status is undefined/null, returning "in_progress"',
      );
      return 'in_progress';
    }
    const normalized = String(s).trim().toLowerCase();
    let result: Request['status'];
    if (normalized === 'completed') result = 'completed';
    else if (normalized === 'in progress' || normalized === 'in_progress')
      result = 'in_progress';
    else if (normalized === 'processed') result = 'processed';
    else if (normalized === 'cancelled' || normalized === 'canceled')
      result = 'cancelled';
    else if (/complete|done/.test(normalized)) result = 'completed';
    else if (/in[_\s]?progress|progress/.test(normalized))
      result = 'in_progress';
    else if (/process(ed)?/.test(normalized)) result = 'processed';
    else if (/cancel(l)?ed|отмен/.test(normalized)) result = 'cancelled';
    else result = 'in_progress';
    return result;
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

  const renderStatusBadge = (st: Request['status']) => {
    if (st === 'in_progress')
      return {
        text: 'В работе',
        cls: 'bg-blue-100 text-blue-800',
        icon: <Clock size={16} className="inline mr-1 -mt-0.5 text-blue-500" />,
      };
    if (st === 'processed')
      return {
        text: 'Обработана',
        cls: 'bg-yellow-100 text-yellow-800',
        icon: (
          <CheckCheck
            size={16}
            className="inline mr-1 -mt-0.5 text-yellow-500"
          />
        ),
      };
    if (st === 'completed')
      return {
        text: 'Завершена',
        cls: 'bg-green-100 text-green-800',
        icon: (
          <CheckCircle
            size={16}
            className="inline mr-1 -mt-0.5 text-green-500"
          />
        ),
      };
    if (st === 'cancelled')
      return {
        text: 'Отменена',
        cls: 'bg-red-100 text-red-800',
        icon: (
          <XCircle size={16} className="inline mr-1 -mt-0.5 text-red-500" />
        ),
      };
    return {
      text: 'В работе',
      cls: 'bg-blue-100 text-blue-800',
      icon: (
        <Clock
          size={16}
          className="inline mr-1 -mt-0.5 text-blue-500 animate-spin-slow"
        />
      ),
    };
  };
  // API helpers
  const fetchFields = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await authFetch(
        `${API_BASE}/api/fields-by-user?userId=${userId}`,
      );
      if (!res.ok) throw new Error(`Ошибка получения полей (${res.status})`);
      const data = await res.json();
      const fields = Array.isArray(data.fields) ? data.fields : [];

      // Синхронизируем маппинги с полученными полями
      const globalIds = fields.map((f: any) => f.fieldId);
      syncFieldMappings(globalIds);

      // Добавляем локальные ID к полям
      const fieldsWithLocalIds = fields.map((f: any) => ({
        ...f,
        localId: getLocalId(f.fieldId) ?? undefined,
      }));

      setFieldsList(fieldsWithLocalIds);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchContractorFromLocalStorage = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/me`);
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
      setLoading(true);
      const userId = localStorage.getItem('userId');

      // Сначала получаем актуальный список полей
      const fieldsRes = await authFetch(
        `${API_BASE}/api/fields-by-user?userId=${userId}`,
      );
      let currentFieldsList: FieldModel[] = [];
      if (fieldsRes.ok) {
        const fieldsData = await fieldsRes.json();
        const fields = Array.isArray(fieldsData.fields)
          ? fieldsData.fields
          : [];
        const globalIds = fields.map((f: any) => f.fieldId);
        syncFieldMappings(globalIds);
        currentFieldsList = fields.map((f: any) => ({
          ...f,
          localId: getLocalId(f.fieldId) ?? undefined,
        }));
        setFieldsList(currentFieldsList);
        console.log(
          '[fetchOrders] Загружено полей:',
          currentFieldsList.length,
          currentFieldsList,
        );
      }

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
        const rawDateStart = o.dataStart ?? o.createdAt;
        const rawDateEnd = o.dataEnd ?? o.dataStart ?? o.createdAt;
        const dateFromIso = rawDateStart
          ? new Date(rawDateStart).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        const dateToIso = rawDateEnd
          ? new Date(rawDateEnd).toISOString().slice(0, 10)
          : dateFromIso;
        const dateIso = dateFromIso; // для обратной совместимости
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
        // Изначально ставим прочерк, пока не загрузим имя поля
        const initialFieldName = '—';
        return {
          id,
          date: dateIso,
          dateFrom: dateFromIso,
          dateTo: dateToIso,
          field: initialFieldName,
          fieldLocalId: undefined,
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
      setRequests(baseRequests.sort((a, b) => b.id - a.id));

      // Отмечаем, что загружаем имена полей
      const orderIds = baseRequests.map((r) => r.id);
      setLoadingFieldNames(new Set(orderIds));

      // Асинхронно загружаем имена полей
      const updates = await Promise.all(
        baseRequests.map(async (r) => {
          const fids = await fetchOrderFields(r.id);
          if (!fids.length) {
            console.log(`[fetchOrders] Заявка #${r.id}: поля не найдены`);
            return { orderId: r.id, fieldId: null, name: '—' };
          }
          const fid = fids[0];
          const f = currentFieldsList.find((x) => x.fieldId === fid);

          console.log(
            `[fetchOrders] Заявка #${r.id}: fieldId=${fid}, найдено поле:`,
            f,
          );

          // Формируем имя в формате: "Кадастровый номер (ID: локальный_id)"
          // Если кадастрового номера нет - показываем прочерк
          let name: string;
          let localId: number | null = null;
          if (f && f.cadastralNumber) {
            localId = f.localId ?? getLocalId(fid);
            const displayId = localId !== null ? localId : fid;
            name = `${f.cadastralNumber} (ID: ${displayId})`;
            console.log(`[fetchOrders] Заявка #${r.id}: имя="${name}"`);
          } else {
            name = '—';
            console.log(
              `[fetchOrders] Заявка #${r.id}: кадастровый номер отсутствует, показываем прочерк`,
            );
          }

          return { orderId: r.id, fieldId: fid, name, localId };
        }),
      );

      // Обновляем имена полей
      const updated = baseRequests.map((r) => {
        const u = updates.find((x) => x && x.orderId === r.id) as any;
        if (!u) return { ...r, field: '—', fieldLocalId: undefined };
        return {
          ...r,
          field: u.name,
          fieldLocalId: u.localId ?? undefined,
          metadata: { ...(r.metadata ?? {}), name: u.name },
        };
      });
      setRequests(updated.sort((a, b) => b.id - a.id));
      setLoadingFieldNames(new Set());
      setLoading(false);
    } catch (e) {
      console.error(e);
      setRequests([]);
      setLoading(false);
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

  useEffect(() => {
    (async () => {
      // Сначала загружаем поля, потом заявки (чтобы fieldsList был заполнен)
      await fetchFields();
      await fetchContractorFromLocalStorage();
      // Небольшая задержка, чтобы state успел обновиться
      await new Promise((resolve) => setTimeout(resolve, 100));
      await fetchOrders();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingRequest) {
      setForm({
        id: editingRequest.id,
        date: editingRequest.date,
        dateFrom: editingRequest.dateFrom || editingRequest.date,
        dateTo: editingRequest.dateTo || editingRequest.date,
        field: editingRequest.field,
        selectedFieldId: -1,
        type: editingRequest.type,
        status: editingRequest.status,
        materialsProvided: true,
      });
      setPreview(editingRequest.preview ?? null);
      setMetadata(editingRequest.metadata ?? null);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setForm((s) => ({
        ...s,
        id: 0,
        date: today,
        dateFrom: today,
        dateTo: today,
        field: 'Выберите поле',
        selectedFieldId: -1,
        type: 'Выберите тип обработки',
        status: 'in_progress',
        materialsProvided: false,
      }));
      setPreview(null);
      setMetadata(null);
      setPendingJson(null);
    }
  }, [editingRequest, editorOpen]);

  const filtered = requests.filter((r) => {
    // Приводим статус к внутреннему формату ('in_progress', 'processed', ...)
    const normalizedStatus = mapStatus(r.status);
    if (status !== 'all' && normalizedStatus !== status) return false;
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
    if (saving) return;
    setSaving(true);
    try {
      if (
        !form.field ||
        form.field === 'Выберите поле' ||
        !form.type ||
        form.type === 'Выберите тип обработки'
      ) {
        setErrorMsg('Выберите поле и тип обработения');
        setSaving(false);
        return;
      }

      const payload = pendingJson;
      // send payload to analytics endpoint, include order id as second parameter:
      const tempOrderId = isNew
        ? Math.max(0, ...requests.map((x) => x.id)) + 1
        : form.id;

      const ok = await sendPayload(payload, tempOrderId);
      if (!ok) {
        setErrorMsg(
          'Не удалось отправить JSON на анализ. Проверьте соединение и попробуйте ещё раз.',
        );
        setSaving(false);
        return;
      }

      let orderIdToUse: number | null = null;
      const errors: string[] = [];

      const body: any = {
        typeProcessId: typeToId(form.type),
        dataStart: new Date(form.dateFrom || form.date).toISOString(),
        dataEnd: new Date(form.dateTo || form.date).toISOString(),
        materialsProvided: Boolean(form.materialsProvided),
      };
      if (contractor?.id) body.contractorId = contractor.id;

      let res, data;
      if (isNew) {
        body.status = 'In progress';
        res = await authFetch(`${API_BASE}/api/orders`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(
            `Ошибка сервера при создании заказа: ${res.status} ${txt}`,
          );
        }
        data = await res.json().catch(() => ({}));
        orderIdToUse = data?.orderId ? Number(data.orderId) : null;
        if (!orderIdToUse) {
          const latest = await getLatestOrderId();
          if (latest) orderIdToUse = latest;
          else
            console.warn('Не удалось определить orderId после создания заказа');
        }
      } else {
        // Редактирование существующего заказа
        res = await authFetch(`${API_BASE}/api/orders/${form.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(
            `Ошибка сервера при редактировании заказа: ${res.status} ${txt}`,
          );
        }
        data = await res.json().catch(() => ({}));
        orderIdToUse = form.id;
      }

      const selFieldId = (form as any).selectedFieldId;
      if (orderIdToUse && typeof selFieldId === 'number' && selFieldId >= 0) {
        const attached = await attachFieldToOrder(orderIdToUse, selFieldId);
        if (!attached)
          errors.push(
            `attachFieldToOrder failed for order ${orderIdToUse}, field ${selFieldId}`,
          );
        else if (isNew) {
          const activated = await activateOrder(orderIdToUse);
          if (!activated)
            errors.push(`activateOrder failed for order ${orderIdToUse}`);
        }
      }

      // Динамически обновляем информацию о заявках после успешного изменения
      await fetchOrders();

      // Если открыт viewModal и редактируется текущая заявка — обновить viewRequest из обновлённого списка заявок
      if (!isNew && viewRequest && viewRequest.id === form.id) {
        // fetchOrders обновляет requests асинхронно, поэтому используем setTimeout, чтобы дождаться обновления состояния
        setTimeout(() => {
          setRequests((currentRequests) => {
            const updated = currentRequests.find((r) => r.id === form.id);
            if (updated) setViewRequest(updated);
            return currentRequests;
          });
        }, 150);
      }

      if (!errors.length) {
        showToast(
          isNew
            ? 'Заявка успешно отправлена менеджеру.'
            : 'Заявка успешно обновлена.',
        );
        setEditorOpen(false);
        setEditingRequest(null);
        setIsNew(false);
        setErrorMsg(null);
      } else {
        console.warn('saveForm completed with errors', errors);
        setErrorMsg('Частично успешно: ' + errors.join('; '));
        setEditorOpen(false);
        setEditingRequest(null);
        setIsNew(false);
      }
    } catch (e: any) {
      console.error('saveForm error', e);
      setErrorMsg('Не удалось отправить заявку: ' + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEditorOpen(false);
        setViewRequest(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const renderRequests = () => {
    const sortedRequests = [...requests].sort((a, b) => b.id - a.id);
    return sortedRequests.map((request) => (
      <div key={request.id} className="request-item">
        {/* Render request details here */}
      </div>
    ));
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
              Управление заказами: создавайте и редактируйте.
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
              <style>{`
              .animate-spin-slow {
                animation: spin 1.5s linear infinite;
              }
            `}</style>
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
                isFull
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
                isFull
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
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 w-full">
          <div className="overflow-x-auto w-full">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[0.5fr_1.5fr_2fr_1fr_1fr_1fr] gap-4 w-full py-3 bg-white/60 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 font-nekstregular text-xs text-gray-500 uppercase tracking-wide px-8">
              <div>№</div>
              <div>Период</div>
              <div>Поле (ID)</div>
              <div>Тип</div>
              <div>Статус</div>
              <div className="text-center">Действия</div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-base font-nekstregular w-full">
                <Loader size={20} />
                Загрузка заказов…
              </div>
            )}

            {/* Orders */}
            {!loading && filtered.length > 0 && (
              <>
                {/* Desktop */}
                <div className="hidden md:block">
                  {filtered.map((request, idx) => {
                    const badge = renderStatusBadge(request.status);
                    return (
                      <div
                        key={request.id}
                        onClick={() => setViewRequest(request)}
                        className={`grid grid-cols-[0.5fr_1.5fr_2fr_1fr_1fr_1fr] gap-4 w-full px-8 py-4 items-center border-b border-gray-100 font-nekstregular text-sm ${
                          idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-emerald-50 transition cursor-pointer`}
                      >
                        <div className="font-medium">#{request.id}</div>
                        <div className="text-gray-600">
                          {request.dateFrom && request.dateTo
                            ? `${new Date(request.dateFrom).toLocaleDateString()} — ${new Date(
                                request.dateTo,
                              ).toLocaleDateString()}`
                            : new Date(request.date).toLocaleDateString()}
                        </div>
                        <div className="truncate">{request.field}</div>
                        <div>{request.type}</div>
                        <div className="flex justify-center items-center">
                          <span
                            className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs rounded-full w-full text-center ${badge.cls}`}
                          >
                            {badge.icon}
                            {badge.text}
                          </span>
                        </div>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // чтобы двойной вызов не был
                              setViewRequest(request);
                            }}
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(request);
                            }}
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-4">
                  {filtered.map((r) => {
                    const badge = renderStatusBadge(r.status);
                    return (
                      <div
                        key={r.id}
                        onClick={() => setViewRequest(r)}
                        className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition font-nekstregular w-full cursor-pointer"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-gray-500 font-medium">
                                #{r.id}
                              </span>
                              <span className="text-sm truncate font-medium">
                                {r.field}
                              </span>
                              <span className="text-xs text-gray-400">
                                {r.dateFrom && r.dateTo
                                  ? `${new Date(r.dateFrom).toLocaleDateString()} — ${new Date(
                                      r.dateTo,
                                    ).toLocaleDateString()}`
                                  : new Date(r.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewRequest(r);
                                }}
                                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md focus:outline-none"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(r);
                                }}
                                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md focus:outline-none"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-center items-center">
                            <span
                              className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-xs font-nekstregular bg-gray-100 w-full text-center`}
                            >
                              <span
                                className={`w-2.5 h-2.5 rounded-full inline-block ${
                                  badge.cls.includes('bg-') ? badge.cls : ''
                                }`}
                              />
                              {badge.icon}
                              <span>{badge.text}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* No orders */}
            {/* {!loading && filtered.length === 0 && (
              <div className="py-10 text-center text-gray-500 font-nekstregular w-full">
                Заказов нет
              </div>
            )} */}
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200 w-full">
            <div className="text-sm text-gray-700 w-full">
              Показано <span className="font-medium">1</span> —{' '}
              <span className="font-medium">{filtered.length}</span> из{' '}
              <span className="font-medium">{requests.length}</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setViewRequest(null);
                setLightboxOpen(false);
                setLightboxSrc(null);
              }
            }}
          >
            {/* Внутри модалки — ограничиваем максимальную высоту и даём overflow-y для контента */}
            <motion.div
              initial={{ scale: 0.97, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, y: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="relative w-full max-w-full sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-[0_30px_80px_rgba(2,6,23,0.48)] font-nekstregular"
              role="dialog"
              aria-modal="true"
            >
              {/* --- Header --- */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-3 sm:gap-0 sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-100">
                <div className="flex-1">
                  <div className="text-sm text-gray-400 font-nekstregular">
                    Заявка #{viewRequest.id} •{' '}
                    {new Date(viewRequest.date).toLocaleDateString()}
                  </div>
                  <div className="mt-1 text-2xl font-nekstmedium text-gray-900 truncate">
                    {viewRequest.field}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 font-nekstregular truncate">
                    {viewRequest.type}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(viewRequest)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600 transition font-nekstmedium whitespace-nowrap"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => {
                      setViewRequest(null);
                      setLightboxOpen(false);
                      setLightboxSrc(null);
                    }}
                    className="px-3 py-2 bg-white/70 border border-gray-200 rounded-lg hover:shadow transition font-nekstregular whitespace-nowrap"
                  >
                    Закрыть
                  </button>
                </div>
              </div>

              {/* --- Content --- */}
              <div className="p-5 space-y-5">
                {/* Helper: получить фото полю (локально или по кадастру) */}
                {/* Этот кусок можно вынести наружу компонента при желании */}
                {(() => {
                  const getFieldPhoto = () => {
                    let fieldPhoto = null;
                    if (
                      viewRequest?.fieldLocalId &&
                      Array.isArray(fieldsList)
                    ) {
                      const found = fieldsList.find(
                        (f) => f.localId === viewRequest.fieldLocalId,
                      );
                      fieldPhoto = found?.mapFile ?? null;
                    } else if (
                      viewRequest?.field &&
                      Array.isArray(fieldsList)
                    ) {
                      const cadastral = (viewRequest.field.match(
                        /^(.*?)\s*\(ID:/,
                      ) || [])[1];
                      if (cadastral) {
                        const found = fieldsList.find(
                          (f) => f.cadastralNumber === cadastral,
                        );
                        fieldPhoto = found?.mapFile ?? null;
                      }
                    }
                    return fieldPhoto;
                  };

                  const fieldPhoto = getFieldPhoto();

                  return (
                    <>
                      {/* Превью поля — центрируем содержимое внутри блока */}
                      <div
                        className="relative rounded-xl overflow-hidden bg-gray-100 shadow-inner cursor-pointer group"
                        onClick={() => {
                          if (fieldPhoto) {
                            setLightboxSrc(
                              fieldPhoto.startsWith('data:')
                                ? fieldPhoto
                                : `data:image/jpeg;base64,${fieldPhoto}`,
                            );
                            setLightboxOpen(true);
                          } else if (viewRequest.preview?.fieldPreview) {
                            setLightboxSrc(viewRequest.preview.fieldPreview);
                            setLightboxOpen(true);
                          }
                        }}
                      >
                        {/* Центрируем внутренний контент, чтобы "Превью не загружено" было ровно по центру */}
                        <div className="h-56 sm:h-64 w-full flex items-center justify-center overflow-hidden">
                          {fieldPhoto ? (
                            <img
                              src={
                                fieldPhoto.startsWith('data:')
                                  ? fieldPhoto
                                  : `data:image/jpeg;base64,${fieldPhoto}`
                              }
                              alt="Фото поля"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : viewRequest.preview?.fieldPreview ? (
                            <img
                              src={viewRequest.preview.fieldPreview}
                              alt="preview"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : viewRequest.coords?.length > 0 ? (
                            <div className="p-4 text-sm text-gray-700 font-nekstregular max-w-full overflow-auto">
                              <div className="font-medium mb-1">
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
                            <div className="text-center text-gray-400 p-4">
                              <MapPin
                                size={40}
                                className="mx-auto mb-2 text-gray-300"
                              />
                              <div className="text-sm font-nekstregular">
                                Превью не загружено
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="absolute bottom-2 right-2 bg-black/30 text-white text-xs px-2 py-1 rounded">
                          Кликните для увеличения
                        </div>
                      </div>

                      {/* Информация о заявке */}
                      <div className="rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.04)] space-y-4">
                        <div className="text-lg font-nekstmedium text-gray-800">
                          Информация о заявке
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 font-nekstregular">
                          <div>
                            <div className="text-xs text-gray-500">
                              Тип обработки
                            </div>
                            <div className="mt-1">
                              {viewRequest.type ?? '—'}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">Статус</div>
                            <div className="mt-1">
                              <span
                                className={cn(
                                  'px-3 py-1 rounded-full text-sm',
                                  renderStatusBadge(viewRequest.status).cls,
                                )}
                              >
                                {renderStatusBadge(viewRequest.status).text}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">Период</div>
                            <div className="mt-1">
                              {viewRequest.dateFrom && viewRequest.dateTo
                                ? `${new Date(viewRequest.dateFrom).toLocaleDateString()} — ${new Date(viewRequest.dateTo).toLocaleDateString()}`
                                : new Date(
                                    viewRequest.date,
                                  ).toLocaleDateString()}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              ID заявки
                            </div>
                            <div className="mt-1 font-nekstmedium">
                              #{viewRequest.id}
                            </div>
                          </div>

                          {viewRequest.details?.chemicals && (
                            <div className="col-span-1 sm:col-span-2">
                              <div className="text-xs text-gray-500">
                                Средство / Дозировка
                              </div>
                              <div className="mt-1">
                                {viewRequest.details.chemicals}{' '}
                                {viewRequest.details.dosage
                                  ? `(${viewRequest.details.dosage})`
                                  : ''}
                              </div>
                            </div>
                          )}

                          {viewRequest.details?.droneType && (
                            <div>
                              <div className="text-xs text-gray-500">
                                Техника
                              </div>
                              <div className="mt-1">
                                {viewRequest.details.droneType}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Информация о менеджере */}
                      <div className="rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.04)] space-y-4">
                        <div className="text-lg font-nekstmedium text-gray-800">
                          Менеджер
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 font-nekstregular">
                          <div>
                            <strong>ФИО:</strong> Мальцева Светлана Валентиновна
                          </div>

                          <div>
                            <strong>Почта:</strong> smaltseva@hse.ru
                          </div>
                          <div>
                            <strong>Телефон:</strong> +791234567890
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Lightbox */}
                {lightboxOpen && lightboxSrc && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/80"
                  >
                    <button
                      onClick={() => setLightboxOpen(false)}
                      className="absolute top-4 right-4 z-70 text-white hover:text-gray-200 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <img
                      src={lightboxSrc}
                      alt="Фото поля"
                      className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor aside */}
      {/* Editor aside */}
      <AnimatePresence>
        {editorOpen && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:w-[880px] z-50 bg-white shadow-[0_20px_60px_rgba(16,24,40,0.12)] overflow-auto font-nekstregular"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-40">
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-3">
                  <span className="font-nekstregular">
                    {isNew
                      ? 'Новая заявка'
                      : `Редактирование заявки #${form.id}`}
                  </span>
                  {typeof renderStatusBadge === 'function' && form?.status && (
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-nekstmedium',
                        renderStatusBadge(form.status).cls ??
                          'bg-gray-100 text-gray-800',
                      )}
                    >
                      {renderStatusBadge(form.status).text}
                    </span>
                  )}
                </div>

                <div className="text-2xl font-nekstmedium mt-1 text-gray-900 flex items-center gap-3">
                  <span className="truncate max-w-[48ch]">
                    {form.field || '—'}
                  </span>
                  <span className="text-sm text-gray-400 px-2 py-0.5 rounded-full bg-gray-50 font-nekstregular">
                    {form.type || 'Тип не выбран'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    setEditingRequest(null);
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-shadow shadow-sm"
                  aria-label="Закрыть"
                  title="Закрыть"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 pb-28">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">
                  <div className="rounded-2xl p-6 bg-white shadow-[0_8px_24px_rgba(16,24,40,0.06)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <div className="text-lg font-nekstmedium text-gray-800">
                          Данные
                        </div>
                        <div className="text-xs font-nekstregular text-gray-400">
                          Основные параметры заявки
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Поле */}
                      <div className="relative">
                        <label className="block text-sm font-nekstmedium text-gray-700 mb-1.5">
                          Поле
                        </label>
                        {isNew ? (
                          <ModernSelect
                            isFull
                            label={undefined}
                            options={fieldsList.map(
                              (f) =>
                                f.cadastralNumber ??
                                (f.localId
                                  ? `Поле #${f.localId}`
                                  : `#${f.fieldId}`),
                            )}
                            value={
                              form.field && form.field !== 'Выберите поле'
                                ? form.field
                                : 'Выберите поле'
                            }
                            onChange={(val) => {
                              const idx = fieldsList.findIndex(
                                (f) =>
                                  f.cadastralNumber === val ||
                                  `Поле #${f.localId}` === val ||
                                  `#${f.fieldId}` === val,
                              );
                              if (idx !== -1) {
                                setForm((s) => ({
                                  ...s,
                                  selectedFieldId: fieldsList[idx].fieldId,
                                  field: val,
                                }));
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-100 rounded-xl shadow-none border border-gray-200 cursor-not-allowed opacity-70">
                            <span
                              className={cn(
                                'select-none',
                                !form.field || form.field === 'Выберите поле'
                                  ? 'text-gray-400 font-nekstregular'
                                  : 'text-gray-500 font-nekstregular',
                              )}
                            >
                              {form.field || 'Выберите поле'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Тип обработки */}
                      <div className="relative">
                        <label className="block text-sm font-nekstmedium text-gray-700 mb-1.5">
                          Тип обработки
                        </label>
                        <ModernSelect
                          isFull
                          label={undefined}
                          options={[
                            'Опрыскивание',
                            // 'Внесение удобрений',
                            // 'Картографирование',
                          ]}
                          value={
                            form.type && form.type !== 'Выберите тип обработки'
                              ? form.type
                              : 'Выберите тип обработки'
                          }
                          onChange={(val) => {
                            setForm((s) => ({ ...s, type: val }));
                          }}
                        />
                      </div>

                      {/* Желаемая дата начала */}
                      <div>
                        <label className="block text-sm font-nekstmedium text-gray-700 mb-1.5">
                          Желаемая дата начала
                        </label>
                        <input
                          type="date"
                          value={form.dateFrom}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              dateFrom: e.target.value,
                              date: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-100 outline-none transition font-nekstregular hover:cursor-pointer"
                        />
                      </div>

                      {/* Желаемая дата окончания */}
                      <div>
                        <label className="block text-sm font-nekstmedium text-gray-700 mb-1.5">
                          Желаемая дата окончания
                        </label>
                        <input
                          type="date"
                          value={form.dateTo}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, dateTo: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-100 outline-none transition font-nekstregular hover:cursor-pointer"
                        />
                      </div>

                      {/* Материалы */}
                      <div className="md:col-span-2 flex flex-col gap-4">
                        <div className="text-sm font-nekstmedium text-gray-700 mb-1.5">
                          Материалы
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="materials"
                            checked={!form.materialsProvided}
                            onChange={() =>
                              setForm((s) => ({
                                ...s,
                                materialsProvided: false,
                              }))
                            }
                            className="peer hidden"
                          />
                          <span className="w-6 h-6 flex-shrink-0 rounded-lg border-2 border-gray-200 flex items-center justify-center transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-500">
                            {!form.materialsProvided ? (
                              <Check size={14} className="text-white" />
                            ) : null}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-700 font-nekstregular peer-checked:text-emerald-700">
                              У меня нет материалов
                            </span>
                            <span className="text-xs text-gray-400 font-nekstregular">
                              Мы поможем подобрать удобрения/препараты
                            </span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="materials"
                            checked={form.materialsProvided}
                            onChange={() =>
                              setForm((s) => ({
                                ...s,
                                materialsProvided: true,
                              }))
                            }
                            className="peer hidden"
                          />
                          <span className="w-6 h-6 flex-shrink-0 rounded-lg border-2 border-gray-200 flex items-center justify-center transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-500">
                            {form.materialsProvided ? (
                              <Check size={14} className="text-white" />
                            ) : null}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-700 font-nekstregular peer-checked:text-emerald-700">
                              У меня есть материалы
                            </span>
                            <span className="text-xs text-gray-400 font-nekstregular">
                              Например: удобрение, препарат и т.д.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              {errorMsg && (
                <span className="block mb-3 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm font-nekstregular">
                  {errorMsg}
                </span>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    setEditingRequest(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white hover:shadow transition font-nekstregular"
                >
                  Отмена
                </button>
                <button
                  onClick={saveForm}
                  className={
                    'px-4 py-2 rounded-xl font-nekstmedium flex items-center justify-center gap-2 transition ' +
                    (isNew
                      ? isFormValid && !saving
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed hover:cursor-not-allowed'
                      : isFormChanged && !saving
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed hover:cursor-not-allowed')
                  }
                  disabled={saving || (isNew ? !isFormValid : !isFormChanged)}
                  style={
                    (isNew ? !isFormValid : !isFormChanged)
                      ? { cursor: 'not-allowed' }
                      : undefined
                  }
                >
                  {saving ? (
                    <>
                      <Loader size={20} /> Загрузка...
                    </>
                  ) : isNew ? (
                    'Создать заявку'
                  ) : (
                    'Сохранить изменения'
                  )}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toast уведомление только для успеха */}
      {toast && (
        <div
          className={`fixed z-[100] bottom-4 right-4 px-4 py-2 rounded-lg shadow-md flex flex-col gap-1
      w-[min(350px,90vw)]  /* максимум 320px, на мобильных почти весь экран */
      bg-emerald-50 border border-emerald-200 text-emerald-900
    `}
          style={{ animation: 'toast-fadein 0.3s, toast-fadeout 0.4s 3.1s' }}
        >
          <div className="flex justify-between items-center">
            <div className="text-sm font-nekstmedium ">{toast}</div>
            <button
              className="ml-2 text-lg text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => setToast(null)}
              aria-label="Закрыть уведомление"
            >
              ×
            </button>
          </div>
          <div className="relative h-1 w-full rounded-full overflow-hidden bg-gray-200 mt-1">
            <div
              className="h-full absolute top-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{ animation: 'toast-timer 3.5s linear forwards' }}
            />
          </div>
        </div>
      )}

      <style>{`
  @keyframes toast-timer {
    from { width: 100%; }
    to { width: 0%; }
  }
  @keyframes toast-fadein {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes toast-fadeout {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
  }
`}</style>
    </div>
  );
}
