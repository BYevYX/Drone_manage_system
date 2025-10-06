'use client';

import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Beaker,
  Leaf,
  Shield,
  Droplets,
  Clock,
  DollarSign,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { materialsApi } from '@/src/lib/api/materials';
import type {
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialFilters,
} from '@/src/types/api';

interface MaterialManagementProps {
  onMaterialSelect?: (material: Material) => void;
  selectedMaterials?: string[];
  multiSelect?: boolean;
  showActions?: boolean;
}

interface LocalMaterialFilters extends MaterialFilters {
  search: string;
  priceRange?: 'LOW' | 'MEDIUM' | 'HIGH';
  shelfLife?: 'EXPIRING' | 'FRESH' | 'EXPIRED';
}

const MaterialManagement: React.FC<MaterialManagementProps> = ({
  onMaterialSelect,
  selectedMaterials = [],
  multiSelect = false,
  showActions = true,
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );

  const [filters, setFilters] = useState<LocalMaterialFilters>({
    search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // Load materials
  useEffect(() => {
    loadMaterials();
  }, [pagination.page, pagination.limit]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [materials, filters]);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await materialsApi.getMaterials({
        isActive: true,
      });

      setMaterials(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total || response.data.length,
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка загрузки материалов');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...materials];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (material) =>
          material.name.toLowerCase().includes(searchLower) ||
          material.manufacturer.toLowerCase().includes(searchLower) ||
          material.type.toLowerCase().includes(searchLower) ||
          material.targetCrops.some((crop) =>
            crop.toLowerCase().includes(searchLower),
          ) ||
          material.activeIngredients.some((ingredient) =>
            ingredient.name.toLowerCase().includes(searchLower),
          ),
      );
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((material) =>
        filters.type!.includes(material.type),
      );
    }

    // Manufacturer filter
    if (filters.manufacturer && filters.manufacturer.length > 0) {
      filtered = filtered.filter((material) =>
        filters.manufacturer!.includes(material.manufacturer),
      );
    }

    // Target crops filter
    if (filters.targetCrops && filters.targetCrops.length > 0) {
      filtered = filtered.filter((material) =>
        material.targetCrops.some((crop) =>
          filters.targetCrops!.includes(crop),
        ),
      );
    }

    // Availability filter
    if (filters.availability && filters.availability.length > 0) {
      filtered = filtered.filter((material) =>
        filters.availability!.includes(material.availability),
      );
    }

    // Supplier filter
    if (filters.supplierId) {
      filtered = filtered.filter(
        (material) => material.supplierId === filters.supplierId,
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter((material) => {
        const price = material.pricing.basePrice;
        switch (filters.priceRange) {
          case 'LOW':
            return price < 1000;
          case 'MEDIUM':
            return price >= 1000 && price < 5000;
          case 'HIGH':
            return price >= 5000;
          default:
            return true;
        }
      });
    }

    setFilteredMaterials(filtered);
  };

  const handleMaterialClick = (material: Material) => {
    if (onMaterialSelect) {
      onMaterialSelect(material);
    }
  };

  const handleCreateMaterial = () => {
    setSelectedMaterial(null);
    setShowCreateModal(true);
  };

  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setShowEditModal(true);
  };

  const handleViewMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setShowDetailsModal(true);
  };

  const handleDeleteMaterial = async (material: Material) => {
    if (
      !confirm(`Вы уверены, что хотите удалить материал "${material.name}"?`)
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await materialsApi.deleteMaterial(material.id);
      await loadMaterials();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка удаления материала');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMaterials = async () => {
    try {
      setIsLoading(true);
      const blob = await materialsApi.exportMaterials({
        materialIds:
          selectedMaterials.length > 0 ? selectedMaterials : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `materials_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка экспорта материалов');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PESTICIDE':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'FERTILIZER':
        return <Leaf className="h-5 w-5 text-green-600" />;
      case 'HERBICIDE':
        return <Droplets className="h-5 w-5 text-orange-600" />;
      case 'FUNGICIDE':
        return <Beaker className="h-5 w-5 text-purple-600" />;
      case 'GROWTH_REGULATOR':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'SEED':
        return <Package className="h-5 w-5 text-brown-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'PESTICIDE':
        return 'Пестицид';
      case 'FERTILIZER':
        return 'Удобрение';
      case 'HERBICIDE':
        return 'Гербицид';
      case 'FUNGICIDE':
        return 'Фунгицид';
      case 'GROWTH_REGULATOR':
        return 'Регулятор роста';
      case 'SEED':
        return 'Семена';
      case 'OTHER':
        return 'Другое';
      default:
        return type;
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'LIMITED':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'OUT_OF_STOCK':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'DISCONTINUED':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'text-green-600 bg-green-100';
      case 'LIMITED':
        return 'text-yellow-600 bg-yellow-100';
      case 'OUT_OF_STOCK':
        return 'text-red-600 bg-red-100';
      case 'DISCONTINUED':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'Доступно';
      case 'LIMITED':
        return 'Ограничено';
      case 'OUT_OF_STOCK':
        return 'Нет в наличии';
      case 'DISCONTINUED':
        return 'Снято с производства';
      default:
        return availability;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'RUB' ? 'RUB' : 'USD',
    }).format(price);
  };

  const getApplicationRate = (material: Material) => {
    const rate = material.specifications.applicationRate;
    return `${rate.min}-${rate.max} ${rate.unit}${rate.perHectare ? '/га' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление материалами
          </h2>
          <p className="text-gray-600 mt-1">
            Управляйте материалами и инвентарем
          </p>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleExportMaterials}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </button>
            <button
              onClick={handleCreateMaterial}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Добавить материал
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
              placeholder="Поиск материалов..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <select
            value={filters.type?.[0] || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                type: e.target.value ? [e.target.value as any] : undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            <option value="PESTICIDE">Пестициды</option>
            <option value="FERTILIZER">Удобрения</option>
            <option value="HERBICIDE">Гербициды</option>
            <option value="FUNGICIDE">Фунгициды</option>
            <option value="GROWTH_REGULATOR">Регуляторы роста</option>
            <option value="SEED">Семена</option>
            <option value="OTHER">Другое</option>
          </select>

          {/* Availability */}
          <select
            value={filters.availability?.[0] || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                availability: e.target.value
                  ? [e.target.value as any]
                  : undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="AVAILABLE">Доступно</option>
            <option value="LIMITED">Ограничено</option>
            <option value="OUT_OF_STOCK">Нет в наличии</option>
            <option value="DISCONTINUED">Снято с производства</option>
          </select>

          {/* Price Range */}
          <select
            value={filters.priceRange || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                priceRange: (e.target.value as any) || undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все цены</option>
            <option value="LOW">Низкие (&lt;1000)</option>
            <option value="MEDIUM">Средние (1000-5000)</option>
            <option value="HIGH">Высокие (&gt;5000)</option>
          </select>
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
          <span className="ml-2 text-gray-600">Загрузка материалов...</span>
        </div>
      )}

      {/* Materials Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              onClick={() => handleMaterialClick(material)}
              className={`bg-white border rounded-lg p-6 transition-all cursor-pointer hover:shadow-md ${
                selectedMaterials.includes(material.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(material.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {material.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {material.manufacturer}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getAvailabilityIcon(material.availability)}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(
                      material.availability,
                    )}`}
                  >
                    {getAvailabilityText(material.availability)}
                  </span>
                </div>
              </div>

              {/* Type */}
              <div className="mb-4">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {getTypeText(material.type)}
                </span>
              </div>

              {/* Active Ingredients */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Активные вещества:</p>
                <div className="flex flex-wrap gap-1">
                  {material.activeIngredients
                    .slice(0, 2)
                    .map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {ingredient.name} ({ingredient.concentration}%)
                      </span>
                    ))}
                  {material.activeIngredients.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{material.activeIngredients.length - 2} ещё
                    </span>
                  )}
                </div>
              </div>

              {/* Target Crops */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Целевые культуры:</p>
                <div className="flex flex-wrap gap-1">
                  {material.targetCrops.slice(0, 3).map((crop, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                    >
                      {crop}
                    </span>
                  ))}
                  {material.targetCrops.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{material.targetCrops.length - 3} ещё
                    </span>
                  )}
                </div>
              </div>

              {/* Application Rate */}
              <div className="mb-4">
                <p className="text-xs text-gray-500">Норма расхода:</p>
                <p className="text-sm font-medium text-gray-900">
                  {getApplicationRate(material)}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(
                      material.pricing.basePrice,
                      material.pricing.currency,
                    )}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  за {material.pricing.unit}
                </span>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMaterial(material);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMaterial(material);
                      }}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMaterial(material);
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {material.certifications.length > 0 && (
                      <Shield className="h-4 w-4 text-green-600" />
                    )}
                    {material.registrationNumber && (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Материалы не найдены
          </h3>
          <p className="text-gray-600 mb-4">
            {materials.length === 0
              ? 'У вас пока нет материалов. Добавьте первый материал.'
              : 'Попробуйте изменить фильтры поиска.'}
          </p>
          {showActions && materials.length === 0 && (
            <button
              onClick={handleCreateMaterial}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Добавить материал
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading &&
        filteredMaterials.length > 0 &&
        pagination.total > pagination.limit && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Показано {filteredMaterials.length} из {pagination.total}{' '}
              материалов
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

export default MaterialManagement;
