import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  siteURL: "https://ordinary-astro.pages.dev",
  title: "Zero",
  description: "The Obsidian CMS based AstroJS theme",
  author: "John Doe",
  defaultTheme: "light",
  availableThemes: ["light", "dark"],
  scrollToTop: true,
  profilePicture: {
    enabled: false,
    image: "/profile.png",
    alt: "John Doe",
    size: "sm",
    url: undefined,
    placement: "footer",
    style: "none"
  },
  layout: {
    contentWidth: "md",
  },
  navigation: {
    pages: [
      { title: "Posts", url: "/posts/" },
      { title: "Galleries", url: "/galleries/" },
      { title: "Projects", url: "/projects/" },
      { title: "About", url: "/about/" },
      { title: "GitHub", url: "https://github.com/ak0r" },
    ],
    social: [
      {
        title: "X",
        url: "https://x.com/trekography",
        icon: "brand-x",
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
        { title: "Posts", url: "/posts", icon: "pencil" },
        { title: "Projects", url: "/projects", icon: "briefcase" },
        { title: "Gallery", url: "/gallery", icon: "library-photo" },
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
    content: "© {author}. Built with the Zero theme.",
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
      { label: 'All', href: '/posts', icon: 'layout-grid' },
      { label: 'Travel', href: '/posts/travel', icon: 'plane' },
      { label: 'Tech', href: '/posts/tech', icon: 'code' },
      { label: 'Galleries', href: '/galleries', icon: 'library-photo' },
    ],
    abouutPageFilters: undefined
  }
}