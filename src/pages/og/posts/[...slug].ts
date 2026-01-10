import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { siteConfig } from '@/site.config';
import { getAllPosts, sortPostsByDate, } from '@/utils/getContent';

const posts = await getAllPosts();

const pages = Object.fromEntries(
  posts.map((post) => {
    const slug = post.id.replace(/\.(md|mdx)$/, '');
    return [
      slug,
      {
        title: post.data.title,
        description: post.data.description || '',
        author: siteConfig.author, // Fallback to site author
        category: post.data.category,
        date: post.data.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      },
    ];
  })
);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'slug',
  pages,
  
  getImageOptions: (_path, page) => {
    const bgGradient: [[number, number, number], [number, number, number]] = 
      page.category === 'travel'
        ? [[251, 115, 22], [234, 88, 12]]   // Orange (travel)
        : page.category === 'tech'
        ? [[59, 130, 246], [37, 99, 235]]   // Blue (tech)
        : [[163, 163, 163], [115, 115, 115]]; // Gray (default)
    
    return {
      title: page.title,
      description: `By ${page.author} • ${page.description}`,
      bgGradient,
      border: { color: [255, 255, 255], width: 20, side: 'inline-start' },
      padding: 80,
      
      font: {
        title: {
          size: 64,
          weight: 'Bold',
          color: [255, 255, 255],
          lineHeight: 1.2,
          families: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        },
        description: {
          size: 28,
          weight: 'Normal',
          color: [229, 231, 235],
          lineHeight: 1.4,
        },
      },
      
      fonts: [
        'https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf',
        'https://api.fontsource.org/v1/fonts/inter/latin-700-normal.ttf',
      ],
    };
  },
});