'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Edit,
  Check,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  MapPin,
  Save,
  User,
  Package,
  FileText,
  Upload,
  Layers,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

type Status =
  | 'new'
  | 'in_progress'
  | 'planned'
  | 'completed'
  | 'rejected'
  | 'clarify';

interface Order {
  id: number;
  date: string;
  customer: string;
  field: string;
  crop: string;
  type: string;
  area: number;
  status: Status;
  supplier?: string | null;
  operator?: string | null;
  coords?: [number, number][];
  report?: { url?: string; notes?: string } | null;
  metadata?: { name?: string; area?: string; parcels?: string; crop?: string };
  preview?: {
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
    pathsPreview?: string | null;
  };
  // manager/operator workflow fields
  wavelengthMode?: 'auto' | 'manual';
  wavelengths?: string | null;
  selectedIndex?: string | null;
  clustered?: boolean;
  splitDone?: boolean;
  pathsDone?: boolean;
}

export default function ManagerDashboard() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 101,
      date: '2025-10-15',
      customer: 'Иван Петров',
      field: 'Поле №3 (Южное)',
      crop: 'Пшеница',
      type: 'Опрыскивание',
      area: 45,
      status: 'new',
    },
    // {
    //   id: 102,
    //   date: '2025-10-12',
    //   customer: 'ООО Агро',
    //   field: 'Поле №1 (Северное)',
    //   crop: 'Кукуруза',
    //   type: 'Внесение удобрений',
    //   area: 32,
    //   status: 'in_progress',
    //   supplier: 'Агроматснаб',
    // },
    // {
    //   id: 103,
    //   date: '2025-10-05',
    //   customer: 'Петров А.',
    //   field: 'Поле №2',
    //   crop: 'Подсолнечник',
    //   type: 'Картографирование',
    //   area: 28,
    //   status: 'planned',
    //   supplier: 'ДронПарк',
    //   operator: 'Оператор 1',
    //   coords: [
    //     [54.885, 37.62],
    //     [54.886, 37.624],
    //     [54.887, 37.62],
    //   ],
    //   preview: { pathsPreview: null },
    // },
  ]);

  const [temp, setTemp] = useState('1.jpg');

  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [query, setQuery] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isNewOrder, setIsNewOrder] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<
    'supplier' | 'operator' | null
  >(null);

  const [reportViewer, setReportViewer] = useState<Order | null>(null);

  const [form, setForm] = useState<Partial<Order>>({});
  const [preview, setPreview] = useState<Order['preview'] | null>(null);
  const [metadata, setMetadata] = useState<Order['metadata'] | null>(null);

  useEffect(() => {
    if (editingOrder) {
      setForm(editingOrder);
      setPreview(editingOrder.preview ?? null);
      setMetadata(editingOrder.metadata ?? null);
    } else {
      setForm({ date: new Date().toISOString().slice(0, 10), status: 'new' });
      setPreview(null);
      setMetadata(null);
    }
  }, [editingOrder, drawerOpen]);

  const filtered = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (
      filterType !== 'all' &&
      o.type.toLowerCase() !== filterType.toLowerCase()
    )
      return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !String(o.id).includes(q) &&
        !o.field.toLowerCase().includes(q) &&
        !o.customer.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const openNewOrder = () => {
    setIsNewOrder(true);
    setEditingOrder(null);
    setDrawerOpen(true);
  };

  const openEditOrder = (order: Order) => {
    setIsNewOrder(false);
    setEditingOrder(order);
    setDrawerOpen(true);
  };

  const openAssign = (order: Order, target: 'supplier' | 'operator') => {
    setEditingOrder(order);
    setAssignTarget(target);
    setAssignModalOpen(true);
  };

  const approveOrder = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'in_progress' } : o)),
    );
  };

  const requestClarify = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'clarify' } : o)),
    );
  };

  const planRoutes = (id: number, coords: [number, number][]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, coords, status: 'planned' } : o)),
    );
  };

  const completeOrder = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'completed' } : o)),
    );
  };

  const saveFromDrawer = () => {
    if (!form.field || !form.type) {
      alert('Заполните поле и тип обработки');
      return;
    }
    const payload: Order = {
      id: isNewOrder
        ? Math.max(0, ...orders.map((o) => o.id)) + 1
        : (form.id as number),
      date: form.date || new Date().toISOString().slice(0, 10),
      customer: form.customer || 'Не указано',
      field: (form.field as string) || '—',
      crop: form.crop || metadata?.crop || '—',
      type: (form.type as string) || '—',
      area: Number(form.area) || 0,
      status: (form.status as Status) || 'new',
      supplier: form.supplier ?? null,
      operator: form.operator ?? null,
      coords: form.coords ?? undefined,
      preview: preview ?? undefined,
      metadata: metadata ?? undefined,
      report: form.report ?? undefined,
      wavelengthMode: form.wavelengthMode ?? undefined,
      wavelengths: form.wavelengths ?? undefined,
      selectedIndex: form.selectedIndex ?? undefined,
      clustered: form.clustered ?? undefined,
      splitDone: form.splitDone ?? undefined,
      pathsDone: form.pathsDone ?? undefined,
    };

    setOrders((prev) => {
      if (isNewOrder) return [payload, ...prev];
      return prev.map((o) => (o.id === payload.id ? payload : o));
    });

    setDrawerOpen(false);
    setEditingOrder(null);
    setIsNewOrder(false);
  };

  const assignConfirm = (targetValue: string) => {
    if (!editingOrder || !assignTarget) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === editingOrder.id
          ? assignTarget === 'supplier'
            ? { ...o, supplier: targetValue }
            : { ...o, operator: targetValue }
          : o,
      ),
    );
    setAssignModalOpen(false);
    setAssignTarget(null);
    setEditingOrder(null);
  };

  const attachReport = (orderId: number, fileUrl: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, report: { url: fileUrl, notes: 'Отчёт загружен' } }
          : o,
      ),
    );
  };

  const statusLabel = (s: Status) =>
    s === 'new'
      ? 'Новая'
      : s === 'in_progress'
        ? 'В обработке'
        : s === 'planned'
          ? 'Запланирована'
          : s === 'completed'
            ? 'Выполнена'
            : s === 'clarify'
              ? 'Нужна доработка'
              : 'Отклонена';

  // FieldUploader mini — simplified and without leaflet
  const SEGMENTS_IMAGE = '/images/segments-placeholder.jpg';
  const PATHS_IMAGE = '/images/paths-placeholder.jpg';

  function FieldUploaderInlineMini({
    onPreviewChange,
    onMetadata,
  }: {
    onPreviewChange: (p: {
      fieldPreview?: string | null;
      segmentsPreview?: string | null;
      pathsPreview?: string | null;
    }) => void;
    onMetadata: (m: Request['metadata'] | null) => void;
  }) {
    // Взято из компонента заказчика — полноценный загрузчик с разбиением и прокладкой путей
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [fieldPreview, setFieldPreview] = useState<string | null>(null);
    const [isUploadingField, setIsUploadingField] = useState(false);
    const [fieldProgress, setFieldProgress] = useState(0);

    const [isSplitting, setIsSplitting] = useState(false);
    const [splitProgress, setSplitProgress] = useState(0);
    const [segmentsPreview, setSegmentsPreview] = useState<string | null>(null);

    const [isProcessingPaths, setIsProcessingPaths] = useState(false);
    const [pathsPreview, setPathsPreview] = useState<string | null>(null);

    useEffect(() => {
      onPreviewChange({ fieldPreview, segmentsPreview, pathsPreview });
    }, [fieldPreview, segmentsPreview, pathsPreview, onPreviewChange]);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const handleFile = async (f?: File) => {
      if (!f) {
        fileRef.current?.click();
        return;
      }
      const url = URL.createObjectURL(f);
      setFieldPreview(url);
      setIsUploadingField(true);
      setFieldProgress(0);
      for (let i = 1; i <= 12; i++) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(60);
        setFieldProgress(Math.round((i / 12) * 100));
      }
      setIsUploadingField(false);
      setFieldProgress(100);
      // автоматическая «извлечёнка» метаданных
      await sleep(200);
      onMetadata({
        name: `Поле-${Math.floor(Math.random() * 999)}`,
        area: `${(10 + Math.round(Math.random() * 90) / 10).toFixed(1)} ha`,
        parcels: String(1 + Math.round(Math.random() * 5)),
        crop: ['Пшеница', 'Кукуруза', 'Подсолнечник'][
          Math.floor(Math.random() * 3)
        ],
        notes: 'Авто-метаданные',
      });
    };

    const handleSplit = async () => {
      if (!fieldPreview) return;
      setIsSplitting(true);
      setSplitProgress(0);
      setSegmentsPreview(null);
      for (let i = 1; i <= 16; i++) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(70);
        setSplitProgress(Math.round((i / 16) * 100));
      }
      setIsSplitting(false);
      setSplitProgress(100);
      setSegmentsPreview(SEGMENTS_IMAGE);
    };

    const handlePaths = async () => {
      if (!segmentsPreview) return;
      setIsProcessingPaths(true);
      setPathsPreview(null);
      for (let i = 1; i <= 16; i++) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(70);
      }
      setIsProcessingPaths(false);
      setPathsPreview(PATHS_IMAGE);
    };

    return (
      <div className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        <div className="rounded-xl hidden border border-gray-100 p-3 bg-white/90">
          {!fieldPreview && (
            <div className="flex flex-col items-stretch gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="py-2 rounded-lg bg-emerald-500 text-white"
              >
                Выбрать фото поля
              </button>
              <div className="text-sm text-gray-500">
                Или перетащите сюда. После загрузки — разбейте поле на участки и
                проложите пути.
              </div>
            </div>
          )}

          {isUploadingField && (
            <div className="mt-2">
              <div className="text-sm text-gray-600">Загрузка...</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  style={{ width: `${fieldProgress}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                />
              </div>
            </div>
          )}

          {!isUploadingField && fieldPreview && !segmentsPreview && (
            <div className="mt-3">
              <img
                src={fieldPreview}
                alt="field"
                className="w-full h-44 object-cover rounded-md cursor-pointer"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleSplit()}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-white"
                >
                  Разбить на участки
                </button>
                <button
                  onClick={() => {
                    setFieldPreview(null);
                    onMetadata(null);
                  }}
                  className="px-3 py-1 rounded-lg border"
                >
                  Убрать
                </button>
              </div>
            </div>
          )}

          {isSplitting && (
            <div className="mt-3">
              <div className="text-sm text-gray-600">Разбиение на участки…</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  style={{ width: `${splitProgress}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                />
              </div>
            </div>
          )}

          {segmentsPreview && !pathsPreview && (
            <div className="mt-3">
              <img
                src={segmentsPreview}
                alt="segments"
                className="w-full h-44 object-contain rounded-md"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handlePaths()}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-white"
                >
                  Проложить пути
                </button>
                <button
                  onClick={() => setSegmentsPreview(null)}
                  className="px-3 py-1 rounded-lg border"
                >
                  Вернуть
                </button>
              </div>
            </div>
          )}

          {isProcessingPaths && (
            <div className="mt-3 text-sm text-gray-600">Прокладка путей…</div>
          )}

          {pathsPreview && (
            <div className="mt-3">
              <img
                src={pathsPreview}
                alt="paths"
                className="w-full h-44 object-contain rounded-md"
              />
              <div className="mt-3 text-sm text-gray-500">
                Готово — теперь можно сохранить заявку с картой.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  // simulate calculation of wavelengths
  const calculateWavesForOrder = async (o: Order | null) => {
    if (!o) return;
    // simulate network/proc
    setForm((s) => ({ ...s, wavelengthMode: 'auto' }));
    await new Promise((r) => setTimeout(r, 700));
    const generated = '450, 550, 650';
    setForm((s) => ({ ...s, wavelengths: generated, wavelengthMode: 'auto' }));
    // update order preview in list if exists
    setOrders((prev) =>
      prev.map((it) =>
        it.id === o.id
          ? { ...it, wavelengths: generated, wavelengthMode: 'auto' }
          : it,
      ),
    );
    alert('Длины волн сгенерированы: ' + generated);
  };

  const clusterize = async () => {
    // кластеризация теперь только создаёт кластер-превью — разбиение подтверждает менеджер отдельно
    setForm((s) => ({ ...s, clustered: true }));
    // fake processing
    await new Promise((r) => setTimeout(r, 600));
    setPreview((p) => ({ ...(p ?? {}), segmentsPreview: SEGMENTS_IMAGE }));
    alert('Кластеризация завершена — предварительное разбиение готово (демо).');
  };

  const splitField = async () => {
    // отдельный шаг: подтвердить разбиение (раньше был у заказчика)
    setForm((s) => ({ ...s, splitDone: true }));
    await new Promise((r) => setTimeout(r, 500));
    alert('Разбиение поля подтверждено (демо).');
  };

  const generatePaths = async () => {
    setForm((s) => ({ ...s, pathsDone: true }));
    await new Promise((r) => setTimeout(r, 600));
    setPreview((p) => ({ ...(p ?? {}), pathsPreview: PATHS_IMAGE }));
    alert('Маршруты сгенерированы (демо)');
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Панель менеджера — Заказы</h1>
          <div className="text-sm text-gray-500">
            Здесь менеджер (оператор) планирует и выполняет заказы — весь цикл в
            одном интерфейсе.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 bg-white/90 px-3 py-2 rounded-lg border border-gray-100">
            Новых:{' '}
            <span className="font-semibold ml-2">
              {orders.filter((o) => o.status === 'new').length}
            </span>
          </div>
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterType('all');
              setQuery('');
            }}
            className="px-3 py-2 rounded-lg bg-white border border-gray-100 shadow-sm"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => openNewOrder()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Новая заявка
          </button>
        </div>
      </motion.div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Статус</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border"
            >
              <option value="all">Все</option>
              <option value="new">Новые</option>
              <option value="in_progress">В обработке</option>
              <option value="planned">Запланированы</option>
              <option value="completed">Выполнены</option>
              <option value="clarify">Нужна доработка</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Тип</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border"
            >
              <option value="all">Все</option>
              <option value="Опрыскивание">Опрыскивание</option>
              <option value="Внесение удобрений">Внесение удобрений</option>
              <option value="Картографирование">Картографирование</option>
            </select>
          </div>
          <div className="relative">
            <label className="block text-sm text-gray-700 mb-1">Поиск</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Search size={16} />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border"
                placeholder="Номер, поле, заказчик..."
              />
            </div>
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterType('all');
                setQuery('');
              }}
              className="px-4 py-2 rounded-xl border bg-white"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  №
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Дата
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Заказчик / Поле
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Тип
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Площадь
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ресурсы
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{o.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(o.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>{o.customer}</div>
                    <div className="text-xs text-gray-500 mt-1">{o.field}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{o.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {o.area} га
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="text-xs text-gray-500">
                      Поставщик:{' '}
                      <span className="font-medium">{o.supplier ?? '—'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Оператор:{' '}
                      <span className="font-medium">{o.operator ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${o.status === 'new' ? 'bg-yellow-100 text-yellow-800' : o.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : o.status === 'planned' ? 'bg-indigo-100 text-indigo-800' : o.status === 'completed' ? 'bg-green-100 text-green-800' : o.status === 'clarify' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        title="Просмотр"
                        className="text-emerald-600"
                        onClick={() => {
                          setEditingOrder(o);
                          setReportViewer(null);
                          setDrawerOpen(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Утвердить"
                        className="text-emerald-600"
                        onClick={() => approveOrder(o.id)}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        title="Назначить поставщика"
                        className="text-blue-600"
                        onClick={() => openAssign(o, 'supplier')}
                      >
                        <Package size={16} />
                      </button>
                      <button
                        title="Назначить оператора"
                        className="text-blue-600"
                        onClick={() => openAssign(o, 'operator')}
                      >
                        <User size={16} />
                      </button>
                      <button
                        title="Планировать"
                        className="text-indigo-600"
                        onClick={() => {
                          setEditingOrder(o);
                          setDrawerOpen(true);
                        }}
                      >
                        <Layers size={16} />
                      </button>
                      <button
                        title="Отчёт"
                        className="text-gray-600"
                        onClick={() => setReportViewer(o)}
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
          <div className="text-sm text-gray-700">
            Показано <span className="font-medium">{filtered.length}</span> из{' '}
            <span className="font-medium">{orders.length}</span>
          </div>
          <div>
            <button className="px-3 py-1 rounded-md border">Назад</button>
            <button className="px-3 py-1 rounded-md border ml-2">Вперед</button>
          </div>
        </div>
      </div>

      {/* Assign modal */}
      <AnimatePresence>
        {assignModalOpen && editingOrder && assignTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b">
                <div className="text-lg font-semibold">
                  Назначить{' '}
                  {assignTarget === 'supplier' ? 'поставщика' : 'оператора'} для
                  заявки #{editingOrder.id}
                </div>
              </div>
              <div className="p-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Выберите из списка
                </label>
                <select
                  className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                  id="assign-select"
                >
                  {assignTarget === 'supplier' ? (
                    <>
                      <option value="Агроматснаб">Агроматснаб</option>
                      <option value="Поставка+">Поставка+</option>
                      <option value="Агротех">Агротех</option>
                    </>
                  ) : (
                    <>
                      <option value="Оператор 1">Оператор 1</option>
                      <option value="Оператор 2">Оператор 2</option>
                    </>
                  )}
                </select>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    setAssignModalOpen(false);
                    setAssignTarget(null);
                  }}
                  className="px-3 py-2 rounded-lg border"
                >
                  Отменить
                </button>
                <button
                  onClick={() => {
                    const sel = (
                      document.getElementById(
                        'assign-select',
                      ) as HTMLSelectElement
                    ).value;
                    assignConfirm(sel);
                  }}
                  className="px-3 py-2 rounded-lg bg-emerald-500 text-white"
                >
                  Назначить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-full md:w-[920px] z-50 bg-white shadow-2xl overflow-auto"
          >
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-40">
              <div>
                <div className="text-sm text-gray-500">
                  Редактор заказа {editingOrder ? `#${editingOrder.id}` : ''}
                </div>
                <div className="text-lg font-semibold">
                  {editingOrder?.field ?? form.field ?? 'Новая заявка'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (editingOrder) completeOrder(editingOrder.id);
                    setDrawerOpen(false);
                  }}
                  className="px-3 py-2 bg-emerald-500 text-white rounded-lg"
                >
                  Отметить как выполнено
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setEditingOrder(null);
                  }}
                  className="px-3 py-2 bg-white border rounded-lg"
                >
                  Закрыть
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-700">Поле</label>
                        <input
                          value={form.field ?? editingOrder?.field ?? ''}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, field: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700">Тип</label>
                        <input
                          value={form.type ?? editingOrder?.type ?? ''}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, type: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700">
                          Культура
                        </label>
                        <input
                          value={form.crop ?? editingOrder?.crop ?? ''}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, crop: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700">
                          Площадь (га)
                        </label>
                        <input
                          type="number"
                          value={form.area ?? editingOrder?.area ?? ''}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              area: Number(e.target.value),
                            }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-700">
                          Комментарии
                        </label>
                        <textarea
                          value={form.report?.notes ?? ''}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              report: {
                                ...(s.report ?? {}),
                                notes: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <div className="flex items-center hidden justify-between mb-3">
                      <div className="font-medium">
                        Планирование — рабочий процесс оператора
                      </div>
                      <div className="text-sm text-gray-500">
                        Шаги: волны → индекс → кластер → маршруты → отчёт
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldUploaderInlineMini
                          onPreviewChange={(p) => setPreview(p)}
                          onMetadata={(m) => setMetadata(m)}
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Длины волн (выбор клиента)
                          </label>
                          <div className="text-sm text-gray-600">
                            Клиент выбрал:{' '}
                            <strong>
                              {form.wavelengthMode === 'manual'
                                ? 'Предоставлен пакет'
                                : 'Рассчитать за меня'}
                            </strong>
                          </div>

                          {form.wavelengthMode === 'manual' &&
                          form.wavelengths ? (
                            <div className="mt-2 text-sm text-gray-700">
                              Длины волн (из заявки): {form.wavelengths}
                            </div>
                          ) : null}

                          {form.wavelengthMode !== 'manual' && (
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() =>
                                  calculateWavesForOrder(
                                    editingOrder ?? (form as Order),
                                  )
                                }
                                className="px-3 py-2 bg-emerald-500 text-white rounded-lg"
                              >
                                Рассчитать волны
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Выбор индекса
                          </label>
                          <select
                            value={form.selectedIndex ?? 'NDVI'}
                            onChange={(e) =>
                              setForm((s) => ({
                                ...s,
                                selectedIndex: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                          >
                            <option value="NDVI">NDVI</option>
                            <option value="NDRE">NDRE</option>
                            <option value="SAVI">SAVI</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Кластеризация / разбиение
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setTemp('2.jpg')}
                              className="px-3 py-2 bg-indigo-500 text-white rounded-lg"
                            >
                              Кластеризовать
                            </button>
                            <button
                              onClick={() =>
                                setForm((s) => ({ ...s, splitDone: true }))
                              }
                              className="px-3 py-2 border rounded-lg"
                            >
                              Отметить разбиение
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Прокладка дорог
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setTemp('3.jpg')}
                              className="px-3 py-2 bg-indigo-500 text-white rounded-lg"
                            >
                              Сгенерировать маршруты
                            </button>
                            <button
                              onClick={() =>
                                setForm((s) => ({ ...s, pathsDone: true }))
                              }
                              className="px-3 py-2 border rounded-lg"
                            >
                              Отметить маршруты
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Текущее превью / координаты
                          </label>
                          <div className="rounded-md border h-40 p-3 overflow-auto bg-white/95">
                            {!preview?.fieldPreview ? (
                              <img
                                src={`/${temp}`}
                                alt="preview"
                                className="w-full h-32 object-cover rounded-md"
                              />
                            ) : form.coords ? (
                              <div className="text-xs text-gray-700 space-y-1">
                                {(form.coords as [number, number][]).map(
                                  (c, i) => (
                                    <div key={i}>
                                      [{c[0].toFixed(6)}, {c[1].toFixed(6)}]
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">
                                Нет данных превью. Загрузите фото поля или
                                сгенерируйте координаты.
                              </div>
                            )}
                          </div>

                          <div className="mt-2 text-xs text-gray-500">
                            После всех шагов — сохраните заявку и прикрепите
                            отчёт.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Ресурсы</div>
                      <div className="text-sm text-gray-400">Назначьте</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <div>Поставщик</div>
                        <div className="font-medium">
                          {form.supplier ?? editingOrder?.supplier ?? '—'}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>Оператор</div>
                        <div className="font-medium">
                          {form.operator ?? editingOrder?.operator ?? '—'}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            openAssign(
                              editingOrder ?? (form as Order),
                              'supplier',
                            )
                          }
                          className="px-3 py-2 border rounded-lg text-sm"
                        >
                          Назначить поставщика
                        </button>
                        <button
                          onClick={() =>
                            openAssign(
                              editingOrder ?? (form as Order),
                              'operator',
                            )
                          }
                          className="px-3 py-2 border rounded-lg text-sm"
                        >
                          Назначить оператора
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <div className="font-medium mb-2">Отчёт</div>
                    <div className="text-sm text-gray-600">
                      Прикрепите отчёт после выполнения
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          if (editingOrder)
                            attachReport(
                              editingOrder.id,
                              '/reports/sample-report.pdf',
                            );
                          else
                            setForm((s) => ({
                              ...s,
                              report: {
                                url: '/reports/sample-report.pdf',
                                notes: 'Авто',
                              },
                            }));
                          alert('Отчёт прикреплён (демо)');
                        }}
                        className="px-3 py-2 bg-white border rounded-lg"
                      >
                        Загрузить
                      </button>
                      <button
                        onClick={() =>
                          setReportViewer(
                            editingOrder ?? (form as Order as Order),
                          )
                        }
                        className="px-3 py-2 border rounded-lg"
                      >
                        Просмотреть
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <div className="text-sm text-gray-700">Действия</div>
                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        onClick={() => {
                          if (editingOrder) approveOrder(editingOrder.id);
                          else
                            setForm((s) => ({ ...s, status: 'in_progress' }));
                        }}
                        className="px-3 py-2 bg-emerald-500 text-white rounded-lg"
                      >
                        Утвердить
                      </button>
                      <button
                        onClick={() => {
                          if (editingOrder) requestClarify(editingOrder.id);
                          else setForm((s) => ({ ...s, status: 'clarify' }));
                        }}
                        className="px-3 py-2 border rounded-lg"
                      >
                        Запросить доработку
                      </button>
                      <button
                        onClick={() => saveFromDrawer()}
                        className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Report viewer modal */}
      <AnimatePresence>
        {reportViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-auto"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    Отчёт по заявке #{reportViewer.id}
                  </div>
                  <div className="text-lg font-semibold">
                    {reportViewer.field}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setReportViewer(null)}
                    className="px-3 py-2 bg-white border rounded-lg"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
              <div className="p-6">
                {reportViewer.report?.url ? (
                  <div>
                    <div className="mb-4 text-sm text-gray-600">
                      Файл отчёта:{' '}
                      <a
                        className="text-emerald-600"
                        href={reportViewer.report.url}
                      >
                        скачать
                      </a>
                    </div>
                    <div className="text-sm text-gray-700">
                      Примечания: {reportViewer.report.notes}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Отчёт не прикреплён
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
