'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Save } from 'lucide-react';

interface Props {
  setActiveMenu?: (s: string) => void;
}

// Замените на свои локальные изображения или URL-заглушки
const SEGMENTS_IMAGE = '2.jpg';
const PATHS_IMAGE = '3.jpg';

const simulateDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Компонент для анимированного показа текста слева->направо (по символам)
function AnimatedText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const chars = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: 0 },
    },
  };
  const child = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.16 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={`inline-flex flex-wrap gap-0 ${className}`}
      aria-hidden
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          variants={child}
          className="inline-block whitespace-pre leading-tight"
        >
          {ch}
        </motion.span>
      ))}
    </motion.div>
  );
}

type Toast = {
  id: number;
  message: string;
  tone?: 'success' | 'info' | 'error';
};

export default function FieldUploaderWithPath({ setActiveMenu }: Props) {
  // исходная логика загрузки поля
  const [fieldFile, setFieldFile] = useState<File | null>(null);
  const [fieldPreview, setFieldPreview] = useState<string | null>(null);
  const [isUploadingField, setIsUploadingField] = useState(false);
  const [fieldProgress, setFieldProgress] = useState(0);

  const [isSplitting, setIsSplitting] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [segmentsShown, setSegmentsShown] = useState(false);
  const [segmentsPreview, setSegmentsPreview] = useState<string | null>(null);

  const [isProcessingPaths, setIsProcessingPaths] = useState(false);
  const [pathsProgress, setPathsProgress] = useState(0);
  const [pathsShown, setPathsShown] = useState(false);
  const [pathsPreview, setPathsPreview] = useState<string | null>(null);

  const fieldInputRef = useRef<HTMLInputElement | null>(null);

  // --- НОВОЕ: метаданные ---
  const [metadata, setMetadata] = useState<{
    name?: string;
    area?: string; // например "12.3 ha"
    parcels?: string;
    crop?: string;
    notes?: string;
  } | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [{ id, message, tone }, ...t]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  // булево для внутренней логики (drop-zone)
  const hasPreview = Boolean(fieldPreview || segmentsPreview || pathsPreview);

  // Создание object URL для локально загруженного фото
  useEffect(() => {
    if (!fieldFile) return;
    const url = URL.createObjectURL(fieldFile);
    setFieldPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [fieldFile]);

  // Когда появляется fieldPreview — автоматически запускаем "извлечение" метаданных
  useEffect(() => {
    if (!fieldPreview) {
      setMetadata(null);
      return;
    }

    // симуляция извлечения метаданных: имя, площадь и т.д.
    const extract = async () => {
      setMetaLoading(true);
      setMetadata(null);

      // небольшая вариативность по времени
      await simulateDelay(700 + Math.floor(Math.random() * 700));

      const seed = fieldFile ? fieldFile.size : Date.now();
      const pseudo = (n: number) => Math.abs(Math.sin(seed + n) * 10000) % 1;

      const area = (Math.round((5 + pseudo(1) * 95) * 10) / 10).toFixed(1); // 5.0 - 100.0 ha
      const parcels = Math.max(1, Math.round(1 + pseudo(2) * 8));
      const crops = ['Пшеница', 'Кукуруза', 'Подсолнечник', 'Ячмень', 'Рис'];
      const crop = crops[Math.floor(pseudo(3) * crops.length)];

      setMetadata({
        name: `Поле ${new Date().getFullYear()}-${Math.floor(pseudo(4) * 1000)}`,
        area: `${area} ha`,
        parcels: `${parcels}`,
        crop,
        notes: 'Дальнейшая информация',
      });

      // лёгкий эффект — уведомление
      pushToast('Метаданные извлечены', 'success');

      // даём пользователю время увидеть анимацию
      await simulateDelay(50);
      setMetaLoading(false);
    };

    extract();
  }, [fieldPreview, fieldFile]);

  // Закрытие модалки по Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    if (modalOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const openModal = (src: string | null) => {
    if (!src) return;
    setModalSrc(src);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalSrc(null), 200);
  };

  // Вынесенный обработчик файла (используется и для drop)
  const handleFile = (file: File) => {
    resetSteps();
    setFieldFile(file);
    simulateUploadForField(file);
  };

  // Хендлер выбора файла поля
  const onFieldFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const simulateUploadForField = async (file?: File) => {
    const uploadFile = file ?? fieldFile;
    if (!uploadFile) return;

    setIsUploadingField(true);
    setFieldProgress(0);

    const totalMs = 900 + Math.floor(Math.random() * 800); // чуть быстрее
    const stepMs = 80;
    const steps = Math.ceil(totalMs / stepMs);
    for (let i = 1; i <= steps; i++) {
      // eslint-disable-next-line no-await-in-loop
      await simulateDelay(stepMs);
      setFieldProgress(Math.min(100, Math.round((i / steps) * 100)));
    }

    await simulateDelay(120);
    setIsUploadingField(false);
    setFieldProgress(100);
    pushToast('Фото загружено', 'success');
  };

  const handleSplitToSegments = async () => {
    if (!fieldPreview) return;

    setIsSplitting(true);
    setSplitProgress(0);
    setSegmentsShown(false);
    setPathsShown(false);
    setPathsPreview(null);

    const totalMs = 1400 + Math.floor(Math.random() * 1200);
    const stepMs = 80;
    const steps = Math.ceil(totalMs / stepMs);
    for (let i = 1; i <= steps; i++) {
      // eslint-disable-next-line no-await-in-loop
      await simulateDelay(stepMs);
      setSplitProgress(Math.min(100, Math.round((i / steps) * 100)));
    }

    await simulateDelay(120);
    setIsSplitting(false);
    setSplitProgress(100);

    setSegmentsPreview(SEGMENTS_IMAGE);
    setSegmentsShown(true);
    pushToast('Поле разбито на участки', 'success');
  };

  const handleProcessPaths = async () => {
    if (!segmentsShown) return;

    setIsProcessingPaths(true);
    setPathsProgress(0);
    setPathsShown(false);

    const totalMs = 1400 + Math.floor(Math.random() * 1200);
    const stepMs = 80;
    const steps = Math.ceil(totalMs / stepMs);
    for (let i = 1; i <= steps; i++) {
      // eslint-disable-next-line no-await-in-loop
      await simulateDelay(stepMs);
      setPathsProgress(Math.min(100, Math.round((i / steps) * 100)));
    }

    await simulateDelay(120);
    setIsProcessingPaths(false);
    setPathsProgress(100);

    setPathsPreview(PATHS_IMAGE);
    setPathsShown(true);
    pushToast('Пути проложены', 'success');
  };

  const resetAll = () => {
    setFieldFile(null);
    setFieldPreview(null);
    setFieldProgress(0);
    setIsUploadingField(false);

    resetSteps();

    if (fieldInputRef.current) fieldInputRef.current.value = '';
  };

  const resetSteps = () => {
    setIsSplitting(false);
    setSplitProgress(0);
    setSegmentsShown(false);
    setSegmentsPreview(null);

    setIsProcessingPaths(false);
    setPathsProgress(0);
    setPathsShown(false);
    setPathsPreview(null);

    setMetadata(null);
    setMetaLoading(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <button
              className="text-gray-500 hover:text-emerald-600"
              onClick={() => setActiveMenu && setActiveMenu('requests')}
            >
              ← Назад
            </button>
            <h1 className="text-2xl font-semibold">
              Шаговая загрузка поля и путей
            </h1>
          </div>

          {/* Внешний grid всегда 3 колонки на lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левый блок — всегда занимает 2 колонки на lg */}
            <div className="lg:col-span-2 space-y-4">
              {/* Блок загрузки поля */}
              <div className="p-6 bg-white/90 backdrop-blur-lg rounded-2xl border border-white/20 shadow-md w-full">
                <h2 className="font-medium mb-3">1) Загрузите фото поля</h2>

                {/* flex direction меняется: если есть preview — на md row, иначе column */}
                <div
                  className={`flex flex-col ${hasPreview ? 'md:flex-row md:items-center' : ''} gap-3 items-stretch`}
                >
                  <input
                    ref={fieldInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFieldFileChange}
                    className="hidden"
                    id="field-photo-input"
                  />

                  {/* Drop-zone / кнопка */}
                  {!fieldPreview && !isUploadingField && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fieldInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      className={`cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-400 transition p-4 flex flex-col items-stretch justify-center bg-white/60 shadow-sm ${hasPreview ? 'w-full md:w-80' : 'w-full'}`}
                    >
                      <div className="w-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fieldInputRef.current?.click();
                          }}
                          className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition shadow-sm"
                        >
                          Выбрать фото
                        </button>

                        <p className="mt-2 text-sm text-gray-500 text-center w-full">
                          или перетащите файл сюда (поддерживаются изображения)
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="w-full">
                    <AnimatePresence>
                      {isUploadingField && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mt-3"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="w-8 h-8 rounded-full border-4 border-dashed border-emerald-400/50 flex items-center justify-center"
                            >
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </motion.div>
                            <div className="w-full">
                              <div className="text-sm text-gray-600 mb-2">
                                Загрузка фото…
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                                  style={{ width: `${fieldProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-4">
                      {!isUploadingField &&
                        !segmentsShown &&
                        !pathsShown &&
                        fieldPreview && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.32 }}
                            className="rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                          >
                            <motion.img
                              whileHover={{ scale: 1.02 }}
                              src={fieldPreview}
                              alt="Field preview"
                              className="w-full h-64 object-cover cursor-pointer"
                              onClick={() => openModal(fieldPreview)}
                              role="button"
                              aria-label="Открыть изображение поля в просмотрщике"
                            />
                            <div className="p-3 flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                Исходное фото поля
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    simulateUploadForField();
                                  }}
                                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                                >
                                  Повторить загрузку
                                </button>
                                <button
                                  onClick={handleSplitToSegments}
                                  className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-sm"
                                  disabled={isSplitting}
                                >
                                  Разбить на участки
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                      {!isSplitting &&
                        segmentsShown &&
                        !pathsShown &&
                        segmentsPreview && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                          >
                            <motion.img
                              whileHover={{ scale: 1.02 }}
                              src={segmentsPreview}
                              alt="Segments preview"
                              className="w-full h-64 object-contain bg-white cursor-pointer"
                              onClick={() => openModal(segmentsPreview)}
                              role="button"
                              aria-label="Открыть изображение сегментов"
                            />
                            <div className="p-3 flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                Результат: участки
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    resetSteps();
                                  }}
                                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                                >
                                  Вернуть исходное фото
                                </button>
                                <button
                                  onClick={handleProcessPaths}
                                  className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-sm"
                                  disabled={isProcessingPaths}
                                >
                                  Проложить пути
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                      <AnimatePresence>
                        {isSplitting && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="mt-3"
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-8 h-8 rounded-full border-4 border-dashed border-emerald-400/50 flex items-center justify-center"
                              >
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              </motion.div>
                              <div className="w-full">
                                <div className="text-sm text-gray-600 mb-2">
                                  Идёт разбиение на участки…
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                                    style={{ width: `${splitProgress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isProcessingPaths && pathsShown && pathsPreview && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                        >
                          <motion.img
                            whileHover={{ scale: 1.02 }}
                            src={pathsPreview}
                            alt="Paths preview"
                            className="w-full h-64 object-contain bg-white cursor-pointer"
                            onClick={() => openModal(pathsPreview)}
                            role="button"
                            aria-label="Открыть изображение с проложенными путями"
                          />
                          <div className="p-3 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Результат: проложенные пути
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setPathsShown(false);
                                }}
                                className="px-3 py-1 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                              >
                                Вернуться к участкам
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <AnimatePresence>
                        {isProcessingPaths && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="mt-3"
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-8 h-8 rounded-full border-4 border-dashed border-emerald-400/50 flex items-center justify-center"
                              >
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              </motion.div>
                              <div className="w-full">
                                <div className="text-sm text-gray-600 mb-2">
                                  Идёт прокладка путей…
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                                    style={{ width: `${pathsProgress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка с информацией и метаданными */}
            <div className="space-y-4">
              <div className="p-6 bg-white/90 backdrop-blur-lg rounded-2xl border border-white/20 shadow-md">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-600" /> Информация
                </h3>
                <div className="mt-3 text-sm text-gray-600">
                  Подсказка: сначала загрузите фото поля, затем нажмите «Разбить
                  на участки», после — «Проложить пути».
                </div>
              </div>

              <div className="p-6 bg-white/90 backdrop-blur-lg rounded-2xl border border-white/20 shadow-md">
                <h3 className="font-medium mb-2">Метаданные</h3>
                <div className="text-sm text-gray-500 mb-3">
                  После загрузки фото метаданные автоматически заполняются.
                  Значения появляются исходя из предоставленных фотографий поля.
                </div>

                <div className="space-y-3">
                  {/* индикатор загрузки метаданных */}
                  {metaLoading && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-emerald-300 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-sm text-gray-600">
                        Извлечение метаданных…
                      </div>
                    </div>
                  )}

                  {!metaLoading && metadata ? (
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <div className="text-gray-500">Название</div>
                        <div className="font-medium">
                          <AnimatedText text={metadata.name ?? '-'} />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <div className="text-gray-500">Площадь</div>
                        <div className="font-medium">
                          <AnimatedText text={metadata.area ?? '-'} />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <div className="text-gray-500">Участков</div>
                        <div className="font-medium">
                          <AnimatedText text={metadata.parcels ?? '-'} />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <div className="text-gray-500">Культура</div>
                        <div className="font-medium">
                          <AnimatedText text={metadata.crop ?? '-'} />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <div className="text-gray-500">Примечание</div>
                        <div className="font-medium max-w-[10rem] text-right">
                          <AnimatedText text={metadata.notes ?? '-'} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    !metaLoading && (
                      <div className="text-sm text-gray-400">
                        Метаданные появятся после загрузки фото.
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки — вне грида, внизу контейнера, справа.
              Показываем ТОЛЬКО после завершения последнего шага (pathsShown === true). */}
          <AnimatePresence>
            {pathsShown && (
              <motion.div
                key="actions-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="z-50 flex justify-end gap-3 mt-6"
              >
                <button
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-md flex items-center gap-2"
                  onClick={() => pushToast('Сохранено (заглушка)', 'success')}
                  aria-label="Сохранить заявку"
                >
                  <Save size={16} /> Сохранить заявку
                </button>

                <button
                  onClick={resetAll}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white"
                  aria-label="Сбросить"
                >
                  Сбросить
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Тосты */}
        <div className="fixed top-4 right-4 z-50 flex flex-col-reverse gap-3">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`px-4 py-2 rounded-md shadow-lg text-sm w-64 ${
                  t.tone === 'success' ? 'bg-emerald-50 text-emerald-700' : ''
                }`}
              >
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Модал для просмотра изображения */}
        <AnimatePresence>
          {modalOpen && modalSrc && (
            <motion.div
              key="image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              aria-modal="true"
              role="dialog"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative max-w-[95%] max-h-[95%] rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeModal}
                  className="absolute right-2 top-2 z-40 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                  aria-label="Закрыть просмотр изображения"
                >
                  ✕
                </button>
                <motion.img
                  src={modalSrc}
                  alt="Preview"
                  className="block max-w-full max-h-[85vh] object-contain bg-white cursor-zoom-out"
                  whileHover={{ scale: 1.02 }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
