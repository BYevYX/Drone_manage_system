import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { dronesApi } from '@/src/lib/api/drones';
import type {
  Drone,
  CreateDroneRequest,
  UpdateDroneRequest,
  DroneFilters,
  MaintenanceRecord,
  FlightLog,
} from '@/src/types/api';

interface DronesState {
  // State
  drones: Drone[];
  selectedDrones: string[];
  currentDrone: Drone | null;
  isLoading: boolean;
  error: string | null;
  filters: DroneFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // Actions
  setDrones: (drones: Drone[]) => void;
  setSelectedDrones: (droneIds: string[]) => void;
  setCurrentDrone: (drone: Drone | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<DroneFilters>) => void;
  setPagination: (pagination: Partial<DronesState['pagination']>) => void;

  // API Actions
  loadDrones: (filters?: DroneFilters) => Promise<void>;
  createDrone: (data: CreateDroneRequest) => Promise<Drone>;
  updateDrone: (id: string, data: UpdateDroneRequest) => Promise<Drone>;
  deleteDrone: (id: string) => Promise<void>;
  getDrone: (id: string) => Promise<Drone>;
  exportDrones: (droneIds?: string[]) => Promise<Blob>;
  importDrones: (file: File) => Promise<void>;

  // Drone operations
  updateDroneStatus: (id: string, status: Drone['status']) => Promise<void>;
  updateDroneLocation: (
    id: string,
    location: { latitude: number; longitude: number },
  ) => Promise<void>;
  updateBatteryLevel: (id: string, level: number) => Promise<void>;
  sendDroneCommand: (
    id: string,
    command: string,
    params?: Record<string, any>,
  ) => Promise<void>;

  // Maintenance operations
  getMaintenanceRecords: (droneId: string) => Promise<MaintenanceRecord[]>;
  createMaintenanceRecord: (
    droneId: string,
    record: Omit<MaintenanceRecord, 'id' | 'droneId'>,
  ) => Promise<MaintenanceRecord>;
  updateMaintenanceRecord: (
    recordId: string,
    data: Partial<MaintenanceRecord>,
  ) => Promise<MaintenanceRecord>;

  // Flight operations
  getFlightLogs: (droneId: string) => Promise<FlightLog[]>;
  createFlightLog: (
    droneId: string,
    log: Omit<FlightLog, 'id' | 'droneId'>,
  ) => Promise<FlightLog>;

  // Utility Actions
  selectDrone: (droneId: string) => void;
  deselectDrone: (droneId: string) => void;
  selectAllDrones: () => void;
  deselectAllDrones: () => void;
  toggleDroneSelection: (droneId: string) => void;
  clearError: () => void;
  resetFilters: () => void;
}

const initialFilters: DroneFilters = {
  isActive: true,
};

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
};

export const useDronesStore = create<DronesState>()(
  persist(
    (set, get) => ({
      // Initial state
      drones: [],
      selectedDrones: [],
      currentDrone: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      pagination: initialPagination,

      // Basic setters
      setDrones: (drones) => set({ drones }),
      setSelectedDrones: (droneIds) => set({ selectedDrones: droneIds }),
      setCurrentDrone: (drone) => set({ currentDrone: drone }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      setPagination: (newPagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination },
        })),

      // API Actions
      loadDrones: async (filters) => {
        try {
          set({ isLoading: true, error: null });
          const currentFilters = filters || get().filters;
          const response = await dronesApi.getDrones(currentFilters);

          set({
            drones: response.data,
            pagination: {
              ...get().pagination,
              total: response.total || response.data.length,
            },
          });
        } catch (error: any) {
          set({
            error: error?.response?.data?.message || 'Ошибка загрузки дронов',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      createDrone: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const drone = await dronesApi.createDrone(data);

          set((state) => ({
            drones: [...state.drones, drone],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
          }));

          return drone;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка создания дрона';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      updateDrone: async (id, data) => {
        try {
          set({ isLoading: true, error: null });
          const drone = await dronesApi.updateDrone(id, data);

          set((state) => ({
            drones: state.drones.map((d) => (d.id === id ? drone : d)),
            currentDrone:
              state.currentDrone?.id === id ? drone : state.currentDrone,
          }));

          return drone;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка обновления дрона';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      deleteDrone: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await dronesApi.deleteDrone(id);

          set((state) => ({
            drones: state.drones.filter((d) => d.id !== id),
            selectedDrones: state.selectedDrones.filter((dId) => dId !== id),
            currentDrone:
              state.currentDrone?.id === id ? null : state.currentDrone,
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
            },
          }));
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка удаления дрона';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      getDrone: async (id) => {
        try {
          set({ isLoading: true, error: null });
          const drone = await dronesApi.getDrone(id);
          set({ currentDrone: drone });
          return drone;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка загрузки дрона';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      exportDrones: async (droneIds) => {
        try {
          set({ isLoading: true, error: null });
          const blob = await dronesApi.exportDrones({ droneIds });
          return blob;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка экспорта дронов';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      importDrones: async (file) => {
        try {
          set({ isLoading: true, error: null });
          await dronesApi.importDrones(file);
          // Reload drones after import
          await get().loadDrones();
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка импорта дронов';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      // Drone operations
      updateDroneStatus: async (id, status) => {
        try {
          await dronesApi.updateDroneStatus(id, status);

          set((state) => ({
            drones: state.drones.map((d) =>
              d.id === id ? { ...d, status } : d,
            ),
            currentDrone:
              state.currentDrone?.id === id
                ? { ...state.currentDrone, status }
                : state.currentDrone,
          }));
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка обновления статуса дрона';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      updateDroneLocation: async (id, location) => {
        try {
          await dronesApi.updateDroneLocation(id, location);

          set((state) => ({
            drones: state.drones.map((d) =>
              d.id === id ? { ...d, currentLocation: location } : d,
            ),
            currentDrone:
              state.currentDrone?.id === id
                ? { ...state.currentDrone, currentLocation: location }
                : state.currentDrone,
          }));
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            'Ошибка обновления местоположения дрона';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      updateBatteryLevel: async (id, level) => {
        try {
          await dronesApi.updateBatteryLevel(id, level);

          set((state) => ({
            drones: state.drones.map((d) =>
              d.id === id ? { ...d, batteryLevel: level } : d,
            ),
            currentDrone:
              state.currentDrone?.id === id
                ? { ...state.currentDrone, batteryLevel: level }
                : state.currentDrone,
          }));
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            'Ошибка обновления уровня батареи';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      sendDroneCommand: async (id, command, params) => {
        try {
          await dronesApi.sendDroneCommand(id, command, params);
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка отправки команды дрону';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Maintenance operations
      getMaintenanceRecords: async (droneId) => {
        try {
          const records = await dronesApi.getMaintenanceRecords(droneId);
          return records;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            'Ошибка загрузки записей обслуживания';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      createMaintenanceRecord: async (droneId, record) => {
        try {
          const newRecord = await dronesApi.createMaintenanceRecord(
            droneId,
            record,
          );
          return newRecord;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            'Ошибка создания записи обслуживания';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      updateMaintenanceRecord: async (recordId, data) => {
        try {
          const updatedRecord = await dronesApi.updateMaintenanceRecord(
            recordId,
            data,
          );
          return updatedRecord;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            'Ошибка обновления записи обслуживания';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Flight operations
      getFlightLogs: async (droneId) => {
        try {
          const logs = await dronesApi.getFlightLogs(droneId);
          return logs;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            'Ошибка загрузки журналов полетов';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      createFlightLog: async (droneId, log) => {
        try {
          const newLog = await dronesApi.createFlightLog(droneId, log);
          return newLog;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка создания журнала полета';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Utility Actions
      selectDrone: (droneId) => {
        set((state) => ({
          selectedDrones: state.selectedDrones.includes(droneId)
            ? state.selectedDrones
            : [...state.selectedDrones, droneId],
        }));
      },

      deselectDrone: (droneId) => {
        set((state) => ({
          selectedDrones: state.selectedDrones.filter((id) => id !== droneId),
        }));
      },

      selectAllDrones: () => {
        set((state) => ({
          selectedDrones: state.drones.map((drone) => drone.id),
        }));
      },

      deselectAllDrones: () => {
        set({ selectedDrones: [] });
      },

      toggleDroneSelection: (droneId) => {
        set((state) => ({
          selectedDrones: state.selectedDrones.includes(droneId)
            ? state.selectedDrones.filter((id) => id !== droneId)
            : [...state.selectedDrones, droneId],
        }));
      },

      clearError: () => set({ error: null }),

      resetFilters: () => set({ filters: initialFilters }),
    }),
    {
      name: 'drones-store',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    },
  ),
);

// Selectors
export const useDronesSelectors = () => {
  const store = useDronesStore();

  return {
    // Basic selectors
    drones: store.drones,
    selectedDrones: store.selectedDrones,
    currentDrone: store.currentDrone,
    isLoading: store.isLoading,
    error: store.error,
    filters: store.filters,
    pagination: store.pagination,

    // Computed selectors
    selectedDronesCount: store.selectedDrones.length,
    hasSelectedDrones: store.selectedDrones.length > 0,
    totalDrones: store.drones.length,
    hasDrones: store.drones.length > 0,

    // Drone by ID selector
    getDroneById: (id: string) => store.drones.find((drone) => drone.id === id),

    // Status-based selectors
    getAvailableDrones: () =>
      store.drones.filter((drone) => drone.status === 'AVAILABLE'),
    getActiveDrones: () => store.drones.filter((drone) => drone.isActive),
    getDronesByStatus: (status: Drone['status']) =>
      store.drones.filter((drone) => drone.status === status),
    getDronesByType: (type: Drone['type']) =>
      store.drones.filter((drone) => drone.type === type),

    // Maintenance-based selectors
    getDronesNeedingMaintenance: () =>
      store.drones.filter((drone) => {
        if (!drone.nextMaintenanceDate) return false;
        const nextMaintenance = new Date(drone.nextMaintenanceDate);
        const now = new Date();
        return nextMaintenance <= now;
      }),

    // Battery-based selectors
    getLowBatteryDrones: () =>
      store.drones.filter((drone) => (drone.batteryLevel || 0) < 20),

    // Operator-based selectors
    getDronesByOperator: (operatorId: string) =>
      store.drones.filter((drone) => drone.assignedOperatorId === operatorId),
  };
};

export default useDronesStore;
