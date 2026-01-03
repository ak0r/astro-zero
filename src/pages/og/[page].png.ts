import { OGImageRoute } from 'astro-og-canvas';
import { siteConfig } from '@/site.config';

const pages = {
  'default': {
    title: siteConfig.title,
    description: siteConfig.description,
    author: siteConfig.author,
    bgGradient: [[24, 24, 27], [63, 63, 70]], // Dark gray
  },
  'posts': {
    title: 'Blog Posts',
    description: 'Travel stories and tech articles',
    author: siteConfig.author,
    bgGradient: [[163, 163, 163], [115, 115, 115]], // Gray
  },
  'galleries': {
    title: 'Photo Galleries',
    description: 'Photo collections from around the world',
    author: siteConfig.author,
    bgGradient: [[251, 115, 22], [234, 88, 12]], // Orange
  },
  'about': {
    title: 'About Me',
    description: 'Learn more about my journey',
    author: siteConfig.author,
    bgGradient: [[59, 130, 246], [37, 99, 235]], // Blue
  },
  'tags': {
    title: 'Tags',
    description: 'Browse posts by topic',
    author: siteConfig.author,
    bgGradient: [[163, 163, 163], [115, 115, 115]], // Gray
  },
};

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'page',
  pages,
  
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: page.bgGradient || [[24, 24, 27], [63, 63, 70]],
    border: { color: [251, 115, 22], width: 20, side: 'inline-start' },
    padding: 80,
    
    font: {
      title: {
        size: 72,
        weight: 'Bold',
        color: [255, 255, 255],
        lineHeight: 1.2,
        families: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      description: {
        size: 32,
        weight: 'Normal',
        color: [229, 231, 235],
        lineHeight: 1.4,
      },
    },
    
    fonts: [
      'https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/inter/latin-700-normal.ttf',
    ],
  }),
});