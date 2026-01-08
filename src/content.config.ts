import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { POST_CATEGORIES } from '@/types';
import { number } from 'astro:schema';

// Define schema for blog posts
const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().default('Untitled Post'),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    category: z.enum(POST_CATEGORIES).default("travel"),
    date: z.coerce.date().default(() => new Date()),
    lastUpdated: z.coerce.date().optional().nullable(),
    tags: z.array(z.string()).nullable().optional(),
    draft: z.boolean().optional().default(false),
    featured: z.boolean().optional().default(false),
    cover: z.any().nullable().optional().transform((val) => {
      // Handle various Obsidian syntax formats
      if (Array.isArray(val)) {
        // Handle array format from [[...]] syntax - take first element
        return val[0] || null;
      }
      if (typeof val === 'string') {
        // Handle string format - return as-is
        return val;
      }
      return null;
    }),
    coverAlt: z.string().nullable().optional(),
    order: z.number().optional(),
  }),
});

// Define schema for static pages
const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().nullable().optional(),
    lastUpdated: z.coerce.date().nullable().optional().default(() => new Date()),
    draft: z.boolean().optional(),
    cover: z.any().nullable().optional().transform((val) => {
      // Handle various Obsidian syntax formats
      if (Array.isArray(val)) {
        // Handle array format from [[...]] syntax - take first element
        return val[0] || null;
      }
      if (typeof val === 'string') {
        // Handle string format - return as-is
        return val;
      }
      return null;
    }),
    coverAlt: z.string().nullable().optional(),
    noIndex: z.boolean().optional(),
  }),
});

// Define schema for projects
/**
 * Projects Collection (Frontmatter-Only)
 * 
 * For project showcase with external links
 * No body content needed - just frontmatter data
 */
const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    projectUrl: z.string().url(), // External link to project
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['active', 'archived', 'wip']).default('active'),
    featured: z.boolean().default(false),
    repositoryUrl: z.string().url().optional(), // GitHub/GitLab link
    date: z.coerce.date().default(() => new Date()),
    draft: z.boolean().default(false),
  }),
});

// Define schema for gallery
const galleryCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string().default('Untitled Gallery'),
    slug: z.string().optional(),
    description: z.string().nullable().optional().default('No description provided'),
    category: z.enum(['gallery']).default('gallery'),
    date: z.coerce.date().default(() => new Date()),
    lastUpdated: z.coerce.date().optional().nullable(),
    imageDir: z.string().optional(),
    cover: z.string().default('cover.jpg'),
    coverAlt: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional().default([]),
    draft: z.boolean().optional().default(false),
    featured: z.boolean().optional().default(false),
  }),
});

// Export collections
export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
  projects: projectsCollection,
  gallery: galleryCollection,
};