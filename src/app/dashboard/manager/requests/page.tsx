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
} from 'lucide-react';

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
  completed: 'Выполнена',
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
  { value: 'Completed', label: 'Выполнена' },
  { value: 'Cancelled', label: 'Отменена' },
];

export default function FriendlyOrdersPanel() {
  const API_BASE = 'https://droneagro.duckdns.org';

  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [pageInput, setPageInput] = useState<string>('1');
  const [pageSizeInput, setPageSizeInput] = useState<string>('30');
  const [selected, setSelected] = useState<ApiOrder | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<number | null>(
    null,
  );
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
      const res = await authFetch(`${API_BASE}/api/orders`);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Ошибка получения заказов: ${res.status} ${txt}`);
      }
      const data = await res.json();
      const list: ApiOrder[] = Array.isArray(data.orders) ? data.orders : [];
      setAllOrders(list);
      setPage(1);
      setPageInput('1');
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
  useEffect(() => setPageInput(String(page)), [page]);
  useEffect(() => setPageSizeInput(String(pageSize)), [pageSize]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allOrders.slice(start, start + pageSize);
  }, [allOrders, page, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(allOrders.length / Math.max(1, pageSize)),
  );

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
        setAllOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? {
                  ...o,
                  operatorId: operator.id,
                  operatorName: `${operator.firstName} ${operator.lastName}`,
                }
              : o,
          ),
        );

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
            prev.map((o) => (o.orderId === orderId ? { ...o, ...updated } : o)),
          );
        }
        setSelected((s) =>
          s && s.orderId === orderId
            ? {
                ...s,
                operatorId: operator.id,
                operatorName: `${operator.firstName} ${operator.lastName}`,
              }
            : s,
        );
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
    if (s === 'new') return 'bg-amber-100 text-amber-800';
    if (s === 'in_progress' || s === 'in progress' || s === 'inprogress')
      return 'bg-sky-100 text-sky-800';
    if (s === 'processed') return 'bg-indigo-100 text-indigo-800';
    if (s === 'completed') return 'bg-emerald-100 text-emerald-800';
    if (s === 'cancelled' || s === 'rejected')
      return 'bg-rose-100 text-rose-800';
    return 'bg-gray-100 text-gray-700';
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

  const openModal = (o: ApiOrder) => {
    setSelected(o);
    setPendingStatus(null);
    setSelectedOperatorId(o.operatorId ?? null);
    setStatusOpen(false);
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

      // close modal
      setSelected(null);
      setPendingStatus(null);
      setStatusOpen(false);
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

  // --- dropdown close on outside click for action menu (kept from original)
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) {
        setOpenDropdownId(null);
        setDropdownPos(null);
        return;
      }
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      const actionsContainer = (target as Element).closest('[data-actions-id]');
      if (actionsContainer) {
        const idAttr = actionsContainer.getAttribute('data-actions-id');
        if (idAttr && Number(idAttr) === openDropdownId) return;
      }
      setOpenDropdownId(null);
      setDropdownPos(null);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [openDropdownId]);

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
  const commitPageInput = () => {
    const v = pageInput.trim();
    if (v === '') {
      setPageInput(String(page));
      return;
    }
    const n = Number(v);
    if (!Number.isFinite(n) || n < 1) {
      setPageInput(String(page));
      return;
    }
    const pageNum = Math.min(Math.max(1, Math.floor(n)), totalPages);
    setPage(pageNum);
    setPageInput(String(pageNum));
  };

  const commitPageSizeInput = () => {
    const v = pageSizeInput.trim();
    if (v === '') {
      setPageSizeInput(String(pageSize));
      return;
    }
    const n = Number(v);
    if (!Number.isFinite(n) || n < 1) {
      setPageSizeInput(String(pageSize));
      return;
    }
    const sz = Math.max(1, Math.floor(n));
    setPageSize(sz);
    setPage(1);
    setPageSizeInput(String(sz));
  };

  const hasChanges = useMemo(() => {
    if (!selected) return false;
    const opChanged =
      selectedOperatorId !== null && selectedOperatorId !== selected.operatorId;
    const stChanged = pendingStatus && pendingStatus !== selected.status;
    return opChanged || stChanged;
  }, [selected, selectedOperatorId, pendingStatus]);

  // --- UI render
  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Панель заказов — Менеджер
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Обновлённый минималистичный интерфейс: карточки, мягкие тени и
            понятные действия.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600 bg-white/60 px-3 py-2 rounded-lg shadow-sm backdrop-blur">
            Новых:{' '}
            <span className="font-semibold ml-2">
              {
                allOrders.filter(
                  (o) => (o.status ?? '').toLowerCase() === 'new',
                ).length
              }
            </span>
          </div>

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
            <div className="text-3xl font-semibold mt-3 text-slate-900">
              {allOrders.length}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Обновляется при загрузке
            </div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Новые
            </div>
            <div className="text-3xl font-semibold mt-3 text-amber-600">
              {
                allOrders.filter(
                  (o) => (o.status ?? '').toLowerCase() === 'new',
                ).length
              }
            </div>
            <div className="text-xs text-slate-400 mt-2">К работе</div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              В работе
            </div>
            <div className="text-3xl font-semibold mt-3 text-sky-600">
              {
                allOrders.filter((o) => {
                  const st = (o.status ?? '').toLowerCase();
                  return (
                    st === 'in_progress' ||
                    st === 'in progress' ||
                    st === 'processed'
                  );
                }).length
              }
            </div>
            <div className="text-xs text-slate-400 mt-2">Заказы в процессе</div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Phone size={14} /> Контакты
              </div>
              <div className="text-lg font-medium mt-2 text-slate-800">
                {allOrders.find((o) => o.contractorPhone)?.contractorPhone ??
                  '—'}
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-3">
              Ближайшая дата:{' '}
              {humanDate(
                allOrders.length
                  ? (allOrders[0].dataStart ?? allOrders[0].createdAt)
                  : null,
              )}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg p-3 bg-rose-50 text-rose-700">{error}</div>
      )}

      <section>
        <div className="rounded-2xl">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/30">
            <div className="text-sm text-slate-700 font-medium">
              Список заказов
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              Всего {allOrders.length} · Страница {page}/{totalPages} · Показано{' '}
              {paginatedOrders.length}
            </div>
          </div>

          <div className="divide-y divide-slate-100 bg-transparent">
            {loading ? (
              <div className="p-6 text-center text-slate-500">
                Загрузка заказов…
              </div>
            ) : allOrders.length === 0 ? (
              <div className="p-6 text-center text-slate-500">Заказов нет</div>
            ) : (
              paginatedOrders.map((o) => (
                <div
                  key={o.orderId}
                  className="p-4 hover:bg-white/40 transition-colors rounded-xl mx-2 my-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex flex-col items-center justify-center text-slate-800 font-semibold">
                      <div className="text-xs">Заказ</div>
                      <div className="text-base">#{o.orderId}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {TYPE_LABEL[Number(o.typeProcessId ?? -1)] ??
                          `Тип #${String(o.typeProcessId ?? '—')}`}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Создано: {humanDate(o.createdAt)}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span>Контрактор #{String(o.contractorId ?? '—')}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Phone size={12} /> {o.contractorPhone ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs ${statusBadgeClass(o.status)}`}
                    >
                      {STATUS_LABEL[(o.status ?? '').toLowerCase()] ??
                        o.status ??
                        '—'}
                    </div>
                    <div className="text-xs text-slate-500 hidden md:block">
                      {humanDate(o.dataStart)} — {humanDate(o.dataEnd)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(o)}
                        className="px-3 py-2 rounded-md bg-white shadow-sm inline-flex items-center gap-2"
                      >
                        <Eye size={14} /> Просмотр
                      </button>

                      <div
                        data-actions-id={String(o.orderId)}
                        className="relative"
                      >
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
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white"
                          aria-expanded={openDropdownId === o.orderId}
                        >
                          Изменить статус <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/30">
            <div className="text-sm text-slate-600">
              Показано {paginatedOrders.length} из {allOrders.length} заказ(ов)
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm text-slate-500">Страница</label>
              <button
                onClick={() => {
                  setPage((p) => {
                    const np = Math.max(1, p - 1);
                    setPageInput(String(np));
                    return np;
                  });
                }}
                className="px-2 py-1 rounded-md bg-white/80"
                disabled={page <= 1}
              >
                ←
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => commitPageInput()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitPageInput();
                  if (e.key === 'Escape') setPageInput(String(page));
                }}
                className="w-20 px-2 py-1 rounded-md border"
                aria-label="page"
                placeholder="1"
              />
              <button
                onClick={() => {
                  setPage((p) => {
                    const np = Math.min(totalPages, p + 1);
                    setPageInput(String(np));
                    return np;
                  });
                }}
                className="px-2 py-1 rounded-md bg-white/80"
                disabled={page >= totalPages}
              >
                →
              </button>

              <label className="text-sm text-slate-500">На странице</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageSizeInput}
                onChange={(e) => setPageSizeInput(e.target.value)}
                onBlur={() => commitPageSizeInput()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitPageSizeInput();
                  if (e.key === 'Escape') setPageSizeInput(String(pageSize));
                }}
                className="w-20 px-2 py-1 rounded-md border"
                aria-label="pageSize"
                placeholder="30"
              />
              <button
                onClick={() => fetchOrders()}
                className="px-3 py-1 rounded-md bg-white/70"
              >
                Загрузить
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 bg-slate-900/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-5xl mx-auto flex flex-col bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[90vh]">
            {/* header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r rounded-3xl from-emerald-50/60 to-white/40 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-2xl font-semibold text-emerald-800 shadow">
                  {String(selected.orderId).slice(-2)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">
                    Заказ #{selected.orderId}
                  </div>
                  <div className="text-lg font-semibold text-slate-900 truncate">
                    {TYPE_LABEL[Number(selected.typeProcessId ?? -1)] ??
                      `Тип #${String(selected.typeProcessId ?? '—')}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-3 items-center">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={14} /> {humanDate(selected.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} /> {humanDate(selected.dataStart)} —{' '}
                      {humanDate(selected.dataEnd)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-2 rounded-full text-sm ${statusBadgeClass(selected.status)}`}
                >
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
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Контрактор</div>
                      <div className="text-lg font-medium mt-1">
                        #{String(selected.contractorId ?? '—')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Телефон</div>
                      <div className="text-sm font-medium mt-1 flex items-center gap-2">
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
                        Материалы предоставлены
                      </div>
                      <div className="text-sm font-medium mt-1">
                        {selected.materialsProvided ? 'Да' : 'Нет'}
                      </div>
                    </div>
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
                  <div className="text-sm text-slate-600 mb-3">
                    Подробности заказа
                  </div>
                  <div className="text-sm text-slate-700">
                    {renderKeyValueRows(selected, [
                      'orderId',
                      'contractorId',
                      'contractorPhone',
                      'typeProcessId',
                      'status',
                      'createdAt',
                      'dataStart',
                      'dataEnd',
                      'materialsProvided',
                      'preview',
                    ])}
                  </div>
                </div>
              </div>

              {/* right */}
              <aside className="space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-500">
                      Назначение оператора
                    </div>
                    {selected.operatorId !== null && (
                      <div className="text-xs text-emerald-600 font-semibold truncate">
                        Текущий: {selected.operatorName ?? selected.firstName}
                      </div>
                    )}
                  </div>

                  <select
                    value={selectedOperatorId ?? ''}
                    onChange={(e) =>
                      setSelectedOperatorId(
                        e.target.value === '' ? null : Number(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    disabled={
                      operatorLoading || updatingId === selected.orderId
                    }
                  >
                    <option value="">
                      {operatorLoading ? 'Загрузка...' : 'Не назначен'}
                    </option>
                    {operators.map((op) => (
                      <option
                        key={op.id}
                        value={String(op.id)}
                      >{`${op.firstName} ${op.lastName} (${op.email})`}</option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs text-slate-500">Текущий статус</div>
                  <div className="mt-3">
                    <div
                      className={`inline-block px-3 py-2 rounded-full font-semibold ${statusBadgeClass(pendingStatus ?? selected.status)}`}
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
                disabled={!hasChanges || updatingId === selected.orderId}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${!hasChanges || updatingId === selected.orderId ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-md hover:shadow-lg hover:-translate-y-[1px]'}`}
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
                  className="text-left px-2 py-2 rounded hover:bg-slate-50 text-sm"
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
