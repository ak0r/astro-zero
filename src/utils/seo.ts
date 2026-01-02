import type { CollectionEntry } from 'astro:content';
import type { SEOData, OpenGraphImage, ResolvedImage } from '@/types';
import { siteConfig } from '@/site.config';
import { resolveImage } from './images';

/**
 * Strip Obsidian wikilink brackets from image paths
 */
function stripObsidianBrackets(imagePath: string): string {
  if (!imagePath) return imagePath;
  
  // Remove double brackets if present: [[image.png]] -> image.png
  if (imagePath.startsWith('[[') && imagePath.endsWith(']]')) {
    return imagePath.slice(2, -2);
  }
  
  return imagePath;
}

/**
 * Get default OG image
 */
export function getDefaultOGImage(): OpenGraphImage {
  return {
    url: new URL('/og-image.png', siteConfig.siteURL).href,
    alt: siteConfig.defaultOgImageAlt || siteConfig.title,
    width: 1200,
    height: 630,
  };
}

/**
 * Convert ResolvedImage to absolute URL for OG tags
 */
function resolvedImageToUrl(resolved: ResolvedImage): string {
  switch (resolved.kind) {
    case 'remote':
      return resolved.url;
    case 'astro':
      // Astro ImageMetadata has a src property
      return resolved.image.src;
    case 'static':
      return resolved.url;
    default:
      return '/og-image.png'; // Fallback
  }
}

/**
 * Process image for OG tags
 */
export function processOGImage(image: string | string[] | undefined, imageAlt?: string): OpenGraphImage {
  if (!image) {
    return getDefaultOGImage();
  }

  // Handle array of images
  let imagePath = Array.isArray(image) ? image[0] : image;
  
  // Strip Obsidian wikilink brackets: [[/posts/attachments/img.png]] -> /posts/attachments/img.png
  imagePath = stripObsidianBrackets(imagePath);
  
  // Resolve image path (returns ResolvedImage object)
  const resolvedImage = resolveImage(imagePath);
  
  // Handle null/undefined result
  if (!resolvedImage) {
    return getDefaultOGImage();
  }

  // Convert ResolvedImage to URL string
  const imageUrl = resolvedImageToUrl(resolvedImage);

  // Make absolute URL for OG tags (required by social platforms)
  const absoluteUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : new URL(imageUrl, siteConfig.siteURL).href;

  return {
    url: absoluteUrl,
    alt: imageAlt || siteConfig.defaultOgImageAlt || siteConfig.title,
    width: 1200,
    height: 630,
  };
}

/**
 * Generate SEO data for home page
 */
export function generateHomeSEO(url: string): SEOData {
  return {
    title: siteConfig.title,
    description: siteConfig.description,
    canonical: url,
    ogImage: getDefaultOGImage(),
    ogType: 'website',
    noIndex: false,
  };
}

/**
 * Generate SEO data for blog post
 */
export function generatePostSEO(
  post: CollectionEntry<'posts'>,
  url: string
): SEOData {
  const title = `${post.data.title} | ${siteConfig.title}`;
  const description = post.data.description || post.data.excerpt || siteConfig.description;
  const ogImage = processOGImage(post.data.image, post.data.imageAlt);

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'article',
    publishedTime: post.data.date?.toISOString(),
    modifiedTime: post.data.updated?.toISOString(),
    tags: post.data.tags,
    noIndex: post.data.draft || false,
    keywords: post.data.tags,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: ogImage.url,
    },
  };
}

/**
 * Generate SEO data for page
 */
export function generatePageSEO(
  page: CollectionEntry<'pages'>,
  url: string
): SEOData {
  const title = page.data.title === siteConfig.title 
    ? siteConfig.title 
    : `${page.data.title} | ${siteConfig.title}`;
  const description = page.data.description || siteConfig.description;
  const ogImage = processOGImage(page.data.image, page.data.imageAlt);

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'website',
    noIndex: page.data.noindex || false,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: ogImage.url,
    },
  };
}

/**
 * Generate SEO data for index/archive pages
 * Handles posts index, tag archives, docs index, etc.
 */
export function generateIndexSEO(
  type: 'posts' | 'tags' | 'docs',
  url: string,
  options?: {
    tag?: string;
    page?: number;
    customTitle?: string;
    customDescription?: string;
  }
): SEOData {
  const { tag, page, customTitle, customDescription } = options || {};
  
  // Base titles and descriptions for each type
  const baseConfig = {
    posts: {
      title: 'Posts',
      description: `Browse all blog posts on ${siteConfig.title}`,
    },
    tags: {
      title: tag ? `Posts tagged "${tag}"` : 'Tags',
      description: tag 
        ? `Browse all posts tagged with ${tag} on ${siteConfig.title}`
        : `Browse posts by tags on ${siteConfig.title}`,
    },
    docs: {
      title: 'Documentation',
      description: `Browse documentation on ${siteConfig.title}`,
    },
  };

  const config = baseConfig[type];
  
  // Build title with pagination
  let title = customTitle || config.title;
  if (page && page > 1) {
    title = `${title} - Page ${page}`;
  }
  title = `${title} | ${siteConfig.title}`;

  // Build description with pagination
  let description = customDescription || config.description;
  if (page && page > 1) {
    description = `${description} - Page ${page}`;
  }

  // Keywords for tag pages
  const keywords = tag ? [tag] : undefined;

  return {
    title,
    description,
    canonical: url,
    ogImage: getDefaultOGImage(),
    ogType: 'website',
    noIndex: false,
    keywords,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: getDefaultOGImage().url,
    },
  };
}

/**
 * Generate SEO data for docs
 */
export function generateDocSEO(
  doc: CollectionEntry<'docs'>,
  url: string
): SEOData {
  const title = `${doc.data.title} | Docs | ${siteConfig.title}`;
  const description = doc.data.description || siteConfig.description;
  const ogImage = processOGImage(doc.data.image, doc.data.imageAlt);

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'article',
    noIndex: doc.data.noindex || false,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: ogImage.url,
    },
  };
}

/**
 * Generate robots meta content
 */
export function generateRobotsMeta(noIndex?: boolean): string {
  if (noIndex) {
    return 'noindex, nofollow';
  }
  return 'index, follow';
}

/**
 * Format date for schema.org
 */
export function formatSchemaDate(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}