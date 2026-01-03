import { visit } from 'unist-util-visit';
import type { Root, Text, Link, Image } from 'mdast';

/**
 * Remark Obsidian Core Plugin
 * 
 * Consolidated plugin that handles Obsidian-specific markdown in ONE pass:
 * - Wikilinks [[Page]] and [[Page|Alias]]
 * - Image embeds ![[image.png]]
 * - Comments %%...%%
 * - Highlights ==text==
 * 
 * Replaces: remarkInternalLinks, remarkObsidianComments, remarkHighlight
 */

interface WikilinkMatch {
  isEmbed: boolean;
  content: string;
  alias?: string;
  fullMatch: string;
}

export function remarkObsidianCore() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      let { value } = node;
      const newNodes: any[] = [];
      let lastIndex = 0;

      // ====================================================================
      // REGEX PATTERNS
      // ====================================================================

      // Image embeds: ![[image.png]] or ![[image.png|alt text]]
      const imageEmbedRegex = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      
      // Regular wikilinks: [[Page]] or [[Page|Alias]]
      const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      
      // Comments: %%comment%%
      const commentRegex = /%%.*?%%/g;
      
      // Highlights: ==text==
      const highlightRegex = /==(.*?)==/g;

      // ====================================================================
      // PROCESS IMAGE EMBEDS FIRST
      // ====================================================================
      
      let match: RegExpExecArray | null;
      const imageMatches: Array<{ start: number; end: number; node: Image }> = [];

      // Find all image embeds
      while ((match = imageEmbedRegex.exec(value)) !== null) {
        const imagePath = match[1].trim();
        const altText = match[2]?.trim() || imagePath;
        
        // Create proper image node
        const imageNode: Image = {
          type: 'image',
          url: imagePath,
          alt: altText,
        };

        imageMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          node: imageNode,
        });
      }

      // ====================================================================
      // PROCESS WIKILINKS
      // ====================================================================

      const wikilinkMatches: Array<{ start: number; end: number; node: Link }> = [];

      // Reset regex
      wikilinkRegex.lastIndex = 0;

      while ((match = wikilinkRegex.exec(value)) !== null) {
        const targetPage = match[1].trim();
        const linkText = match[2]?.trim() || targetPage;

        // Check if this overlaps with an image embed
        const overlapsImage = imageMatches.some(
          (img) => match!.index >= img.start && match!.index < img.end
        );

        if (overlapsImage) continue;

        // Determine link type and URL
        let url: string;
        
        // Check for anchor links (same page)
        if (targetPage.startsWith('#')) {
          url = targetPage; // Keep as-is for same-page anchors
        } 
        // Check for cross-page anchor links
        else if (targetPage.includes('#')) {
          const [page, anchor] = targetPage.split('#');
          url = `/posts/${page}#${anchor}`;
        }
        // Regular page link
        else {
          url = `/posts/${targetPage}`;
        }

        // Create link node
        const linkNode: Link = {
          type: 'link',
          url,
          children: [{ type: 'text', value: linkText }],
        };

        wikilinkMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          node: linkNode,
        });
      }

      // ====================================================================
      // COMBINE AND SORT ALL MATCHES
      // ====================================================================

      const allMatches = [
        ...imageMatches.map(m => ({ ...m, type: 'image' as const })),
        ...wikilinkMatches.map(m => ({ ...m, type: 'link' as const })),
      ].sort((a, b) => a.start - b.start);

      // ====================================================================
      // BUILD NEW NODE ARRAY
      // ====================================================================

      if (allMatches.length === 0) {
        // No matches - check for comments and highlights
        value = processCommentsAndHighlights(value);
        
        if (value !== node.value) {
          node.value = value;
        }
        return;
      }

      // Process all matches
      for (const match of allMatches) {
        // Add text before match
        if (match.start > lastIndex) {
          let textBefore = value.slice(lastIndex, match.start);
          textBefore = processCommentsAndHighlights(textBefore);
          
          if (textBefore) {
            newNodes.push({ type: 'text', value: textBefore });
          }
        }

        // Add the match node
        newNodes.push(match.node);
        lastIndex = match.end;
      }

      // Add remaining text
      if (lastIndex < value.length) {
        let textAfter = value.slice(lastIndex);
        textAfter = processCommentsAndHighlights(textAfter);
        
        if (textAfter) {
          newNodes.push({ type: 'text', value: textAfter });
        }
      }

      // Replace node with new nodes
      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes);
        return index + newNodes.length;
      }
    });
  };
}

/**
 * Process comments and highlights in text
 */
function processCommentsAndHighlights(text: string): string {
  // Remove comments: %%...%%
  text = text.replace(/%%.*?%%/g, '');
  
  // Convert highlights: ==text== to <mark>text</mark>
  text = text.replace(/==(.*?)==/g, '<mark>$1</mark>');
  
  return text;
}

export default remarkObsidianCore;