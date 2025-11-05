'use client';
import React, { useEffect, useState } from 'react';
import { Eye, RefreshCw, Check, X, Phone, ChevronDown } from 'lucide-react';

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
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [selected, setSelected] = useState<ApiOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const humanDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString() : '—';

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
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

  const fetchOrders = async (p = page, l = limit) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(
        `${API_BASE}/api/orders?page=${p}&limit=${l}`,
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Ошибка получения заказов: ${res.status} ${txt}`);
      }
      const data = await res.json();
      const list: ApiOrder[] = Array.isArray(data.orders) ? data.orders : [];
      setOrders(list);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message ?? err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // PUT /api/orders_status/{order_id}
  const updateOrderStatusApi = async (orderId: number, statusValue: string) => {
    try {
      setUpdatingId(orderId);
      // optimistic UI update
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: statusValue } : o,
        ),
      );

      const res = await authFetch(`${API_BASE}/api/orders_status/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusValue }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Ошибка изменения статуса: ${res.status} ${txt}`);
      }

      const updated = await res.json().catch(() => null);
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, ...updated } : o)),
        );
      } else {
        // fallback: reload list
        await fetchOrders();
      }

      setSelected((s) =>
        s && s.orderId === orderId
          ? { ...(s ?? {}), status: statusValue, ...updated }
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

  // Small helpers for UI
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
    const total = orders.length;
    const newCount = orders.filter(
      (o) => (o.status ?? '').toLowerCase() === 'new',
    ).length;
    const inProgress = orders.filter((o) => {
      const st = (o.status ?? '').toLowerCase();
      return st === 'in_progress' || st === 'in progress' || st === 'processed';
    }).length;

    const nextDate = orders.length
      ? (orders[0].dataStart ?? orders[0].createdAt)
      : null;
    const phone = orders.find((o) => o.contractorPhone)?.contractorPhone ?? '—';

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Всего заказов</div>
          <div className="text-2xl font-semibold mt-2 text-gray-900">
            {total}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Обновляется при загрузке
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Новые</div>
          <div className="text-2xl font-semibold mt-2 text-amber-600">
            {newCount}
          </div>
          <div className="text-xs text-gray-400 mt-1">К работе</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">В работе</div>
          <div className="text-2xl font-semibold mt-2 text-sky-600">
            {inProgress}
          </div>
          <div className="text-xs text-gray-400 mt-1">Заказы в процессе</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Phone size={16} /> Контакты
            </div>
            <div className="text-lg font-medium mt-2">{phone}</div>
          </div>
          <div className="text-xs text-gray-400 mt-3">
            Ближайшая дата: {humanDate(nextDate)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Панель заказов — Менеджер
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Просматривайте и управляйте заказами — удобно и аккуратно. Быстро
            меняйте статусы через API, стиль приведён в единый тон с
            операционной панелью.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border shadow-sm">
            Новых:{' '}
            <span className="font-semibold ml-2">
              {
                orders.filter((o) => (o.status ?? '').toLowerCase() === 'new')
                  .length
              }
            </span>
          </div>

          <button
            onClick={() => fetchOrders()}
            title="Обновить"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border shadow-sm hover:shadow transition"
          >
            <RefreshCw size={16} /> Обновить
          </button>
        </div>
      </header>

      <section aria-label="summary">
        <SummaryCard />
      </section>

      {error && (
        <div className="rounded-lg p-3 bg-rose-50 border border-rose-100 text-rose-700">
          Ошибка: {error}
        </div>
      )}

      <section>
        <div className="bg-white rounded-2xl border border-gray-100 shadow overflow-hidden">
          {/* table header */}
          <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
            <div className="text-sm text-gray-700 font-medium">
              Список заказов
            </div>
            <div className="text-xs text-gray-500">
              Страница {page} · Показано {orders.length}
            </div>
          </div>

          {/* rows as cards for nicer UI on all widths */}
          <div className="divide-y">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Загрузка заказов…
              </div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Заказов нет</div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.orderId}
                  className="p-4 hover:bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center shadow-sm text-sm font-medium text-gray-800">
                      #{o.orderId}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {TYPE_LABEL[Number(o.typeProcessId ?? -1)] ??
                          `Тип #${String(o.typeProcessId ?? '—')}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Создано: {humanDate(o.createdAt)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Контрактор #{String(o.contractorId ?? '—')} ·{' '}
                        {o.materialsProvided
                          ? 'Материалы: Да'
                          : 'Материалы: Нет'}
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

                    <div className="text-xs text-gray-500 hidden md:block">
                      {humanDate(o.dataStart)} — {humanDate(o.dataEnd)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelected(o)}
                        className="px-3 py-2 rounded-md bg-white border text-sm shadow-sm hover:shadow transition inline-flex items-center gap-2"
                        title="Просмотр"
                      >
                        <Eye size={14} /> Просмотр
                      </button>

                      <div className="relative inline-block text-left">
                        <details className="group">
                          <summary className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500 text-white text-sm cursor-pointer hover:brightness-95">
                            Действия <ChevronDown size={14} />
                          </summary>
                          <div className="mt-2 w-48 origin-top-right bg-white border rounded shadow-lg p-2 grid gap-2">
                            <button
                              disabled={updatingId === o.orderId}
                              onClick={() =>
                                updateOrderStatusApi(o.orderId, 'In progress')
                              }
                              className="text-left px-2 py-2 rounded hover:bg-gray-50 text-sm"
                            >
                              Принять (In progress)
                            </button>
                            <button
                              disabled={updatingId === o.orderId}
                              onClick={() =>
                                updateOrderStatusApi(o.orderId, 'Processed')
                              }
                              className="text-left px-2 py-2 rounded hover:bg-gray-50 text-sm"
                            >
                              Отметить как обработана (Processed)
                            </button>
                            <button
                              disabled={updatingId === o.orderId}
                              onClick={() =>
                                updateOrderStatusApi(o.orderId, 'Completed')
                              }
                              className="text-left px-2 py-2 rounded hover:bg-gray-50 text-sm"
                            >
                              Завершить (Completed)
                            </button>
                            <button
                              disabled={updatingId === o.orderId}
                              onClick={() => {
                                if (
                                  !confirm(
                                    `Вы уверены, что хотите отменить заказ #${o.orderId}?`,
                                  )
                                )
                                  return;
                                updateOrderStatusApi(o.orderId, 'Cancelled');
                              }}
                              className="text-left px-2 py-2 rounded hover:bg-gray-50 text-sm text-rose-600"
                            >
                              Отменить (Cancelled)
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* footer */}
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t bg-white">
            <div className="text-sm text-gray-600">
              Показано {orders.length} заказ(ов)
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Страница</label>
              <input
                type="number"
                min={1}
                value={page}
                onChange={(e) =>
                  setPage(Math.max(1, Number(e.target.value || 1)))
                }
                className="w-20 px-2 py-1 border rounded"
              />
              <label className="text-sm text-gray-500">Limit</label>
              <input
                type="number"
                min={1}
                value={limit}
                onChange={(e) =>
                  setLimit(Math.max(1, Number(e.target.value || 10)))
                }
                className="w-20 px-2 py-1 border rounded"
              />
              <button
                onClick={() => fetchOrders()}
                className="px-3 py-1 rounded border bg-white"
              >
                Загрузить
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="text-sm text-gray-500">
                  Заказ #{selected.orderId}
                </div>
                <div className="text-lg font-semibold mt-1">
                  {TYPE_LABEL[Number(selected.typeProcessId ?? -1)] ??
                    `Тип #${String(selected.typeProcessId ?? '—')}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-2 rounded-md border bg-white"
                >
                  Закрыть
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500">Контрактор</div>
                  <div className="font-medium mt-1">
                    #{String(selected.contractorId ?? '—')}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Телефон</div>
                  <div className="text-sm font-medium">
                    {selected.contractorPhone ?? '—'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Даты</div>
                  <div className="mt-1 text-sm">
                    {humanDate(selected.dataStart)} —{' '}
                    {humanDate(selected.dataEnd)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    Материалы предоставлены
                  </div>
                  <div className="mt-1 text-sm">
                    {selected.materialsProvided ? 'Да' : 'Нет'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Статус</div>
                <div className="mb-3">
                  <div
                    className={`inline-block px-3 py-2 rounded-full font-semibold ${statusBadgeClass(selected.status)}`}
                  >
                    {STATUS_LABEL[(selected.status ?? '').toLowerCase()] ??
                      selected.status ??
                      '—'}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Изменить статус заказа
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          if (updatingId === selected.orderId) return;
                          if (
                            !confirm(
                              `Перевести заказ #${selected.orderId} в статус "${opt.label}"?`,
                            )
                          )
                            return;
                          updateOrderStatusApi(selected.orderId, opt.value);
                        }}
                        className={`px-3 py-2 rounded-md text-sm ${selected.status === opt.value ? 'bg-emerald-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    Полные данные (JSON)
                  </div>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-56">
                    {JSON.stringify(selected, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 border-t text-right">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded border"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
