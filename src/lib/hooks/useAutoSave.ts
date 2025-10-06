'use client';

import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { useOrdersStore } from '@/src/lib/stores/orders';
import type { Order } from '@/src/types/orders';

interface UseAutoSaveOptions {
  /** Interval for auto-saving in milliseconds (default: 30000) */
  interval?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save is successful */
  onSave?: (data: Partial<Order>) => void;
  /** Callback when save fails */
  onError?: (error: Error) => void;
  /** Minimum data required for saving */
  requiredFields?: (keyof Order)[];
}

/**
 * Enhanced auto-save hook with improved error handling and performance
 * Automatically saves draft data at specified intervals with deduplication
 */
export function useAutoSave(
  data: Partial<Order>,
  options: UseAutoSaveOptions = {},
) {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    onSave,
    onError,
    requiredFields = ['category', 'title'],
  } = options;

  const { saveDraft, formState } = useOrdersStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const isInitialRender = useRef(true);
  const saveInProgressRef = useRef(false);

  /**
   * Validates if data has required fields for saving
   */
  const isDataValid = useCallback(
    (dataToValidate: Partial<Order>): boolean => {
      if (!dataToValidate) return false;

      return requiredFields.every((field) => {
        const value = dataToValidate[field];
        return value !== undefined && value !== null && value !== '';
      });
    },
    [requiredFields],
  );

  /**
   * Save draft data with deduplication and error handling
   */
  const saveDraftData = useCallback(async () => {
    // Prevent concurrent saves
    if (saveInProgressRef.current) {
      return;
    }

    if (!isDataValid(data)) {
      return; // Don't save if required data is missing
    }

    try {
      saveInProgressRef.current = true;

      const currentDataString = JSON.stringify(data);

      // Check if data has changed since last save
      if (currentDataString === lastSavedRef.current) {
        return;
      }

      await saveDraft(data);
      lastSavedRef.current = currentDataString;

      // Show notification only after initial render
      if (!isInitialRender.current) {
        toast.success('Черновик автоматически сохранен', {
          duration: 2000,
          icon: '💾',
        });
      }

      onSave?.(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Auto-save error:', errorMessage);

      onError?.(error as Error);

      toast.error('Ошибка автосохранения черновика', {
        duration: 3000,
        icon: '⚠️',
      });
    } finally {
      saveInProgressRef.current = false;
    }
  }, [data, saveDraft, onSave, onError, isDataValid]);

  /**
   * Force save immediately
   */
  const forceSave = useCallback(async () => {
    if (saveInProgressRef.current) {
      return Promise.resolve();
    }

    return saveDraftData();
  }, [saveDraftData]);

  /**
   * Setup auto-save interval
   */
  useEffect(() => {
    if (!enabled || !data) {
      return;
    }

    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      saveDraftData().catch(console.error);
    }, interval);

    // Initial save with delay
    if (isInitialRender.current) {
      const timeoutId = setTimeout(() => {
        saveDraftData()
          .then(() => {
            isInitialRender.current = false;
          })
          .catch(console.error);
      }, 5000); // Save after 5 seconds on first load

      return () => {
        clearTimeout(timeoutId);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, data, interval, saveDraftData]);

  /**
   * Save on component unmount
   */
  useEffect(() => {
    return () => {
      if (enabled && isDataValid(data) && !saveInProgressRef.current) {
        // Attempt synchronous save on unmount
        saveDraft(data).catch((error) => {
          console.error('Unmount save error:', error);
        });
      }
    };
  }, [enabled, data, saveDraft, isDataValid]);

  /**
   * Save on page unload/visibility change
   */
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (formState?.isDirty && isDataValid(data)) {
        // Show warning about unsaved changes
        event.preventDefault();
        event.returnValue =
          'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?';

        // Attempt to save data
        saveDraft(data).catch((error) => {
          console.error('Before unload save error:', error);
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isDataValid(data)) {
        // Save when page becomes hidden
        saveDraft(data).catch((error) => {
          console.error('Visibility change save error:', error);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, data, formState?.isDirty, saveDraft, isDataValid]);

  return {
    forceSave,
    isAutoSaveEnabled: enabled,
    lastSaved: lastSavedRef.current ? new Date() : null,
    isSaving: saveInProgressRef.current,
  };
}

/**
 * Hook for draft recovery operations
 * Provides methods to load, recover, and delete drafts with proper error handling
 */
export function useDraftRecovery() {
  const { loadDrafts, deleteDraft } = useOrdersStore();

  const loadUserDrafts = useCallback(async (): Promise<Order[]> => {
    try {
      const drafts = await loadDrafts();
      return drafts;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Draft loading error:', errorMessage);

      toast.error('Ошибка загрузки черновиков', {
        duration: 3000,
        icon: '⚠️',
      });

      return [];
    }
  }, [loadDrafts]);

  const recoverDraft = useCallback(
    async (draftId: string): Promise<Order | null> => {
      if (!draftId?.trim()) {
        console.error('Invalid draft ID provided');
        return null;
      }

      try {
        const drafts = await loadDrafts();
        const draft = drafts.find((d) => d.id === draftId);

        if (!draft) {
          throw new Error(`Черновик с ID ${draftId} не найден`);
        }

        toast.success('Черновик успешно восстановлен', {
          duration: 2000,
          icon: '📄',
        });

        return draft;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Draft recovery error:', errorMessage);

        toast.error('Ошибка восстановления черновика', {
          duration: 3000,
          icon: '⚠️',
        });

        return null;
      }
    },
    [loadDrafts],
  );

  const removeDraft = useCallback(
    async (draftId: string): Promise<boolean> => {
      if (!draftId?.trim()) {
        console.error('Invalid draft ID provided');
        return false;
      }

      try {
        await deleteDraft(draftId);

        toast.success('Черновик удален', {
          duration: 2000,
          icon: '🗑️',
        });

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Draft deletion error:', errorMessage);

        toast.error('Ошибка удаления черновика', {
          duration: 3000,
          icon: '⚠️',
        });

        return false;
      }
    },
    [deleteDraft],
  );

  return {
    loadUserDrafts,
    recoverDraft,
    removeDraft,
  };
}

/**
 * Hook for draft notifications
 * Checks for existing drafts and notifies the user
 */
export function useDraftNotifications() {
  const { loadDrafts } = useOrdersStore();

  const checkForDrafts = useCallback(async (): Promise<Order[]> => {
    try {
      const drafts = await loadDrafts();

      if (drafts.length > 0) {
        const draftCount = drafts.length;
        const message = `У вас есть ${draftCount} сохраненн${
          draftCount === 1
            ? 'ый черновик'
            : draftCount < 5
              ? 'ых черновика'
              : 'ых черновиков'
        }`;

        toast.success(message, {
          duration: 5000,
          icon: '📝',
        });

        return drafts;
      }

      return [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Draft check error:', errorMessage);
      return [];
    }
  }, [loadDrafts]);

  return {
    checkForDrafts,
  };
}
