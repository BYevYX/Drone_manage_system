/**
 * Хуки для работы с данными дашборда
 */

import { useState, useEffect, useCallback } from 'react';

import {
  analyticsApi,
  requestsApi,
  fieldsApi,
  dronesApi,
} from '@/src/app/services/api';
import { useApi, useApiMutation } from '@/src/shared/hooks/useApi';

// Типы для статистики дашборда
export interface DashboardStats {
  activeRequests: number;
  processedArea: number;
  totalFields: number;
  appliedFertilizer: number;
  totalRevenue?: string;
  newClients?: number;
  planFactRatio?: string;
  activeEmployees?: number;
}

export interface CropDistribution {
  name: string;
  value: number;
}

export interface ProcessingDynamics {
  date: string;
  area: number;
  fuel: number;
  plan: number;
}

// Хук для получения статистики дашборда
export const useDashboardStats = (role: string) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем статистику в зависимости от роли
      const data = await analyticsApi.getDashboardStats(role);
      setStats(data as DashboardStats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка загрузки статистики',
      );
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// Хук для получения распределения культур
export const useCropsDistribution = () => {
  const [data, setData] = useState<CropDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const crops = await analyticsApi.getCropsDistribution();
      setData(crops);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ошибка загрузки данных о культурах',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Хук для получения динамики обработки
export const useProcessingDynamics = (startDate?: string, endDate?: string) => {
  const [data, setData] = useState<ProcessingDynamics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const analytics = await analyticsApi.getRequestsAnalytics({
        startDate,
        endDate,
      });

      // Преобразуем данные в нужный формат
      setData((analytics.dynamics as ProcessingDynamics[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки динамики');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Хук для работы с заявками
export const useRequests = (filters?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  const { data, loading, error, refetch } = useApi<any[]>('/v1/requests', {
    immediate: true,
    dependencies: [filters],
  });

  const { mutate: createRequest, loading: creating } = useApiMutation();
  const { mutate: updateRequest, loading: updating } = useApiMutation();
  const { mutate: deleteRequest, loading: deleting } = useApiMutation();

  const handleCreate = useCallback(
    async (requestData: any) => {
      try {
        const newRequest = await createRequest(
          '/v1/requests',
          requestData,
          'POST',
        );
        await refetch();
        return newRequest;
      } catch (error) {
        throw error;
      }
    },
    [createRequest, refetch],
  );

  const handleUpdate = useCallback(
    async (id: number, requestData: any) => {
      try {
        const updatedRequest = await updateRequest(
          `/v1/requests/${id}`,
          requestData,
          'PUT',
        );
        await refetch();
        return updatedRequest;
      } catch (error) {
        throw error;
      }
    },
    [updateRequest, refetch],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteRequest(`/v1/requests/${id}`, undefined, 'DELETE');
        await refetch();
      } catch (error) {
        throw error;
      }
    },
    [deleteRequest, refetch],
  );

  const handleStatusUpdate = useCallback(
    async (id: number, status: string) => {
      try {
        const updatedRequest = await updateRequest(
          `/v1/requests/${id}/status`,
          { status },
          'PATCH',
        );
        await refetch();
        return updatedRequest;
      } catch (error) {
        throw error;
      }
    },
    [updateRequest, refetch],
  );

  return {
    requests: data || [],
    loading,
    error,
    refetch,
    createRequest: handleCreate,
    updateRequest: handleUpdate,
    deleteRequest: handleDelete,
    updateStatus: handleStatusUpdate,
    creating,
    updating,
    deleting,
  };
};

// Хук для работы с полями
export const useFields = () => {
  const { data, loading, error, refetch } = useApi<any[]>('/v1/fields');

  const { mutate: createField, loading: creating } = useApiMutation();
  const { mutate: updateField, loading: updating } = useApiMutation();
  const { mutate: deleteField, loading: deleting } = useApiMutation();

  const handleCreate = useCallback(
    async (fieldData: any) => {
      try {
        const newField = await createField('/v1/fields', fieldData, 'POST');
        await refetch();
        return newField;
      } catch (error) {
        throw error;
      }
    },
    [createField, refetch],
  );

  const handleUpdate = useCallback(
    async (id: number, fieldData: any) => {
      try {
        const updatedField = await updateField(
          `/v1/fields/${id}`,
          fieldData,
          'PUT',
        );
        await refetch();
        return updatedField;
      } catch (error) {
        throw error;
      }
    },
    [updateField, refetch],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteField(`/v1/fields/${id}`, undefined, 'DELETE');
        await refetch();
      } catch (error) {
        throw error;
      }
    },
    [deleteField, refetch],
  );

  return {
    fields: data || [],
    loading,
    error,
    refetch,
    createField: handleCreate,
    updateField: handleUpdate,
    deleteField: handleDelete,
    creating,
    updating,
    deleting,
  };
};

// Хук для работы с дронами
export const useDrones = () => {
  const { data, loading, error, refetch } = useApi<any[]>('/v1/drones');

  return {
    drones: data || [],
    loading,
    error,
    refetch,
  };
};

// Хук для получения данных конкретного дрона
export const useDrone = (id: number) => {
  const { data, loading, error, refetch } = useApi<any>(`/v1/drones/${id}`, {
    immediate: !!id,
  });

  return {
    drone: data,
    loading,
    error,
    refetch,
  };
};

// Хук для реального времени (WebSocket или polling)
export const useRealTimeData = (endpoint: string, interval = 30000) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        setError(null);
        // Здесь можно использовать любой API endpoint
        const response = await fetch(endpoint);
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        setLoading(false);
      }
    };

    // Первоначальная загрузка
    fetchData();

    // Настройка polling
    intervalId = setInterval(fetchData, interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [endpoint, interval]);

  return { data, loading, error };
};
