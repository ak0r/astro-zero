/**
 * Generic Utilities for Content Collections
 * Works with any Astro content collection (posts, docs, projects, etc.)
 */

// ============================================================================
// CORE OPERATIONS
// ============================================================================

/**
 * Filter out draft entries in production
 * @param entries - Array of collection entries
 * @returns Filtered entries (no drafts in production)
 */
export function filterDrafts<T extends { data: { draft?: boolean } }>(
  entries: T[]
): T[] {
  return import.meta.env.PROD
    ? entries.filter((entry) => !entry.data.draft)
    : entries;
}

/**
 * Sort entries by date (descending - newest first)
 * @param entries - Array of entries with date field
 * @returns Sorted entries
 */
export function sortEntriesByDate<T extends { data: { date: Date } }>(
  entries: T[]
): T[] {
  return [...entries].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}

/**
 * Sort entries by a custom date field (descending - newest first)
 * @param entries - Array of entries
 * @param dateField - Name of the date field
 * @returns Sorted entries
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
 * Sort entries by order field (ascending)
 * @param entries - Array of entries with order field
 * @returns Sorted entries
 */
export function sortEntriesByOrder<T extends { data: { order?: number } }>(
  entries: T[]
): T[] {
  return [...entries].sort((a, b) => {
    const orderA = a.data.order ?? 0;
    const orderB = b.data.order ?? 0;
    return orderA - orderB;
  });
}

// ============================================================================
// GROUPING & ORGANIZATION
// ============================================================================

/**
 * Group entries by year and sort descending within year
 * @param entries - Array of entries with date field
 * @returns Array of [year, entries] tuples sorted by year descending
 */
export function getEntriesByYearSorted<T extends { data: { date: Date } }>(
  entries: T[]
): [string, T[]][] {
  // Step 1: Group entries by year
  const grouped = entries.reduce<Record<string, T[]>>((acc, entry) => {
    const year = entry.data.date.getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(entry);
    return acc;
  }, {});

  // Step 2: Sort entries within each year by date (descending)
  for (const year in grouped) {
    grouped[year].sort(
      (a, b) => b.data.date.getTime() - a.data.date.getTime()
    );
  }

  // Step 3: Return entries sorted by year (descending)
  return Object.entries(grouped).sort(
    ([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA)
  );
}

/**
 * Group entries by a specific field
 * @param entries - Array of entries
 * @param field - Field name to group by
 * @returns Map of field value to entries
 */
export function groupEntriesBy<T extends { data: Record<string, any> }>(
  entries: T[],
  field: keyof T['data']
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  entries.forEach((entry) => {
    const value = entry.data[field];
    const key = value?.toString() || 'Uncategorized';
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(entry);
  });

  return grouped;
}

// ============================================================================
// TAG OPERATIONS
// ============================================================================

/**
 * Get unique tags from entries
 * @param entries - Array of entries with tags field
 * @returns Sorted array of unique tags
 */
export function getUniqueTags<T extends { data: { tags?: string[] | null } }>(
  entries: T[]
): string[] {
  const tags = entries
    .flatMap((entry) => entry.data.tags || [])
    .filter((tag): tag is string => tag !== null && tag !== undefined);

  return [...new Set(tags)].sort();
}

/**
 * Filter entries by tag
 * @param entries - Array of entries with tags field
 * @param tag - Tag to filter by
 * @returns Filtered entries
 */
export function getEntriesByTag<T extends { data: { tags?: string[] | null } }>(
  entries: T[],
  tag: string
): T[] {
  return entries.filter((entry) => entry.data.tags?.includes(tag));
}

/**
 * Get tag counts
 * @param entries - Array of entries with tags field
 * @returns Map of tag to count
 */
export function getTagCounts<T extends { data: { tags?: string[] | null } }>(
  entries: T[]
): Map<string, number> {
  const counts = new Map<string, number>();

  entries.forEach((entry) => {
    entry.data.tags?.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return counts;
}

// ============================================================================
// FEATURED & FILTERING
// ============================================================================

/**
 * Get featured entries
 * @param entries - Array of entries with featured field
 * @returns Filtered featured entries
 */
export function getFeaturedEntries<T extends { data: { featured?: boolean } }>(
  entries: T[]
): T[] {
  return entries.filter((entry) => entry.data.featured === true);
}

/**
 * Filter entries by field value
 * @param entries - Array of entries
 * @param field - Field name to filter by
 * @param value - Value to match
 * @returns Filtered entries
 */
export function filterEntriesBy<T extends { data: Record<string, any> }>(
  entries: T[],
  field: keyof T['data'],
  value: any
): T[] {
  return entries.filter((entry) => entry.data[field] === value);
}

/**
 * Get entries by multiple IDs
 * @param entries - Array of entries
 * @param ids - Array of entry IDs
 * @returns Filtered entries
 */
export function getEntriesByIds<T extends { id: string }>(
  entries: T[],
  ids: string[]
): T[] {
  return entries.filter((entry) => ids.includes(entry.id));
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Get adjacent entries with series awareness
 * @param entries - All entries
 * @param currentId - Current entry ID
 * @returns Object with newer, older, and parent entries
 */
export function getAdjacentEntriesWithSeries<T extends { 
  id: string; 
  data: { draft?: boolean; order?: number; date: Date } 
}>(
  entries: T[],
  currentId: string
): {
  newer: T | null;
  older: T | null;
  parent: T | null;
} {
  // If current is a subpost, navigate within series
  if (isSubpost(currentId)) {
    const parentId = getParentId(currentId);
    const parent = entries.find((entry) => entry.id === parentId) || null;
    
    // Get all subposts in this series
    const subposts = entries
      .filter((entry) => 
        isSubpost(entry.id) &&
        getParentId(entry.id) === parentId &&
        !entry.data.draft
      )
      .sort((a, b) => {
        const dateDiff = a.data.date.valueOf() - b.data.date.valueOf();
        if (dateDiff !== 0) return dateDiff;
        const orderA = a.data.order ?? 0;
        const orderB = b.data.order ?? 0;
        return orderA - orderB;
      });
    
    const currentIndex = subposts.findIndex((entry) => entry.id === currentId);
    
    if (currentIndex === -1) {
      return { newer: null, older: null, parent };
    }
    
    return {
      newer: currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
      older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
      parent,
    };
  }
  
  // If current is a parent or standalone, navigate between top-level posts
  const parentPosts = entries.filter((entry) => !isSubpost(entry.id));
  const currentIndex = parentPosts.findIndex((entry) => entry.id === currentId);
  
  if (currentIndex === -1) {
    return { newer: null, older: null, parent: null };
  }
  
  return {
    newer: currentIndex > 0 ? parentPosts[currentIndex - 1] : null,
    older: currentIndex < parentPosts.length - 1 ? parentPosts[currentIndex + 1] : null,
    parent: null,
  };
}

// ============================================================================
// RELATED CONTENT
// ============================================================================

/**
 * Get related entries based on tag similarity
 * @param entries - All entries
 * @param currentEntry - Current entry
 * @param limit - Maximum number of related entries to return
 * @returns Array of related entries
 */
export function getRelatedEntries<T extends { 
  id: string; 
  data: { 
    tags?: string[] | null;
    date: Date;
  } 
}>(
  entries: T[],
  currentEntry: T,
  limit: number = 3
): T[] {
  const currentTags = currentEntry.data.tags || [];

  if (currentTags.length === 0) {
    return [];
  }

  const scoredEntries = entries
    .filter((entry) => entry.id !== currentEntry.id)
    .map((entry) => {
      const entryTags = entry.data.tags || [];
      const matchingTags = entryTags.filter((tag) => currentTags.includes(tag));
      return { entry, score: matchingTags.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.entry.data.date.valueOf() - a.entry.data.date.valueOf();
    });

  return scoredEntries.slice(0, limit).map((item) => item.entry);
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search entries by title or description
 * @param entries - Array of entries
 * @param query - Search query
 * @returns Filtered entries matching the query
 */
export function searchEntries<T extends { 
  data: { 
    title: string; 
    description?: string | null;
  } 
}>(
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
 * @param entries - Array of entries
 * @param query - Search query
 * @param fields - Fields to search in
 * @returns Filtered entries matching the query
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
        return value.some((item) =>
          typeof item === 'string' && item.toLowerCase().includes(lowerQuery)
        );
      }
      return false;
    });
  });
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Paginate entries
 * @param entries - Array of entries
 * @param page - Current page number (1-indexed)
 * @param perPage - Number of entries per page
 * @returns Object with paginated entries and metadata
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

// ============================================================================
// SERIES & SUBPOSTS
// ============================================================================

/**
 * Check if an entry is a subpost (part of a series)
 * @param entryId - Entry ID to check
 * @returns True if entry ID contains '/'
 */
export function isSubpost(entryId: string): boolean {
  return entryId.includes('/');
}

/**
 * Get parent ID from a subpost
 * @param subpostId - Subpost ID
 * @returns Parent series ID
 */
export function getParentId(subpostId: string): string {
  return subpostId.split('/')[0];
}

/**
 * Get all subposts for a series parent
 * @param entries - All entries
 * @param parentId - Parent series ID
 * @returns Array of subposts sorted by order field
 */
export function getSubpostsForParent<T extends { 
  id: string; 
  data: { draft?: boolean; order?: number; date: Date } 
}>(
  entries: T[],
  parentId: string
): T[] {
  return entries
    .filter((entry) => 
      !entry.data.draft &&
      isSubpost(entry.id) &&
      getParentId(entry.id) === parentId
    )
    .sort((a, b) => {
      // First sort by date
      const dateDiff = a.data.date.valueOf() - b.data.date.valueOf();
      if (dateDiff !== 0) return dateDiff;
      
      // Then by order if dates are same
      const orderA = a.data.order ?? 0;
      const orderB = b.data.order ?? 0;
      return orderA - orderB;
    });
}

/**
 * Check if an entry has subposts (is a series parent)
 * @param entries - All entries
 * @param entryId - Entry ID to check
 * @returns True if entry has subposts
 */
export function hasSubposts<T extends { 
  id: string; 
  data: { draft?: boolean; order?: number; date: Date } 
}>(
  entries: T[],
  entryId: string
): boolean {
  const subposts = getSubpostsForParent(entries, entryId);
  return subposts.length > 0;
}

/**
 * Get parent entry from a subpost
 * @param entries - All entries
 * @param subpostId - Subpost ID
 * @returns Parent entry or null
 */
export function getParentEntry<T extends { id: string }>(
  entries: T[],
  subpostId: string
): T | null {
  if (!isSubpost(subpostId)) return null;
  
  const parentId = getParentId(subpostId);
  return entries.find((entry) => entry.id === parentId) || null;
}

/**
 * Get subpost count for a parent
 * @param entries - All entries
 * @param parentId - Parent series ID
 * @returns Number of subposts
 */
export function getSubpostCount<T extends { 
  id: string; 
  data: { draft?: boolean; order?: number; date: Date } 
}>(
  entries: T[],
  parentId: string
): number {
  return getSubpostsForParent(entries, parentId).length;
}

/**
 * Get all entries in a series (parent + subposts)
 * @param entries - All entries
 * @param parentId - Parent series ID
 * @returns Array with parent first, then sorted subposts
 */
export function getSeriesEntries<T extends { 
  id: string; 
  data: { draft?: boolean; order?: number; date: Date } 
}>(
  entries: T[],
  parentId: string
): T[] {
  const parent = entries.find((entry) => entry.id === parentId);
  const subposts = getSubpostsForParent(entries, parentId);
  
  return parent ? [parent, ...subposts] : subposts;
}

/**
 * Get next entry in series
 * @param entries - All entries
 * @param currentEntry - Current entry
 * @returns Next entry in series or null
 */
export function getNextInSeries<T extends { 
  id: string; 
  data: { draft?: boolean; order?: number; date: Date } 
}>(
  entries: T[],
  currentEntry: T
): T | null {
  const parentId = isSubpost(currentEntry.id) 
    ? getParentId(currentEntry.id) 
    : currentEntry.id;
  
  const seriesEntries = getSeriesEntries(entries, parentId);
  const currentIndex = seriesEntries.findIndex((e) => e.id === currentEntry.id);
  
  return currentIndex >= 0 && currentIndex < seriesEntries.length - 1
    ? seriesEntries[currentIndex + 1]
    : null;
}

/**
 * Get previous entry in series
 * @param entries - All entries
 * @param currentEntry - Current entry
 * @returns Previous entry in series or null
 */
export function getPrevInSeries<T extends { 
  id: string; 
  data: { draft?: boolean; order?: number; date: Date } 
}>(
  entries: T[],
  currentEntry: T
): T | null {
  const parentId = isSubpost(currentEntry.id) 
    ? getParentId(currentEntry.id) 
    : currentEntry.id;
  
  const seriesEntries = getSeriesEntries(entries, parentId);
  const currentIndex = seriesEntries.findIndex((e) => e.id === currentEntry.id);
  
  return currentIndex > 0 ? seriesEntries[currentIndex - 1] : null;
}

/**
 * Get only top-level entries (standalone + series parents, no subposts)
 * For displaying in main index pages
 * @param entries - All entries
 * @returns Filtered entries
 */
export function getTopLevelEntries<T extends { id: string }>(
  entries: T[]
): T[] {
  return entries.filter((entry) => !isSubpost(entry.id));
}