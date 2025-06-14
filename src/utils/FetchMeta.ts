// src/utils/FetchMeta.ts
import { metaSchema } from "@/content/config";

/**
 * Eagerly import all _meta files so we can read their frontmatter.
 * Note: these globs are relative to your project root.
 */
const mdxModules = import.meta.glob("src/content/**/_meta.mdx", { eager: true });
const mdModules = import.meta.glob("src/content/**/_meta.md", { eager: true });
const jsonModules = import.meta.glob("src/content/**/_meta.json", { eager: true });

/**
 * Returns the parsed meta frontmatter for the given collection.
 * Falls back to an empty object if no meta file is found.
 */
export function getCollectionMeta(collectionName: string) {
  // Build the exact keys we expect in each of our three globs
  const mdxKey = `src/content/${collectionName}/_meta.mdx`;
  const mdKey = `src/content/${collectionName}/_meta.md`;
  const jsonKey = `src/content/${collectionName}/_meta.json`;

  let data: Record<string, any> = {};

  if (mdxModules[mdxKey]) {
    // MDX frontmatter lives under `.frontmatter`
    data = (mdxModules[mdxKey] as any).frontmatter ?? {};
  } else if (mdModules[mdKey]) {
    data = (mdModules[mdKey] as any).frontmatter ?? {};
  } else if (jsonModules[jsonKey]) {
    // plain JSON meta
    data = (jsonModules[jsonKey] as any).default ?? {};
  }

  // Validate + fill defaults with our Zod schema
  return metaSchema.parse(data);
}
