'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Trash2,
  Edit,
  Eye,
  Plus,
  Search,
  RefreshCw,
  MapPin,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';

/** ---------------------------
 *  Типы
 *  --------------------------- */
interface Request {
  id: number;
  date: string; // желаемая дата выполнения
  field: string;
  crop: string;
  type: string;
  area: number;
  status: 'new' | 'in_progress' | 'completed' | 'rejected';
  coords?: [number, number][];
  contactPhone?: string;
  wavelengthMode?: 'auto' | 'manual';
  wavelengths?: string; // если ручной режим — список/строка с длинами волн
  details?: {
    chemicals?: string;
    dosage?: string;
    droneType?: string;
    operatorNotes?: string;
  };
  metadata?: {
    name?: string;
    area?: string;
    parcels?: string;
    crop?: string;
    notes?: string;
  };
  preview?: {
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  };
}

/** ---------------------------
 *  Статические опции
 *  --------------------------- */
const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'in_progress', label: 'В обработке' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'rejected', label: 'Отклонённые' },
];
const treatmentOptions = [
  { value: 'all', label: 'Все' },
  { value: 'spraying', label: 'Опрыскивание' },
  { value: 'fertilization', label: 'Внесение удобрений' },
  { value: 'mapping', label: 'Картографирование' },
];

/** ---------------------------
 *  ModernSelect (ваша версия)
 *  --------------------------- */
const ModernSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="space-y-2" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          onClick={() => setIsOpen((s) => !s)}
          className={`w-full px-4 py-3.5 text-left bg-white/90 rounded-xl border ${
            isOpen
              ? 'border-emerald-400 ring-2 ring-emerald-400/30'
              : 'border-gray-300/80'
          } text-gray-800 shadow-sm flex items-center justify-between`}
        >
          <span
            className={
              value === options[0] ? 'text-gray-400/90' : 'text-gray-700'
            }
          >
            {value}
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-500 ${isOpen ? 'text-emerald-500' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute z-30 w-full mt-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80"
            >
              {options.map((opt, idx) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between ${
                    value === opt ? 'bg-emerald-50' : 'hover:bg-gray-50'
                  } ${idx === 0 ? '' : 'border-t border-gray-100'}`}
                >
                  <span className="text-gray-700">{opt}</span>
                  {value === opt && (
                    <Check size={16} className="text-emerald-500" />
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/** ---------------------------
 *  FieldUploader — упрощённая версия (без прокладки путей)
 *  - Загружаем фото поля
 *  - Авто-извлечение метаданных
 *  - Опционально разбиваем на сегменты
 *  --------------------------- */
const SEGMENTS_IMAGE = '/images/segments-placeholder.jpg';

function FieldUploaderInline({
  initialPreview,
  onChangePreview,
  onChangeMetadata,
}: {
  initialPreview?: {
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  };
  onChangePreview: (p: {
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  }) => void;
  onChangeMetadata: (m: Request['metadata'] | null) => void;
}) {
  const [fieldPreview, setFieldPreview] = useState<string | null>(
    initialPreview?.fieldPreview ?? null,
  );
  const [isUploadingField, setIsUploadingField] = useState(false);
  const [fieldProgress, setFieldProgress] = useState(0);

  const [isSplitting, setIsSplitting] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [segmentsPreview, setSegmentsPreview] = useState<string | null>(
    initialPreview?.segmentsPreview ?? null,
  );

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onChangePreview({ fieldPreview, segmentsPreview });
  }, [fieldPreview, segmentsPreview, onChangePreview]);

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
    // авто-извлечение метаданных
    await sleep(200);
    onChangeMetadata({
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

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
      <div className="rounded-xl border border-gray-100 p-3 bg-white/90">
        {!fieldPreview && (
          <div className="flex flex-col items-stretch gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="py-2 rounded-lg bg-emerald-500 text-white"
            >
              Выбрать фото поля
            </button>
            <div className="text-sm text-gray-500">
              Или перетащите сюда. После загрузки — можно при необходимости
              разбить поле на участки.
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
            <div className="mt-3 flex gap-2 ">
              <button
                onClick={() => handleSplit()}
                className="px-3 py-1 rounded-lg  bg-emerald-500 text-white"
              >
                Разбить на участки
              </button>
              <button
                onClick={() => {
                  setFieldPreview(null);
                  onChangeMetadata(null);
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

        {segmentsPreview && (
          <div className="mt-3">
            <img
              src={segmentsPreview}
              alt="segments"
              className="w-full h-44 object-contain rounded-md"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setSegmentsPreview(null)}
                className="px-3 py-1 rounded-lg border"
              >
                Вернуть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** ---------------------------
 *  Главный компонент: RequestsWithEditor
 *  --------------------------- */
export default function RequestsWithEditor({
  setActiveMenu,
}: {
  setActiveMenu?: (s: string) => void;
}) {
  const [status, setStatus] = useState('all');
  const [treatmentType, setTreatmentType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      date: '2025-02-15',
      field: 'Поле №3 (Южное)',
      crop: 'Пшеница озимая',
      type: 'Опрыскивание',
      area: 45,
      status: 'completed',
      coords: [
        [54.88, 37.62],
        [54.881, 37.621],
        [54.882, 37.62],
      ],
      details: {
        chemicals: 'Агрохит',
        dosage: '1.2 л/га',
        droneType: 'DJI Agras T40',
      },
    },
    {
      id: 2,
      date: '2025-02-10',
      field: 'Поле №1 (Северное)',
      crop: 'Кукуруза',
      type: 'Внесение удобрений',
      area: 32,
      status: 'in_progress',
      details: {
        chemicals: 'NPK 15-15-15',
        dosage: '80 кг/га',
        droneType: 'DJI Agras T30',
      },
    },
    {
      id: 3,
      date: '2025-02-05',
      field: 'Поле №2 (Центральное)',
      crop: 'Подсолнечник',
      type: 'Картографирование',
      area: 28,
      status: 'new',
    },
  ]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [form, setForm] = useState({
    id: 0,
    date: '', // желаемая дата выполнения
    field: 'Выберите поле',
    crop: '',
    type: 'Выберите тип обработки',
    area: '',
    status: 'new' as Request['status'],
    chemicals: '',
    dosage: '',
    height: '',
    speed: '',
    comments: '',
    wavelengthMode: 'auto' as 'auto' | 'manual',
    wavelengths: '',
    contactPhone: '',
  });

  const [preview, setPreview] = useState<{
    fieldPreview?: string | null;
    segmentsPreview?: string | null;
  } | null>(null);
  const [metadata, setMetadata] = useState<Request['metadata'] | null>(null);

  useEffect(() => {
    if (editingRequest) {
      setForm({
        id: editingRequest.id,
        date: editingRequest.date,
        field: editingRequest.field,
        crop: editingRequest.crop,
        type: editingRequest.type,
        area: String(editingRequest.area),
        status: editingRequest.status,
        chemicals: editingRequest.details?.chemicals ?? '',
        dosage: editingRequest.details?.dosage ?? '',
        height: editingRequest.details?.droneType ?? '',
        speed: '',
        comments: editingRequest.details?.operatorNotes ?? '',
        wavelengthMode: editingRequest.wavelengthMode ?? 'auto',
        wavelengths: editingRequest.wavelengths ?? '',
        contactPhone: editingRequest.contactPhone ?? '',
      });
      setPreview(editingRequest.preview ?? null);
      setMetadata(editingRequest.metadata ?? null);
    } else {
      setForm({
        id: 0,
        date: new Date().toISOString().slice(0, 10),
        field: 'Выберите поле',
        crop: '',
        type: 'Выберите тип обработки',
        area: '',
        status: 'new',
        chemicals: '',
        dosage: '',
        height: '',
        speed: '',
        comments: '',
        wavelengthMode: 'auto',
        wavelengths: '',
        contactPhone: '',
      });
      setPreview(null);
      setMetadata(null);
    }
  }, [editingRequest, editorOpen]);

  const filtered = requests.filter((r) => {
    if (status !== 'all' && r.status !== status) return false;
    if (treatmentType !== 'all') {
      if (treatmentType === 'spraying' && !/опрыс/i.test(r.type.toLowerCase()))
        return false;
      if (
        treatmentType === 'fertilization' &&
        !/внес/i.test(r.type.toLowerCase())
      )
        return false;
      if (
        treatmentType === 'mapping' &&
        !/картограф/i.test(r.type.toLowerCase())
      )
        return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !String(r.id).includes(q) &&
        !r.field.toLowerCase().includes(q) &&
        !r.crop.toLowerCase().includes(q)
      )
        return false;
    }
    if (dateFrom && new Date(r.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(r.date) > new Date(dateTo)) return false;
    return true;
  });

  const openNew = () => {
    setIsNew(true);
    setEditingRequest(null);
    setEditorOpen(true);
  };

  const openEdit = (r: Request) => {
    setIsNew(false);
    setEditingRequest(r);
    setEditorOpen(true);
  };

  const saveForm = () => {
    if (
      !form.field ||
      form.field === 'Выберите поле' ||
      !form.type ||
      form.type === 'Выберите тип обработки'
    ) {
      alert('Выберите поле и тип обработки');
      return;
    }

    const payload: Request = {
      id: isNew ? Math.max(0, ...requests.map((x) => x.id)) + 1 : form.id,
      date: form.date,
      field: form.field,
      crop: form.crop || metadata?.crop || '—',
      type: form.type,
      area: Number(form.area) || 0,
      status: form.status,
      coords: editingRequest?.coords ?? undefined,
      contactPhone: form.contactPhone || undefined,
      wavelengthMode: form.wavelengthMode as 'auto' | 'manual',
      wavelengths:
        form.wavelengthMode === 'manual'
          ? form.wavelengths || undefined
          : undefined,
      details: {
        chemicals: form.chemicals || undefined,
        dosage: form.dosage || undefined,
        droneType: form.height || undefined,
        operatorNotes: form.comments || undefined,
      },
      metadata: metadata ?? undefined,
      preview: preview ?? undefined,
    };

    setRequests((prev) => {
      if (isNew) return [payload, ...prev];
      return prev.map((p) => (p.id === payload.id ? payload : p));
    });

    setEditorOpen(false);
    setEditingRequest(null);
    setIsNew(false);
  };

  const deleteRequest = (id: number) => {
    if (!confirm('Удалить заявку?')) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setEditorOpen(false);
    setEditingRequest(null);
  };

  const [viewRequest, setViewRequest] = useState<Request | null>(null);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Мои заявки</h2>
            <div className="text-sm text-gray-500 mt-1">
              Управление заказами: создавайте, редактируйте и просматривайте.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-gray-100">
              Активных:{' '}
              <span className="font-semibold text-gray-900 ml-2">
                {requests.filter((r) => r.status !== 'completed').length}
              </span>
            </div>
            <button
              onClick={openNew}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow"
            >
              <Plus size={16} /> Новая заявка
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                Статус
              </label>
              <ModernSelect
                options={statusOptions.map((o) => o.label)}
                value={
                  statusOptions.find((o) => o.value === status)?.label || 'Все'
                }
                onChange={(label) => {
                  const opt = statusOptions.find((o) => o.label === label);
                  if (opt) setStatus(opt.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                Тип обработки
              </label>
              <ModernSelect
                options={treatmentOptions.map((o) => o.label)}
                value={
                  treatmentOptions.find((o) => o.value === treatmentType)
                    ?.label || 'Все'
                }
                onChange={(label) => {
                  const opt = treatmentOptions.find((o) => o.label === label);
                  if (opt) setTreatmentType(opt.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                Дата с
              </label>
              <input
                type="date"
                className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700/90 mb-1.5 pl-1.5">
                Дата по
              </label>
              <input
                type="date"
                className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-black pointer-events-none z-10">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по номеру заявки, полю или культуре..."
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border border-gray-300/80 focus:ring-2 focus:ring-emerald-400 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              className="p-3 bg-white/90 rounded-xl border border-gray-200 shadow-sm"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setStatus('all');
                setTreatmentType('all');
                setSearchQuery('');
              }}
            >
              <RefreshCw size={18} />
            </motion.button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Поле
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Площадь (га)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.field}
                      <div className="text-xs text-gray-500">
                        {request.crop}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${request.status === 'completed' ? 'bg-green-100 text-green-800' : request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : request.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {request.status === 'completed'
                          ? 'Завершено'
                          : request.status === 'in_progress'
                            ? 'В обработке'
                            : request.status === 'new'
                              ? 'Новая'
                              : 'Отклонена'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-emerald-600 hover:text-emerald-900"
                          onClick={() => setViewRequest(request)}
                          title="Просмотр"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => openEdit(request)}
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        {(request.status === 'new' ||
                          request.status === 'in_progress') && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => deleteRequest(request.id)}
                            title="Удалить"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Показано <span className="font-medium">1</span> -{' '}
              <span className="font-medium">{filtered.length}</span> из{' '}
              <span className="font-medium">{requests.length}</span>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Назад
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Вперед
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {viewRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    Заявка #{viewRequest.id} •{' '}
                    {new Date(viewRequest.date).toLocaleDateString()}
                  </div>
                  <div className="text-lg font-semibold mt-1">
                    {viewRequest.field}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openEdit(viewRequest);
                      setViewRequest(null);
                    }}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => setViewRequest(null)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg"
                  >
                    Закрыть
                  </button>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>
                      <strong>Тип обработки:</strong> {viewRequest.type}
                    </div>
                    <div className="mt-1">
                      <strong>Культура:</strong> {viewRequest.crop}
                    </div>
                    <div className="mt-1">
                      <strong>Площадь:</strong> {viewRequest.area} га
                    </div>
                    {viewRequest.details?.chemicals && (
                      <div className="mt-1">
                        <strong>Средство:</strong>{' '}
                        {viewRequest.details.chemicals} (
                        {viewRequest.details.dosage})
                      </div>
                    )}
                    {viewRequest.details?.droneType && (
                      <div className="mt-1">
                        <strong>Техника:</strong>{' '}
                        {viewRequest.details.droneType}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    {viewRequest.preview?.fieldPreview ? (
                      <img
                        src={viewRequest.preview.fieldPreview}
                        alt="preview"
                        className="w-full h-60 object-cover"
                      />
                    ) : viewRequest.coords && viewRequest.coords.length > 0 ? (
                      <div className="p-6 text-sm text-gray-700">
                        <div className="font-medium mb-2">
                          Координаты участка
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          {viewRequest.coords.map((c, i) => (
                            <div key={i}>
                              [{c[0].toFixed(6)}, {c[1].toFixed(6)}]
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <MapPin
                          size={36}
                          className="mx-auto mb-2 text-gray-400"
                        />
                        <div>Координаты не указаны</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Можно загрузить фото участка в редакторе заявки.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500">Статус</div>
                    <div className="mt-2">
                      <span
                        className={`px-3 py-2 rounded-full text-sm ${viewRequest.status === 'completed' ? 'bg-green-100 text-green-800' : viewRequest.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : viewRequest.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {viewRequest.status === 'completed'
                          ? 'Завершено'
                          : viewRequest.status === 'in_progress'
                            ? 'В обработке'
                            : viewRequest.status === 'new'
                              ? 'Новая'
                              : 'Отклонена'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-gray-100">
                    <div className="text-xs text-gray-500">Контакты</div>
                    <div className="mt-2 text-sm text-gray-700">
                      {viewRequest.contactPhone ?? 'Телефон не указан'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-gray-100">
                    <div className="text-xs text-gray-500">Дополнительно</div>
                    <div className="mt-2 text-sm text-gray-700">
                      Режим длин волн:{' '}
                      <strong>
                        {viewRequest.wavelengthMode === 'manual'
                          ? 'Пользовательские длины волн'
                          : 'Вычислить за меня'}
                      </strong>
                      {viewRequest.wavelengths && (
                        <div className="mt-2 text-xs text-gray-500">
                          Длины волн: {viewRequest.wavelengths}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  ID:{' '}
                  <span className="font-medium text-gray-700">
                    #{viewRequest.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openEdit(viewRequest);
                      setViewRequest(null);
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Открыть в редакторе
                  </button>
                  <button
                    onClick={() => setViewRequest(null)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editorOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-full md:w-[880px] z-50 bg-white shadow-2xl overflow-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-40">
              <div>
                <div className="text-sm text-gray-500">
                  {isNew ? 'Новая заявка' : `Редактирование заявки #${form.id}`}
                </div>
                <div className="text-lg font-semibold mt-1">{form.field}</div>
              </div>
              <div className="flex items-center gap-2">
                {!isNew && (
                  <button
                    onClick={() => deleteRequest(form.id)}
                    className="px-4 py-2 bg-white text-red-600 rounded-xl border border-red-100 hover:bg-red-50"
                  >
                    Удалить
                  </button>
                )}
                <button
                  onClick={() => {
                    saveForm();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg flex items-center gap-2"
                >
                  <Save size={16} /> Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    setEditingRequest(null);
                  }}
                  className="p-2 rounded-full bg-gray-100 ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white/90 rounded-2xl border border-gray-100 p-4">
                    <div className="flex gap-4 border-b border-gray-100 pb-3 mb-4">
                      <button
                        className={`pb-2 px-1 font-medium ${'details' === 'details' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                      >
                        Данные
                      </button>
                      <button
                        className={`pb-2 px-1 font-medium ${'upload' === 'upload' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                      >
                        Загрузка поля
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ModernSelect
                        label="Поле"
                        options={[
                          'Выберите поле',
                          'Поле №1 (Пшеница, 45 га)',
                          'Поле №2 (Кукуруза, 32 га)',
                        ]}
                        value={form.field}
                        onChange={(v) => setForm((s) => ({ ...s, field: v }))}
                      />

                      <ModernSelect
                        label="Тип обработки"
                        options={[
                          'Выберите тип обработки',
                          'Опрыскивание',
                          'Внесение удобрений',
                          'Картографирование',
                        ]}
                        value={form.type}
                        onChange={(v) => setForm((s) => ({ ...s, type: v }))}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Желаемая дата выполнения
                        </label>
                        <input
                          type="date"
                          value={form.date}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, date: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Площадь (га)
                        </label>
                        <input
                          type="number"
                          value={form.area}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, area: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Препарат
                        </label>
                        <input
                          type="text"
                          value={form.chemicals}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              chemicals: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Доза
                        </label>
                        <input
                          type="text"
                          value={form.dosage}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, dosage: e.target.value }))
                          }
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Комментарии
                        </label>
                        <textarea
                          value={form.comments}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, comments: e.target.value }))
                          }
                          rows={3}
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Контактный телефон
                        </label>
                        <input
                          type="tel"
                          value={form.contactPhone}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              contactPhone: e.target.value,
                            }))
                          }
                          placeholder="+7 900 000-00-00"
                          className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-700/90 mb-1.5">
                          Длины волн / режим
                        </label>
                        <div className="flex items-center gap-3">
                          <label
                            className={`px-3 py-2 rounded-lg border ${form.wavelengthMode === 'auto' ? 'border-emerald-400 bg-emerald-50' : ''}`}
                          >
                            <input
                              type="radio"
                              name="wlen"
                              checked={form.wavelengthMode === 'auto'}
                              onChange={() =>
                                setForm((s) => ({
                                  ...s,
                                  wavelengthMode: 'auto',
                                }))
                              }
                              className="mr-2"
                            />{' '}
                            Выполните расчёт за меня
                          </label>
                          <label
                            className={`px-3 py-2 rounded-lg border ${form.wavelengthMode === 'manual' ? 'border-emerald-400 bg-emerald-50' : ''}`}
                          >
                            <input
                              type="radio"
                              name="wlen"
                              checked={form.wavelengthMode === 'manual'}
                              onChange={() =>
                                setForm((s) => ({
                                  ...s,
                                  wavelengthMode: 'manual',
                                }))
                              }
                              className="mr-2"
                            />{' '}
                            Я предоставляю длины волн
                          </label>
                        </div>
                        {form.wavelengthMode === 'manual' && (
                          <textarea
                            value={form.wavelengths}
                            onChange={(e) =>
                              setForm((s) => ({
                                ...s,
                                wavelengths: e.target.value,
                              }))
                            }
                            rows={3}
                            placeholder="Введите длины волн через запятую или пробел, например: 450, 550, 650"
                            className="w-full px-4 py-3.5 bg-white/90 rounded-xl border border-gray-300/80 outline-none mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 rounded-2xl border border-gray-100 p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-600" />{' '}
                      Загрузить фото поля
                    </h3>
                    <FieldUploaderInline
                      initialPreview={preview ?? undefined}
                      onChangePreview={(p) => setPreview(p)}
                      onChangeMetadata={(m) => setMetadata(m)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <h4 className="font-medium mb-3">Информация о поле</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Культура</span>
                        <span className="font-medium">
                          {metadata?.crop ?? (form.crop || '—')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Площадь</span>
                        <span className="font-medium">
                          {metadata?.area ??
                            (form.area ? `${form.area} га` : '—')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Участков</span>
                        <span className="font-medium">
                          {metadata?.parcels ?? '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Примечание</span>
                        <span className="font-medium">
                          {metadata?.notes ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <h4 className="font-medium mb-3">История обработок</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">Опрыскивание</div>
                            <div className="text-xs text-gray-500">
                              15.02.2024
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-emerald-100 rounded-full text-emerald-800">
                            Завершено
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">Картографирование</div>
                            <div className="text-xs text-gray-500">
                              10.02.2024
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-800">
                            Анализ
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    setEditingRequest(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  Отмена
                </button>
                <button
                  onClick={() => saveForm()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                >
                  Сохранить заявку
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
