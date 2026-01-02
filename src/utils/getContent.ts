import { getCollection } from 'astro:content';
import type { Post, Page, Docs, Project } from '@/types';
import {
  filterDrafts,
  sortEntriesByDate,
  getEntriesByYearSorted,
  getUniqueTags,
  getEntriesByTag,
  getFeaturedEntries,
  getAdjacentEntries,
  getRelatedEntries,
  searchEntries,
  paginateEntries,
  isSubpost as isSubpostGeneric,
  isSeriesParent as isSeriesParentGeneric,
  getParentId as getParentIdGeneric,
  getParentEntry,
  getSubpostsForParent as getSubpostsForParentGeneric,
  getSeriesEntries,
  getNextInSeries as getNextInSeriesGeneric,
  getPrevInSeries as getPrevInSeriesGeneric,
  getTopLevelEntries,
  filterEntriesBy,
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
 * Get adjacent posts (prev/next)
 */
export function getAdjacentPosts(
  posts: Post[],
  currentSlug: string
): {
  prev: Post | null;
  next: Post | null;
} {
  return getAdjacentEntries(posts, currentSlug);
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
 * Check if a post is a series parent
 */
export function isSeriesParent(postId: string): boolean {
  return isSeriesParentGeneric(postId);
}

/**
 * Get parent ID from post
 */
export function getParentId(postId: string): string | null {
  return getParentIdGeneric(postId);
}

/**
 * Get parent post
 */
export function getParentPost(
  posts: Post[],
  currentPostId: string
): Post | null {
  return getParentEntry(posts, currentPostId);
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
 * Use this for main posts index to hide subposts
 */
export function getTopLevelPosts(posts: Post[]): Post[] {
  return getTopLevelEntries(posts);
}