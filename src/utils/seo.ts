import type { CollectionEntry } from 'astro:content';
import type { SEOData, OpenGraphImage, ResolvedImage, Post } from '@/types';
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
  const description = post.data.description || siteConfig.description;
  const ogImage = generateOGImage(post, post.data.coverAlt);

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'article',
    publishedTime: post.data.date?.toISOString(),
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
 * Generate SEO data for gallery
 */
export function generateGallerySEO(
  gallery: CollectionEntry<'gallery'>,
  url: string
): SEOData {
  const title = `${gallery.data.title} | ${siteConfig.title}`;
  const description = gallery.data.description || 
    (gallery.data.location ? `Photo gallery from ${gallery.data.location}` : siteConfig.description);
  const ogImage = generateOGImage(gallery, gallery.data.coverAlt);

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'article',
    publishedTime: gallery.data.date?.toISOString(),
    noIndex: gallery.data.draft || false,
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
  const ogImage = generateOGImage(page.data.image, page.data.imageAlt);

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
  type: 'home' | 'posts' | 'tags' | 'docs' | 'galleries' | 'about',
  url: string,
  options?: {
    tag?: string;
    page?: number;
    customTitle?: string;
    customDescription?: string;
  }
): SEOData {
  const { tag, page, customTitle, customDescription } = options || {};
  
  const baseConfig = {
    home: {
      title: `${siteConfig.title}`,
      description: `${siteConfig.description}`,
      ogPage: 'default' as const,
    },
    posts: {
      title: 'Posts',
      description: `Browse all blog posts on ${siteConfig.title}`,
      ogPage: 'posts' as const,
    },
    galleries: {
      title: 'Photo Galleries',
      description: `Browse photo galleries on ${siteConfig.title}`,
      ogPage: 'galleries' as const,
    },
    tags: {
      title: tag ? `Posts tagged "${tag}"` : 'Tags',
      description: tag 
        ? `Browse all posts tagged with ${tag}`
        : `Browse posts by tags`,
      ogPage: 'tags' as const,
    },
    docs: {
      title: 'Documentation',
      description: `Browse documentation`,
      ogPage: 'default' as const,
    },
    about: {
      title: 'About',
      description: siteConfig.description,
      ogPage: 'about' as const,
    },
  };

  const config = baseConfig[type];
  
  let title = customTitle || config.title;
  if (page && page > 1) {
    title = `${title} - Page ${page}`;
  }
  title = `${title} | ${siteConfig.title}`;

  let description = customDescription || config.description;
  if (page && page > 1) {
    description = `${description} - Page ${page}`;
  }

  return {
    title,
    description,
    canonical: url,
    ogImage: getPageOGImage(config.ogPage), // ← Always use default for index pages
    ogType: 'website',
    noIndex: false,
    keywords: tag ? [tag] : undefined,
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


/**
 * Process image for OG tags with fallback hierarchy
 */
export function generateOGImage(
  entry: Post | Gallery,
  imageAlt?: string
): OpenGraphImage {
  const collection = entry.collection;
  const slug = entry.id.replace(/\.(md|mdx)$/, '');
  
  // Priority 1: Manual cover image (if exists and suitable)
  if (entry.data.cover) {
    const coverPath = Array.isArray(entry.data.cover) 
      ? entry.data.cover[0] 
      : entry.data.cover;
    
    const strippedPath = stripObsidianBrackets(coverPath);
    const resolvedImage = resolveImage(strippedPath);
    
    if (resolvedImage) {
      const imageUrl = resolvedImageToUrl(resolvedImage);
      const absoluteUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : new URL(imageUrl, siteConfig.siteURL).href;
      
      return {
        url: absoluteUrl,
        alt: imageAlt || entry.data.coverAlt || entry.data.title,
        width: 1200,
        height: 630,
      };
    }
  }
  
  // Priority 2: Generated OG image via astro-og-canvas
  const ogPath = collection === 'gallery' 
    ? `/og/galleries/${slug}.png`
    : `/og/posts/${slug}.png`;
  
  return {
    url: new URL(ogPath, siteConfig.siteURL).href,
    alt: imageAlt || entry.data.title,
    width: 1200,
    height: 630,
  };
}

/**
 * Get default OG image
 */
export function getDefaultOGImage(): OpenGraphImage {
  return {
    url: new URL('/og/default.png', siteConfig.siteURL).href,
    alt: siteConfig.defaultOgImageAlt || siteConfig.title,
    width: 1200,
    height: 630,
  };
}

/**
 * Get OG image for specific page type
 */
export function getPageOGImage(
  page: 'default' | 'posts' | 'galleries' | 'about' | 'tags'
): OpenGraphImage {
  return {
    url: new URL(`/og/${page}.png`, siteConfig.siteURL).href,
    alt: siteConfig.defaultOgImageAlt || siteConfig.title,
    width: 1200,
    height: 630,
  };
}