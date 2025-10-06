import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Material,
  MaterialFormData,
  MaterialFilters,
  MaterialSortOptions,
  InventoryStats,
  BulkMaterialOperation,
  MaterialImportData,
  InventoryAuditLog,
  StockMovement,
  ReorderSuggestion,
  StockAlert,
  Supplier,
  MaterialStatus,
} from '@/src/types/inventory';

interface InventoryState {
  materials: Material[];
  currentMaterial: Material | null;
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  filters: MaterialFilters;
  sortOptions: MaterialSortOptions;
  stats: InventoryStats | null;
  auditLogs: InventoryAuditLog[];
  selectedMaterials: string[];
  reorderSuggestions: ReorderSuggestion[];
  stockAlerts: StockAlert[];
}

interface InventoryActions {
  // Material CRUD operations
  createMaterial: (data: MaterialFormData) => Promise<void>;
  updateMaterial: (
    id: string,
    data: Partial<MaterialFormData>,
  ) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  getMaterials: (filters?: MaterialFilters) => Promise<void>;
  getMaterialById: (id: string) => Promise<void>;

  // Stock management
  addStockMovement: (
    materialId: string,
    movement: Omit<StockMovement, 'id' | 'materialId'>,
  ) => Promise<void>;
  adjustStock: (
    materialId: string,
    quantity: number,
    reason: string,
  ) => Promise<void>;
  updateMaterialStatus: (id: string, status: MaterialStatus) => Promise<void>;

  // Supplier management
  createSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSuppliers: () => Promise<void>;

  // Reorder management
  generateReorderSuggestions: () => Promise<void>;
  processReorderSuggestion: (suggestionId: string) => Promise<void>;
  dismissReorderSuggestion: (suggestionId: string) => Promise<void>;

  // Alert management
  getStockAlerts: () => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;

  // Bulk operations
  bulkOperation: (operation: BulkMaterialOperation) => Promise<void>;
  selectMaterial: (id: string) => void;
  deselectMaterial: (id: string) => void;
  selectAllMaterials: () => void;
  clearSelection: () => void;

  // Import/Export
  importMaterials: (data: MaterialImportData[]) => Promise<void>;
  exportMaterials: (materialIds?: string[]) => Promise<void>;

  // Search and filtering
  setFilters: (filters: MaterialFilters) => void;
  setSortOptions: (options: MaterialSortOptions) => void;
  searchMaterials: (query: string) => void;

  // Statistics
  calculateStats: () => void;

  // Audit logging
  getAuditLogs: (materialId?: string) => Promise<InventoryAuditLog[]>;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setCurrentMaterial: (material: Material | null) => void;
}

type InventoryStore = InventoryState & InventoryActions;

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      // State
      materials: [],
      currentMaterial: null,
      suppliers: [],
      isLoading: false,
      error: null,
      filters: {},
      sortOptions: {
        field: 'createdAt',
        direction: 'desc',
      },
      stats: null,
      auditLogs: [],
      selectedMaterials: [],
      reorderSuggestions: [],
      stockAlerts: [],

      // Actions - Simplified implementations
      createMaterial: async (data: MaterialFormData) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement full material creation logic
          console.log('Creating material with data:', data);
          set({ isLoading: false });
          toast.success('Material created successfully');
        } catch (error) {
          const errorMessage = 'Error creating material';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateMaterial: async (id: string, data: Partial<MaterialFormData>) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement material update logic
          console.log('Updating material', id, 'with data', data);
          set({ isLoading: false });
          toast.success('Material updated successfully');
        } catch (error) {
          const errorMessage = 'Error updating material';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteMaterial: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            materials: state.materials.filter((m) => m.id !== id),
            selectedMaterials: state.selectedMaterials.filter(
              (materialId) => materialId !== id,
            ),
            isLoading: false,
          }));
          toast.success('Material deleted successfully');
        } catch (error) {
          const errorMessage = 'Error deleting material';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getMaterials: async (filters?: MaterialFilters) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement API call with filtering
          set({ filters: filters || {}, isLoading: false });
        } catch {
          const errorMessage = 'Error loading materials';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      getMaterialById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { materials } = get();
          const material = materials.find((m) => m.id === id);
          set({ currentMaterial: material || null, isLoading: false });
        } catch {
          const errorMessage = 'Error loading material';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      addStockMovement: async (
        materialId: string,
        movement: Omit<StockMovement, 'id' | 'materialId'>,
      ) => {
        try {
          // TODO: Implement stock movement logic
          console.log(
            'Adding stock movement for material',
            materialId,
            movement,
          );
          toast.success('Stock movement recorded');
        } catch (error) {
          toast.error('Error recording stock movement');
          throw error;
        }
      },

      adjustStock: async (
        materialId: string,
        quantity: number,
        reason: string,
      ) => {
        await get().addStockMovement(materialId, {
          type: 'adjustment',
          quantity,
          reason,
          performedBy: 'current-user-id',
          performedAt: new Date().toISOString(),
        });
      },

      updateMaterialStatus: async (id: string, status: MaterialStatus) => {
        try {
          set((state) => ({
            materials: state.materials.map((material) =>
              material.id === id
                ? { ...material, status, updatedAt: new Date().toISOString() }
                : material,
            ),
          }));
          toast.success(`Material status updated to ${status}`);
        } catch (error) {
          toast.error('Error updating material status');
          throw error;
        }
      },

      createSupplier: async (supplier: Omit<Supplier, 'id'>) => {
        try {
          const newSupplier: Supplier = { ...supplier, id: generateId() };
          set((state) => ({
            suppliers: [newSupplier, ...state.suppliers],
          }));
          toast.success('Supplier created successfully');
        } catch (error) {
          toast.error('Error creating supplier');
          throw error;
        }
      },

      updateSupplier: async (id: string, data: Partial<Supplier>) => {
        try {
          set((state) => ({
            suppliers: state.suppliers.map((supplier) =>
              supplier.id === id
                ? { ...supplier, ...data, updatedAt: new Date().toISOString() }
                : supplier,
            ),
          }));
          toast.success('Supplier updated successfully');
        } catch (error) {
          toast.error('Error updating supplier');
          throw error;
        }
      },

      deleteSupplier: async (id: string) => {
        try {
          set((state) => ({
            suppliers: state.suppliers.filter((supplier) => supplier.id !== id),
          }));
          toast.success('Supplier deleted successfully');
        } catch (error) {
          toast.error('Error deleting supplier');
          throw error;
        }
      },

      getSuppliers: async () => {
        // TODO: Implement API call
      },

      generateReorderSuggestions: async () => {
        try {
          // TODO: Implement reorder suggestion logic
          set({ reorderSuggestions: [] });
        } catch (error) {
          toast.error('Error generating reorder suggestions');
          throw error;
        }
      },

      processReorderSuggestion: async (suggestionId: string) => {
        try {
          set((state) => ({
            reorderSuggestions: state.reorderSuggestions.map((suggestion) =>
              suggestion.id === suggestionId
                ? { ...suggestion, isProcessed: true }
                : suggestion,
            ),
          }));
          toast.success('Reorder suggestion processed');
        } catch (error) {
          toast.error('Error processing reorder suggestion');
          throw error;
        }
      },

      dismissReorderSuggestion: async (suggestionId: string) => {
        try {
          set((state) => ({
            reorderSuggestions: state.reorderSuggestions.filter(
              (suggestion) => suggestion.id !== suggestionId,
            ),
          }));
          toast.success('Reorder suggestion dismissed');
        } catch (error) {
          toast.error('Error dismissing reorder suggestion');
          throw error;
        }
      },

      getStockAlerts: async () => {
        try {
          // TODO: Implement stock alerts logic
          set({ stockAlerts: [] });
        } catch (error) {
          toast.error('Error loading stock alerts');
          throw error;
        }
      },

      markAlertAsRead: async (alertId: string) => {
        try {
          set((state) => ({
            stockAlerts: state.stockAlerts.map((alert) =>
              alert.id === alertId ? { ...alert, isRead: true } : alert,
            ),
          }));
        } catch (error) {
          toast.error('Error marking alert as read');
          throw error;
        }
      },

      resolveAlert: async (alertId: string) => {
        try {
          set((state) => ({
            stockAlerts: state.stockAlerts.map((alert) =>
              alert.id === alertId
                ? {
                    ...alert,
                    isResolved: true,
                    resolvedAt: new Date().toISOString(),
                    resolvedBy: 'current-user-id',
                  }
                : alert,
            ),
          }));
          toast.success('Alert resolved');
        } catch (error) {
          toast.error('Error resolving alert');
          throw error;
        }
      },

      bulkOperation: async (operation: BulkMaterialOperation) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement bulk operations
          console.log('Performing bulk operation', operation);
          set({ isLoading: false });
          toast.success(
            `Bulk operation completed for ${operation.materialIds.length} materials`,
          );
        } catch (error) {
          const errorMessage = 'Error performing bulk operation';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      selectMaterial: (id: string) => {
        set((state) => ({
          selectedMaterials: [...state.selectedMaterials, id],
        }));
      },

      deselectMaterial: (id: string) => {
        set((state) => ({
          selectedMaterials: state.selectedMaterials.filter(
            (materialId) => materialId !== id,
          ),
        }));
      },

      selectAllMaterials: () => {
        const { materials } = get();
        set({ selectedMaterials: materials.map((material) => material.id) });
      },

      clearSelection: () => {
        set({ selectedMaterials: [] });
      },

      importMaterials: async (data: MaterialImportData[]) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement import logic
          console.log('Importing materials', data);
          set({ isLoading: false });
          toast.success(`${data.length} materials imported successfully`);
        } catch (error) {
          const errorMessage = 'Error importing materials';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      exportMaterials: async (materialIds?: string[]) => {
        try {
          const { materials } = get();
          const materialsToExport = materialIds
            ? materials.filter((material) => materialIds.includes(material.id))
            : materials;
          console.log('Exporting materials:', materialsToExport);
          toast.success(
            `${materialsToExport.length} materials exported successfully`,
          );
        } catch (error) {
          toast.error('Error exporting materials');
          throw error;
        }
      },

      setFilters: (filters: MaterialFilters) => {
        set({ filters });
        get().getMaterials(filters);
      },

      setSortOptions: (options: MaterialSortOptions) => {
        set({ sortOptions: options });
      },

      searchMaterials: (query: string) => {
        get().setFilters({ ...get().filters, search: query });
      },

      calculateStats: () => {
        const { materials } = get();
        const stats: InventoryStats = {
          totalMaterials: materials.length,
          totalValue: materials.reduce(
            (sum, material) => sum + material.totalValue,
            0,
          ),
          lowStockItems: materials.filter((m) => m.status === 'low-stock')
            .length,
          outOfStockItems: materials.filter((m) => m.status === 'out-of-stock')
            .length,
          expiringItems: 0, // TODO: Calculate expiring items
          expiredItems: materials.filter((m) => m.status === 'expired').length,
          reorderSuggestions: get().reorderSuggestions.filter(
            (s) => !s.isProcessed,
          ).length,
          topCategories: [],
          stockMovementTrend: [],
        };
        set({ stats });
      },

      getAuditLogs: async (materialId?: string) => {
        try {
          const { auditLogs } = get();
          const filteredLogs = materialId
            ? auditLogs.filter((log) => log.materialId === materialId)
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
      setCurrentMaterial: (material: Material | null) =>
        set({ currentMaterial: material }),
    }),
    {
      name: 'inventory-storage',
      partialize: (state) => ({
        materials: state.materials,
        suppliers: state.suppliers,
        auditLogs: state.auditLogs,
      }),
    },
  ),
);
