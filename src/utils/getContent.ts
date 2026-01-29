/**
 * Content Collection Utilities
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from @/utils/content.utils instead.
 */

// Re-export all content utilities
export {
  // Async functions
  getAllContent,
  getAllPosts,
  getPosts,
  getGalleries,
  // Filtering
  filterByCategory,
  getCategoryCounts,
  filterDrafts,
  filterEntriesBy,
  getFeaturedEntries,
  // Sorting
  sortPostsByDate,
  sortEntriesByDate,
  // Grouping
  getEntriesByYearSorted,
  groupEntriesBy,
  // Tags
  getUniqueTags,
  getEntriesByTag,
  getTagCounts,
  // Series
  isSubpost,
  getParentId,
  getTopLevelPosts,
  getTopLevelEntries,
  getSubpostsForParent,
  hasSubposts,
  getParentEntry,
  getSeriesEntries,
  getSeriesContext,
  // Navigation
  getAdjacentPosts,
  getAdjacentEntriesWithSeries,
  getRelatedEntries,
  // Category helpers
  isGallery,
  isTravel,
  isTech,
} from './content.utils';

// Re-export from entries for additional functions
export {
  searchEntries,
  paginateEntries,
  getSubpostCount,
  getNextInSeries,
  getPrevInSeries,
} from './entries';

// Additional exports for backward compatibility
import { siteConfig, type PostCategory, POST_CATEGORIES } from '@/site.config';
import type { Post } from '@/types';
import {
  filterByCategory,
  getUniqueTags,
  getEntriesByYearSorted,
  getEntriesByTag,
  getFeaturedEntries,
  getRelatedEntries,
  getParentEntry,
  getSeriesEntries,
} from './content.utils';
import { searchEntries, paginateEntries } from './entries';

/**
 * Filter posts by multiple categories
 */
export function filterByCategories(
  posts: Post[],
  categories: PostCategory[]
): Post[] {
  return posts.filter((p) => categories.includes(p.data.category as PostCategory));
}

/**
 * Group posts by category
 */
export function groupByCategory(posts: Post[]): Record<PostCategory, Post[]> {
  return posts.reduce((acc, post) => {
    const category = post.data.category as PostCategory;
    if (!acc[category]) acc[category] = [];
    acc[category].push(post);
    return acc;
  }, {} as Record<PostCategory, Post[]>);
}

/**
 * Get unique tags by category
 */
export function getUniqueTagsByCategory(
  posts: Post[],
  category: PostCategory
): string[] {
  const categoryPosts = filterByCategory(posts, category);
  return getUniqueTags(categoryPosts);
}

/**
 * Alias for getEntriesByYearSorted
 */
export function getPostsByYearSorted(posts: Post[]): [string, Post[]][] {
  return getEntriesByYearSorted(posts);
}

/**
 * Get unique post tags
 */
export function getUniquePostTags(posts: Post[]): string[] {
  return getUniqueTags(posts);
}

/**
 * Get posts by tag
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
 * Get related posts
 */
export function getRelatedPosts(
  posts: Post[],
  currentPost: Post,
  limit: number = 3
): Post[] {
  return getRelatedEntries(posts, currentPost, limit);
}

/**
 * Search posts
 */
export function searchPosts(posts: Post[], query: string): Post[] {
  return searchEntries(posts, query);
}

/**
 * Paginate posts
 */
export function paginatePosts(posts: Post[], page: number, perPage: number) {
  return paginateEntries(posts, page, perPage);
}

/**
 * Get parent post
 */
export function getParentPost(posts: Post[], subpostId: string): Post | null {
  return getParentEntry(posts, subpostId);
}

/**
 * Get series posts
 */
export function getSeriesPosts(posts: Post[], parentId: string): Post[] {
  return getSeriesEntries(posts, parentId);
}

/**
 * Get category configuration
 */
export function getCategoryConfig(category: PostCategory) {
  return siteConfig.categories[category];
}

/**
 * Get categories for navigation
 */
export function getNavCategories() {
  return POST_CATEGORIES.filter((cat) => siteConfig.categories[cat].showInNav);
}

/**
 * Get category color
 */
export function getCategoryColor(category: PostCategory): string {
  return siteConfig.categories[category].color || '#6b7280';
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: PostCategory): string | undefined {
  return siteConfig.categories[category].icon;
}
