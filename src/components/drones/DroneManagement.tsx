'use client';

import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Battery,
  MapPin,
  Clock,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Zap,
  Wifi,
  WifiOff,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { dronesApi } from '@/src/lib/api/drones';
import type {
  Drone,
  CreateDroneRequest,
  UpdateDroneRequest,
  DroneFilters,
} from '@/src/types/api';

interface DroneManagementProps {
  onDroneSelect?: (drone: Drone) => void;
  selectedDrones?: string[];
  multiSelect?: boolean;
  showActions?: boolean;
}

interface LocalDroneFilters extends DroneFilters {
  search: string;
  batteryLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  maintenanceStatus?: 'DUE' | 'OVERDUE' | 'CURRENT';
}

const DroneManagement: React.FC<DroneManagementProps> = ({
  onDroneSelect,
  selectedDrones = [],
  multiSelect = false,
  showActions = true,
}) => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [filteredDrones, setFilteredDrones] = useState<Drone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);

  const [filters, setFilters] = useState<LocalDroneFilters>({
    search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // Load drones
  useEffect(() => {
    loadDrones();
  }, [pagination.page, pagination.limit]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [drones, filters]);

  const loadDrones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dronesApi.getDrones({
        isActive: true,
      });

      setDrones(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total || response.data.length,
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка загрузки дронов');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...drones];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (drone) =>
          drone.model.toLowerCase().includes(searchLower) ||
          drone.manufacturer.toLowerCase().includes(searchLower) ||
          drone.serialNumber.toLowerCase().includes(searchLower) ||
          drone.registrationNumber?.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((drone) =>
        filters.status!.includes(drone.status),
      );
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((drone) => filters.type!.includes(drone.type));
    }

    // Manufacturer filter
    if (filters.manufacturer && filters.manufacturer.length > 0) {
      filtered = filtered.filter((drone) =>
        filters.manufacturer!.includes(drone.manufacturer),
      );
    }

    // Model filter
    if (filters.model && filters.model.length > 0) {
      filtered = filtered.filter((drone) =>
        filters.model!.includes(drone.model),
      );
    }

    // Assigned operator filter
    if (filters.assignedOperatorId) {
      filtered = filtered.filter(
        (drone) => drone.assignedOperatorId === filters.assignedOperatorId,
      );
    }

    // Battery level filter
    if (filters.batteryLevel) {
      filtered = filtered.filter((drone) => {
        const batteryLevel = drone.batteryLevel || 0;
        switch (filters.batteryLevel) {
          case 'LOW':
            return batteryLevel < 30;
          case 'MEDIUM':
            return batteryLevel >= 30 && batteryLevel < 70;
          case 'HIGH':
            return batteryLevel >= 70;
          default:
            return true;
        }
      });
    }

    // Maintenance status filter
    if (filters.maintenanceStatus) {
      filtered = filtered.filter((drone) => {
        const now = new Date();
        const nextMaintenance = drone.nextMaintenanceDate
          ? new Date(drone.nextMaintenanceDate)
          : null;

        if (!nextMaintenance) return filters.maintenanceStatus === 'CURRENT';

        const daysDiff = Math.ceil(
          (nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        switch (filters.maintenanceStatus) {
          case 'OVERDUE':
            return daysDiff < 0;
          case 'DUE':
            return daysDiff >= 0 && daysDiff <= 7;
          case 'CURRENT':
            return daysDiff > 7;
          default:
            return true;
        }
      });
    }

    // Maintenance due filter
    if (filters.maintenanceDue) {
      filtered = filtered.filter((drone) => {
        const now = new Date();
        const nextMaintenance = drone.nextMaintenanceDate
          ? new Date(drone.nextMaintenanceDate)
          : null;
        return nextMaintenance && nextMaintenance <= now;
      });
    }

    setFilteredDrones(filtered);
  };

  const handleDroneClick = (drone: Drone) => {
    if (onDroneSelect) {
      onDroneSelect(drone);
    }
  };

  const handleCreateDrone = () => {
    setSelectedDrone(null);
    setShowCreateModal(true);
  };

  const handleEditDrone = (drone: Drone) => {
    setSelectedDrone(drone);
    setShowEditModal(true);
  };

  const handleViewDrone = (drone: Drone) => {
    setSelectedDrone(drone);
    setShowDetailsModal(true);
  };

  const handleDeleteDrone = async (drone: Drone) => {
    if (
      !confirm(
        `Вы уверены, что хотите удалить дрон "${drone.manufacturer} ${drone.model}"?`,
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await dronesApi.deleteDrone(drone.id);
      await loadDrones();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка удаления дрона');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDrones = async () => {
    try {
      setIsLoading(true);
      const blob = await dronesApi.exportDrones({
        droneIds: selectedDrones.length > 0 ? selectedDrones : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drones_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка экспорта дронов');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_FLIGHT':
        return <MapPin className="h-4 w-4 text-blue-600" />;
      case 'MAINTENANCE':
        return <Wrench className="h-4 w-4 text-yellow-600" />;
      case 'CHARGING':
        return <Zap className="h-4 w-4 text-orange-600" />;
      case 'OFFLINE':
        return <WifiOff className="h-4 w-4 text-gray-600" />;
      case 'RESERVED':
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-600 bg-green-100';
      case 'IN_FLIGHT':
        return 'text-blue-600 bg-blue-100';
      case 'MAINTENANCE':
        return 'text-yellow-600 bg-yellow-100';
      case 'CHARGING':
        return 'text-orange-600 bg-orange-100';
      case 'OFFLINE':
        return 'text-gray-600 bg-gray-100';
      case 'RESERVED':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Доступен';
      case 'IN_FLIGHT':
        return 'В полёте';
      case 'MAINTENANCE':
        return 'Обслуживание';
      case 'CHARGING':
        return 'Зарядка';
      case 'OFFLINE':
        return 'Офлайн';
      case 'RESERVED':
        return 'Зарезервирован';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIROTOR':
        return '🚁';
      case 'FIXED_WING':
        return '✈️';
      case 'HYBRID':
        return '🛩️';
      case 'HELICOPTER':
        return '🚁';
      default:
        return '🛸';
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level < 20) return 'text-red-600';
    if (level < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatFlightTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}м`;
    }
    return `${hours.toFixed(1)}ч`;
  };

  const getMaintenanceStatus = (drone: Drone) => {
    if (!drone.nextMaintenanceDate) return null;

    const now = new Date();
    const nextMaintenance = new Date(drone.nextMaintenanceDate);
    const daysDiff = Math.ceil(
      (nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff < 0) {
      return { status: 'OVERDUE', text: 'Просрочено', color: 'text-red-600' };
    } else if (daysDiff <= 7) {
      return {
        status: 'DUE',
        text: `Через ${daysDiff} дн.`,
        color: 'text-yellow-600',
      };
    }
    return { status: 'CURRENT', text: 'Актуально', color: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление дронами
          </h2>
          <p className="text-gray-600 mt-1">
            Управляйте флотом дронов и их состоянием
          </p>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleExportDrones}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </button>
            <button
              onClick={handleCreateDrone}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Добавить дрон
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
              placeholder="Поиск дронов..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <select
            value={filters.status?.[0] || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value ? [e.target.value as any] : undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="AVAILABLE">Доступен</option>
            <option value="IN_FLIGHT">В полёте</option>
            <option value="MAINTENANCE">Обслуживание</option>
            <option value="CHARGING">Зарядка</option>
            <option value="OFFLINE">Офлайн</option>
            <option value="RESERVED">Зарезервирован</option>
          </select>

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
            <option value="MULTIROTOR">Мультикоптер</option>
            <option value="FIXED_WING">Самолёт</option>
            <option value="HYBRID">Гибрид</option>
            <option value="HELICOPTER">Вертолёт</option>
          </select>

          {/* Battery Level */}
          <select
            value={filters.batteryLevel || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                batteryLevel: (e.target.value as any) || undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все уровни батареи</option>
            <option value="LOW">Низкий (&lt;30%)</option>
            <option value="MEDIUM">Средний (30-70%)</option>
            <option value="HIGH">Высокий (&gt;70%)</option>
          </select>
        </div>

        {/* Additional Filters */}
        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.maintenanceDue || false}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maintenanceDue: e.target.checked || undefined,
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Требует обслуживания</span>
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
          <span className="ml-2 text-gray-600">Загрузка дронов...</span>
        </div>
      )}

      {/* Drones Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrones.map((drone) => {
            const maintenanceStatus = getMaintenanceStatus(drone);

            return (
              <div
                key={drone.id}
                onClick={() => handleDroneClick(drone)}
                className={`bg-white border rounded-lg p-6 transition-all cursor-pointer hover:shadow-md ${
                  selectedDrones.includes(drone.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(drone.type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {drone.manufacturer} {drone.model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {drone.serialNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(drone.status)}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        drone.status,
                      )}`}
                    >
                      {getStatusText(drone.status)}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatFlightTime(drone.totalFlightTime)}
                    </div>
                    <div className="text-xs text-gray-500">Налёт</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {drone.totalFlights}
                    </div>
                    <div className="text-xs text-gray-500">Полётов</div>
                  </div>
                </div>

                {/* Battery Level */}
                {drone.batteryLevel !== undefined && (
                  <div className="flex items-center gap-2 mb-4">
                    <Battery
                      className={`h-4 w-4 ${getBatteryColor(drone.batteryLevel)}`}
                    />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          drone.batteryLevel < 20
                            ? 'bg-red-500'
                            : drone.batteryLevel < 50
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${drone.batteryLevel}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {drone.batteryLevel}%
                    </span>
                  </div>
                )}

                {/* Location */}
                {drone.currentLocation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {drone.currentLocation.latitude.toFixed(4)},{' '}
                      {drone.currentLocation.longitude.toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Maintenance Status */}
                {maintenanceStatus && (
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    <span className={maintenanceStatus.color}>
                      Обслуживание: {maintenanceStatus.text}
                    </span>
                  </div>
                )}

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDrone(drone);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Просмотр"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDrone(drone);
                        }}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDrone(drone);
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {drone.assignedOperator && (
                        <div
                          className="h-4 w-4 bg-blue-600 rounded-full"
                          title="Назначен оператор"
                        />
                      )}
                      {maintenanceStatus?.status === 'OVERDUE' && (
                        <AlertTriangle
                          className="h-4 w-4 text-red-600"
                          title="Просрочено обслуживание"
                        />
                      )}
                      {drone.status === 'OFFLINE' ? (
                        <WifiOff
                          className="h-4 w-4 text-gray-600"
                          title="Офлайн"
                        />
                      ) : (
                        <Wifi
                          className="h-4 w-4 text-green-600"
                          title="Онлайн"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredDrones.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Дроны не найдены
          </h3>
          <p className="text-gray-600 mb-4">
            {drones.length === 0
              ? 'У вас пока нет дронов. Добавьте первый дрон.'
              : 'Попробуйте изменить фильтры поиска.'}
          </p>
          {showActions && drones.length === 0 && (
            <button
              onClick={handleCreateDrone}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Добавить дрон
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading &&
        filteredDrones.length > 0 &&
        pagination.total > pagination.limit && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Показано {filteredDrones.length} из {pagination.total} дронов
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

export default DroneManagement;
