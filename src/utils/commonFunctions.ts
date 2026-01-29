/**
 * Common Functions
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from the new domain-specific utilities:
 * - @/utils/date.utils - Date operations
 * - @/utils/string.utils - String operations
 * - @/utils/content.utils - Content operations
 */

// Re-export date utilities
export {
  formatDate,
  getFormattedDate,
  isValidDate,
  parseDate,
  getRelativeTime,
  type DateFormat,
} from './date.utils';

// Re-export string utilities
export {
  slugify,
  humanize,
  titleify,
  capitalize,
  slugToTitle,
  truncate,
} from './string.utils';

// Re-export content utilities
export {
  calculateReadingTime,
  getReadingTime,
  getContentDir,
  getBreadcrumbsFromPath,
  isGallery,
} from './content.utils';

// Re-export types
export type { ReadingTime, BreadcrumbItem } from '@/types';
