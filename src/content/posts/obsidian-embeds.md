---
title: "Obsidian Embeds Guide"
description: "Embedding images, videos, audio, PDFs, and web content"
date: 2024-12-22
tags: ["obsidian", "embeds", "media"]
---

Zero supports all Obsidian embed types - images, audio, video, PDFs, and web embeds. Use the same syntax you use in Obsidian.

## Image Embeds

Basic image embed:

![[my-image.png]]

Image with alt text:

![[my-image.png|Alt text description]]

Image with custom size (size number is ignored, use CSS instead):

![[my-image.png|500]]

## Image Grids

Place multiple images in sequence to create an automatic grid:

![[image1.png]]
![[image2.png]]
![[image3.png]]

The theme detects consecutive images and displays them in a responsive grid. Works with 2-6 images.

## Audio Files

Embed audio files with the same syntax:

![[attachments/sound.wav|sound.wav]]

Supported formats: MP3, WAV, OGG, M4A, FLAC, AAC.

The theme renders a standard browser audio player with controls.

## Video Files

Embed video files:

![[posts/attachments/video.mp4|Eye drop video]]

Supported formats: MP4, WebM, OGV, MOV, MKV, AVI.

Videos render with standard browser controls and are responsive.

## PDF Files

Embed PDF documents:

![[attachments/document.pdf|document.pdf]]

PDFs render in an iframe with a download link. You can link to specific pages:

`![[attachments/document.pdf#page=3]]`

## YouTube Videos

Embed YouTube videos with the image embed syntax:

![Astro Suite for Obsidian](https://www.youtube.com/watch?v=ZhizarvwLnU)


Videos render as responsive embeds with YouTube's player.

## Twitter Posts

Embed tweets:

![Why doesn't everyone use Astro? Writing blog posts in markdown is beautiful.](https://x.com/davidvkimball/status/1933196479801536736)

Tweets render with Twitter's embed script.

## File Organization

For folder-based posts, place media files in the post's folder:

```
posts/
  my-post/
    index.md
    image.png
    video.mp4
```

For single-file posts, use the `attachments/` folder:

```
posts/
  my-post.md
  attachments/
    image.png
    video.mp4
```

Both approaches work. Choose what fits your workflow.

## Image Optimization

The theme automatically converts JPG and PNG images to WebP format during build. This happens transparently - keep using your original image files.

For best results, use reasonably sized images (under 2MB). The build process doesn't resize images, so large files stay large.

## Captions

Add captions using the title attribute in markdown:

![Image description](/image.png "This is the caption")

Or use Obsidian's alt text syntax:

![[image.png|This becomes the caption]]

## Troubleshooting

If embeds don't show, check these:

Images must be in `posts/` folder or `posts/attachments/` folder. External URLs need `https://` prefix. File extensions must match exactly (case-sensitive on some systems). Special characters in filenames might cause issues.

For YouTube embeds, use the full URL, not just the video ID. For Twitter embeds, use the full status URL.

## Performance

Embedded media loads lazily - images and videos only load when scrolled into view. This keeps initial page loads fast even with many embeds.

PDFs load in an iframe, which can be slow for large documents. Consider linking to PDFs instead of embedding them if they're over 5MB.

## Bases Integration

If you use the Bases CMS plugin in Obsidian, embed Bases tables:

![[mybase.base]]

Tables render as formatted HTML tables in your posts. See the Bases documentation for configuration options.
