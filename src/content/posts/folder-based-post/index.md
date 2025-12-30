---
title: "Folder-Based Posts"
description: "Organize posts with folders for cleaner content structure"
date: 2024-12-22
tags: ["organization", "workflow", "obsidian"]
---

Zero supports two ways to organize posts: single markdown files or folders with an index file. Folders work better when you have images, attachments, or want to keep related files together.

## Single-File Posts

The simple approach - one markdown file per post:

```
posts/
  my-first-post.md
  another-post.md
  attachments/
    image1.png
    image2.png
```

Images go in the shared `attachments/` folder. Reference them in your posts:

```markdown
![[image1.png]]
```

This works fine for most blogs and keeps things simple.

## Folder-Based Posts

The organized approach - each post gets its own folder:

```
posts/
  my-first-post/
    index.md
    hero-image.png
    diagram.png
  another-post/
    index.md
    cover.jpg
    screenshot.png
```

Each post's folder contains its markdown file (named `index.md`) and all its images and attachments.

## Why Use Folders

Folders make sense when you have posts with multiple images or attachments. Everything related to that post stays together in one folder.

In Obsidian, folders let you see all post assets in the file explorer. You can drag images directly into the folder without worrying about naming conflicts.

For collaborative work, folders make it easier to hand off content. Someone can zip a folder and send it to you with everything included.

## Setting Up Folder Posts

Create a new folder in `posts/` with your post's name. Inside that folder, create `index.md` for your content. Add any images or files to the same folder.

In your markdown, reference files by name:

```markdown
![[hero-image.png]]
![[diagram.png]]
```

No need to specify paths - the theme finds files in the post's folder automatically.

## Mixing Both Styles

You can use both approaches in the same blog. Some posts as single files, others as folders. The theme handles both correctly.

This flexibility is useful during migration or when different authors prefer different workflows.

## URLs and Routing

Both approaches generate the same URLs. A single file `my-post.md` and a folder `my-post/index.md` both create `/posts/my-post` in your published site.

Your readers never see the difference. Choose based on what works for your workflow.

## Image Paths

**Single-file posts:** Images from `attachments/` folder
```markdown
![[attachments/image.png]]
or
![[image.png]]  (theme finds it in attachments/)
```

**Folder posts:** Images from post folder
```markdown
![[image.png]]  (theme finds it in post folder)
```

The theme is smart about finding images. You don't need to worry about absolute paths.

## Moving Between Styles

Converting from single files to folders is straightforward. Create a folder with your post's name, move the markdown file into it, rename it to `index.md`, move any images from `attachments/` to the post folder.

Going from folders back to single files is the reverse: rename `index.md` to the post name, move it up one level, move images to `attachments/`.

## Best Practices

Use single files for text-heavy posts with few or no images. Use folders for posts with multiple images, videos, or downloadable files.

Don't mix images in post folders and the attachments folder for the same post. Pick one location and stick with it per post.

Name your folders with lowercase and hyphens, matching how you want the URL to look. The folder name becomes the URL slug.

## Obsidian Integration

In Obsidian, both styles work well. Single files show up as flat list in file explorer. Folders group related content together.

Obsidian's drag-and-drop for images works with both. For single-file posts, images go to `attachments/`. For folder posts, images go to the post's folder.

## Performance

Folder structure doesn't affect build time or site performance. The theme processes both the same way during build.

For your vault, folders can make Obsidian slightly slower if you have hundreds of posts, but the difference is minimal with modern computers.

## Which Should You Use

Start with single files. They're simpler and work for most blogs.

Switch to folders when you notice posts with many attachments cluttering your `attachments/` folder, or when you want better organization for complex posts.

There's no right answer - use what works for your writing process.
