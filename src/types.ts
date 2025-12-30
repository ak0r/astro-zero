import type { CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";

// ============================================================================
// COLLECTION TYPES
// ============================================================================

export type Post = CollectionEntry<"posts">;
export type PostData = CollectionEntry<"posts">["data"];
export type Page = CollectionEntry<"pages">;
export type PageData = CollectionEntry<"pages">["data"];
export type Project = CollectionEntry<"projects">;
export type ProjectData = CollectionEntry<"projects">["data"];
export type Docs = CollectionEntry<"docs">;
export type DocsData = CollectionEntry<"docs">["data"];

export const POST_CATEGORIES = ['travel', 'tech'] as const;
export type PostCategory = typeof POST_CATEGORIES[number];

// ============================================================================
// IMAGE TYPES
// ============================================================================

export type ResolvedImage =
  | { kind: 'astro'; image: ImageMetadata; source: 'post' | 'shared' }
  | { kind: 'static'; url: string; source?: 'attachments' }
  | { kind: 'remote'; url: string; source?: 'external' };

export interface ImageInfo {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface OpenGraphImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

// ============================================================================
// CONTENT TYPES
// ============================================================================

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface ReadingTime {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

export interface LinkedMention {
  title: string;
  slug: string;
  excerpt: string;
}

export interface WikilinkMatch {
  link: string;
  display: string;
  slug: string;
}

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextUrl?: string;
  prevUrl?: string;
}

// ============================================================================
// SEO
// ============================================================================

export type DateFormat = 'long' | 'short' | 'full' | 'monthDay';

export interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogImage?: OpenGraphImage;
  ogType: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noIndex?: boolean;
  robots?: string;
  articleSection?: string;
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  keywords?: string[];
}

// ============================================================================
// NAVIGATION & SOCIAL
// ============================================================================

export interface NavigationItem {
  title: string;
  url: string;
  external?: boolean;
  icon?: string;
}

export interface SocialLink {
  title: string;
  url: string;
  icon: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string; // Optional - last item typically has no href
}

// ============================================================================
// COMMAND PALETTE
// ============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action?: string;
}

export interface CommandPaletteItem {
  id: string;
  type: 'action' | 'navigation' | 'social' | 'search-result';
  label: string;
  description?: string;
  icon?: string;
  href?: string;
  badge?: string;
  action?: () => void;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  excerpt: string;
  url: string;
  collection: 'posts' | 'docs' | 'projects' | 'pages' | 'gallery';
}

export interface CommandPaletteConfig {
  enabled: boolean;
  search: {
    enabled: boolean;
    placeholder: string;
    enabledCollections: Array<'posts' | 'docs' | 'projects' | 'pages' | 'gallery'>;
  };
  quickActions: {
    enabled: boolean;
    actions: QuickAction[];
  };
  navigation: {
    enabled: boolean;
    links: NavigationItem[]; // Uses shared NavigationItem type
  };
  social: {
    enabled: boolean;
    // Note: Uses siteConfig.navigation.social (array of SocialLink)
  };
}

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

// export type AspectRatio = 
//   | "16:9" 
//   | "4:3"
//   | "3:2"
//   | "og"
//   | "square"
//   | "golden"
//   | "custom";

export const ASPECT_RATIOS = ['16:9', '4:3', '3:2', '4:5', 'square'] as const;
export type AspectRatio = typeof ASPECT_RATIOS[number];


export interface SiteConfig {
  // Basic Info
  siteURL: string;
  title: string;
  description: string;
  author: string;
  language?: string;
  defaultOgImageAlt?: string;
  
  // Theme & UI
  defaultTheme: "light";
  availableThemes: ["light", "dark"];
  scrollToTop: boolean;
  
  // Profile Picture
  profilePicture: {
    enabled: boolean;
    image: string;
    alt: string;
    size: "sm" | "md" | "lg";
    url?: string;
    placement: "footer" | "header";
    style: "circle" | "square" | "none";
  };

  // Layout
  layout: {
    contentWidth: string;
  };

  // Navigation
  navigation: {
    pages: NavigationItem[]; // Changed from Array<{ title: string; url: string }>
    social: SocialLink[]; // Changed from Array<{ title: string; url: string; icon: string }>
  };

  // Command Palette
  commandPaletteConfig: CommandPaletteConfig;
  
  // Table of Contents
  tableOfContents: {
    enabled: boolean;
    depth: number;
  };

  // Footer
  footer: {
    enabled: boolean;
    content: string;
    showSocialIconsInFooter: boolean;
  };

  // Content Display
  contentDisplay: {
    dateFormat: DateFormat;
    showReadingTime: boolean;
    showPostIcons: boolean;
  };

  // Home Options
  homeOptions: {
    featuredPost: {
      enabled: boolean;
    };
    recentPosts: {
      enabled: boolean;
      count: number;
    };
    projects: {
      enabled: boolean;
      count: number;
    };
    docs: {
      enabled: boolean;
      count: number;
    };
  };

  // Post Options
  postOptions: {
    groupPostsByYear: boolean;
    readingTime: boolean;
    wordCount: boolean;
    tags: boolean;
    linkedMentions: boolean;
  };

  // Gallery Options
  galleryOptions: {
    gridColumns: {
      desktop: number; // Default: 2
      mobile: number;  // Default: 1
    };
    aspectRatio: AspectRatio;
    showLocation: boolean;
    showDate: boolean;
    lightbox: boolean;
  };

  // Feature Flags
  features: {
    galleries: boolean;
    featuredPosts: boolean;
    tags: boolean;
    rss: boolean;
    analytics: boolean;
  };
}