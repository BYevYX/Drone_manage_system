'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Eye, X, Check, ArrowRight } from 'lucide-react';
import { useGlobalContext } from '@/src/app/GlobalContext';

/**
 * OperatorOrders — улучшения UI
 *
 * Изменения в этой версии:
 * - Убрал кнопку "← Назад" внизу панели и вместо неё добавил кнопку "Run Analytics" в правом нижнем углу.
 *   Кнопка изначально неактивна (серая). Становится активной, когда для выбранной заявки загружён JSON
 *   (selectedOrder.metadata?.uploadedJson).
 * - Кнопка запуска аналитики использует ту же логику runSparseAnalytics.
 * - Модальное окно просмотра картинок стало адаптивным: изображение масштабируется с учетом viewport,
 *   используется max-width и max-height (с отступами), фон кликабелен для закрытия, закрытие по ESC и крестик.
 * - Слегка упрощён и приведён в порядок код показа итогов и загрузчика JSON (FieldJsonUploader принимает initialParsed).
 *
 * Поведение:
 * - Загрузка JSON сохраняется в metadata заявки и один раз загруженный JSON виден при переключении вкладок.
 * - Как только JSON загружен (для выбранной заявки), кнопка "Run Analytics" внизу включается.
 * - После успешной аналитики мы автоматически переключаемся на вкладку "Итог" (activeTab='result').
 */

// -------------------- Типы --------------------
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
  wavelengthsPresent?: boolean;
  assignedOperatorId?: number | null;
  status: OrderStatus;
  preview?: {
    fieldPhoto?: string | null;
    indexPhoto?: string | null;
  };
  stats?: {
    totalFlightTimeMin?: number;
    routesCount?: number;
    segmentsCount?: number;
  };
  metadata?: {
    raw?: any;
    fieldId?: number;
    fieldRaw?: any;
    uploadedJson?: any;
    analyticsResponse?: any;
    analyticsImages?: Record<string, string | null>;
  };
}

// -------------------- ModernSelect --------------------
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
          className={`w-full px-4 py-3 text-left bg-white rounded-xl border shadow-sm flex items-center justify-between transition ${
            open
              ? 'ring-2 ring-emerald-300 border-emerald-300'
              : 'border-gray-200'
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
            className="absolute z-40 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {options.map((o) => (
              <li
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
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

// -------------------- FieldJsonUploader --------------------
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

  useEffect(() => {
    setJsonPreview(initialParsed ?? null);
  }, [initialParsed]);

  const handleFile = async (file?: File) => {
    if (!file) {
      fileRef.current?.click();
      return;
    }
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
                onClick={() => fileRef.current?.click()}
                className="text-xs text-emerald-600 hover:underline"
              >
                Заменить
              </button>
              <button
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

// -------------------- Main component --------------------
export default function OperatorOrders() {
  const { userInfo } = useGlobalContext() as any;
  const API_BASE = 'https://droneagro.duckdns.org';

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

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<
    'all' | 'assigned' | 'data' | 'ready' | 'inwork'
  >('all');
  const [query, setQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // operator UI state
  const [activeTab, setActiveTab] = useState<'data' | 'result'>('data');
  const [selectedIndex, setSelectedIndex] = useState<string>('NDVI');
  const [selectedDrone, setSelectedDrone] = useState<string>('');
  const [metersPerPixel, setMetersPerPixel] = useState<string>('1.0');
  const [nSegments, setNSegments] = useState<string>('2');
  const [widthA, setWidthA] = useState<string>('5');
  const [widthB, setWidthB] = useState<string>('5');

  const [calcInProgress, setCalcInProgress] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);

  const [modalImage, setModalImage] = useState<string | null>(null);

  const indexOptions = [
    'NDVI',
    'RGB Field',
    'NDVI Masked',
    'Split RGB',
    'Split NDVI',
  ];
  const [availableDrones] = useState([
    'DJI Agras T50',
    'JOYANCE JT30L-606',
    'Topxgun FP600',
  ]);

  // load orders (same as before)
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/orders?page=1&limit=200`);
      if (!res.ok) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      const arr = Array.isArray(data.orders) ? data.orders : [];
      const local: Order[] = arr.map((o: any) => {
        const id = Number(o.orderId ?? o.id ?? 0);
        const rawDate = o.dataStart ?? o.dataEnd ?? o.createdAt;
        const dateIso = rawDate
          ? new Date(rawDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        return {
          id,
          date: dateIso,
          fieldName: `ID:${id}`,
          coords: Array.isArray(o.coords) ? o.coords : undefined,
          wavelengthsPresent: Boolean(o.materialsProvided),
          assignedOperatorId: o.contractorId ?? null,
          status: ((): Order['status'] => {
            const low = String(o.status ?? '').toLowerCase();
            if (/complete|done/.test(low)) return 'completed';
            if (/in[_\s]?progress|progress/.test(low)) return 'in_progress';
            if (/data_collection/.test(low)) return 'data_collection';
            if (/ready_for_calc/.test(low)) return 'ready_for_calc';
            if (/assigned/.test(low)) return 'assigned';
            return 'new';
          })(),
          preview: { fieldPhoto: null },
          metadata: { raw: o },
        } as Order;
      });
      setOrders(local);

      // enrich with field info as before
      await Promise.all(
        local.map(async (order) => {
          try {
            const rFields = await authFetch(
              `${API_BASE}/api/orders/${order.id}/fields`,
            );
            if (!rFields.ok) return;
            const dFields = await rFields.json().catch(() => ({}));
            const fieldIds: number[] = Array.isArray(dFields.fieldIds)
              ? dFields.fieldIds
                  .map((n: any) => Number(n))
                  .filter(Number.isFinite)
              : [];
            if (!fieldIds.length) return;
            const fid = fieldIds[0];
            const rField = await authFetch(`${API_BASE}/api/fields/${fid}`);
            if (!rField.ok) return;
            const df = await rField.json().catch(() => ({}));
            const cadastral = df.cadastralNumber ?? df.name ?? `Поле #${fid}`;
            let mapFile: string | null = null;
            if (df.mapFile && typeof df.mapFile === 'string') {
              const txt: string = df.mapFile;
              mapFile = txt.startsWith('data:')
                ? txt
                : `data:image/png;base64,${txt}`;
            }
            setOrders((prev) =>
              prev.map((p) =>
                p.id === order.id
                  ? {
                      ...p,
                      fieldName: cadastral,
                      preview: {
                        ...(p.preview ?? {}),
                        fieldPhoto: mapFile ?? p.preview?.fieldPhoto ?? null,
                      },
                      metadata: {
                        ...(p.metadata ?? {}),
                        fieldId: fid,
                        fieldRaw: df,
                      },
                    }
                  : p,
              ),
            );
          } catch (e) {
            /* ignore per-order errors */
          }
        }),
      );
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'assigned' && o.status !== 'assigned') return false;
      if (filter === 'data' && o.status !== 'data_collection') return false;
      if (filter === 'ready' && o.status !== 'ready_for_calc') return false;
      if (
        filter === 'inwork' &&
        !['calculating', 'segmented', 'routes_planned'].includes(o.status)
      )
        return false;
      if (
        query &&
        !(`${o.id}` + o.fieldName).toLowerCase().includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [orders, filter, query]);

  // ESC modal handler & click on backdrop closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalImage(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const runSparseAnalytics = async (order: Order) => {
    const uploaded = order.metadata?.uploadedJson ?? null;
    if (!uploaded) {
      alert(
        'Сначала загрузите JSON с полями coords_polygon, coords_index, bands_index.',
      );
      return;
    }
    const coords_polygon =
      uploaded.coords_polygon ??
      uploaded.coordsPolygon ??
      uploaded.polygon ??
      null;
    const coords_index = uploaded.coords_index ?? uploaded.coordsIndex ?? null;
    const bands_index =
      uploaded.bands_index ?? uploaded.bandsIndex ?? uploaded.bands ?? null;
    if (!coords_polygon || !coords_index || !bands_index) {
      alert(
        'В загруженном JSON не найдены все требуемые поля: coords_polygon, coords_index, bands_index.',
      );
      return;
    }

    const payload: any = {
      coords_polygon,
      coords_index,
      bands_index,
      index_name: selectedIndex || 'NDVI',
      meters_per_pixel: Number(metersPerPixel),
      n_segments: Number(nSegments),
      width_a: Number(widthA),
      width_b: Number(widthB),
    };

    if (
      !Number.isFinite(payload.meters_per_pixel) ||
      payload.meters_per_pixel <= 0
    ) {
      alert('meters_per_pixel должен быть положительным числом');
      return;
    }
    if (!Number.isFinite(payload.n_segments) || payload.n_segments <= 0) {
      alert('n_segments должен быть положительным числом');
      return;
    }
    if (!Number.isFinite(payload.width_a) || payload.width_a <= 0) {
      alert('width_a должен быть положительным числом');
      return;
    }
    if (!Number.isFinite(payload.width_b) || payload.width_b <= 0) {
      alert('width_b должен быть положительным числом');
      return;
    }

    try {
      setCalcInProgress(true);
      setCalcProgress(10);

      const res = await authFetch(`${API_BASE}/api/analytics/sparse`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCalcProgress(50);
      const text = await res.text().catch(() => '');
      if (!res.ok) {
        console.error('analytics/sparse failed', res.status, text);
        alert('Ошибка при отправке запроса аналитики: ' + (res.status ?? ''));
        setCalcInProgress(false);
        setCalcProgress(0);
        return;
      }
      let parsed: any = {};
      try {
        parsed = JSON.parse(text || '{}');
      } catch {
        parsed = { rawText: text };
      }

      const keys = [
        'rgb_field_image',
        'ndvi_masked_image',
        'clusters_image',
        'split_rgb_image',
        'split_ndvi_image',
        'composite_image',
      ];
      const images: Record<string, string | null> = {};
      keys.forEach((k) => {
        const v = parsed[k] ?? parsed[k.replace(/_image$/, '_img')] ?? null;
        if (!v) {
          images[k] = null;
          return;
        }
        if (typeof v === 'string')
          images[k] = v.startsWith('data:') ? v : `data:image/png;base64,${v}`;
        else images[k] = null;
      });

      setOrders((prev) =>
        prev.map((p) =>
          p.id === order.id
            ? {
                ...p,
                metadata: {
                  ...(p.metadata ?? {}),
                  analyticsResponse: parsed,
                  analyticsImages: images,
                },
              }
            : p,
        ),
      );
      setSelectedOrder((so) =>
        so && so.id === order.id
          ? {
              ...so,
              metadata: {
                ...(so.metadata ?? {}),
                analyticsResponse: parsed,
                analyticsImages: images,
              },
            }
          : so,
      );

      setActiveTab('result');
      setCalcProgress(100);
    } catch (e) {
      console.error(e);
      alert('Ошибка при вызове аналитики.');
    } finally {
      setTimeout(() => {
        setCalcInProgress(false);
        setCalcProgress(0);
      }, 300);
    }
  };

  const handleParsedJsonForOrder = (orderId: number, parsed: any | null) => {
    setOrders((prev) =>
      prev.map((p) =>
        p.id === orderId
          ? { ...p, metadata: { ...(p.metadata ?? {}), uploadedJson: parsed } }
          : p,
      ),
    );
    if (selectedOrder && selectedOrder.id === orderId)
      setSelectedOrder((so) =>
        so
          ? {
              ...so,
              metadata: { ...(so.metadata ?? {}), uploadedJson: parsed },
            }
          : so,
      );
  };

  const openDetail = (o: Order) => {
    setSelectedOrder(o);
    setActiveTab('data');
    setSelectedIndex('NDVI');
    setSelectedDrone('');
    setCalcInProgress(false);
    setCalcProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setSelectedOrder(null);
    setActiveTab('data');
    setSelectedIndex('NDVI');
  };

  const canRun = Boolean(selectedOrder?.metadata?.uploadedJson);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Оперативная панель — Оператор процессов
          </h2>
          <div className="text-sm text-gray-500 mt-1">
            Список назначенных заказов и инструменты обработки полей.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-gray-100">
            В работе:{' '}
            <span className="font-semibold ml-2">
              {orders.filter((o) => o.status !== 'completed').length}
            </span>
          </div>
          <button
            onClick={() => loadOrders()}
            className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2"
            title="Обновить"
          >
            <RefreshCw size={16} /> Обновить
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-full max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-black pointer-events-none z-10">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              placeholder="Поиск по номеру заявки или полю..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg ${filter === 'all' ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-gray-100'}`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`px-3 py-2 rounded-lg ${filter === 'assigned' ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-gray-100'}`}
            >
              Назначенные
            </button>
            <button
              onClick={() => setFilter('data')}
              className={`px-3 py-2 rounded-lg ${filter === 'data' ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-gray-100'}`}
            >
              Сбор данных
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-3 py-2 rounded-lg ${filter === 'ready' ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-gray-100'}`}
            >
              Готовы к расчёту
            </button>
          </div>
        </div>
      </div>

      {!selectedOrder ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">Заявки</div>
            <div className="text-sm text-gray-500">
              Кликните по заявке, чтобы открыть инструменты оператора
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {loading && (
              <div className="p-6 text-sm text-gray-500">
                Загрузка заявок...
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-6 text-sm text-gray-500">
                Нет заявок, подходящих под фильтр.
              </div>
            )}
            {filtered.map((o) => (
              <div
                key={o.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    #{o.id} • {o.fieldName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Дата: {o.date} • Статус:{' '}
                    <span className="font-medium">{o.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDetail(o)}
                    className="px-3 py-2 rounded-md bg-white border border-gray-100 hover:shadow-sm"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">
                Заявка #{selectedOrder.id} • {selectedOrder.fieldName}
              </div>
              <div className="text-lg font-semibold mt-1">
                Инструменты оператора
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-2 rounded-lg bg-white border border-gray-200"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-4">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 rounded-t-lg relative ${activeTab === 'data' ? 'text-emerald-700' : 'text-gray-600'}`}
            >
              <div className="font-medium">Заполнение данных</div>
              {activeTab === 'data' && (
                <div className="absolute left-0 right-0 -bottom-2 h-1 bg-emerald-400 rounded-t-lg shadow-[0_6px_18px_rgba(16,185,129,0.16)]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`px-4 py-2 rounded-t-lg relative ${activeTab === 'result' ? 'text-emerald-700' : 'text-gray-600'}`}
            >
              <div className="font-medium">Итог</div>
              {activeTab === 'result' && (
                <div className="absolute left-0 right-0 -bottom-2 h-1 bg-emerald-400 rounded-t-lg shadow-[0_6px_18px_rgba(16,185,129,0.16)]"></div>
              )}
            </button>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'data' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="rounded-2xl p-4 bg-white shadow border border-gray-100">
                    <div className="text-lg font-semibold mb-2">Фото поля</div>
                    <div className="w-full h-44 rounded-md overflow-hidden mb-3 bg-gray-100 flex items-center justify-center">
                      {selectedOrder.preview?.fieldPhoto ? (
                        <img
                          src={selectedOrder.preview.fieldPhoto}
                          alt="field"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                          Фото поля отсутствует
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Поле:{' '}
                      <span className="font-medium">
                        {selectedOrder.fieldName}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white shadow border border-gray-100">
                    <div className="text-lg font-semibold mb-2">Дрон</div>
                    <ModernSelect
                      label="Выбор дрона"
                      options={availableDrones}
                      value={selectedDrone}
                      onChange={(v) => setSelectedDrone(v)}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Выбор используется для дальнейшей интеграции.
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-2xl p-4 bg-white shadow border border-gray-100">
                    <div className="text-lg font-semibold mb-2">
                      Параметры аналитики
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          Индекс (index_name)
                        </label>
                        <ModernSelect
                          options={indexOptions}
                          value={selectedIndex}
                          onChange={(v) => setSelectedIndex(v)}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          meters_per_pixel
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={metersPerPixel}
                          onChange={(e) => setMetersPerPixel(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          n_segments
                        </label>
                        <input
                          type="number"
                          value={nSegments}
                          onChange={(e) => setNSegments(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">
                            width_a
                          </label>
                          <input
                            type="number"
                            value={widthA}
                            onChange={(e) => setWidthA(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">
                            width_b
                          </label>
                          <input
                            type="number"
                            value={widthB}
                            onChange={(e) => setWidthB(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setMetersPerPixel('1.0');
                          setNSegments('2');
                          setWidthA('5');
                          setWidthB('5');
                          setSelectedIndex('NDVI');
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white shadow border border-gray-100">
                    <div className="text-sm text-gray-600 mb-2">
                      Загрузить JSON поля
                    </div>
                    <FieldJsonUploader
                      initialParsed={
                        selectedOrder.metadata?.uploadedJson ?? null
                      }
                      onParsed={(parsed) =>
                        handleParsedJsonForOrder(selectedOrder.id, parsed)
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl p-4 bg-white shadow border border-gray-100">
                  <div className="text-lg font-semibold mb-2">Итог</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {selectedOrder.metadata?.analyticsResponse
                      ? 'Ниже — изображения, полученные от аналитики.'
                      : 'Выполните аналитику в разделе "Заполнение данных" чтобы увидеть результаты.'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'rgb_field_image', label: 'RGB Field' },
                      { key: 'ndvi_masked_image', label: 'NDVI Masked' },
                      { key: 'clusters_image', label: 'Clusters' },
                      { key: 'split_rgb_image', label: 'Split RGB' },
                      { key: 'split_ndvi_image', label: 'Split NDVI' },
                      { key: 'composite_image', label: 'Composite' },
                    ].map((item) => {
                      const img =
                        selectedOrder.metadata?.analyticsImages?.[item.key] ??
                        null;
                      return (
                        <div key={item.key} className="flex flex-col">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {item.label}
                          </div>
                          <div className="w-full h-48 bg-gray-50 rounded-lg border overflow-hidden flex items-center justify-center">
                            {img ? (
                              <img
                                src={img}
                                alt={item.label}
                                className="w-full h-full object-contain cursor-pointer"
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
                </div>

                <div className="rounded-2xl p-4 bg-white shadow border border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">
                    Ответ сервера (raw)
                  </div>
                  <pre className="max-h-64 overflow-auto text-xs bg-gray-50 p-2 rounded-md">
                    {JSON.stringify(
                      selectedOrder.metadata?.analyticsResponse ?? 'Нет данных',
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Bottom-right Run Analytics button (replaces old "Назад" position) */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              onClick={() => selectedOrder && runSparseAnalytics(selectedOrder)}
              disabled={!canRun || calcInProgress}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                canRun && !calcInProgress
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              title={
                canRun
                  ? 'Запустить аналитику'
                  : 'Загрузите JSON, чтобы включить'
              }
            >
              {calcInProgress ? `Running ${calcProgress}%` : 'Run Analytics'}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen image modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            // close when clicking backdrop (but not when clicking the image itself)
            if (e.target === e.currentTarget) setModalImage(null);
          }}
        >
          <div className="relative w-full max-w-[calc(100vw-64px)] max-h-[calc(100vh-64px)]">
            <button
              onClick={() => setModalImage(null)}
              className="absolute right-2 top-2 z-50 bg-white/90 rounded-full p-2 shadow"
            >
              <X size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
