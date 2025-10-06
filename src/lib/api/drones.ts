import { apiRequest, paginatedRequest, uploadFile } from './client';
import type {
  Drone,
  CreateDroneRequest,
  UpdateDroneRequest,
  DroneFilters,
  MaintenanceRecord,
  FlightLog,
  PaginatedResponse,
  PaginationParams,
} from '@/src/types/api';

export const dronesApi = {
  /**
   * Get all drones with optional filtering and pagination
   */
  getDrones: async (
    filters?: DroneFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Drone>> => {
    const params = { ...filters, ...pagination };
    return paginatedRequest<Drone>('/v1/drones', params);
  },

  /**
   * Get a specific drone by ID
   */
  getDroneById: async (droneId: string): Promise<Drone> => {
    return apiRequest<Drone>('GET', `/v1/drones/${droneId}`);
  },

  /**
   * Create a new drone
   */
  createDrone: async (droneData: CreateDroneRequest): Promise<Drone> => {
    return apiRequest<Drone>('POST', '/v1/drones', droneData);
  },

  /**
   * Update an existing drone
   */
  updateDrone: async (
    droneId: string,
    droneData: UpdateDroneRequest,
  ): Promise<Drone> => {
    return apiRequest<Drone>('PUT', `/v1/drones/${droneId}`, droneData);
  },

  /**
   * Delete a drone
   */
  deleteDrone: async (droneId: string): Promise<void> => {
    return apiRequest<void>('DELETE', `/v1/drones/${droneId}`);
  },

  /**
   * Get drone statistics
   */
  getDroneStats: async (
    filters?: DroneFilters,
  ): Promise<{
    total: number;
    available: number;
    inFlight: number;
    maintenance: number;
    charging: number;
    offline: number;
    reserved: number;
    totalFlightHours: number;
    averageFlightTime: number;
    maintenanceDue: number;
    utilizationRate: number;
  }> => {
    return apiRequest('GET', '/v1/drones/stats', { params: filters });
  },

  /**
   * Get maintenance records for a drone
   */
  getMaintenanceRecords: async (
    droneId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<MaintenanceRecord>> => {
    return paginatedRequest<MaintenanceRecord>(
      `/v1/drones/${droneId}/maintenance`,
      pagination,
    );
  },

  /**
   * Create a maintenance record
   */
  createMaintenanceRecord: async (
    droneId: string,
    maintenanceData: Omit<MaintenanceRecord, 'id' | 'droneId'>,
  ): Promise<MaintenanceRecord> => {
    return apiRequest<MaintenanceRecord>(
      'POST',
      `/v1/drones/${droneId}/maintenance`,
      maintenanceData,
    );
  },

  /**
   * Update a maintenance record
   */
  updateMaintenanceRecord: async (
    droneId: string,
    recordId: string,
    maintenanceData: Partial<MaintenanceRecord>,
  ): Promise<MaintenanceRecord> => {
    return apiRequest<MaintenanceRecord>(
      'PUT',
      `/v1/drones/${droneId}/maintenance/${recordId}`,
      maintenanceData,
    );
  },

  /**
   * Get flight logs for a drone
   */
  getFlightLogs: async (
    droneId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<FlightLog>> => {
    return paginatedRequest<FlightLog>(
      `/v1/drones/${droneId}/flights`,
      pagination,
    );
  },

  /**
   * Create a flight log
   */
  createFlightLog: async (
    droneId: string,
    flightData: Omit<FlightLog, 'id' | 'droneId'>,
  ): Promise<FlightLog> => {
    return apiRequest<FlightLog>(
      'POST',
      `/v1/drones/${droneId}/flights`,
      flightData,
    );
  },

  /**
   * Update a flight log
   */
  updateFlightLog: async (
    droneId: string,
    logId: string,
    flightData: Partial<FlightLog>,
  ): Promise<FlightLog> => {
    return apiRequest<FlightLog>(
      'PUT',
      `/v1/drones/${droneId}/flights/${logId}`,
      flightData,
    );
  },

  /**
   * Get available drones for a specific time period
   */
  getAvailableDrones: async (
    startTime: string,
    endTime: string,
    capabilities?: string[],
  ): Promise<Drone[]> => {
    return apiRequest<Drone[]>('GET', '/v1/drones/available', {
      params: { startTime, endTime, capabilities },
    });
  },

  /**
   * Reserve a drone for a specific time period
   */
  reserveDrone: async (
    droneId: string,
    startTime: string,
    endTime: string,
    purpose: string,
  ): Promise<{ reservationId: string; drone: Drone }> => {
    return apiRequest('POST', `/v1/drones/${droneId}/reserve`, {
      startTime,
      endTime,
      purpose,
    });
  },

  /**
   * Cancel a drone reservation
   */
  cancelReservation: async (
    droneId: string,
    reservationId: string,
  ): Promise<void> => {
    return apiRequest<void>(
      'DELETE',
      `/v1/drones/${droneId}/reservations/${reservationId}`,
    );
  },

  /**
   * Get drone location history
   */
  getDroneLocationHistory: async (
    droneId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<
    Array<{
      timestamp: string;
      latitude: number;
      longitude: number;
      altitude: number;
      speed: number;
      heading: number;
    }>
  > => {
    return apiRequest('GET', `/v1/drones/${droneId}/location-history`, {
      params: { startDate, endDate },
    });
  },

  /**
   * Update drone location
   */
  updateDroneLocation: async (
    droneId: string,
    location: {
      latitude: number;
      longitude: number;
      altitude?: number;
      heading?: number;
    },
  ): Promise<void> => {
    return apiRequest<void>('PUT', `/v1/drones/${droneId}/location`, location);
  },

  /**
   * Get real-time drone status
   */
  getDroneRealTimeStatus: async (
    droneId: string,
  ): Promise<{
    status: string;
    batteryLevel: number;
    location: { latitude: number; longitude: number; altitude: number };
    speed: number;
    heading: number;
    isConnected: boolean;
    lastUpdate: string;
    telemetry: Record<string, any>;
  }> => {
    return apiRequest('GET', `/v1/drones/${droneId}/status`);
  },

  /**
   * Send command to drone
   */
  sendDroneCommand: async (
    droneId: string,
    command: string,
    parameters?: Record<string, any>,
  ): Promise<{
    commandId: string;
    status: 'sent' | 'acknowledged' | 'executed' | 'failed';
    response?: any;
  }> => {
    return apiRequest('POST', `/v1/drones/${droneId}/commands`, {
      command,
      parameters,
    });
  },

  /**
   * Upload drone image
   */
  uploadDroneImage: async (
    droneId: string,
    file: File,
    category: 'profile' | 'maintenance' | 'damage' | 'other' = 'profile',
  ): Promise<{ url: string; filename: string }> => {
    return uploadFile(
      `/v1/drones/${droneId}/images?category=${category}`,
      file,
    );
  },

  /**
   * Upload drone document
   */
  uploadDroneDocument: async (
    droneId: string,
    file: File,
    category: 'manual' | 'certificate' | 'insurance' | 'other' = 'other',
  ): Promise<{ url: string; filename: string }> => {
    return uploadFile(
      `/v1/drones/${droneId}/documents?category=${category}`,
      file,
    );
  },

  /**
   * Export drones data
   */
  exportDrones: async (
    filters?: DroneFilters,
    format: 'csv' | 'excel' | 'pdf' = 'csv',
  ): Promise<Blob> => {
    const params = { ...filters, format };
    return apiRequest('GET', '/v1/drones/export', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * Import drones from file
   */
  importDrones: async (
    file: File,
    format: 'csv' | 'excel',
  ): Promise<{
    imported: number;
    errors: Array<{ row: number; error: string }>;
    warnings: Array<{ row: number; warning: string }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    return apiRequest('POST', '/v1/drones/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Bulk update drones
   */
  bulkUpdateDrones: async (
    droneIds: string[],
    updateData: Partial<UpdateDroneRequest>,
  ): Promise<Drone[]> => {
    return apiRequest<Drone[]>('PUT', '/v1/drones/bulk', {
      droneIds,
      updateData,
    });
  },

  /**
   * Get drone audit log
   */
  getDroneAuditLog: async (
    droneId: string,
    pagination?: PaginationParams,
  ): Promise<
    PaginatedResponse<{
      id: string;
      action: string;
      performedBy: string;
      performedAt: string;
      changes: Record<string, { old: any; new: any }>;
      description: string;
      ipAddress?: string;
    }>
  > => {
    return paginatedRequest(`/v1/drones/${droneId}/audit-log`, pagination);
  },
};

export default dronesApi;
