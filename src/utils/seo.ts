import type { CollectionEntry } from 'astro:content';
import type { SEOData, OpenGraphImage, ResolvedImage, Post, Gallery } from '@/types';
import { siteConfig } from '@/site.config';
import { resolveImage } from './images';

/**
 * Strip Obsidian wikilink brackets from image paths
 */
function stripObsidianBrackets(imagePath: string): string {
  if (!imagePath) return imagePath;
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
      return resolved.image.src;
    case 'static':
      return resolved.url;
    default:
      return '/og-default.png';
  }
}

/**
 * Build page title with template
 * For homepage, returns main title as-is
 * For other pages, applies template: "Page Title | Amit K"
 */
function buildTitle(pageTitle: string | null = null): string {
  // If no page title provided, return site title (for homepage)
  if (!pageTitle) {
    return siteConfig.title;
  }
  
  // If page title already includes site branding, don't duplicate
  if (pageTitle.includes(siteConfig.branding.logoText)) {
    return pageTitle;
  }
  
  // Apply template: replace %s with page title
  return siteConfig.seoConfig.titleTemplate.replace('%s', pageTitle);
}

/**
 * Get default OG image
 */
export function getDefaultOGImage(): OpenGraphImage {
  return {
    url: new URL('/og/default.png', siteConfig.siteURL).href,
    alt: siteConfig.seoConfig.defaultOgImageAlt,
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
    alt: siteConfig.seoConfig.defaultOgImageAlt,
    width: 1200,
    height: 630,
  };
}

/**
 * Generate OG image with fallback hierarchy
 * Priority: 1. Cover image, 2. Generated OG, 3. Default
 */
export function generateOGImage(
  entry: Post | Gallery,
  imageAlt?: string
): OpenGraphImage {
  const collection = entry.collection;
  const slug = entry.id.replace(/\.(md|mdx)$/, '');
  
  // Priority 1: Manual cover image
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
  
  // Priority 2: Generated OG image
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
 * Generate SEO data for home page
 * Uses main site title and description
 */
export function generateHomeSEO(url: string): SEOData {
  const ogImage = getDefaultOGImage();
  
  return {
    title: siteConfig.title, // "Amit K | Tech, Travel & Everything In Between"
    description: siteConfig.description,
    canonical: url,
    ogImage,
    ogType: 'website',
    noIndex: false,
    keywords: siteConfig.seoConfig.keywords,
    author: siteConfig.seoConfig.author,
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
      image: ogImage.url,
      site: siteConfig.seoConfig.twitter?.site,
      creator: siteConfig.seoConfig.twitter?.creator,
    },
  };
}

/**
 * Generate SEO data for blog post
 */
export function generatePostSEO(
  post: CollectionEntry<'posts'>,
  url: string
): SEOData {
  const title = buildTitle(post.data.title);
  const description = post.data.description || siteConfig.description;
  const ogImage = generateOGImage(post, post.data.coverAlt);
  const category = post.data.category;

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'article',
    publishedTime: post.data.date?.toISOString(),
    modifiedTime: post.data.lastUpdated?.toISOString(),
    tags: post.data.tags,
    noIndex: post.data.draft || false,
    keywords: post.data.tags ? [...post.data.tags, ...siteConfig.seoConfig.keywords] : siteConfig.seoConfig.keywords,
    author: siteConfig.seoConfig.author,
    articleSection: category,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: ogImage.url,
      site: siteConfig.seoConfig.twitter?.site,
      creator: siteConfig.seoConfig.twitter?.creator,
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
  const title = buildTitle(gallery.data.title);
  const description = gallery.data.description || 
    (gallery.data.location 
      ? `Photo gallery from ${gallery.data.location}` 
      : siteConfig.seoConfig.sections.galleries.description);
  const ogImage = generateOGImage(gallery, gallery.data.coverAlt);

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'article',
    publishedTime: gallery.data.date?.toISOString(),
    modifiedTime: gallery.data.lastUpdated?.toISOString(),
    noIndex: gallery.data.draft || false,
    keywords: gallery.data.tags ? [...gallery.data.tags, ...siteConfig.seoConfig.keywords] : siteConfig.seoConfig.keywords,
    author: siteConfig.seoConfig.author,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: ogImage.url,
      site: siteConfig.seoConfig.twitter?.site,
      creator: siteConfig.seoConfig.twitter?.creator,
    },
  };
}

/**
 * Generate SEO data for index/section pages
 * Combines section title with site branding using template
 */
export function generateIndexSEO(
  type: 'home' | 'posts' | 'galleries' | 'about' | 'tags',
  url: string,
  options?: {
    tag?: string;
    page?: number;
    customTitle?: string;
    customDescription?: string;
  }
): SEOData {
  const { tag, page, customTitle, customDescription } = options || {};
  
  // Build title
  let title: string;
  if (type === 'home') {
    title = siteConfig.title; // Full site title for homepage
  } else if (customTitle) {
    title = buildTitle(customTitle);
  } else if (tag) {
    title = buildTitle(`Posts tagged "${tag}"`);
  } else {
    const section = siteConfig.seoConfig.sections[type];
    title = buildTitle(section?.title || type);
  }
  
  // Add page number if applicable
  if (page && page > 1) {
    title = `${title} - Page ${page}`;
  }
  
  // Build description
  let description: string;
  if (type === 'home') {
    description = siteConfig.description; // Main site description for homepage
  } else if (customDescription) {
    description = customDescription;
  } else if (tag) {
    description = `Browse all content tagged with ${tag}`;
  } else {
    const section = siteConfig.seoConfig.sections[type];
    description = section?.description || siteConfig.description;
  }
  
  // Add page number to description if applicable
  if (page && page > 1) {
    description = `${description} - Page ${page}`;
  }
  
  // Get appropriate OG image
  const ogImage = type === 'home' 
    ? getDefaultOGImage() 
    : getPageOGImage(type);

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'website',
    noIndex: false,
    keywords: tag ? [tag, ...siteConfig.seoConfig.keywords] : siteConfig.seoConfig.keywords,
    author: siteConfig.seoConfig.author,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: ogImage.url,
      site: siteConfig.seoConfig.twitter?.site,
      creator: siteConfig.seoConfig.twitter?.creator,
    },
  };
}

/**
 * Generate SEO data for static pages
 */
export function generatePageSEO(
  page: CollectionEntry<'pages'>,
  url: string
): SEOData {
  const title = page.data.title === siteConfig.title 
    ? siteConfig.title 
    : buildTitle(page.data.title);
  const description = page.data.description || siteConfig.description;
  const ogImage = getDefaultOGImage();

  return {
    title,
    description,
    canonical: url,
    ogImage,
    ogType: 'website',
    noIndex: page.data.noindex || false,
    keywords: siteConfig.seoConfig.keywords,
    author: siteConfig.seoConfig.author,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: ogImage.url,
      site: siteConfig.seoConfig.twitter?.site,
      creator: siteConfig.seoConfig.twitter?.creator,
    },
  };
}


/**
 * Generate robots meta content
 */
export function generateRobotsMeta(noIndex?: boolean): string {
  return noIndex ? 'noindex, nofollow' : 'index, follow';
}

/**
 * Format date for schema.org
 */
export function formatSchemaDate(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}