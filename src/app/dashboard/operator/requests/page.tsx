'use client';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from 'react';
import { motion } from 'framer-motion';

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Check,
  ArrowRight,
  Edit2,
  Clock,
  GitMerge,
} from 'lucide-react';
import { useGlobalContext } from '@/src/app/GlobalContext';
import { Loader } from './spinner';

/* --------------------------
   Helpers: ModernSelect, FieldJsonUploader, ensureDataUrl,
   renderTableCard, getOrderedTables
   -------------------------- */
type Option = { value: string; label: string };

function ModernSelect({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="space-y-2 z-100" ref={ref}>
      {label && <div className="text-sm text-gray-700/90 pl-1.5">{label}</div>}
      <div className="relative">
        <button
          onClick={() => setOpen((s) => !s)}
          type="button"
          className={`w-full px-4 py-3 text-left bg-white rounded-xl border shadow-sm flex items-center justify-between transition ${
            open
              ? 'ring-2 ring-emerald-300 border-emerald-300'
              : 'border-gray-100'
          }`}
        >
          <span className={value ? 'text-gray-800' : 'text-gray-400'}>
            {value || '—'}
          </span>
          <ArrowRight size={16} className="text-gray-400" />
        </button>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-1000 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-y-auto max-h-50"
          >
            {options.map((o) => (
              <li
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onChange(o);
                    setOpen(false);
                  }
                }}
              >
                <span className="text-gray-700">{o}</span>
                {value === o && (
                  <Check size={14} className="text-emerald-500" />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({
  icon: Icon,
  value,
  options,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onDoc);
    }
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative font-nekstmedium" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent hover:bg-gray-50 transition-all group"
      >
        <Icon className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
        <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
          {value}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full mt-2 right-0 min-w-[180px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
        >
          <div className="py-1">
            {options.map((option, idx) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all flex items-center justify-between group ${
                  value === option
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{option}</span>
                {value === option && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FieldJsonUploader({
  initialParsed,
  onParsed,
}: {
  initialParsed?: any | null;
  onParsed: (parsed: any | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [jsonPreview, setJsonPreview] = useState<any | null>(
    initialParsed ?? null,
  );
  useEffect(() => setJsonPreview(initialParsed ?? null), [initialParsed]);
  const handleFile = async (file?: File) => {
    if (!file) return fileRef.current?.click();
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setJsonPreview(parsed);
      onParsed(parsed);
    } catch (e) {
      console.error('parse json error', e);
      setJsonPreview(null);
      onParsed(null);
      alert('Не удалось распарсить JSON. Убедитесь, что файл валидный JSON.');
    }
  };
  return (
    <div className="rounded-2xl border border-gray-100 p-3 bg-white shadow-sm">
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
      {!jsonPreview ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="py-2 rounded-lg bg-emerald-600 text-white font-medium shadow"
          >
            Загрузить JSON поля
          </button>
          <div className="text-sm text-gray-500">
            Требуемые поля:{' '}
            <span className="font-mono text-xs">coords_polygon</span>,{' '}
            <span className="font-mono text-xs">coords_index</span>,{' '}
            <span className="font-mono text-xs">bands_index</span>.
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">
              JSON загружен
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs text-emerald-600 hover:underline"
              >
                Заменить
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonPreview(null);
                  onParsed(null);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Удалить
              </button>
            </div>
          </div>
          <pre className="max-h-44 overflow-auto text-xs bg-gray-50 p-2 rounded-md border border-gray-100">
            {JSON.stringify(jsonPreview, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const ensureDataUrl = (s: string | null | undefined) => {
  if (!s) return null;
  if (s.startsWith('data:')) return s;
  if (/^https?:\/\//.test(s)) return s;
  const isProbablyBase64 = /^[A-Za-z0-9+/=\s]+$/.test(
    (s || '').replace(/\s+/g, ''),
  );
  if (isProbablyBase64)
    return `data:image/png;base64,${(s || '').replace(/\s+/g, '')}`;
  return s;
};

function translateCol(col: string) {
  const map: Record<string, string> = {
    cluster_id: 'Кластер',
    size_pixels: 'Пиксели',
    area_percentage: '% площади',
    NDVI_min: 'NDVI мин',
    NDVI_max: 'NDVI макс',
    NDVI_mean: 'NDVI сред',
    NDVI_std: 'NDVI стд',
    NDVI_variance: 'NDVI вар',
    coefficient_of_variation: 'Коэф вар',
    centroid_x: 'Центроид X',
    centroid_y: 'Центроид Y',
    droneId: 'ID дрона',
    drone_id: 'ID дрона',
    droneName: 'Дрон',
    drone_type: 'Тип дрона',
    area: 'Площадь',
    total_distance: 'Общее расстояние',
    processing_distance: 'Расстояние обработки',
    flight_distance: 'Расстояние полета',
    total_time: 'Общее время',
    processing_time: 'Время обработки',
    flight_time: 'Время полета',
    charge_events: 'События зарядки',
    charge_time: 'Время зарядки',
    segment_id: 'ID сегмента',
    segment_number: 'Номер сегмента',
    'battery_remaining_after error': 'Остаток батареи после ошибки',
    segment_index: 'Индекс сегмента',
    field_count: 'Количество полей',
    drone_count: 'Количество дронов',
    parallel_total_time: 'Параллельное общее время',
    parallel_processing_time: 'Параллельное время обработки',
    parallel_flight_time: 'Параллельное время полета',
    parallel_charge_time: 'Параллельное время зарядки',
  };
  return map[col] ?? col;
}

function formatCell(val: any) {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  if (!Number.isNaN(n) && Number.isFinite(n)) {
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(2);
  }
  return String(val);
}

function renderTableCard(name: string, rows: any[] | null): JSX.Element {
  if (!rows)
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-2">{name}</div>
        <div className="text-xs text-gray-500">
          Таблица пуста или не удалось распарсить.
        </div>
      </div>
    );
  const cols = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r || {}).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>()),
  );
  const isMainTable = name === 'Основная таблица';
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">{name}</div>
        <div className="text-xs text-gray-500">Строк: {rows.length}</div>
      </div>
      <div
        className={
          isMainTable
            ? 'min-w-full' // Без ограничений и скроллов
            : 'min-w-full max-h-[300px]  overflow-x-auto' // Остальные таблицы со скроллами
        }
      >
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  className="text-xs text-gray-500 text-left py-2 pr-3 border-b"
                >
                  {translateCol(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {cols.map((c) => (
                  <td key={c} className="py-2 pr-3 align-top text-gray-700">
                    {formatCell(r?.[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Drone interface (based on API response) */
interface Drone {
  droneId: number;
  droneName: string;
  batteryChargeTime: number;
  flightTime: number;
  maxWindSpeed: number;
  maxFlightSpeed: number;
  maxWorkingSpeed: number;
  spraying: { id: number; flowRate: number; capacity: number; width: number };
  spreading: { id: number; flowRate: number; capacity: number; width: number };
  weight: number;
  liftCapacity: number;
  width: number;
  height: number;
  operatingTemperature: number;
  maxFlightHeight: number;
  rotationSpeed: number;
  imageKey: string;
  quantity: number;
}

function getOrderedTables(tables: Record<string, any[] | null> | undefined) {
  if (!tables) return [] as [string, any[] | null][];
  const preferred = [
    'clusterStatsDf',
    'dronesDf',
    'segmentsDf',
    'segmentSummaryDf',
  ];
  const present: [string, any[] | null][] = [];
  preferred.forEach((k) => {
    if (k in tables) present.push([k, tables[k]]);
  });
  Object.keys(tables)
    .sort()
    .forEach((k) => {
      if (!preferred.includes(k)) present.push([k, tables[k]]);
    });
  return present;
}

/* --------------------------
   Main component
   -------------------------- */

type OrderStatus =
  | 'new'
  | 'assigned'
  | 'data_collection'
  | 'ready_for_calc'
  | 'calculating'
  | 'segmented'
  | 'routes_planned'
  | 'completed'
  | 'processed'
  | 'in_progress';

interface Order {
  id: number;
  date: string;
  fieldName: string;
  fieldId?: number;
  coords?: [number, number][];
  status: OrderStatus;
  orderType?: 'DEFAULT' | 'SPLIT';
  preview?: { fieldPhoto?: string | null };
  metadata?: {
    raw?: any;
    processed?: boolean;
    inputs?: any[];
    latestInput?: { id: number; indexName?: string; createdAt?: string } | null;
    uploadedJson?: any;
    analyticsResponse?: any;
    analyticsImages?: Record<string, string | null>;
    analyticsTables?: Record<string, any[] | null>;
    fieldId?: number;
    fieldRaw?: any;
    finalOutput?: any;
  };
}

export default function OperatorOrdersWizard(): JSX.Element {
  const { userInfo } = useGlobalContext() as any;
  const API_BASE = 'https://api.droneagro.xyz';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState('NDVI');
  const [calcInProgress, setCalcInProgress] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [availableDrones, setAvailableDrones] = useState<Drone[]>([]);
  const [loadingDrones, setLoadingDrones] = useState(false);
  const [droneQuantities, setDroneQuantities] = useState<
    Record<number, number>
  >({});

  const [processingMode, setProcessingMode] = useState<
    'spraying' | 'spreading'
  >('spraying');
  const isJsonUploaded = Boolean(selectedOrder?.metadata?.uploadedJson);

  const isAnalyzeDisabled = calcInProgress || !isJsonUploaded;

  const [viewLoadingId, setViewLoadingId] = useState<number | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergePlot1, setMergePlot1] = useState('');
  const [mergePlot2, setMergePlot2] = useState('');
  const [mergingInProgress, setMergingInProgress] = useState(false);

  // cluster assignments: cluster_id -> 1-based index in droneIds list
  const [clusterAssignments, setClusterAssignments] = useState<
    Record<number, number>
  >({});

  // Toast уведомление
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadOrders();
    loadDrones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalImage) setModalImage(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalImage]);

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const body = (options as any).body;
    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;
    if (body && !isFormData) headers['Content-Type'] = 'application/json';
    const merged = { ...(options.headers as any), ...headers };
    return fetch(url, { ...options, headers: merged });
  };

  // Функция для нормализации статуса из API
  const normalizeStatus = (apiStatus: string): OrderStatus => {
    const normalized = apiStatus.toLowerCase().replace(/\s+/g, '_');
    if (normalized === 'in_progress') return 'in_progress';
    if (normalized === 'processed') return 'processed';
    if (normalized === 'completed') return 'completed';
    if (normalized === 'cancelled') return 'completed';
    return 'new';
  };

  const loadDrones = async () => {
    setLoadingDrones(true);
    try {
      const res = await authFetch(`${API_BASE}/api/drones?limit=100&page=1`);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const arr = Array.isArray(data.drones) ? data.drones : [];
        setAvailableDrones(arr as Drone[]);
      } else {
        console.error('Failed to load drones', res.status);
        setAvailableDrones([]);
      }
    } catch (e) {
      console.error('loadDrones error', e);
      setAvailableDrones([]);
    } finally {
      setLoadingDrones(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const stored =
        typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const userId = Number(stored ?? userInfo?.id ?? 0);
      if (!userId) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }
      const res = await authFetch(`${API_BASE}/api/orders/operator/${userId}`);
      if (!res.ok) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      const arr = Array.isArray(data.orders) ? data.orders : [];

      // Fetch fields for each order
      const ordersWithFields = await Promise.all(
        arr.map(async (o: any) => {
          let fieldId: number | undefined = undefined;

          try {
            const fieldsRes = await authFetch(
              `${API_BASE}/api/fields-by-order?orderId=${o.orderId ?? o.id ?? 0}`,
            );

            if (fieldsRes.ok) {
              const fieldsData = await fieldsRes.json().catch(() => ({}));
              console.log(
                'Fields API response for order',
                o.orderId ?? o.id,
                ':',
                fieldsData,
              );

              const fields = Array.isArray(fieldsData.fields)
                ? fieldsData.fields
                : [];

              console.log('Parsed fields array:', fields);

              // Take first field's ID if exists
              if (fields.length > 0) {
                console.log('First field object:', fields[0]);
                fieldId = Number(fields[0].fieldId);
                console.log('Extracted fieldId:', fieldId);
              }
            }
          } catch (e) {
            console.warn(
              'Failed to fetch fields for order',
              o.orderId ?? o.id,
              e,
            );
          }

          return {
            id: Number(o.orderId ?? o.id ?? 0),
            date: new Date(o.createdAt ?? Date.now())
              .toISOString()
              .slice(0, 10),
            fieldName: o.fieldName ?? `ID:${o.id ?? o.orderId}`,
            fieldId,
            status: normalizeStatus(o.status ?? 'new'),
            orderType: (o.orderType ?? 'DEFAULT') as 'DEFAULT' | 'SPLIT',
            preview: { fieldPhoto: null },
            metadata: {
              raw: o,
              processed: false,
              inputs: [],
              latestInput: null,
              fieldId,
            },
          };
        }),
      );

      setOrders(ordersWithFields);
      await checkInputsForOrders(ordersWithFields);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const checkInputsForOrders = async (currentOrders: Order[]) => {
    if (!currentOrders || !currentOrders.length) return;
    try {
      const checks = currentOrders.map(async (ord) => {
        try {
          const r = await authFetch(
            `${API_BASE}/api/workflow/inputs?orderId=${ord.id}`,
          );
          if (!r.ok) return ord;
          const json = await r.json().catch(() => ({}));
          const inputs = Array.isArray(json.inputs) ? json.inputs : [];
          if (!inputs.length) {
            return {
              ...ord,
              metadata: {
                ...(ord.metadata ?? {}),
                processed: false,
                inputs: [],
              },
            } as Order;
          }
          const sorted = [...inputs].sort((a: any, b: any) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (ta === tb) return (a.id ?? 0) - (b.id ?? 0);
            return ta - tb;
          });
          const last = sorted[sorted.length - 1];
          return {
            ...ord,
            metadata: {
              ...(ord.metadata ?? {}),
              processed: true,
              inputs,
              latestInput: {
                id: Number(last.id ?? last.inputId ?? 0),
                indexName: last.indexName ?? last.index_name,
                createdAt: last.createdAt ?? null,
              },
            },
          } as Order;
        } catch (e) {
          console.warn('checkInputs error for', ord.id, e);
          return ord;
        }
      });

      const resolved = await Promise.all(checks);
      setOrders(resolved);
    } catch (e) {
      console.error('checkInputsForOrders failed', e);
    }
  };

  const runAnalyze = async () => {
    if (!selectedOrder) return alert('Выберите заявку и загрузите JSON.');
    const uploaded = selectedOrder.metadata?.uploadedJson ?? null;
    if (!uploaded)
      return alert(
        'Сначала загрузите JSON с полями coords_polygon, coords_index, bands_index.',
      );

    const orderType = selectedOrder.orderType ?? 'DEFAULT';

    try {
      setCalcInProgress(true);
      setCalcProgress(10);

      // Для SPLIT используем упрощенную ручку
      if (orderType === 'SPLIT') {
        const body = {
          orderId: selectedOrder.id,
          payload: uploaded,
        };

        const res = await authFetch(`${API_BASE}/api/workflow/split`, {
          method: 'POST',
          body: JSON.stringify(body),
        });

        setCalcProgress(50);

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('split failed', res.status, txt);
          alert('Ошибка от сервера при запуске разбиения.');
          setCalcInProgress(false);
          setCalcProgress(0);
          return;
        }

        const parsed = await res.json().catch(async () => {
          const t = await res.text().catch(() => '');
          return { rawText: t };
        });

        const out = parsed?.output ?? {};
        const inputId = parsed?.inputId ?? null;

        // Для SPLIT только одно изображение
        const images: Record<string, string | null> = {
          areasWithFullIdsImage: ensureDataUrl(
            out?.areasWithFullIdsImage ?? null,
          ),
        };

        setSelectedOrder((so) =>
          so
            ? ({
                ...so,
                status: 'processed',
                metadata: {
                  ...(so.metadata ?? {}),
                  uploadedJson: uploaded,
                  latestInput: { id: inputId },
                  analyticsResponse: parsed,
                  analyticsImages: images,
                  analyticsTables: {},
                  processed: true,
                },
              } as Order)
            : so,
        );

        setOrders((prev) =>
          prev.map((p) =>
            p.id === selectedOrder.id
              ? ({
                  ...p,
                  status: 'processed',
                  metadata: {
                    ...(p.metadata ?? {}),
                    uploadedJson: uploaded,
                    latestInput: { id: inputId },
                    analyticsResponse: parsed,
                    analyticsImages: images,
                    analyticsTables: {},
                    processed: true,
                  },
                } as Order)
              : p,
          ),
        );

        setCalcProgress(100);
        setIsViewOnly(false);
        setStep(4); // Сразу переходим к финальному шагу для SPLIT
        showToast('Разбиение успешно завершено!');

        // Обновляем статус заказа на бекенде
        try {
          const statusRes = await authFetch(
            `${API_BASE}/api/orders_status/${selectedOrder.id}`,
            {
              method: 'PUT',
              body: JSON.stringify({ status: 'Processed' }),
            },
          );
          if (!statusRes.ok) {
            console.error('Failed to update order status on backend');
          }
        } catch (e) {
          console.error('Error updating order status', e);
        }
      } else {
        // Для DEFAULT используем стандартную ручку analyze
        const body = {
          orderId: selectedOrder.id,
          indexName: selectedIndex || 'NDVI',
          payload: uploaded,
        };

        const res = await authFetch(`${API_BASE}/api/workflow/analyze`, {
          method: 'POST',
          body: JSON.stringify(body),
        });

        setCalcProgress(50);

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('analyze failed', res.status, txt);
          alert('Ошибка от сервера при запуске анализа.');
          setCalcInProgress(false);
          setCalcProgress(0);
          return;
        }

        const parsed = await res.json().catch(async () => {
          const t = await res.text().catch(() => '');
          return { rawText: t };
        });

        const out = parsed?.output ?? {};
        const imageKeys = [
          'originalImage',
          'indexImage',
          'areasWithFullIdsImage',
          'indexWithBoundsImage',
        ];

        const images: Record<string, string | null> = {};
        imageKeys.forEach((k) => (images[k] = ensureDataUrl(out?.[k] ?? null)));

        const tables: Record<string, any[] | null> = {};
        Object.keys(out || {}).forEach((k) => {
          const kl = k.toLowerCase();
          if (
            kl.endsWith('df') ||
            kl.endsWith('statsdf') ||
            (kl.includes('cluster') && kl.includes('df'))
          ) {
            const v = out[k];
            if (!v) {
              tables[k] = null;
              return;
            }
            try {
              tables[k] = typeof v === 'string' ? JSON.parse(v) : v;
            } catch {
              tables[k] = null;
            }
          }
        });

        // здесь берем inputId из верхнего уровня ответа
        const inputId = parsed?.inputId ?? null;

        setSelectedOrder((so) =>
          so
            ? ({
                ...so,
                metadata: {
                  ...(so.metadata ?? {}),
                  uploadedJson: uploaded,
                  latestInput: { id: inputId },
                  analyticsResponse: parsed,
                  analyticsImages: images,
                  analyticsTables: tables,
                },
              } as Order)
            : so,
        );

        setOrders((prev) =>
          prev.map((p) =>
            p.id === selectedOrder.id
              ? ({
                  ...p,
                  metadata: {
                    ...(p.metadata ?? {}),
                    uploadedJson: uploaded,
                    latestInput: { id: inputId },
                    analyticsResponse: parsed,
                    analyticsImages: images,
                    analyticsTables: tables,
                  },
                } as Order)
              : p,
          ),
        );

        setCalcProgress(100);
        setIsViewOnly(false);
        setStep(2);
      }
    } catch (e) {
      console.error('runAnalyze error', e);
      alert('Ошибка при вызове analyze.');
    } finally {
      setTimeout(() => {
        setCalcInProgress(false);
        setCalcProgress(0);
      }, 300);
    }
  };

  const applyMerge = async () => {
    if (!selectedOrder) return;
    if (isViewOnly)
      return alert('Нет доступа: режим просмотра. Сначала нажмите "Изменить".');
    const parsed = selectedOrder.metadata?.analyticsResponse;
    const inputId =
      parsed?.inputId ?? parsed?.output?.inputId ?? parsed?.input_id ?? null;
    if (!inputId)
      return alert('Не удалось обнаружить inputId в ответе analyze.');
    if (!mergePlot1 || !mergePlot2) return alert('Укажите оба plotId.');
    try {
      setMergingInProgress(true);
      const body = {
        inputId,
        plotId1: String(mergePlot1),
        plotId2: String(mergePlot2),
      };
      const res = await authFetch(`${API_BASE}/api/workflow/merge`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('merge failed', res.status, txt);
        showToast('Ошибка соединения с сервером');
        return;
      }
      const parsedRes = await res.json().catch(async () => {
        const t = await res.text().catch(() => '');
        return { rawText: t };
      });
      const out = parsedRes?.output ?? parsedRes;
      const newImages = {
        areasWithFullIdsImage: ensureDataUrl(
          out?.areasWithFullIdsImage ?? null,
        ),
        indexWithBoundsImage: ensureDataUrl(out?.indexWithBoundsImage ?? null),
      };
      setSelectedOrder((so) =>
        so
          ? ({
              ...so,
              metadata: {
                ...(so.metadata ?? {}),
                analyticsImages: {
                  ...(so.metadata?.analyticsImages ?? {}),
                  ...newImages,
                },
              },
            } as Order)
          : so,
      );
      setOrders((prev) =>
        prev.map((p) =>
          p.id === selectedOrder.id
            ? ({
                ...p,
                metadata: {
                  ...(p.metadata ?? {}),
                  analyticsImages: {
                    ...(p.metadata?.analyticsImages ?? {}),
                    ...newImages,
                  },
                },
              } as Order)
            : p,
        ),
      );
      showToast('Участки успешно объединены!');
      // Форма остается открытой для возможности повторного объединения
    } catch (e) {
      console.error('applyMerge error', e);
      showToast('Ошибка при объединении участков');
    } finally {
      setMergingInProgress(false);
    }
  };

  const getClusterRows = (): any[] => {
    const rows =
      selectedOrder?.metadata?.analyticsTables?.clusterStatsDf ?? null;
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map((r: any) => ({
      ...r,
      cluster_id: Number(r.cluster_id ?? r.clusterId ?? r.id),
    }));
  };

  const autoAssignRoundRobin = () => {
    const clusters = getClusterRows();
    const droneIdsForAssign = availableDrones.map((d) => d.droneId);
    if (!droneIdsForAssign.length)
      return alert('Нет доступных дронов для присвоения');
    const byCluster: Record<number, number> = {};
    clusters.forEach((c: any, i: number) => {
      const idx = i % droneIdsForAssign.length;
      byCluster[c.cluster_id] = idx + 1;
    });
    setClusterAssignments(byCluster);
  };

  const clearAssignments = () => setClusterAssignments({});

  const applyFinal = async () => {
    if (!selectedOrder) return alert('Выберите заявку.');
    const parsed = selectedOrder.metadata?.analyticsResponse;
    const inputId =
      parsed?.inputId ?? parsed?.output?.inputId ?? parsed?.input_id ?? null;
    if (!inputId)
      return alert('Не удалось обнаружить inputId в ответе analyze.');

    // 1. Определяем, какие дроны назначены (их 1-based индексы в списке availableDrones)
    const assignedIndices = Array.from(
      new Set(Object.values(clusterAssignments).filter(Boolean)),
    ).sort((a, b) => a - b);

    // 2. Создаем финальный список ID дронов (droneIds)
    const droneIds: number[] = assignedIndices
      .map((index) => availableDrones[index - 1]?.droneId)
      .filter((id): id is number => id !== undefined);

    if (!droneIds.length) return alert('Назначьте хотя бы один дрон кластеру.');

    // 3. Переиндексируем droneTasks
    const indexMap: Record<number, number> = assignedIndices.reduce(
      (acc, oldIndex, newIndex) => {
        acc[oldIndex] = newIndex + 1; // oldIndex (1-based) -> newIndex (1-based) в новом droneIds
        return acc;
      },
      {} as Record<number, number>,
    );

    const droneTasks: Record<string, number> = {};
    Object.keys(clusterAssignments).forEach((k) => {
      const clusterId = Number(k);
      const assignedIdx = clusterAssignments[clusterId];
      if (!assignedIdx) return;

      const newIndex = indexMap[assignedIdx];
      if (newIndex) {
        // newIndex - это 1-based index в новом списке `droneIds`
        droneTasks[String(clusterId)] = newIndex;
      }
    });

    const numType: Record<string, number> = {};
    droneIds.forEach((dbId, i) => {
      const quantityFromState = droneQuantities[dbId];
      if (quantityFromState !== undefined) {
        numType[String(i + 1)] = quantityFromState;
      } else {
        // Если количество не задано, берем по умолчанию (quantity или 1)
        const found = availableDrones.find((d) => d.droneId === dbId);
        numType[String(i + 1)] = found
          ? Math.max(1, Number(found.quantity) || 1)
          : 1;
      }
    });

    const body = {
      inputId,
      processingMode,
      droneIds,
      droneTasks,
      numType,
    };

    try {
      setCalcInProgress(true);
      setCalcProgress(20);
      const res = await authFetch(`${API_BASE}/api/workflow/final`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setCalcProgress(60);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('final failed', res.status, txt);
        alert('Ошибка от сервера при запуске final.');
        setCalcInProgress(false);
        return;
      }
      const parsedRes = await res.json().catch(async () => {
        const t = await res.text().catch(() => '');
        return { rawText: t };
      });
      const out = parsedRes?.output ?? parsedRes;
      const images: Record<string, string | null> = {};
      [
        'originalImage',
        'indexImage',
        'areasWithFullIdsImage',
        'indexWithBoundsImage',
        'areasWithSegmentsAndFullIds',
      ].forEach((k) => {
        if (out?.[k]) images[k] = ensureDataUrl(out[k]);
      });
      const existingTables = selectedOrder.metadata?.analyticsTables ?? {};
      const newTables: Record<string, any[] | null> = { ...existingTables };
      ['clusterStatsDf', 'dronesDf', 'segmentsDf', 'segmentSummaryDf'].forEach(
        (k) => {
          const v = out?.[k];
          if (v !== undefined && v !== null) {
            try {
              newTables[k] = typeof v === 'string' ? JSON.parse(v) : v;
            } catch {
              newTables[k] = null;
            }
          }
        },
      );
      // --- Обновление selectedOrder и orders — теперь помечаем как processed и ставим статус processed ---
      setSelectedOrder((so) =>
        so
          ? ({
              ...so,
              status: 'processed',
              metadata: {
                ...(so.metadata ?? {}),
                finalOutput: out,
                analyticsImages: {
                  ...(so.metadata?.analyticsImages ?? {}),
                  ...images,
                },
                analyticsTables: newTables,
                // отмечаем, что обработано
                processed: true,
                // обновляем latestInput на тот inputId, который использовался
                latestInput: { id: inputId },
              },
            } as Order)
          : so,
      );
      setOrders((prev) =>
        prev.map((p) =>
          p.id === selectedOrder.id
            ? ({
                ...p,
                status: 'processed',
                metadata: {
                  ...(p.metadata ?? {}),
                  finalOutput: out,
                  analyticsImages: {
                    ...(p.metadata?.analyticsImages ?? {}),
                    ...images,
                  },
                  analyticsTables: newTables,
                  processed: true,
                  latestInput: { id: inputId },
                },
              } as Order)
            : p,
        ),
      );
      // -----------------------------------------------------------------------------------------------
      setCalcProgress(100);
      setStep(4);
      showToast('Обработка успешно завершена!');

      // Обновляем статус заказа на бекенде
      try {
        const statusRes = await authFetch(
          `${API_BASE}/api/orders_status/${selectedOrder.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({ status: 'Processed' }),
          },
        );
        if (!statusRes.ok) {
          console.error('Failed to update order status on backend');
        }
      } catch (e) {
        console.error('Error updating order status', e);
      }
    } catch (e) {
      console.error('applyFinal error', e);
      alert('Ошибка при вызове final.');
    } finally {
      setTimeout(() => {
        setCalcInProgress(false);
        setCalcProgress(0);
      }, 400);
    }
  };

  const handleView = async (e: React.MouseEvent, o: Order) => {
    e.stopPropagation();
    const latest = o.metadata?.latestInput?.id ?? null;
    if (!latest) return alert('Не найден latest inputId для этого ордера.');
    setViewLoadingId(o.id);
    try {
      const res = await authFetch(
        `${API_BASE}/api/workflow/result?inputId=${latest}`,
      );
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('result fetch failed', res.status, txt);
        alert('Ошибка при получении результата.');
        return;
      }
      const parsed = await res.json().catch(async () => {
        const t = await res.text().catch(() => '');
        return { rawText: t };
      });
      const result = parsed?.result ?? parsed;

      // Для SPLIT заявок загружаем только карту разбиения
      const isSplit = (o.orderType ?? 'DEFAULT') === 'SPLIT';

      const images: Record<string, string | null> = {};
      if (isSplit) {
        // Для SPLIT только areasWithFullIdsImage
        images.areasWithFullIdsImage = ensureDataUrl(
          result?.areasWithFullIdsImage ?? null,
        );
      } else {
        // Для DEFAULT все изображения
        const imageKeys = [
          'originalImage',
          'indexImage',
          'areasWithFullIdsImage',
          'indexWithBoundsImage',
          'areasWithSegmentsAndFullIds',
        ];
        imageKeys.forEach((k) => {
          images[k] = ensureDataUrl(result?.[k] ?? null);
        });
      }

      // Таблицы загружаем только для DEFAULT
      const tables: Record<string, any[] | null> = {};
      if (!isSplit) {
        Object.keys(result || {}).forEach((k) => {
          const kl = k.toLowerCase();
          if (
            kl.endsWith('df') ||
            kl.endsWith('statsdf') ||
            (kl.includes('cluster') && kl.includes('df'))
          ) {
            const v = result[k];
            if (!v) {
              tables[k] = null;
              return;
            }
            try {
              tables[k] = typeof v === 'string' ? JSON.parse(v) : v;
            } catch {
              tables[k] = null;
            }
          }
        });
      }

      const updatedOrder = {
        ...o,
        metadata: {
          ...(o.metadata ?? {}),
          analyticsResponse: result,
          analyticsImages: {
            ...(o.metadata?.analyticsImages ?? {}),
            ...images,
          },
          analyticsTables: isSplit
            ? {}
            : {
                ...(o.metadata?.analyticsTables ?? {}),
                ...tables,
              },
        },
      } as Order;
      setSelectedOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((p) => (p.id === updatedOrder.id ? updatedOrder : p)),
      );
      setIsViewOnly(true);
      // Для SPLIT переходим на шаг 4 (финальный результат), для DEFAULT - на шаг 2
      setStep(isSplit ? 4 : 2);
    } catch (e) {
      console.error('handleView error', e);
      alert('Ошибка при получении результата.');
    } finally {
      setViewLoadingId(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, o: Order) => {
    e.stopPropagation();
    const cleaned: Order = {
      ...o,
      metadata: {
        ...(o.metadata ?? {}),
        analyticsResponse: null,
        analyticsImages: {},
        analyticsTables: {},
        finalOutput: null,
      },
    };
    setSelectedOrder(cleaned);
    setOrders((prev) => prev.map((p) => (p.id === cleaned.id ? cleaned : p)));
    setIsViewOnly(false);
    setStep(1);
  };

  const stepTitles = [
    '1. Загрузить поле',
    '2. Просмотр результатов',
    '3. Выбрать дроны',
    '4. Финальные данные',
  ];

  // Прогресс-бар шагов
  function StepProgressBar({ step }: { step: number }) {
    return (
      <div className="flex items-center gap-2 mb-4">
        {stepTitles.map((t, i) => {
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <div key={t} className="flex items-center gap-1">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300
                  ${done ? 'bg-emerald-500 border-emerald-500 text-white' : active ? 'bg-white border-emerald-400 text-emerald-600 font-bold' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
              >
                {done ? '✓' : i + 1}
              </div>
              {i < stepTitles.length - 1 && (
                <div
                  className={`h-1 w-8 rounded transition-all duration-300 ${done ? 'bg-emerald-400' : 'bg-gray-200'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const closeSelected = () => {
    setSelectedOrder(null);
    setStep(1);
    setIsViewOnly(false);
  };

  const areasImg =
    selectedOrder?.metadata?.analyticsImages?.areasWithFullIdsImage ?? null;
  const indexBoundsImg =
    selectedOrder?.metadata?.analyticsImages?.indexWithBoundsImage ?? null;

  const droneIdsForAssign = availableDrones.map((d) => d.droneId);
  const droneOptions = droneIdsForAssign.map((dbId, i) => {
    const found = availableDrones.find((d) => d.droneId === dbId);
    return {
      label: `${i + 1}: ${found ? found.droneName : 'ID:' + dbId}`,
      value: i + 1,
    };
  });
  const droneLabelToValueMap = new Map<string, number>();
  droneOptions.forEach((opt) => droneLabelToValueMap.set(opt.label, opt.value));
  const droneSelectOptions = ['—', ...droneOptions.map((opt) => opt.label)];

  const clusterRows = getClusterRows();

  // Фильтрация и сортировка заказов
  const filteredOrders = useMemo(() => {
    // Сначала сортируем все заказы по ID в порядке убывания
    let sorted = [...orders].sort((a, b) => b.id - a.id);

    // Затем фильтруем по статусу
    if (statusFilter !== 'all') {
      sorted = sorted.filter((o) => {
        const st = (o.status ?? '').toLowerCase().replace(/\s+/g, '_');
        return st === statusFilter;
      });
    }

    // Фильтруем по типу заявки
    if (orderTypeFilter !== 'all') {
      sorted = sorted.filter((o) => {
        const ot = o.orderType ?? 'DEFAULT';
        return ot === orderTypeFilter;
      });
    }

    // Затем сортируем по дате, если выбрана сортировка по времени
    if (sortOrder === 'desc') {
      sorted = sorted.sort((a, b) => {
        return (
          (b.date ? new Date(b.date).getTime() : 0) -
          (a.date ? new Date(a.date).getTime() : 0)
        );
      });
    } else if (sortOrder === 'asc') {
      sorted = sorted.sort((a, b) => {
        return (
          (a.date ? new Date(a.date).getTime() : 0) -
          (b.date ? new Date(b.date).getTime() : 0)
        );
      });
    }

    return sorted;
  }, [orders, statusFilter, orderTypeFilter, sortOrder]);

  // Проверяем, назначен ли дрон каждому кластеру.
  const allClustersAssigned =
    clusterRows.length > 0 &&
    clusterRows.every(
      (r) =>
        clusterAssignments[r.cluster_id] !== undefined &&
        clusterAssignments[r.cluster_id] !== '',
    );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-nekstmedium">
            Оперативная панель — Оператор процессов
          </h2>
          <div className="text-xs md:text-sm text-gray-500 mt-1">
            Пошаговый процесс обработки: загрузка → анализ → дроны → итог.
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!selectedOrder ? (
            <button
              onClick={() => loadOrders()}
              className="px-3 md:px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 font-nekstregular text-sm md:text-base"
              title="Обновить"
            >
              <RefreshCw size={16} />{' '}
              <span className="hidden sm:inline">Обновить</span>
            </button>
          ) : (
            <button
              onClick={closeSelected}
              className="px-3 md:px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 text-sm md:text-base"
              title="Закрыть заявку"
            >
              <X size={16} /> Закрыть
            </button>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {stepTitles.map((t, i) => {
              const idx = (i + 1) as 1 | 2 | 3 | 4;
              const active = step === idx;
              const done = step > idx;
              const isSplit =
                (selectedOrder.orderType ?? 'DEFAULT') === 'SPLIT';
              // Для SPLIT показываем только шаги 1 и 4
              if (isSplit && (idx === 2 || idx === 3)) return null;
              const disabled =
                (isViewOnly && idx !== 2) ||
                (isSplit && idx !== 1 && idx !== 4);
              return (
                <div key={t} className="">
                  <button
                    onClick={() => {
                      if (disabled) return;
                      if (isSplit && idx !== 1 && idx !== 4) return;
                      setStep(idx);
                    }}
                    className="w-full text-left"
                    aria-disabled={disabled}
                  >
                    <div
                      className={`p-2 md:p-3 rounded-lg border ${active ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100 bg-white'} flex items-center gap-2 md:gap-3 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-base ${active ? 'bg-emerald-600 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {done ? (
                          <Check size={14} className="md:w-4 md:h-4" />
                        ) : (
                          <span className="font-medium">{idx}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs md:text-sm font-medium truncate">
                          {t}
                        </div>
                        <div className="hidden md:block text-xs text-gray-500 truncate">
                          {idx === 1
                            ? 'Загрузите JSON поля'
                            : idx === 2
                              ? 'Просмотрите изображения и таблицы'
                              : idx === 3
                                ? 'Выберите дрон(ы) и режим'
                                : 'Полный результат'}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white p-3 md:p-4 lg:p-6 rounded-2xl shadow border border-gray-100">
        {!selectedOrder ? (
          <div>
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-nekstmedium text-gray-800">
                    Список заявок
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Выберите заявку для обработки
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <div className="flex items-center  gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 shadow-sm">
                    <span className="text-xs font-nekstregular text-gray-600">
                      Показано:
                    </span>
                    <span className="text-sm font-nekstmedium text-emerald-700">
                      {filteredOrders.length}
                    </span>
                    <span className="text-xs text-gray-400">/</span>
                    <span className="text-sm font-semibold text-gray-500">
                      {orders.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-0 bg-white rounded-xl shadow-sm border border-gray-200 w-full sm:w-auto">
                    <FilterDropdown
                      icon={({ className }) => (
                        <svg
                          className={className}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                      )}
                      value={
                        orderTypeFilter === 'all'
                          ? 'Все типы'
                          : orderTypeFilter === 'DEFAULT'
                            ? 'Обычные'
                            : 'Только разбиение'
                      }
                      options={['Все типы', 'Обычные', 'Только разбиение']}
                      onChange={(val) => {
                        if (val === 'Все типы') setOrderTypeFilter('all');
                        else if (val === 'Обычные')
                          setOrderTypeFilter('DEFAULT');
                        else if (val === 'Только разбиение')
                          setOrderTypeFilter('SPLIT');
                      }}
                    />

                    <div className="hidden sm:block w-px h-6 bg-gray-200" />

                    <div className="px-1 py-1 font-nekstmedium">
                      <FilterDropdown
                        icon={(props) => (
                          <svg
                            {...props}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                          </svg>
                        )}
                        value={
                          statusFilter === 'all'
                            ? 'Все'
                            : statusFilter === 'in_progress'
                              ? 'В работе'
                              : 'Обработана'
                        }
                        options={['Все', 'В работе', 'Обработана']}
                        onChange={(v) => {
                          if (v === 'Все') setStatusFilter('all');
                          else if (v === 'В работе')
                            setStatusFilter('in_progress');
                          else if (v === 'Обработана')
                            setStatusFilter('processed');
                        }}
                      />
                    </div>

                    <div className="hidden sm:block w-px h-6 bg-gray-200" />

                    <div className="px-1 py-1 font-nekstmedium">
                      <FilterDropdown
                        icon={Clock}
                        value={
                          sortOrder === 'desc'
                            ? 'Сначала новые'
                            : 'Сначала старые'
                        }
                        options={['Сначала новые', 'Сначала старые']}
                        onChange={(v) =>
                          setSortOrder(v === 'Сначала новые' ? 'desc' : 'asc')
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-xl ring-1 ring-gray-200/50">
              {loadingOrders ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white shadow-sm">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-nekstregular text-gray-700">
                      Загрузка заявок...
                    </span>
                  </div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-white shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Нет доступных заявок
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop: таблица */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-b border-gray-200">
                          <th className="px-6 py-4 text-left">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-nekstmedium text-gray-700 uppercase tracking-wider">
                                ID заявки
                              </span>
                            </div>
                          </th>
                          {/* <th className="px-6 py-4 text-left">
                            <span className="text-xs font-nekstmedium text-gray-700 uppercase tracking-wider">
                              Поле
                            </span>
                          </th> */}
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-nekstmedium text-gray-700 uppercase tracking-wider">
                              Дата создания
                            </span>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-nekstmedium text-gray-700 uppercase tracking-wider">
                              Тип заявки
                            </span>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-nekstmedium text-gray-700 uppercase tracking-wider">
                              Статус
                            </span>
                          </th>
                          <th className="px-6 py-4 text-right">
                            <span className="text-xs font-nekstmedium text-gray-700 uppercase tracking-wider">
                              Действия
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredOrders.map((o, i) => (
                          <tr
                            key={o.id}
                            onClick={() => {
                              if (o.metadata?.processed) {
                                handleView(
                                  {
                                    stopPropagation: () => {},
                                  } as React.MouseEvent,
                                  o,
                                );
                              } else {
                                setSelectedOrder(o);
                                setIsViewOnly(false);
                                setStep(1);
                              }
                            }}
                            className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:via-teal-50/30 hover:to-transparent hover:shadow-md cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                                  <span className="text-sm font-nekstmedium text-gray-700">
                                    {o.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            {/* <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-nekstregular text-gray-900">
                                  {o.fieldId ? `Field ID: ${o.fieldId}` : '—'}
                                </span>
                                {o.fieldId && (
                                  <span className="text-xs text-gray-400 mt-0.5">
                                    Идентификатор поля
                                  </span>
                                )}
                              </div>
                            </td> */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-sm text-gray-600 font-nekstregular">
                                  {o.date}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {o.orderType === 'SPLIT' ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 shadow-sm">
                                  <svg
                                    className="w-3.5 h-3.5 text-purple-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  <span className="text-xs font-nekstmedium text-purple-700">
                                    Только разбиение
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 shadow-sm">
                                  <svg
                                    className="w-3.5 h-3.5 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                  <span className="text-xs font-nekstmedium text-blue-700">
                                    Обычный
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {o.metadata?.processed ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 border border-emerald-200 shadow-sm">
                                  <Clock
                                    size={14}
                                    className="text-emerald-600"
                                  />
                                  <span className="text-xs font-nekstmedium text-emerald-700">
                                    Обработана
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 shadow-sm">
                                  <Clock size={14} className="text-amber-600" />
                                  <span className="text-xs font-nekstmedium text-amber-700">
                                    Ожидает
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                {o.metadata?.processed ? (
                                  <>
                                    <button
                                      onClick={(e) => handleView(e, o)}
                                      title="Просмотреть результаты"
                                      disabled={viewLoadingId === o.id}
                                      className="group/btn inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                      onMouseDown={(e) => e.stopPropagation()}
                                    >
                                      {viewLoadingId === o.id ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                          <span className="text-xs font-nekstregular text-blue-600">
                                            Загрузка...
                                          </span>
                                        </>
                                      ) : (
                                        <Eye
                                          size={16}
                                          className="text-blue-600 group-hover/btn:scale-110 transition-transform"
                                        />
                                      )}
                                    </button>
                                    <button
                                      onClick={(e) => handleEdit(e, o)}
                                      title="Редактировать"
                                      className="group/btn p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200"
                                      onMouseDown={(e) => e.stopPropagation()}
                                    >
                                      <Edit2
                                        size={16}
                                        className="text-purple-600 group-hover/btn:scale-110 transition-transform"
                                      />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedOrder(o);
                                      setIsViewOnly(false);
                                      setStep(1);
                                    }}
                                    className="group/btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white text-xs font-nekstmedium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                  >
                                    <span>Обработать</span>
                                    <svg
                                      className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile: карточки */}
                  <div className="md:hidden space-y-3 p-3">
                    {filteredOrders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          if (o.metadata?.processed) {
                            handleView(
                              { stopPropagation: () => {} } as React.MouseEvent,
                              o,
                            );
                          } else {
                            setSelectedOrder(o);
                            setIsViewOnly(false);
                            setStep(1);
                          }
                        }}
                        className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 active:scale-[0.98] transition-transform cursor-pointer"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-nekstmedium text-gray-700">
                                {o.id}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-nekstmedium text-gray-900">
                                Заявка #{o.id}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {o.date}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Поле:</span>
                            <span className="font-nekstregular text-gray-900">
                              {o.fieldId ? `Field ID: ${o.fieldId}` : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {o.orderType === 'SPLIT' ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200">
                              <svg
                                className="w-3 h-3 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-xs font-nekstmedium text-purple-700">
                                Разбиение
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200">
                              <svg
                                className="w-3 h-3 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              <span className="text-xs font-nekstmedium text-blue-700">
                                Обычный
                              </span>
                            </div>
                          )}

                          {o.metadata?.processed ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 border border-emerald-200">
                              <Clock size={12} className="text-emerald-600" />
                              <span className="text-xs font-nekstmedium text-emerald-700">
                                Обработана
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200">
                              <Clock size={12} className="text-amber-600" />
                              <span className="text-xs font-nekstmedium text-amber-700">
                                Ожидает
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {o.metadata?.processed ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(e, o);
                                }}
                                disabled={viewLoadingId === o.id}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-700 text-xs font-nekstmedium disabled:opacity-70"
                              >
                                {viewLoadingId === o.id ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span>Загрузка...</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye size={14} />
                                    <span>Просмотр</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(e, o);
                                }}
                                className="px-3 py-2 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 text-purple-700"
                              >
                                <Edit2 size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(o);
                                setIsViewOnly(false);
                                setStep(1);
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-nekstmedium shadow-lg"
                            >
                              <span>Обработать</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 flex flex-wrap items-center gap-2">
                  <span className="break-all">Заявка #{selectedOrder.id}</span>
                  {selectedOrder.orderType === 'SPLIT' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 text-purple-700 text-xs font-nekstmedium whitespace-nowrap">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Только разбиение</span>
                      <span className="sm:hidden">Разбиение</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 text-blue-700 text-xs font-nekstmedium whitespace-nowrap">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Обычный
                    </span>
                  )}
                </div>
                <div className="text-base md:text-lg font-semibold mt-1">
                  {selectedOrder.orderType === 'SPLIT'
                    ? 'Разбиение поля'
                    : 'Пошаговая обработка поля'}
                </div>
              </div>
            </div>

            {(selectedOrder.orderType ?? 'DEFAULT') === 'SPLIT' ? (
              // Упрощенный интерфейс для SPLIT - два шага: 1-загрузка, 4-результат
              <div className="space-y-6">
                {step === 1 && (
                  // Режим редактирования - загрузка и анализ
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-100">
                      <div className="lg:col-span-1 space-y-4">
                        {/* <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                          <div className="text-sm text-gray-500">Поле</div>
                          <div className="text-lg font-medium mt-1">
                            {selectedOrder.fieldName}
                          </div>
                        </div> */}
                        <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                          <div className="text-sm text-gray-500">
                            Тип заявки
                          </div>
                          <div className="mt-2">
                            <div className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-lg p-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-purple-700 text-xs">
                                <strong>Только разбиение:</strong> Генерация
                                карты разбиения поля на участки без анализа и
                                построения маршрутов
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                          <div className="text-sm font-medium mb-2">
                            Загрузка данных поля
                          </div>
                          <FieldJsonUploader
                            initialParsed={
                              selectedOrder.metadata?.uploadedJson ?? null
                            }
                            onParsed={(p) =>
                              setSelectedOrder((so) =>
                                so
                                  ? ({
                                      ...so,
                                      metadata: {
                                        ...(so.metadata ?? {}),
                                        uploadedJson: p,
                                      },
                                    } as Order)
                                  : so,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(null);
                          setStep(1);
                          setIsViewOnly(false);
                        }}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                      >
                        Отмена
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={runAnalyze}
                          disabled={isAnalyzeDisabled}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
                        >
                          {calcInProgress ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>Анализ... {calcProgress}%</span>
                            </>
                          ) : (
                            <span>Запустить разбиение</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-100">
                  <div className="lg:col-span-1 space-y-4">
                    {/* <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                      <div className="text-sm text-gray-500">Поле</div>
                      <div className="text-lg font-medium mt-1">
                        {selectedOrder.fieldName}
                      </div>
                    </div> */}
                    <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                      <div className="text-sm text-gray-500">Тип заявки</div>
                      <div className="mt-2">
                        {(selectedOrder.orderType ?? 'DEFAULT') === 'SPLIT' ? (
                          <div className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-lg p-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-purple-700 text-xs">
                              <strong>Только разбиение:</strong> Генерация карты
                              разбиения поля на участки без анализа и построения
                              маршрутов
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-blue-700 text-xs">
                              <strong>Обычный:</strong> Полный цикл обработки —
                              анализ поля, построение маршрутов дронов,
                              опрыскивание и отчёты
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                      <div className="text-sm font-medium mb-2">Параметры</div>
                      {selectedOrder.orderType === 'DEFAULT' ? (
                        <ModernSelect
                          label="Индекс"
                          options={[
                            'ARVI',
                            'DVI',
                            'EVI',
                            'GEMI',
                            'IPVI',
                            'NDVI',
                            'PVI',
                            'RVI',
                            'SARVI',
                            'SAVI',
                            'TSAVI',
                            'TVI',
                            'WDVI',
                          ]}
                          value={selectedIndex}
                          onChange={setSelectedIndex}
                        />
                      ) : (
                        <div className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-lg p-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-purple-700 text-xs">
                            Для типа "Только разбиение" выбор индекса не
                            требуется
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                      <div className="text-sm font-medium mb-2">
                        Загрузить JSON поля
                      </div>
                      <FieldJsonUploader
                        initialParsed={
                          selectedOrder.metadata?.uploadedJson ?? null
                        }
                        onParsed={(p) =>
                          setSelectedOrder((so) =>
                            so
                              ? ({
                                  ...so,
                                  metadata: {
                                    ...(so.metadata ?? {}),
                                    uploadedJson: p,
                                  },
                                } as Order)
                              : so,
                          )
                        }
                      />
                    </div>

                    <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                      <button
                        onClick={closeSelected}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={isAnalyzeDisabled ? undefined : runAnalyze}
                        disabled={isAnalyzeDisabled}
                        className={`px-5 py-2 rounded-lg text-sm font-medium select-none transition
    flex items-center justify-center gap-2
    ${
      isAnalyzeDisabled
        ? 'bg-gray-200 text-gray-400 border border-gray-200 shadow-none opacity-80 cursor-not-allowed'
        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] active:scale-[0.97] cursor-pointer'
    }`}
                      >
                        {calcInProgress ? (
                          <>
                            <Loader size={18} />
                            <span>Загрузка…</span>
                          </>
                        ) : (
                          'Запустить анализ'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  {((selectedOrder.orderType ?? 'DEFAULT') === 'SPLIT'
                    ? ['areasWithFullIdsImage']
                    : [
                        'originalImage',
                        'indexImage',
                        'areasWithFullIdsImage',
                        'indexWithBoundsImage',
                      ]
                  ).map((k) => {
                    const img =
                      selectedOrder.metadata?.analyticsImages?.[k] ?? null;
                    const label =
                      (
                        {
                          originalImage: 'Original',
                          indexImage: 'Index',
                          areasWithFullIdsImage: 'Areas with Full IDs',
                          indexWithBoundsImage: 'Index with Bounds',
                        } as Record<string, string>
                      )[k] ?? k;
                    return (
                      <div key={k} className="space-y-3">
                        <div className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">{label}</div>
                            {k === 'areasWithFullIdsImage' && !isViewOnly && (
                              <button
                                onClick={() => setMergeOpen((prev) => !prev)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <GitMerge size={18} className="stroke-2" />
                                {mergeOpen
                                  ? 'Скрыть форму'
                                  : 'Объединить участки'}
                              </button>
                            )}
                          </div>
                          <div className="rounded overflow-hidden flex items-center justify-center h-60 sm:h-72 md:h-80 lg:h-96 xl:h-[40rem]">
                            {img ? (
                              <div className="relative w-full h-full group">
                                <img
                                  src={img}
                                  alt={label}
                                  className="object-contain w-full h-full rounded-md cursor-zoom-in"
                                  onClick={() => setModalImage(img)}
                                />
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 flex items-center justify-center w-full h-full">
                                Нет изображения
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Форма объединения появляется сразу после графика areasWithFullIdsImage */}
                        {k === 'areasWithFullIdsImage' &&
                          mergeOpen &&
                          !isViewOnly && (
                            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    Объединить участки
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                  value={mergePlot1}
                                  onChange={(e) =>
                                    setMergePlot1(e.target.value)
                                  }
                                  placeholder="plotId 1"
                                  className="px-3 py-2 rounded-lg bg-gray-50 focus:bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                                />
                                <input
                                  value={mergePlot2}
                                  onChange={(e) =>
                                    setMergePlot2(e.target.value)
                                  }
                                  placeholder="plotId 2"
                                  className="px-3 py-2 rounded-lg bg-gray-50 focus:bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setMergeOpen(false)}
                                    className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                    disabled={mergingInProgress}
                                  >
                                    Отмена
                                  </button>
                                  <button
                                    onClick={applyMerge}
                                    disabled={mergingInProgress}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    {mergingInProgress && (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    )}
                                    {mergingInProgress
                                      ? 'Объединение...'
                                      : 'Применить'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-4">
                  {getOrderedTables(selectedOrder.metadata?.analyticsTables)
                    .length > 0 ? (
                    getOrderedTables(
                      selectedOrder.metadata?.analyticsTables,
                    ).map(([k, rows]) => (
                      <div key={k}>{renderTableCard(k, rows ?? null)}</div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">
                      Таблицы отсутствуют.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div />
                  <div className="flex gap-2">
                    {!isViewOnly && (
                      <button
                        onClick={() => {
                          setStep(1);
                          setIsViewOnly(false);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                      >
                        Назад
                      </button>
                    )}
                    {!isViewOnly && (
                      <button
                        onClick={() => setStep(3)}
                        className="px-4 py-2 rounded bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      >
                        Далее — выбрать дроны
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm">
                    <div className="text-sm font-medium mb-2">
                      Области (Areas with Full IDs)
                    </div>
                    <div
                      className="rounded overflow-hidden flex items-center justify-center 
                h-48 sm:h-56 md:h-64 lg:h-80 xl:h-130"
                    >
                      {areasImg ? (
                        <img
                          src={areasImg}
                          alt="areas"
                          className="object-contain w-full h-full rounded-md cursor-zoom-in"
                          onClick={() => setModalImage(areasImg)}
                        />
                      ) : (
                        <div className="text-xs text-gray-400 flex items-center justify-center w-full h-full">
                          Нет изображения
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm">
                    <div className="text-sm font-medium mb-2">
                      Индексы (Index with Bounds)
                    </div>
                    <div className=" rounded overflow-hidden flex items-center justify-center h-48 sm:h-56 md:h-64 lg:h-80 xl:h-130">
                      {indexBoundsImg ? (
                        <img
                          src={indexBoundsImg}
                          alt="index"
                          className="object-contain w-full h-full rounded-md cursor-zoom-in"
                          onClick={() => setModalImage(indexBoundsImg)}
                        />
                      ) : (
                        <div className="text-xs text-gray-400">
                          Нет изображения
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">Кластеры поля</div>
                    <button
                      onClick={clearAssignments}
                      className="text-xs px-2 py-1 rounded bg-gray-50 border border-gray-100"
                    >
                      Сбросить
                    </button>
                  </div>

                  <div className="max-h-[1000px] overflow-y-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-xs text-gray-500 text-left">
                            Кластер
                          </th>
                          <th className="px-3 py-2 text-xs text-gray-500 text-left">
                            Пиксели
                          </th>
                          <th className="px-3 py-2 text-xs text-gray-500 text-left">
                            % площади
                          </th>
                          <th className="px-3 py-2 text-xs text-gray-500 text-left">
                            NDVI сред
                          </th>
                          <th className="px-3 py-2 text-xs text-gray-500 text-left">
                            NDVI стд
                          </th>
                          <th className="px-3 py-2 text-xs text-gray-500 text-left">
                            Центроид
                          </th>
                          <th className="px-3 py-2 text-xs text-gray-500 text-left">
                            Дрон (назначение)
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {clusterRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="p-4 text-xs text-gray-500"
                            >
                              Кластеры отсутствуют
                            </td>
                          </tr>
                        ) : (
                          clusterRows.map((r: any, i: number) => (
                            <tr
                              key={i}
                              className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                            >
                              <td className="px-4 py-3 font-medium whitespace-nowrap">
                                {formatCell(r.cluster_id)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {formatCell(
                                  r.size_pixels ?? r.size ?? r.pixels,
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {formatCell(r.area_percentage ?? r.area_pct)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {formatCell(r.NDVI_mean ?? r.ndvi_mean)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {formatCell(r.NDVI_std ?? r.ndvi_std)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {formatCell(r.centroid_x)},{' '}
                                {formatCell(r.centroid_y)}
                              </td>
                              <td className="px-4 py-3">
                                <DroneDropdown
                                  value={clusterAssignments[r.cluster_id] ?? ''}
                                  options={droneOptions}
                                  onChange={(val) =>
                                    setClusterAssignments((s) => ({
                                      ...s,
                                      [r.cluster_id]: val,
                                    }))
                                  }
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-lg">
                  <div className="text-sm font-semibold mb-4 text-gray-800">
                    Назначение количества дронов
                  </div>

                  {(() => {
                    const assignedIndices = Array.from(
                      new Set(
                        Object.values(clusterAssignments).filter(Boolean),
                      ),
                    ).sort((a, b) => a - b);

                    const assignedDrones = assignedIndices
                      .map((index) => availableDrones[index - 1])
                      .filter((d): d is Drone => d !== undefined);

                    if (assignedDrones.length === 0) {
                      return (
                        <div className="text-xs text-gray-400 italic">
                          Нет назначенных дронов. Назначьте дрон хотя бы одному
                          кластеру.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {assignedDrones.map((drone, i) => (
                          <div
                            key={drone.droneId}
                            className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="w-10 text-sm font-mono text-gray-700 text-center">
                              {i + 1}
                            </div>

                            <div className="flex-1 text-sm font-medium text-gray-900">
                              {drone.droneName}{' '}
                              <span className="text-gray-400">
                                (ID: {drone.droneId})
                              </span>
                            </div>

                            <div className="flex-none">
                              <input
                                type="number"
                                min={1}
                                max={drone.quantity}
                                value={
                                  droneQuantities[drone.droneId] === 0
                                    ? ''
                                    : (droneQuantities[drone.droneId] ??
                                      Math.max(1, drone.quantity ?? 1))
                                }
                                onChange={(e) => {
                                  const textVal = e.target.value;
                                  if (textVal === '') {
                                    setDroneQuantities((s) => ({
                                      ...s,
                                      [drone.droneId]: 0,
                                    }));
                                    return;
                                  }

                                  let val = Number(textVal);
                                  if (Number.isNaN(val) || val < 1) return;

                                  const max = drone.quantity ?? 1;
                                  if (val > max) val = max;

                                  setDroneQuantities((s) => ({
                                    ...s,
                                    [drone.droneId]: val,
                                  }));
                                }}
                                className="w-20 px-3 py-2 rounded-lg bg-white focus:bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-center shadow-sm"
                                title={`Макс: ${drone.quantity ?? 1}`}
                              />
                            </div>

                            <div className="w-16 text-xs text-gray-500 text-center">
                              /{drone.quantity ?? 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="rounded-xl p-4 bg-white border-gray-100">
                  <div className="mt-3 flex items-center justify-end gap-2">
                    {!isViewOnly && (
                      <button
                        onClick={() => setStep(2)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                      >
                        Назад
                      </button>
                    )}
                    <button
                      onClick={
                        calcInProgress || !allClustersAssigned
                          ? undefined
                          : applyFinal
                      }
                      disabled={calcInProgress || !allClustersAssigned}
                      style={{
                        cursor:
                          calcInProgress || !allClustersAssigned
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                      className={`px-4 py-2 rounded flex items-center justify-center gap-2 transition-all
    ${
      calcInProgress || !allClustersAssigned
        ? 'bg-gray-200 text-gray-500'
        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105'
    }
  `}
                    >
                      {calcInProgress ? (
                        <>
                          <Loader size={18} />
                          <span>Загрузка...</span>
                        </>
                      ) : (
                        'Запустить финальную обработку'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {(selectedOrder.orderType ?? 'DEFAULT') === 'SPLIT' ? (
                  // Упрощенный результат для SPLIT - только изображение
                  <>
                    {!isViewOnly &&
                      selectedOrder.metadata?.analyticsImages
                        ?.areasWithFullIdsImage && (
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border border-emerald-200 shadow-md">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-nekstmedium text-emerald-900">
                                Результат разбиения поля
                              </h3>
                              <p className="text-sm text-emerald-700 mt-0.5">
                                Карта участков успешно сгенерирована
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm">
                      <div className="text-sm font-medium mb-2">
                        Карта разбиения поля
                      </div>
                      <div className="h-48 sm:h-56 md:h-64 lg:h-80 xl:h-130 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                        {selectedOrder.metadata?.analyticsImages
                          ?.areasWithFullIdsImage ? (
                          <img
                            src={
                              selectedOrder.metadata.analyticsImages
                                .areasWithFullIdsImage
                            }
                            alt="Карта разбиения"
                            className="object-contain h-full w-full rounded-md cursor-zoom-in"
                            onClick={() =>
                              setModalImage(
                                selectedOrder.metadata?.analyticsImages
                                  ?.areasWithFullIdsImage ?? null,
                              )
                            }
                          />
                        ) : (
                          <div className="text-xs text-gray-400">
                            Нет изображения
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(null);
                          setStep(1);
                          setIsViewOnly(false);
                        }}
                        className="px-4 py-2 rounded bg-emerald-600 text-white"
                      >
                        Завершить
                      </button>
                    </div>
                  </>
                ) : (
                  // Полный результат для DEFAULT
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {[
                        'originalImage',
                        'indexImage',
                        'areasWithFullIdsImage',
                        'indexWithBoundsImage',
                        'areasWithSegmentsAndFullIds',
                      ].map((k) => {
                        const img =
                          selectedOrder.metadata?.analyticsImages?.[k] ?? null;
                        const label =
                          (
                            {
                              originalImage: 'Original',
                              indexImage: 'Index',
                              areasWithFullIdsImage: 'Areas with Full IDs',
                              indexWithBoundsImage: 'Index with Bounds',
                              areasWithSegmentsAndFullIds:
                                'Areas with Segments and Full IDs',
                            } as Record<string, string>
                          )[k] ?? k;
                        return (
                          <div
                            key={k}
                            className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm "
                          >
                            <div className="text-sm font-medium mb-2">
                              {label}
                            </div>
                            <div className="h-48 sm:h-56 md:h-64 lg:h-80 xl:h-130 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                              {img ? (
                                <img
                                  src={img}
                                  alt={label}
                                  className="object-contain h-full w-full rounded-md cursor-zoom-in"
                                  onClick={() => setModalImage(img)}
                                />
                              ) : (
                                <div className="text-xs text-gray-400">
                                  Нет изображения
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-4">
                      {getOrderedTables(selectedOrder.metadata?.analyticsTables)
                        .length > 0 ? (
                        getOrderedTables(
                          selectedOrder.metadata?.analyticsTables,
                        ).map(([k, rows]) => (
                          <div key={k}>{renderTableCard(k, rows ?? null)}</div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500">
                          Таблицы отсутствуют.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      {!isViewOnly && (
                        <button
                          onClick={() => setStep(3)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                        >
                          Назад
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(null);
                          setStep(1);
                        }}
                        className="px-4 py-2 rounded bg-emerald-600 text-white"
                      >
                        Завершить
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {modalImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalImage(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-[calc(100vw-64px)] max-h-[calc(100vh-64px)]">
            <button
              onClick={() => setModalImage(null)}
              className="absolute -right-2 -top-2 z-[210] bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={modalImage}
              alt="preview full"
              className="w-full h-full object-contain rounded-md shadow-2xl"
              style={{
                maxHeight: 'calc(100vh - 96px)',
                maxWidth: 'calc(100vw - 96px)',
              }}
            />
          </div>
        </div>
      )}

      {/* Toast уведомление */}
      {toast && (
        <div
          className={`fixed z-[100] bottom-4 right-4 px-4 py-2 rounded-lg shadow-md flex flex-col gap-1
      w-[min(350px,90vw)]
      bg-emerald-50 border border-emerald-200 text-emerald-900
    `}
          style={{ animation: 'toast-fadein 0.3s, toast-fadeout 0.4s 3.1s' }}
        >
          <div className="flex justify-between items-center">
            <div className="text-sm font-nekstmedium">{toast}</div>
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
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }
`}</style>
    </div>
  );
}

function useDropdownPosition(open: boolean) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>();

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + 4,
      left: r.left,
      width: r.width,
    });
  }, [open]);

  return { anchorRef, pos };
}

export function DroneDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Вычисляем позицию dropdown
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [open]);

  // Закрытие по клику вне
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const label = options.find((o) => o.value === value)?.label ?? '—';

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="relative w-full rounded-lg bg-white py-2 pl-3 pr-8 text-left text-sm shadow-md hover:shadow-lg transition"
      >
        <span className="block truncate">{label}</span>
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
          ▾
        </span>
      </button>

      {open && pos && (
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
          }}
          className="z-[100] max-h-60 overflow-auto rounded-lg bg-white py-1 text-sm shadow-xl ring-1 ring-gray-200"
          onMouseDown={(e) => e.stopPropagation()} // предотвращает закрытие dropdown при клике
        >
          {/* пустой вариант */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              onChange('');
              setOpen(false);
            }}
            className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-50"
          >
            —
          </div>

          {options.map((opt) => (
            <div
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 transition ${
                opt.value === value
                  ? 'bg-blue-50 text-blue-900 font-medium'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
