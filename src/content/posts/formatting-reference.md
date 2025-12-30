---
title: "Formatting Reference"
description: "All the markdown features supported in Zero theme"
date: 2024-12-22
tags: ["markdown", "formatting", "guide"]
---

Zero supports standard markdown plus all Obsidian-specific features. This post demonstrates what works and how to use it.

## Headings

Use `#` for headings. Level 1 headings are reserved for post titles, so start your content with level 2 (`##`).

### This is Heading 3
#### This is Heading 4
##### This is Heading 5
###### This is Heading 6

## Text Formatting

**Bold text** with `**double asterisks**` or `__double underscores__`.

*Italic text* with `*single asterisks*` or `_single underscores_`.

==Highlighted text== with `==double equals==`.

~~Strikethrough~~ with `~~double tildes~~`.

Inline `code` with single backticks.

## Links

Standard markdown links: [Zero Theme](/)

Wikilinks to posts: [[about-theme]]

External links: [Obsidian](https://obsidian.md)

## Lists

Unordered lists with dashes or asterisks:

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered lists with numbers:

1. First step
2. Second step
3. Third step

Task lists with brackets:

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Quotes

Block quotes with `>`:

> This is a block quote.
> It can span multiple lines.

## Code Blocks

Inline code with single backticks, code blocks with triple backticks and language name:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

```python
def greet(name):
    return f"Hello, {name}!"
```

## Tables

Tables with pipes and dashes:

| Feature | Supported | Notes |
|---------|-----------|-------|
| Wikilinks | Yes | Full support |
| Callouts | Yes | All types |
| Embeds | Yes | Images, videos, PDFs |

## Images

Standard markdown images:

![Alt text](/image.png)

Images with captions (use title attribute):

![Alt text](/image.png "This is a caption")

Obsidian image embeds:

![[image.png]]

## Horizontal Rules

Three or more dashes, asterisks, or underscores:

---

## Callouts

Obsidian callouts with `> [!type]`:

> [!note]
> This is a note callout.

> [!tip]
> This is a tip callout.

> [!warning]
> This is a warning callout.

> [!important]
> This is an important callout.

Supported types: note, tip, important, warning, caution, info, success, question, failure, bug, example, quote.

## Footnotes

Add footnotes with `[^1]` and define them anywhere:

Here's a sentence with a footnote[^1].

[^1]: This is the footnote text.

## Keyboard Keys

Not supported natively, but you can use HTML:

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

## Math (Optional)

If you enable math in configuration:

Inline math: $E = mc^2$

Block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## What's Not Supported

Obsidian canvas files don't render (they're canvas-specific). Complex Dataview queries won't work (they require Obsidian's engine). Custom CSS snippets need to be converted to Tailwind classes.

Everything else - the core Obsidian markdown features you use daily - works as expected.

## Testing Your Content

The best way to test is writing in Obsidian and previewing in the browser. Run `npm run dev` and edit your files in Obsidian. Changes appear immediately in your browser.

If something doesn't render correctly, check the console for errors or open an issue on GitHub with an example.
