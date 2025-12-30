---
title: "About Zero Theme"
slug: "about-theme"
description: "A fast, minimal Astro theme built for Obsidian users"
category: "tech"
date: 2024-12-22
tags: ["astro", "obsidian", "theme"]
---

Zero is an Astro blog theme designed for people who write in Obsidian and want to publish their notes as a blog. It supports all Obsidian markdown features out of the box - wikilinks, callouts, embeds, and more.

## Why Zero?

Most blog themes require you to adapt your writing to fit the theme. Zero does the opposite - it adapts to how you already write in Obsidian.

Write your posts in Obsidian using wikilinks, callouts, and embeds. When you're ready to publish, run `npm run build`. That's it.

## What Makes It Different

**Obsidian-First Design**

Zero treats Obsidian markdown as a first-class citizen, not an afterthought. Your `[[wikilinks]]` work. Your `> [!note]` callouts render beautifully. Your `![[embeds]]` just work.

**Fast and Simple**

Built on Astro 5, Zero generates static HTML that loads instantly. No JavaScript required for reading - just fast, accessible content.

**Minimal Configuration**

Edit one file (`site.config.ts`) and you're done. No complex build process, no extensive setup. Just write and publish.

## Perfect For

Zero works well if you:

- Write in Obsidian and want to publish your notes
- Value speed and simplicity over complex features
- Prefer markdown over CMS interfaces
- Want to own your content in plain text files

## Getting Started

The fastest way to start is cloning the repository and running `npm install`. Open `src/content/` in Obsidian, write some posts, and run `npm run dev` to see your site locally.

Check the [getting started guide](/docs/getting-started) for detailed setup instructions.

## What's Included

Zero comes with four content types: posts for blog articles, docs for documentation and notes, projects for showcasing your work, and pages for static content like about and contact.

Posts support tags, series, and featured images. Docs can be organized in series with table of contents. Projects display as cards with external links to your live work.

All content is written in markdown files that live in `src/content/`. Edit them in Obsidian or any text editor you prefer.

## Customization

The theme uses Tailwind CSS for styling and includes built-in dark mode. Colors, fonts, and layout are controlled through configuration files - no need to dig into component code unless you want to.

For advanced customization, every component is accessible and written in standard Astro syntax. The codebase is organized and documented for easy modification.

## Open Source

Zero is open source under MIT license. The code is on GitHub, and contributions are welcome. If you find bugs or have feature requests, open an issue or submit a pull request.

The theme is inspired by Astro Modular and Astro Micro, both excellent themes in their own right. Zero takes a different approach by focusing specifically on Obsidian integration.

## Try It Out

Clone the repository, install dependencies, and run the dev server. In five minutes you'll have a working blog that understands Obsidian markdown.

If you like writing in Obsidian and want a simple way to publish your notes, Zero might be exactly what you need.
