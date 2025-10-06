import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Drone,
  DroneFormData,
  DroneFilters,
  DroneSortOptions,
  DroneStats,
  BulkDroneOperation,
  DroneImportData,
  DroneAuditLog,
  MaintenanceRecord,
  FlightLog,
  DroneStatus,
} from '@/src/types/drone';

interface DroneState {
  drones: Drone[];
  currentDrone: Drone | null;
  isLoading: boolean;
  error: string | null;
  filters: DroneFilters;
  sortOptions: DroneSortOptions;
  stats: DroneStats | null;
  auditLogs: DroneAuditLog[];
  selectedDrones: string[];
}

interface DroneActions {
  // Drone CRUD operations
  createDrone: (data: DroneFormData) => Promise<void>;
  updateDrone: (id: string, data: Partial<DroneFormData>) => Promise<void>;
  deleteDrone: (id: string) => Promise<void>;
  getDrones: (filters?: DroneFilters) => Promise<void>;
  getDroneById: (id: string) => Promise<void>;

  // Status management
  updateDroneStatus: (id: string, status: DroneStatus) => Promise<void>;
  assignOperator: (droneId: string, operatorId: string) => Promise<void>;
  unassignOperator: (droneId: string) => Promise<void>;

  // Maintenance management
  addMaintenanceRecord: (
    droneId: string,
    record: Omit<MaintenanceRecord, 'id' | 'droneId'>,
  ) => Promise<void>;
  updateMaintenanceRecord: (
    recordId: string,
    data: Partial<MaintenanceRecord>,
  ) => Promise<void>;
  scheduleMaintenanceReminder: (droneId: string, date: string) => Promise<void>;

  // Flight log management
  addFlightLog: (
    droneId: string,
    log: Omit<FlightLog, 'id' | 'droneId'>,
  ) => Promise<void>;
  updateFlightLog: (logId: string, data: Partial<FlightLog>) => Promise<void>;

  // Bulk operations
  bulkOperation: (operation: BulkDroneOperation) => Promise<void>;
  selectDrone: (id: string) => void;
  deselectDrone: (id: string) => void;
  selectAllDrones: () => void;
  clearSelection: () => void;

  // Import/Export
  importDrones: (data: DroneImportData[]) => Promise<void>;
  exportDrones: (droneIds?: string[]) => Promise<void>;

  // Search and filtering
  setFilters: (filters: DroneFilters) => void;
  setSortOptions: (options: DroneSortOptions) => void;
  searchDrones: (query: string) => void;

  // Statistics
  calculateStats: () => void;

  // Audit logging
  getAuditLogs: (droneId?: string) => Promise<DroneAuditLog[]>;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setCurrentDrone: (drone: Drone | null) => void;
}

type DroneStore = DroneState & DroneActions;

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const createAuditLog = (
  droneId: string,
  action: DroneAuditLog['action'],
  performedBy: string,
  description: string,
  changes?: DroneAuditLog['changes'],
): DroneAuditLog => ({
  id: generateId(),
  droneId,
  action,
  performedBy,
  performedAt: new Date().toISOString(),
  changes,
  description,
  ipAddress: '127.0.0.1', // TODO: Get real IP
  userAgent: navigator.userAgent,
});

export const useDroneStore = create<DroneStore>()(
  persist(
    (set, get) => ({
      // State
      drones: [],
      currentDrone: null,
      isLoading: false,
      error: null,
      filters: {},
      sortOptions: {
        field: 'createdAt',
        direction: 'desc',
      },
      stats: null,
      auditLogs: [],
      selectedDrones: [],

      // Actions
      createDrone: async (data: DroneFormData) => {
        set({ isLoading: true, error: null });
        try {
          const newDrone: Drone = {
            id: generateId(),
            serialNumber: data.serialNumber,
            model: data.model,
            manufacturer: data.manufacturer,
            type: data.type,
            status: 'available',
            registrationNumber: data.registrationNumber,
            purchaseDate: data.purchaseDate,
            warrantyExpiry: data.warrantyExpiry,
            totalFlightTime: 0,
            totalFlights: 0,
            specifications: data.specifications,
            cameraCapabilities: data.cameraCapabilities,
            maintenanceRecords: [],
            flightLogs: [],
            images: [], // Convert File[] to string[] URLs after upload
            documents: [], // Convert File[] to string[] URLs after upload
            certifications: data.certifications || [],
            insuranceInfo: data.insuranceInfo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'current-user-id', // TODO: Get from auth store
            tags: data.tags || [],
            notes: data.notes,
          };

          set((state) => ({
            drones: [newDrone, ...state.drones],
            isLoading: false,
          }));

          // Add audit log
          const auditLog = createAuditLog(
            newDrone.id,
            'created',
            'current-user-id',
            `Drone ${newDrone.model} (${newDrone.serialNumber}) created`,
          );

          set((state) => ({
            auditLogs: [auditLog, ...state.auditLogs],
          }));

          get().calculateStats();
          toast.success('Drone successfully added to fleet');
        } catch (error) {
          const errorMessage = 'Error creating drone';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateDrone: async (id: string, data: Partial<DroneFormData>) => {
        set({ isLoading: true, error: null });
        try {
          const { drones } = get();
          const existingDrone = drones.find((d) => d.id === id);
          if (!existingDrone) {
            throw new Error('Drone not found');
          }

          const changes: DroneAuditLog['changes'] = [];
          Object.entries(data).forEach(([key, value]) => {
            const oldValue = (
              existingDrone as unknown as Record<string, unknown>
            )[key];
            if (oldValue !== value) {
              changes.push({
                field: key,
                oldValue,
                newValue: value,
              });
            }
          });

          set((state) => ({
            drones: state.drones.map((drone) =>
              drone.id === id
                ? {
                    ...drone,
                    ...data,
                    images: [], // Handle file conversion
                    documents: [], // Handle file conversion
                    updatedAt: new Date().toISOString(),
                  }
                : drone,
            ),
            isLoading: false,
          }));

          // Add audit log
          if (changes.length > 0) {
            const auditLog = createAuditLog(
              id,
              'updated',
              'current-user-id',
              `Drone ${existingDrone.model} (${existingDrone.serialNumber}) updated`,
              changes,
            );

            set((state) => ({
              auditLogs: [auditLog, ...state.auditLogs],
            }));
          }

          get().calculateStats();
          toast.success('Drone updated successfully');
        } catch (error) {
          const errorMessage = 'Error updating drone';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteDrone: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { drones } = get();
          const drone = drones.find((d) => d.id === id);
          if (!drone) {
            throw new Error('Drone not found');
          }

          set((state) => ({
            drones: state.drones.filter((d) => d.id !== id),
            selectedDrones: state.selectedDrones.filter(
              (droneId) => droneId !== id,
            ),
            isLoading: false,
          }));

          // Add audit log
          const auditLog = createAuditLog(
            id,
            'deleted',
            'current-user-id',
            `Drone ${drone.model} (${drone.serialNumber}) deleted`,
          );

          set((state) => ({
            auditLogs: [auditLog, ...state.auditLogs],
          }));

          get().calculateStats();
          toast.success('Drone removed from fleet');
        } catch (error) {
          const errorMessage = 'Error deleting drone';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getDrones: async (filters?: DroneFilters) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          const { drones } = get();
          let filteredDrones = [...drones];

          if (filters) {
            if (filters.status?.length) {
              filteredDrones = filteredDrones.filter((drone) =>
                filters.status!.includes(drone.status),
              );
            }
            if (filters.type?.length) {
              filteredDrones = filteredDrones.filter((drone) =>
                filters.type!.includes(drone.type),
              );
            }
            if (filters.manufacturer?.length) {
              filteredDrones = filteredDrones.filter((drone) =>
                filters.manufacturer!.includes(drone.manufacturer),
              );
            }
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              filteredDrones = filteredDrones.filter(
                (drone) =>
                  drone.model.toLowerCase().includes(searchLower) ||
                  drone.serialNumber.toLowerCase().includes(searchLower) ||
                  drone.manufacturer.toLowerCase().includes(searchLower),
              );
            }
          }

          set({
            drones: filteredDrones,
            filters: filters || {},
            isLoading: false,
          });
        } catch {
          const errorMessage = 'Error loading drones';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      getDroneById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { drones } = get();
          const drone = drones.find((d) => d.id === id);
          set({
            currentDrone: drone || null,
            isLoading: false,
          });
        } catch {
          const errorMessage = 'Error loading drone';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      updateDroneStatus: async (id: string, status: DroneStatus) => {
        set({ isLoading: true, error: null });
        try {
          const { drones } = get();
          const drone = drones.find((d) => d.id === id);
          if (!drone) {
            throw new Error('Drone not found');
          }

          const oldStatus = drone.status;

          set((state) => ({
            drones: state.drones.map((d) =>
              d.id === id
                ? { ...d, status, updatedAt: new Date().toISOString() }
                : d,
            ),
            isLoading: false,
          }));

          // Add audit log
          const auditLog = createAuditLog(
            id,
            'status-changed',
            'current-user-id',
            `Drone ${drone.model} status changed from ${oldStatus} to ${status}`,
            [{ field: 'status', oldValue: oldStatus, newValue: status }],
          );

          set((state) => ({
            auditLogs: [auditLog, ...state.auditLogs],
          }));

          get().calculateStats();
          toast.success(`Drone status updated to ${status}`);
        } catch (error) {
          const errorMessage = 'Error updating drone status';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      assignOperator: async (droneId: string, operatorId: string) => {
        // TODO: Implement operator assignment
        console.log('Assigning operator', operatorId, 'to drone', droneId);
        toast.success('Operator assigned successfully');
      },

      unassignOperator: async (droneId: string) => {
        // TODO: Implement operator unassignment
        console.log('Unassigning operator from drone', droneId);
        toast.success('Operator unassigned successfully');
      },

      addMaintenanceRecord: async (
        droneId: string,
        record: Omit<MaintenanceRecord, 'id' | 'droneId'>,
      ) => {
        try {
          const newRecord: MaintenanceRecord = {
            ...record,
            id: generateId(),
            droneId,
          };

          set((state) => ({
            drones: state.drones.map((drone) =>
              drone.id === droneId
                ? {
                    ...drone,
                    maintenanceRecords: [
                      newRecord,
                      ...drone.maintenanceRecords,
                    ],
                    lastMaintenanceDate: record.date,
                    nextMaintenanceDate: record.nextMaintenanceDate,
                    updatedAt: new Date().toISOString(),
                  }
                : drone,
            ),
          }));

          toast.success('Maintenance record added');
        } catch (error) {
          toast.error('Error adding maintenance record');
          throw error;
        }
      },

      updateMaintenanceRecord: async (
        recordId: string,
        data: Partial<MaintenanceRecord>,
      ) => {
        // TODO: Implement maintenance record update
        console.log('Updating maintenance record', recordId, 'with data', data);
        toast.success('Maintenance record updated');
      },

      scheduleMaintenanceReminder: async (droneId: string, date: string) => {
        // TODO: Implement maintenance reminder scheduling
        console.log(
          'Scheduling maintenance reminder for drone',
          droneId,
          'on',
          date,
        );
        toast.success('Maintenance reminder scheduled');
      },

      addFlightLog: async (
        droneId: string,
        log: Omit<FlightLog, 'id' | 'droneId'>,
      ) => {
        try {
          const newLog: FlightLog = {
            ...log,
            id: generateId(),
            droneId,
          };

          set((state) => ({
            drones: state.drones.map((drone) =>
              drone.id === droneId
                ? {
                    ...drone,
                    flightLogs: [newLog, ...drone.flightLogs],
                    totalFlightTime: drone.totalFlightTime + log.duration / 60, // Convert minutes to hours
                    totalFlights: drone.totalFlights + 1,
                    updatedAt: new Date().toISOString(),
                  }
                : drone,
            ),
          }));

          get().calculateStats();
          toast.success('Flight log added');
        } catch (error) {
          toast.error('Error adding flight log');
          throw error;
        }
      },

      updateFlightLog: async (logId: string, data: Partial<FlightLog>) => {
        // TODO: Implement flight log update
        console.log('Updating flight log', logId, 'with data', data);
        toast.success('Flight log updated');
      },

      bulkOperation: async (operation: BulkDroneOperation) => {
        set({ isLoading: true, error: null });
        try {
          switch (operation.type) {
            case 'status-change':
              // TODO: Implement bulk status change
              break;
            case 'assign-operator':
              // TODO: Implement bulk operator assignment
              break;
            case 'export':
              await get().exportDrones(operation.droneIds);
              break;
            default:
              throw new Error('Unknown bulk operation type');
          }

          set({ isLoading: false });
          toast.success(
            `Bulk operation completed for ${operation.droneIds.length} drones`,
          );
        } catch (error) {
          const errorMessage = 'Error performing bulk operation';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      selectDrone: (id: string) => {
        set((state) => ({
          selectedDrones: [...state.selectedDrones, id],
        }));
      },

      deselectDrone: (id: string) => {
        set((state) => ({
          selectedDrones: state.selectedDrones.filter(
            (droneId) => droneId !== id,
          ),
        }));
      },

      selectAllDrones: () => {
        const { drones } = get();
        set({ selectedDrones: drones.map((drone) => drone.id) });
      },

      clearSelection: () => {
        set({ selectedDrones: [] });
      },

      importDrones: async (data: DroneImportData[]) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement drone import logic
          set({ isLoading: false });
          toast.success(`${data.length} drones imported successfully`);
        } catch (error) {
          const errorMessage = 'Error importing drones';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      exportDrones: async (droneIds?: string[]) => {
        try {
          const { drones } = get();
          const dronesToExport = droneIds
            ? drones.filter((drone) => droneIds.includes(drone.id))
            : drones;

          // TODO: Implement actual export logic (CSV, Excel, etc.)
          console.log('Exporting drones:', dronesToExport);
          toast.success(
            `${dronesToExport.length} drones exported successfully`,
          );
        } catch (error) {
          toast.error('Error exporting drones');
          throw error;
        }
      },

      setFilters: (filters: DroneFilters) => {
        set({ filters });
        get().getDrones(filters);
      },

      setSortOptions: (options: DroneSortOptions) => {
        set({ sortOptions: options });
        // TODO: Apply sorting to drones list
      },

      searchDrones: (query: string) => {
        get().setFilters({ ...get().filters, search: query });
      },

      calculateStats: () => {
        const { drones } = get();
        const stats: DroneStats = {
          total: drones.length,
          available: drones.filter((d) => d.status === 'available').length,
          inFlight: drones.filter((d) => d.status === 'in-flight').length,
          maintenance: drones.filter((d) => d.status === 'maintenance').length,
          charging: drones.filter((d) => d.status === 'charging').length,
          offline: drones.filter((d) => d.status === 'offline').length,
          reserved: drones.filter((d) => d.status === 'reserved').length,
          totalFlightHours: drones.reduce(
            (sum, drone) => sum + drone.totalFlightTime,
            0,
          ),
          averageFlightTime:
            drones.length > 0
              ? drones.reduce((sum, drone) => sum + drone.totalFlightTime, 0) /
                drones.length
              : 0,
          maintenanceDue: drones.filter((d) => {
            if (!d.nextMaintenanceDate) return false;
            const nextMaintenance = new Date(d.nextMaintenanceDate);
            const now = new Date();
            const daysUntilMaintenance = Math.ceil(
              (nextMaintenance.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            return daysUntilMaintenance <= 7; // Due within 7 days
          }).length,
        };

        set({ stats });
      },

      getAuditLogs: async (droneId?: string) => {
        try {
          const { auditLogs } = get();
          const filteredLogs = droneId
            ? auditLogs.filter((log) => log.droneId === droneId)
            : auditLogs;

          return filteredLogs;
        } catch (error) {
          toast.error('Error loading audit logs');
          throw error;
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      setCurrentDrone: (drone: Drone | null) => set({ currentDrone: drone }),
    }),
    {
      name: 'drone-storage',
      partialize: (state) => ({
        drones: state.drones,
        auditLogs: state.auditLogs,
      }),
    },
  ),
);
