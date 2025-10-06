import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { fieldsApi } from '@/src/lib/api/fields';
import type {
  Field,
  CreateFieldRequest,
  UpdateFieldRequest,
  FieldFilters,
} from '@/src/types/api';

interface FieldsState {
  // State
  fields: Field[];
  selectedFields: string[];
  currentField: Field | null;
  isLoading: boolean;
  error: string | null;
  filters: FieldFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // Actions
  setFields: (fields: Field[]) => void;
  setSelectedFields: (fieldIds: string[]) => void;
  setCurrentField: (field: Field | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<FieldFilters>) => void;
  setPagination: (pagination: Partial<FieldsState['pagination']>) => void;

  // API Actions
  loadFields: (filters?: FieldFilters) => Promise<void>;
  createField: (data: CreateFieldRequest) => Promise<Field>;
  updateField: (id: string, data: UpdateFieldRequest) => Promise<Field>;
  deleteField: (id: string) => Promise<void>;
  getField: (id: string) => Promise<Field>;
  exportFields: (fieldIds?: string[]) => Promise<Blob>;
  importFields: (file: File) => Promise<void>;
  getFieldWeather: (id: string) => Promise<any>;
  getFieldSoilAnalysis: (id: string) => Promise<any>;
  calculateFieldArea: (
    coordinates: Array<{ latitude: number; longitude: number }>,
  ) => Promise<number>;

  // Utility Actions
  selectField: (fieldId: string) => void;
  deselectField: (fieldId: string) => void;
  selectAllFields: () => void;
  deselectAllFields: () => void;
  toggleFieldSelection: (fieldId: string) => void;
  clearError: () => void;
  resetFilters: () => void;
}

const initialFilters: FieldFilters = {
  isActive: true,
};

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
};

export const useFieldsStore = create<FieldsState>()(
  persist(
    (set, get) => ({
      // Initial state
      fields: [],
      selectedFields: [],
      currentField: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      pagination: initialPagination,

      // Basic setters
      setFields: (fields) => set({ fields }),
      setSelectedFields: (fieldIds) => set({ selectedFields: fieldIds }),
      setCurrentField: (field) => set({ currentField: field }),
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
      loadFields: async (filters) => {
        try {
          set({ isLoading: true, error: null });
          const currentFilters = filters || get().filters;
          const response = await fieldsApi.getFields(currentFilters);

          set({
            fields: response.data,
            pagination: {
              ...get().pagination,
              total: response.total || response.data.length,
            },
          });
        } catch (error: any) {
          set({
            error: error?.response?.data?.message || 'Ошибка загрузки полей',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      createField: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const field = await fieldsApi.createField(data);

          set((state) => ({
            fields: [...state.fields, field],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
          }));

          return field;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка создания поля';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      updateField: async (id, data) => {
        try {
          set({ isLoading: true, error: null });
          const field = await fieldsApi.updateField(id, data);

          set((state) => ({
            fields: state.fields.map((f) => (f.id === id ? field : f)),
            currentField:
              state.currentField?.id === id ? field : state.currentField,
          }));

          return field;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка обновления поля';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      deleteField: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await fieldsApi.deleteField(id);

          set((state) => ({
            fields: state.fields.filter((f) => f.id !== id),
            selectedFields: state.selectedFields.filter((fId) => fId !== id),
            currentField:
              state.currentField?.id === id ? null : state.currentField,
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
            },
          }));
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка удаления поля';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      getField: async (id) => {
        try {
          set({ isLoading: true, error: null });
          const field = await fieldsApi.getField(id);
          set({ currentField: field });
          return field;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка загрузки поля';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      exportFields: async (fieldIds) => {
        try {
          set({ isLoading: true, error: null });
          const blob = await fieldsApi.exportFields({ fieldIds });
          return blob;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка экспорта полей';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      importFields: async (file) => {
        try {
          set({ isLoading: true, error: null });
          await fieldsApi.importFields(file);
          // Reload fields after import
          await get().loadFields();
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка импорта полей';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      getFieldWeather: async (id) => {
        try {
          const weather = await fieldsApi.getFieldWeather(id);
          return weather;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка загрузки погодных данных';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      getFieldSoilAnalysis: async (id) => {
        try {
          const analysis = await fieldsApi.getFieldSoilAnalysis(id);
          return analysis;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка загрузки анализа почвы';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      calculateFieldArea: async (coordinates) => {
        try {
          const area = await fieldsApi.calculateFieldArea(coordinates);
          return area;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Ошибка расчета площади поля';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Utility Actions
      selectField: (fieldId) => {
        set((state) => ({
          selectedFields: state.selectedFields.includes(fieldId)
            ? state.selectedFields
            : [...state.selectedFields, fieldId],
        }));
      },

      deselectField: (fieldId) => {
        set((state) => ({
          selectedFields: state.selectedFields.filter((id) => id !== fieldId),
        }));
      },

      selectAllFields: () => {
        set((state) => ({
          selectedFields: state.fields.map((field) => field.id),
        }));
      },

      deselectAllFields: () => {
        set({ selectedFields: [] });
      },

      toggleFieldSelection: (fieldId) => {
        set((state) => ({
          selectedFields: state.selectedFields.includes(fieldId)
            ? state.selectedFields.filter((id) => id !== fieldId)
            : [...state.selectedFields, fieldId],
        }));
      },

      clearError: () => set({ error: null }),

      resetFilters: () => set({ filters: initialFilters }),
    }),
    {
      name: 'fields-store',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    },
  ),
);

// Selectors
export const useFieldsSelectors = () => {
  const store = useFieldsStore();

  return {
    // Basic selectors
    fields: store.fields,
    selectedFields: store.selectedFields,
    currentField: store.currentField,
    isLoading: store.isLoading,
    error: store.error,
    filters: store.filters,
    pagination: store.pagination,

    // Computed selectors
    selectedFieldsCount: store.selectedFields.length,
    hasSelectedFields: store.selectedFields.length > 0,
    totalFields: store.fields.length,
    hasFields: store.fields.length > 0,

    // Field by ID selector
    getFieldById: (id: string) => store.fields.find((field) => field.id === id),

    // Filtered fields
    getActiveFields: () => store.fields.filter((field) => field.isActive),
    getFieldsByCropType: (cropType: string) =>
      store.fields.filter((field) => field.cropType === cropType),
    getFieldsByArea: (minArea: number, maxArea: number) =>
      store.fields.filter(
        (field) => field.area >= minArea && field.area <= maxArea,
      ),
  };
};

export default useFieldsStore;
