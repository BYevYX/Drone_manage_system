'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Check,
  ArrowRight,
  Edit2,
} from 'lucide-react';
import { useGlobalContext } from '@/src/app/GlobalContext';

/* --------------------------
   Helpers: ModernSelect, FieldJsonUploader, ensureDataUrl,
   renderTableCard, getOrderedTables, DroneMock, etc.
   (kept the same as in your file; only behavioral changes below)
   -------------------------- */

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
    <div className="space-y-2" ref={ref}>
      {label && <div className="text-sm text-gray-700/90 pl-1.5">{label}</div>}
      <div className="relative">
        <button
          onClick={() => setOpen((s) => !s)}
          type="button"
          className={`w-full px-4 py-3 text-left bg-white rounded-xl border shadow-sm flex items-center justify-between transition ${open ? 'ring-2 ring-emerald-300 border-emerald-300' : 'border-gray-100'}`}
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
            className="absolute z-40 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
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
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm border border-gray-100 overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">{name}</div>
        <div className="text-xs text-gray-500">Строк: {rows.length}</div>
      </div>
      <div className="min-w-full overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  className="text-xs text-gray-500 text-left py-2 pr-3 border-b"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {cols.map((c) => (
                  <td key={c} className="py-2 pr-3 align-top text-gray-700">
                    {r?.[c] === null || r?.[c] === undefined
                      ? '—'
                      : String(r?.[c])}
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

/* DroneMock and getOrderedTables are unchanged (omitted here for brevity in comment) */
interface DroneMock {
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
const droneMocks: DroneMock[] = [
  {
    droneId: 1,
    droneName: 'DJI Agras T50',
    batteryChargeTime: 20,
    flightTime: 25,
    maxWindSpeed: 8,
    maxFlightSpeed: 20,
    maxWorkingSpeed: 8,
    spraying: { id: 1, flowRate: 100, capacity: 8, width: 10 },
    spreading: { id: 2, flowRate: 50, capacity: 6, width: 8 },
    weight: 30,
    liftCapacity: 10,
    width: 1,
    height: 0.8,
    operatingTemperature: -10,
    maxFlightHeight: 120,
    rotationSpeed: 2000,
    imageKey: '',
    quantity: 2,
  },
  {
    droneId: 2,
    droneName: 'JOYANCE JT30L-606',
    batteryChargeTime: 18,
    flightTime: 22,
    maxWindSpeed: 7,
    maxFlightSpeed: 18,
    maxWorkingSpeed: 7,
    spraying: { id: 3, flowRate: 90, capacity: 6, width: 9 },
    spreading: { id: 4, flowRate: 40, capacity: 5, width: 7 },
    weight: 28,
    liftCapacity: 8,
    width: 0.9,
    height: 0.7,
    operatingTemperature: -10,
    maxFlightHeight: 100,
    rotationSpeed: 1900,
    imageKey: '',
    quantity: 1,
  },
  {
    droneId: 3,
    droneName: 'Topxgun FP600',
    batteryChargeTime: 22,
    flightTime: 28,
    maxWindSpeed: 9,
    maxFlightSpeed: 22,
    maxWorkingSpeed: 9,
    spraying: { id: 5, flowRate: 120, capacity: 10, width: 12 },
    spreading: { id: 6, flowRate: 60, capacity: 8, width: 9 },
    weight: 35,
    liftCapacity: 12,
    width: 1.1,
    height: 0.9,
    operatingTemperature: -10,
    maxFlightHeight: 130,
    rotationSpeed: 2100,
    imageKey: '',
    quantity: 3,
  },
];

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
  | 'completed';

interface Order {
  id: number;
  date: string;
  fieldName: string;
  coords?: [number, number][];
  status: OrderStatus;
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
  const API_BASE = 'https://droneagro.duckdns.org';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isViewOnly, setIsViewOnly] = useState(false); // <-- read-only flag for step 2
  const [selectedIndex, setSelectedIndex] = useState('NDVI');
  const [calcInProgress, setCalcInProgress] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [availableDrones] = useState<DroneMock[]>(droneMocks);
  const [selectedDroneIds, setSelectedDroneIds] = useState<number[]>([]);
  const [processingMode, setProcessingMode] = useState<
    'spraying' | 'spreading'
  >('spraying');
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergePlot1, setMergePlot1] = useState('');
  const [mergePlot2, setMergePlot2] = useState('');

  useEffect(() => {
    loadOrders(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
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

  // load orders and then check inputs for each order
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
      const local: Order[] = arr.map((o: any) => ({
        id: Number(o.orderId ?? o.id ?? 0),
        date: new Date(o.createdAt ?? Date.now()).toISOString().slice(0, 10),
        fieldName: o.fieldName ?? `ID:${o.id ?? o.orderId}`,
        status: 'new' as OrderStatus,
        preview: { fieldPhoto: null },
        metadata: { raw: o, processed: false, inputs: [], latestInput: null },
      }));
      setOrders(local);
      // immediately check inputs for each order
      checkInputsForOrders(local);
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
          // pick last by createdAt, fallback to max id
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

  const isJsonUploaded = Boolean(selectedOrder?.metadata?.uploadedJson);
  const isAnalyzeDisabled = calcInProgress || !isJsonUploaded;

  const runAnalyze = async () => {
    if (!selectedOrder) return alert('Выберите заявку и загрузите JSON.');
    const uploaded = selectedOrder.metadata?.uploadedJson ?? null;
    if (!uploaded)
      return alert(
        'Сначала загрузите JSON с полями coords_polygon, coords_index, bands_index.',
      );
    const body = {
      orderId: selectedOrder.id,
      indexName: selectedIndex || 'NDVI',
      payload: uploaded,
    };
    try {
      setCalcInProgress(true);
      setCalcProgress(10);
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
      const out = parsed?.output ?? parsed;
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
      setSelectedOrder((so) =>
        so
          ? ({
              ...so,
              metadata: {
                ...(so.metadata ?? {}),
                analyticsResponse: parsed,
                analyticsImages: images,
                analyticsTables: tables,
              },
            } as Order)
          : selectedOrder,
      );
      setOrders((prev) =>
        prev.map((p) =>
          p.id === selectedOrder.id
            ? ({
                ...p,
                metadata: {
                  ...(p.metadata ?? {}),
                  analyticsResponse: parsed,
                  analyticsImages: images,
                  analyticsTables: tables,
                },
              } as Order)
            : p,
        ),
      );
      setCalcProgress(100);
      setIsViewOnly(false); // analyses started by operator are editable (not view-only)
      setStep(2);
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
        alert('Ошибка при объединении участков.');
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
          : selectedOrder,
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
      setMergeOpen(false);
    } catch (e) {
      console.error('applyMerge error', e);
      alert('Ошибка при вызове merge.');
    }
  };

  const applyFinal = async () => {
    if (!selectedOrder) return alert('Выберите заявку.');
    const parsed = selectedOrder.metadata?.analyticsResponse;
    const inputId =
      parsed?.inputId ?? parsed?.output?.inputId ?? parsed?.input_id ?? null;
    if (!inputId)
      return alert('Не удалось обнаружить inputId в ответе analyze.');
    if (!selectedDroneIds.length) return alert('Выберите хотя бы один дрон.');
    const droneTasks: Record<string, number> = {};
    const numType: Record<string, number> = {};
    selectedDroneIds.forEach((id) => {
      droneTasks[String(id)] = 1;
      numType[String(id)] = 1;
    });
    const body = {
      inputId,
      processingMode,
      droneIds: selectedDroneIds,
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
      setSelectedOrder((so) =>
        so
          ? ({
              ...so,
              metadata: {
                ...(so.metadata ?? {}),
                finalOutput: out,
                analyticsImages: {
                  ...(so.metadata?.analyticsImages ?? {}),
                  ...images,
                },
                analyticsTables: newTables,
              },
            } as Order)
          : selectedOrder,
      );
      setOrders((prev) =>
        prev.map((p) =>
          p.id === selectedOrder.id
            ? ({
                ...p,
                metadata: {
                  ...(p.metadata ?? {}),
                  finalOutput: out,
                  analyticsImages: {
                    ...(p.metadata?.analyticsImages ?? {}),
                    ...images,
                  },
                  analyticsTables: newTables,
                },
              } as Order)
            : p,
        ),
      );
      setCalcProgress(100);
      setStep(4);
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

  const toggleDrone = (id: number) =>
    setSelectedDroneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // VIEW: fetch result and show as read-only
  const handleView = async (e: React.MouseEvent, o: Order) => {
    e.stopPropagation();
    const latest = o.metadata?.latestInput?.id ?? null;
    if (!latest) return alert('Не найден latest inputId для этого ордера.');
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
      // parse images and tables same as analyze/final
      const imageKeys = [
        'originalImage',
        'indexImage',
        'areasWithFullIdsImage',
        'indexWithBoundsImage',
        'areasWithSegmentsAndFullIds',
      ];
      const images: Record<string, string | null> = {};
      imageKeys.forEach((k) => {
        images[k] = ensureDataUrl(result?.[k] ?? null);
      });
      const tables: Record<string, any[] | null> = {};
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
      // set as selected order and move to step 2 (view-only)
      const updatedOrder = {
        ...o,
        metadata: {
          ...(o.metadata ?? {}),
          analyticsResponse: result,
          analyticsImages: {
            ...(o.metadata?.analyticsImages ?? {}),
            ...images,
          },
          analyticsTables: {
            ...(o.metadata?.analyticsTables ?? {}),
            ...tables,
          },
        },
      } as Order;
      setSelectedOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((p) => (p.id === updatedOrder.id ? updatedOrder : p)),
      );
      setIsViewOnly(true); // <-- important: view-only mode
      setStep(2);
    } catch (e) {
      console.error('handleView error', e);
      alert('Ошибка при получении результата.');
    }
  };

  // edit/re-run: open order and clear analytics so user can start over
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
    setIsViewOnly(false); // editing mode
    setStep(1);
  };

  const stepTitles = [
    '1. Загрузить поле',
    '2. Просмотр результатов',
    '3. Выбрать дроны',
    '4. Финальные данные',
  ];

  const closeSelected = () => {
    setSelectedOrder(null);
    setStep(1);
    setIsViewOnly(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Оперативная панель — Оператор процессов
          </h2>
          <div className="text-sm text-gray-500 mt-1">
            Пошаговый процесс обработки: загрузка → анализ → дроны → итог.
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!selectedOrder ? (
            <button
              onClick={() => loadOrders()}
              className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2"
              title="Обновить"
            >
              <RefreshCw size={16} /> Обновить
            </button>
          ) : (
            <button
              onClick={closeSelected}
              className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2"
              title="Закрыть заявку"
            >
              <X size={16} /> Закрыть
            </button>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            {stepTitles.map((t, i) => {
              const idx = (i + 1) as 1 | 2 | 3 | 4;
              const active = step === idx;
              const done = step > idx;
              const disabled = isViewOnly && idx !== 2; // when view-only, only step 2 active
              return (
                <div key={t} className="flex-1">
                  <button
                    onClick={() => {
                      if (disabled) return;
                      setStep(idx);
                    }}
                    className="w-full text-left"
                    aria-disabled={disabled}
                  >
                    <div
                      className={`p-3 rounded-lg border ${active ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100 bg-white'} flex items-center gap-3 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-emerald-600 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {done ? (
                          <Check size={16} />
                        ) : (
                          <span className="font-medium">{idx}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{t}</div>
                        <div className="text-xs text-gray-500">
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

      <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
        {!selectedOrder ? (
          <div>
            <div className="text-sm text-gray-600 mb-3">Выберите заявку</div>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
              {loadingOrders ? (
                <div className="p-6 text-sm text-gray-500">Загрузка...</div>
              ) : orders.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">Нет заявок</div>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Поле
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Дата
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Статус
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                        Действие
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr
                        key={o.id}
                        className={` transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-emerald-50`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          #{o.id}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {o.fieldName}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{o.date}</td>
                        <td className="px-4 py-3 text-sm">
                          {o.metadata?.processed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                              Обработана
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                              Не обработана
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            {o.metadata?.processed ? (
                              <>
                                <button
                                  onClick={(e) => handleView(e, o)}
                                  title="Просмотреть"
                                  className="p-2 rounded-md bg-white hover:bg-gray-50 shadow-sm"
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={(e) => handleEdit(e, o)}
                                  title="Изменить"
                                  className="p-2 rounded-md bg-white hover:bg-gray-50 shadow-sm"
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <Edit2 size={16} />
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
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs"
                              >
                                Обработать
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500">
                  Заявка #{selectedOrder.id} • {selectedOrder.fieldName}
                </div>
                <div className="text-lg font-semibold mt-1">
                  Пошаговая обработка поля
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500">Поле</div>
                    <div className="text-lg font-medium mt-1">
                      {selectedOrder.fieldName}
                    </div>
                  </div>
                  <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                    <div className="text-sm font-medium mb-2">Параметры</div>
                    <ModernSelect
                      label="Индекс"
                      options={[
                        'NDVI',
                        'RGB Field',
                        'NDVI Masked',
                        'Split RGB',
                        'Split NDVI',
                      ]}
                      value={selectedIndex}
                      onChange={setSelectedIndex}
                    />
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
                      className={`px-5 py-2 rounded-lg text-sm font-medium select-none transition ${isAnalyzeDisabled ? 'bg-gray-200 text-gray-400 border border-gray-200 shadow-none opacity-80 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] active:scale-[0.97] cursor-pointer'}`}
                    >
                      {calcInProgress
                        ? `Running ${calcProgress}%`
                        : 'Запустить анализ'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'originalImage',
                    'indexImage',
                    'areasWithFullIdsImage',
                    'indexWithBoundsImage',
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
                        } as Record<string, string>
                      )[k] ?? k;
                    return (
                      <div
                        key={k}
                        className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">{label}</div>
                          {/* hide merge button in view-only mode */}
                          {k === 'areasWithFullIdsImage' && !isViewOnly && (
                            <button
                              onClick={() => setMergeOpen(true)}
                              className="text-xs px-2 py-1 rounded bg-emerald-50 border border-emerald-100"
                            >
                              Объединить участки
                            </button>
                          )}
                        </div>
                        <div className="h-64 rounded overflow-hidden flex items-center justify-center">
                          {img ? (
                            <div className="relative w-full h-full group">
                              <img
                                src={img}
                                alt={label}
                                className="object-contain w-full h-full rounded-md transform transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                                onClick={() => setModalImage(img)}
                              />
                            </div>
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

                {/* merge panel: disabled/hidden in view-only */}
                {mergeOpen && !isViewOnly && (
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
                        onChange={(e) => setMergePlot1(e.target.value)}
                        placeholder="plotId 1"
                        className="px-3 py-2 rounded-lg bg-gray-50 focus:bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                      />
                      <input
                        value={mergePlot2}
                        onChange={(e) => setMergePlot2(e.target.value)}
                        placeholder="plotId 2"
                        className="px-3 py-2 rounded-lg bg-gray-50 focus:bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setMergeOpen(false)}
                          className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                          Отмена
                        </button>
                        <button
                          onClick={applyMerge}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md transition"
                        >
                          Применить
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
                    <button
                      onClick={() => {
                        setStep(1);
                        setIsViewOnly(false);
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                    >
                      Назад
                    </button>

                    {/* if view-only, hide the Next button (no advancing). Otherwise show Next */}
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
                <div className="rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-lg font-semibold">Выбор дронов</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">Режим:</div>
                      <div
                        className="inline-flex p-1 bg-gray-100 rounded-full border border-gray-100"
                        role="tablist"
                        aria-label="Режим обработки"
                      >
                        <button
                          onClick={() => setProcessingMode('spraying')}
                          className={`px-3 py-1 rounded-full text-sm ${processingMode === 'spraying' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                          role="tab"
                          aria-selected={processingMode === 'spraying'}
                        >
                          Spraying
                        </button>
                        <button
                          onClick={() => setProcessingMode('spreading')}
                          className={`px-3 py-1 rounded-full text-sm ${processingMode === 'spreading' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                          role="tab"
                          aria-selected={processingMode === 'spreading'}
                        >
                          Spreading
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableDrones.map((d) => {
                      const selected = selectedDroneIds.includes(d.droneId);
                      return (
                        <div
                          key={d.droneId}
                          onClick={() => toggleDrone(d.droneId)}
                          className={`cursor-pointer p-4 rounded-xl border transition-shadow ${selected ? 'border-emerald-400 shadow-md bg-emerald-50' : 'border-gray-100 bg-white hover:shadow-sm'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">
                              {d.droneName}
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded ${selected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {selected ? 'Выбрано' : 'Выбрать'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            flight: {d.flightTime} min • cap:{' '}
                            {processingMode === 'spraying'
                              ? d.spraying.capacity
                              : d.spreading.capacity}
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Вес: {d.weight}kg • lift: {d.liftCapacity}kg
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                    >
                      Назад
                    </button>
                    <button
                      onClick={applyFinal}
                      disabled={calcInProgress || !selectedDroneIds.length}
                      className={`px-4 py-2 rounded ${!selectedDroneIds.length || calcInProgress ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'}`}
                    >
                      {calcInProgress
                        ? `Running ${calcProgress}%`
                        : 'Запустить финальную обработку'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm"
                      >
                        <div className="text-sm font-medium mb-2">{label}</div>
                        <div className="h-72 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                          {img ? (
                            <img
                              src={img}
                              alt={label}
                              className="object-contain h-full w-full rounded-md"
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
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                  >
                    Назад
                  </button>
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
              </div>
            )}
          </div>
        )}
      </div>

      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalImage(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-[calc(100vw-64px)] max-h-[calc(100vh-64px)]">
            <button
              onClick={() => setModalImage(null)}
              className="absolute right-2 top-2 z-50 bg-white/90 rounded-full p-2 shadow"
            >
              <X size={18} />
            </button>
            <img
              src={modalImage}
              alt="preview full"
              className="w-full h-full object-contain rounded-md"
              style={{
                maxHeight: 'calc(100vh - 96px)',
                maxWidth: 'calc(100vw - 96px)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
