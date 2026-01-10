import rss from '@astrojs/rss';
import { siteConfig } from '@/site.config';
import type { APIContext } from 'astro';
import { getAllPosts, sortPostsByDate, } from '@/utils/getContent';

export async function GET(context: APIContext) {
  // Get all posts
  const allPosts = await getAllPosts();
  const sortedPosts = await sortPostsByDate(allPosts);

  // Combine posts and galleries
  const allItems = [
    ...sortedPosts.map(post => ({
      title: post.data.title,
      description: post.data.description || '',
      pubDate: post.data.date,
      link: `${post.collection}/${post.id}/`,
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