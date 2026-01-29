/**
 * Content Utilities
 *
 * Centralized content collection operations for posts, pages, and projects.
 */

import { getCollection } from 'astro:content';
import { siteConfig, type PostCategory } from '@/site.config';
import type { Post, ReadingTime, BreadcrumbItem } from '@/types';
import { slugToTitle } from './string.utils';

// ============================================================================
// READING TIME
// ============================================================================

const WORDS_PER_MINUTE = 225;

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): ReadingTime {
  if (!content || typeof content !== 'string') {
    return { text: '1 min read', minutes: 1, time: 60000, words: 0 };
  }

  // Remove frontmatter and markdown syntax
  const plainText = content
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  return {
    text: `${minutes} min read`,
    minutes,
    time: minutes * 60 * 1000,
    words: wordCount,
  };
}

/**
 * Get reading time from remark plugin or calculate manually
 */
export function getReadingTime(remarkData: any, content?: string): ReadingTime | null {
  if (
    remarkData?.readingTime &&
    typeof remarkData.readingTime === 'object' &&
    remarkData.readingTime.text &&
    typeof remarkData.readingTime.text === 'string' &&
    remarkData.readingTime.text !== 'read0' &&
    typeof remarkData.readingTime.minutes === 'number'
  ) {
    return remarkData.readingTime;
  }

  if (content !== undefined) {
    return calculateReadingTime(content);
  }

  return { text: '1 min read', minutes: 1, time: 60000, words: 0 };
}

// ============================================================================
// CONTENT DIRECTORY
// ============================================================================

/**
 * Get content directory from file path
 */
export function getContentDir(filePath: string): string {
  return filePath.replace(/\/[^/]+$/, '');
}

// ============================================================================
// BREADCRUMBS
// ============================================================================

/**
 * Generate breadcrumbs from URL path
 */
export function getBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const parts = pathname.replace(/^\/|\/$/g, '').split('/');

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
      href: isLast ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

// ============================================================================
// DRAFT FILTERING
// ============================================================================

/**
 * Filter out draft entries in production
 */
export function filterDrafts<T extends { data: { draft?: boolean } }>(entries: T[]): T[] {
  return import.meta.env.PROD ? entries.filter((entry) => !entry.data.draft) : entries;
}

// ============================================================================
// SORTING
// ============================================================================

/**
 * Sort entries by date (descending - newest first)
 */
export function sortEntriesByDate<T extends { data: { date: Date } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Sort entries by order field (ascending)
 */
export function sortEntriesByOrder<T extends { data: { order?: number } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const orderA = a.data.order ?? 0;
    const orderB = b.data.order ?? 0;
    return orderA - orderB;
  });
}

// ============================================================================
// GROUPING
// ============================================================================

/**
 * Group entries by year and sort descending
 */
export function getEntriesByYearSorted<T extends { data: { date: Date } }>(
  entries: T[]
): [string, T[]][] {
  const grouped = entries.reduce<Record<string, T[]>>((acc, entry) => {
    const year = entry.data.date.getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {});

  for (const year in grouped) {
    grouped[year].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  }

  return Object.entries(grouped).sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA));
}

/**
 * Group entries by a specific field
 */
export function groupEntriesBy<T extends { data: Record<string, any> }>(
  entries: T[],
  field: keyof T['data']
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  entries.forEach((entry) => {
    const value = entry.data[field];
    const key = value?.toString() || 'Uncategorized';

    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  });

  return grouped;
}

// ============================================================================
// TAGS
// ============================================================================

/**
 * Get unique tags from entries
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
 */
export function getEntriesByTag<T extends { data: { tags?: string[] | null } }>(
  entries: T[],
  tag: string
): T[] {
  return entries.filter((entry) => entry.data.tags?.includes(tag));
}

/**
 * Get tag counts
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
 */
export function getFeaturedEntries<T extends { data: { featured?: boolean } }>(entries: T[]): T[] {
  return entries.filter((entry) => entry.data.featured === true);
}

/**
 * Filter entries by field value
 */
export function filterEntriesBy<T extends { data: Record<string, any> }>(
  entries: T[],
  field: keyof T['data'],
  value: any
): T[] {
  return entries.filter((entry) => entry.data[field] === value);
}

// ============================================================================
// SERIES & SUBPOSTS
// ============================================================================

/**
 * Check if entry is a subpost (part of a series)
 */
export function isSubpost(entryId: string): boolean {
  return entryId.includes('/');
}

/**
 * Get parent ID from a subpost
 */
export function getParentId(subpostId: string): string {
  return subpostId.split('/')[0];
}

/**
 * Get top-level entries only (no subposts)
 */
export function getTopLevelEntries<T extends { id: string }>(entries: T[]): T[] {
  return entries.filter((entry) => !isSubpost(entry.id));
}

/**
 * Get subposts for a parent
 */
export function getSubpostsForParent<T extends { id: string; data: { draft?: boolean; order?: number; date: Date } }>(
  entries: T[],
  parentId: string
): T[] {
  return entries
    .filter(
      (entry) => !entry.data.draft && isSubpost(entry.id) && getParentId(entry.id) === parentId
    )
    .sort((a, b) => {
      const dateDiff = a.data.date.valueOf() - b.data.date.valueOf();
      if (dateDiff !== 0) return dateDiff;
      return (a.data.order ?? 0) - (b.data.order ?? 0);
    });
}

/**
 * Check if entry has subposts
 */
export function hasSubposts<T extends { id: string; data: { draft?: boolean; order?: number; date: Date } }>(
  entries: T[],
  entryId: string
): boolean {
  return getSubpostsForParent(entries, entryId).length > 0;
}

/**
 * Get parent entry from subpost
 */
export function getParentEntry<T extends { id: string }>(entries: T[], subpostId: string): T | null {
  if (!isSubpost(subpostId)) return null;
  const parentId = getParentId(subpostId);
  return entries.find((entry) => entry.id === parentId) || null;
}

/**
 * Get all series entries (parent + subposts)
 */
export function getSeriesEntries<T extends { id: string; data: { draft?: boolean; order?: number; date: Date } }>(
  entries: T[],
  parentId: string
): T[] {
  const parent = entries.find((entry) => entry.id === parentId);
  const subposts = getSubpostsForParent(entries, parentId);
  return parent ? [parent, ...subposts] : subposts;
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Get adjacent entries with series awareness
 */
export function getAdjacentEntriesWithSeries<T extends { id: string; data: { draft?: boolean; order?: number; date: Date } }>(
  entries: T[],
  currentId: string
): { newer: T | null; older: T | null; parent: T | null } {
  if (isSubpost(currentId)) {
    const parentId = getParentId(currentId);
    const parent = entries.find((entry) => entry.id === parentId) || null;

    const subposts = entries
      .filter(
        (entry) => isSubpost(entry.id) && getParentId(entry.id) === parentId && !entry.data.draft
      )
      .sort((a, b) => {
        const dateDiff = a.data.date.valueOf() - b.data.date.valueOf();
        if (dateDiff !== 0) return dateDiff;
        return (a.data.order ?? 0) - (b.data.order ?? 0);
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

/**
 * Get related entries by tag similarity
 */
export function getRelatedEntries<T extends { id: string; data: { tags?: string[] | null; date: Date } }>(
  entries: T[],
  currentEntry: T,
  limit: number = 3
): T[] {
  const currentTags = currentEntry.data.tags || [];

  if (currentTags.length === 0) return [];

  const scoredEntries = entries
    .filter((entry) => entry.id !== currentEntry.id)
    .map((entry) => {
      const entryTags = entry.data.tags || [];
      const matchingTags = entryTags.filter((tag) => currentTags.includes(tag));
      return { entry, score: matchingTags.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.entry.data.date.valueOf() - a.entry.data.date.valueOf();
    });

  return scoredEntries.slice(0, limit).map((item) => item.entry);
}

// ============================================================================
// POSTS-SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Get all posts, filtered by draft status
 */
export async function getAllPosts(includeDrafts = false): Promise<Post[]> {
  const allContent = await getCollection('posts');
  return includeDrafts ? allContent : filterDrafts(allContent);
}

/**
 * Get all content (alias for getAllPosts)
 */
export async function getAllContent(includeDrafts = false): Promise<Post[]> {
  return getAllPosts(includeDrafts);
}

/**
 * Get posts only (exclude galleries)
 */
export async function getPosts(includeDrafts = false): Promise<Post[]> {
  const all = await getAllContent(includeDrafts);
  return all.filter((p) => p.data.category !== 'gallery');
}

/**
 * Get galleries only
 */
export async function getGalleries(includeDrafts = false): Promise<Post[]> {
  const all = await getAllContent(includeDrafts);
  return all.filter((p) => p.data.category === 'gallery');
}

/**
 * Filter by category
 */
export function filterByCategory(posts: Post[], category: PostCategory): Post[] {
  return posts.filter((p) => p.data.category === category);
}

/**
 * Get category counts
 */
export function getCategoryCounts(posts: Post[]): Record<PostCategory, number> {
  return posts.reduce((acc, post) => {
    const category = post.data.category as PostCategory;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<PostCategory, number>);
}

/**
 * Sort posts by date
 */
export function sortPostsByDate(posts: Post[]): Post[] {
  return sortEntriesByDate(posts);
}

/**
 * Get top-level posts only
 */
export function getTopLevelPosts(posts: Post[]): Post[] {
  return getTopLevelEntries(posts);
}

/**
 * Get adjacent posts
 */
export function getAdjacentPosts(
  posts: Post[],
  currentId: string
): { newer: Post | null; older: Post | null; parent: Post | null } {
  return getAdjacentEntriesWithSeries(posts, currentId);
}

/**
 * Get series context for a post
 */
export function getSeriesContext(
  allPosts: Post[],
  currentPost: Post
): {
  isCurrentSubpost: boolean;
  isCurrentParent: boolean;
  isInSeries: boolean;
  seriesId: string;
  parentPost: Post | null;
  seriesPosts: Post[];
  prevInSeries: Post | null;
  nextInSeries: Post | null;
} {
  const isCurrentSubpost = isSubpost(currentPost.id);
  const isCurrentParent = hasSubposts(allPosts, currentPost.id);
  const isInSeries = isCurrentSubpost || isCurrentParent;

  if (!isInSeries) {
    return {
      isCurrentSubpost,
      isCurrentParent,
      isInSeries: false,
      seriesId: '',
      parentPost: null,
      seriesPosts: [],
      prevInSeries: null,
      nextInSeries: null,
    };
  }

  const seriesId = isCurrentSubpost ? getParentId(currentPost.id) : currentPost.id;
  const parentPost = isCurrentSubpost ? getParentEntry(allPosts, currentPost.id) : currentPost;
  const seriesPosts = getSeriesEntries(allPosts, seriesId);

  const currentIndex = seriesPosts.findIndex((e) => e.id === currentPost.id);
  const prevInSeries = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextInSeries = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null;

  return {
    isCurrentSubpost,
    isCurrentParent,
    isInSeries: true,
    seriesId,
    parentPost,
    seriesPosts,
    prevInSeries,
    nextInSeries,
  };
}

/**
 * Check if post is a gallery
 */
export function isGallery(post: Post): boolean {
  return post.data.category === 'gallery';
}

/**
 * Check if post is travel category
 */
export function isTravel(post: Post): boolean {
  return post.data.category === 'travel';
}

/**
 * Check if post is tech category
 */
export function isTech(post: Post): boolean {
  return post.data.category === 'tech';
}
