import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera } from 'lucide-react';

// API base URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'https://api.droneagro.xyz';

/* -------------------- EditDroneModal -------------------- */
interface EditDroneModalProps {
  open: boolean;
  drone: Drone;
  onClose: () => void;
  onSubmit: (data: CreateDroneRequest) => void;
  sending: boolean;
}

// Типы дронов и пропсов
import { CreateDroneRequest, Drone } from '../types';
// import { EditDroneModalProps } from './types';

export function EditDroneModal({
  drone,
  onClose,
  onSubmit,
  sending,
}: EditDroneModalProps) {
  const [droneName, setDroneName] = useState(drone.droneName);
  const [batteryChargeTime, setBatteryChargeTime] = useState<number | ''>(
    drone.batteryChargeTime,
  );
  const [flightTime, setFlightTime] = useState<number | ''>(drone.flightTime);
  const [maxWindSpeed, setMaxWindSpeed] = useState<number | ''>(
    drone.maxWindSpeed,
  );
  const [maxFlightSpeed, setMaxFlightSpeed] = useState<number | ''>(
    drone.maxFlightSpeed,
  );
  const [maxWorkingSpeed, setMaxWorkingSpeed] = useState<number | ''>(
    drone.maxWorkingSpeed,
  );
  const [weight, setWeight] = useState<number | ''>(drone.weight);
  const [liftCapacity, setLiftCapacity] = useState<number | ''>(
    drone.liftCapacity,
  );
  const [width, setWidth] = useState<number | ''>(drone.width);
  const [height, setHeight] = useState<number | ''>(drone.height);
  const [operatingTemperature, setOperatingTemperature] = useState<number | ''>(
    drone.operatingTemperature,
  );
  const [maxFlightHeight, setMaxFlightHeight] = useState<number | ''>(
    drone.maxFlightHeight,
  );
  const [rotationSpeed, setRotationSpeed] = useState<number | ''>(
    drone.rotationSpeed,
  );
  const [quantity, setQuantity] = useState<number | ''>(drone.quantity);

  // Spraying system
  const [sprayingFlowRate, setSprayingFlowRate] = useState<number | ''>(
    drone.spraying?.flowRate ?? '',
  );
  const [sprayingCapacity, setSprayingCapacity] = useState<number | ''>(
    drone.spraying?.capacity ?? '',
  );
  const [sprayingWidth, setSprayingWidth] = useState<number | ''>(
    drone.spraying?.width ?? '',
  );

  // Spreading system
  const [spreadingFlowRate, setSpreadingFlowRate] = useState<number | ''>(
    drone.spreading?.flowRate ?? '',
  );
  const [spreadingCapacity, setSpreadingCapacity] = useState<number | ''>(
    drone.spreading?.capacity ?? '',
  );
  const [spreadingWidth, setSpreadingWidth] = useState<number | ''>(
    drone.spreading?.width ?? '',
  );

  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    drone.imageKey
      ? drone.imageKey.startsWith('http')
        ? drone.imageKey
        : `${API_BASE}/api/drones-download?droneId=${drone.droneId}`
      : null,
  );

  const canSend =
    droneName.trim() &&
    flightTime !== '' &&
    quantity !== '' &&
    Number(quantity) > 0;

  // Image upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/jpeg') {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Пожалуйста, выберите файл в формате JPG');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(
      drone.imageKey
        ? drone.imageKey.startsWith('http')
          ? drone.imageKey
          : `${API_BASE}/api/drones-download?droneId=${drone.droneId}`
        : null,
    );
  };

  const uploadImageAfterSave = async (droneId: number) => {
    if (!selectedFile) return;

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;

      // Step 1: Get upload URL
      console.log('Starting image upload for drone:', droneId);

      const uploadUrlRes = await fetch(
        `${API_BASE}/api/drones-upload?droneId=${droneId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!uploadUrlRes.ok) {
        const errorText = await uploadUrlRes
          .text()
          .catch(() => 'Unknown error');
        console.error(
          'Upload URL request failed:',
          uploadUrlRes.status,
          errorText,
        );
        throw new Error(
          `Ошибка получения URL для загрузки (${uploadUrlRes.status}): ${errorText}`,
        );
      }

      const uploadUrlData = await uploadUrlRes.json();
      const uploadUrl = uploadUrlData.url;
      console.log('Got upload URL:', uploadUrl ? 'URL received' : 'No URL');

      if (!uploadUrl) {
        throw new Error('URL для загрузки не найден в ответе сервера');
      }

      // Step 2: Upload file to presigned URL
      console.log('Uploading file to storage...');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type || 'image/jpeg',
        },
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => 'Unknown error');
        console.error('File upload failed:', uploadRes.status, errorText);
        throw new Error(
          `Ошибка загрузки файла в объектное хранилище (${uploadRes.status}): ${errorText}`,
        );
      }

      console.log('File uploaded successfully');

      // Step 3: Confirm upload
      const confirmRes = await fetch(
        `${API_BASE}/api/drones-confirm-upload?droneId=${droneId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!confirmRes.ok) {
        const errorText = await confirmRes.text().catch(() => 'Unknown error');
        console.error(
          'Upload confirmation failed:',
          confirmRes.status,
          errorText,
        );
        throw new Error(
          `Ошибка подтверждения загрузки (${confirmRes.status}): ${errorText}`,
        );
      }

      console.log('Upload confirmed successfully');

      setSelectedFile(null);
      console.log('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 18, scale: 0.992, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 18, scale: 0.992, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-6 max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">
              Редактирование
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <h3 className="text-lg lg:text-xl font-nekstmedium text-slate-900 leading-tight">
                {drone?.droneName ?? 'Новый дрон'}
              </h3>
              <span className="text-sm text-slate-500">
                ID: {drone?.droneId ?? '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200 hover:bg-white transition-colors shadow-sm"
            >
              <X size={16} className="text-slate-700" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[62vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left column — Basic info */}
            <div className="space-y-4">
              <SectionTitle>Основные характеристики</SectionTitle>

              <Field label="Название *">
                <input
                  value={droneName}
                  onChange={(e) => setDroneName(e.target.value)}
                  placeholder="Например: DJI Agras T40"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-nekstregular"
                  />
                </Field>
              </div>
            </div>

            {/* Right column — Performance & Physical */}
            <div className="space-y-4">
              <SectionTitle>Характеристики производительности</SectionTitle>

              <div className="grid grid-cols-1 gap-3">
                <Field label="Макс скорость полёта (м/с)">
                  <input
                    type="number"
                    value={maxFlightSpeed}
                    onChange={(e) =>
                      setMaxFlightSpeed(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Макс скорость ветра (м/с)">
                    <input
                      type="number"
                      value={maxWindSpeed}
                      onChange={(e) =>
                        setMaxWindSpeed(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                    />
                  </Field>

                  <Field label="Скорость разворота (об/мин)">
                    <input
                      type="number"
                      value={rotationSpeed}
                      onChange={(e) =>
                        setRotationSpeed(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* Spraying system */}
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>
            </div>
          </div>

          {/* Spreading system */}
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-nekstregular"
                />
              </Field>
            </div>
          </div>

          <div className="text-sm text-slate-500 font-nekstregular mt-4">
            * — обязательные поля
          </div>

          {/* Image upload */}
          <div className="mt-6 border-t border-[#c2c2c2] pt-6">
            <h4 className="text-sm font-nekstmedium mb-3">Изображение дрона</h4>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm border">
                  <img
                    src={imagePreview}
                    alt="Предпросмотр"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm hover:opacity-95 transition">
                    <Camera size={16} />
                    <span className="text-sm font-nekstregular">
                      Выбрать изображение
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg"
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
                      <span className="text-sm">Убрать файл</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-600 mt-2">
                  Поддерживается JPG. Максимальный размер: 5MB.
                  {selectedFile && (
                    <div className="mt-1 text-slate-700 font-nekstregular">
                      Выбран:{' '}
                      <span className="font-medium">{selectedFile.name}</span>
                      <div className="text-emerald-600 text-xs">
                        Изображение загрузится при сохранении
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition font-nekstregular"
          >
            Отменить
          </button>

          <button
            disabled={!canSend || sending}
            onClick={async () => {
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

              onSubmit(body);

              if (selectedFile) {
                try {
                  await uploadImageAfterSave(drone.droneId);
                } catch (error) {
                  console.error('Image upload failed:', error);
                  alert(
                    'Дрон сохранён, но изображение не удалось загрузить: ' +
                      (error instanceof Error
                        ? error.message
                        : 'Неизвестная ошибка'),
                  );
                }
              }
            }}
            className={`px-5 py-2 rounded-full text-white ${
              !canSend || sending
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all'
            } font-nekstmedium`}
          >
            {sending ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

{
  /* ——— Helpers (inline small components) ——— */
}
{
  /* You can paste these helpers once in the same file (above or below) — they use the same fonts */
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-nekstmedium text-slate-700 mb-2">
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
    <label className="block">
      <div className="text-xs text-slate-500 mb-2">{label}</div>
      {children}
    </label>
  );
}
