// app/dashboard/requests/page.tsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Package,
  Map,
  FileText,
  Plus,
  Edit,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

type RequestStatus = 'draft' | 'pending' | 'in_progress' | 'done' | 'cancelled';

type RequestItem = {
  id: string;
  service: string;
  createdAt: string; // iso
  area?: string; // e.g. "12 га"
  address?: string;
  cadastral?: string | null;
  status: RequestStatus;
  price?: number | null;
  notes?: string;
};

const mockRequests: RequestItem[] = [
  {
    id: 'DRAFT-001',
    service: 'Опрыскивание гербицидами',
    createdAt: '2025-10-12T09:23:00Z',
    area: '5.2 га',
    address: 'ул. Полевая, уч. 23',
    cadastral: null,
    status: 'draft',
    price: null,
    notes: 'Черновик — не указана точная дата',
  },
  {
    id: 'REQ-20251003-17',
    service: 'Мониторинг вегетации (NDVI)',
    createdAt: '2025-10-03T12:10:00Z',
    area: '12 га',
    address: 'КФХ Петров',
    cadastral: '50:12:003:123',
    status: 'pending',
    price: 4800,
    notes: '',
  },
  {
    id: 'REQ-20250920-09',
    service: 'Создание карт для дифф. внесения азота',
    createdAt: '2025-09-20T08:00:00Z',
    area: '20 га',
    address: 'С/х участок №6',
    cadastral: '50:12:003:456',
    status: 'done',
    price: 7500,
    notes: 'Отчёт доступен',
  },
];

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'done'>(
    'all',
  );
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Замените URL на ваш реальный эндпоинт:
      // const { data } = await axios.get<RequestItem[]>('/api/requests');
      // setRequests(data);

      // Пока используем mock (для демо/дизайна)
      await new Promise((r) => setTimeout(r, 450));
      setRequests(mockRequests);
    } catch (err: any) {
      console.error(err);
      setError('Ошибка загрузки заявок');
      // fallback
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const drafts = useMemo(
    () => (requests ? requests.filter((r) => r.status === 'draft') : []),
    [requests],
  );

  const active = useMemo(
    () =>
      (requests || []).filter(
        (r) =>
          r.status !== 'draft' &&
          r.status !== 'done' &&
          r.status !== 'cancelled',
      ),
    [requests],
  );

  const done = useMemo(
    () => (requests ? requests.filter((r) => r.status === 'done') : []),
    [requests],
  );

  const filtered = useMemo(() => {
    if (!requests) return [];
    switch (filter) {
      case 'draft':
        return drafts;
      case 'active':
        return active;
      case 'done':
        return done;
      default:
        return requests;
    }
  }, [requests, filter, drafts, active, done]);

  const continueEditing = (id: string) => {
    // Переход к странице редактирования — подставьте ваш роут
    router.push(`/dashboard/requests/${id}/edit`);
  };

  const viewRequest = (id: string) => {
    router.push(`/dashboard/requests/${id}`);
  };

  const finalizeRequest = async (id: string) => {
    // Пример: отправляем на бек запрос оформить заявку (из черновика)
    setIsProcessingId(id);
    setError(null);
    try {
      // const { data } = await axios.post(`/api/requests/${id}/finalize`);
      // обновить список (или обновить конкретную заявку)
      await new Promise((r) => setTimeout(r, 700));
      setRequests(
        (prev) =>
          prev?.map((r) => (r.id === id ? { ...r, status: 'pending' } : r)) ??
          null,
      );
    } catch (err) {
      console.error(err);
      setError('Не удалось оформить заявку');
    } finally {
      setIsProcessingId(null);
    }
  };

  const cancelRequest = async (id: string) => {
    if (!confirm('Вы уверены, что хотите отменить заявку?')) return;
    setIsProcessingId(id);
    try {
      // await axios.post(`/api/requests/${id}/cancel`);
      await new Promise((r) => setTimeout(r, 600));
      setRequests(
        (prev) =>
          prev?.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)) ??
          null,
      );
    } catch (err) {
      console.error(err);
      setError('Ошибка при отмене');
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мои заявки</h1>
            <p className="mt-1 text-gray-600">
              Создавайте, редактируйте и отслеживайте заявки — всё в одном месте
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/new-request')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium shadow-lg hover:scale-[1.02] transition-transform"
            >
              <Plus className="w-4 h-4" /> Новая заявка
            </button>
          </div>
        </div>
      </div>

      {/* ошибки / загрузка */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertCircle className="inline-block mr-2 -mt-0.5" /> {error}
        </div>
      )}

      {loading && (
        <div className="p-6 bg-white rounded-lg shadow text-gray-500">
          Загрузка...
        </div>
      )}

      {/* Черновики — сверху, отдельно */}
      {drafts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-900">Черновики</h2>
            <span className="text-sm text-gray-500">{drafts.length} шт.</span>
          </div>

          <div className="space-y-3">
            {drafts.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-md">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {r.service}
                      </div>
                      <div className="text-xs text-gray-500">
                        · {r.area ?? '—'}
                      </div>
                      <div className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                        Черновик
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {r.address ?? r.cadastral ?? 'Адрес не указан'}
                    </div>
                    {r.notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        {r.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => continueEditing(r.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition text-sm"
                  >
                    <Edit className="w-4 h-4" /> Продолжить оформление
                  </button>

                  <button
                    onClick={() => finalizeRequest(r.id)}
                    disabled={isProcessingId === r.id}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-700 text-white text-sm shadow ${
                      isProcessingId === r.id
                        ? 'opacity-60 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {isProcessingId === r.id ? 'Отправка...' : 'Оформить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === 'active'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === 'done'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Завершённые
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === 'draft'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Черновики
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" /> Сортировка: по дате
        </div>
      </div>

      {/* Список заявок */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
            Заявок не найдено.{' '}
            <button
              className="text-blue-600 ml-1"
              onClick={() => router.push('/dashboard/new-request')}
            >
              Создать новую
            </button>
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-md bg-gray-50">
                <Map className="w-5 h-5 text-green-600" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {r.service}
                  </div>
                  <div className="text-xs text-gray-500">#{r.id}</div>
                  <div className="text-xs text-gray-500">
                    · {new Date(r.createdAt).toLocaleDateString()}
                  </div>

                  <StatusBadge status={r.status} />
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  {r.area ?? '—'} ·{' '}
                  {r.address ?? r.cadastral ?? 'адрес не указан'}
                </div>

                {r.price != null && (
                  <div className="text-sm text-gray-700 mt-2 font-semibold">
                    {formatCurrency(r.price)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => viewRequest(r.id)}
                className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition text-sm inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> Просмотр
              </button>

              {r.status === 'draft' && (
                <button
                  onClick={() => continueEditing(r.id)}
                  className="px-3 py-2 rounded-md border border-gray-200 hover:bg-blue-50 transition text-sm inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Редактировать
                </button>
              )}

              {r.status !== 'done' && r.status !== 'cancelled' && (
                <button
                  onClick={() => cancelRequest(r.id)}
                  className="px-3 py-2 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 transition text-sm inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Отменить
                </button>
              )}

              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function StatusBadge({ status }: { status: RequestStatus }) {
  const map = {
    draft: { label: 'Черновик', cls: 'bg-yellow-50 text-yellow-800' },
    pending: { label: 'На согласовании', cls: 'bg-blue-50 text-blue-800' },
    in_progress: { label: 'В работе', cls: 'bg-amber-50 text-amber-800' },
    done: { label: 'Выполнено', cls: 'bg-emerald-50 text-emerald-800' },
    cancelled: { label: 'Отменено', cls: 'bg-rose-50 text-rose-800' },
  } as const;

  return (
    <div className={`text-[12px] px-2 py-0.5 rounded-full ${map[status].cls}`}>
      {map[status].label}
    </div>
  );
}

function formatCurrency(n?: number) {
  if (n == null) return '';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
}
