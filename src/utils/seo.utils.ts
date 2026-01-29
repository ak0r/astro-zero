/**
 * SEO Utilities
 *
 * Factory pattern for generating SEO data across different content types.
 */
import type { CollectionEntry } from 'astro:content';
import type { SEOData, OpenGraphImage, ResolvedImage, Post } from '@/types';
import { siteConfig } from '@/site.config';
import { resolveImage } from './images';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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
 */
function buildTitle(pageTitle: string | null = null): string {
  if (!pageTitle) {
    return siteConfig.title;
  }
  if (pageTitle.includes(siteConfig.branding.logoText)) {
    return pageTitle;
  }
  return siteConfig.seoConfig.titleTemplate.replace('%s', pageTitle);
}

/**
 * Build Twitter card from SEO data
 */
function buildTwitterCard(
  title: string,
  description: string,
  imageUrl: string
): SEOData['twitter'] {
  return {
    card: 'summary_large_image',
    title,
    description,
    image: imageUrl,
    site: siteConfig.seoConfig.twitter?.site,
    creator: siteConfig.seoConfig.twitter?.creator,
  };
}

/**
 * Build base keywords array
 */
function buildKeywords(tags?: string[]): string[] {
  return tags
    ? [...tags, ...siteConfig.seoConfig.keywords]
    : siteConfig.seoConfig.keywords;
}

// =============================================================================
// OG IMAGE HELPERS
// =============================================================================

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
 * Generate OG image with fallback hierarchy for entries
 */
function generateEntryOGImage(
  entry: Post,
  imageAlt?: string
): OpenGraphImage {
  const isGallery = entry.data.category === 'gallery';
  const slug = entry.slug;

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
  const ogPath = isGallery
    ? `/og/gallery/${slug.replace(/^gallery\//, '')}.png`
    : `/og/posts/${slug}.png`;

  return {
    url: new URL(ogPath, siteConfig.siteURL).href,
    alt: imageAlt || entry.data.title,
    width: 1200,
    height: 630,
  };
}

// =============================================================================
// SEO FACTORY
// =============================================================================

/**
 * SEO Factory - generates SEO data for different content types
 */
export class SEOFactory {
  /**
   * Generate SEO for home page
   */
  static forHome(url: string): SEOData {
    const ogImage = getDefaultOGImage();
    const title = `${siteConfig.branding.tagline} | ${siteConfig.title}`;
    const description = siteConfig.description;

    return {
      title,
      description,
      canonical: url,
      ogImage,
      ogType: 'website',
      noIndex: false,
      keywords: siteConfig.seoConfig.keywords,
      author: siteConfig.seoConfig.author,
      twitter: buildTwitterCard(siteConfig.title, description, ogImage.url),
    };
  }

  /**
   * Generate SEO for blog post
   */
  static forPost(post: CollectionEntry<'posts'>, url: string): SEOData {
    const title = buildTitle(post.data.title);
    const description = post.data.description || siteConfig.description;
    const ogImage = generateEntryOGImage(post, post.data.coverAlt);

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
      keywords: buildKeywords(post.data.tags),
      author: siteConfig.seoConfig.author,
      articleSection: post.data.category,
      twitter: buildTwitterCard(title, description, ogImage.url),
    };
  }

  /**
   * Generate SEO for gallery
   */
  static forGallery(gallery: Post, url: string): SEOData {
    const title = buildTitle(gallery.data.title);
    const description = gallery.data.description ||
      (gallery.data.location
        ? `Photo gallery from ${gallery.data.location}`
        : siteConfig.seoConfig.sections.galleries.description);
    const ogImage = generateEntryOGImage(gallery, gallery.data.coverAlt);

    return {
      title,
      description,
      canonical: url,
      ogImage,
      ogType: 'article',
      publishedTime: gallery.data.date?.toISOString(),
      modifiedTime: gallery.data.lastUpdated?.toISOString(),
      noIndex: gallery.data.draft || false,
      keywords: buildKeywords(gallery.data.tags),
      author: siteConfig.seoConfig.author,
      twitter: buildTwitterCard(title, description, ogImage.url),
    };
  }

  /**
   * Generate SEO for static page
   */
  static forPage(page: CollectionEntry<'pages'>, url: string): SEOData {
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
      twitter: buildTwitterCard(title, description, ogImage.url),
    };
  }

  /**
   * Generate SEO for index/section pages
   */
  static forIndex(
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
      title = siteConfig.title;
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
      description = siteConfig.description;
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
      twitter: buildTwitterCard(title, description, ogImage.url),
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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

// =============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// =============================================================================

/** @deprecated Use SEOFactory.forHome() instead */
export const generateHomeSEO = SEOFactory.forHome;

/** @deprecated Use SEOFactory.forPost() instead */
export const generatePostSEO = SEOFactory.forPost;

/** @deprecated Use SEOFactory.forGallery() instead */
export const generateGallerySEO = SEOFactory.forGallery;

/** @deprecated Use SEOFactory.forPage() instead */
export const generatePageSEO = SEOFactory.forPage;

/** @deprecated Use SEOFactory.forIndex() instead */
export const generateIndexSEO = SEOFactory.forIndex;

/** @deprecated Use generateEntryOGImage() or getDefaultOGImage() instead */
export const generateOGImage = generateEntryOGImage;
