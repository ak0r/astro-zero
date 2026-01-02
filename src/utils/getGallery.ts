import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import {
  filterDrafts,
  sortEntriesByDate,
  getUniqueTags,
  getTagCounts,
  getEntriesByTag,
  getFeaturedEntries,
} from '@/utils/entries';
import { getImagesInDirectory, resolveImage, stripObsidianBrackets } from '@/utils/images';

export type Gallery = CollectionEntry<'gallery'>;

/**
 * Gallery Utilities
 * Uses generic entries.ts functions + gallery-specific logic
 */

// ============================================================================
// CORE FUNCTIONS (Use Generic)
// ============================================================================

/**
 * Get all galleries (excluding drafts in production)
 */
export async function getAllGalleries(): Promise<Gallery[]> {
  const allGalleries = await getCollection('gallery');
  return filterDrafts(allGalleries);
}

/**
 * Sort galleries by date (newest first)
 */
export function sortGalleriesByDate(galleries: Gallery[]): Gallery[] {
  return sortEntriesByDate(galleries);
}

/**
 * Get featured galleries
 */
export function getFeaturedGalleries(galleries: Gallery[]): Gallery[] {
  return getFeaturedEntries(galleries);
}

/**
 * Get galleries by tag
 */
export function getGalleriesByTag(galleries: Gallery[], tag: string): Gallery[] {
  return getEntriesByTag(galleries, tag);
}

/**
 * Get all unique tags
 */
export function getUniqueGalleryTags(galleries: Gallery[]): string[] {
  return getUniqueTags(galleries);
}

/**
 * Get tag counts
 */
export function getGalleryTagCounts(galleries: Gallery[]): Record<string, number> {
  return getTagCounts(galleries);
}

// ============================================================================
// GALLERY-SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Get gallery images from attachments folder
 * Uses import.meta.glob for efficient scanning
 */

export function extractGalleryDir(filePath: string | undefined): string {
  if (!filePath) return '';
  
  // filePath format: "gallery/2024-12-vacation/index.md"
  const parts = filePath.split('/');
  // Return the directory name (second-to-last part)
  return parts[parts.length - 2] || '';
}


export async function getGalleryImages(
  galleryDir: string,
  imageDir: string = './attachments'
): Promise<GalleryImage[]> {
  // Normalize imageDir
  const normalizedDir = imageDir.replace(/^\.\//, '').replace(/\/$/, '');
  
  // Build search path
  const searchPath = normalizedDir === '.' || normalizedDir === ''
    ? `/src/content/gallery/${galleryDir}/`
    : `/src/content/gallery/${galleryDir}/${normalizedDir}/`;
  
  // Get all images using import.meta.glob
  const images = import.meta.glob<{ default: ImageMetadata }>(
    '/src/content/gallery/**/attachments/*.{jpg,jpeg,png,webp,gif}',
    { eager: true }
  );
  
  // Filter to only this gallery's images
  const galleryImages: GalleryImage[] = [];
  
  for (const [path, module] of Object.entries(images)) {
    if (path.startsWith(searchPath)) {
      const filename = path.split('/').pop() || '';
      galleryImages.push({
        path,
        filename,
        image: module.default,
      });
    }
  }
  
  // Randomize order
  return shuffleArray(galleryImages);
}

/**
 * Get image count for a gallery
 */
export async function getGalleryImageCount(
  galleryDir: string,
  imageDir: string = './attachments'
): Promise<number> {
  const images = await getGalleryImages(galleryDir, imageDir);
  return images.length;
}

/**
 * Get cover image for gallery card
 */
export async function getGalleryCoverImage(
  gallery: Gallery,
  galleryDir?: string
): Promise<GalleryImage | null> {
  const dir = galleryDir || extractGalleryDir(gallery.filePath);
  const imageDir = gallery.data.imageDir || './attachments';
  
  // If coverImage specified, resolve it first
  if (gallery.data.coverImage) {
    const resolved = resolveImage(gallery.data.coverImage);
    
    // If it's an Astro-optimized image, find it in the gallery images
    if (resolved?.kind === 'astro') {
      const images = await getGalleryImages(dir, imageDir);
      
      // Extract just the filename from the resolved path
      const resolvedFilename = resolved.image.src.split('/').pop()?.split('?')[0] || '';
      
      const coverImage = images.find(img => 
        img.filename.includes(resolvedFilename) || 
        img.image.src === resolved.image.src
      );
      
      if (coverImage) return coverImage;
    }
  }
  
  // Fallback: return first image
  const images = await getGalleryImages(dir, imageDir);
  return images[0] || null;
}
/**
 * Gallery statistics
 */
export async function getGalleryStats(galleries: Gallery[]) {
  let totalImages = 0;
  
  for (const gallery of galleries) {
    const count = await getGalleryImageCount(gallery.id);
    totalImages += count;
  }
  
  return {
    total: galleries.length,
    featured: getFeaturedGalleries(galleries).length,
    tags: getUniqueTags(galleries).length,
    totalImages,
  };
}

// ============================================================================
// TYPES
// ============================================================================

export interface GalleryImage {
  path: string;
  filename: string;
  image: ImageMetadata;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}