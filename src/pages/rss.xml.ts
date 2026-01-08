import rss from '@astrojs/rss';
import { siteConfig } from '@/site.config';
import type { APIContext } from 'astro';
import { getAllPosts, sortPostsByDate, } from '@/utils/getContent';
import { getAllGalleries, sortGalleriesByDate } from '@/utils/getGallery';

export async function GET(context: APIContext) {
  // Get all posts
  const allPosts = await getAllPosts();
  const sortedPosts = await sortPostsByDate(allPosts);

  
  // Get galleries (optional)
  const allGalleries = await getAllGalleries();
  const sortedGalleries = await sortGalleriesByDate(allGalleries)
  
  // Combine posts and galleries
  const allItems = [
    ...sortedPosts.map(post => ({
      title: post.data.title,
      description: post.data.description || '',
      pubDate: post.data.date,
      link: `${post.collection}/${post.id}/`,
      author: siteConfig.seoConfig.author,
    })),
    ...sortedGalleries.map(gallery => ({
      title: gallery.data.title,
      description: gallery.data.description || `Photo gallery from ${gallery.data.location || 'travels'}`,
      pubDate: gallery.data.date,
      link: `/galleries/${gallery.id}/`,
      author: siteConfig.seoConfig.author,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
  
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site || siteConfig.siteURL,
    items: allItems,
    customData: `<language>${siteConfig.language || 'en'}</language>`,
    stylesheet: '/rss-styles.xsl', // Optional: style your RSS feed
  });
}