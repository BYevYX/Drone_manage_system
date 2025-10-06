'use client';

import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  DollarSign,
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { processingTypesApi } from '@/src/lib/api/processing-types';
import type { ProcessingType } from '@/src/types/api';

interface ServiceCatalogProps {
  onServiceSelect?: (service: ProcessingType) => void;
  selectedServices?: string[];
  multiSelect?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  layout?: 'grid' | 'list';
}

interface ServiceFilters {
  category?: string;
  complexity?: string;
  priceRange?: [number, number];
  duration?: string;
  search?: string;
}

const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  onServiceSelect,
  selectedServices = [],
  multiSelect = false,
  showFilters = true,
  showSearch = true,
  layout: initialLayout = 'grid',
}) => {
  const [services, setServices] = useState<ProcessingType[]>([]);
  const [filteredServices, setFilteredServices] = useState<ProcessingType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>(initialLayout);
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        const response = await processingTypesApi.getProcessingTypes();
        setServices(response.data);
        setFilteredServices(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Ошибка загрузки услуг');
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...services];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm) ||
          service.description.toLowerCase().includes(searchTerm),
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(
        (service) => service.category === filters.category,
      );
    }

    // Complexity filter
    if (filters.complexity && filters.complexity !== 'all') {
      filtered = filtered.filter(
        (service) => service.complexity === filters.complexity,
      );
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(
        (service) => service.basePrice >= min && service.basePrice <= max,
      );
    }

    // Duration filter
    if (filters.duration && filters.duration !== 'all') {
      const maxDuration = parseInt(filters.duration);
      filtered = filtered.filter(
        (service) => service.estimatedDuration <= maxDuration,
      );
    }

    setFilteredServices(filtered);
  }, [services, filters]);

  const handleServiceClick = (service: ProcessingType) => {
    if (onServiceSelect) {
      onServiceSelect(service);
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.includes(serviceId);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      SPRAYING: '🚁',
      MONITORING: '📊',
      MAPPING: '🗺️',
      SEEDING: '🌱',
      FERTILIZING: '🌿',
      ANALYSIS: '🔬',
      OTHER: '⚙️',
    };
    return icons[category] || '⚙️';
  };

  const getComplexityColor = (complexity: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-green-600 bg-green-100',
      MEDIUM: 'text-yellow-600 bg-yellow-100',
      HIGH: 'text-red-600 bg-red-100',
    };
    return colors[complexity] || 'text-gray-600 bg-gray-100';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'RUB',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}ч ${remainingMinutes}м`
      : `${hours}ч`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка услуг...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Каталог услуг</h2>
          <p className="text-gray-600">
            Найдено услуг: {filteredServices.length} из {services.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded ${
                layout === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded ${
                layout === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filters Toggle */}
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                showFiltersPanel
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Фильтры
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Поиск услуг..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={filters.category || 'all'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category:
                      e.target.value === 'all' ? undefined : e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все категории</option>
                <option value="SPRAYING">Опрыскивание</option>
                <option value="MONITORING">Мониторинг</option>
                <option value="MAPPING">Картографирование</option>
                <option value="SEEDING">Посев</option>
                <option value="FERTILIZING">Удобрение</option>
                <option value="ANALYSIS">Анализ</option>
                <option value="OTHER">Другое</option>
              </select>
            </div>

            {/* Complexity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сложность
              </label>
              <select
                value={filters.complexity || 'all'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    complexity:
                      e.target.value === 'all' ? undefined : e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Любая</option>
                <option value="LOW">Низкая</option>
                <option value="MEDIUM">Средняя</option>
                <option value="HIGH">Высокая</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Длительность
              </label>
              <select
                value={filters.duration || 'all'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    duration:
                      e.target.value === 'all' ? undefined : e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Любая</option>
                <option value="30">До 30 мин</option>
                <option value="60">До 1 часа</option>
                <option value="120">До 2 часов</option>
                <option value="480">До 8 часов</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid/List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">🔍 Услуги не найдены</div>
          <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className={`
                ${layout === 'grid' ? 'flex flex-col' : 'flex flex-row'}
                bg-white rounded-lg border border-gray-200 hover:border-blue-300 
                hover:shadow-lg transition-all duration-200 cursor-pointer
                ${isServiceSelected(service.id) ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                ${onServiceSelect ? 'hover:scale-[1.02]' : ''}
              `}
            >
              {/* Service Content */}
              <div className={`p-6 ${layout === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getCategoryIcon(service.category)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {service.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(
                          service.complexity,
                        )}`}
                      >
                        {service.complexity === 'LOW' && 'Простая'}
                        {service.complexity === 'MEDIUM' && 'Средняя'}
                        {service.complexity === 'HIGH' && 'Сложная'}
                      </span>
                    </div>
                  </div>
                  {isServiceSelected(service.id) && (
                    <div className="text-blue-600">
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(service.estimatedDuration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatPrice(service.basePrice, service.currency)}
                    </div>
                  </div>
                </div>

                {/* Required Equipment */}
                {service.requiredEquipment.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">
                      Требуемое оборудование:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {service.requiredEquipment
                        .slice(0, 3)
                        .map((equipment, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {equipment}
                          </span>
                        ))}
                      {service.requiredEquipment.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{service.requiredEquipment.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceCatalog;
