// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import expressiveCode from "astro-expressive-code";

import remarkObsidianCore from './src/utils/remark-obsidian-core.ts';
import remarkImageProcessing from './src/utils/remark-image-processing.ts';
import { remarkInternalLinks } from './src/utils/internallinks.ts';
import remarkCallouts from './src/utils/remark-callouts.ts';
import remarkInlineTags from './src/utils/remark-inline-tags.ts';
import { remarkObsidianEmbeds } from './src/utils/remark-obsidian-embeds.ts';
import remarkBases from './src/utils/remark-bases.ts';

import rehypeImageAttributes from './src/utils/rehype-image-attributes.ts';
import { rehypeNormalizeAnchors } from './src/utils/rehype-normalize-anchors.ts';

import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import remarkBreaks from 'remark-breaks';


// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  image: {
    responsiveStyles: true,
    layout: "constrained"
  },

  experimental: {
    contentIntellisense: true,
    fonts: [
      {
        name: "Lora",
        cssVariable: "--font-headings",
        provider: fontProviders.fontsource(),
        weights: [400, 500, 600, 700],
        fallbacks: ["sans-serif"],
      },
      {
        name: "Rubik",
        cssVariable: "--font-secondary",
        provider: fontProviders.fontsource(),
        weights: [400, 500, 600, 700],
        fallbacks: ["sans-serif"],
      },
      {
        name: "Inter",
        cssVariable: "--font-primary",
        provider: fontProviders.fontsource(),
        weights: [400, 500, 600, 700],
        fallbacks: ["sans-serif"],
      },
      {
        name: "JetBrains Mono",
        cssVariable: "--font-code",
        provider: fontProviders.fontsource(),
        weights: [400, 500, 600, 700],
        fallbacks: ["monospace"],
      },
    ]
  },

  integrations: [ 
    icon(), 
    expressiveCode({
      themes: ['everforest-light', 'everforest-dark'],
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [
      remarkInternalLinks,
      remarkObsidianCore,
      remarkInlineTags,
      remarkImageProcessing,
      remarkObsidianEmbeds,
      remarkBases,
      remarkCallouts,
      remarkGfm,
      remarkSmartypants,
      remarkBreaks,
    ],
    rehypePlugins: [
      rehypeImageAttributes,
      rehypeNormalizeAnchors, 
    ]
  }
});