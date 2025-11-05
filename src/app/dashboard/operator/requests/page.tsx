'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  RefreshCw,
  Eye,
  Zap,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useGlobalContext } from '@/src/app/GlobalContext';

/**
 * OperatorOrders
 *
 * Показ списка заявок и панели оператора (не модально — в том же окне).
 * - При клике на заявку открывается панель оператора в том же вью (с кнопкой "Назад")
 * - Добавлены индексы: RGB Field, NDVI Masked, Split RGB, Split NDVI
 * - Добавлен моковый выбор дронов
 * - Логика расчёта/сегментации/маршрутов сохранена (симуляция)
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
    segments?: { id: string; preview?: string | null }[];
    routesPreview?: string | null;
  };
  stats?: {
    totalFlightTimeMin?: number;
    routesCount?: number;
    segmentsCount?: number;
  };
  metadata?: Record<string, any>;
}

// -------------------- ModernSelect (компактный) --------------------
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
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="space-y-2" ref={ref}>
      {label && <div className="text-sm text-gray-700/90 pl-1.5">{label}</div>}
      <div className="relative">
        <button
          onClick={() => setOpen((s) => !s)}
          className={`w-full px-4 py-3.5 text-left bg-white/90 rounded-xl border ${
            open
              ? 'border-emerald-400 ring-2 ring-emerald-400/30'
              : 'border-gray-300/80'
          } shadow-sm flex items-center justify-between`}
        >
          <span className={value ? 'text-gray-700' : 'text-gray-400'}>
            {value || '—'}
          </span>
          <ArrowRight size={16} className="text-gray-400" />
        </button>

        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-30 w-full mt-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80"
          >
            {options.map((o) => (
              <li
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className="px-4 py-2.5 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{o}</span>
                  {value === o && (
                    <Check size={14} className="text-emerald-500" />
                  )}
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}

// -------------------- FieldUploaderInline (упрощённый) --------------------
function FieldUploaderInline({
  onUploaded,
}: {
  onUploaded?: (previewUrl: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) {
      fileRef.current?.click();
      return;
    }
    try {
      const text = await file.text();
      let simulated: string | null = null;
      try {
        const parsed = JSON.parse(text);
        if (parsed.preview) simulated = parsed.preview;
      } catch {
        // not json or no preview
      }
      if (!simulated) {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-size='16'>Field preview</text></svg>`;
        simulated = `data:image/svg+xml;base64,${btoa(svg)}`;
      }
      // small delay to simulate processing
      await new Promise((r) => setTimeout(r, 300));
      setPreview(simulated);
      onUploaded?.(simulated);
    } catch {
      alert('Не удалось загрузить файл поля');
      onUploaded?.(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 p-3 bg-white/90">
      <input
        ref={fileRef}
        type="file"
        accept=".json,image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
      {!preview ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="py-2 rounded-lg bg-emerald-500 text-white"
          >
            Загрузить файл/предпросмотр поля
          </button>
          <div className="text-sm text-gray-500">
            Можно загрузить JSON или картинку поля.
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2 text-sm text-gray-600">Превью поля</div>
          <div className="w-full h-40 rounded-md overflow-hidden mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPreview(null);
                onUploaded?.(null);
              }}
              className="px-3 py-1 rounded-lg border"
            >
              Убрать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------- Основной компонент --------------------
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

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 101,
      date: '2025-10-20',
      fieldName: 'Поле №3 (Южное)',
      coords: [
        [55.751244, 37.618423],
        [55.751244, 37.628423],
        [55.741244, 37.628423],
      ],
      wavelengthsPresent: true,
      assignedOperatorId: 1,
      status: 'assigned',
      preview: { fieldPhoto: null },
    },
    {
      id: 102,
      date: '2025-10-22',
      fieldName: 'Поле №5 (Запад)',
      coords: [
        [55.752, 37.6],
        [55.752, 37.61],
      ],
      wavelengthsPresent: false,
      assignedOperatorId: 1,
      status: 'assigned',
      preview: { fieldPhoto: null },
    },
  ]);

  const [filter, setFilter] = useState<
    'all' | 'assigned' | 'data' | 'ready' | 'inwork'
  >('all');
  const [query, setQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // operator state
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [selectedDrone, setSelectedDrone] = useState<string>('');
  const [calcInProgress, setCalcInProgress] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [segmenting, setSegmenting] = useState(false);
  const [mergeInputA, setMergeInputA] = useState('');
  const [mergeInputB, setMergeInputB] = useState('');
  const [routesPlanned, setRoutesPlanned] = useState(false);

  const indexOptions = ['RGB Field', 'NDVI Masked', 'Split RGB', 'Split NDVI'];
  const [availableDrones] = useState([
    'DJI Agras T50',
    'JOYANCE JT30L-606',
    'Topxgun FP600',
  ]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'assigned' && o.status !== 'assigned') return false;
      if (filter === 'data' && o.status !== 'data_collection') return false;
      if (filter === 'ready' && o.status !== 'ready_for_calc') return false;
      if (
        filter === 'inwork' &&
        ['calculating', 'segmented', 'routes_planned'].indexOf(o.status) === -1
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

  // --- actions (simulated) ---
  const startDataCollection = async (o: Order) => {
    updateOrderStatus(o.id, 'data_collection');
    alert(`Для заявки #${o.id} установлен статус "Сбор данных".`);
    setTimeout(
      () => {
        updateOrder((prev) =>
          prev.map((p) =>
            p.id === o.id
              ? {
                  ...p,
                  wavelengthsPresent: true,
                  preview: {
                    ...p.preview,
                    fieldPhoto: p.preview?.fieldPhoto ?? null,
                  },
                }
              : p,
          ),
        );
        updateOrderStatus(o.id, 'ready_for_calc');
        alert(`Заявка #${o.id} готова для расчёта`);
      },
      1500 + Math.random() * 2000,
    );
  };

  const setReadyForCalc = (o: Order) => {
    if (o.wavelengthsPresent) {
      updateOrderStatus(o.id, 'ready_for_calc');
      alert(`Заявка #${o.id} переведена в "Готов для расчёта"`);
    } else {
      const ok = confirm('Данных по длинам волн нет. Начать сбор данных?');
      if (ok) startDataCollection(o);
    }
  };

  const calculateIndex = async (o: Order) => {
    if (!selectedIndex) {
      alert('Выберите индекс.');
      return;
    }
    if (!selectedDrone) {
      alert('Выберите модель дрона.');
      return;
    }
    setCalcInProgress(true);
    setCalcProgress(0);
    updateOrderStatus(o.id, 'calculating');
    for (let i = 1; i <= 8; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 200));
      setCalcProgress(Math.round((i / 8) * 100));
    }
    const svgIndex = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='#fff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#10b981' font-size='20'>${selectedIndex} — ${selectedDrone} (order ${o.id})</text></svg>`;
    const indexData = `data:image/svg+xml;base64,${btoa(svgIndex)}`;
    updateOrder((prev) =>
      prev.map((p) =>
        p.id === o.id
          ? { ...p, preview: { ...p.preview, indexPhoto: indexData } }
          : p,
      ),
    );
    setCalcInProgress(false);
    setCalcProgress(0);
    alert('Расчёт индекса завершён — превью доступно.');
    updateOrderStatus(o.id, 'segmented');
  };

  const segmentField = async (o: Order) => {
    setSegmenting(true);
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
    const seg1Svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'><rect width='100%' height='100%' fill='#fff7ed'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#f97316' font-size='16'>Segments preview A (order ${o.id})</text></svg>`;
    const seg2Svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'><rect width='100%' height='100%' fill='#eef2ff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6366f1' font-size='16'>Segments preview B (order ${o.id})</text></svg>`;
    const s1 = `data:image/svg+xml;base64,${btoa(seg1Svg)}`;
    const s2 = `data:image/svg+xml;base64,${btoa(seg2Svg)}`;
    const segments = [
      { id: `S-${o.id}-1`, preview: s1 },
      { id: `S-${o.id}-2`, preview: s2 },
    ];
    updateOrder((prev) =>
      prev.map((p) =>
        p.id === o.id
          ? {
              ...p,
              preview: { ...p.preview, segments },
              stats: { ...(p.stats ?? {}), segmentsCount: segments.length },
            }
          : p,
      ),
    );
    setSegmenting(false);
    alert('Поле разобито на участки.');
    updateOrderStatus(o.id, 'segmented');
  };

  const mergeSegments = async (o: Order, a: string, b: string) => {
    if (!o.preview?.segments) {
      alert('Нет сегментов.');
      return;
    }
    if (!a || !b) {
      alert('Введите два ID.');
      return;
    }
    const segIds = o.preview.segments.map((s) => s.id);
    if (!segIds.includes(a) || !segIds.includes(b)) {
      alert('Участки не найдены.');
      return;
    }
    if (a === b) {
      alert('Нельзя объединить один и тот же участок.');
      return;
    }
    if (Math.random() < 0.1) {
      alert('Геометрия конфликтует.');
      return;
    }
    const newId = `S-${o.id}-M-${Date.now() % 10000}`;
    const mergedSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'><rect width='100%' height='100%' fill='#ecfccb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#65a30d' font-size='16'>Merged ${a}+${b}</text></svg>`;
    const mergedPreview = `data:image/svg+xml;base64,${btoa(mergedSvg)}`;
    updateOrder((prev) =>
      prev.map((p) =>
        p.id === o.id
          ? {
              ...p,
              preview: {
                ...p.preview!,
                segments: [
                  ...p.preview!.segments.filter(
                    (s) => s.id !== a && s.id !== b,
                  ),
                  { id: newId, preview: mergedPreview },
                ],
              },
            }
          : p,
      ),
    );
    alert(`Участки ${a} и ${b} объединены в ${newId}`);
  };

  const planRoutes = async (o: Order) => {
    const segCount = o.preview?.segments?.length ?? 0;
    if (segCount === 0) {
      alert('Нет участков для маршрутов.');
      return;
    }
    updateOrderStatus(o.id, 'routes_planned');
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
    const totalTime = Math.round(segCount * (15 + Math.random() * 20));
    const routesSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='#f0fdf4'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#059669' font-size='20'>Routes planned (${segCount} segments) • ${totalTime} min</text></svg>`;
    const previewRoutes = `data:image/svg+xml;base64,${btoa(routesSvg)}`;
    updateOrder((prev) =>
      prev.map((p) =>
        p.id === o.id
          ? {
              ...p,
              preview: { ...p.preview, routesPreview: previewRoutes },
              stats: {
                ...(p.stats ?? {}),
                totalFlightTimeMin: totalTime,
                routesCount: segCount,
              },
            }
          : p,
      ),
    );
    setRoutesPlanned(true);
    alert('Маршруты проложены.');
  };

  const completeOrder = async (o: Order) => {
    updateOrderStatus(o.id, 'completed');
    alert(`Заявка #${o.id} помечена как выполненная.`);
  };

  const downloadReport = (o: Order) => {
    const report = {
      orderId: o.id,
      field: o.fieldName,
      date: o.date,
      status: o.status,
      stats: o.stats ?? {},
      segments: o.preview?.segments?.map((s) => ({ id: s.id })) ?? [],
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_order_${o.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Отчёт сгенерирован (json).');
  };

  const updateOrderStatus = (id: number, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  const updateOrder = (updater: (prev: Order[]) => Order[]) =>
    setOrders((prev) => updater(prev));

  // Open detail in the same view
  const openDetail = (o: Order) => {
    setSelectedOrder(o);
    setSelectedIndex('');
    setSelectedDrone('');
    setCalcInProgress(false);
    setCalcProgress(0);
    setSegmenting(false);
    setMergeInputA('');
    setMergeInputB('');
    setRoutesPlanned(false);
    // scroll into view (optional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to list
  const goBack = () => {
    setSelectedOrder(null);
    // clear operator selections
    setSelectedIndex('');
    setSelectedDrone('');
  };

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
            onClick={() => setOrders((s) => [...s])}
            className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2"
            title="Обновить"
          >
            <RefreshCw size={16} /> Обновить
          </button>
        </div>
      </div>

      {/* Top controls */}
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

      {/* If no order selected — show the list; otherwise show operator panel (in-page) */}
      {!selectedOrder ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">Заявки</div>
            <div className="text-sm text-gray-500">
              Кликните по заявке, чтобы открыть инструменты оператора
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.length === 0 && (
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
                    title="Открыть"
                    className="px-3 py-2 rounded-md bg-white border border-gray-100 hover:shadow-sm"
                  >
                    <Eye size={16} />
                  </button>
                  {o.status === 'assigned' && !o.wavelengthsPresent && (
                    <button
                      onClick={() => startDataCollection(o)}
                      className="px-3 py-2 rounded-md bg-amber-50 border border-amber-100 text-amber-700"
                    >
                      Запустить сбор данных
                    </button>
                  )}
                  {o.status === 'assigned' && o.wavelengthsPresent && (
                    <button
                      onClick={() => setReadyForCalc(o)}
                      className="px-3 py-2 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700"
                    >
                      Готов к расчёту
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Operator panel (in-page)
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">
                Заявка #{selectedOrder.id} • {selectedOrder.fieldName}
              </div>
              <div className="text-lg font-semibold mt-1">
                Инструменты оператора
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Статус:{' '}
                <span className="font-medium">{selectedOrder.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goBack}
                className="px-3 py-2 rounded-lg bg-white border border-gray-200"
              >
                ← Назад
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-2 rounded-lg bg-white border border-gray-200"
                title="Закрыть"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="md:col-span-1 space-y-4">
              <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">
                  Фото поля / Preview
                </div>
                <div className="w-full h-44 rounded-md overflow-hidden mb-3 bg-gray-100 flex items-center justify-center">
                  {selectedOrder.preview?.fieldPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedOrder.preview.fieldPhoto}
                      className="w-full h-full object-cover"
                      alt="field"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                      Заглушка: фото поля отсутствует
                    </div>
                  )}
                </div>

                {/* <FieldUploaderInline
                  onUploaded={(preview) => {
                    updateOrder((prev) =>
                      prev.map((p) =>
                        p.id === selectedOrder.id
                          ? {
                              ...p,
                              preview: { ...p.preview, fieldPhoto: preview },
                            }
                          : p,
                      ),
                    );
                    updateOrder((prev) =>
                      prev.map((p) =>
                        p.id === selectedOrder.id
                          ? { ...p, wavelengthsPresent: true }
                          : p,
                      ),
                    );
                  }}
                /> */}
              </div>

              <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">
                  Выберите индекс
                </div>
                <ModernSelect
                  options={indexOptions}
                  value={
                    selectedIndex ||
                    (selectedOrder.wavelengthsPresent ? indexOptions[0] : '')
                  }
                  onChange={(v) => setSelectedIndex(v)}
                />
                <div className="mt-3 text-xs text-gray-500">
                  Индексы: RGB Field, NDVI Masked, Split RGB, Split NDVI.
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Выбор дрона</div>
                <ModernSelect
                  options={availableDrones}
                  value={selectedDrone}
                  onChange={(v) => setSelectedDrone(v)}
                />
                <div className="mt-3 text-xs text-gray-500">
                  Моковый список дронов для симуляции.
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="md:col-span-1 space-y-4">
              <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Расчёт индекса</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Выберите индекс и дрон → нажмите "Вычислить".
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {selectedOrder.status}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => calculateIndex(selectedOrder)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl flex items-center gap-2"
                    disabled={calcInProgress}
                  >
                    <Zap size={16} />{' '}
                    {calcInProgress
                      ? `Вычисление ${calcProgress}%`
                      : 'Вычислить'}
                  </button>

                  <button
                    onClick={() => segmentField(selectedOrder)}
                    className="px-3 py-2 bg-white border border-gray-100 rounded-lg"
                    disabled={segmenting}
                  >
                    Разбить поле на участки
                  </button>

                  <button
                    onClick={() => setReadyForCalc(selectedOrder)}
                    className="px-3 py-2 bg-white border border-gray-100 rounded-lg"
                  >
                    Пометить: готов для расчёта
                  </button>
                </div>

                {calcInProgress && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        style={{ width: `${calcProgress}%` }}
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Прогресс вычисления: {calcProgress}%
                    </div>
                  </div>
                )}

                {selectedOrder.preview?.indexPhoto && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Изображение индекса
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedOrder.preview.indexPhoto}
                      alt="index"
                      className="w-full h-36 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Участки</div>
                {selectedOrder.preview?.segments?.length ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {selectedOrder.preview.segments.map((s) => (
                        <div
                          key={s.id}
                          className="p-2 border rounded-lg text-xs"
                        >
                          <div className="font-medium">{s.id}</div>
                          <div className="mt-2 h-20 overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
                            {s.preview ? (
                              <img
                                src={s.preview}
                                alt={s.id}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-gray-400">
                                Нет превью
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center">
                      <input
                        className="px-3 py-2 rounded-lg border w-32"
                        placeholder="ID A"
                        value={mergeInputA}
                        onChange={(e) => setMergeInputA(e.target.value)}
                      />
                      <input
                        className="px-3 py-2 rounded-lg border w-32"
                        placeholder="ID B"
                        value={mergeInputB}
                        onChange={(e) => setMergeInputB(e.target.value)}
                      />
                      <button
                        onClick={() =>
                          mergeSegments(selectedOrder, mergeInputA, mergeInputB)
                        }
                        className="px-3 py-2 bg-white border rounded-lg"
                      >
                        Объединить
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500">
                    Сегменты не сгенерированы
                  </div>
                )}
              </div>
            </div>

            {/* Column 3 */}
            <div className="md:col-span-1 space-y-4">
              <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">
                  Прокладка маршрутов
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  После разбиения — проложите маршруты и сохраните отчёт.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => planRoutes(selectedOrder)}
                    className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-lg"
                  >
                    Проложить маршруты
                  </button>
                </div>

                {selectedOrder.preview?.routesPreview && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Превью маршрутов
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedOrder.preview.routesPreview}
                      alt="routes"
                      className="w-full h-40 object-cover rounded-md border"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Оценочное время полёта:{' '}
                      {selectedOrder.stats?.totalFlightTimeMin ?? '—'} мин
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">
                  Завершение заявки
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Поставьте статус "Выполнен", когда всё готово.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => completeOrder(selectedOrder)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl"
                  >
                    Отметить как выполнено
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              onClick={goBack}
              className="px-4 py-2 bg-white border rounded-lg"
            >
              ← Назад
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
