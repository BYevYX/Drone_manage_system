'use client';

import {
  Plus,
  Search,
  Filter,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Map,
  BarChart3,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { fieldsApi } from '@/src/lib/api/fields';
import type {
  Field,
  CreateFieldRequest,
  UpdateFieldRequest,
  WeatherConditions,
} from '@/src/types/api';

interface FieldManagementProps {
  onFieldSelect?: (field: Field) => void;
  selectedFields?: string[];
  multiSelect?: boolean;
  showActions?: boolean;
}

interface FieldFilters {
  search: string;
  cropType?: string;
  status?: string;
  minArea?: number;
  maxArea?: number;
  hasWeatherData?: boolean;
  hasSoilAnalysis?: boolean;
}

const FieldManagement: React.FC<FieldManagementProps> = ({
  onFieldSelect,
  selectedFields = [],
  multiSelect = false,
  showActions = true,
}) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [weatherData, setWeatherData] = useState<
    Record<string, WeatherConditions>
  >({});

  const [filters, setFilters] = useState<FieldFilters>({
    search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // Load fields
  useEffect(() => {
    loadFields();
  }, [pagination.page, pagination.limit]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [fields, filters]);

  const loadFields = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fieldsApi.getFields({
        isActive: true,
      });

      setFields(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total || response.data.length,
      }));

      // Load weather data for fields
      // Load weather data for fields
      const weatherPromises = response.data.map(async (field) => {
        try {
          const weather = await fieldsApi.getFieldWeather(field.id);
          return { fieldId: field.id, weather };
        } catch {
          return { fieldId: field.id, weather: null };
        }
      });

      const weatherResults = await Promise.all(weatherPromises);
      const weatherMap: Record<string, WeatherConditions> = {};
      weatherResults.forEach(({ fieldId, weather }) => {
        if (weather) {
          weatherMap[fieldId] = weather;
        }
      });
      setWeatherData(weatherMap);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка загрузки полей');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...fields];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (field) =>
          field.name.toLowerCase().includes(searchLower) ||
          field.description?.toLowerCase().includes(searchLower) ||
          field.cropType?.toLowerCase().includes(searchLower) ||
          field.address?.toLowerCase().includes(searchLower),
      );
    }

    // Crop type filter
    if (filters.cropType) {
      filtered = filtered.filter(
        (field) => field.cropType === filters.cropType,
      );
    }

    // Status filter (Field doesn't have status, using isActive instead)
    if (filters.status) {
      const isActive = filters.status === 'ACTIVE';
      filtered = filtered.filter((field) => field.isActive === isActive);
    }

    // Area filters
    if (filters.minArea !== undefined) {
      filtered = filtered.filter((field) => field.area >= filters.minArea!);
    }
    if (filters.maxArea !== undefined) {
      filtered = filtered.filter((field) => field.area <= filters.maxArea!);
    }

    // Weather data filter
    if (filters.hasWeatherData) {
      filtered = filtered.filter((field) => !!weatherData[field.id]);
    }

    // Soil analysis filter (using soilType as proxy)
    if (filters.hasSoilAnalysis) {
      filtered = filtered.filter((field) => !!field.soilType);
    }

    setFilteredFields(filtered);
  };

  const handleFieldClick = (field: Field) => {
    if (onFieldSelect) {
      onFieldSelect(field);
    }
  };

  const handleCreateField = () => {
    setSelectedField(null);
    setShowCreateModal(true);
  };

  const handleEditField = (field: Field) => {
    setSelectedField(field);
    setShowEditModal(true);
  };

  const handleViewField = (field: Field) => {
    setSelectedField(field);
    setShowDetailsModal(true);
  };

  const handleDeleteField = async (field: Field) => {
    if (!confirm(`Вы уверены, что хотите удалить поле "${field.name}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await fieldsApi.deleteField(field.id);
      await loadFields();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка удаления поля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFields = async () => {
    try {
      setIsLoading(true);
      const blob = await fieldsApi.exportFields({
        fieldIds: selectedFields.length > 0 ? selectedFields : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fields_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка экспорта полей');
    } finally {
      setIsLoading(false);
    }
  };

  const getCropTypeIcon = (cropType?: string) => {
    switch (cropType?.toLowerCase()) {
      case 'wheat':
      case 'пшеница':
        return '🌾';
      case 'corn':
      case 'кукуруза':
        return '🌽';
      case 'soybean':
      case 'соя':
        return '🫘';
      case 'sunflower':
      case 'подсолнечник':
        return '🌻';
      case 'potato':
      case 'картофель':
        return '🥔';
      case 'vegetables':
      case 'овощи':
        return '🥬';
      case 'fruits':
      case 'фрукты':
        return '🍎';
      default:
        return '🌱';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-100';
      case 'MAINTENANCE':
        return 'text-yellow-600 bg-yellow-100';
      case 'ARCHIVED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Активное';
      case 'INACTIVE':
        return 'Неактивное';
      case 'MAINTENANCE':
        return 'Обслуживание';
      case 'ARCHIVED':
        return 'Архивное';
      default:
        return status;
    }
  };

  const formatArea = (area: number) => {
    if (area >= 100) {
      return `${(area / 100).toFixed(1)} км²`;
    }
    return `${area} га`;
  };

  const renderWeatherInfo = (field: Field) => {
    const weather = weatherData[field.id];
    if (!weather) return null;

    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Thermometer className="h-3 w-3" />
        <span>{weather.temperature}°C</span>
        <Droplets className="h-3 w-3" />
        <span>{weather.humidity}%</span>
        <Wind className="h-3 w-3" />
        <span>{weather.windSpeed} м/с</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление полями
          </h2>
          <p className="text-gray-600 mt-1">
            Управляйте полями и их характеристиками
          </p>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleExportFields}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </button>
            <button
              onClick={handleCreateField}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Добавить поле
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск полей..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Crop Type */}
          <select
            value={filters.cropType || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                cropType: e.target.value || undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все культуры</option>
            <option value="wheat">Пшеница</option>
            <option value="corn">Кукуруза</option>
            <option value="soybean">Соя</option>
            <option value="sunflower">Подсолнечник</option>
            <option value="potato">Картофель</option>
            <option value="vegetables">Овощи</option>
            <option value="fruits">Фрукты</option>
          </select>

          {/* Status */}
          <select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value || undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="ACTIVE">Активные</option>
            <option value="INACTIVE">Неактивные</option>
            <option value="MAINTENANCE">Обслуживание</option>
            <option value="ARCHIVED">Архивные</option>
          </select>

          {/* Area Range */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Мин. площадь"
              value={filters.minArea || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  minArea: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Макс. площадь"
              value={filters.maxArea || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxArea: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.hasWeatherData || false}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  hasWeatherData: e.target.checked || undefined,
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">С данными о погоде</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.hasSoilAnalysis || false}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  hasSoilAnalysis: e.target.checked || undefined,
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">С анализом почвы</span>
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Загрузка полей...</span>
        </div>
      )}

      {/* Fields Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <div
              key={field.id}
              onClick={() => handleFieldClick(field)}
              className={`bg-white border rounded-lg p-6 transition-all cursor-pointer hover:shadow-md ${
                selectedFields.includes(field.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getCropTypeIcon(field.cropType)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {field.name}
                    </h3>
                    <p className="text-sm text-gray-600">{field.cropType}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    field.isActive ? 'ACTIVE' : 'INACTIVE',
                  )}`}
                >
                  {getStatusText(field.isActive ? 'ACTIVE' : 'INACTIVE')}
                </span>
              </div>

              {/* Description */}
              {field.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {field.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatArea(field.area)}
                  </div>
                  <div className="text-xs text-gray-500">Площадь</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {field.coordinates.length}
                  </div>
                  <div className="text-xs text-gray-500">Точек границы</div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {field.address ||
                    `${field.center.latitude.toFixed(4)}, ${field.center.longitude.toFixed(4)}`}
                </span>
              </div>

              {/* Weather Info */}
              {renderWeatherInfo(field)}

              {/* Actions */}
              {showActions && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewField(field);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditField(field);
                      }}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteField(field);
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {field.soilType && (
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    )}
                    {weatherData[field.id] && (
                      <Cloud className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredFields.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Поля не найдены
          </h3>
          <p className="text-gray-600 mb-4">
            {fields.length === 0
              ? 'У вас пока нет полей. Создайте первое поле.'
              : 'Попробуйте изменить фильтры поиска.'}
          </p>
          {showActions && fields.length === 0 && (
            <button
              onClick={handleCreateField}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Создать поле
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading &&
        filteredFields.length > 0 &&
        pagination.total > pagination.limit && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Показано {filteredFields.length} из {pagination.total} полей
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Назад
              </button>
              <span className="px-3 py-2 text-gray-600">
                Страница {pagination.page} из{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(
                      Math.ceil(pagination.total / pagination.limit),
                      prev.page + 1,
                    ),
                  }))
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.limit)
                }
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Далее
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default FieldManagement;
