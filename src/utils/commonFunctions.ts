import type { Post, PostData, ReadingTime, Heading, BreadcrumbItem } from "@/types";

export function slugify(inputText?: string) {

  if (!inputText) return '';
  const slug = inputText.toLowerCase().trim();

  return slug
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
}

// humanize
export const humanize = (content: string) => {
  return content
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/[-\s]+/g, " ")
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
};

// titleify
export const titleify = (content: string) => {
  const humanized = humanize(content);
  return humanized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export type DateFormat = 'monthDay' | 'default' | 'dayMonthYear' | 'full';

export function formatDate(date: Date, format: DateFormat = 'monthDay'): string {
  switch (format) {
    case 'monthDay': {
      // December 1st
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const day = date.getDate();
      const ordinal = getOrdinal(day);
      return `${month} ${day}${ordinal}`;
    }
    
    case 'default': {
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
    
    default:
      return date.toLocaleDateString('en-US');
  }
}

function getOrdinal(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}


// format date
export function getFormattedDate(
  date: string | number | Date,
  format: 'long' | 'short' | 'full' = 'long'
): string {
  const parsedDate =
    typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

  if (Number.isNaN(parsedDate.getTime())) return ''; // invalid date → empty string

  /* ───────────── short: 2024 · 12 ───────────── */
  if (format === 'short') {
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    return `${year} · ${month}`;
  }

  /* ───────────── full: December 01, 2024 ─────── */
  if (format === 'full') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(parsedDate);
  }

  /* ───────────── long (default): 2024-12-31 ──── */
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate reading time manually
export function calculateReadingTime(content: string): ReadingTime {
  // Handle empty or undefined content
  if (!content || typeof content !== "string") {
    return {
      text: "1 min read",
      minutes: 1,
      time: 60000,
      words: 0,
    };
  }

  // Remove frontmatter and markdown syntax for accurate word counting
  const plainText = content
    .replace(/^---\n[\s\S]*?\n---\n/, "") // Remove frontmatter
    .replace(/!\[.*?\]\(.*?\)/g, "") // Images
    .replace(/\[.*?\]\(.*?\)/g, "$1") // Links
    .replace(/`{1,3}.*?`{1,3}/gs, "") // Code blocks
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/[*_~`]/g, "") // Emphasis
    .replace(/\n+/g, " ") // Line breaks
    .trim();

  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Average reading speed is 200-250 words per minute, using 225
  const wordsPerMinute = 225;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  return {
    text: `${minutes} min read`,
    minutes: minutes,
    time: minutes * 60 * 1000, // in milliseconds
    words: wordCount,
  };
}

// Check if a date is valid (not January 1, 1970 or invalid)
export function isValidDate(date: Date): boolean {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  // Check if it's January 1, 1970 (Unix epoch)
  const epoch = new Date(0);
  return date.getTime() > epoch.getTime();
}

// Extract reading time from remark plugin or calculate manually
export function getReadingTime(
  remarkData: any,
  content?: string
): ReadingTime | null {
  // Validate remark plugin reading time data
  if (
    remarkData?.readingTime &&
    typeof remarkData.readingTime === "object" &&
    remarkData.readingTime.text &&
    typeof remarkData.readingTime.text === "string" &&
    remarkData.readingTime.text !== "read0" &&
    typeof remarkData.readingTime.minutes === "number" &&
    typeof remarkData.readingTime.time === "number" &&
    typeof remarkData.readingTime.words === "number"
  ) {
    return {
      text: remarkData.readingTime.text,
      minutes: remarkData.readingTime.minutes,
      time: remarkData.readingTime.time,
      words: remarkData.readingTime.words,
    };
  }

  // Fallback to manual calculation if content is provided
  if (content !== undefined) {
    return calculateReadingTime(content);
  }

  // Default for no content and no valid remark data
  return {
    text: "1 min read",
    minutes: 1,
    time: 60000,
    words: 0,
  };
}

// ============================================================================
// AUTO-GENERATE BREADCRUMBS FROM URL
// ============================================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Generate breadcrumbs from URL path
 * Example: /posts/my-post → Home > Posts > My Post
 */
export function getBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  // Remove leading/trailing slashes and split
  const parts = pathname.replace(/^\/|\/$/g, '').split('/');
  
  // If homepage, return empty (Breadcrumb component will add Home)
  if (parts.length === 0 || parts[0] === '') {
    return [];
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const isLast = index === parts.length - 1;

    breadcrumbs.push({
      label: slugToTitle(part),
      href: isLast ? undefined : currentPath, // Last item has no href
    });
  });

  return breadcrumbs;
}

/**
 * Generate content directory from path
 * Example: /posts/my-post
 */

export function getContentDir(filePath: string) {
  return filePath.replace(/\/[^/]+$/, "");
}