import { getCollection } from 'astro:content'
import type { Page } from "@/types";

// Pages collection functions

/** Return all posts filtered by drafts depending on env */
export async function getAllPages(): Promise<Page[]> {
  return await getCollection("pages", ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });
}