import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera } from 'lucide-react';

// Тип запроса для создания дрона (оставил как у вас)
export interface CreateDroneRequest {
  droneName: string;
  batteryChargeTime: number;
  flightTime: number;
  maxWindSpeed: number;
  maxFlightSpeed: number;
  maxWorkingSpeed: number;
  weight: number;
  liftCapacity: number;
  width: number;
  height: number;
  operatingTemperature: number;
  maxFlightHeight: number;
  rotationSpeed: number;
  quantity: number;
  spraying: {
    flowRate: number;
    capacity: number;
    width: number;
  } | null;
  spreading: {
    flowRate: number;
    capacity: number;
    width: number;
  } | null;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'https://api.droneagro.xyz';

export interface AddDroneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateDroneRequest,
    imageFile?: File | null,
  ) => Promise<void>;
  sending: boolean;
}

export function AddDroneModal({
  open,
  onClose,
  onSubmit,
  sending,
}: AddDroneModalProps) {
  const [droneName, setDroneName] = useState('');
  const [batteryChargeTime, setBatteryChargeTime] = useState<number | ''>('');
  const [flightTime, setFlightTime] = useState<number | ''>('');
  const [maxWindSpeed, setMaxWindSpeed] = useState<number | ''>('');
  const [maxFlightSpeed, setMaxFlightSpeed] = useState<number | ''>('');
  const [maxWorkingSpeed, setMaxWorkingSpeed] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [liftCapacity, setLiftCapacity] = useState<number | ''>('');
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [operatingTemperature, setOperatingTemperature] = useState<number | ''>(
    '',
  );
  const [maxFlightHeight, setMaxFlightHeight] = useState<number | ''>('');
  const [rotationSpeed, setRotationSpeed] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');

  // spraying
  const [sprayingFlowRate, setSprayingFlowRate] = useState<number | ''>('');
  const [sprayingCapacity, setSprayingCapacity] = useState<number | ''>('');
  const [sprayingWidth, setSprayingWidth] = useState<number | ''>('');

  // spreading
  const [spreadingFlowRate, setSpreadingFlowRate] = useState<number | ''>('');
  const [spreadingCapacity, setSpreadingCapacity] = useState<number | ''>('');
  const [spreadingWidth, setSpreadingWidth] = useState<number | ''>('');

  // image preview (optional)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // clear fields when modal closes
      setDroneName('');
      setBatteryChargeTime('');
      setFlightTime('');
      setMaxWindSpeed('');
      setMaxFlightSpeed('');
      setMaxWorkingSpeed('');
      setWeight('');
      setLiftCapacity('');
      setWidth('');
      setHeight('');
      setOperatingTemperature('');
      setMaxFlightHeight('');
      setRotationSpeed('');
      setQuantity('');
      setSprayingFlowRate('');
      setSprayingCapacity('');
      setSprayingWidth('');
      setSpreadingFlowRate('');
      setSpreadingCapacity('');
      setSpreadingWidth('');
      setSelectedFile(null);
      setImagePreview(null);
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (!selectedFile) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setImagePreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.type !== 'image/jpeg' && f.type !== 'image/png') {
      alert('Пожалуйста, выберите файл в формате JPG или PNG');
      return;
    }
    setSelectedFile(f);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  // validation minimal
  const canSend =
    droneName.trim().length > 0 &&
    flightTime !== '' &&
    quantity !== '' &&
    Number(quantity) > 0;

  if (!open) return null;

  useEffect(() => {
    if (open) {
      // Запоминаем текущий скролл
      const scrollY = window.scrollY;
      // Блокируем скролл страницы
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        // Восстанавливаем скролл
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ y: 18, scale: 0.992, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 18, scale: 0.992, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-6 max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-nekstregular">
              Новый дрон
            </div>
            <div className="mt-1 text-lg font-nekstmedium text-slate-900">
              Добавление платформы
            </div>
          </div>

          <div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200 hover:shadow-sm transition"
            >
              <X size={16} className="text-slate-700" />
            </button>
          </div>
        </div>

        {/* Scrollable body — добавил pr-4 чтобы учесть полосу прокрутки */}
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          {/* Основная сетка */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4 min-w-0">
              <SectionTitle>Основные характеристики</SectionTitle>

              <Field label="Название *">
                <input
                  value={droneName}
                  onChange={(e) => setDroneName(e.target.value)}
                  placeholder="Например: DJI Agras T40"
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Время полёта (мин) *">
                  <input
                    type="number"
                    value={flightTime}
                    onChange={(e) =>
                      setFlightTime(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
                  />
                </Field>

                <Field label="Время зарядки (мин)">
                  <input
                    type="number"
                    value={batteryChargeTime}
                    onChange={(e) =>
                      setBatteryChargeTime(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Вес (кг)">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) =>
                      setWeight(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
                  />
                </Field>

                <Field label="Грузоподъёмность (кг)">
                  <input
                    type="number"
                    value={liftCapacity}
                    onChange={(e) =>
                      setLiftCapacity(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
                  />
                </Field>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4 min-w-0">
              <SectionTitle>Характеристики производительности</SectionTitle>

              <Field label="Макс скорость полёта">
                <input
                  type="number"
                  placeholder="Макс скорость полёта (м/с)"
                  value={maxFlightSpeed}
                  onChange={(e) =>
                    setMaxFlightSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>

              <Field label="Рабочая скорость (м/с)">
                <input
                  type="number"
                  value={maxWorkingSpeed}
                  onChange={(e) =>
                    setMaxWorkingSpeed(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Макс скорость ветра ">
                  <input
                    type="number"
                    value={maxWindSpeed}
                    onChange={(e) =>
                      setMaxWindSpeed(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                  />
                </Field>

                <Field label="Ширина (м)">
                  <input
                    type="number"
                    step="0.1"
                    value={width}
                    onChange={(e) =>
                      setWidth(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Высота (м)">
                  <input
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) =>
                      setHeight(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                  />
                </Field>

                <Field label="Скорость разворота">
                  <input
                    type="number"
                    value={rotationSpeed}
                    onChange={(e) =>
                      setRotationSpeed(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Spraying */}
          <div className="mt-6">
            <SectionTitle>Система распыления *</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <Field label="Расход (л/мин) *">
                <input
                  type="number"
                  step="0.1"
                  value={sprayingFlowRate}
                  onChange={(e) =>
                    setSprayingFlowRate(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>

              <Field label="Ёмкость (кг) *">
                <input
                  type="number"
                  value={sprayingCapacity}
                  onChange={(e) =>
                    setSprayingCapacity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>

              <Field label="Ширина (м) *">
                <input
                  type="number"
                  step="0.1"
                  value={sprayingWidth}
                  onChange={(e) =>
                    setSprayingWidth(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>
            </div>
          </div>

          {/* Spreading */}
          <div className="mt-6">
            <SectionTitle>Система разбрасывания *</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <Field label="Расход (кг/мин) *">
                <input
                  type="number"
                  step="0.1"
                  value={spreadingFlowRate}
                  onChange={(e) =>
                    setSpreadingFlowRate(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>

              <Field label="Ёмкость (кг) *">
                <input
                  type="number"
                  value={spreadingCapacity}
                  onChange={(e) =>
                    setSpreadingCapacity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>

              <Field label="Ширина (м) *">
                <input
                  type="number"
                  step="0.1"
                  value={spreadingWidth}
                  onChange={(e) =>
                    setSpreadingWidth(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>
            </div>
          </div>

          {/* Additional params */}
          <div className="mt-6">
            <SectionTitle>Дополнительные параметры</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <Field label="Рабочая температура (°C)">
                <input
                  type="number"
                  value={operatingTemperature}
                  onChange={(e) =>
                    setOperatingTemperature(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>

              <Field label="Макс высота полёта (м)">
                <input
                  type="number"
                  value={maxFlightHeight}
                  onChange={(e) =>
                    setMaxFlightHeight(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>

              <Field label="Количество (шт.) *">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full min-w-0 box-border px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>
            </div>
          </div>

          <div className="text-sm text-slate-500 font-nekstregular mt-4">
            * — обязательные поля
          </div>

          {/* Image */}
          <div className="mt-6 border-t border-[#c2c2c2] pt-6">
            <SectionTitle>Изображение дрона (опционально)</SectionTitle>
            <div className="flex items-start gap-4 min-w-0">
              {imagePreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm border">
                  <img
                    src={imagePreview}
                    alt="Предпросмотр"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm hover:opacity-95 transition">
                    <Camera size={16} />
                    <span className="text-sm font-nekstregular">
                      Выбрать изображение
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {selectedFile && (
                    <button
                      onClick={handleRemoveFile}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white/90 shadow-sm hover:bg-white transition font-nekstregular"
                    >
                      <X size={16} />
                      <span className="text-sm">Убрать</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-600 mt-2 min-w-0">
                  Поддерживается JPG и PNG. Максимум 5MB.
                  {selectedFile && (
                    <div className="mt-1 text-slate-700 font-nekstregular truncate">
                      Выбран:{' '}
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="mt-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition font-nekstregular"
          >
            Отменить
          </button>

          <button
            disabled={!canSend || sending}
            onClick={() => {
              const body: CreateDroneRequest = {
                droneName: droneName.trim(),
                batteryChargeTime:
                  batteryChargeTime === '' ? 0 : Number(batteryChargeTime),
                flightTime: flightTime === '' ? 0 : Number(flightTime),
                maxWindSpeed: maxWindSpeed === '' ? 0 : Number(maxWindSpeed),
                maxFlightSpeed:
                  maxFlightSpeed === '' ? 0 : Number(maxFlightSpeed),
                maxWorkingSpeed:
                  maxWorkingSpeed === '' ? 0 : Number(maxWorkingSpeed),
                weight: weight === '' ? 0 : Number(weight),
                liftCapacity: liftCapacity === '' ? 0 : Number(liftCapacity),
                width: width === '' ? 0 : Number(width),
                height: height === '' ? 0 : Number(height),
                operatingTemperature:
                  operatingTemperature === ''
                    ? 0
                    : Number(operatingTemperature),
                maxFlightHeight:
                  maxFlightHeight === '' ? 0 : Number(maxFlightHeight),
                rotationSpeed: rotationSpeed === '' ? 0 : Number(rotationSpeed),
                quantity: quantity === '' ? 0 : Number(quantity),
                spraying:
                  sprayingFlowRate !== '' &&
                  sprayingCapacity !== '' &&
                  sprayingWidth !== ''
                    ? {
                        flowRate: Number(sprayingFlowRate),
                        capacity: Number(sprayingCapacity),
                        width: Number(sprayingWidth),
                      }
                    : null,
                spreading:
                  spreadingFlowRate !== '' &&
                  spreadingCapacity !== '' &&
                  spreadingWidth !== ''
                    ? {
                        flowRate: Number(spreadingFlowRate),
                        capacity: Number(spreadingCapacity),
                        width: Number(spreadingWidth),
                      }
                    : null,
              };

              onSubmit(body, selectedFile);
            }}
            className={`px-5 py-2 rounded-full text-white ${
              !canSend || sending
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all'
            } font-nekstmedium`}
            aria-disabled={!canSend || sending}
          >
            {sending ? 'Отправка...' : 'Создать'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ——— Helpers ——— */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-nekstmedium text-slate-700 mb-1">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <div className="text-xs text-slate-500 mb-2">{label}</div>
      {children}
    </label>
  );
}
