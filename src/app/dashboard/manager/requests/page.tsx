'use client';
import React, {
  useEffect,
  useLayoutEffect,
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

type ApiOrder = {
  orderId: number;
  contractorId?: number | null;
  contractorPhone?: string | null;
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
  const [pageSize, setPageSize] = useState(30); // client-side page size
  const [pageInput, setPageInput] = useState<string>('1'); // string input so user can clear
  const [pageSizeInput, setPageSizeInput] = useState<string>('30');
  const [selected, setSelected] = useState<ApiOrder | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // dropdown portal state
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    alignRight: boolean;
    up: boolean;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  // Fetch all orders (no backend pagination) — client-side pagination will handle slicing.
  const fetchOrders = async () => {
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
      setPage(1); // reset to first page when new data arrives
      setPageInput('1');
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message ?? err));
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep pageInput/pageSizeInput in sync when page/pageSize change externally
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    setPageSizeInput(String(pageSize));
  }, [pageSize]);

  // client-side paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allOrders.slice(start, start + pageSize);
  }, [allOrders, page, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(allOrders.length / Math.max(1, pageSize)),
  );

  const updateOrderStatusApi = async (orderId: number, statusValue: string) => {
    try {
      setUpdatingId(orderId);
      // optimistic UI update on client-side list
      setAllOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: statusValue } : o,
        ),
      );
      const res = await authFetch(`${API_BASE}/api/orders_status/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusValue }),
      });
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
        // if no body returned, refetch all to be safe
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
  };

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

  const SummaryCard = () => {
    const total = allOrders.length;
    const newCount = allOrders.filter(
      (o) => (o.status ?? '').toLowerCase() === 'new',
    ).length;
    const inProgress = allOrders.filter((o) => {
      const st = (o.status ?? '').toLowerCase();
      return st === 'in_progress' || st === 'in progress' || st === 'processed';
    }).length;
    const nextDate = allOrders.length
      ? (allOrders[0].dataStart ?? allOrders[0].createdAt)
      : null;
    const phone =
      allOrders.find((o) => o.contractorPhone)?.contractorPhone ?? '—';

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Всего заказов
          </div>
          <div className="text-3xl font-semibold mt-3 text-slate-900">
            {total}
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
            {newCount}
          </div>
          <div className="text-xs text-slate-400 mt-2">К работе</div>
        </div>

        <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            В работе
          </div>
          <div className="text-3xl font-semibold mt-3 text-sky-600">
            {inProgress}
          </div>
          <div className="text-xs text-slate-400 mt-2">Заказы в процессе</div>
        </div>

        <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Phone size={14} /> Контакты
            </div>
            <div className="text-lg font-medium mt-2 text-slate-800">
              {phone}
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-3">
            Ближайшая дата: {humanDate(nextDate)}
          </div>
        </div>
      </div>
    );
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
    if (entries.length === 0) {
      return (
        <div className="text-sm text-slate-500">Нет дополнительных данных</div>
      );
    }
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

  // open modal helper — reset pendingStatus each time we open
  const openModal = (o: ApiOrder) => {
    setSelected(o);
    setPendingStatus(null);
  };

  // confirm handler — applies pendingStatus
  const handleConfirm = async () => {
    if (!selected || !pendingStatus || pendingStatus === selected.status)
      return;
    await updateOrderStatusApi(selected.orderId, pendingStatus);
    setSelected(null);
    setPendingStatus(null);
  };

  // Close dropdown on outside click (works with portal)
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) {
        setOpenDropdownId(null);
        setDropdownPos(null);
        return;
      }
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      // if click is inside an actions button container (we mark with data-actions-id), do nothing
      const actionsContainer = (target as Element).closest('[data-actions-id]');
      if (actionsContainer) {
        // keep it open only if same id (toggling handled elsewhere)
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

  // ensure page stays in range if pageSize or allOrders change
  useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(allOrders.length / Math.max(1, pageSize)),
    );
    if (page > maxPage) {
      setPage(maxPage);
      setPageInput(String(maxPage));
    }
  }, [allOrders.length, pageSize, page]);

  // helper to open dropdown via event target and compute portal position
  const openDropdownFor = (orderId: number, buttonEl: HTMLElement | null) => {
    if (!buttonEl) {
      setOpenDropdownId(null);
      setDropdownPos(null);
      return;
    }
    const rect = buttonEl.getBoundingClientRect();
    // estimate dropdown height: items * 40 + padding, items = STATUS_OPTIONS.length, plus some safety
    const dropdownWidth = 208; // tailwind w-52 ≈ 208px
    const itemHeight = 40;
    const dropdownHeight = STATUS_OPTIONS.length * itemHeight + 16;
    const margin = 8;
    let top = rect.bottom + margin;
    let up = false;
    if (rect.bottom + dropdownHeight + margin > window.innerHeight) {
      // place above
      top = rect.top - dropdownHeight - margin;
      up = true;
      if (top < 8) top = 8; // clamp
    }
    // align right edge of dropdown to right edge of button
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

  // Input commit helpers: parse and apply, but allow clearing while typing
  const commitPageInput = () => {
    const v = pageInput.trim();
    if (v === '') {
      // restore to current page
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

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Панель заказов — Менеджер
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Обновлённый минималистичный интерфейс: карточки, мягкие тени и
            понятные действия. Пагинация и закладка действий теперь полностью на
            стороне клиента.
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
        <SummaryCard />
      </section>

      {error && (
        <div className="rounded-lg p-3 bg-rose-50 text-rose-700">{error}</div>
      )}

      <section>
        <div className="rounded-2xl">
          {/* header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/30">
            <div className="text-sm text-slate-700 font-medium">
              Список заказов
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              Всего {allOrders.length} · Страница {page}/{totalPages} · Показано{' '}
              {paginatedOrders.length}
            </div>
          </div>

          {/* rows */}
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

                      {/* actions button container marked with data-actions-id */}
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
                          Действия <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* footer with client-side pagination controls */}
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
                  if (e.key === 'Escape') {
                    setPageInput(String(page));
                  }
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
                  if (e.key === 'Escape') {
                    setPageSizeInput(String(pageSize));
                  }
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
        // Anchor modal to top (items-start) so content stays pinned near top instead of centering.
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-auto shadow-2xl p-4 sm:p-6 max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-2xl font-semibold text-emerald-700">
                  {String(selected.orderId).slice(-2)}
                </div>
                <div>
                  <div className="text-xs text-slate-500">
                    Заказ #{selected.orderId}
                  </div>
                  <div className="text-xl font-semibold mt-1">
                    {TYPE_LABEL[Number(selected.typeProcessId ?? -1)] ??
                      `Тип #${String(selected.typeProcessId ?? '—')}`}
                  </div>
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-3">
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                <div className="rounded-2xl bg-white/70 p-4 shadow">
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
                        <span>{selected.contractorPhone ?? '—'}</span>
                        {selected.contractorPhone && (
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(
                                String(selected.contractorPhone),
                              );
                              alert('Телефон скопирован');
                            }}
                            className="text-xs text-emerald-600 inline-flex items-center gap-1"
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

                <div className="rounded-2xl bg-white/60 p-4 shadow">
                  <div className="text-sm text-slate-600">
                    Подробности заказа
                  </div>
                  <div className="mt-3 text-sm text-slate-700">
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

              <div className="space-y-4">
                <div className="rounded-2xl bg-white/60 p-4 shadow">
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

                <div className="rounded-2xl bg-white p-4 shadow">
                  <div className="text-xs text-slate-500 mb-2">
                    Выберите новый статус
                  </div>
                  <div className="flex flex-col gap-2">
                    {STATUS_OPTIONS.map((opt) => {
                      const isSelected =
                        (pendingStatus ?? selected.status) === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() =>
                            setPendingStatus((prev) =>
                              prev === opt.value ? null : opt.value,
                            )
                          }
                          className={`w-full text-left px-3 py-2 rounded-md text-sm ${isSelected ? 'bg-emerald-600 text-white' : 'bg-white/80 hover:bg-slate-50'}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow">
                  <div className="text-xs text-slate-500 mb-2">Действия</div>
                  <div className="text-sm text-slate-700">
                    Подтвердите изменение статуса внизу справа.
                  </div>
                </div>
              </div>
            </div>

            {/* footer with Confirm + Close only (Confirm disabled until change) */}
            <div className="mt-6 flex justify-end items-center gap-3">
              <button
                onClick={() => {
                  setSelected(null);
                  setPendingStatus(null);
                }}
                className="px-4 py-2 rounded-md bg-white/80"
              >
                Закрыть
              </button>

              <button
                onClick={async () => {
                  if (!pendingStatus || !selected) return;
                  await handleConfirm();
                }}
                disabled={
                  !pendingStatus ||
                  pendingStatus === selected.status ||
                  updatingId === selected.orderId
                }
                className={`px-4 py-2 rounded-md font-medium transition ${
                  !pendingStatus ||
                  pendingStatus === selected.status ||
                  updatingId === selected.orderId
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:brightness-95'
                }`}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown portal: rendered into body so it is always on top and not clipped */}
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
