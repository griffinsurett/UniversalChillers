// src/utils/FetchMeta.ts
import { metaSchema } from "@/content/config";

/**
 * Eagerly import all possible meta files so Vite includes them in the build
 */
const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.mdx",
  { eager: true }
);
const mdModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../content/**/_meta.md",
  { eager: true }
);
const jsonModules = import.meta.glob<{ default?: Record<string, any> }>(
  "../content/**/_meta.json",
  { eager: true }
);

/**
 * Returns the parsed meta frontmatter for the given collection.
 * Falls back to an empty object if no meta file is found.
 */
export function getCollectionMeta(collectionName: string) {
  // Build file keys
  const mdxKey = `../content/${collectionName}/_meta.mdx`;
  const mdKey = `../content/${collectionName}/_meta.md`;
  const jsonKey = `../content/${collectionName}/_meta.json`;

  let data: Record<string, any> = {};

  if (mdxModules[mdxKey]) {
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  } else if (mdModules[mdKey]) {
    data = (mdModules[mdKey] as any).frontmatter ?? {};
  } else if (jsonModules[jsonKey]) {
    data = (jsonModules[jsonKey] as any).default ?? {};
  }

  return metaSchema.parse(data);
}
