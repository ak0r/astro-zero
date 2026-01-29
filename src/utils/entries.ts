/**
 * Generic Utilities for Content Collections
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from @/utils/content.utils instead.
 */

// Re-export all content utilities
export {
  filterDrafts,
  sortEntriesByDate,
  sortEntriesByOrder,
  getEntriesByYearSorted,
  groupEntriesBy,
  getUniqueTags,
  getEntriesByTag,
  getTagCounts,
  getFeaturedEntries,
  filterEntriesBy,
  isSubpost,
  getParentId,
  getTopLevelEntries,
  getSubpostsForParent,
  hasSubposts,
  getParentEntry,
  getSeriesEntries,
  getAdjacentEntriesWithSeries,
  getRelatedEntries,
} from './content.utils';

// Additional functions that exist in the original but need to be re-exported
// These are kept for backward compatibility

/**
 * Sort entries by a custom date field (descending - newest first)
 */
export function sortEntriesByCustomDate<T extends { data: Record<string, any> }>(
  entries: T[],
  dateField: keyof T['data']
): T[] {
  return [...entries].sort((a, b) => {
    const dateA = a.data[dateField] as Date;
    const dateB = b.data[dateField] as Date;
    if (!dateA || !dateB) return 0;
    return dateB.valueOf() - dateA.valueOf();
  });
}

/**
 * Get entries by multiple IDs
 */
export function getEntriesByIds<T extends { id: string }>(
  entries: T[],
  ids: string[]
): T[] {
  return entries.filter((entry) => ids.includes(entry.id));
}

/**
 * Search entries by title or description
 */
export function searchEntries<T extends { data: { title: string; description?: string | null } }>(
  entries: T[],
  query: string
): T[] {
  const lowerQuery = query.toLowerCase();

  return entries.filter((entry) => {
    const title = entry.data.title.toLowerCase();
    const description = entry.data.description?.toLowerCase() || '';
    return title.includes(lowerQuery) || description.includes(lowerQuery);
  });
}

/**
 * Search entries by custom fields
 */
export function searchEntriesInFields<T extends { data: Record<string, any> }>(
  entries: T[],
  query: string,
  fields: (keyof T['data'])[]
): T[] {
  const lowerQuery = query.toLowerCase();

  return entries.filter((entry) => {
    return fields.some((field) => {
      const value = entry.data[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      if (Array.isArray(value)) {
        return value.some(
          (item) => typeof item === 'string' && item.toLowerCase().includes(lowerQuery)
        );
      }
      return false;
    });
  });
}

/**
 * Paginate entries
 */
export function paginateEntries<T>(
  entries: T[],
  page: number,
  perPage: number
): {
  entries: T[];
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalEntries = entries.length;
  const totalPages = Math.ceil(totalEntries / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  return {
    entries: entries.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    totalEntries,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

/**
 * Get subpost count for a parent
 */
export function getSubpostCount<T extends { id: string; data: { draft?: boolean; order?: number; date: Date } }>(
  entries: T[],
  parentId: string
): number {
  const { getSubpostsForParent } = require('./content.utils');
  return getSubpostsForParent(entries, parentId).length;
}

/**
 * Get next entry in series
 */
export function getNextInSeries<T extends { id: string; data: { draft?: boolean; order?: number; date: Date } }>(
  entries: T[],
  currentEntry: T
): T | null {
  const { isSubpost, getParentId, getSeriesEntries } = require('./content.utils');
  const parentId = isSubpost(currentEntry.id) ? getParentId(currentEntry.id) : currentEntry.id;
  const seriesEntries = getSeriesEntries(entries, parentId);
  const currentIndex = seriesEntries.findIndex((e: T) => e.id === currentEntry.id);

  return currentIndex >= 0 && currentIndex < seriesEntries.length - 1
    ? seriesEntries[currentIndex + 1]
    : null;
}

/**
 * Get previous entry in series
 */
export function getPrevInSeries<T extends { id: string; data: { draft?: boolean; order?: number; date: Date } }>(
  entries: T[],
  currentEntry: T
): T | null {
  const { isSubpost, getParentId, getSeriesEntries } = require('./content.utils');
  const parentId = isSubpost(currentEntry.id) ? getParentId(currentEntry.id) : currentEntry.id;
  const seriesEntries = getSeriesEntries(entries, parentId);
  const currentIndex = seriesEntries.findIndex((e: T) => e.id === currentEntry.id);

  return currentIndex > 0 ? seriesEntries[currentIndex - 1] : null;
}
