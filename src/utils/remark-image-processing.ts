import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Image, Paragraph } from 'mdast';

/**
 * Consolidated Image Processing Plugin
 * Handles: Image path resolution, Image grids, Captions
 * Converts absolute Obsidian paths to relative paths for Astro's native optimization
 */

// ============================================================================
// IMAGE PATH RESOLUTION
// ============================================================================

function resolveImagePaths(tree: Root, file: any) {
  visit(tree, 'image', (node: Image) => {
    if (!node.url || node.url.startsWith('http')) {
      return;
    }

    // Skip non-image files (handled by embeds plugin)
    const urlLower = node.url.toLowerCase();
    const nonImageExtensions = [
      '.mp3', '.wav', '.ogg', '.m4a', '.3gp', '.flac', '.aac',
      '.mp4', '.webm', '.ogv', '.mov', '.mkv', '.avi',
      '.pdf'
    ];
    if (nonImageExtensions.some(ext => urlLower.endsWith(ext))) {
      return;
    }

    let collection: string | null = null;
    let contentSlug: string | null = null;
    let isFolderBased = false;

    // Detect collection and slug from file path
    if (file.path) {
      const normalizedPath = file.path.replace(/\\/g, '/');
      const pathParts = normalizedPath.split('/');

      if (normalizedPath.includes('/posts/')) {
        collection = 'posts';
        const postsIndex = pathParts.indexOf('posts');
        isFolderBased = normalizedPath.endsWith('/index.md');
        contentSlug = isFolderBased ? pathParts[postsIndex + 1] : null;
      } else if (normalizedPath.includes('/projects/')) {
        collection = 'projects';
        const projectsIndex = pathParts.indexOf('projects');
        isFolderBased = normalizedPath.endsWith('/index.md');
        contentSlug = isFolderBased ? pathParts[projectsIndex + 1] : null;
      } else if (normalizedPath.includes('/docs/')) {
        collection = 'docs';
        const docsIndex = pathParts.indexOf('docs');
        isFolderBased = normalizedPath.endsWith('/index.md');
        contentSlug = isFolderBased ? pathParts[docsIndex + 1] : null;
      } else if (normalizedPath.includes('/pages/')) {
        collection = 'pages';
        const pagesIndex = pathParts.indexOf('pages');
        isFolderBased = normalizedPath.endsWith('/index.md');
        contentSlug = isFolderBased ? pathParts[pagesIndex + 1] : null;
      } else if (normalizedPath.includes('/gallery/')) {
        collection = 'gallery';
        const galleryIndex = pathParts.indexOf('galleries');
        isFolderBased = normalizedPath.endsWith('/index.md');
        contentSlug = isFolderBased ? pathParts[galleryIndex + 1] : null;
      } else if (normalizedPath.includes('/special/')) {
        collection = 'pages';
        const specialIndex = pathParts.indexOf('special');
        isFolderBased = normalizedPath.endsWith('/index.md');
        contentSlug = isFolderBased ? pathParts[specialIndex + 1] : null;
      }
    }

    let imagePath = node.url;

    // Remove ./ prefix if present for processing
    if (imagePath.startsWith('./')) {
      imagePath = imagePath.slice(2);
    }

    if (!collection && imagePath.startsWith('attachments/')) {
      collection = 'pages';
    }

    if (!collection) return;

    // 1. Already has relative prefix (./ or ../)
    if (node.url.startsWith('./') || node.url.startsWith('../')) {
      // Keep as-is, Astro will handle it
      return;
    }

    // 2. Relative path without ./ prefix → add ./

    if (imagePath.startsWith('attachments/') || imagePath.startsWith('images/')) {
      node.url = `./${imagePath}`;
      return;
    }

    // 3. Absolute vault paths (from Obsidian) → convert to relative
    if (imagePath.startsWith(`${collection}/`)) {
      // Folder-based
      if (isFolderBased && contentSlug && imagePath.startsWith(`${collection}/${contentSlug}/`)) {
        node.url = `./${imagePath.replace(`${collection}/${contentSlug}/`, '')}`;
        return;
      }
      
      // Single-file
      if (imagePath.startsWith(`${collection}/attachments/`)) {
        node.url = `./${imagePath.replace(`${collection}/`, '')}`;
        return;
      }
    }

    // Edge case: bare filename (if needed)
    if (!imagePath.includes('/')) {
      node.url = `./attachments/${imagePath}`;
      return;
    }
    
  });
}

// ============================================================================
// IMAGE CAPTIONS (Title → Caption)
// ============================================================================

function processImageCaptions(tree: Root) {
  visit(tree, 'image', (node: Image) => {
    if (node.title) {
      if (!node.data) {
        node.data = {};
      }
      if (!node.data.hProperties) {
        node.data.hProperties = {};
      }
      (node.data.hProperties as any)['data-caption'] = node.title;
      (node.data.hProperties as any).title = node.title;
    }
  });
}

// ============================================================================
// IMAGE GRIDS (Consecutive images → Grid layout)
// ============================================================================

function processImageGrids(tree: Root) {
  visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
    if (!node.children || node.children.length === 0) return;

    const images: Image[] = [];
    const otherNodes: any[] = [];

    node.children.forEach((child) => {
      if (child.type === 'image') {
        images.push(child as Image);
      } else if (
        child.type === 'link' &&
        child.children &&
        child.children.some((linkChild: any) => linkChild.type === 'image')
      ) {
        // Skip linked images
        otherNodes.push(child);
      } else if (
        child.type !== 'text' ||
        (child as any).value.trim() !== ''
      ) {
        otherNodes.push(child);
      }
    });

    // Only process paragraphs with 2+ images and no other content
    if (images.length >= 2 && otherNodes.length === 0) {
      if (!node.data) {
        node.data = {};
      }
      if (!node.data.hProperties) {
        node.data.hProperties = {};
      }

      const hProperties = node.data.hProperties as Record<string, any>;
      const existingClasses = (hProperties.class || '')
        .split(' ')
        .filter(Boolean);
      const filteredClasses = existingClasses.filter(
        (cls: string) => !cls.startsWith('image-grid')
      );

      const gridClass = `image-grid-${Math.min(images.length, 6)}`;
      const newClasses = [...filteredClasses, 'image-grid', gridClass];

      hProperties.class = newClasses.join(' ');
    }
  });
}

// ============================================================================
// MAIN PLUGIN
// ============================================================================

export const remarkImageProcessing: Plugin<[], Root> = () => {
  return (tree, file) => {
    // Process in order
    resolveImagePaths(tree, file);
    processImageCaptions(tree);
    processImageGrids(tree);
  };
};

export default remarkImageProcessing;