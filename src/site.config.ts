import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  siteURL: "https://ordinary-astro.pages.dev",
  title: "Ordinary",
  description: "The Obsidian CMS based AstroJS theme",
  author: "John Doe",
  defaultTheme: "light",
  availableThemes: ["light", "dark"],
  scrollToTop: false,
  profilePicture: {
    enabled: false,
    image: "",
    alt: "",
    size: "sm",
    url: undefined,
    placement: "footer",
    style: "none"
  },
  layout: {
    contentWidth: "lg",
  },
  navigation: {
    pages: [
      { title: "Posts", url: "/posts/" },
      { title: "Projects", url: "/projects/" },
      { title: "Docs", url: "/docs/" },
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
    enabled: false,
    search: {
      enabled: false,
      placeholder: "",
      enabledCollections: []
    },
    quickActions: {
      enabled: false,
      actions: []
    },
    navigation: {
      enabled: false,
      links: []
    },
    social: {
      enabled: false
    }
  },
  tableOfContents: {
    enabled: false,
    depth: 0
  },
  footer: {
    enabled: false,
    content: "",
    showSocialIconsInFooter: false
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
  }
}