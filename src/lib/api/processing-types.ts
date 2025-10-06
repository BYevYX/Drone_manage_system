import { apiRequest, paginatedRequest } from './client';
import type {
  ProcessingType,
  PaginatedResponse,
  PaginationParams,
} from '@/src/types/api';

export const processingTypesApi = {
  /**
   * Get all processing types with optional filtering and pagination
   */
  getProcessingTypes: async (
    filters?: { category?: string; isActive?: boolean; search?: string },
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<ProcessingType>> => {
    const params = { ...filters, ...pagination };
    return paginatedRequest<ProcessingType>('/api/processing-types', params);
  },

  /**
   * Get a specific processing type by ID
   */
  getProcessingTypeById: async (typeId: string): Promise<ProcessingType> => {
    return apiRequest<ProcessingType>('GET', `/api/processing-types/${typeId}`);
  },

  /**
   * Create a new processing type
   */
  createProcessingType: async (
    typeData: Omit<ProcessingType, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProcessingType> => {
    return apiRequest<ProcessingType>(
      'POST',
      '/api/processing-types',
      typeData,
    );
  },

  /**
   * Update an existing processing type
   */
  updateProcessingType: async (
    typeId: string,
    typeData: Partial<ProcessingType>,
  ): Promise<ProcessingType> => {
    return apiRequest<ProcessingType>(
      'PUT',
      `/api/processing-types/${typeId}`,
      typeData,
    );
  },

  /**
   * Delete a processing type
   */
  deleteProcessingType: async (typeId: string): Promise<void> => {
    return apiRequest<void>('DELETE', `/api/processing-types/${typeId}`);
  },

  /**
   * Get processing type statistics
   */
  getProcessingTypeStats: async (): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byComplexity: Record<string, number>;
    averagePrice: number;
    averageDuration: number;
    mostPopular: ProcessingType[];
  }> => {
    return apiRequest('GET', '/api/processing-types/stats');
  },

  /**
   * Get recommended processing types for specific conditions
   */
  getRecommendedProcessingTypes: async (
    fieldId: string,
    cropType: string,
    season: string,
    problemDescription?: string,
  ): Promise<
    Array<{
      processingType: ProcessingType;
      suitabilityScore: number;
      reasons: string[];
      estimatedCost: number;
      estimatedDuration: number;
      requiredEquipment: string[];
    }>
  > => {
    return apiRequest('POST', '/api/processing-types/recommendations', {
      fieldId,
      cropType,
      season,
      problemDescription,
    });
  },
};

export default processingTypesApi;
