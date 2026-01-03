import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { siteConfig } from '@/site.config';

const galleries = await getCollection('gallery', ({ data }) => !data.draft);

const pages = Object.fromEntries(
  galleries.map((gallery) => {
    const slug = gallery.id.replace(/\.(md|mdx)$/, '');
    return [
      slug,
      {
        title: gallery.data.title,
        description: gallery.data.location ? `📍 ${gallery.data.location}` : '',
        author: siteConfig.author,
        date: gallery.data.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        }),
      },
    ];
  })
);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'slug',
  pages,
  
  getImageOptions: (_path, page) => {
    return {
      title: page.title,
      description: page.description,
      bgGradient: [[251, 115, 22], [234, 88, 12]], // Orange for galleries
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
    };
  },
});