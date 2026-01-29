/**
 * Image Utilities
 *
 * Centralized image handling and resolution operations.
 */

import type { ImageMetadata } from 'astro';
import type { ImageInfo, OpenGraphImage, Post } from '@/types';
import { siteConfig } from '@/site.config';
import { stripObsidianBrackets } from './string.utils';

// ============================================================================
// TYPES
// ============================================================================

export type ResolvedImage = ImageMetadata | string | null;

export interface ResolvedImageInfo {
  kind: 'astro' | 'static' | 'remote';
  image?: ImageMetadata;
  url?: string;
  source?: 'post' | 'shared' | 'attachments' | 'external';
}

export interface GalleryImage {
  path: string;
  filename: string;
  image: ImageMetadata;
}

// ============================================================================
// IMAGE RESOLUTION
// ============================================================================

const imageExt = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

// All possible local images in content
const contentImages = import.meta.glob(
  '/src/content/**/*.{png,jpg,jpeg,webp,avif,gif,svg}',
  { eager: true, import: 'default' }
);

/**
 * Resolve an image path to ImageMetadata or URL
 */
export function resolveImage(raw: string | undefined): ResolvedImageInfo | null {
  if (!raw || typeof raw !== 'string') return null;

  const cleaned = stripObsidianBrackets(raw);

  // Remote URL
  if (/^https?:\/\//i.test(cleaned)) {
    return { kind: 'remote', url: cleaned, source: 'external' };
  }

  // Vault-absolute path
  const vaultPath = cleaned.replace(/^\/+/, '');
  const contentPath = `/src/content/${vaultPath}`;

  // If it's an image and exists under src/content, use Astro optimization
  if (imageExt.test(vaultPath) && contentPath in contentImages) {
    const image = contentImages[contentPath] as ImageMetadata;
    return {
      kind: 'astro',
      image,
      source: vaultPath.startsWith('attachments/') ? 'shared' : 'post',
    };
  }

  // For files in attachments folder
  if (vaultPath.startsWith('attachments/')) {
    return { kind: 'static', url: `/${vaultPath}`, source: 'attachments' };
  }

  // Fallback: treat as static
  return { kind: 'static', url: `/${vaultPath}` };
}

/**
 * Resolve image from path with context
 */
export function resolveImageFromPath(
  raw: string | undefined,
  opts?: { baseDir?: string }
): ResolvedImage {
  if (!raw || typeof raw !== 'string') return null;

  const cleaned = stripObsidianBrackets(raw).trim();
  if (!cleaned) return null;

  // External URLs
  if (/^(https?:)?\/\//i.test(cleaned)) {
    return cleaned;
  }

  // Resolve relative paths
  let resolvedPath = cleaned.replace(/^\/+/, '');

  if (resolvedPath.startsWith('./')) {
    if (!opts?.baseDir) {
      return `/${resolvedPath.slice(2)}`;
    }
    resolvedPath = `${opts.baseDir}/${resolvedPath.slice(2)}`;
  }

  // Astro content images
  if (imageExt.test(resolvedPath)) {
    const contentPath = `/src/content/${resolvedPath}`;
    if (contentPath in contentImages) {
      return contentImages[contentPath] as ImageMetadata;
    }
  }

  // Static public fallback
  return `/${resolvedPath}`;
}

/**
 * Get all images from a directory
 */
export function getImagesInDirectory(dirPath: string): ImageMetadata[] {
  const searchPath = `/src/content/${dirPath}`;
  const images: ImageMetadata[] = [];

  for (const [path, module] of Object.entries(contentImages)) {
    if (path.startsWith(searchPath)) {
      images.push(module as ImageMetadata);
    }
  }

  return images;
}

/**
 * Get cover image using resolveImage
 */
export function resolveCoverImage(imagePath: string | undefined): ResolvedImageInfo | null {
  return resolveImage(imagePath);
}

// ============================================================================
// GALLERY FUNCTIONS
// ============================================================================

/**
 * Extract gallery directory from file path
 */
export function extractGalleryDir(filePath: string | undefined): string {
  if (!filePath) return '';
  const parts = filePath.split('/');
  return parts[parts.length - 2] || '';
}

/**
 * Get gallery images from attachments folder
 */
export async function getGalleryImages(
  galleryDir: string,
  imageDir: string = './attachments'
): Promise<GalleryImage[]> {
  const normalizedDir = imageDir.replace(/^\.\//, '').replace(/\/$/, '');

  const searchPath =
    normalizedDir === '.' || normalizedDir === ''
      ? `/src/content/posts/${galleryDir}/`
      : `/src/content/posts/${galleryDir}/${normalizedDir}/`;

  const images = import.meta.glob<{ default: ImageMetadata }>(
    '/src/content/posts/**/attachments/*.{jpg,jpeg,png,webp,gif}',
    { eager: true }
  );

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

  if (gallery.data.cover) {
    const resolved = resolveImage(gallery.data.cover);
    if (resolved?.kind === 'astro' && resolved.image) {
      return resolved.image;
    }
  }

  const images = await getGalleryImages(dir, imageDir);
  if (images.length === 0) return null;

  const resolved = resolveImage(images[0].path);
  return resolved?.kind === 'astro' ? resolved.image || null : null;
}

// ============================================================================
// OG IMAGE HELPERS
// ============================================================================

/**
 * Convert ResolvedImageInfo to absolute URL for OG tags
 */
export function resolvedImageToUrl(resolved: ResolvedImageInfo): string {
  switch (resolved.kind) {
    case 'remote':
      return resolved.url || '/og-default.png';
    case 'astro':
      return resolved.image?.src || '/og-default.png';
    case 'static':
      return resolved.url || '/og-default.png';
    default:
      return '/og-default.png';
  }
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
