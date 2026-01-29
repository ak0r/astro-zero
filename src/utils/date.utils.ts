/**
 * Date Utilities
 *
 * Centralized date operations for the application.
 */

export type DateFormat = 'monthDay' | 'default' | 'dayMonthYear' | 'full' | 'long' | 'short';

/**
 * Get ordinal suffix for a day number
 */
function getOrdinal(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/**
 * Format a date with various format options
 */
export function formatDate(date: Date, format: DateFormat = 'monthDay'): string {
  switch (format) {
    case 'monthDay': {
      // December 1st
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const day = date.getDate();
      const ordinal = getOrdinal(day);
      return `${month} ${day}${ordinal}`;
    }

    case 'default':
    case 'long': {
      // 2025-12-01
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    case 'dayMonthYear': {
      // 1st Dec 2025
      const day = date.getDate();
      const ordinal = getOrdinal(day);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day}${ordinal} ${month} ${year}`;
    }

    case 'full': {
      // December 1st, 2025
      const day = date.getDate();
      const ordinal = getOrdinal(day);
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const year = date.getFullYear();
      return `${month} ${day}${ordinal}, ${year}`;
    }

    case 'short': {
      // 2024 · 12
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year} · ${month}`;
    }

    default:
      return date.toLocaleDateString('en-US');
  }
}

/**
 * Format date from various input types
 * Supports string, number (timestamp), or Date objects
 */
export function getFormattedDate(
  date: string | number | Date,
  format: 'long' | 'short' | 'full' = 'long'
): string {
  const parsedDate =
    typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

  if (Number.isNaN(parsedDate.getTime())) return '';

  if (format === 'short') {
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    return `${year} · ${month}`;
  }

  if (format === 'full') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(parsedDate);
  }

  // 'long' (default): 2024-12-31
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is valid (not invalid or Unix epoch)
 */
export function isValidDate(date: Date): boolean {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }
  // Check if it's January 1, 1970 (Unix epoch)
  const epoch = new Date(0);
  return date.getTime() > epoch.getTime();
}

/**
 * Parse a date from string or Date object
 */
export function parseDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format date for schema.org
 */
export function formatSchemaDate(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}
