'use client';
import React, { useEffect, useState } from 'react';
import { Eye, RefreshCw, Check, X, Phone } from 'lucide-react';

type ApiOrder = {
  orderId: number;
  contractorId?: number | null;
  typeProcessId?: number | null;
  status?: string | null;
  createdAt?: string | null;
  dataStart?: string | null;
  dataEnd?: string | null;
  materialsProvided?: boolean | null;
  // any other fields — we'll display raw JSON if needed
  [k: string]: any;
};

const STATUS_LABEL: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  planned: 'Запланирована',
  completed: 'Выполнена',
  rejected: 'Отклонена',
  clarify: 'Нужна доработка',
};

const TYPE_LABEL: Record<number, string> = {
  0: 'Опрыскивание',
  1: 'Внесение удобрений',
  2: 'Картографирование',
};

export default function FriendlyOrdersPanel() {
  const API_BASE = 'https://droneagro.duckdns.org';
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [selected, setSelected] = useState<ApiOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // friendly summary placeholders (will be replaced by backend later)
  const summaryPlaceholder = {
    total: orders.length,
    newCount: orders.filter((o) => (o.status ?? '').toLowerCase() === 'new')
      .length,
    inProgress: orders.filter(
      (o) => (o.status ?? '').toLowerCase() === 'in_progress',
    ).length,
    phonePlaceholder: '+7 900 000-00-00', // заглушка телефона
    nextDate: orders.length
      ? (orders[0].dataStart ?? orders[0].createdAt)
      : null,
  };

  const humanDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString() : '—';

  // add bearer header if token exists
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

  const updateOrderStatus = async (orderId: number, statusValue: string) => {
    try {
      setUpdatingId(orderId);
      // optimistic UI update
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: statusValue } : o,
        ),
      );

      const res = await authFetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusValue }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Ошибка изменения статуса: ${res.status} ${txt}`);
      }

      // if backend returned updated entity — merge it
      const updated = await res.json().catch(() => null);
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, ...updated } : o)),
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message ?? err));
      // rollback by re-fetching
      await fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  // small helper UI components inside file for clarity
  const SummaryCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="rounded-2xl bg-white/95 border border-gray-100 p-4 shadow-sm">
        <div className="text-sm text-gray-500">Всего заказов</div>
        <div className="text-2xl font-semibold mt-2">
          {summaryPlaceholder.total}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Обновляется при загрузке
        </div>
      </div>

      <div className="rounded-2xl bg-white/95 border border-gray-100 p-4 shadow-sm">
        <div className="text-sm text-gray-500">Новые</div>
        <div className="text-2xl font-semibold mt-2 text-amber-600">
          {summaryPlaceholder.newCount}
        </div>
        <div className="text-xs text-gray-400 mt-1">К работе</div>
      </div>

      <div className="rounded-2xl bg-white/95 border border-gray-100 p-4 shadow-sm">
        <div className="text-sm text-gray-500">В работе</div>
        <div className="text-2xl font-semibold mt-2 text-sky-600">
          {summaryPlaceholder.inProgress}
        </div>
        <div className="text-xs text-gray-400 mt-1">Заказы в процессе</div>
      </div>

      <div className="rounded-2xl bg-white/95 border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Phone size={16} /> Контакты (пока заглушка)
          </div>
          <div className="text-lg font-medium mt-2">
            {summaryPlaceholder.phonePlaceholder}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-3">
          Ближайшая дата: {humanDate(summaryPlaceholder.nextDate)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Панель заказов менеджера</h1>
          <p className="text-sm text-gray-600 mt-1">
            Здесь вы видите входящие заявки — можно быстро просмотреть детали и
            либо принять, либо отклонить.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600 bg-white/95 px-3 py-2 rounded-xl border shadow-sm">
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
            className="px-3 py-2 rounded-xl border bg-white shadow-sm flex items-center gap-2"
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600">№</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Дата
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Процесс
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Даты работ
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Материалы
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Действия
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Загрузка заказов…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Заказов нет
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      #{o.orderId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {humanDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {TYPE_LABEL[Number(o.typeProcessId ?? -1)] ??
                        `Тип #${String(o.typeProcessId ?? '—')}`}
                      <div className="text-xs text-gray-400 mt-1">
                        Контрактор #{String(o.contractorId ?? '—')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${(o.status ?? '').toLowerCase() === 'new' ? 'bg-amber-100 text-amber-800' : (o.status ?? '').toLowerCase() === 'in_progress' ? 'bg-sky-100 text-sky-800' : (o.status ?? '').toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {STATUS_LABEL[(o.status ?? '').toLowerCase()] ??
                          o.status ??
                          '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {humanDate(o.dataStart)} — {humanDate(o.dataEnd)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {o.materialsProvided ? 'Да' : 'Нет'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(o)}
                          className="px-3 py-1 border rounded-md bg-white text-sm flex items-center gap-2"
                          title="Просмотр"
                        >
                          <Eye size={14} /> Просмотр
                        </button>

                        <button
                          disabled={updatingId === o.orderId}
                          onClick={() =>
                            updateOrderStatus(o.orderId, 'in_progress')
                          }
                          className="px-3 py-1 rounded-md bg-emerald-500 text-white text-sm disabled:opacity-60 flex items-center gap-2"
                          title="Принять заказ"
                        >
                          <Check size={14} /> Принять
                        </button>

                        <button
                          disabled={updatingId === o.orderId}
                          onClick={() => {
                            if (
                              !confirm(
                                `Вы уверены, что хотите отклонить заказ #${o.orderId}?`,
                              )
                            )
                              return;
                            updateOrderStatus(o.orderId, 'rejected');
                          }}
                          className="px-3 py-1 rounded-md bg-rose-500 text-white text-sm disabled:opacity-60 flex items-center gap-2"
                          title="Отклонить заказ"
                        >
                          <X size={14} /> Отклонить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-3">
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
      </section>

      {/* modal for friendly view */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">
                  Заказ #{selected.orderId}
                </div>
                <div className="text-lg font-semibold mt-1">
                  Короткая сводка
                </div>
              </div>
              <div>
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-1 border rounded"
                >
                  Закрыть
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Контрактор</div>
                  <div className="font-medium mt-1">
                    #{String(selected.contractorId ?? '—')}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Телефон (пока заглушка):
                  </div>
                  <div className="text-sm font-medium">
                    {summaryPlaceholder.phonePlaceholder}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Процесс</div>
                  <div className="font-medium mt-1">
                    {TYPE_LABEL[Number(selected.typeProcessId ?? -1)] ??
                      `#${String(selected.typeProcessId ?? '—')}`}
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
                <div className="font-semibold text-lg mt-1">
                  {STATUS_LABEL[(selected.status ?? '').toLowerCase()] ??
                    selected.status ??
                    '—'}
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">
                    Полные данные (json)
                  </div>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-48">
                    {JSON.stringify(selected, null, 2)}
                  </pre>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      updateOrderStatus(selected.orderId, 'in_progress')
                    }
                    className="px-3 py-2 bg-emerald-500 text-white rounded"
                  >
                    Принять
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm(`Отклонить заказ #${selected.orderId}?`))
                        return;
                      updateOrderStatus(selected.orderId, 'rejected');
                    }}
                    className="px-3 py-2 bg-rose-500 text-white rounded"
                  >
                    Отклонить
                  </button>
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
