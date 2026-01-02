import { getCollection } from 'astro:content';
import type { Post, Page, Docs, Project } from '@/types';
import {
  filterDrafts,
  sortEntriesByDate,
  getEntriesByYearSorted,
  getUniqueTags,
  getEntriesByTag,
  getFeaturedEntries,
  getAdjacentEntriesWithSeries,
  getRelatedEntries,
  searchEntries,
  paginateEntries,
  isSubpost as isSubpostGeneric,
  getParentId as getParentIdGeneric,
  getParentEntry,
  getSubpostsForParent as getSubpostsForParentGeneric,
  hasSubposts as hasSubpostsGeneric,
  getSubpostCount as getSubpostCountGeneric,
  getSeriesEntries,
  getNextInSeries as getNextInSeriesGeneric,
  getPrevInSeries as getPrevInSeriesGeneric,
  getTopLevelEntries,
} from './entries';

/**
 * Get all posts, filtered by draft status
 */
export async function getAllPosts(): Promise<Post[]> {
  const allPosts = await getCollection('posts');
  return filterDrafts(allPosts);
}

/**
 * Sort posts by date (descending - newest first)
 */
export function sortPostsByDate(posts: Post[]): Post[] {
  return sortEntriesByDate(posts);
}

/**
 * Group posts by year and sort descending within year
 */
export function getPostsByYearSorted(posts: Post[]): [string, Post[]][] {
  return getEntriesByYearSorted(posts);
}

/**
 * Get unique tags from posts
 */
export function getUniquePostTags(posts: Post[]): string[] {
  return getUniqueTags(posts);
}

/**
 * Filter posts by tag
 */
export function getPostsByTag(posts: Post[], tag: string): Post[] {
  return getEntriesByTag(posts, tag);
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(posts: Post[]): Post[] {
  return getFeaturedEntries(posts);
}

/**
 * Get adjacent posts with series awareness
 * For subposts: returns prev/next within series + parent
 * For parent/standalone: returns prev/next top-level posts
 */
export function getAdjacentPosts(
  posts: Post[],
  currentId: string
): {
  newer: Post | null;
  older: Post | null;
  parent: Post | null;
} {
  return getAdjacentEntriesWithSeries(posts, currentId);
}


/**
 * Get related posts based on tags
 */
export function getRelatedPosts(
  posts: Post[],
  currentPost: Post,
  limit: number = 3
): Post[] {
  return getRelatedEntries(posts, currentPost, limit);
}

/**
 * Search posts by title or description
 */
export function searchPosts(posts: Post[], query: string): Post[] {
  return searchEntries(posts, query);
}

/**
 * Paginate posts
 */
export function paginatePosts(
  posts: Post[],
  page: number,
  perPage: number
) {
  return paginateEntries(posts, page, perPage);
}

// ============================================================================
// SERIES & SUBPOSTS (Post-specific wrappers)
// ============================================================================

/**
 * Check if a post is a subpost
 */
export function isSubpost(postId: string): boolean {
  return isSubpostGeneric(postId);
}

/**
 * Get parent ID from post
 */
export function getParentId(postId: string): string {
  return getParentIdGeneric(postId);
}

/**
 * Get parent post
 */
export function getParentPost(
  posts: Post[],
  subpostId: string
): Post | null {
  return getParentEntry(posts, subpostId);
}

/**
 * Get all subposts for a parent series
 */
export function getSubpostsForParent(
  posts: Post[],
  parentId: string
): Post[] {
  return getSubpostsForParentGeneric(posts, parentId);
}

/**
 * Check if a post has subposts
 */
export function hasSubposts(
  posts: Post[],
  postId: string
): boolean {
  return hasSubpostsGeneric(posts, postId);
}

/**
 * Get subpost count for a parent
 */
export function getSubpostCount(
  posts: Post[],
  parentId: string
): number {
  return getSubpostCountGeneric(posts, parentId);
}

/**
 * Get all posts in a series (parent + subposts)
 */
export function getSeriesPosts(
  posts: Post[],
  parentId: string
): Post[] {
  return getSeriesEntries(posts, parentId);
}

/**
 * Get next post in series
 */
export function getNextInSeries(
  posts: Post[],
  currentPost: Post
): Post | null {
  return getNextInSeriesGeneric(posts, currentPost);
}

/**
 * Get previous post in series
 */
export function getPrevInSeries(
  posts: Post[],
  currentPost: Post
): Post | null {
  return getPrevInSeriesGeneric(posts, currentPost);
}

/**
 * Get only top-level posts (standalone + series parents)
 */
export function getTopLevelPosts(posts: Post[]): Post[] {
  return getTopLevelEntries(posts);
}

/**
 * Get series context for current post
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

  // Determine series ID and parent
  const seriesId = isCurrentSubpost ? getParentId(currentPost.id) : currentPost.id;
  const parentPost = isCurrentSubpost ? getParentPost(allPosts, currentPost.id) : currentPost;

  // Get series data
  const seriesPosts = getSeriesPosts(allPosts, seriesId);
  const prevInSeries = getPrevInSeries(allPosts, currentPost);
  const nextInSeries = getNextInSeries(allPosts, currentPost);

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