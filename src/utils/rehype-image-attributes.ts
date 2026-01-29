import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to add loading attributes and optimize image paths in markdown content
 * Adds eager loading for markdown images and async decoding
 */
export function rehypeImageAttributes() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img') {
        const properties = node.properties || {};
        const src = (properties.src as string) || '';

        // Add loading="eager" if not already set
        if (!properties.loading) {
          properties.loading = 'eager';
        }
        
        // Add decoding="async" if not already set
        if (!properties.decoding) {
          properties.decoding = 'async';
        }
        
        // Ensure alt text is present
        if (!properties.alt) {
          properties.alt = '';
        }
      }
    });
  };
}

export default rehypeImageAttributes;