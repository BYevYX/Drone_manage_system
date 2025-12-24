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

const TYPE_LABEL: Record<number, string> = {
  0: 'Опрыскивание',
  1: 'Внесение удобрений',
  2: 'Картографирование',
};

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
  const API_BASE = 'https://droneagro.duckdns.org';

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  // Сортировка по статусу заказа
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

  // dropdown portal state for row actions
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    alignRight: boolean;
    up: boolean;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  // --- fetchOrders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(`${API_BASE}/api/orders?limit=1000`);
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
    fetchOrders();
    fetchOperators();
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
  }, [allOrders, statusFilter, sortOrder]);

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
  const statusBadgeClass = (status?: string) => {
    const s = (status ?? '').toLowerCase();
    return STATUS_STYLE[s] || 'bg-gray-100 text-gray-700';
  };

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
    setPendingStatus(null); // сбрасываем статус изменений при открытии любого заказа
    setViewLoadingId(o.orderId);

    setSelectedOperatorId(o.operatorId ?? null);
    setStatusOpen(false);

    let contractorDetails = null;
    let operatorDetails = null;

    if (o.contractorId) {
      contractorDetails = await fetchContractorDetails(o.contractorId);
    }

    if (o.operatorId) {
      operatorDetails = await fetchOperatorDetails(o.operatorId);
    }

    setSelected({
      ...o,
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
    setViewLoadingId(null);
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

  // Сортировка
  const SORT_OPTIONS = [
    { value: 'desc', label: 'Сначала новые' },
    { value: 'asc', label: 'Сначала старые' },
  ];

  // --- UI render
  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-nekstmedium text-slate-900">
            Панель заказов — Менеджер
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            title="Обновить"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 shadow-sm hover:shadow-md transition"
          >
            <RefreshCw size={16} /> Обновить
          </button>
        </div>
      </header>

      <section aria-label="summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Всего заказов
            </div>
            <div className="text-3xl font-nekstmedium mt-3 text-slate-900">
              {allOrders.length}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Общее кол-во заказов
            </div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Обработаны
            </div>
            <div className="text-3xl font-nekstmedium mt-3 text-yellow-600">
              {
                allOrders.filter(
                  (o) => (o.status ?? '').toLowerCase() === 'processed',
                ).length
              }
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Обработанные оператором заказы
            </div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              В работе
            </div>
            <div className="text-3xl font-nekstmedium mt-3 text-sky-600">
              {
                allOrders.filter((o) => {
                  const st = (o.status ?? '').toLowerCase();
                  return st === 'in progress' || st === 'in_progress';
                }).length
              }
            </div>
            <div className="text-xs text-slate-400 mt-2">Заказов в работе</div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Завершены
            </div>
            <div className="text-3xl font-nekstmedium mt-3 text-green-600">
              {
                allOrders.filter(
                  (o) => (o.status ?? '').toLowerCase() === 'completed',
                ).length
              }
            </div>
            <div className="text-xs text-slate-400 mt-2">
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
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <ModernSelect
                  width={220}
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
                  width={220}
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
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left block */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-900 flex flex-col items-center justify-center shadow-inner">
                        <div className="text-[10px] uppercase tracking-wide">
                          Заказ
                        </div>
                        <div className="text-base font-nekstmedium">
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
                    <div className="flex flex-wrap items-center gap-3 justify-end">
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-nekstmedium backdrop-blur ${statusBadgeClass(o.status)} transition-all duration-200 hover:scale-105`}
                        style={{ minWidth: 120, justifyContent: 'center' }}
                      >
                        {statusBadgeIcon(o.status)}
                        {STATUS_LABEL_RU[o.status as string] ?? o.status ?? '—'}
                      </div>

                      <button
                        onClick={() => openModal(o)}
                        className="px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md font-nekstregular transition inline-flex items-center gap-2 min-w-[120px] justify-center"
                        disabled={viewLoadingId === o.orderId}
                      >
                        {viewLoadingId === o.orderId ? (
                          <>
                            <Loader size={18} />
                            Загрузка...
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            Просмотр
                          </>
                        )}
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            const btn = e.currentTarget as HTMLElement;
                            if (openDropdownId === o.orderId) {
                              setOpenDropdownId(null);
                              setDropdownPos(null);
                            } else {
                              openDropdownFor(o.orderId, btn);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-nekstregular shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition inline-flex items-center gap-2"
                        >
                          Изменить статус
                          <ChevronDown size={14} />
                        </button>
                      </div>
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

      {/* modal */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          className="flex items-start justify-center p-3 sm:p-6 pt-12 bg-slate-900/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-5xl mx-auto flex flex-col bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[90vh]">
            {/* header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r rounded-3xl from-emerald-50/60 to-white/40 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-4">
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

              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-full font-nekstregular text-sm ${statusBadgeClass(selected.status)}`}
                  style={{ minWidth: 120, justifyContent: 'center' }}
                >
                  {statusBadgeIcon(selected.status)}
                  {STATUS_LABEL[(selected.status ?? '').toLowerCase()] ??
                    selected.status ??
                    '—'}
                </div>
                <button
                  onClick={() => {
                    setSelected(null);
                    setPendingStatus(null);
                  }}
                  aria-label="Close"
                  className="h-9 w-9 rounded-full bg-white/70 hover:bg-white shadow-md hover:shadow-lg transition inline-flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* body scrollable */}
            <div className="overflow-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
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
                        {STATUS_LABEL[(selected.status ?? '').toLowerCase()] ??
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

                <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs text-slate-500">Текущий статус</div>
                  <div className="mt-3">
                    <div
                      className={`inline-block px-3 py-2 rounded-full font-nekstmedium ${statusBadgeClass(pendingStatus ?? selected.status)}`}
                      style={{ minWidth: 120, textAlign: 'center' }}
                    >
                      {STATUS_LABEL[
                        (pendingStatus ?? selected.status ?? '').toLowerCase()
                      ] ??
                        pendingStatus ??
                        selected.status ??
                        '—'}
                    </div>
                  </div>
                </div>
              </aside>
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
