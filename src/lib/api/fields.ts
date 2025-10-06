import { apiRequest, paginatedRequest } from './client';
import type {
  Field,
  CreateFieldRequest,
  UpdateFieldRequest,
  FieldFilters,
  PaginatedResponse,
  PaginationParams,
} from '@/src/types/api';

export const fieldsApi = {
  /**
   * Get all fields with optional filtering and pagination
   */
  getFields: async (
    filters?: FieldFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Field>> => {
    const params = { ...filters, ...pagination };
    return paginatedRequest<Field>('/api/fields', params);
  },

  /**
   * Get a specific field by ID
   */
  getFieldById: async (fieldId: string): Promise<Field> => {
    return apiRequest<Field>('GET', `/api/fields/${fieldId}`);
  },

  /**
   * Create a new field
   */
  createField: async (fieldData: CreateFieldRequest): Promise<Field> => {
    return apiRequest<Field>('POST', '/api/fields', fieldData);
  },

  /**
   * Update an existing field
   */
  updateField: async (
    fieldId: string,
    fieldData: UpdateFieldRequest,
  ): Promise<Field> => {
    return apiRequest<Field>('PUT', `/api/fields/${fieldId}`, fieldData);
  },

  /**
   * Delete a field
   */
  deleteField: async (fieldId: string): Promise<void> => {
    return apiRequest<void>('DELETE', `/api/fields/${fieldId}`);
  },

  /**
   * Get field statistics
   */
  getFieldStats: async (
    filters?: FieldFilters,
  ): Promise<{
    total: number;
    totalArea: number;
    averageArea: number;
    byCropType: Record<string, number>;
    bySoilType: Record<string, number>;
    activeFields: number;
  }> => {
    return apiRequest('GET', '/api/fields/stats', { params: filters });
  },

  /**
   * Get fields near a location
   */
  getFieldsNearLocation: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
  ): Promise<Field[]> => {
    return apiRequest<Field[]>('GET', '/api/fields/nearby', {
      params: { latitude, longitude, radius: radiusKm },
    });
  },

  /**
   * Calculate field area from coordinates
   */
  calculateFieldArea: async (
    coordinates: Array<{ latitude: number; longitude: number }>,
  ): Promise<{
    area: number;
    perimeter: number;
    center: { latitude: number; longitude: number };
  }> => {
    return apiRequest('POST', '/api/fields/calculate-area', { coordinates });
  },

  /**
   * Validate field coordinates
   */
  validateFieldCoordinates: async (
    coordinates: Array<{ latitude: number; longitude: number }>,
  ): Promise<{
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  }> => {
    return apiRequest('POST', '/api/fields/validate-coordinates', {
      coordinates,
    });
  },

  /**
   * Get weather data for a field
   */
  getFieldWeather: async (
    fieldId: string,
  ): Promise<{
    current: any;
    forecast: any[];
    alerts: any[];
  }> => {
    return apiRequest('GET', `/api/fields/${fieldId}/weather`);
  },

  /**
   * Get soil analysis data for a field
   */
  getFieldSoilAnalysis: async (
    fieldId: string,
  ): Promise<{
    ph: number;
    nutrients: Record<string, number>;
    organicMatter: number;
    moisture: number;
    temperature: number;
    lastUpdated: string;
  }> => {
    return apiRequest('GET', `/api/fields/${fieldId}/soil-analysis`);
  },

  /**
   * Export fields to various formats
   */
  exportFields: async (
    filters?: FieldFilters,
    format: 'csv' | 'excel' | 'kml' | 'geojson' = 'csv',
  ): Promise<Blob> => {
    const params = { ...filters, format };
    return apiRequest('GET', '/api/fields/export', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * Import fields from file
   */
  importFields: async (
    file: File,
    format: 'csv' | 'excel' | 'kml' | 'geojson',
  ): Promise<{
    imported: number;
    errors: Array<{ row: number; error: string }>;
    warnings: Array<{ row: number; warning: string }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    return apiRequest('POST', '/api/fields/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Get field history/changes
   */
  getFieldHistory: async (
    fieldId: string,
  ): Promise<
    Array<{
      id: string;
      action: string;
      changes: Record<string, { old: any; new: any }>;
      performedBy: string;
      performedAt: string;
      comment?: string;
    }>
  > => {
    return apiRequest('GET', `/api/fields/${fieldId}/history`);
  },
};

export default fieldsApi;
