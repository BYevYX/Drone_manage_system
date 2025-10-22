'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Download,
  FileText,
  MapPin,
  Save,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';

import { type Order, apiClient } from '../../services/api';

interface ReportingWorkflowProps {
  order: Order;
  onComplete: (report: OrderReport) => void;
  onCancel: () => void;
}

interface OrderReport {
  orderId: string;
  completedAt: string;
  actualArea: number;
  actualCost: number;
  materials: MaterialUsage[];
  photos: ReportPhoto[];
  notes: string;
  issues: ReportIssue[];
  weatherConditions: WeatherConditions;
  droneData: DroneData;
}

interface MaterialUsage {
  materialId: string;
  materialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
}

interface ReportPhoto {
  id: string;
  url: string;
  caption: string;
  coordinates?: [number, number];
  timestamp: string;
}

interface ReportIssue {
  type: 'weather' | 'equipment' | 'field' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: string;
  conditions: string;
}

interface DroneData {
  flightTime: number;
  batteryUsed: number;
  areasCovered: number;
  averageSpeed: number;
  maxAltitude: number;
}

export default function ReportingWorkflow({
  order,
  onComplete,
  onCancel,
}: ReportingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [report, setReport] = useState<Partial<OrderReport>>({
    orderId: order.id,
    completedAt: new Date().toISOString(),
    actualArea: 0,
    actualCost: order.estimatedCost || 0,
    materials: [],
    photos: [],
    notes: '',
    issues: [],
    weatherConditions: {
      temperature: 20,
      humidity: 60,
      windSpeed: 5,
      windDirection: 'С',
      visibility: 'Хорошая',
      conditions: 'Ясно',
    },
    droneData: {
      flightTime: 0,
      batteryUsed: 0,
      areasCovered: 0,
      averageSpeed: 0,
      maxAltitude: 0,
    },
  });

  const [uploading, setUploading] = useState(false);

  const steps = [
    { id: 1, title: 'Основные данные', icon: <FileText className="w-5 h-5" /> },
    { id: 2, title: 'Материалы', icon: <CheckCircle className="w-5 h-5" /> },
    { id: 3, title: 'Фотоотчет', icon: <Camera className="w-5 h-5" /> },
    { id: 4, title: 'Условия работы', icon: <MapPin className="w-5 h-5" /> },
    { id: 5, title: 'Завершение', icon: <Save className="w-5 h-5" /> },
  ];

  const handlePhotoUpload = async (files: FileList) => {
    setUploading(true);
    const newPhotos: ReportPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);

      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url,
        caption: `Фото ${report.photos?.length || 0 + i + 1}`,
        timestamp: new Date().toISOString(),
      });
    }

    setReport((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), ...newPhotos],
    }));

    setUploading(false);
  };

  const addIssue = () => {
    const newIssue: ReportIssue = {
      type: 'other',
      description: '',
      severity: 'low',
      resolved: false,
    };

    setReport((prev) => ({
      ...prev,
      issues: [...(prev.issues || []), newIssue],
    }));
  };

  const updateIssue = (index: number, issue: Partial<ReportIssue>) => {
    setReport((prev) => ({
      ...prev,
      issues:
        prev.issues?.map((item, i) =>
          i === index ? { ...item, ...issue } : item,
        ) || [],
    }));
  };

  const removeIssue = (index: number) => {
    setReport((prev) => ({
      ...prev,
      issues: prev.issues?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleComplete = async () => {
    try {
      // Update order status to completed
      await apiClient.updateOrder(order.id, {
        status: 'completed',
        actualCost: report.actualCost,
        notes: report.notes,
      });

      // In a real implementation, you would save the report to the backend
      onComplete(report as OrderReport);
    } catch (error) {
      alert('Ошибка при завершении заказа: ' + (error as Error).message);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Основные данные выполнения</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фактическая площадь (га)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={report.actualArea || ''}
                  onChange={(e) =>
                    setReport((prev) => ({
                      ...prev,
                      actualArea: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фактическая стоимость (₽)
                </label>
                <input
                  type="number"
                  value={report.actualCost || ''}
                  onChange={(e) =>
                    setReport((prev) => ({
                      ...prev,
                      actualCost: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заметки и комментарии
              </label>
              <textarea
                value={report.notes || ''}
                onChange={(e) =>
                  setReport((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Дополнительная информация о выполнении заказа..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Использованные материалы</h3>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                Укажите фактическое количество использованных материалов
              </p>

              {/* Mock materials data */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="font-medium">Гербицид Раундап</div>
                    <div className="text-sm text-gray-500">
                      Планировалось: 10 л
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Факт"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">л</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="font-medium">Удобрение NPK</div>
                    <div className="text-sm text-gray-500">
                      Планировалось: 50 кг
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Факт"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">кг</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Фотоотчет</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Загрузите фотографии выполненных работ
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG до 10MB каждая
                    </span>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handlePhotoUpload(e.target.files)
                    }
                  />
                </div>
              </div>
            </div>

            {uploading && (
              <div className="text-center py-4">
                <div className="text-sm text-gray-600">
                  Загрузка фотографий...
                </div>
              </div>
            )}

            {report.photos && report.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                      {photo.caption}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">
              Условия работы и данные дрона
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Погодные условия</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Температура (°C)
                    </label>
                    <input
                      type="number"
                      value={report.weatherConditions?.temperature || ''}
                      onChange={(e) =>
                        setReport((prev) => ({
                          ...prev,
                          weatherConditions: {
                            ...prev.weatherConditions!,
                            temperature: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Влажность (%)
                    </label>
                    <input
                      type="number"
                      value={report.weatherConditions?.humidity || ''}
                      onChange={(e) =>
                        setReport((prev) => ({
                          ...prev,
                          weatherConditions: {
                            ...prev.weatherConditions!,
                            humidity: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Скорость ветра (м/с)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={report.weatherConditions?.windSpeed || ''}
                      onChange={(e) =>
                        setReport((prev) => ({
                          ...prev,
                          weatherConditions: {
                            ...prev.weatherConditions!,
                            windSpeed: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Условия
                    </label>
                    <select
                      value={report.weatherConditions?.conditions || ''}
                      onChange={(e) =>
                        setReport((prev) => ({
                          ...prev,
                          weatherConditions: {
                            ...prev.weatherConditions!,
                            conditions: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="Ясно">Ясно</option>
                      <option value="Облачно">Облачно</option>
                      <option value="Дождь">Дождь</option>
                      <option value="Туман">Туман</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Данные дрона</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Время полета (мин)
                    </label>
                    <input
                      type="number"
                      value={report.droneData?.flightTime || ''}
                      onChange={(e) =>
                        setReport((prev) => ({
                          ...prev,
                          droneData: {
                            ...prev.droneData!,
                            flightTime: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Батарея использована (%)
                    </label>
                    <input
                      type="number"
                      value={report.droneData?.batteryUsed || ''}
                      onChange={(e) =>
                        setReport((prev) => ({
                          ...prev,
                          droneData: {
                            ...prev.droneData!,
                            batteryUsed: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Средняя скорость (км/ч)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={report.droneData?.averageSpeed || ''}
                      onChange={(e) =>
                        setReport((prev) => ({
                          ...prev,
                          droneData: {
                            ...prev.droneData!,
                            averageSpeed: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Макс. высота (м)
                    </label>
                    <input
                      type="number"
                      value={report.droneData?.maxAltitude || ''}
                      onChange={(e) =>
                        setReport((prev) => ({
                          ...prev,
                          droneData: {
                            ...prev.droneData!,
                            maxAltitude: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Issues Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Проблемы и замечания
                </h4>
                <button
                  onClick={addIssue}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Добавить проблему
                </button>
              </div>

              {report.issues && report.issues.length > 0 && (
                <div className="space-y-3">
                  {report.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                          value={issue.type}
                          onChange={(e) =>
                            updateIssue(index, {
                              type: e.target.value as ReportIssue['type'],
                            })
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="weather">Погода</option>
                          <option value="equipment">Оборудование</option>
                          <option value="field">Поле</option>
                          <option value="other">Другое</option>
                        </select>

                        <select
                          value={issue.severity}
                          onChange={(e) =>
                            updateIssue(index, {
                              severity: e.target
                                .value as ReportIssue['severity'],
                            })
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="low">Низкая</option>
                          <option value="medium">Средняя</option>
                          <option value="high">Высокая</option>
                        </select>

                        <button
                          onClick={() => removeIssue(index)}
                          className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Удалить
                        </button>
                      </div>

                      <textarea
                        value={issue.description}
                        onChange={(e) =>
                          updateIssue(index, { description: e.target.value })
                        }
                        placeholder="Описание проблемы..."
                        rows={2}
                        className="w-full mt-2 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Завершение заказа</h3>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Готово к завершению</span>
              </div>
              <p className="text-sm text-green-700">
                Все данные заполнены. Нажмите "Завершить заказ" для финализации.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Сводка выполнения
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Площадь:</span>
                  <span className="ml-2 font-medium">
                    {report.actualArea} га
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Стоимость:</span>
                  <span className="ml-2 font-medium">₽{report.actualCost}</span>
                </div>
                <div>
                  <span className="text-gray-600">Фотографий:</span>
                  <span className="ml-2 font-medium">
                    {report.photos?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Проблем:</span>
                  <span className="ml-2 font-medium">
                    {report.issues?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {step.icon}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`ml-6 w-16 h-0.5 ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        {renderStep()}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Назад
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Отменить
          </button>
        </div>

        <div className="flex gap-2">
          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Далее
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Завершить заказ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
