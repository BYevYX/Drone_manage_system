/**
 * Хуки для работы с API
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiOptions {
  immediate?: boolean;
  dependencies?: unknown[];
}

export const useApi = <T>(
  url: string,
  options: UseApiOptions = {},
): UseApiState<T> & { refetch: () => Promise<void> } => {
  const { immediate = true, dependencies = [] } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiClient.get<T>(url);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [url]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData, ...dependencies]);

  return { ...state, refetch };
};

export const useApiMutation = <TData, TVariables = unknown>() => {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (
    url: string,
    variables?: TVariables,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  ) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      let data: TData;
      
      switch (method) {
        case 'POST':
          data = await apiClient.post<TData>(url, variables);
          break;
        case 'PUT':
          data = await apiClient.put<TData>(url, variables);
          break;
        case 'PATCH':
          data = await apiClient.patch<TData>(url, variables);
          break;
        case 'DELETE':
          data = await apiClient.delete<TData>(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState({ data: null, loading: false, error: errorMessage });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
};

export const useApiUpload = <T>() => {
  const [state, setState] = useState<UseApiState<T> & { progress: number }>({
    data: null,
    loading: false,
    error: null,
    progress: 0,
  });

  const upload = useCallback(async (url: string, file: File) => {
    setState({ data: null, loading: true, error: null, progress: 0 });
    
    try {
      const data = await apiClient.uploadFile<T>(
        url,
        file,
        (progress) => {
          setState(prev => ({ ...prev, progress }));
        },
      );
      
      setState({ data, loading: false, error: null, progress: 100 });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setState({ data: null, loading: false, error: errorMessage, progress: 0 });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, progress: 0 });
  }, []);

  return { ...state, upload, reset };
};

// Хук для пагинации
export interface UsePaginationOptions {
  page?: number;
  limit?: number;
  immediate?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const usePagination = <T>(
  baseUrl: string,
  options: UsePaginationOptions = {},
) => {
  const { page: initialPage = 1, limit = 10, immediate = true } = options;
  
  const [page, setPage] = useState(initialPage);
  const [state, setState] = useState<UseApiState<PaginatedResponse<T>>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchPage = useCallback(async (pageNumber: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const url = `${baseUrl}?page=${pageNumber}&limit=${limit}`;
      const data = await apiClient.get<PaginatedResponse<T>>(url);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [baseUrl, limit]);

  const goToPage = useCallback((pageNumber: number) => {
    setPage(pageNumber);
    fetchPage(pageNumber);
  }, [fetchPage]);

  const nextPage = useCallback(() => {
    if (state.data && page < state.data.totalPages) {
      goToPage(page + 1);
    }
  }, [state.data, page, goToPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [page, goToPage]);

  const refresh = useCallback(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  useEffect(() => {
    if (immediate) {
      fetchPage(page);
    }
  }, [immediate, fetchPage, page]);

  return {
    ...state,
    page,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    hasNextPage: state.data ? page < state.data.totalPages : false,
    hasPrevPage: page > 1,
  };
};