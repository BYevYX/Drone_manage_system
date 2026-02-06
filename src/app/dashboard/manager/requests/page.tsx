'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Eye,
  RefreshCw,
  Phone,
  ChevronDown,
  MapPin,
  Calendar,
  Copy,
  Loader2,
  Check,
  Info,
  CheckCircle,
  XCircle,
  CheckCheck,
  Clock,
} from 'lucide-react';
import { ModernSelect } from '../../modernSelect';
import { Loader } from '../../operator/requests/spinner';
// Для отображения спиннера на кнопке "Просмотр"
// Иконки и стили для статусов
const STATUS_ICON: Record<string, JSX.Element> = {
  in_progress: (
    <Clock
      size={16}
      className="inline mr-1 -mt-0.5 text-blue-500 animate-spin-slow"
    />
  ),
  'in progress': (
    <Clock size={16} className="inline mr-1 -mt-0.5 text-blue-500" />
  ),
  processed: (
    <CheckCheck size={16} className="inline mr-1 -mt-0.5 text-yellow-500" />
  ),
  completed: (
    <CheckCircle size={16} className="inline mr-1 -mt-0.5 text-green-500" />
  ),
  cancelled: <XCircle size={16} className="inline mr-1 -mt-0.5 text-red-500" />,
  rejected: <XCircle size={16} className="inline mr-1 -mt-0.5 text-red-500" />,
  clarify: <Info size={16} className="inline mr-1 -mt-0.5 text-gray-500" />,
};

const STATUS_STYLE: Record<string, string> = {
  in_progress: 'bg-blue-100 text-blue-800',
  'in progress': 'bg-blue-100 text-blue-800',
  processed: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
  clarify: 'bg-gray-100 text-gray-800',
};

const statusBadgeClass = (status?: string) => {
  const s = (status ?? '').toLowerCase();
  return STATUS_STYLE[s] || 'bg-gray-100 text-gray-700';
};

const statusBadgeIcon = (status?: string) => {
  const s = (status ?? '').toLowerCase();
  return STATUS_ICON[s] || null;
};

/** Helper functions для результатов */
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
    battery_remaining_after_error: 'Остаток батареи после ошибки',
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
  const cols: string[] = Array.from(
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
            ? 'min-w-full'
            : 'min-w-full max-h-[300px] overflow-x-auto'
        }
      >
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              {cols.map((c: string) => (
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
                {cols.map((c: string) => (
                  <td key={c} className="py-2 pr-3 align-top text-gray-700">
                    {formatCell(r?.[c as keyof typeof r])}
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

function localizeProcessingMode(mode: string): string {
  const modeMap: Record<string, string> = {
    spraying: 'Опрыскивание',
    spreading: 'Разбрасывание',
  };
  return modeMap[mode.toLowerCase()] || mode;
}

function getOrderedTables(tables: Record<string, any[] | null> | undefined) {
  if (!tables) return [] as [string, any[] | null][];
  const preferred = [
    'clusterStatsDf',
    'dronesDf',
    'segmentsDf',
    'segmentSummaryDf',
  ];
  // Маппинг английских названий на русские
  const nameMap: Record<string, string> = {
    clusterStatsDf: 'Статистика по кластерам',
    dronesDf: 'Информация о дронах',
    segmentsDf: 'Сегменты',
    segmentSummaryDf: 'Сводка по сегментам',
  };
  const present: [string, any[] | null][] = [];
  preferred.forEach((k) => {
    if (k in tables) present.push([nameMap[k] || k, tables[k]]);
  });
  Object.keys(tables)
    .sort()
    .forEach((k) => {
      if (!preferred.includes(k)) present.push([nameMap[k] || k, tables[k]]);
    });
  return present;
}

type OperatorProfile = {
  organization?: string;
  organizationName?: string;
  organizationType?: string;
  inn?: string;
  kpp?: string;
  okpoCode?: string;
  addressUr?: string;
  addressFact?: string;
};

type Operator = {
  id: number;
  email: string;
  phone: string;
  userRole: string;
  firstName: string;
  lastName: string;
  surname: string;
  createdAt: string;
  contractorProfile?: OperatorProfile;
};

type ApiOrder = {
  orderId: number;
  contractorId?: number | null;
  contractorPhone?: string | null;
  operatorId?: number | null;
  operatorName?: string | null;
  typeProcessId?: number | null;
  status?: string | null;
  createdAt?: string | null;
  dataStart?: string | null;
  dataEnd?: string | null;
  materialsProvided?: boolean | null;
  preview?: { fieldPreview?: string | null } | null;
  orderType?: 'DEFAULT' | 'SPLIT';
  metadata?: {
    processed?: boolean;
    latestInput?: { id: number; indexName?: string; createdAt?: string } | null;
    analyticsImages?: Record<string, string | null>;
    analyticsTables?: Record<string, any[] | null>;
    analyticsResponse?: any;
  };
  [k: string]: any;
};

const STATUS_LABEL: Record<string, string> = {
  new: 'Новая',
  'in progress': 'В работе',
  in_progress: 'В работе',
  processed: 'Обработана',
  completed: 'Завершена',
  cancelled: 'Отменена',
  rejected: 'Отклонена',
  clarify: 'Нужна доработка',
};

// Типы обработки будут загружаться из API
const TYPE_LABEL: Record<number, string> = {};

const STATUS_OPTIONS = [
  { value: 'In progress', label: 'В работе' },
  { value: 'Processed', label: 'Обработана' },
  { value: 'Completed', label: 'Завершена' },
  { value: 'Cancelled', label: 'Отменена' },
];

// Русифицируем поля
const FIELD_LABELS: Record<string, string> = {
  orderId: 'ID заказа',
  contractorId: 'ID контрактора',
  contractorPhone: 'Телефон контрактора',
  operatorId: 'ID оператора',
  operatorName: 'Имя оператора',
  typeProcessId: 'Тип обработки',
  status: 'Статус',
  createdAt: 'Дата создания',
  dataStart: 'Дата начала',
  dataEnd: 'Дата окончания',
  materialsProvided: 'Материалы предоставлены',
  preview: 'Предпросмотр',
  firstName: 'Имя',
  lastName: 'Фамилия',
};

// Русифицируем поля для ответа API /api/users/{id}
const USER_FIELD_LABELS: Record<string, string> = {
  id: 'ID пользователя',

  contractorEmail: 'Электронная почта',

  phone: 'Телефон',
  userRole: 'Роль пользователя',
  contractorName: 'Имя',
  contractorSurname: 'Отчество',
  contractorLastName: 'Фамилия',
  contractorPhone: 'Телефон',
  surname: 'Отчество',
  createdAt: 'Дата создания',
  'contractorProfile.organization': 'Организация',
  'contractorProfile.organizationName': 'Название организации',
  'contractorProfile.organizationType': 'Тип организации',
  'contractorProfile.inn': 'ИНН',
  'contractorProfile.kpp': 'КПП',
  'contractorProfile.okpoCode': 'ОКПО',
  'contractorProfile.addressUr': 'Юридический адрес',
  'contractorProfile.addressFact': 'Фактический адрес',
  operatorName: 'Имя',
  operatorLastName: 'Фамилия',
  operatorEmail: 'Электронная почта',
  operatorPhone: 'Телефон',
};

export default function FriendlyOrdersPanel() {
  const API_BASE = 'https://api.droneagro.xyz';

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [processingTypes, setProcessingTypes] = useState<
    Array<{ typeId: number; typeName: string; typeDescription: string }>
  >([]);

  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  // Сортировка по статусу заказа
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Фильтр по типу заказа
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  // Пагинация отключена
  const [selected, setSelected] = useState<ApiOrder | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<number | null>(
    null,
  );
  const [viewLoadingId, setViewLoadingId] = useState<number | null>(null);

  const [operatorLoading, setOperatorLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Для отображения результатов
  const [loadingView, setLoadingView] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const loadingCancelledRef = useRef(false);

  // Для даты выезда (визуально, без бэкенда)
  const [departureDate, setDepartureDate] = useState<string>('');
  const [departureDateConfirmed, setDepartureDateConfirmed] = useState(false);

  // dropdown portal state for row actions
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    alignRight: boolean;
    up: boolean;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // inline mobile-expanded status menu (expands card height)
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  // status selector dropdown inside modal
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);

  const assignedOperatorsRef = useRef(false); // prevent repeated runs

  const humanDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString() : '—';

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) baseHeaders.Authorization = `Bearer ${token}`;
    const headers = {
      ...(options.headers as Record<string, string>),
      ...baseHeaders,
    };
    return fetch(url, { ...options, headers });
  };

  // Проверка наличия обработанных данных для заявок
  const checkInputsForOrders = async (currentOrders: ApiOrder[]) => {
    if (!currentOrders || !currentOrders.length) return;
    console.log(
      '[checkInputsForOrders] Проверяем',
      currentOrders.length,
      'заявок',
    );
    try {
      const checks = currentOrders.map(async (ord) => {
        try {
          console.log(
            `[checkInputsForOrders] Заявка #${ord.orderId}: запрос inputs...`,
          );
          const r = await authFetch(
            `${API_BASE}/api/workflow/inputs?orderId=${ord.orderId}`,
          );
          if (!r.ok) {
            console.log(
              `[checkInputsForOrders] Заявка #${ord.orderId}: ошибка ${r.status}`,
            );
            return ord;
          }
          const json = await r.json().catch(() => ({}));
          const inputs = Array.isArray(json.inputs) ? json.inputs : [];
          console.log(
            `[checkInputsForOrders] Заявка #${ord.orderId}: получено ${inputs.length} inputs:`,
            inputs,
          );
          if (!inputs.length) {
            return {
              ...ord,
              metadata: {
                ...(ord.metadata ?? {}),
                processed: false,
                inputs: [],
              },
            } as ApiOrder;
          }
          const sorted = [...inputs].sort((a: any, b: any) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (ta === tb) return (a.id ?? 0) - (b.id ?? 0);
            return ta - tb;
          });
          const last = sorted[sorted.length - 1];
          console.log(
            `[checkInputsForOrders] Заявка #${ord.orderId}: последний input:`,
            last,
          );
          const latestInputId = Number(last.id ?? last.inputId ?? 0);
          console.log(
            `[checkInputsForOrders] Заявка #${ord.orderId}: processed=true, latestInputId=${latestInputId}`,
          );
          return {
            ...ord,
            metadata: {
              ...(ord.metadata ?? {}),
              processed: true,
              inputs,
              latestInput: {
                id: latestInputId,
                indexName: last.indexName ?? last.index_name,
                createdAt: last.createdAt ?? null,
              },
            },
          } as ApiOrder;
        } catch (e) {
          console.warn('checkInputs error for', ord.orderId, e);
          return ord;
        }
      });

      const resolved = await Promise.all(checks);
      setAllOrders(resolved);
    } catch (e) {
      console.error('checkInputsForOrders failed', e);
    }
  };

  // Загрузка результатов обработки для просмотра
  const loadResults = async (order: ApiOrder) => {
    const latest = order.metadata?.latestInput?.id ?? null;
    console.log('[loadResults] inputId:', latest);
    if (!latest) {
      console.log(
        '[loadResults] ❌ Не найден inputId для загрузки результатов',
      );
      return order;
    }

    console.log(`[loadResults] ✅ Загружаем результаты для inputId=${latest}`);
    setLoadingResults(true);
    try {
      console.log(
        `[loadResults] Вызываем: ${API_BASE}/api/workflow/result?inputId=${latest}`,
      );
      const res = await authFetch(
        `${API_BASE}/api/workflow/result?inputId=${latest}`,
      );
      if (!res.ok) {
        console.error(`[loadResults] ❌ result fetch failed: ${res.status}`);
        return order;
      }
      const parsed = await res.json().catch(() => ({}));
      console.log('[loadResults] Получен ответ:', parsed);
      const result = parsed?.result ?? parsed;
      console.log('[loadResults] Обработанный result:', result);

      const isSplit = (order.orderType ?? 'DEFAULT') === 'SPLIT';

      const images: Record<string, string | null> = {};
      if (isSplit) {
        images.areasWithFullIdsImage = ensureDataUrl(
          result?.areasWithFullIdsImage ?? null,
        );
      } else {
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

      return {
        ...order,
        metadata: {
          ...(order.metadata ?? {}),
          analyticsResponse: result,
          analyticsImages: images,
          analyticsTables: isSplit ? {} : tables,
        },
      } as ApiOrder;
    } catch (e) {
      console.error('loadResults error', e);
      return order;
    } finally {
      setLoadingResults(false);
    }
  };

  // --- Загрузка типов обработки
  const loadProcessingTypes = useCallback(async (): Promise<
    Array<{ typeId: number; typeName: string; typeDescription: string }>
  > => {
    try {
      const res = await authFetch(`${API_BASE}/api/processing-types`);
      if (!res.ok) {
        console.error('[loadProcessingTypes] Ошибка загрузки типов обработки');
        return [];
      }
      const data = await res.json();
      if (data && data.types) {
        setProcessingTypes(data.types);
        // Обновляем TYPE_LABEL (с локализацией)
        data.types.forEach((type: any) => {
          TYPE_LABEL[type.typeId] = localizeProcessingMode(type.typeName);
        });
        return data.types;
      }
      return [];
    } catch (err) {
      console.error('[loadProcessingTypes] Ошибка:', err);
      return [];
    }
  }, [API_BASE]);

  // --- fetchOrders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем типы и заказы параллельно для ускорения
      const [types, res] = await Promise.all([
        loadProcessingTypes(),
        authFetch(`${API_BASE}/api/orders?limit=1000`),
      ]);

      // Локальная функция для получения имени типа
      const getTypeLabel = (typeProcessId: number | undefined): string => {
        if (typeProcessId === undefined || typeProcessId === null) {
          return 'Тип не указан';
        }
        const type = types.find((t) => t.typeId === typeProcessId);
        return type
          ? localizeProcessingMode(type.typeName)
          : `Тип #${typeProcessId}`;
      };
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Ошибка получения заказов: ${res.status} ${txt}`);
      }
      console.log(res, 'dadada');
      const data = await res.json();
      const list: ApiOrder[] = Array.isArray(data.orders) ? data.orders : [];
      // Сортируем заявки по ID в порядке убывания
      const sortedList = list.sort((a, b) => b.orderId - a.orderId);
      setAllOrders(sortedList);
      // setPage(1);
      // setPageInput('1');
      assignedOperatorsRef.current = false; // allow re-run operator assignment after fresh fetch

      // Проверяем наличие обработанных данных для заявок
      await checkInputsForOrders(sortedList);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message ?? err));
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // --- fetchOperators (normalize id->number)
  const fetchOperators = useCallback(async () => {
    try {
      setOperatorLoading(true);
      setError(null);
      const res = await authFetch(`${API_BASE}/api/users/operators`);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(
          `Ошибка получения списка операторов: ${res.status} ${txt}`,
        );
      }
      const data = await res.json();
      const list: Operator[] = Array.isArray(data.users)
        ? data.users.map((u: any) => ({ ...u, id: Number(u.id) }))
        : [];
      setOperators(list);
      console.log('FETCH OPERATORS SUCCESS', list);
    } catch (err: any) {
      console.error('Ошибка fetchOperators:', err);
    } finally {
      setOperatorLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    // Загружаем заказы и операторов параллельно
    Promise.all([fetchOrders(), fetchOperators()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- assign operators to existing orders once, safely (no infinite loop)
  useEffect(() => {
    if (assignedOperatorsRef.current) return;
    if (!operators.length || !allOrders.length) return;

    // take snapshot of current orders so that later setAllOrders doesn't retrigger this effect
    assignedOperatorsRef.current = true;
    const ordersSnapshot = allOrders;

    (async () => {
      const updated = [...ordersSnapshot];
      // fetch operator orders in parallel with small concurrency
      const batch = async (ops: Operator[], batchSize = 6) => {
        for (let i = 0; i < ops.length; i += batchSize) {
          const slice = ops.slice(i, i + batchSize);
          const promises = slice.map(async (op) => {
            try {
              const res = await authFetch(
                `${API_BASE}/api/orders/operator/${op.id}`,
              );
              if (!res.ok) return null;
              const data = await res.json();
              return {
                op,
                orders: Array.isArray(data.orders) ? data.orders : [],
              } as { op: Operator; orders: ApiOrder[] } | null;
            } catch (e) {
              console.error('Ошибка проверки ордеров оператора', op.id, e);
              return null;
            }
          });
          const results = await Promise.all(promises);
          results.forEach((r) => {
            if (!r) return;
            r.orders.forEach((o) => {
              const idx = updated.findIndex((u) => u.orderId === o.orderId);
              if (idx >= 0) {
                updated[idx] = {
                  ...updated[idx],
                  operatorId: r.op.id,
                  operatorName: `${r.op.firstName} ${r.op.lastName}`,
                };
              }
            });
          });
        }
      };

      await batch(operators);
      setAllOrders(updated);
    })();
    // intentionally only depend on operators (and initial allOrders snapshot)
  }, [operators, API_BASE]); // API_BASE stable

  // --- pagination helpers
  // useEffect для пагинации удалены

  // Показываем ВСЕ заказы, без фильтрации по статусу
  // Фильтрация по статусу
  const paginatedOrders = useMemo(() => {
    let filtered = allOrders;
    if (statusFilter !== 'all') {
      filtered = allOrders.filter((o) => {
        const st = (o.status ?? '').toLowerCase();
        return st === statusFilter.toLowerCase();
      });
    }
    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter((o) => {
        return (o.orderType ?? 'DEFAULT') === orderTypeFilter;
      });
    }
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'desc') {
        return (
          (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
          (a.createdAt ? new Date(a.createdAt).getTime() : 0)
        );
      } else {
        return (
          (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
          (b.createdAt ? new Date(b.createdAt).getTime() : 0)
        );
      }
    });
    return sorted;
  }, [allOrders, statusFilter, orderTypeFilter, sortOrder]);

  // totalPages больше не нужен

  // --- status update
  const updateOrderStatusApi = useCallback(
    async (orderId: number, statusValue: string) => {
      try {
        setUpdatingId(orderId);
        setAllOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId ? { ...o, status: statusValue } : o,
          ),
        );
        const res = await authFetch(
          `${API_BASE}/api/orders_status/${orderId}`,
          {
            method: 'PUT',
            body: JSON.stringify({ status: statusValue }),
          },
        );
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`Ошибка изменения статуса: ${res.status} ${txt}`);
        }
        const updated = await res.json().catch(() => null);
        if (updated) {
          setAllOrders((prev) =>
            prev.map((o) => (o.orderId === orderId ? { ...o, ...updated } : o)),
          );
        } else {
          await fetchOrders();
        }
        setSelected((s) =>
          s && s.orderId === orderId
            ? { ...(s ?? {}), status: statusValue, ...(updated ?? {}) }
            : s,
        );
      } catch (err: any) {
        console.error(err);
        setError(String(err?.message ?? err));
        await fetchOrders();
      } finally {
        setUpdatingId(null);
      }
    },
    [API_BASE, fetchOrders],
  );

  // --- assign operator
  const fetchContractorDetails = async (contractorId: number) => {
    try {
      const res = await authFetch(`${API_BASE}/api/users/${contractorId}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(
          `Ошибка получения данных контрактора: ${res.status} ${txt}`,
        );
      }
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  };

  const fetchOperatorDetails = async (operatorId: number) => {
    try {
      const response = await authFetch(`${API_BASE}/api/users/${operatorId}`);
      if (!response.ok) {
        const txt = await response.text().catch(() => '');
        throw new Error(
          `Ошибка получения данных контрактора: ${response.status} ${txt}`,
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching operator details:', error);
      return null;
    }
  };

  const assignOperatorToOrder = useCallback(
    async (orderId: number, operatorId: number | null) => {
      if (operatorId === null) {
        console.warn('OperatorId пустой, запрос не выполняется');
        return false;
      }
      const operator = operators.find((o) => o.id === Number(operatorId));
      if (!operator) {
        console.warn('Оператор не найден в списке');
        return false;
      }
      try {
        setUpdatingId(orderId);
        setError(null);
        const res = await authFetch(
          `${API_BASE}/api/orders/${orderId}/take?operatorId=${operatorId}`,
          { method: 'GET' },
        );
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`Ошибка назначения оператора: ${res.status} ${txt}`);
        }
        const updated = await res.json().catch(() => null);
        if (updated) {
          setAllOrders((prev) =>
            prev.map((o) =>
              o.orderId === orderId
                ? {
                    ...o,
                    ...updated,
                    operatorId: operator.id,
                    operatorName: `${operator.firstName} ${operator.lastName}`,
                  }
                : o,
            ),
          );
          // Сразу обновляем selected, чтобы скрыть ModernSelect
          setSelected((s) =>
            s && s.orderId === orderId
              ? {
                  ...s,
                  operatorId: operator.id,
                  operatorName: `${operator.firstName} ${operator.lastName}`,
                }
              : s,
          );
        }
        console.log('ASSIGN SUCCESS', orderId, operatorId);
        return true;
      } catch (err: any) {
        console.error(err);
        await fetchOrders();
        return false;
      } finally {
        setUpdatingId(null);
      }
    },
    [API_BASE, operators, fetchOrders],
  );

  // --- utils
  const renderKeyValueRows = (
    obj: Record<string, any>,
    exclude: string[] = [],
  ) => {
    const entries = Object.entries(obj).filter(
      ([k, v]) =>
        !exclude.includes(k) &&
        v !== undefined &&
        v !== null &&
        String(v) !== '',
    );
    if (entries.length === 0)
      return (
        <div className="text-sm text-slate-500">Нет дополнительных данных</div>
      );
    return (
      <div className="grid grid-cols-1 gap-3">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-start gap-3">
            <div className="text-xs text-slate-400 w-36 capitalize">
              {k.replace(/([A-Z])/g, ' $1')}
            </div>
            <div className="text-sm text-slate-700 break-words">
              {String(v)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const openModal = async (o: ApiOrder) => {
    setPendingStatus(null);
    loadingCancelledRef.current = false;
    setLoadingView(true);
    setViewLoadingId(o.orderId);
    setSelectedOperatorId(o.operatorId ?? null);
    setStatusOpen(false);
    setDepartureDate('');
    setDepartureDateConfirmed(false);

    try {
      let contractorDetails = null;
      let operatorDetails = null;

      if (o.contractorId) {
        contractorDetails = await fetchContractorDetails(o.contractorId);
      }

      if (o.operatorId) {
        operatorDetails = await fetchOperatorDetails(o.operatorId);
      }

      // Проверяем inputs прямо здесь, не полагаясь на state
      let orderWithResults = o;
      console.log('[openModal] Проверяем inputs для заявки #', o.orderId);

      try {
        const inputsRes = await authFetch(
          `${API_BASE}/api/workflow/inputs?orderId=${o.orderId}`,
        );

        if (inputsRes.ok) {
          const inputsJson = await inputsRes.json().catch(() => ({}));
          const inputs = Array.isArray(inputsJson.inputs)
            ? inputsJson.inputs
            : [];
          console.log('[openModal] Найдено inputs:', inputs.length);

          if (inputs.length > 0) {
            // Сортируем и берем последний input
            const sorted = [...inputs].sort((a: any, b: any) => {
              const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              if (ta === tb) return (a.id ?? 0) - (b.id ?? 0);
              return ta - tb;
            });
            const last = sorted[sorted.length - 1];
            const latestInputId = Number(last.id ?? last.inputId ?? 0);

            console.log('[openModal] ✅ Последний inputId:', latestInputId);

            // Обновляем заказ с metadata
            orderWithResults = {
              ...o,
              metadata: {
                ...(o.metadata ?? {}),
                processed: true,
                latestInput: {
                  id: latestInputId,
                  indexName: last.indexName ?? last.index_name,
                  createdAt: last.createdAt ?? null,
                },
              },
            };

            // Загружаем результаты
            orderWithResults = await loadResults(orderWithResults);
          } else {
            console.log('[openModal] ❌ Нет inputs для этой заявки');
          }
        } else {
          console.log(
            '[openModal] ❌ Ошибка загрузки inputs:',
            inputsRes.status,
          );
        }
      } catch (err) {
        console.error('[openModal] Ошибка проверки inputs:', err);
      }

      // Проверяем, не была ли операция отменена
      if (!loadingCancelledRef.current) {
        setSelected({
          ...orderWithResults,
          ...(contractorDetails && {
            contractorName: contractorDetails.firstName,
            contractorLastName: contractorDetails.lastName,
            contractorEmail: contractorDetails.email,
            contractorPhone: contractorDetails.phone,
          }),
          ...(operatorDetails && {
            operatorName: operatorDetails.firstName,
            operatorLastName: operatorDetails.lastName,
            operatorEmail: operatorDetails.email,
            operatorPhone: operatorDetails.phone,
          }),
        });
      } else {
        console.log('[openModal] Операция была отменена');
      }
    } finally {
      if (!loadingCancelledRef.current) {
        setLoadingView(false);
      }
      setViewLoadingId(null);
    }
  };

  // --- combined confirm: assign operator + update status (if needed)
  const handleConfirm = useCallback(async () => {
    if (!selected) return;
    const needAssign =
      selectedOperatorId !== null && selectedOperatorId !== selected.operatorId;
    const needStatus = pendingStatus && pendingStatus !== selected.status;
    if (!needAssign && !needStatus) return;

    try {
      // If assign needed, do it first
      if (needAssign) {
        const ok = await assignOperatorToOrder(
          selected.orderId,
          selectedOperatorId,
        );
        if (!ok) {
          // assign failed, abort
          return;
        }
      }

      if (needStatus) {
        await updateOrderStatusApi(selected.orderId, pendingStatus as string);
      }

      // refresh list to be safe
      await fetchOrders();

      // НЕ закрываем модалку, просто делаем кнопку неактивной
      // setSelected(null);
      // setPendingStatus(null);
      // setStatusOpen(false);
    } catch (e) {
      console.error('Ошибка при подтверждении изменений', e);
    }
  }, [
    selected,
    selectedOperatorId,
    pendingStatus,
    assignOperatorToOrder,
    updateOrderStatusApi,
    fetchOrders,
  ]);

  // --- close modal on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null);
        setPendingStatus(null);
        setOpenDropdownId(null);
        setStatusOpen(false);
      }
    };
    if (selected) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  // --- close status dropdown on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (statusRef.current && statusRef.current.contains(t)) return;
      setStatusOpen(false);
    };
    if (statusOpen) {
      document.addEventListener('mousedown', onDoc);
      document.addEventListener('touchstart', onDoc);
    }
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
    };
  }, [statusOpen]);

  // reposition/close on resize/scroll
  useEffect(() => {
    const handler = () => {
      setOpenDropdownId(null);
      setDropdownPos(null);
      setExpandedCardId(null);
    };
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, []);

  // helper to open dropdown via event target and compute portal position
  const openDropdownFor = (orderId: number, buttonEl: HTMLElement | null) => {
    if (!buttonEl) {
      setOpenDropdownId(null);
      setDropdownPos(null);
      return;
    }

    const rect = buttonEl.getBoundingClientRect();
    const dropdownWidth = 208;
    const itemHeight = 40;
    const dropdownHeight = STATUS_OPTIONS.length * itemHeight + 16;
    const margin = 8;
    let top = rect.bottom + margin;
    let up = false;
    if (rect.bottom + dropdownHeight + margin > window.innerHeight) {
      top = rect.top - dropdownHeight - margin;
      up = true;
      if (top < 8) top = 8;
    }
    let left = rect.right - dropdownWidth;
    if (left < 8) left = 8;
    if (left + dropdownWidth > window.innerWidth - 8)
      left = Math.max(8, window.innerWidth - dropdownWidth - 8);
    setOpenDropdownId(orderId);
    setDropdownPos({
      top: Math.round(top),
      left: Math.round(left),
      alignRight: true,
      up,
    });
  };

  // Close image zoom modal on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalImage) {
        setModalImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalImage]);

  // input commit helpers
  // commitPageInput и commitPageSizeInput больше не нужны

  const hasChanges = useMemo(() => {
    if (!selected) return false;
    const opChanged =
      selectedOperatorId !== null && selectedOperatorId !== selected.operatorId;
    const stChanged = pendingStatus && pendingStatus !== selected.status;
    return opChanged || stChanged;
  }, [selected, selectedOperatorId, pendingStatus]);

  // Для фильтра: русские <-> английские статусы
  const STATUS_LABEL_RU: Record<string, string> = {
    all: 'Все',
    'In progress': 'В работе',
    Processed: 'Обработана',
    Completed: 'Завершена',
    Cancelled: 'Отменена',
  };
  const STATUS_LABEL_EN: Record<string, string> = {
    Все: 'all',
    'В работе': 'In progress',
    Обработана: 'Processed',
    Завершена: 'Completed',
    Отменена: 'Cancelled',
  };
  const STATUS_OPTIONS_RU = [
    'Все',
    ...Object.keys(STATUS_LABEL_EN).filter((k) => k !== 'Все'),
  ];

  // Опции для типа заказа
  const ORDER_TYPE_OPTIONS = [
    'Все',
    'Прокладывание маршрутов для дронов с учетом вегетационных индексов',
    'Разбиение поля на участки без учета вегетационных индексов',
  ];
  const ORDER_TYPE_MAP: Record<string, string> = {
    Все: 'all',
    'Прокладывание маршрутов для дронов с учетом вегетационных индексов':
      'DEFAULT',
    'Разбиение поля на участки без учета вегетационных индексов': 'SPLIT',
  };
  const ORDER_TYPE_LABEL: Record<string, string> = {
    all: 'Все',
    DEFAULT:
      'Прокладывание маршрутов для дронов с учетом вегетационных индексов',
    SPLIT: 'Разбиение поля на участки без учета вегетационных индексов',
  };

  // Сортировка
  const SORT_OPTIONS = [
    { value: 'desc', label: 'Сначала новые' },
    { value: 'asc', label: 'Сначала старые' },
  ];

  // --- UI render
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-nekstmedium text-slate-900">
            Панель заказов — Менеджер
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            title="Обновить"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-white/70 shadow-sm hover:shadow-md transition text-sm md:text-base"
          >
            <RefreshCw size={16} className="md:block" />{' '}
            <span className="hidden sm:inline">Обновить</span>
          </button>
        </div>
      </header>

      <section aria-label="summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-3 md:p-5 shadow-lg">
            <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">
              Всего заказов
            </div>
            <div className="text-xl md:text-3xl font-nekstmedium mt-2 md:mt-3 text-slate-900">
              {allOrders.length}
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">
              Общее кол-во заказов
            </div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-3 md:p-5 shadow-lg">
            <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">
              Обработаны
            </div>
            <div className="text-xl md:text-3xl font-nekstmedium mt-2 md:mt-3 text-yellow-600">
              {
                allOrders.filter(
                  (o) => (o.status ?? '').toLowerCase() === 'processed',
                ).length
              }
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">
              Обработанные оператором заказы
            </div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-3 md:p-5 shadow-lg">
            <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">
              В работе
            </div>
            <div className="text-xl md:text-3xl font-nekstmedium mt-2 md:mt-3 text-sky-600">
              {
                allOrders.filter((o) => {
                  const st = (o.status ?? '').toLowerCase();
                  return st === 'in progress' || st === 'in_progress';
                }).length
              }
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">
              Заказов в работе
            </div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-3 md:p-5 shadow-lg flex flex-col justify-between">
            <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">
              Завершены
            </div>
            <div className="text-xl md:text-3xl font-nekstmedium mt-2 md:mt-3 text-green-600">
              {
                allOrders.filter(
                  (o) => (o.status ?? '').toLowerCase() === 'completed',
                ).length
              }
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">
              Завершенные заказы
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg p-3 bg-rose-50 text-rose-700">{error}</div>
      )}

      <section className="relative py-6">
        <div className="rounded-3xl bg-white/30 backdrop-blur-xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.25)] overflow-hidden border border-white/20">
          {/* Header */}
          <div className="relative px-6 py-5 bg-white/60 backdrop-blur-xl border-b border-white/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Title */}
              <div>
                <h2 className="text-xl sm:text-2xl font-nekstmedium text-slate-900">
                  Список заказов
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Управление и контроль заявок
                </p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ModernSelect
                  width="100%"
                  height={44}
                  label="Статус заказа"
                  options={STATUS_OPTIONS_RU}
                  value={STATUS_LABEL_RU[statusFilter] || 'Все'}
                  onChange={(ruLabel) => {
                    if (!ruLabel || ruLabel === 'Все') {
                      setStatusFilter('all');
                    } else {
                      setStatusFilter(STATUS_LABEL_EN[ruLabel] || 'all');
                    }
                  }}
                  placeholder="Все статусы"
                />

                <ModernSelect
                  width="100%"
                  height={44}
                  label="Тип заказа"
                  options={ORDER_TYPE_OPTIONS}
                  value={ORDER_TYPE_LABEL[orderTypeFilter] || 'Все'}
                  onChange={(label) => {
                    setOrderTypeFilter(ORDER_TYPE_MAP[label] || 'all');
                  }}
                  placeholder="Все типы"
                />

                <ModernSelect
                  width="100%"
                  height={44}
                  label="Сортировка"
                  options={SORT_OPTIONS.map((opt) => opt.label)}
                  value={
                    SORT_OPTIONS.find((opt) => opt.value === sortOrder)?.label
                  }
                  onChange={(label) => {
                    const found = SORT_OPTIONS.find(
                      (opt) => opt.label === label,
                    );
                    if (found) setSortOrder(found.value as 'desc' | 'asc');
                  }}
                  placeholder="По дате"
                />
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="px-4 sm:px-6 py-5 flex flex-col gap-4">
            {loading ? (
              <div className="py-10 text-center text-slate-400 flex items-center font-nekstregular justify-center gap-2">
                <Loader size={22} />
                Загрузка заказов…
              </div>
            ) : allOrders.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                Заказов нет
              </div>
            ) : (
              paginatedOrders.map((o) => (
                <div
                  key={o.orderId}
                  className="group relative rounded-2xl bg-white/60 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-[2px] border border-white/20 overflow-hidden"
                >
                  <div className="p-3 sm:p-4 md:p-5 flex flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-center gap-3 md:gap-4">
                    {/* Left block */}
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-900 flex flex-col items-center justify-center shadow-inner">
                        <div className="text-[8px] md:text-[10px] uppercase tracking-wide">
                          Заказ
                        </div>
                        <div className="text-sm md:text-base font-nekstmedium">
                          #{o.orderId}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-nekstmedium text-slate-900">
                          {TYPE_LABEL[Number(o.typeProcessId ?? -1)] ??
                            `Тип #${String(o.typeProcessId ?? '—')}`}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Создано: {humanDate(o.createdAt)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span>
                            Контрактор #{String(o.contractorId ?? '—')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right block */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-start">
                      {/* Тип заказа */}
                      {/* <div
                        className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-nekstmedium backdrop-blur transition-all duration-200 hover:scale-105 min-w-[110px] justify-center ${
                          o.orderType === 'SPLIT'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {o.orderType === 'SPLIT'
                          ? 'Разбиение поля на участки без учета вегетационных индексов'
                          : 'Прокладывание маршрутов для дронов с учетом вегетационных индексов'}
                      </div> */}

                      {/* Статус */}
                      <div
                        className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-nekstmedium backdrop-blur ${statusBadgeClass(o.status)} transition-all duration-200 hover:scale-105 min-w-[110px] justify-center`}
                      >
                        {statusBadgeIcon(o.status)}
                        {STATUS_LABEL_RU[o.status as string] ?? o.status ?? '—'}
                      </div>

                      <button
                        onClick={() => openModal(o)}
                        className="px-3 md:px-4 py-2 rounded-xl bg-white border border-gray-200 shadow hover:shadow-md font-nekstregular transition inline-flex items-center gap-2 w-full sm:w-auto justify-center text-xs md:text-sm text-slate-900"
                        disabled={viewLoadingId === o.orderId}
                        aria-label={`Просмотр заказа ${o.orderId}`}
                      >
                        {viewLoadingId === o.orderId ? (
                          <>
                            <Loader size={18} />
                            <span className="hidden sm:inline">
                              Загрузка...
                            </span>
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            Просмотр
                          </>
                        )}
                      </button>

                      <div className="relative w-full sm:w-auto">
                        <button
                          onClick={(e) => {
                            const btn = e.currentTarget as HTMLElement;
                            // mobile: expand inline menu
                            if (
                              typeof window !== 'undefined' &&
                              window.innerWidth < 640
                            ) {
                              setExpandedCardId((prev) =>
                                prev === o.orderId ? null : o.orderId,
                              );
                              // ensure portal dropdown closed
                              setOpenDropdownId(null);
                              setDropdownPos(null);
                              return;
                            }
                            if (openDropdownId === o.orderId) {
                              setOpenDropdownId(null);
                              setDropdownPos(null);
                            } else {
                              openDropdownFor(o.orderId, btn);
                            }
                          }}
                          className="px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-nekstregular shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition inline-flex items-center gap-2 w-full sm:w-auto justify-center text-xs md:text-sm"
                        >
                          <span className="hidden sm:inline">
                            Изменить статус
                          </span>
                          <span className="sm:hidden">Статус</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${expandedCardId === o.orderId ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Mobile inline expanded status menu */}
                      {expandedCardId === o.orderId && (
                        <div className="sm:hidden w-full pb-4">
                          <div className="mt-3 bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden w-full">
                            <div className="grid gap-2 py-2">
                              {STATUS_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={async () => {
                                    if (opt.value === 'Cancelled') {
                                      if (
                                        !confirm(
                                          `Отменить заказ #${o.orderId}?`,
                                        )
                                      )
                                        return;
                                    }
                                    await updateOrderStatusApi(
                                      o.orderId,
                                      opt.value,
                                    );
                                    setExpandedCardId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-md bg-slate-50 hover:bg-slate-100 text-sm font-nekstregular"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/50 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-600">
            Показано {paginatedOrders.length} из {allOrders.length} заказов
          </div>
        </div>
      </section>

      {/* Спиннер загрузки просмотра */}
      {loadingView && (
        <div className="fixed inset-0  z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-[70px] rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader size={48} />
            <div className="text-lg font-nekstmedium text-gray-700">
              Загрузка результатов...
            </div>
            <button
              onClick={() => {
                loadingCancelledRef.current = true;
                setLoadingView(false);
                setSelected(null);
              }}
              className="mt-2 inline-flex items-center justify-center px-5 py-2.5 text-sm font-nekstmedium text-gray-600 bg-white border border-gray-200 rounded-xl hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* modal */}
      {selected && !loadingView && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          className="flex items-start justify-center p-3 sm:p-6 pt-12 bg-slate-900/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-5xl mx-auto flex flex-col bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[90vh]">
            {/* header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r rounded-3xl from-emerald-50/60 to-white/40 shadow-sm min-w-0">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-2xl font-nekstmedium text-emerald-800 shadow">
                  {String(selected.orderId).slice(-2)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">
                    Заказ #{selected.orderId}
                  </div>
                  <div className="text-lg font-nekstmedium text-slate-900 truncate">
                    {TYPE_LABEL[Number(selected.typeProcessId ?? -1)] ??
                      `Тип #${String(selected.typeProcessId ?? '—')}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div
                  className={`inline-flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-full font-nekstregular text-xs md:text-sm min-w-[60px] md:min-w-[80px] max-w-[110px] overflow-hidden justify-center ${statusBadgeClass(selected.status)}`}
                >
                  {statusBadgeIcon(selected.status)}
                  <span className="truncate block">
                    {STATUS_LABEL[(selected.status ?? '').toLowerCase()] ??
                      selected.status ??
                      '—'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelected(null);
                    setPendingStatus(null);
                  }}
                  aria-label="Close"
                  className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-white/70 hover:bg-white shadow-md hover:shadow-lg transition inline-flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* body scrollable */}
            <div className="overflow-auto p-5 flex-1">
              {/* wrapper для левой и правой части */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* main */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className=" items-center justify-between">
                      <div className="text-left">
                        <div className="text-xs text-slate-500">Телефон</div>
                        <div className="text-sm font-nekstregular mt-1 flex items-center gap-3">
                          <span className="truncate max-w-xs">
                            {selected.contractorPhone ?? '—'}
                          </span>
                          {selected.contractorPhone && (
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(
                                  String(selected.contractorPhone),
                                );
                                alert('Телефон скопирован');
                              }}
                              className="text-xs text-emerald-600 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50"
                            >
                              <Copy size={14} /> Копировать
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">
                          Временные рамки
                        </div>
                        <div className="text-sm mt-1">
                          {humanDate(selected.dataStart)} —{' '}
                          {humanDate(selected.dataEnd)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-nekstmedium text-slate-700 mb-4">
                      Подробности заказа
                    </div>
                    <div className="space-y-3">
                      {/* Тип заказа */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                        <div className="text-xs text-slate-400 w-32 flex-shrink-0">
                          Тип заказа
                        </div>
                        <div className="text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg font-nekstmedium text-xs ${
                              selected.orderType === 'SPLIT'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {selected.orderType === 'SPLIT'
                              ? 'Разбиение поля на участки без учета вегетационных индексов'
                              : 'Прокладывание маршрутов для дронов с учетом вегетационных индексов'}
                          </span>
                        </div>
                      </div>

                      {/* Тип обработки */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                        <div className="text-xs text-slate-400 w-32 flex-shrink-0">
                          Тип обработки
                        </div>
                        <div className="text-sm text-slate-700">
                          {TYPE_LABEL[Number(selected.typeProcessId ?? -1)] ??
                            `Тип #${String(selected.typeProcessId ?? '—')}`}
                        </div>
                      </div>

                      {/* Статус */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                        <div className="text-xs text-slate-400 w-32 flex-shrink-0">
                          Статус
                        </div>
                        <div className="text-sm text-slate-700">
                          {STATUS_LABEL[
                            (selected.status ?? '').toLowerCase()
                          ] ??
                            selected.status ??
                            '—'}
                        </div>
                      </div>

                      {/* Дата создания */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                        <div className="text-xs text-slate-400 w-32 flex-shrink-0">
                          Дата создания
                        </div>
                        <div className="text-sm text-slate-700">
                          {humanDate(selected.createdAt)}
                        </div>
                      </div>

                      {/* Период выполнения */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                        <div className="text-xs text-slate-400 w-32 flex-shrink-0">
                          Период выполнения
                        </div>
                        <div className="text-sm text-slate-700">
                          {humanDate(selected.dataStart)} —{' '}
                          {humanDate(selected.dataEnd)}
                        </div>
                      </div>

                      {/* Материалы */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                        <div className="text-xs text-slate-400 w-32 flex-shrink-0">
                          Материалы
                        </div>
                        <div className="text-sm text-slate-700">
                          {selected.materialsProvided ? (
                            <span className="text-emerald-600 font-nekstregular">
                              ✓ Предоставлены
                            </span>
                          ) : (
                            <span className="text-amber-600">
                              ✗ Не предоставлены
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Дополнительные поля пользователя */}
                      {Object.entries(selected.contractorProfile || {})
                        .filter(
                          ([k, v]) =>
                            v !== undefined && v !== null && String(v) !== '',
                        )
                        .map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-start gap-3 pb-3 border-b border-slate-100"
                          >
                            <div className="text-xs text-slate-400 w-32 flex-shrink-0 capitalize">
                              {USER_FIELD_LABELS[`contractorProfile.${k}`] ||
                                k.replace(/([A-Z])/g, ' $1')}
                            </div>
                            <div className="text-sm text-slate-700 break-words">
                              {String(v)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Информация о контракторе */}
                  <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-nekstmedium text-slate-700 mb-4">
                      Информация о контракторе
                    </div>
                    <div className="space-y-3">
                      {Object.entries(selected)
                        .filter(([k]) =>
                          [
                            'contractorName',
                            'contractorLastName',
                            'contractorEmail',
                            'contractorPhone',
                          ].includes(k),
                        )
                        .map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-start gap-3 pb-3 border-b border-slate-100"
                          >
                            <div className="text-xs text-slate-400 w-32 flex-shrink-0 capitalize">
                              {USER_FIELD_LABELS[k] ||
                                k.replace(/([A-Z])/g, ' $1')}
                            </div>
                            <div className="text-sm text-slate-700 break-words">
                              {String(v)}
                            </div>
                          </div>
                        ))}

                      {/* Профиль контрактора */}
                      {Object.entries(selected.contractorProfile || {})
                        .filter(
                          ([k, v]) =>
                            v !== undefined &&
                            v !== null &&
                            String(v) !== '' &&
                            typeof v !== 'object',
                        )
                        .map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-start gap-3 pb-3 border-b border-slate-100"
                          >
                            <div className="text-xs text-slate-400 w-32 flex-shrink-0 capitalize">
                              {USER_FIELD_LABELS[`contractorProfile.${k}`] ||
                                k.replace(/([A-Z])/g, ' $1')}
                            </div>
                            <div className="text-sm text-slate-700 break-words">
                              {String(v)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Информация об операторе */}
                  {selected.operatorId && (
                    <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm font-nekstmedium text-slate-700 mb-4">
                        Информация об операторе
                      </div>
                      <div className="space-y-3">
                        {Object.entries(selected)
                          .filter(([k]) =>
                            [
                              'operatorName',
                              'operatorLastName',
                              'operatorEmail',
                              'operatorPhone',
                            ].includes(k),
                          )
                          .map(([k, v]) => (
                            <div
                              key={k}
                              className="flex items-start gap-3 pb-3 border-b border-slate-100"
                            >
                              <div className="text-xs text-slate-400 w-32 flex-shrink-0 capitalize">
                                {USER_FIELD_LABELS[k] ||
                                  k.replace(/([A-Z])/g, ' $1')}
                              </div>
                              <div className="text-sm text-slate-700 break-words">
                                {String(v)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* right */}
                <aside className="space-y-4">
                  <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-slate-500">
                        Назначение оператора
                      </div>
                      {selected.operatorId !== null && (
                        <div className="text-xs text-emerald-600 font-nekstmedium truncate">
                          Назначен
                        </div>
                      )}
                    </div>

                    {selected.operatorId !== null &&
                    selected.operatorId !== undefined ? (
                      <div className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                        <div className="font-nekstregular flex gap-[0px] justify-between">
                          {selected.operatorName ??
                            `Оператор #${selected.operatorId}`}
                          {(() => {
                            const operator = operators.find(
                              (op) => op.id === selected.operatorId,
                            );
                            return operator ? (
                              <div className="text-xs text-slate-500 mt-1">
                                {operator.email}
                              </div>
                            ) : null;
                          })()}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          Оператор уже назначен и не может быть изменен
                        </div>
                      </div>
                    ) : (
                      <ModernSelect
                        // width={200}
                        isFull
                        height={44}
                        dropdownMaxHeight={250}
                        label="Оператор"
                        options={[
                          ...(operatorLoading
                            ? ['Загрузка...']
                            : [
                                'Не назначен',
                                ...operators.map(
                                  (op) =>
                                    `${op.firstName} ${op.lastName} (${op.email})`,
                                ),
                              ]),
                        ]}
                        value={(() => {
                          if (operatorLoading) return 'Загрузка...';
                          if (selectedOperatorId === null) return 'Не назначен';
                          const found = operators.find(
                            (op) => op.id === selectedOperatorId,
                          );
                          return found
                            ? `${found.firstName} ${found.lastName} (${found.email})`
                            : 'Не назначен';
                        })()}
                        onChange={(val) => {
                          if (val === 'Не назначен' || val === 'Загрузка...') {
                            setSelectedOperatorId(null);
                          } else {
                            const found = operators.find(
                              (op) =>
                                `${op.firstName} ${op.lastName} (${op.email})` ===
                                val,
                            );
                            setSelectedOperatorId(found ? found.id : null);
                          }
                        }}
                        disabled={
                          operatorLoading || updatingId === selected.orderId
                        }
                        placeholder="Выберите оператора"
                      />
                    )}
                  </div>

                  {/* Блок выбора даты выезда */}
                  <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-slate-500">
                        Дата выезда сотрудников
                      </div>
                      {departureDateConfirmed && (
                        <div className="text-xs text-emerald-600 font-nekstmedium">
                          Подтверждена
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        disabled={departureDateConfirmed}
                        className={`w-full px-3 py-3 rounded-xl border text-sm transition-all ${
                          departureDateConfirmed
                            ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                        }`}
                        min={new Date().toISOString().split('T')[0]}
                      />

                      {!departureDateConfirmed && departureDate && (
                        <button
                          onClick={() => setDepartureDateConfirmed(true)}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Подтвердить дату
                        </button>
                      )}

                      {departureDateConfirmed && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                          Дата выбрана и подтверждена:{' '}
                          <span className="font-medium text-slate-700">
                            {new Date(departureDate).toLocaleDateString(
                              'ru-RU',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs text-slate-500">Текущий статус</div>
                    <div className="mt-3">
                      <div
                        className={`inline-block px-2 md:px-3 py-1.5 md:py-2 rounded-full font-nekstmedium text-xs md:text-sm ${statusBadgeClass(pendingStatus ?? selected.status)}`}
                        style={{ minWidth: 80, textAlign: 'center' }}
                      >
                        <span className="truncate max-w-[150px] inline-block">
                          {STATUS_LABEL[
                            (
                              pendingStatus ??
                              selected.status ??
                              ''
                            ).toLowerCase()
                          ] ??
                            pendingStatus ??
                            selected.status ??
                            '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* Результаты обработки - full width */}
              {selected.metadata?.processed && (
                <div className="w-full mt-6">
                  <div className="rounded-2xl bg-white p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-nekstmedium text-slate-700">
                          Результаты обработки
                        </div>
                      </div>
                      {selected.metadata.latestInput?.createdAt && (
                        <div className="text-xs text-slate-400 font-nekstregular">
                          {new Date(
                            selected.metadata.latestInput.createdAt,
                          ).toLocaleString('ru-RU')}
                        </div>
                      )}
                    </div>

                    {loadingResults && (
                      <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-2">
                        <Loader size={32} />
                        <span className="text-slate-600 text-xs sm:text-sm">
                          Загрузка результатов...
                        </span>
                      </div>
                    )}

                    {!loadingResults &&
                      selected.metadata.analyticsImages &&
                      Object.keys(selected.metadata.analyticsImages).length >
                        0 && (
                        <div className="space-y-3">
                          <div className="text-xs text-slate-500 uppercase tracking-wide">
                            Изображения
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                            {Object.entries(
                              selected.metadata.analyticsImages,
                            ).map(([name, dataUrl]) => {
                              if (!dataUrl) return null;
                              return (
                                <div
                                  key={name}
                                  className="relative group cursor-pointer rounded-xl overflow-hidden bg-slate-50 shadow-sm hover:shadow-md transition-all"
                                  onClick={() => setModalImage(dataUrl)}
                                >
                                  <img
                                    src={dataUrl}
                                    alt={name}
                                    className="w-full h-auto"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                      />
                                    </svg>
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 sm:p-2">
                                    <div className="text-[10px] sm:text-xs text-white font-nekstmedium truncate">
                                      {{
                                        originalImage:
                                          'Оригинальное изображение',
                                        indexImage: 'Индексное изображение',
                                        areasWithFullIdsImage: 'Карта участков',
                                        indexWithBoundsImage:
                                          'Индекс с границами',
                                        areasWithSegmentsAndFullIds:
                                          'Сегменты с ID',
                                      }[name] ||
                                        name
                                          .replace(/([A-Z])/g, ' $1')
                                          .replace(/Image$/, '')
                                          .trim()}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {!loadingResults &&
                      selected.metadata.analyticsTables &&
                      (() => {
                        const orderedTables = getOrderedTables(
                          selected.metadata.analyticsTables,
                        );
                        return orderedTables.length > 0 ? (
                          <div className="space-y-3 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-slate-100">
                            <div className="text-xs text-slate-500 uppercase tracking-wide">
                              Таблицы данных
                            </div>
                            <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
                              {orderedTables.map(([name, rows]) =>
                                renderTableCard(name, rows),
                              )}
                            </div>
                          </div>
                        ) : null;
                      })()}
                  </div>
                </div>
              )}
            </div>

            {/* footer */}
            <div className="bg-white/80 backdrop-blur px-6 py-4 flex items-center justify-end gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
              <button
                onClick={() => {
                  setSelected(null);
                  setPendingStatus(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/70 hover:bg-white shadow-md hover:shadow-lg transition"
              >
                Отмена
              </button>

              <button
                onClick={handleConfirm}
                disabled={
                  !hasChanges ||
                  updatingId === selected.orderId ||
                  (!hasChanges && selected)
                }
                className={`px-5 py-2.5 rounded-xl font-nekstregular transition-all ${!hasChanges || updatingId === selected.orderId || (!hasChanges && selected) ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-md hover:shadow-lg hover:-translate-y-[1px]'}`}
              >
                {updatingId === selected.orderId
                  ? 'Сохранение…'
                  : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image zoom modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-800 transition-colors shadow-lg z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              src={modalImage}
              alt="Увеличенное изображение"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* actions dropdown portal */}
      {openDropdownId !== null && dropdownPos && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: 208,
                zIndex: 99999,
              }}
              className="origin-top-right bg-white rounded-md shadow-lg p-2 grid gap-2"
            >
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={updatingId === openDropdownId}
                  onClick={() => {
                    if (opt.value === 'Cancelled') {
                      if (!confirm(`Отменить заказ #${openDropdownId}?`))
                        return;
                    }
                    setOpenDropdownId(null);
                    setDropdownPos(null);
                    updateOrderStatusApi(openDropdownId as number, opt.value);
                  }}
                  className="text-left font-nekstregular text-black px-2 py-2 rounded hover:bg-slate-50 text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
