'use client';
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Listbox,
  ListboxOptions,
  ListboxOption,
  Transition,
} from '@headlessui/react';
import { Fragment } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
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
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">{name}</div>
        <div className="text-xs text-gray-500">Строк: {rows.length}</div>
      </div>
      <div className="min-w-full max-h-[300px] overflow-y-auto overflow-x-auto">
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

  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergePlot1, setMergePlot1] = useState('');
  const [mergePlot2, setMergePlot2] = useState('');

  // cluster assignments: cluster_id -> 1-based index in droneIds list
  const [clusterAssignments, setClusterAssignments] = useState<
    Record<number, number>
  >({});

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
      const local: Order[] = arr.map((o: any) => ({
        id: Number(o.orderId ?? o.id ?? 0),
        date: new Date(o.createdAt ?? Date.now()).toISOString().slice(0, 10),
        fieldName: o.fieldName ?? `ID:${o.id ?? o.orderId}`,
        status: 'new' as OrderStatus,
        preview: { fieldPhoto: null },
        metadata: { raw: o, processed: false, inputs: [], latestInput: null },
      }));
      setOrders(local);
      await checkInputsForOrders(local);
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
      setMergeOpen(false);
    } catch (e) {
      console.error('applyMerge error', e);
      alert('Ошибка при вызове merge.');
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
          : so,
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
      setIsViewOnly(true);
      setStep(2);
    } catch (e) {
      console.error('handleView error', e);
      alert('Ошибка при получении результата.');
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

  // Проверяем, назначен ли дрон каждому кластеру.
  const allClustersAssigned =
    clusterRows.length > 0 &&
    clusterRows.every(
      (r) =>
        clusterAssignments[r.cluster_id] !== undefined &&
        clusterAssignments[r.cluster_id] !== '',
    );

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
              const disabled = isViewOnly && idx !== 2;
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
                <div className="max-h-[300px] overflow-y-auto">
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
                </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-100">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm">
                    <div className="text-sm font-medium mb-2">
                      Области (Areas with Full IDs)
                    </div>
                    <div className="h-56 rounded overflow-hidden flex items-center justify-center">
                      {areasImg ? (
                        <img
                          src={areasImg}
                          alt="areas"
                          className="object-contain w-full h-full rounded-md"
                          onClick={() => setModalImage(areasImg)}
                        />
                      ) : (
                        <div className="text-xs text-gray-400">
                          Нет изображения
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-100 p-3 bg-white shadow-sm">
                    <div className="text-sm font-medium mb-2">
                      Индексы (Index with Bounds)
                    </div>
                    <div className="h-56 rounded overflow-hidden flex items-center justify-center">
                      {indexBoundsImg ? (
                        <img
                          src={indexBoundsImg}
                          alt="index"
                          className="object-contain w-full h-full rounded-md"
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

                  <div className="max-h-[300px] overflow-y-auto">
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
                  {/* <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">
                      Предпросмотр тела запроса
                    </div>
                    <div className="text-xs text-gray-500">
                      Проверьте перед отправкой
                    </div>
                  </div>
                  <pre className="max-h-48 overflow-auto text-xs bg-gray-50 p-2 rounded-md border border-gray-100">
                    {(() => {
                      const assignedIndices = Array.from(
                        new Set(
                          Object.values(clusterAssignments).filter(Boolean),
                        ),
                      ).sort((a, b) => a - b);
                      const finalDroneIds = assignedIndices
                        .map((index) => availableDrones[index - 1]?.droneId)
                        .filter((id): id is number => id !== undefined);

                      const indexMap: Record<number, number> =
                        assignedIndices.reduce(
                          (acc, oldIndex, newIndex) => {
                            acc[oldIndex] = newIndex + 1; // oldIndex (1-based) -> newIndex (1-based) в finalDroneIds
                            return acc;
                          },
                          {} as Record<number, number>,
                        );

                      const finalDroneTasks: Record<string, number> = {};
                      Object.keys(clusterAssignments).forEach((k) => {
                        const clusterId = Number(k);
                        const assignedIdx = clusterAssignments[clusterId];
                        if (!assignedIdx) return;
                        const newIndex = indexMap[assignedIdx];
                        if (newIndex) {
                          finalDroneTasks[String(clusterId)] = newIndex;
                        }
                      });

                      const finalNumType = Object.fromEntries(
                        finalDroneIds.map((dbId, i) => {
                          const quantityFromState = droneQuantities[dbId];
                          const defaultQuantity =
                            availableDrones.find((d) => d.droneId === dbId)
                              ?.quantity ?? 1;
                          return [
                            String(i + 1),
                            quantityFromState ?? Math.max(1, defaultQuantity),
                          ];
                        }),
                      );

                      return JSON.stringify(
                        {
                          inputId:
                            selectedOrder?.metadata?.latestInput?.id ?? null,
                          processingMode,
                          droneIds: finalDroneIds,
                          droneTasks: finalDroneTasks,
                          numType: finalNumType,
                        },
                        null,
                        2,
                      );
                    })()}
                  </pre> */}

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow active:scale-[0.98] transition"
                    >
                      Назад
                    </button>
                    <button
                      onClick={applyFinal}
                      disabled={calcInProgress || !allClustersAssigned}
                      className={`px-4 py-2 rounded ${!allClustersAssigned || calcInProgress ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'}`}
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
