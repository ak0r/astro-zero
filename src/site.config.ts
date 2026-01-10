import type { SEOConfig, SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  siteURL: import.meta.env.SITE || "https://amitkul.in",
  title: "Amit K",
  description: "Building systems by day, exploring streets around the world whenever possible.Sharing tech articles, travel guides, and photo galleries.",
  author: "Amit K",
  defaultTheme: "light",
  availableThemes: ["light", "dark"],
  scrollToTop: true,
  layout: {
    contentWidth: "md",
  },

   // Branding (visual identity)
  branding: {
    logoText: "Amit K",
    logoImage: "", // Optional: path to logo image if you want to use one
    tagline: "Tech, Travel & Everything In Between",
    avatar: {
      enabled: false,
      image: "/profile.jpg",
      placement: "header" as const, // or "header"
    },
  },

  seoConfig: {
    // Homepage
    // homeTitle: "Amit K | Tech, Travel & Everything In Between",
    // homeDescription: "Building systems by day, exploring streets around the world whenever possible. Technical experiments, travel stories, and photography from both worlds. Tech articles, travel guides, and photo galleries.",
    
    // Title configuration
    titleTemplate: "%s | Amit K",
    titleSeparator: " | ",
    
    // Default meta
    defaultOgImageAlt: "Amit K - Tech, Travel & Everything In Between",
    author: "Amit K",
    
    // Keywords for SEO
    keywords: [
      'Indian tech blogger',
      'Indian travel blogger',
      'software engineering',
      'workflow automation',
      'travel photography',
      'system architecture',
      'tech blog',
      'travel blog',
      'solution architect',
      'Pune',
      'India travel',
      'systems architecture',
      'business process management',
    ],
    
    // Social media
    twitter: {
      site: '@trekography',
      creator: '@trekography',
    },
    
    // Section-specific SEO
    sections: {
      posts: {
        title: 'Posts',
        description: 'Technical articles on workflow automation, system architecture, and software development. Plus travel guides and photography tips from around the world.',
      },
      galleries: {
        title: 'Galleries',
        description: 'Travel photography collections from India, and cities around the world. Urban exploration, street photography, and landscape shots.',
      },
      about: {
        title: 'About',
        description: 'Systems. Streets. Stories. Solution architect from Pune documenting technical experiments and travel adventures.',
      },
      tags: {
        title: 'Tags',
        description: 'Browse content by topic - technical articles, travel stories, and photography.',
      },
      now: {
        title: 'Now',
        description: 'What I am working on right now.',
      },
    },
  },
  
  navigation: {
    pages: [
      { title: "Travels", url: "/posts/travel/" },
      { title: "Codes", url: "/posts/tech/" },
      { title: "Photos", url: "/posts/gallery/" },
      { title: "Tags", url: "/tags/" },
      { title: "About", url: "/about/" },
      // { title: "GitHub", url: "https://github.com/ak0r" },
    ],
    social: [
      {
        title: "X",
        url: "https://x.com/trekography",
        icon: "brand-x",
      },
      {
        title: "Instagram",
        url: "https://instagram.com/trekography",
        icon: "brand-instagram",
      },
      {
        title: "GitHub",
        url: "https://github.com/ak0r",
        icon: "brand-github",
      },
    ],
  },
  commandPaletteConfig: {
    enabled: true,
    search: {
      enabled: true,
      placeholder: "Search posts, galleries, projects...",
      enabledCollections: ["posts", "gallery", "pages"]
    },
    quickActions: {
      enabled: true,
      actions: [
        { id: "theme", label: "Toggle theme", icon: "sun" },
        { id: "search", label: "Search content", icon: "search" },
      ]
    },
    navigation: {
      enabled: true,
      links: [
        { title: "Home", url: "/", icon: "home" },
        { title: "Posts", url: "/posts/", icon: "pencil" },
        { title: "Projects", url: "/projects/", icon: "briefcase" },
        { title: "Gallery", url: "/galleries/", icon: "library-photo" },
      ],
    },
    social: {
      enabled: true
    }
  },
  tableOfContents: {
    enabled: false,
    depth: 0
  },
  footer: {
    enabled: true,
    content: `© {author}. Made with 💚 and (too much) 🧉 using <a href="https://github.com/ak0r/astro-zero" target="_blank">Astro Zero</a> theme.`,
    showSocialIconsInFooter: true
  },
  contentDisplay: {
    dateFormat: "long",
    showReadingTime: false,
    showPostIcons: false
  },
  homeOptions: {
    featuredPost: {
      enabled: false
    },
    recentPosts: {
      enabled: false,
      count: 0
    },
    projects: {
      enabled: false,
      count: 0
    },
    docs: {
      enabled: false,
      count: 0
    }
  },
  postOptions: {
    groupPostsByYear: false,
    readingTime: false,
    wordCount: false,
    tags: false,
    linkedMentions: false
  },
  galleryOptions: {
    gridColumns: {
      desktop: 0,
      mobile: 0
    },
    aspectRatio: "square",
    showLocation: false,
    showDate: false,
    lightbox: false
  },
  features: {
    galleries: false,
    featuredPosts: false,
    tags: false,
    rss: false,
    analytics: false
  },
  
  pageFilters: {
    indexPageFilters: [
      { label: 'All', href: '/posts/', icon: 'layout-grid' },
      { label: 'Travel', href: '/posts/travel/', icon: 'plane' },
      { label: 'Tech', href: '/posts/tech/', icon: 'code' },
      { label: 'Galleries', href: '/posts/gallery/', icon: 'library-photo' },
    ],
    aboutPageFilters: undefined
  },
  categories: {
    travel: {
      title: 'Travels',
      description: 'Travel stories from around the world. From bustling cities to quiet temples.',
      icon: 'map-pin',
      color: '#3b82f6', // blue
      view: 'list' as const,
      showInNav: true,
    },
    tech: {
      title: 'Codes',
      description: 'Technical articles, coding insights and my journey in software development and system architecture.',
      icon: 'code',
      color: '#8b5cf6', // purple
      view: 'list' as const,
      showInNav: true,
    },
    gallery: {
      title: 'Photos',
      description: 'Photography collections from travels and urban exploration. Visual stories from the streets.',
      icon: 'camera',
      color: '#f59e0b', // amber
      view: 'grid' as const,
      showInNav: true,
    },
  },
}

export const POST_CATEGORIES = Object.keys(siteConfig.categories) as Array<keyof typeof siteConfig.categories>;
export type PostCategory = typeof POST_CATEGORIES[number];