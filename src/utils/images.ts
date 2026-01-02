
import type { ImageInfo, OpenGraphImage, ResolvedImage } from "@/types";
import { siteConfig } from "@/site.config";
import type { CollectionEntry } from "astro:content";

const imageExt = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

// Remove Obsidian-style brackets from a string
export function stripObsidianBrackets(value: string): string {
  if (value.startsWith("[[") && value.endsWith("]]")) {
    return value.slice(2, -2);
  }
  return value;
}

// All possible *local* images in content
const contentImages = import.meta.glob(
  "/src/content/**/*.{png,jpg,jpeg,webp,avif,gif,svg}",
  { eager: true, import: "default" }
);

export function resolveImage(raw: string | undefined): ResolvedImage | null {
  if (!raw || typeof raw !== "string") return null;

  const cleaned = stripObsidianBrackets(raw);

  // Remote URL
  if (/^https?:\/\//i.test(cleaned)) {
    return { kind: "remote", url: cleaned, source: 'external' };
  }

  // Vault-absolute path, e.g. "posts/post-1/cover.jpg"
  const vaultPath = cleaned.replace(/^\/+/, ""); // drop leading slash if present
  const contentPath = `/src/content/${vaultPath}`;

  // If it's an image and exists under src/content, use Astro optimisation
  if (imageExt.test(vaultPath) && contentPath in contentImages) {
    const image: ImageMetadata = contentImages[contentPath] as ImageMetadata;
    return { kind: "astro", image, source: vaultPath.startsWith('attachments/') ? 'shared' : 'post' };
  }

  // For non-image attachments, or images not in glob:
  // Decide on a public URL scheme. E.g. mirror everything under /attachments/
  // using a sync-attachments script (non-image-focused).

  if (vaultPath.startsWith("attachments/")) {
    // Files mirrored to public/attachments/...
    const publicPath = `/${vaultPath}`; // if you sync src/content/attachments → public/attachments
    return { kind: "static", url: publicPath, source: 'attachments' };
  }

  // Fallback: treat any other vault path as static under same path
  return { kind: "static", url: `/${vaultPath}` };
}

// NEW: Get all images from a specific directory
export function getImagesInDirectory(dirPath: string): ImageMetadata[] {
  const searchPath = `/src/content/${dirPath}`;
  const images: ImageMetadata[] = [];
  
  for (const [path, module] of Object.entries(contentImages)) {
    if (path.startsWith(searchPath)) {
      images.push(module as ImageMetadata);
    }
  }
  
  return images;
}

// NEW: Get cover image using resolveImage
export function resolveCoverImage(imagePath: string | undefined): ResolvedImage | null {
  return resolveImage(imagePath);
}