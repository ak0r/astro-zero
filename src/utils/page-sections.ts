import { getEntry, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

/**
 * Page Sections Utilities
 * Load optional content sections for special pages (home, 404)
 * 
 * Most pages use full content from [...id].astro
 * Only home and 404 need multiple optional sections
 */

// ============================================================================
// HELPER: Load Optional Section
// ============================================================================

/**
 * Load an optional page section
 * Returns null if file doesn't exist or is empty
 */
export async function getOptionalSection(id: string) {
  try {
    const entry = await getEntry('pages', id);
    
    // Skip if entry doesn't exist
    if (!entry) return null;
    
    // Skip if body is empty
    if (!entry.body?.trim()) return null;
    
    // Render and return
    const rendered = await render(entry);
    return {
      ...rendered,
      data: entry.data,
    };
  } catch (error) {
    // File doesn't exist - that's OK for optional sections
    return null;
  }
}

// ============================================================================
// HOME PAGE SECTIONS
// ============================================================================

/**
 * Load all optional sections for homepage
 * 
 * Expected files (all optional):
 * - src/content/pages/home-hero.md
 * - src/content/pages/home-intro.md
 * - src/content/pages/home-about.md
 * - src/content/pages/home-cta.md
 */
export async function getHomeContent() {
  const [hero, intro, about, cta] = await Promise.all([
    getOptionalSection('home-hero'),
    getOptionalSection('home-intro'),
    getOptionalSection('home-about'),
    getOptionalSection('home-cta'),
  ]);

  return {
    hero,   // Hero section (top)
    intro,  // Introduction text
    about,  // About section
    cta,    // Call to action
  };
}

// ============================================================================
// 404 PAGE SECTIONS
// ============================================================================

/**
 * Load optional sections for 404 page
 * 
 * Expected files (all optional):
 * - src/content/pages/404-message.md
 * - src/content/pages/404-suggestions.md
 */
export async function get404Content() {
  const [message, suggestions] = await Promise.all([
    getOptionalSection('404-message'),
    getOptionalSection('404-suggestions'),
  ]);

  return {
    message,      // Custom 404 message
    suggestions,  // Helpful suggestions/links
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check if a section has content
 */
export function hasContent(section: Awaited<ReturnType<typeof getOptionalSection>>): boolean {
  return section !== null;
}

/**
 * Get section title (from frontmatter or default)
 */
export function getSectionTitle(
  section: Awaited<ReturnType<typeof getOptionalSection>>,
  defaultTitle: string
): string {
  return section?.data?.title || defaultTitle;
}