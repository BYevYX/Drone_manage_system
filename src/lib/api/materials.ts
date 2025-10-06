import { apiRequest, paginatedRequest, uploadFile } from './client';
import type {
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialFilters,
  PaginatedResponse,
  PaginationParams,
} from '@/src/types/api';

export const materialsApi = {
  /**
   * Get all materials with optional filtering and pagination
   */
  getMaterials: async (
    filters?: MaterialFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Material>> => {
    const params = { ...filters, ...pagination };
    return paginatedRequest<Material>('/v1/materials', params);
  },

  /**
   * Get a specific material by ID
   */
  getMaterialById: async (materialId: string): Promise<Material> => {
    return apiRequest<Material>('GET', `/v1/materials/${materialId}`);
  },

  /**
   * Create a new material
   */
  createMaterial: async (
    materialData: CreateMaterialRequest,
  ): Promise<Material> => {
    return apiRequest<Material>('POST', '/v1/materials', materialData);
  },

  /**
   * Update an existing material
   */
  updateMaterial: async (
    materialId: string,
    materialData: UpdateMaterialRequest,
  ): Promise<Material> => {
    return apiRequest<Material>(
      'PUT',
      `/v1/materials/${materialId}`,
      materialData,
    );
  },

  /**
   * Delete a material
   */
  deleteMaterial: async (materialId: string): Promise<void> => {
    return apiRequest<void>('DELETE', `/v1/materials/${materialId}`);
  },

  /**
   * Get material statistics
   */
  getMaterialStats: async (
    filters?: MaterialFilters,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    byManufacturer: Record<string, number>;
    byAvailability: Record<string, number>;
    totalValue: number;
    lowStockCount: number;
    expiringCount: number;
  }> => {
    return apiRequest('GET', '/v1/materials/stats', { params: filters });
  },

  /**
   * Search materials by active ingredient
   */
  searchByActiveIngredient: async (
    ingredient: string,
    concentration?: number,
  ): Promise<Material[]> => {
    return apiRequest<Material[]>('GET', '/v1/materials/search/ingredient', {
      params: { ingredient, concentration },
    });
  },

  /**
   * Get materials suitable for specific crops
   */
  getMaterialsForCrops: async (
    crops: string[],
    materialType?: string,
  ): Promise<Material[]> => {
    return apiRequest<Material[]>('GET', '/v1/materials/search/crops', {
      params: { crops: crops.join(','), materialType },
    });
  },

  /**
   * Get materials for specific pests/diseases
   */
  getMaterialsForPests: async (
    pests: string[],
    cropType?: string,
  ): Promise<Material[]> => {
    return apiRequest<Material[]>('GET', '/v1/materials/search/pests', {
      params: { pests: pests.join(','), cropType },
    });
  },

  /**
   * Check material compatibility
   */
  checkCompatibility: async (
    materialIds: string[],
  ): Promise<{
    compatible: boolean;
    warnings: string[];
    incompatiblePairs: Array<{
      material1: string;
      material2: string;
      reason: string;
    }>;
    recommendations: string[];
  }> => {
    return apiRequest('POST', '/v1/materials/compatibility', { materialIds });
  },

  /**
   * Calculate application rate
   */
  calculateApplicationRate: async (
    materialId: string,
    fieldArea: number,
    cropType: string,
    targetPest?: string,
  ): Promise<{
    recommendedRate: number;
    unit: string;
    totalQuantity: number;
    cost: number;
    applicationInstructions: string[];
    safetyPrecautions: string[];
  }> => {
    return apiRequest('POST', `/v1/materials/${materialId}/calculate-rate`, {
      fieldArea,
      cropType,
      targetPest,
    });
  },

  /**
   * Get material safety data sheet
   */
  getMSDS: async (
    materialId: string,
  ): Promise<{
    url: string;
    lastUpdated: string;
    version: string;
  }> => {
    return apiRequest('GET', `/v1/materials/${materialId}/msds`);
  },

  /**
   * Upload material image
   */
  uploadMaterialImage: async (
    materialId: string,
    file: File,
    category: 'product' | 'label' | 'packaging' | 'other' = 'product',
  ): Promise<{ url: string; filename: string }> => {
    return uploadFile(
      `/v1/materials/${materialId}/images?category=${category}`,
      file,
    );
  },

  /**
   * Upload material document
   */
  uploadMaterialDocument: async (
    materialId: string,
    file: File,
    category: 'msds' | 'certificate' | 'manual' | 'other' = 'other',
  ): Promise<{ url: string; filename: string }> => {
    return uploadFile(
      `/v1/materials/${materialId}/documents?category=${category}`,
      file,
    );
  },

  /**
   * Get material price history
   */
  getPriceHistory: async (
    materialId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<
    Array<{
      date: string;
      price: number;
      currency: string;
      supplier: string;
      packageSize: number;
      unit: string;
    }>
  > => {
    return apiRequest('GET', `/v1/materials/${materialId}/price-history`, {
      params: { startDate, endDate },
    });
  },

  /**
   * Get material inventory levels
   */
  getInventoryLevels: async (
    materialId: string,
    locationId?: string,
  ): Promise<{
    currentStock: number;
    unit: string;
    reservedQuantity: number;
    availableQuantity: number;
    reorderLevel: number;
    maxStockLevel: number;
    lastRestocked: string;
    expiryDates: Array<{
      batchId: string;
      quantity: number;
      expiryDate: string;
      daysToExpiry: number;
    }>;
  }> => {
    return apiRequest('GET', `/v1/materials/${materialId}/inventory`, {
      params: { locationId },
    });
  },

  /**
   * Update material inventory
   */
  updateInventory: async (
    materialId: string,
    adjustment: {
      type: 'add' | 'remove' | 'set';
      quantity: number;
      reason: string;
      batchId?: string;
      expiryDate?: string;
      locationId?: string;
    },
  ): Promise<{
    newQuantity: number;
    previousQuantity: number;
    adjustmentId: string;
  }> => {
    return apiRequest(
      'POST',
      `/v1/materials/${materialId}/inventory`,
      adjustment,
    );
  },

  /**
   * Get material usage analytics
   */
  getUsageAnalytics: async (
    materialId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalUsed: number;
    unit: string;
    usageByMonth: Array<{
      month: string;
      quantity: number;
      orders: number;
    }>;
    topCrops: Array<{
      crop: string;
      quantity: number;
      percentage: number;
    }>;
    efficiency: {
      averageApplicationRate: number;
      costPerHectare: number;
      successRate: number;
    };
  }> => {
    return apiRequest('GET', `/v1/materials/${materialId}/analytics`, {
      params: { startDate, endDate },
    });
  },

  /**
   * Export materials data
   */
  exportMaterials: async (
    filters?: MaterialFilters,
    format: 'csv' | 'excel' | 'pdf' = 'csv',
  ): Promise<Blob> => {
    const params = { ...filters, format };
    return apiRequest('GET', '/v1/materials/export', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * Import materials from file
   */
  importMaterials: async (
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

    return apiRequest('POST', '/v1/materials/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Get material recommendations based on field conditions
   */
  getRecommendations: async (
    fieldId: string,
    problemDescription: string,
    cropType: string,
    growthStage?: string,
  ): Promise<
    Array<{
      material: Material;
      suitabilityScore: number;
      reasons: string[];
      applicationRate: number;
      estimatedCost: number;
      alternatives: Material[];
    }>
  > => {
    return apiRequest('POST', '/v1/materials/recommendations', {
      fieldId,
      problemDescription,
      cropType,
      growthStage,
    });
  },

  /**
   * Bulk update materials
   */
  bulkUpdateMaterials: async (
    materialIds: string[],
    updateData: Partial<UpdateMaterialRequest>,
  ): Promise<Material[]> => {
    return apiRequest<Material[]>('PUT', '/v1/materials/bulk', {
      materialIds,
      updateData,
    });
  },
};

export default materialsApi;
