'use client';

import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Settings,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import ServiceCatalog from './ServiceCatalog';
import { dronesApi } from '@/src/lib/api/drones';
import { fieldsApi } from '@/src/lib/api/fields';
import { materialsApi } from '@/src/lib/api/materials';
import { ordersApi } from '@/src/lib/api/orders';
import type {
  ProcessingType,
  Field,
  Drone,
  Material,
  CreateOrderRequest,
  FlightParameters,
} from '@/src/types/api';

interface ServiceSelectionWizardProps {
  onComplete?: (orderData: CreateOrderRequest) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateOrderRequest>;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface WizardData {
  selectedService?: ProcessingType;
  selectedFields: Field[];
  selectedDrones: Drone[];
  selectedMaterials: Material[];
  flightParameters?: FlightParameters;
  scheduledDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description?: string;
  notes?: string;
  materialsProvided: boolean;
}

const ServiceSelectionWizard: React.FC<ServiceSelectionWizardProps> = ({
  onComplete,
  onCancel,
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    selectedFields: [],
    selectedDrones: [],
    selectedMaterials: [],
    priority: 'MEDIUM',
    materialsProvided: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available data
  const [availableFields, setAvailableFields] = useState<Field[]>([]);
  const [availableDrones, setAvailableDrones] = useState<Drone[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);

  const steps: WizardStep[] = [
    {
      id: 'service',
      title: 'Выбор услуги',
      description: 'Выберите тип услуги для выполнения',
      isCompleted: !!wizardData.selectedService,
      isActive: currentStep === 0,
    },
    {
      id: 'fields',
      title: 'Поля',
      description: 'Выберите поля для обработки',
      isCompleted: wizardData.selectedFields.length > 0,
      isActive: currentStep === 1,
    },
    {
      id: 'drones',
      title: 'Дроны',
      description: 'Выберите дроны для выполнения работ',
      isCompleted: wizardData.selectedDrones.length > 0,
      isActive: currentStep === 2,
    },
    {
      id: 'materials',
      title: 'Материалы',
      description: 'Выберите необходимые материалы',
      isCompleted:
        wizardData.materialsProvided || wizardData.selectedMaterials.length > 0,
      isActive: currentStep === 3,
    },
    {
      id: 'parameters',
      title: 'Параметры',
      description: 'Настройте параметры выполнения',
      isCompleted: !!wizardData.scheduledDate,
      isActive: currentStep === 4,
    },
    {
      id: 'review',
      title: 'Проверка',
      description: 'Проверьте данные заказа',
      isCompleted: false,
      isActive: currentStep === 5,
    },
  ];

  // Load available data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [fieldsResponse, dronesResponse, materialsResponse] =
          await Promise.all([
            fieldsApi.getFields({ isActive: true }),
            dronesApi.getDrones({ status: ['AVAILABLE'] }),
            materialsApi.getMaterials({ isActive: true }),
          ]);

        setAvailableFields(fieldsResponse.data);
        setAvailableDrones(dronesResponse.data);
        setAvailableMaterials(materialsResponse.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Ошибка загрузки данных');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize with initial data
  useEffect(() => {
    if (initialData) {
      setWizardData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const canProceedToNext = () => {
    const currentStepData = steps[currentStep];
    return currentStepData.isCompleted;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceedToNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow going back to completed steps
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleServiceSelect = (service: ProcessingType) => {
    setWizardData((prev) => ({
      ...prev,
      selectedService: service,
    }));
  };

  const handleFieldToggle = (field: Field) => {
    setWizardData((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.some((f) => f.id === field.id)
        ? prev.selectedFields.filter((f) => f.id !== field.id)
        : [...prev.selectedFields, field],
    }));
  };

  const handleDroneToggle = (drone: Drone) => {
    setWizardData((prev) => ({
      ...prev,
      selectedDrones: prev.selectedDrones.some((d) => d.id === drone.id)
        ? prev.selectedDrones.filter((d) => d.id !== drone.id)
        : [...prev.selectedDrones, drone],
    }));
  };

  const handleMaterialToggle = (material: Material) => {
    setWizardData((prev) => ({
      ...prev,
      selectedMaterials: prev.selectedMaterials.some(
        (m) => m.id === material.id,
      )
        ? prev.selectedMaterials.filter((m) => m.id !== material.id)
        : [...prev.selectedMaterials, material],
    }));
  };

  const calculateTotalCost = () => {
    let total = 0;

    if (wizardData.selectedService) {
      const fieldArea = wizardData.selectedFields.reduce(
        (sum, field) => sum + field.area,
        0,
      );
      total += wizardData.selectedService.basePrice * fieldArea;
    }

    wizardData.selectedMaterials.forEach((material) => {
      total += material.pricing.basePrice;
    });

    return total;
  };

  const handleComplete = async () => {
    if (!wizardData.selectedService || wizardData.selectedFields.length === 0) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setIsLoading(true);

      const orderData: CreateOrderRequest = {
        typeProcessId: wizardData.selectedService.id,
        dataStart: wizardData.scheduledDate || new Date().toISOString(),
        materialsProvided: wizardData.materialsProvided,
        priority: wizardData.priority,
        description: wizardData.description,
        notes: wizardData.notes,
        fieldIds: wizardData.selectedFields.map((field) => field.id),
        droneRequirements: wizardData.selectedDrones.map((drone) => ({
          droneId: drone.id,
          capabilities: drone.capabilities.cameras.map((cam) => cam.type),
          flightParameters: wizardData.flightParameters || {
            altitude: 50,
            speed: 15,
            overlap: 80,
            sideOverlap: 70,
            resolution: 5,
            flightPattern: 'GRID',
            returnToHome: true,
          },
        })),
        materialRequirements: wizardData.selectedMaterials.map((material) => ({
          materialId: material.id,
          materialType: material.type,
          quantity: 1,
          unit: 'L',
          applicationRate: material.specifications.applicationRate.min,
        })),
      };

      if (onComplete) {
        onComplete(orderData);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка создания заказа');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Service Selection
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Выберите услугу</h3>
            <ServiceCatalog
              onServiceSelect={handleServiceSelect}
              selectedServices={
                wizardData.selectedService
                  ? [wizardData.selectedService.id]
                  : []
              }
              showFilters={true}
              showSearch={true}
            />
          </div>
        );

      case 1: // Field Selection
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Выберите поля для обработки
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableFields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => handleFieldToggle(field)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    wizardData.selectedFields.some((f) => f.id === field.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {field.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {field.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {field.area} га
                        </span>
                        {field.cropType && <span>{field.cropType}</span>}
                      </div>
                    </div>
                    {wizardData.selectedFields.some(
                      (f) => f.id === field.id,
                    ) && <Check className="h-5 w-5 text-blue-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2: // Drone Selection
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Выберите дроны</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableDrones.map((drone) => (
                <div
                  key={drone.id}
                  onClick={() => handleDroneToggle(drone)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    wizardData.selectedDrones.some((d) => d.id === drone.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {drone.manufacturer} {drone.model}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Серийный номер: {drone.serialNumber}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Тип: {drone.type}</span>
                        <span>Статус: {drone.status}</span>
                      </div>
                    </div>
                    {wizardData.selectedDrones.some(
                      (d) => d.id === drone.id,
                    ) && <Check className="h-5 w-5 text-blue-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3: // Material Selection
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Материалы</h3>

            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wizardData.materialsProvided}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      materialsProvided: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Материалы будут предоставлены заказчиком
                </span>
              </label>
            </div>

            {!wizardData.materialsProvided && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableMaterials.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => handleMaterialToggle(material)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      wizardData.selectedMaterials.some(
                        (m) => m.id === material.id,
                      )
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {material.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {material.manufacturer}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{material.type}</span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {material.pricing.basePrice}{' '}
                            {material.pricing.currency}
                          </span>
                        </div>
                      </div>
                      {wizardData.selectedMaterials.some(
                        (m) => m.id === material.id,
                      ) && <Check className="h-5 w-5 text-blue-600" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4: // Parameters
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Параметры выполнения</h3>
            <div className="space-y-6">
              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата выполнения *
                </label>
                <input
                  type="datetime-local"
                  value={wizardData.scheduledDate || ''}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      scheduledDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Приоритет
                </label>
                <select
                  value={wizardData.priority}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      priority: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Низкий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="HIGH">Высокий</option>
                  <option value="URGENT">Срочный</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={wizardData.description || ''}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Дополнительная информация о заказе..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Примечания
                </label>
                <textarea
                  value={wizardData.notes || ''}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Особые требования или пожелания..."
                />
              </div>
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Проверка заказа</h3>
            <div className="space-y-6">
              {/* Service */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Услуга</h4>
                <p className="text-gray-700">
                  {wizardData.selectedService?.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {wizardData.selectedService?.description}
                </p>
              </div>

              {/* Fields */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Поля ({wizardData.selectedFields.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.selectedFields.map((field) => (
                    <div key={field.id} className="flex justify-between">
                      <span>{field.name}</span>
                      <span className="text-gray-600">{field.area} га</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drones */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Дроны ({wizardData.selectedDrones.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.selectedDrones.map((drone) => (
                    <div key={drone.id}>
                      <span>
                        {drone.manufacturer} {drone.model}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Материалы</h4>
                {wizardData.materialsProvided ? (
                  <p className="text-gray-600">Предоставляются заказчиком</p>
                ) : (
                  <div className="space-y-2">
                    {wizardData.selectedMaterials.map((material) => (
                      <div key={material.id} className="flex justify-between">
                        <span>{material.name}</span>
                        <span className="text-gray-600">
                          {material.pricing.basePrice}{' '}
                          {material.pricing.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Cost */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    Общая стоимость:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {calculateTotalCost().toLocaleString('ru-RU')} ₽
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

  if (isLoading && currentStep === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`flex-1 cursor-pointer ${
                index < steps.length - 1 ? 'border-r border-gray-200' : ''
              }`}
            >
              <div className="flex flex-col items-center p-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.isCompleted
                      ? 'bg-green-500 text-white'
                      : step.isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      step.isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Отмена
        </button>

        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Далее
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isLoading || !canProceedToNext()}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Создание...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Создать заказ
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionWizard;
