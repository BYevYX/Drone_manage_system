/**
 * Утилита для управления локальными ID полей
 * Решает проблему, когда глобальные ID из БД могут начинаться не с 1
 * (например, если другие пользователи уже создали поля)
 */

const STORAGE_KEY = 'contractor_field_id_map';

export interface FieldIdMapping {
  localId: number;
  globalId: number;
}

/**
 * Получить все маппинги из localStorage
 */
export function getFieldIdMappings(): FieldIdMapping[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error('Ошибка чтения маппинга ID полей:', e);
    return [];
  }
}

/**
 * Сохранить маппинги в localStorage
 */
function saveFieldIdMappings(mappings: FieldIdMapping[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (e) {
    console.error('Ошибка сохранения маппинга ID полей:', e);
  }
}

/**
 * Получить локальный ID по глобальному ID
 */
export function getLocalId(globalId: number): number | null {
  const mappings = getFieldIdMappings();
  const mapping = mappings.find((m) => m.globalId === globalId);
  return mapping ? mapping.localId : null;
}

/**
 * Получить глобальный ID по локальному ID
 */
export function getGlobalId(localId: number): number | null {
  const mappings = getFieldIdMappings();
  const mapping = mappings.find((m) => m.localId === localId);
  return mapping ? mapping.globalId : null;
}

/**
 * Добавить новый маппинг (при создании поля)
 */
export function addFieldMapping(globalId: number): number {
  const mappings = getFieldIdMappings();

  // Проверяем, не существует ли уже маппинг для этого globalId
  const existing = mappings.find((m) => m.globalId === globalId);
  if (existing) {
    return existing.localId;
  }

  // Находим максимальный localId и добавляем 1
  const maxLocalId = mappings.reduce((max, m) => Math.max(max, m.localId), 0);
  const newLocalId = maxLocalId + 1;

  mappings.push({ localId: newLocalId, globalId });
  saveFieldIdMappings(mappings);

  return newLocalId;
}

/**
 * Удалить маппинг (при удалении поля)
 * После удаления перенумеровывает оставшиеся поля
 */
export function removeFieldMapping(globalId: number): void {
  const mappings = getFieldIdMappings();
  const filtered = mappings.filter((m) => m.globalId !== globalId);

  // Сортируем по globalId для стабильности
  filtered.sort((a, b) => a.globalId - b.globalId);

  // Перенумеровываем локальные ID последовательно (1, 2, 3...)
  const renumbered = filtered.map((m, index) => ({
    localId: index + 1,
    globalId: m.globalId,
  }));

  saveFieldIdMappings(renumbered);
}

/**
 * Синхронизировать маппинги с массивом полей из API
 * Добавляет маппинги для новых полей, удаляет для несуществующих
 * Перенумеровывает локальные ID чтобы они были последовательными (1, 2, 3...)
 */
export function syncFieldMappings(globalIds: number[]): void {
  console.log(
    '[fieldIdMapper] syncFieldMappings called with globalIds:',
    globalIds,
  );

  const mappings = getFieldIdMappings();
  console.log('[fieldIdMapper] existing mappings:', mappings);

  const existingGlobalIds = new Set(mappings.map((m) => m.globalId));
  const newGlobalIds = new Set(globalIds);

  // Удаляем маппинги для полей, которых больше нет
  const filtered = mappings.filter((m) => newGlobalIds.has(m.globalId));

  // Добавляем маппинги для новых полей
  for (const globalId of globalIds) {
    if (!existingGlobalIds.has(globalId)) {
      filtered.push({ localId: 0, globalId }); // временный localId
    }
  }

  // Сортируем по globalId для стабильности
  filtered.sort((a, b) => a.globalId - b.globalId);

  // Перенумеровываем локальные ID последовательно (1, 2, 3...)
  const renumbered = filtered.map((m, index) => ({
    localId: index + 1,
    globalId: m.globalId,
  }));

  console.log('[fieldIdMapper] renumbered mappings:', renumbered);
  saveFieldIdMappings(renumbered);
}

/**
 * Очистить все маппинги (для отладки или сброса)
 */
export function clearFieldMappings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Получить отображаемый ID (локальный) для UI
 */
export function getDisplayId(globalId: number): string {
  const localId = getLocalId(globalId);
  return localId !== null ? `#${localId}` : `#${globalId}`;
}
