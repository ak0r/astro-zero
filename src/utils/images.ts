/**
 * Image Utilities
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from @/utils/image.utils instead.
 */

// Re-export all image utilities
export {
  resolveImage,
  resolveImageFromPath,
  getImagesInDirectory,
  resolveCoverImage,
  extractGalleryDir,
  getGalleryImages,
  getGalleryImageCount,
  getGalleryCoverImage,
  resolvedImageToUrl,
  type ResolvedImage,
  type ResolvedImageInfo,
  type GalleryImage,
} from './image.utils';

// Re-export string utility for backward compatibility
export { stripObsidianBrackets } from './string.utils';
