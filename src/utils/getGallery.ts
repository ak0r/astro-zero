import { resolveImage } from '@/utils/images';
import type { ImageMetadata } from "astro";
import type { Post } from '@/types';

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
    ? `/src/content/posts/${galleryDir}/`
    : `/src/content/posts/${galleryDir}/${normalizedDir}/`;
  
  // Get all images using import.meta.glob
  const images = import.meta.glob<{ default: ImageMetadata }>(
    '/src/content/posts/**/attachments/*.{jpg,jpeg,png,webp,gif}',
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
  gallery: Post,
  galleryDir?: string
): Promise<ImageMetadata | null> {
  const dir = galleryDir || extractGalleryDir(gallery.filePath);
  const imageDir = gallery.data.imageDir || './attachments';
  
  // If coverImage specified, resolve it first
  if (gallery.data.cover) {
    const resolved = resolveImage(gallery.data.cover);
    
    if (resolved?.kind === 'astro') {
      return resolved.image;
    }
  }
  
  // Fallback: return first image
  const images = await getGalleryImages(dir, imageDir);
  const resolved = resolveImage(images[0].path)
  return resolved || null;
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